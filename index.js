// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート
// const translator = require("./translator");
const translator = require("./translator-azure");
const tone = require("./tone");
const kintone = require("./kintone");

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// 返信までの時間(10 sec)
const TIMEOUT = 5 * 60 * 1000;

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);

// -----------------------------------------------------------------------------
// 返信パターン
const replyArray = {
    "anger": "最速返信だ！急げ！",
    "fear": "スルーは善くないぞ！すぐに返信するんだ！",
    "joy": "へ～んしん(返信)！",
    "sadness": "愛する者を泣かせてはダメだ！すぐに返信しよう！",
    "analytical": "仕方ない、あと５分だけ待とう",
    "confident": "君なら出来る！さぁ返信だ！",
    "tentative": "みんなが君の返信を待っている！さぁ返信しよう！"
}


// groupId と userId を使って kintone から情報を取得
function getIdRecord(groupId, userId, successFunc, failFunc) {

    console.log("[getIdRecord] GroupID:" + groupId + ", userId: " + userId);

    let query = "groupId = \"" + groupId + "\" and userId = \"" + userId + "\"";
    kintone.getRecords(query, ["$id", "tone", "timerId"], true, successFunc, failFunc);

}

// groupId と name を使って kintone から情報を取得
function getNameRecord(groupId, name, successFunc, failFunc) {

    console.log("[getIdRecord] GroupID:" + groupId + ", name: " + name);

    let query = "groupId = \"" + groupId + "\" and name = \"" + name + "\"";
    kintone.getRecords(query, ["$id", "tone", "timerId"], true, successFunc, failFunc);
}

// GroupId, UserId, name を kintone に保存
function addUser(groupId, userId, name) {

    console.log("[addUser] userId:" + userId + ", name:" + name);

    kintone.addRecord(
        { "groupId": { "value": groupId }, "userId": { "value": userId }, "name": { "value": name } },
        function (data) { console.log("[addUser][sendRecord] success"); },
        function (data) { console.log("[addUser][sendRecord] fail"); });
}

// recordId に対して、 name を更新
function addUserName(id, name) {

    console.log("[addUserName] id:" + id + ", name:" + name);

    kintone.updateRecord(Number(id), { "name": { "value": name } }, 0,
        function (data) { console.log("[addUserName][sendRecord] success"); },
        function (data) { console.log("[addUserName][sendRecord] fail"); });
}

// GroupId, UserId, displayName を kintone に保存
function addUserArray(groupId, userId) {
    console.log("[addUserArray]: " + groupId + " : " + userId);
    if (groupId && userId) {
        bot.getProfile(userId)
            .then((profile) => {

                let sGroupId = String(groupId);
                let sUserId = String(userId);
                let sDisplayName = String(profile.displayName);

                getIdRecord(sGroupId, sUserId, function (data) {
                    console.log("[addUserArray][getIdRecord] success");
                    if (data.totalCount != 0) {
                        for (let i in data.records) {
                            let id = String(data.records[i].$id.value);
                            addUserName(id, sDisplayName);
                        }
                    } else {
                        addUser(sGroupId, sUserId, sDisplayName);
                    }
                }, function (data) {
                    // console.log("[addUserArray][getIdRecord] fail");
                    // addUser(sGroupId, sUserId, sDisplayName);
                });
            });
    }
}

// UserのtimerId/toneを削除する
function deleteTimerSuccess(data) {
    for (let i in data.records) {
        let id = String(data.records[i].$id.value);

        kintone.updateRecord(Number(id), { "timerId": { "value": "" }, "tone": { "value": "" } }, 0,
            function (data) { console.log("[deleteTimerSuccess][sendRecord] success"); },
            function (data) { console.log("[deleteTimerSuccess][sendRecord] error"); }
        );
    }
}


function deleteUser(groupId, name) {
    getIdRecord(groupId, name, deleteTimerSuccess, function (data) { });
}

function updateTimerId(id, timerId) {

    kintone.updateRecord(Number(id), { "timerId": { "value": String(timerId) } }, 0,
        function (data) { console.log("[updateTimerId][sendRecord] success"); },
        function (data) { console.log("[updateTimerId][sendRecord] error"); });
}


// スタンプ
function toneTypeReply(tone) {
    let text = "気づいているか？さぁ返信だ！";
    if (replyArray[tone]) {
        return replyArray[tone];
    }

    return text;
}

// TODO: スタンプ送信
function sendStamp(recordId) {
    let id = Number(recordId);
    console.log("[sendStamp]:" + recordId);
    kintone.getRecord(id, function (data) {
        console.log("[sendStamp] success:" + JSON.stringify(data));

        if (data.record) {
            if (data.record.timerId.value != "") {
                bot.pushMessage(String(data.record.userId.value), {
                    type: "text",
                    text: toneTypeReply(String(data.record.tone.value))
                });
                updateTimerId(id, setTimeout(function () {
                    sendStamp(recordId);
                }, TIMEOUT));
            }
        }
    }, function () { console.log("[sendStamp] fail"); });
}

function updateUserSuccess(data) {
    for (let i in data.records) {
        let id = Number(data.records[i].$id.value);
        let timerId = Number(data.records[i].timerId.value);
        console.log("[updateUserSuccess] : " + id + " : " + timerId);

        if (timerId == 0) {
            let newTimerId = setTimeout(function () {
                sendStamp(id);
            }, TIMEOUT);
            console.log("[updateUserSuccess] update: " + newTimerId);
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
                        text: "催促マン、出撃！とぅ！！！"
                    }));
                }
            }
        } else if (event.type == "message" && event.message.type == "image") {
            let groupId = String(event.source.groupId);
            let userId = String(event.source.userId);

            // groupリストにユーザーを登録
            addUserArray(groupId, userId);

            // ユーザーが一致したら、グループから削除
            deleteUser(groupId, userId);
        } else if (event.type == "message" && event.message.type == "sticker") {
            let groupId = String(event.source.groupId);
            let userId = String(event.source.userId);

            // groupリストにユーザーを登録
            addUserArray(groupId, userId);

            // ユーザーが一致したら、グループから削除
            deleteUser(groupId, userId);
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
