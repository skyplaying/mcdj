

import mc from '../../../others/js/weui_mc';
const app = getApp();

Page({
  data: {
    showloading: false,
    noticePage: 0,
    noticeList: [],
    shownomoreNotice: false,
  },

  // 初始化列表（清空已存在的列表）
  initialiseList() {
    this.setData({
      showloading: false,
      noticePage: 0,
      noticeList: [],
      shownomoreNotice: false,
    });
  },

  onLoad(options) {
    const that = this;

    app.doLogin({
      success(userInfo) {
        that.queryNoticeList(function () {
          that.setData({
            isok: true
          })
        });
      }
    })
  },

  onShow() {
    if (this.data.isNoFirst) {
      this.initialiseList();
      this.queryNoticeList();
    } else {
      this.setData({ isNoFirst: true })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    const cb = () => { my.stopPullDownRefresh(); };
    this.initialiseList();
    this.queryNoticeList(cb);
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.showloading) {
      this.queryNoticeList();
    }
  },

  // 获取时间
  getSysDate(cb) {
    const that = this;
    if (that.data.firstQueryDate) {
      typeof cb == "function" && cb()
    } else {
      mc.getSysDate(function (date) {
        that.setData({ firstQueryDate: date })
        typeof cb == "function" && cb()
      });
    }
  },

  // 获取通知消息列表
  queryNoticeList(cb) {
    const that = this;
    const noticePage = this.data.noticePage + 1;
    if (!this.data.shownomoreNotice) {
      that.setData({ showloading: true });
      const cb1 = (list, page, ifNoMore) => {
        console.log(list)
        const newlist = that.data.noticeList.concat(list);
        that.setData({ noticeList: newlist, noticePage: page, showloading: false });
        if (ifNoMore) that.setData({ shownomoreNotice: true });
        typeof cb == 'function' && cb();
      };
      const cb2 = () => {
        const firstQueryDate = that.data.firstQueryDate;
        const petId = that.data.petId;
        mc.queryMyNoticeList(cb1, 10, noticePage);
      };
      that.getSysDate(cb2);
    }
  },

  // 查看详情
  viewDetails(e) {
    const that = this;
    const index = e.currentTarget.dataset.index;
    const noticeList = this.data.noticeList;
    const msgType = noticeList[index].msgType;
    const remark = noticeList[index].remark;
    const msgTypeId = noticeList[index].msgTypeId;
    if (msgType == 0) {
      my.navigateTo({
        url: '/pages/my/pair/pair?activeIndex=1',
      });
    } else if (msgType == 1 || msgType == 2) {
      my.navigateTo({
        url: '/pages/fosterage/display/display?fosterOrderId=' + msgTypeId,
      });
    } else if (msgType == 3) {
      if (remark) {
        my.navigateTo({
          url: '/pages/family/flow/flow',
        });
      } else {
        my.navigateTo({
          url: '/pages/family/display/display',
        });
      }
    }
  }
});
