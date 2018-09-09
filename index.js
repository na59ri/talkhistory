// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート
const translator = require("./translator");
const tone = require("./tone");
const kintone = require("./kintone");

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// 返信までの時間(10 min)
const TIMEOUT = 10 * 1000;

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);


// -----------------------------------------------------------------------------
// ルーター設定
// server.post('/webhook', line.middleware(line_config), (req, res, next) => {
//     res.sendStatus(200);
//     console.log(req.body);
// });

// key : group Id
// value : user Id / time Id array
var groupArray = {};

// key userId 
// value :Display name add
var userArray = {};

// groupId と userId を使って kintone から情報を取得
function getIdRecord(groupId, userId, successFunc, failFunc) {
    console.log("getIdRecord: " + groupId + " : " + userId);

    let query = "groupId = \"" + groupId + "\" and userId = \"" + userId + "\"";
    kintone.sendRecord("GET", {
        "query": query
    }, successFunc, failFunc);
}

// groupId と name を使って kintone から情報を取得
function getNameRecord(groupId, name, successFunc, failFunc) {
    console.log("getNameRecord: " + groupId + " : " + name);

    let query = "groupId = \"" + groupId + "\" and name = \"" + name + "\"";
    kintone.sendRecord("GET", {
        "query": query
    }, successFunc, failFunc);
}

// GroupId, UserId, name を kintone に保存
function addUser(groupId, userId, name) {
    kintone.sendRecord("POST",
        { "record": { "groupId": { "value": groupId }, "userId": { "value": userId }, "name": { "value": name } } },
        function (data) { console.log("[addUser][sendRecord] success"); },
        function (data) { console.log("[addUser][sendRecord] fail"); });
}

// recordId に対して、 name を更新
function addUserName(id, name) {

    kintone.sendRecord("PUT", {
        "ids": [id],
        "record": {
            "name": {
                "value": name
            }
        }
    },
        function (data) { console.log("[addUserName][sendRecord] success"); },
        function (data) { console.log("[addUserName][sendRecord] fail"); });
}

// GroupId, UserId, displayName を kintone に保存
function addUserArray(groupId, userId) {
    console.log("addUserArray: " + groupId + " : " + userId);
    if (groupId && userId) {
        bot.getProfile(userId)
            .then((profile) => {

                let sGroupId = String(groupId);
                let sUserId = String(userId);
                let sDisplayName = String(profile.displayName);

                getIdRecord(sGroupId, sUserId, function (data) {
                    console.log("[addUserArray][getIdRecord] success");
                    if (data.records) {
                        for (let i in data.records) {
                            let id = String(data.records[i].record_id.value);
                            addUserName(id, sDisplayName);
                        }
                    } else {

                    }
                }, function (data) {
                    console.log("[addUserArray][getIdRecord] fail");
                    addUser(sGroupId, sUserId, sDisplayName);
                });
            });
    }
}

// UserのtimerId/toneを削除する
function deleteTimerSuccess(data) {
    for (let i in data.records) {
        let id = String(data.records[i].record_id.value);
        console.log(id + " : " + timerId);
        clearTimeout(timerId);
        kintone.sendRecord("PUT", {
            "ids": [id],
            "record": {
                "timerId": {
                    "value": ""
                },
                "tone": {
                    "value": ""
                }
            }
        },
            function (data) { console.log("[deleteTimerSuccess][sendRecord] success"); },
            function (data) { console.log("[deleteTimerSuccess][sendRecord] error"); }
        );
    }
}


function deleteUser(groupId, name) {
    getIdRecord(groupId, name, deleteTimerSuccess, function (data) { });
}

function updateTimerId(id, timerId) {
    kintone.sendRecord("PUT", {
        "ids": [id],
        "record": {
            "timerId": {
                "value": timerId
            }
        }
    },
        function (data) { console.log("[updateTimerId][sendRecord] success"); },
        function (data) { console.log("[updateTimerId][sendRecord] error"); });
}

// スタンプ
function toneTypeReply(tone) {
    let text = "早く返信ちょうだい！早く早く";
    if (tone === 'anger') {
        text = "はよ、返信しやがれ！";
    } else if (tone === 'fear') {
        text = "早く返信ほしいなあ";
    } else if (tone === 'joy') {
        text = "返信ようよ！";
    } else if (tone === 'sadness') {
        text = "お願いだから、返信して";
    } else if (tone === 'analytical') {
        text = "早く返信ちょうだい！";
    } else if (tone === 'confident') {
        text = "まじで、返信して";
    } else if (tone === 'tentative') {
        text = "えーーーと、返信ほしいなあ";
    }

    return text;
}

// TODO: スタンプ送信
function sendStamp(recordId) {
    console.log("sendStamp:" + recordId);
    sendRecord("GET", { "id": recordId }, function (data) {
        if (data.records) {

            bot.pushMessage(String(data.records[0].userId.value), {
                type: "text",
                text: toneTypeReply(String(data.records[0].tone.value))
            });
            updateTimerId(recordId, setTimeout(sendStamp(recordId), TIMEOUT));
        }
    });
}

function updateUserSuccess(data) {
    for (let i in data.records) {
        let id = String(data.records[i].record_id.value);
        let timerId = String(data.records[i].record_id.value);
        console.log("updateUserSuccess : " + id + " : " + timerId);

        if (!timerId) {
            let newTimerId = setTimeout(sendStamp(id), TIMEOUT);
            console.log("updateUserSuccess update: " + newTimerId);
            updateTimerId(id, newTimerId);

        }
    }
}

function updateUser(groupId, name) {
    getNameRecord(groupId, name, updateUserSuccess,
        function (data) { console.log("[updateUser][getNameRecord] error"); });
}



server.post('/bot/webhook', line.middleware(line_config), (req, res, next) => {
    // 先行してLINE側にステータスコード200でレスポンスする。
    res.sendStatus(200);

    // すべてのイベント処理のプロミスを格納する配列。
    let events_processed = [];

    // イベントオブジェクトを順次処理。
    req.body.events.forEach((event) => {

        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text") {

            if (event.source.type == "group") {

                let groupId = String(event.source.groupId);
                let userId = String(event.source.userId);

                // groupリストにユーザーを登録
                addUserArray(groupId, userId);

                // ユーザーが一致したら、グループから削除
                deleteUser(groupId, userId);

                // ユーザーからのテキストメッセージが「@ユーザー名」だった場合のみ反応。
                let result = event.message.text.match(/@(.+)[ ]*[\n|\r]+(.+)/);
                if (result && 0 < result.length) {
                    console.log(result);
                    translator.translator(groupId, result[1], result[2], tone.analyzer);

                    // 返信がない場合に向けに、タイマーを設定
                    updateUser(groupId, result[1]);

                    // replyMessage()で返信し、そのプロミスをevents_processedに追加。
                    events_processed.push(bot.replyMessage(event.replyToken, {
                        type: "text",
                        // text: result[1]
                        text: "テスト中です、すまそ"
                    }));
                }
            }
        } else if (event.type == "message" && event.message.type == "image") {
            // replyMessage()で返信し、そのプロミスをevents_processedに追加。
            // events_processed.push(bot.replyMessage(event.replyToken, {
            //     type: "text",
            //     text: "まずい、もう１杯"
            // }));
        } else if (event.type == "message" && event.message.type == "sticker") {
            // replyMessage()で返信し、そのプロミスをevents_processedに追加。
            // events_processed.push(bot.replyMessage(event.replyToken, {
            //     type: "sticker",
            //     "packageId": event.message.packageId,
            //     "stickerId": event.message.stickerId
            // }));
            // bot.pushMessage(event.source.userId, {
            //     type: "sticker",
            //     packageId: event.message.packageId,
            //     stickerId: event.message.stickerId
            // });
        }
    });

    // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
});

process.on('unhandledRejection', console.dir);
