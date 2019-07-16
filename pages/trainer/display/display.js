

import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},
  onLoad(options) {
    const that = this;
    const trainServiceId = options.trainServiceId || null;

    this.setData({ trainServiceId, isShowToIndex: getCurrentPages().length === 1 });
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const that = this;
    if (!isNoFirst || !this.data.userInfo) {
      isNoFirst = true;
      app.globalData.isAnew = 0;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo
          })
          that.trainServiceInfo(function () {
            that.queryTrainServiceList();
          });
          that.queryServiceCommentList();
        }, fail() {
          that.setData({ isNoAuth: true, isok: false });
        }
      })
    } else {
      that.trainServiceInfo();
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 获取训练服务详情
  trainServiceInfo(cb) {
    const that = this;
    const trainServiceId = this.data.trainServiceId;
    mcdj.trainServiceInfo({
      trainServiceId,
      success(data) {
        const trainServiceVo = data.trainServiceVo || {};
        console.log(trainServiceVo);
        // trainServiceVo.serviceScore = 5.0;
        // 描述的图片
        const petPhoto = trainServiceVo.servicePath ? trainServiceVo.servicePath.split(',') : [];
        // 备注说明
        const remarks = trainServiceVo.remark ? trainServiceVo.remark.split(',') : [];

        that.setData({
          isok: true,
          trainServiceVo,
          petPhoto,
          remarks,
        });
        typeof cb == "function" && cb();
      }
    });
  },

  // 获取评论
  queryServiceCommentList() {
    const that = this;
    const trainServiceId = this.data.trainServiceId;
    mcdj.queryServiceCommentList({
      trainServiceId, pageSize: 1,
      success(data) {
        const commentList = data.results;
        const noMoreComment = data.noMore;
        const commentTotal = data.total;
        that.setData({
          commentList, noMoreComment, commentTotal
        })
      }
    })
  },

  // 获取服务列表
  queryTrainServiceList() {
    const that = this;
    const trainServiceId = this.data.trainServiceId;
    const userId = this.data.trainServiceVo.usersVo.userId;
    mcdj.queryTrainServiceList({
      userId, trainServiceId, pageSize: 1,
      success(data) {
        const listServer = data.results;
        const noMoreServer = data.noMore;
        const serverTotal = data.total;
        that.setData({
          listServer, noMoreServer, serverTotal
        })
      }
    })
  },

  // 预览图片
  previewImage(e) {
    const that = this;
    const { currentTarget: { dataset: { index } } } = e;
    my.previewImage({
      current: index,
      urls: that.data.petPhoto,
    });
  },

  // 查看所有评论
  toCommentList() {
    const trainServiceId = this.data.trainServiceId;
    my.navigateTo({
      url: `/pages/comment/trainer/list/list?userId=${trainServiceId}`
    });
  },

  // 展示全部服务内容
  showAllDescribe() {
    this.setData({
      isShowAllDescribe: !this.data.isShowAllDescribe
    })
  },

  // 留言
  leaveWord() {
    const trainServiceVo = this.data.trainServiceVo;
    if (trainServiceVo.usersVo.userId == this.data.userInfo.userId) {
      mcdj.showToast('不可以和自己联系', 2);
      return;
    }
    my.navigateTo({
      url: `/pages/news/display/display?userId=${trainServiceVo.usersVo.userId}&userName=${trainServiceVo.usersVo.nickName}`
    });
  },

  // 下单
  toFosterage(e) {
    const trainServiceVo = this.data.trainServiceVo;
    if (trainServiceVo.usersVo.userId == this.data.userInfo.userId) {
      mcdj.showToast('不可以给自己下单', 2);
      return;
    }
    const trainServiceId = this.data.trainServiceId;
    my.navigateTo({
      url: `/pages/fosterage/trainer/found/found?trainServiceId=${trainServiceId}`
    })
  },

  // 查看用户主页
  toPersonal(e) {
    const userId = this.data.trainServiceVo.usersVo.userId;
    my.navigateTo({
      url: `/pages/personal/display/display?userId=${userId}`
    })
  },

  // 服务详情
  toServerDisplay(e) {
    console.log(e.currentTarget.dataset.index);
    const index = e.currentTarget.dataset.index;
    const listServer = this.data.listServer;
    if (listServer[index].serviceType == 1) {
      my.redirectTo({
        url: "/pages/family/display/display?userId=" + listServer[index].trainServiceId
      })
    } else if (listServer[index].serviceType == 2) {
      my.redirectTo({
        url: "/pages/trainer/display/display?trainServiceId=" + listServer[index].trainServiceId
      })
    }
  },

  // 分享
  onShareAppMessage() {
    const trainServiceVo = this.data.trainServiceVo;
    const nickName = trainServiceVo.usersVo.nickName;
    const itemName = trainServiceVo.itemName;
    return {
      title: `哈喽，我是训宠师${nickName}`,
      desc: `把您家主子交给我，我能提供${nickName}服务，教会你家主子哟。`,
      path: `pages/trainer/display/display?trainServiceId=${this.data.trainServiceId}`
    };
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },


});
