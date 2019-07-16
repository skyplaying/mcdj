import mcdj from '../../../../others/js/interface_mc';

const app = getApp();
Page({
  data: {},
  onLoad() {
    const that = this;

    app.doLogin({
      success(userInfo) {
        that.setData({
          userInfo
        })
        that.getInvAmount();
      }, fail() {
        my.navigateBack();
      }
    })
  },

  // 获取金额
  getInvAmount() {
    const that = this;
    mcdj.queryInvFamilyList({
      success(data) {
        const invAmount = data.invAmount;
        that.setData({ invAmount, isok: true });
      }
    });
  },

  showRule() {
    this.setData({
      showRule: !this.data.showRule
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '萌宠到家家庭认证邀请',
      desc: '在家没事，帮忙照看宠物，轻松赚个几百块！萌宠到家寄养家庭招募中！',
      path: '/pages/family/flow/flow?userId=' + this.data.userInfo.userId
    };
  },



});
