
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();
Page({
  data: {},

  onLoad(options) {
    const that = this;

    // 当前的日期
    my.getServerTime({
      success(res) {
        // const nowDate = utils.formatTimestamp(new Date("2018-09-03 00:00:00").getTime()).split(' ')[0];
        const nowDate = utils.formatTimestamp(res.time).split(' ')[0];
        const year = nowDate.split('-')[0];
        const month = nowDate.split('-')[1];
        that.setData({ nowDate, year, month });
        that.initList();
      },
    });
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.loading) {
      this.load();
    }
  },

  // 选择月份
  selectMonth() {
    const that = this;
    my.datePicker({
      format: "yyyy-MM",
      endDate: that.data.nowDate,
      success: (res) => {
        const date = res.date;
        that.setData({
          year: date.split('-')[0],
          month: date.split('-')[1],
        });
        that.initList();
      },
    });
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
    this.load();
  },

  // 获取我的收入记录列表
  load() {
    const that = this;
    if (!this.data.nomore) {
      const firstQueryDate = this.data.year + "-" + this.data.month;
      const page = this.data.page + 1;
      this.setData({
        loading: true
      })
      my.showNavigationBarLoading();
      mcdj.myIncomeList({
        page, month: firstQueryDate,
        success(data) {
          const invAmount = data.invAmount.toFixed(2);
          const page = data.page;
          const nomore = data.noMore;
          const list = that.data.list.concat(data.results);
          const total = data.total;
          console.log(list);
          that.setData({ invAmount, list, page, nomore, total, loading: false });
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


});

