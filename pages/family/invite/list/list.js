import mcdj from '../../../../others/js/interface_mc';

const app = getApp();
Page({
  data: {},
  onLoad() {
    const that = this;

    app.doLogin({
      success() {
        that.initList();
      }, fail() {
        my.navigateBack();
      }
    })
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.loading)
      this.loadFamily();
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
    this.loadFamily();
  },

  // 加载家庭列表
  loadFamily() {
    const that = this;
    if (!this.data.nomore) {
      const page = this.data.page + 1;
      this.setData({
        loading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryInvFamilyList({
        page,
        success(data) {
          const page = data.page;
          const nomore = data.noMore;
          const list = that.data.list.concat(data.results);
          const total = data.total;
          const invAmount = data.invAmount;
          console.log(list);
          that.setData({ list, page, nomore, total, invAmount, loading: false, isok: true });
          my.hideNavigationBarLoading();
          my.stopPullDownRefresh();
        }
      });
    }
  },



});
