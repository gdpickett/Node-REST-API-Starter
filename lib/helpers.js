var config = require('./config');
var crypto = require('crypto');
var helpers = {};

helpers.hash = function (str) {
    if (typeof str == "string" && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

helpers.parseJsonToObject = function (str) {
    //console.log('Helpers', str);
    try {
        if (str) {
            var obj = JSON.parse(str);
            //console.log('Helpers ', obj);
            return obj;
        } else {
            return {};
        }
    } catch (e) {
        //console.error(e, 400)
        return { e };
    }
}

helpers.createRandomToken = function (strLength) {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var str = '';

        for (i = 1; i <= strLength; i++) {

            var randomChar = possible.charAt(Math.floor(Math.random() * possible.length));
            str += randomChar;
        }
        return str;
    } else {
        return false;
    }
}

module.exports = helpers;