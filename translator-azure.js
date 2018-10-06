const https = require('https');

const options = {
    protocol: 'https:',
    host: 'api.cognitive.microsoft.com',
    path: '/sts/v1.0',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/jwt',
        'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANLATOR_KEY
    }
};


module.exports.translator = translator;


async function translator(groupId, name, text, analyzer) {

    const req = https.request(options, (res) => {
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    })

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.end();

}