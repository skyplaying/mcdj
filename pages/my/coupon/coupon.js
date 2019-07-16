
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

Page({
  data: {},
  onLoad(options) {
    const that = this;
    this.initList();
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.loading)
      this.loadCoupon();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.initList();
  },

  // 初始化列表
  initList() {
    this.setData({
      loading: false,
      page: 0,
      list: [],
      nomore: false,
    });
    my.showNavigationBarLoading();
    this.loadCoupon();
  },

  // 加载列表
  loadCoupon() {
    const that = this;
    if (!this.data.nomore) {

      const page = this.data.page + 1;
      this.setData({
        loading: true
      })
      my.showNavigationBarLoading();
      mcdj.myCouponList({
        page,
        success(data) {
          const page = data.page;
          const nomore = data.noMore;
          const list = that.data.list.concat(data.results);
          const total = data.total;
          console.log(list);
          that.setData({ list, page, nomore, total, loading: false, isok: true });
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