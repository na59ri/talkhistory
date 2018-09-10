// -----------------------------------------------------------------------------
// kintone sdk
const kintone = require('kintone-nodejs-sdk');

// -----------------------------------------------------------------------------
// パラメータ設定
var appId = 1;
var FQDN = 'devphtpgt.cybozu.com';

// -----------------------------------------------------------------------------
// 外部参照
module.exports.getRecord = getRecord;
module.exports.getRecords = getRecords;
module.exports.addRecord = addRecord;
module.exports.updateRecord = updateRecord;
module.exports.deleteRecord = deleteRecord;

// -----------------------------------------------------------------------------
// kintone の初期化
var kintoneAuthWithAPIToken = (new kintone.Auth()).setApiToken(process.env.KINTONE_API_TOKEN);
var kintoneConnection = new kintone.Connection(FQDN, kintoneAuthWithAPIToken);
var kintoneRecord = new kintone.Record(kintoneConnection);


// -----------------------------------------------------------------------------
// Get kintone recode
function getRecord(id, successFunction, failFunction) {

    console.log("[getRecord] : start");

    kintoneRecord.getRecord(appId, id)
        .then((rsp) => {
            console.log("[getRecord] : " + JSON.stringify(rsp));
            successFunction(rsp);
        })
        .catch((err) => {
            // This SDK return err with KintoneAPIExeption
            console.log("[addRecord] : error");
            failFunction();
        });
}

// -----------------------------------------------------------------------------
// Get kintone recode
function getRecords(query, fields, totalCount, successFunction, failFunction) {

    console.log("[getRecords] : start");

    kintoneRecord.getRecords(appId, query, fields, totalCount)
        .then((rsp) => {
            console.log("[getRecords] : " + JSON.stringify(rsp));
            successFunction(rsp);
        })
        .catch((err) => {
            // This SDK return err with KintoneAPIExeption
            console.log("[addRecords] : error");
            failFunction();
        });
}


// -----------------------------------------------------------------------------
// Add kintone recode
function addRecord(recordJson, successFunction, failFunction) {

    console.log("[addRecord] : start");

    kintoneRecord.addRecord(appId, recordJson)
        .then((rsp) => {
            console.log("[addRecord] : " + JSON.stringify(rsp));
            successFunction(rsp);
        })
        .catch((err) => {
            console.log("[addRecord] : error");
            failFunction();
        });
}

// -----------------------------------------------------------------------------
// Update kintone recode
function updateRecord(id, recordJson, revision, successFunction, failFunction) {

    console.log("[updateRecord] : start");

    kintoneRecord.updateRecordById(appId, id, recordJson, revision)
        .then((rsp) => {
            console.log("[updateRecord] : " + JSON.stringify(rsp));
            successFunction(rsp);
        })
        .catch((err) => {
            console.log("[addRecord] : error");
            failFunction();
        });
}

// -----------------------------------------------------------------------------
// Delete kintone recode
function deleteRecord(ids, successFunction, failFunction) {

    console.log("[deleteRecord] : start");

    kintoneRecord.deleteRecords(appId, ids)
        .then((rsp) => {
            console.log("[deleteRecord] : " + JSON.stringify(rsp));
            successFunction(rsp);
        })
        .catch((err) => {
            console.log("[addRecord] : error");
            failFunction();
        });
}

