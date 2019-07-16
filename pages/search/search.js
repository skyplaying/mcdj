

Page({

  data: {
    inputval: '', // 输入框内容
    hotList: [], // 热门列表
    historyList: [], // 历史搜索列表
    searchList: [], // 搜索输入关键字对应的下拉列表
  },

  onLoad() {
    const that = this;
    that.getHotList();
    that.getHistorylist();
  },

  // 获取热门列表
  getHotList() {
    const that = this;
    that.setData({ hotList: ['二哈', '英短蓝猫', '中华田园猫', '塔蒂', '博美犬', '金毛'] });
  },

  // 搜索完加入历史列表
  setHistorylist(data) {
    my.setStorageSync({ key: 'historyList', data });
    this.getHistorylist();
  },

  // 获取历史列表
  getHistorylist() {
    const that = this;
    my.getStorage({
      key: 'historyList',
      success(res) {
        that.setData({ historyList: res.data || [] });
      },
      fail() {
        that.setData({ historyList: [] });
      },
    });
  },

  // 清空历史列表
  removeHistory() {
    const that = this;
    my.removeStorage({
      key: 'historyList',
      success() {
        that.getHistorylist();
      },
    });
  },

  // 取消搜索按钮
  cancelSearch() {
    my.navigateBack();
    this.setData({ inputval: '' });
  },

  // 删除输入的内容
  clearInput() {
    this.setData({ inputval: '' });
  },

  // 搜索
  searchconfirm() {
    const keyword = this.data.inputval;
    if(!keyword) return;
    const newlist = this.data.historyList;
    newlist.unshift(keyword);
    this.setHistorylist(newlist);
    this.clearInput();
    my.redirectTo({ url: '/pages/list/search/search?keyword=' + keyword });
  },

  // 输入搜索内容
  inputTyping(e) {
    this.setData({ inputval: e.detail.value });
    this.relatedSearch(e.detail.value);
  },

  // 根据关键字搜索相关列表
  relatedSearch(value) {
    // const that = this;
    console.log(value);
    // that.setData({searchList: ["IT互联网","金融","广告","房地产","消费品","制造业"]})    
  },

});
