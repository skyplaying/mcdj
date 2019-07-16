var constants = require('./constants');
var utils = require('./utils');
var Session = require('./session');
var loginLib = require('./login');

var noop = function noop() { };

var buildAuthHeader = function buildAuthHeader(session) {
  var header = {};
  if (session && session.accessToken) {
    header[constants.WX_HEADER_TOKEN] = session.accessToken;
  }
  // console.log(header)
  return header;
};

/***
 * @class
 * 表示请求过程中发生的异常
 */
var RequestError = (function () {
  function RequestError(type, message) {
    Error.call(this, message);
    this.type = type;
    this.message = message;
  }

  RequestError.prototype = new Error();
  RequestError.prototype.constructor = RequestError;

  return RequestError;
})();


function promiseLogin(loginType) {
  return new Promise((resolve, reject) => {
    loginLib.login({
      loginType,
      success: () => {
        resolve();
      }, fail: (err) => {
        reject(err);
      }
    });
  });
}

function request(options) {
  let loginPromise = null;
  let a = Promise.resolve();
  if (options.login && !loginPromise) {
    loginPromise = promiseLogin(options.loginType);
  }

  if (options.login) {
    a = loginPromise;
  }

  a.then(() => {
    if (typeof options !== 'object') {
      var message = '请求传参应为 object 类型，但实际传了 ' + (typeof options) + ' 类型';
      throw new RequestError(constants.ERR_INVALID_PARAMS, message);
    }

    var requireLogin = options.login;
    var success = options.success || noop;
    var fail = options.fail || noop;
    var complete = options.complete || noop;
    var originHeader = options.header || {};

    // 成功回调
    var callSuccess = function (args) {
      success.call(options, args);
      // console.log('callSuccess');
      complete.call(options, args);
      // console.log('callSuccess++');
    }; 

    // 失败回调
    var callFail = function (error) {
      fail.call(options, error);
      complete.call(options, error);
    };

    // 是否已经进行过重试
    var hasRetried = false;

    /*
    if (requireLogin) {
        //doRequestWithLogin();
    } else {
        doRequest();
    }*/

    doRequest();

    // 登录后再请求
    function doRequestWithLogin() {
      loginLib.login({ loginType:options.loginType,success: doRequest, fail: callFail });
    }

    // 实际进行请求的方法
    function doRequest() {
      var authHeader = buildAuthHeader(Session.get());

      my.httpRequest(utils.extend({
        method: 'POST',
      }, options, {
          headers: utils.extend(
            originHeader, authHeader,   // { 'Content-Type':'application/json' },
          ),

          success: function (response) {
            var data = response.data;

            // 如果响应的数据错误码为TOKEN_INVALID，则表示token已失效或者不存在
            if (data && data.resultCode == 'TOKEN_INVALID') {
              // 清除登录态
              Session.clear();

              var error, message;
              // 如果是登录态无效，并且还没重试过，会尝试登录后刷新凭据重新请求
              if (!hasRetried) {
                hasRetried = true;
                console.log('重新请求');
                doRequestWithLogin();
                return;
              }

              message = '登录态已过期';
              error = new RequestError(data.error, message);



              return;
            }
            // console.log('doRequest');

            callSuccess(response);
          },

          fail: callFail,
          complete: noop,
        }));
    };
  }).catch((error) => {
    var fail = options.fail || noop;
    var complete = options.complete || noop;

    // 失败回调
    var callFail = function (error) {
      fail.call(options, error);
      complete.call(options, error);
    };
    // console.log('sorry, 请求失败了, 这是失败信息:', error);
    callFail(error)
  });




};

module.exports = {
  RequestError: RequestError,
  request: request,
};