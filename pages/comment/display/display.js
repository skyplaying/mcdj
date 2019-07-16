

import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},

  onLoad(options) {
    const that = this;
    // options.fosterOrderId = 22;
    const fosterOrderId = options && options.fosterOrderId ? options.fosterOrderId : null;
    this.setData({ fosterOrderId });
  },

  onShow() {
    const that = this;
    if (!isNoFirst) {
      isNoFirst = true;
      app.globalData.isAnew = 0;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo
          })
          that.findCommentByOrder();
        }
      })
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 评论信息
  findCommentByOrder() {
    const that = this;
    my.showNavigationBarLoading();
    const fosterOrderId = this.data.fosterOrderId;
    mcdj.findCommentByOrder({
      fosterOrderId,
      success(data) {
        const commentVo = data.commentVo;
        that.setData({
          commentVo,
          isok: true,
        });
        my.hideNavigationBarLoading();
      }
    });
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },


});
