
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;

Page({
  data: {

  },
  data: {},
  onLoad(options) { },
  onShow() {
    const that = this;
    const isNoAnewMyPetList = mcdj.getStorageSync('isNoAnewMyPetList');
    if (!isNoFirst || !isNoAnewMyPetList) {
      isNoFirst = true;
      app.globalData.isAnew = 0;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo
          })
        }
      })
      this.myInsureList();
    }
  },
  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 我的列表
  myInsureList() {
    const that = this;
    my.showNavigationBarLoading();
    mcdj.myInsureList({
      success(data) {
        const myInsureList = data.insureList;
        console.log(myInsureList)
        that.setData({
          myInsureList,
          isok: true
        });
        my.hideNavigationBarLoading();
      }
    });
  },

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
