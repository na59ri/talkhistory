// クラス取得
var LanguageTranslatorV3 = require('watson-developer-cloud/language-translator/v3');

var languageTranslator = new LanguageTranslatorV3({
    version: '2018-05-01',
    iam_apikey: process.env.TRANSLAOTR_API_KEY,
    url: 'https://gateway.watsonplatform.net/language-translator/api'
});

module.exports.translator = translator;


async function translator(groupId, name, text, analyzer) {

    let parameters = {
        text: text,
        model_id: 'ja-en'
    };

    languageTranslator.translate(
        parameters,
        function (error, response) {
            if (error) {
                console.log(error)
            }
            else {
                let returnVal = response.translations[0].translation;
                console.log(typeof (returnVal) + " : " + response.translations[0].translation);
                if (response.translations) {
                    analyzer(new String(groupId), new String(name), new String(response.translations[0].translation));
                }
            }
        }
    );

}