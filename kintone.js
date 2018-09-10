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
function getRecord(query, fields, totalCount, successFunction, failFunction) {

    console.log("[getRecord] : start");

    kintoneRecord.getRecords(app, query, fields, totalCount)
        .then((rsp) => {
            console.log("[getRecord] : " + rsp);
            successFunction(rsp);
        })
        .catch((err) => {
            // This SDK return err with KintoneAPIExeption
            console.log("[getRecord] : " + err.get());
            failFunction();
        });
}


// -----------------------------------------------------------------------------
// Add kintone recode
function addRecord(recordJson, successFunction, failFunction) {

    console.log("[addRecord] : start");

    kintoneRecord.addRecord(app, recordJson)
        .then((rsp) => {
            console.log("[addRecord] : " + rsp);
            successFunction(rsp);
        })
        .catch((err) => {
            console.log("[addRecord] : " + err.get());
            failFunction();
        });
}

// -----------------------------------------------------------------------------
// Update kintone recode
function updateRecord(id, recordJson, revision, successFunction, failFunction) {

    console.log("[updateRecord] : start");

    kintoneRecord.updateRecordById(app, id, recordJson, revision)
        .then((rsp) => {
            console.log("[updateRecord] : " + rsp);
            successFunction(rsp);
        })
        .catch((err) => {
            console.log("[updateRecord] : " + err.get());
            failFunction();
        });
}

// -----------------------------------------------------------------------------
// Delete kintone recode
function deleteRecord(ids, successFunction, failFunction) {

    console.log("[deleteRecord] : start");

    kintoneRecord.deleteRecords(app, ids)
        .then((rsp) => {
            console.log("[deleteRecord] : " + rsp);
            successFunction(rsp);
        })
        .catch((err) => {
            console.log("[deleteRecord] : " + err.get());
            failFunction();
        });
}

