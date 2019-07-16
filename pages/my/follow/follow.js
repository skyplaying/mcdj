
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

Page({
  data: {
    isok: true
  },
  onLoad(options) {
    const that = this;
    //获取定位
    const location = app.globalData.location || mcdj.getStorageSync(app.storagekey.locationKey) || {};
    that.setData({
      latPoint: location.latitude,
      lngPoint: location.longitude,
    })

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
      this.loadUser();
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
    this.loadUser();
  },

  // 加载列表
  loadUser() {
    const that = this;
    if (!this.data.nomore) {
      const lngPoint = this.data.lngPoint;
      const latPoint = this.data.latPoint;

      const page = this.data.page + 1;
      this.setData({
        loading: true
      })
      my.showNavigationBarLoading();
      mcdj.myFollowList({
        page, lngPoint, latPoint,
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

  // 保存二维码
  setFormId(e) {
    wk.setFormId(e);
  },

})