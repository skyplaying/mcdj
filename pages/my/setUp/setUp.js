

const app = getApp();
Page({
  data: {},
  onLoad() { },

  onShow() {
    this.getStorageInfo();
  },

  // 获取缓存
  getStorageInfo() {
    const that = this;
    my.getStorageInfo({
      success: function (res) {
        const currentSize = Math.round(parseFloat(res.currentSize) * 100) / 100;
        that.setData({ currentSize });
      }
    })
  },

  // 清除缓存
  clearStorage() {
    const that = this;

    my.confirm({
      title: '温馨提示',
      content: '是否确认要清除缓存',
      success(res) {
        my.clearStorageSync();
        app.globalData.userInfo = null;
        that.getStorageInfo();
      },
    });
  },

});
