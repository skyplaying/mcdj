

import mcdj from '../../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},

  onLoad(options) {
    const that = this;
    const trainServiceId = options.trainServiceId || 9;
    this.setData({ trainServiceId });
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
          that.trainServiceInfo();
          that.initCommentList();
        }
      })
    }
  },

  onPullDownRefresh() {
    this.trainServiceInfo();
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

  // 获取训练服务详情
  trainServiceInfo() {
    const that = this;
    const trainServiceId = this.data.trainServiceId;
    mcdj.trainServiceInfo({
      trainServiceId,
      success(data) {
        const trainServiceVo = data.trainServiceVo || {};
        that.setData({
          isok: true,
          trainServiceVo,
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
      const trainServiceId = this.data.trainServiceId;
      const page = this.data.page + 1;
      this.setData({
        loading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryServiceCommentList({
        trainServiceId,
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
