

import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},

  onLoad(options) {
    const that = this;
    // options.userId = 2;
    const userId = options && options.userId ? options.userId : null;
    this.setData({ userId });
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
          that.queryAdopterInfo();
          that.initCommentList();
        }
      })
    }
  },

  onPullDownRefresh() {
    this.queryAdopterInfo();
    this.initCommentList();
  },

  onReachBottom() {
    if (!this.data.loading)
      this.loadComment();
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 获取寄养家庭资料
  queryAdopterInfo() {
    const that = this;
    const userId = this.data.userId;
    mcdj.getKeepPet({
      userId,
      success(data) {
        const userVo = data.userVo;
        that.setData({
          userVo,
          isok: true,
        });
      }
    });
  },

  // 初始化列表
  initCommentList() {
    this.setData({
      page: 0,
      list: [],
      loading: false,
      nomore: false,
      total: null
    })
    this.loadComment();
  },

  // 加载列表
  loadComment() {
    const that = this;
    if (!this.data.nomore) {
      const userId = this.data.userId;
      const page = this.data.page + 1;
      this.setData({
        loading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryCommentList({
        userId,
        page,
        pageSize: 10,
        success(data) {
          const page = data.page;
          const nomore = data.noMore;
          const list = that.data.list.concat(data.results);
          const total = data.total;
          console.log(list);
          that.setData({ list, page, nomore, total, loading: false });
          my.hideNavigationBarLoading();
          my.stopPullDownRefresh();
        }
      });
    }
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },


});
