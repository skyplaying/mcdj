
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},

  onLoad(options) {
    const that = this;
    this.setData({
      isShowLifestyle: my.canIUse('lifestyle')
    })
  },
  onReady() {
    const that = this;
    if (!this.pageReady) {
      app.doLogin({
        success() {
          that.initList();
          that.queryIsNewMsg();
          that.onSocket();
        }
      })
      this.pageReady = true;
    }
  },

  onShow() {
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.initList();
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.loading) {
      this.loadLeaveCommentList();
    }
  },

  /**
   * 启动监听事件
   */
  onSocket() {
    const that = this;
    // 监听自定义消息（服务器进行推送）
    app.tunnel.on('speak', speak => {
      console.log(speak)
      that.speak(speak);
    });

    // 监听自定义消息（服务器进行推送）
    app.tunnel.on('system', system => {
      that.setData({ isNoticeNewMsg: 1 })
      console.log('isNoticeNewMsg：', that.data.isNoticeNewMsg)
    });
  },

  speak(speak) {
    const userId = speak.isMe ? speak.toUserId : speak.userId;
    const list = this.data.newsList;
    let index;
    list.forEach(function (item, idx) {
      if (item.usersVo.userId == userId) {
        index = idx;
      }
    });
    if (index || index == 0) {
      const repeatItem = list.splice(index, 1)[0];
      repeatItem.lastContent = speak.commentsContent;
      repeatItem.lastLookTime = speak.commentsTime;
      repeatItem.isNewMsg = speak.isMe ? 0 : 1;
      list.unshift(repeatItem);
      this.setData({
        newsList: list
      })
    } else {
      this.initList();
    }
  },

  // 初始化列表（清空已存在的列表）
  initList() {
    this.setData({
      loading: false,
      newsPage: 0,
      newsList: [],
      nomoreNew: false,
    });
    this.loadLeaveCommentList();
  },

  // 获取留言列表
  loadLeaveCommentList() {
    const that = this;
    if (!this.data.nomoreNew) {
      const page = this.data.newsPage + 1;
      this.setData({
        loading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryLeaveCommentList({
        page,
        success(data) {
          const newsPage = data.page;
          const nomoreNew = data.noMore;
          const newsList = that.data.newsList.concat(data.results);
          const total = data.total;
          console.log(newsList);
          that.setData({ newsList, newsPage, nomoreNew, total, loading: false });
          my.hideNavigationBarLoading();
          my.stopPullDownRefresh();
        }
      });
    }
  },

  // 是否有新的消息
  queryIsNewMsg() {
    const that = this;
    mcdj.queryIsNewMsg({
      success(data) {
        that.setData({ isNoticeNewMsg: data.isNoticeNewMsg })
      }
    })
  },

  toNotice() {
    this.setData({ isNoticeNewMsg: 0 })
    my.navigateTo({
      url: '../notice/notice',
    });
  },

  toDisplay(e) {
    const index = e.currentTarget.dataset.index;
    const newsList = this.data.newsList;
    newsList[index].isNewMsg = 0;
    this.setData({ newsList })
    my.navigateTo({
      url: `/pages/news/demo/demo?userId=${newsList[index].usersVo.userId}&userName=${newsList[index].usersVo.nickName}`,
    });
  },

});

