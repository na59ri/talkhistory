var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var toneAnalyzer = new ToneAnalyzerV3({
    version: '2017-09-21',
    username: process.env.TONE_USERNAME,
    password: process.env.TONE_PASSWORD,
    url: 'https://gateway.watsonplatform.net/tone-analyzer/api'
});

module.exports.tone = toneAna;

function toneAna(text) {


    console.log("tone start:" + text);

    let toneParams = {
        'tone_input': { 'text': text },
        'content_type': 'application/json'
    };


    toneAnalyzer.tone(toneParams, function (error, toneAnalysis) {
        if (error) {
            console.log(error);
        } else {
            console.log("tone" + JSON.stringify(toneAnalysis, null, 2));
        }
    });
}