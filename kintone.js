const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var apiToken = process.env.KINTONE_API_TOKEN;
var appId = 1;
var url = 'https://devphtpgt.cybozu.com/k/v1/record.json';

module.exports.sendRecord = sendRecord;
// module.exports.getRecord = getRecord;
// module.exports.setRecord = setRecord;
// module.exports.updateRecord = updateRecord;
// module.exports.deleteRecord = deleteRecord;


// Get XMLHttpRequest instance
function createCORSRequest(method) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // Otherwise, CORS is not supported by the browser.
        xhr = null;
    }
    return xhr;
}

// Send kintone recode
function sendRecord(method, json, successFunction, failFunction) {
    console.log(url + ' : ' + apiToken);
    req = createCORSRequest(method);
    if (!req) {
        throw new Error('CORS not supported');
    }

    req.onload = function () {
        if (req.status === 200) {
            // success
            console.log(JSON.parse(req.responseText));
            successFunction(JSON.parse(req.responseText));
        } else {
            // error
            console.log(JSON.parse(req.responseText));
            failFunction(JSON.parse(req.responseText));
        }
    };

    if (json !== "") {
        json["app"] = appId;
        req.setRequestHeader('Content-Type', 'application/json');
    }

    req.setRequestHeader('X-Cybozu-API-Token', apiToken);
    req.send(json);
}

// Get kintone recode
function getRecord(json, successFunction, failFunction) {
    console.log(url + ' : ' + apiToken);
    req = createCORSRequest('GET');
    if (!req) {
        throw new Error('CORS not supported');
    }

    req.onload = function () {
        if (req.status === 200) {
            // success
            console.log(JSON.parse(req.responseText));
            successFunction(JSON.parse(req.responseText));
        } else {
            // error
            console.log(JSON.parse(req.responseText));
            failFunction(JSON.parse(req.responseText));
        }
    };

    if (json !== "") {
        json["app"] = appId;
        req.setRequestHeader('Content-Type', 'application/json');
    }

    req.setRequestHeader('X-Cybozu-API-Token', apiToken);
    req.send(json);
}

// Get kintone recode
function setRecord(json, successFunction, failFunction) {
    console.log(url + ' : ' + apiToken);
    req = createCORSRequest('POST');
    if (!req) {
        throw new Error('CORS not supported');
    }

    req.onload = function () {
        if (req.status === 200) {
            // success
            console.log(JSON.parse(req.responseText));
            successFunction(JSON.parse(req.responseText));
        } else {
            // error
            console.log(JSON.parse(req.responseText));
            failFunction(JSON.parse(req.responseText));
        }
    };

    if (json !== "") {
        json["app"] = appId;
        req.setRequestHeader('Content-Type', 'application/json');
    }

    req.setRequestHeader('X-Cybozu-API-Token', apiToken);
    req.send(json);
}

// Update kintone recode
function updateRecord(json, successFunction, failFunction) {
    console.log(url + ' : ' + apiToken);
    req = createCORSRequest('PUT');
    if (!req) {
        throw new Error('CORS not supported');
    }

    req.onload = function () {
        if (req.status === 200) {
            // success
            console.log(JSON.parse(req.responseText));
            successFunction(JSON.parse(req.responseText));
        } else {
            // error
            console.log(JSON.parse(req.responseText));
            failFunction(JSON.parse(req.responseText));
        }
    };

    if (json !== "") {
        json["app"] = appId;
        req.setRequestHeader('Content-Type', 'application/json');
    }

    req.setRequestHeader('X-Cybozu-API-Token', apiToken);
    req.send(json);
}

// Delete kintone recode
function deleteRecord(json, successFunction, failFunction) {
    console.log(url + ' : ' + apiToken);
    req = createCORSRequest('DELETE');
    if (!req) {
        throw new Error('CORS not supported');
    }

    req.onload = function () {
        if (req.status === 200) {
            // success
            console.log(JSON.parse(req.responseText));
            successFunction(JSON.parse(req.responseText));
        } else {
            // error
            console.log(JSON.parse(req.responseText));
            failFunction(JSON.parse(req.responseText));
        }
    };

    if (json !== "") {
        json["app"] = appId;
        req.setRequestHeader('Content-Type', 'application/json');
    }

    req.setRequestHeader('X-Cybozu-API-Token', apiToken);
    req.send(json);
}