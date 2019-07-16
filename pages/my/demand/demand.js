
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst;
Page({
  data: {  },
  onLoad(options) {},

  onShow() {
    const that = this;
    if (!isNoFirst) {
      isNoFirst = true;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo,
            isok: true,
          })
          that.initList();
        }
      })
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
     isNoFirst = undefined;
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.showloading)
      this.loadDemand();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.initList();
  },

  // 初始化列表
  initList() {
    this.setData({
      showloading: false,
      page: 0,
      list: [],
      nomore: false,
    });
    my.showNavigationBarLoading();
    this.loadDemand();
  },

  // 加载附近需求列表
  loadDemand() {
    const that = this;
    if (!this.data.nomore) {
      const page = this.data.page + 1;
      this.setData({
        showloading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryFosterDemandList({
        page,isMe:1,
        success(data) {
          const page = data.page;
          const nomore = data.noMore;
          const list = that.data.list.concat(data.results);
          const total = data.total;
          console.log(list);
          that.setData({ list, page, nomore, total, showloading: false });
          my.hideNavigationBarLoading();
          my.stopPullDownRefresh();
        }
      });
    }
  },

  // 保存二维码
  setFormId(e) {
    wk.setFormId(e);
  },

})