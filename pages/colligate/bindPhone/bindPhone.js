
// 引入配置
import mcdj from '/others/js/interface_mc';
var app = getApp();

Page({
  data: {
    isCanSend: false,
    noDisabled: false,
    btnfont: 0,
    phoneNum: null,
    provingNum: null
  },

  // 输入手机号
  inputPhoneNum(e) {
    this.setData({
      phoneNum: e.detail.value
    })
    if (e.detail.value.length == 11)
      this.setData({ isCanSend: true })
    else
      this.setData({ isCanSend: false })
  },

  // 输入验证码
  inputProvingNum(e) {
    this.setData({
      provingNum: e.detail.value
    })
    if (e.detail.value.length == 4 && this.data.phoneNum.length == 11)
      this.setData({ noDisabled: true })
  },

  //获取验证码
  queryCode() {
    var that = this
    if (this.data.isclick) return
    this.setData({ isclick: true })

    const phoneNumber = that.data.phoneNum;
    mcdj.showLoading('发送中');
    mcdj.sendPhoneCode({
      phoneNumber,
      success() {
        my.hideLoading();
        mcdj.showToast("发送成功", 3);
        that.setData({ isclick: false, isCanSend: false })

        var font = 60;
        var ii = setInterval(function () {
          if (font > 1) {
            that.setData({ btnfont: --font })
          } else {
            clearInterval(ii)
            that.setData({ btnfont: 0, isCanSend: true })
          }
        }, 1000)
      }, fail() {
        that.setData({ isclick: false })
      }
    })
  },

  //提交
  submit() {
    var that = this
    var phoneNumber = this.data.phoneNum
    var verifyCode = this.data.provingNum
    if (this.data.isclick) return
    this.setData({ isclick: true })

    mcdj.judgeVerifyCode({
      phoneNumber, verifyCode,
      success() {
        that.setData({ isclick: false })
        my.showToast({
          content: '已绑定',
          type: 'none',
          success(res) {
            app.doLogin({
              anew: 1,
              success() {
                my.navigateBack();
              }
            })
          },
        });
      }, fail() {
        that.setData({ isclick: false })
      }
    })
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },
})