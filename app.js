
import qcloud from './others/qcloud-weapp-client-sdk/index';
import config from './config';
import mc from './others/js/weui_mc';
import mcdj from './others/js/interface_mc';


App({

  onLaunch() {
    /**
     * 小程序初始化时执行，我们初始化客户端的登录地址，以支持所有的会话操作  
     */
    qcloud.setLoginUrl(config.service.loginUrl);
    var tunnel = this.tunnel = new qcloud.Tunnel(config.service.tunnelUrl);
  },

  onShow(e) {
    console.log(e)

    /**
     * 通过按钮分享转发的连接进入的
     */
    var shareUserId = e.query ? e.query.shareUserId : null;
    if (shareUserId) {
      this.globalData.shareUserId = shareUserId;
    }

    // 检查新版本
  },

  // 隐藏页面
  onHide() {
    mcdj.saveFormIds();
  },

  // 页面错误
  onError() {
    mcdj.saveFormIds();
  },

  // 登录获取个人信息
  doLogin(obj) {
    const that = this;

    const anew = obj.anew;
    const loginType = obj.loginType === "0" ? '0' : "1";  //默认是授权用户信息的登录 除非是首页传过来其他值
    // console.log('loginType:' + loginType);
    const success = obj.success;
    const fail = obj.fail;
    if (anew || !that.globalData.userInfo) {  //需要刷新或者用户信息不存在，又或者原来是静默授权登录，现在是用户信息授权登录时，需要重新登录
      const location = mcdj.getStorageSync(that.storagekey.locationKey) || {};
      const lngPoint = obj.lngPoint || location.longitude || null;
      const latPoint = obj.latPoint || location.latitude || null;
      mcdj.getUserInfo({
        loginType,
        lngPoint,
        latPoint,
        success(data) {
          console.log(data)
          const userInfo = data.userInfo;
          if (userInfo.nickName && userInfo.avatar) {
            that.globalData.userInfo = userInfo;
          }
          that.globalData.loginType = that.globalData.loginType === "0" && loginType === "0" ? "0" : "1";
          typeof success == "function" && success(userInfo);
          // 假如存在分享的用户ID并且不是自己，则调用上传分享用户
          // if (that.globalData.shareUserId && that.globalData.shareUserId != userInfo.userId) {
          //   mcdj.saveUserShare({
          //     userId: that.globalData.shareUserId,
          //     lookType: that.globalData.scene
          //   })
          // }

          //如果还未连接WebSocket则进行连接
          that.startTunnel();
        },
        fail
      })
    } else {
      typeof success == "function" && success(that.globalData.userInfo);
    }
  },

  // 信道开启
  startTunnel() {
    const that = this;
    if (!that.globalData.isOpenTunnel) {
      this.tunnel.open();
      if (!that.globalData.isOnTunnel) {
        that.globalData.isOnTunnel = 1
        this.tunnel.on('connect', () => {
          console.log('WebSocket 信道已连接')
          that.globalData.isOpenTunnel = 1
        });
        this.tunnel.on('close', () => {
          that.globalData.isOpenTunnel = 0
          console.log('WebSocket 信道已断开')
        });
        this.tunnel.on('reconnecting', () => console.log('WebSocket 信道正在重连...'));
        this.tunnel.on('reconnect', () => console.log('WebSocket 信道重连成功'));
        this.tunnel.on('error', error => console.error('信道发生错误：', error));

        // 监听自定义消息（服务器进行推送）
        this.tunnel.on('speak', speak => {
          console.log('收到 speak 消息：', speak)
          if (!speak.isMe) {
            my.vibrateLong({});
            console.log("isMe:" + speak.isMe)
          }
          this.onSpeak(speak);
        });

        // 监听自定义消息（服务器进行推送）
        this.tunnel.on('system', system => {
          console.log('收到 system 消息：', system)
          my.vibrateLong({});
        });
      }
    } else {
      var tunnel = this.tunnel = new qcloud.Tunnel(config.service.tunnelUrl);
    }
  },

  /**
   * 派发事件，通知所有处理函数进行处理
   */
  onSpeak(speak) {
    const speakFns = this.globalData.speakFns || [];
    speakFns.forEach(function (fnObj) {
      typeof fnObj.fn === 'function' && fnObj.fn(speak);
    });
  },

  /**
   * 注册speak消息处理函数
   */
  registerEventHandler(eventHandler) {
    if (typeof eventHandler === 'function') {
      eventHandlers.push([eventType, eventHandler]);
    }
  },

  globalData: {
    userInfo: null,
    location: null,
    cityObj: null,
    loginType: null,
    shareUserId: null,
    edition: "1.0.0",
    isAnew: 0, //用于授权后返回时判断是否刷新数据的依据
    isAnewIdentity: 0, //判断是否要刷新身份

    isOpenTunnel: 0, //判断是否打开了通道
    speakFns: [], //通道speak要处理的函数组

    lifeNum: '萌宠共享信用寄养平台',
    company: '深圳企拼客网络科技有限公司',
  },

  storagekey: {
    locationKey: 'location',
    defaultAddressKey: 'defaultAddress',
  },

});
