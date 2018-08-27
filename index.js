// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート

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

function addUserArray(groupId, userId) {
    console.log("addUserArray: " + groupId + " : " + userId);
    if (groupId && userId) {
        bot.getProfile(userId)
            .then((profile) => {

                console.log("Add user: " + userArray.groupId.userId + " : " + displayName);
                userArray.groupId.userId = displayName;
            });
    }
}

// TODO: ユーザーチェック関数
function checkUserId(groupId, userId) {
    let ret = false;

    if (groupId && userId) {
        if (userArray.groupId && userArray.groupId.userId) {
            ret = true;
        }
    }

    return ret;
}

// TODO: ユーザーId取得
function checkUserName(groupId, userName) {

    if (groupId && userName) {
        if (userArray.groupId) {
            for (let id of userArray.groupId) {
                if (userArray.groupId.id === userName) {
                    return id;
                }
            }
        }

    }
    return "";
}
// TODO: スタンプ送信
function sendStamp(userId) {
    bot.pushMessage(userId, {
        type: "sticker",
        packageId: event.message.packageId,
        stickerId: event.message.stickerId
    });
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

                console.log(event.source.groupId);
                console.log(event.source.userId);

                // groupリストにユーザーを登録
                addUserArray(event.source.groupId, event.source.userId, event.source.displayName);

                // ユーザーが一致したら、グループから削除
                if (checkUserId(event.source.groupId, event.source.userId)) {
                    let timeout_id = groupArray.groupId.userId;
                    if (timeout_id) {
                        clearTimeout(timeout_id);
                        delete groupArray.groupId.userId;
                    }
                }

                // ユーザーからのテキストメッセージが「@ユーザー名」だった場合のみ反応。
                let result = event.message.text.match(/@(.+)/);
                if (result && 0 < result.length) {

                    console.log(result)

                    // 返信がない場合に向けに、タイマーを設定
                    let userId = checkUserName(event.source.groupId, result[1]);
                    if (userId !== "") {
                        let timeout_id = setTimeout(sendStamp(userId), TIMEOUT);
                        groupArray.groupId.userId = timeout_id;
                    }

                    // replyMessage()で返信し、そのプロミスをevents_processedに追加。
                    events_processed.push(bot.replyMessage(event.replyToken, {
                        type: "text",
                        // text: result[1]
                        text: "コメント谷尾"
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
