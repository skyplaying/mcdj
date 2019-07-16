var constants = require('./constants');
var SESSION_KEY = 'weapp_session_' + constants.WX_SESSION_MAGIC_ID;

var Session = {
    get: function () {
        return my.getStorageSync({ key: SESSION_KEY }).data || null;
    },

    set: function (session) {
        // console.log(SESSION_KEY)
        my.setStorageSync({
            key: SESSION_KEY,
            data: session,
        });
    },

    clear: function () {
        my.removeStorageSync({ key: SESSION_KEY });
    },
};

module.exports = Session;