const https = require('https');

const options = {
    protocol: 'https:',
    host: 'api.cognitive.microsoft.com',
    path: '/sts/v1.0/issueToken',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/jwt',
        'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANLATOR_KEY
    }
};

var optionsTrans = {
    protocol: 'https:',
    host: 'api.cognitive.microsofttranslator.com',
    path: '/translate?api-version=3.0',
    method: 'POST'
};

module.exports.translator = translator;


async function translator(groupId, name, text, analyzer) {

    const req = https.request(options, (res) => {
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
            analyzer(new String(groupId), new String(name), new String(translatorJapanToEnglish(chunk, text)));
        });
    })

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.end();

}

function translatorJapanToEnglish(token, text) {
    let postDataStr = JSON.stringify([{ 'Text': text }]);
    const key = 'Bearer ' + token;
    let headers = {
        'api-version': 3.0,
        'to': 'to=en',
        'Content-Type': 'application/json',
        'Authorization': key
    };
    optionsTrans['headers'] = headers;

    const req = https.request(optionsTrans, (res) => {
        res.on('data', (chunk) => {
            console.log(`[translatorJapanToEnglish][source]: ` + postDataStr);
            console.log(`[translatorJapanToEnglish]: ${chunk}`);

        });
    })

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    req.write(postDataStr);
    req.end();



}