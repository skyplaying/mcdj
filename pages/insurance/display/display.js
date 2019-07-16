

import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;

Page({
  data: {
    isok: true
  },

  onLoad(options) {
    const that = this;
    const insureRecordId = options.insureRecordId || null;
    this.setData({ insureRecordId });
  },

  onShow() {
    const that = this;
    if (!isNoFirst) {
      isNoFirst = true;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo
          })
          that.insureInfo();
        }
      })
    } else {
      that.insureInfo();
    }
  },
  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 订单详情
  insureInfo() {
    const that = this;
    my.showNavigationBarLoading();
    const insureRecordId = this.data.insureRecordId;
    mcdj.insureInfo({
      insureRecordId,
      success(data) {
        const insureRecordVo = data.insureRecordVo;
        that.setData({
          insureRecordVo,
          isok: true,
        });
        my.hideNavigationBarLoading();
        my.stopPullDownRefresh();
      }
    });
  },

  // 在线理赔
  toCompensate() {
    const src = "https://api.pet-city.cn/h5/cardapply/login";
    my.navigateTo({
      url: `/pages/colligate/webview/webview?src=${src}`
    })
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },
});
