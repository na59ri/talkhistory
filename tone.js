var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const querystring = require("querystring");
const kintone = require("./kintone");

var toneAnalyzer = new ToneAnalyzerV3({
    version: '2017-09-21',
    username: process.env.TONE_USERNAME,
    password: process.env.TONE_PASSWORD,
    url: 'https://gateway.watsonplatform.net/tone-analyzer/api'
});

module.exports.analyzer = analyzer;

// groupId と name を使って kintone から情報を取得
function getNameRecord(groupId, name, successFunc, failFunc) {

    console.log("[tone][getIdRecord] GroupID:" + groupId + ", name: " + name);

    let query = "groupId = \"" + groupId + "\" and name = \"" + name + "\"";
    kintone.getRecord(query, [], false, successFunc, failFunc);
}

// recordId に対して、 name を更新
function updateTone(id, tone) {

    kintone.updateRecord(id, { "tone": { "value": tone } },
        function (data) { console.log("[updateTone][updateRecord] success"); },
        function (data) { console.log("[updateTone][updateRecord] error"); }
    );
}


function analyzer(groupId, name, text) {


    console.log("tone start:" + text);

    let toneParams = {
        'tone_input': { 'text': text },
        'content_type': 'application/json'
    };

    console.log("[analyzer] groupId: " + groupId + ", name:" + name);
    getNameRecord(groupId, name, function (data) {
        console.log("[analyzer][getNameRecord] success : " + JSON.stringify(data));
        if (data.record) {
            let id = new String(data.records[i].record_id.value);

            toneAnalyzer.tone(toneParams, function (error, toneAnalysis) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(JSON.stringify(toneAnalysis, null, 2));
                    if (toneAnalysis.document_tone) {
                        updateTone(id, new String(toneAnalysis.document_tone.tones[0].tone_id));
                    }
                }
            });
        }
    },
        function (data) { console.log("[analyzer][getNameRecord] fail"); });
}