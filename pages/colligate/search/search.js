
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

Page({
  data: {
    keyword: '', // 输入框内容
    hotList: [], // 热门列表
    historyList: [], // 历史搜索列表

    tabs: ["寄养家庭", "宠物店"],
    sliderWidth: 80, // 需要设置slider的宽度，用于计算中间位置,一般是屏幕宽度除以tabs的个数
    activeIndex: "0",
    sliderOffset: 0,
    sliderLeft: 0,
  },

  onLoad(options) {
    const that = this;
    that.getHotList();
    that.getHistorylist();

    //获取定位
    const location = app.globalData.location || mcdj.getStorageSync(app.storagekey.locationKey) || {};
    that.setData({
      latPoint: location.latitude,
      lngPoint: location.longitude,
    })

    // 顶部tab滑块的
    my.getSystemInfo({
      success(res) {
        that.setData({
          windowWidth: res.windowWidth,
          sliderLeft: (res.windowWidth / that.data.tabs.length - that.data.sliderWidth) / 2
        });
      }
    });
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.showloading)
      this.loadMore();
  },

  // 初始化列表
  initList() {
    this.setData({
      showloading: false,
      page: 0,
      list: [],
      nomore: false,
      firstQueryDate: null,
    });
    my.showNavigationBarLoading();
    this.loadMore();
  },

  // 加载列表
  loadMore(cb) {
    if (this.data.activeIndex == 0)
      this.loadFamily();
    else if (this.data.activeIndex == 1)
      this.loadImages();
  },

  // 加载家庭列表
  loadFamily() {
    const that = this;
    if (!this.data.nomore) {
      const lngPoint = this.data.lngPoint;
      const latPoint = this.data.latPoint;
      const nickName = this.data.keyword;

      const page = this.data.page + 1;
      const firstQueryDate = this.data.firstQueryDate || utils.formatTime(new Date());
      this.setData({
        showloading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryHomeUserList({
        page, firstQueryDate, lngPoint, latPoint, nickName,
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

  //登录后调整
  loginAfterNav(e) {
    const url = e.currentTarget.dataset.url;
    const type = e.currentTarget.dataset.type;
    app.doLogin({
      success() {
        my[type || 'navigateTo']({
          url
        })
      }
    })
  },

  // 查看服务
  toServer(e) {
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;
    app.doLogin({
      success() {
        if (type == 1)
          my.navigateTo({
            url: "/pages/family/display/display?userId=" + id
          })
        else if (type == 2)
          my.navigateTo({
            url: "/pages/trainer/display/display?trainServiceId=" + id
          })
      }
    })
  },

  // ------------------------------------------------------------------

  // 获取热门列表
  getHotList() {
    const that = this;
    mcdj.queryHotSearch({
      success(hotList) {
        //随机获取一个热词当做搜索框内的默认值
        const index = Math.floor(Math.random() * hotList.length)
        const pkeyword = hotList[index].searchKeyword;

        that.setData({ hotList, pkeyword });
      }
    })
  },

  // 获取历史列表
  getHistorylist() {
    const that = this;
    const historyList = mcdj.getStorageSync('historyList') || [];
    that.setData({ historyList });
  },

  // 搜索完加入历史列表
  setHistorylist(data) {
    mcdj.setStorageSync('historyList', data);
    this.getHistorylist();
  },

  // 清空历史列表
  removeHistory() {
    const that = this;
    mcdj.removeStorageSync('historyList');
    that.getHistorylist();
  },

  // 删除输入的内容
  clearInput() {
    this.setData({ keyword: '' });
  },

  // 输入搜索内容
  inputTyping(e) {
    this.setData({ keyword: e.detail.value });
    // this.initList();
  },

  // 搜索
  searchconfirm() {
    let keyword = this.data.keyword;
    const newlist = this.data.historyList;

    //输入框不存在关键词时，搜索默认热门词
    if (!keyword) {
      keyword = this.data.pkeyword;
      this.setData({ keyword })
    };

    //已存在的历史词汇，先删除再加入
    const index = newlist.indexOf(keyword);
    if (index >= 0) newlist.splice(index, 1);
    newlist.unshift(keyword);

    this.setHistorylist(newlist);
    this.initList();
  },

  // 点击热门或历史搜索的标签进行搜索
  keyWordSearch(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword });
    this.initList();
  },


  // -----------------------------------------
  // 导航切换
  tabClick(e) {
    var id = e ? e.currentTarget.id : '0';
    this.setData({
      sliderOffset: (this.data.windowWidth / this.data.tabs.length) * parseInt(id),
      activeIndex: id
    });
    this.loadMore()
  },


});

