
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {
    // familyTabs: [{
    //   text: '待确认',
    //   state: '2'
    // }, {
    //   text: '进行中',
    //   state: '3,4'
    // }, {
    //   text: '已结束',
    //   state: '-1,5,6'
    // }, {
    //   text: '退款',
    //   state: '7'
    // }],
    // masterTabs: [{
    //   text: '进行中',
    //   state: '1,2,3,4'
    // }, {
    //   text: '待评价',
    //   state: '5'
    // }, {
    //   text: '已结束',
    //   state: '-1,6'
    // }, {
    //   text: '退款',
    //   state: '7'
    // }],
    tabs: [{
      text: '待支付',
      state: '1'
    }, {
      text: '进行中',
      state: '2'
    }, {
      text: '待评价',
      state: '3'
    }, {
      text: '已结束',
      state: '4'
    }],
    tabsWidth: 750,   //单位为rpx的大小,因为translateX暂不支持rpx
    sliderWidth: 80,  //需要设置slider的宽度，用于计算中间位置,一般是屏幕宽度除以tabs的个数
    activeIndex: "0",
    sliderOffset: 0,
    sliderLeft: 0,

    isok: true
  },

  onLoad(options) {
    const that = this;
    console.log(options);
    const isFamily = mcdj.getStorageSync('isFamily');
    const activeIndex = options.activeIndex || "0";
    this.setData({
      activeIndex,
      isFamily,
      // tabs: isFamily ? that.data.familyTabs : that.data.masterTabs
    })
    this.initTabs();      // 初始化标题导航栏的tbas
  },

  onShow() {
    if (!isNoFirst) {
      isNoFirst = true;
      this.initList();
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.initList();
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.loading) {
      this.load();
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 初始化列表
  initList() {
    this.setData({
      loading: false,
      page: 0,
      list: [],
      nomore: false,
      total: null
    });
    this.load();
  },

  // 加载列表
  load() {
    const that = this;
    if (!this.data.nomore) {
      const queryType = this.data.isFamily ? 2 : 1;
      const queryStaus = this.data.tabs[this.data.activeIndex].state;
      const page = this.data.page + 1;
      this.setData({
        loading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryUserOrderList({
        queryType,
        queryStaus,
        page,
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

  // 寄养订单页
  toDisplay(e) {
    const index = e.currentTarget.dataset.index;
    const list = this.data.list;
    const fosterOrderId = list[index].fosterOrderId;
    if (list[index].orderType == 1) {
      my.navigateTo({
        url: '/pages/fosterage/display/display?fosterOrderId=' + fosterOrderId,
      });
    } else if (list[index].orderType == 2) {
      my.navigateTo({
        url: '/pages/fosterage/trainer/display/display?trainOrderId=' + fosterOrderId,
      });
    }
  },

  // 去寄养家庭
  toUser(e) {
    if (this.data.isFamily) return;
    const id = e.currentTarget.dataset.id;
    my.navigateTo({
      url: '/pages/personal/display/display?userId=' + id,
    });
  },


  // 管理
  administration(e) {
    const that = this;
    const index = e.currentTarget.dataset.index;
    my.showActionSheet({
      title: '管理我的寄养',
      items: ['删除'],
      cancelButtonText: '取消操作',
      success(res) {
        if (res.index == 0) {
          that.detele(index);
        }
      },
    });
  },

  // 删除
  detele(index) {
    const that = this;
    const list = that.data.list;
    const fosterOrderId = list[index].fosterOrderId;
    mcdj.confirm(function (res) {
      mcdj.delFosterPet({
        fosterOrderId,
        success() {
          list.splice(index, 1);
          that.setData({
            list
          })
        }
      });
    }, '是否要删除寄养，一旦删除将无法恢复', '是', '否');
  },

  // 保存模板ID
  setFormId(e) {
    mcdj.setFormId(e);
  },

  // -------------------------------------初始化tabs----------------------------------------
  initTabs() {
    const that = this;
    my.getSystemInfo({
      success(res) {
        const px = res.windowWidth / 750;
        const windowHeight = res.windowHeight;
        that.setData({
          px,
          windowHeight,
          sliderLeft: (that.data.tabsWidth / that.data.tabs.length - that.data.sliderWidth) / 2 * px,
          sliderOffset: (that.data.tabsWidth / that.data.tabs.length) * parseInt(that.data.activeIndex) * px,
        });
      },
    })
  },
  // 切换tabs
  tabClick(e) {
    var id = e.currentTarget.id;
    this.setData({
      sliderOffset: (this.data.tabsWidth / this.data.tabs.length) * parseInt(id) * this.data.px,
      activeIndex: id,
    });
    this.initList();
  },


});

