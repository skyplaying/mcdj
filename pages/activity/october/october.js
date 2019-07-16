

import mcdj from '../../../others/js/interface_mc';
const app = getApp();
let isclick;
Page({
  data: {},

  onShow() {
    this.refresh();
  },

  // 刷新
  refresh() {
    const that = this;
    my.showNavigationBarLoading();
    app.doLogin({
      success(userInfo) {
        my.showNavigationBarLoading();
        that.queryNationalDay();
      }, fail() {
        my.hideNavigationBarLoading();
        that.setData({ isNoAuth: true });
      }
    });
  },

  // 查询国庆中秋优惠券列表
  queryNationalDay() {
    const that = this;
    my.showNavigationBarLoading();
    mcdj.queryNationalDay({
      success(data) {
        my.hideNavigationBarLoading();
        const isReceive = data.res;
        const list = data.list;
        that.setData({
          isReceive, list, isok: true
        })
      }
    })
  },


  // 领取
  receiveCoupon() {
    const that = this;
    if (this.data.isReceive == 1) return;

    if (isclick) return;
    isclick = true;
    mcdj.showLoading('领取中...');
    mcdj.recNationalDayCoupon({
      success(res) {
        that.queryNationalDay();
        that.showReceive();
        isclick = false;
        my.hideLoading();
      }, fail(err) {
        isclick = false;
      }
    })
  },

  // 显示领取成功浮层
  showReceive() {
    this.setData({ showReceive: !this.data.showReceive });
  },

  // 回首页
  toIndex() {
    my.switchTab({
      url: '/pages/index/index',
    });
  },

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
