
// 引入 QCloud 小程序增强 SDK
import mc from '../../../others/js/weui_mc';
const app = getApp();


/**
 * 生成一条聊天室的消息的唯一 ID
 */
function msgUuid() {
  if (!msgUuid.next) {
    msgUuid.next = 0;
  }
  return 'msg-' + (++msgUuid.next);
}

/**
 * 生成聊天室的系统消息
 */
function createSystemMessage(content) {
  return { id: msgUuid(), type: 'system', content };
}

/**
 * 生成聊天室的聊天消息
 */
function createUserMessage(content, user, currTime, isMe) {
  const timeStamp = new Date(currTime).getTime();
  return { id: msgUuid(), type: 'speak', content, user, currTime, isMe, timeStamp };
}

// 声明聊天室页面
Page({

  /**
   * 聊天室使用到的数据，主要是消息集合以及当前输入框的文本
   */
  data: {
    messages: [],
    inputContent: '',
    lastMessageId: 'none',
  },

  onLoad(options) {
    var userId = options.userId || 2;
    var userName = options.userName || '用户留言';
    var inputContent = options.content || '';
    const messages = [];
    console.log(options)
    this.setData({ userId, userName, inputContent, messages })
  },

  /**
   * 页面渲染完成后，启动聊天室
   * */
  onReady() {
    my.setNavigationBar({ title: this.data.userName });

    if (!this.pageReady) {
      this.pageReady = true;
      this.enter();
    }
  },

  // /**
  //  * 后续后台切换回前台的时候，也要重新启动聊天室
  //  */
  // onShow() {
  //     if (this.pageReady) {
  //         this.enter();
  //     }
  // },

  /**
   * 页面卸载时，退出聊天室
   */
  onUnload() {
    this.quit();
  },

  // /**
  //  * 页面切换到后台运行时，退出聊天室
  //  */
  // onHide() {
  //     this.quit();
  // },

  /**
   * 退出聊天室
   */
  quit() {
    const Interval = this.data.Interval;
    clearInterval(Interval);
  },

  /**
   * 启动聊天室
   */
  enter() {
    const that = this;
    this.pushMessage(createSystemMessage('正在登录...'));

    // 如果登录过，会记录当前用户在 app.userInfo 上
    if (!app.userInfo) {
      app.doLogin({
        success(userInfo) {
          app.userInfo = userInfo;
          that.connect();
        }
      })
    } else {
      this.connect();
    }
  },

  /**
   * 连接到聊天室信道服务
   */
  connect() {
    const that = this;

    this.amendMessage(createSystemMessage('正在加载数据...'));

    this.loadMore(() => this.popMessage());
    this.a();
  },

  // 加载数据(isNew为1是新数据，0是旧数据)
  loadMore(cb, isNew) {
    const that = this;
    mc.getSysDate(function (sysDate) {
      const messagePage = (that.data.messagePage || 0) + 1;
      if (!that.data.shownomoreMessage || isNew) {
        that.setData({ showloading: true });
        const cb1 = (list, page, ifNoMore, total, data) => {
          console.log(data)
          that.setData({ messagePage: page, showloading: false });
          if (ifNoMore) that.setData({ shownomoreMessage: true });
          typeof cb === 'function' && cb();
          that.speak(list, isNew);
          if (isNew || !that.data.oldLoadDate) {
            that.setData({ newLoadDate: data.requestTime || sysDate })
          }
          if (!that.data.oldLoadDate) {
            that.setData({ oldLoadDate: sysDate })
          }
        };
        let firstQueryDate;
        if (!that.data.oldLoadDate) {
          // 说明是第一次加载，用sysDate时间
          firstQueryDate = sysDate;
        } else if (isNew) {
          firstQueryDate = that.data.newLoadDate;
        } else {
          firstQueryDate = that.data.oldLoadDate;
        }
        mc.queryPrivateChatList(cb1, isNew ? 10000 : 10, isNew ? 1 : messagePage, that.data.userId, firstQueryDate, isNew);
      }
    })
  },

  // 转化消息列表创建消息
  speak(list, isNew) {
    let messages = [];
    list.forEach(function (e) {
      const { commentsContent, userId, commentsTime, usersVo, leaveCommentsId } = e;
      if (userId == this.data.userId || userId === app.globalData.userInfo.userId) {
        usersVo.userId = userId;
        const message = createUserMessage(commentsContent, usersVo, commentsTime, userId === app.globalData.userInfo.userId)
        if (isNew)
          this.pushMessage(message);
        else
          this.unshiftMessage(message);
      }
    }, this);
  },

  /**
   * 通用更新当前消息集合的方法
   */
  updateMessages(updater) {
    var messages = this.data.messages;
    updater(messages);

    this.setData({ messages });
    // console.log(messages)

    // 需要先更新 messagess 数据后再设置滚动位置，否则不能生效
    var lastMessageId = messages.length ? messages[messages.length - 1].id : 'none';
    this.setData({ lastMessageId });
  },

  /**
   * 追加一条新消息
   */
  pushMessage(message) {
    this.updateMessages(messages => messages.push(message));
  },

  /**
   * 加载一条历史消息
   */
  unshiftMessage(message) {
    this.updateMessages(messages => messages.unshift(message));
  },

  /**
   * 替换上一条消息
   */
  amendMessage(message) {
    this.updateMessages(messages => messages.splice(-1, 1, message));
  },

  /**
   * 删除上一条消息
   */
  popMessage() {
    this.updateMessages(messages => messages.pop());
  },

  /**
   * 用户输入的内容改变之后
   */
  changeInputContent(e) {
    this.setData({ inputContent: e.detail.value });
  },

  /**
   * 点击「发送」按钮，通过信道推送消息到服务器
   **/
  sendMessage(e) {
    console.log('发送');
    const that = this;
    if (this.data.isClick) return;
    this.setData({ isClick: true })
    const cb = () => {
      that.setData({ isClick: false })
    }
    if (this.data.inputContent && !this.data.showLoading) {
      const cb1 = (data) => {
        that.setData({ inputContent: '' });
        that.loadMore(cb, 1);
      };
      mc.saveLeaveComment(cb1, cb, this.data.userId, this.data.inputContent);
    } else {
      cb();
    }
  },

  // 加载历史消息
  loadOldData() {
    if (!this.data.showLoading) {
      this.loadMore();
    }
  },

  // 定时器
  a() {
    const that = this;
    const Interval = setInterval(function () {
      if (that.data.isClick) return;
      that.setData({ isClick: true })
      that.loadMore(function () {
        that.setData({ isClick: false })
      }, 1);
    }, 15000)
    this.setData({ Interval })
  },

  // 查看用户个人主页
  toUserHome(e) {
    const userId = e.currentTarget.dataset.id;
    const isMe = e.currentTarget.dataset.isme;
    if (!isMe) {
      my.redirectTo({
        url: '/pages/user/display/display?userId=' + userId,
      });
    }
  }



});