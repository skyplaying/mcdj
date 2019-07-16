
import mc from '../../../others/js/weui_mc';

const app = getApp();

Page({
  data: {
    showloading: false,
    detailedPage: 0,
    detailedList: [],
    shownomoreDetailed: false,
  },

  // 初始化列表（清空已存在的列表）
  initialiseList() {
    this.setData({
      detailedPage: 0,
      detailedList: [],
      shownomoreDetailed: false,
    });
  },

  onLoad(options) {
    const that = this;
    console.log(options);

    this.myDetailedList();
  },

  // 下拉刷新
  onPullDownRefresh() {
    const cb = () => { my.stopPullDownRefresh(); };
    this.initialiseList();
    this.myDetailedList(cb);
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.showloading) {
      this.myDetailedList();
    }
  },

  // 获取我的寄养的列表
  myDetailedList(cb) {
    const that = this;
    const detailedPage = this.data.detailedPage + 1;
    if (!this.data.shownomoreDetailed) {
      that.setData({ showloading: true });
      const cb1 = (list, page, ifNoMore) => {
        const newlist = that.data.detailedList.concat(list);
        that.setData({ detailedList: newlist, detailedPage: page, showloading: false });
        if (ifNoMore) that.setData({ shownomoreDetailed: true });
        typeof cb == 'function' && cb();
      };
      mc.myDetailedList(cb1, 10, detailedPage);
    }
  },


});

