
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},
  onLoad(options) {
    const that = this;
    // options.userId = 2;
    const inviteUserId = options && options.userId ? options.userId : null;
    if (inviteUserId) {
      this.inviteFamily(inviteUserId);
    }
  },
  onShow() {
    const that = this;
    app.doLogin({
      success(userInfo) {
        console.log(userInfo);
        that.setData({ userInfo, isok: true })
        if (!userInfo.isBindPhone) {
          my.alert({
            content: '您还未绑定手机，请先前往绑定手机',
            buttonText: '绑定手机',
            success() {
              my.navigateTo({
                url: '/pages/colligate/bindPhone/bindPhone'
              })
            },
          });
        }
      }
    })
  },
  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 保存邀请人
  inviteFamily(inviteUserId) {
    mcdj.inviteFamily({
      inviteUserId,
      success() {
        mcdj.showToast('已保存邀请人', 2);
      }
    })
  },

  // 进入个人入驻
  intoPersonalJob() {
    this.setData({
      isShowPersonalJob: true
    })
  },

  // 回首页
  toIndex() {
    my.switchTab({
      url: '/pages/index/index'
    });
  },

  // 联系客服
  customerService() {
    my.makePhoneCall({
      number: '075588823343',
    });
  },

  // 复制手机号
  handleCopy() {
    my.setClipboard({
      text: '13410633367',
      success() {
        mcdj.showToast('手机号已复制', 2);
      }
    });
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },

  // 商家入驻
  intoBusiness() {
    my.navigateToMiniProgram({
      appId: '2018122162660150',
      success(res) {
        console.log(JSON.stringify(res))
      },
      fail(res) {
        mcdj.showToast('跳转失败', 2);
        console.log(JSON.stringify(res))
      }
    });
  },


});
