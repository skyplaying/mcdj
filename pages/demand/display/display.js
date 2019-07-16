

import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;
let isUserVo, isPetList;
Page({
  data: {
    petTypeList: ['小型犬', '中型犬', '大型犬', '猫咪'],  //宠物类型列表
  },

  // 页面启动的初始化
  initialization() {
    const that = this;
    // 当前的日期
    my.getServerTime({
      success: (res) => {
        const nowDate = utils.formatTimestamp(res.time).split(' ')[0];
        that.setData({ nowDate });
      },
    });
  },

  onLoad(options) {
    const that = this;
    // options.fosterDemandId = 18;
    const fosterDemandId = options.fosterDemandId || 37;

    const location = app.globalData.location || mcdj.getStorageSync(app.storagekey.locationKey) || {};

    this.setData({
      fosterDemandId,
      latPoint: location.latitude,
      lngPoint: location.longitude,
    });
  },

  onShow() {
    const that = this;
    if (!isNoFirst) {
      isNoFirst = true;
      app.globalData.isAnew = 0;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo
          })
          that.initialization();
          that.queryAnswerList();
          that.queryRecFamilyList();
          that.demandInfo();
        }
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.queryAnswerList();
    this.queryRecFamilyList();
    this.demandInfo();
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 获取需求信息
  demandInfo() {
    const that = this;
    const fosterDemandId = this.data.fosterDemandId;
    const addressLng = this.data.lngPoint || null;
    const addressLat = this.data.latPoint || null;
    mcdj.demandInfo({
      fosterDemandId,
      addressLng,
      addressLat,
      success(data) {
        const demandVo = data.demandVo;
        const petAvatarList = demandVo.petAvatar ? demandVo.petAvatar.split(',') : [];

        that.setData({
          demandVo, petAvatarList, isok: true
        });
      }
    });
  },

  // 应答家庭列表
  queryAnswerList() {
    const that = this;
    const fosterDemandId = this.data.fosterDemandId;
    mcdj.queryAnswerListByDemand({
      pageSize: 100, fosterDemandId,
      success(data) {
        const answerList = data.results;
        answerList.map((item) => {
          const addressName = item.address.split(':')[1] || item.address;
          item.address = addressName;
          return item
        })
        const answerTotal = data.total;
        console.log(answerList);
        that.setData({ answerList, answerTotal });
      }
    });
  },

  // 推荐家庭列表
  queryRecFamilyList() {
    const that = this;
    const fosterDemandId = this.data.fosterDemandId;
    mcdj.queryRecFamilyList({
      pageSize: 100, fosterDemandId,
      success(data) {
        const recFamilyList = data.results;
        recFamilyList.map((item) => {
          const addressName = item.address.split(':')[1] || item.address;
          item.address = addressName;
          return item
        })
        console.log(recFamilyList);
        that.setData({ recFamilyList });
      }
    });
  },

  // 关闭需求
  closeDemand() {
    const that = this;
    my.confirm({
      content: '是否要关闭需求？',
      success(res) {
        if (res.confirm) {
          const fosterDemandId = that.data.fosterDemandId;
          mcdj.showLoading('关闭中');
          mcdj.closeDemand({
            fosterDemandId,
            success(data) {
              my.hideLoading();
              mcdj.showToast('已关闭', 3, null, function () {
                app.doLogin({
                  anew: 1,
                  success() {
                    my.navigateBack();
                  }
                })
              });
            }
          })
        }
      },
    });
  },

  // 联系对方
  chat() {
    const userId = this.data.demandVo.usersVo.userId;
    const userName = this.data.demandVo.usersVo.nickName;

    my.navigateTo({
      url: `/pages/news/display/display?userId=${userId}&userName=${userName}`
    });
  },

  // 应答需求
  demandAnser() {
    const that = this;
    if (this.data.userInfo.userCertifiedStatus == 0) {
      mcdj.alert('您的家庭还在审核中，请耐心等待');
    } else if (this.data.userInfo.userCertifiedStatus == 2) {
      mcdj.alert('您的家庭审核没通过，请重新提交资料', function () {
        my.navigateTo({
          url: '/pages/family/flow/flow'
        });
      });
    } else if (!this.data.userInfo.userCertifiedStatus) {
      mcdj.alert('请先申请寄养家庭再邀请', function () {
        my.navigateTo({
          url: '/pages/family/flow/flow'
        });
      });
    } else if (this.data.userInfo.userCertifiedStatus == 1) {
      const fosterDemandId = that.data.fosterDemandId;
      mcdj.showLoading('邀请中');
      mcdj.demandAnser({
        fosterDemandId,
        success(data) {
          my.hideLoading();
          mcdj.showToast('已邀请', 3);
          that.setData({
            isAnswer: 1
          })
        }
      })
    }
  },

  // 去家庭
  toFamilyDisplay(e) {
    const userId = e.currentTarget.dataset.id;
    my.navigateTo({
      url: '/pages/family/display/display?userId=' + userId
    });
  },

  // 寄他家
  toFosterageFound(e) {
    const index = e.currentTarget.dataset.index;
    const userId = this.data.answerList[index].userId;
    console.log(this.data.demandVo)
    const { startTime, endTime, fosterNum, remarks } = this.data.demandVo;
    const startStr = this.getDateStr(startTime.split('-'));
    const endStr = this.getDateStr(endTime.split('-'));
    const countDay = fosterNum;
    const category = 2;
    const maxNum = 10000;
    const fosterDescribe = remarks;
    const fosterFoundObj = JSON.stringify({ userId, startTime, endTime, startStr, endStr, countDay, category, maxNum, fosterDescribe });
    my.redirectTo({
      url: `/pages/fosterage/found/found?obj=${fosterFoundObj}`
    })
  },
  getDateStr(date) {
    const time = new Date(date);
    const day = Math.ceil((time - new Date(this.data.nowDate)) / 86400000) || 0;
    let str = day > 2 ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][time.getDay()] : ['今天', '明天', '后天'][day];
    return str;
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },


});
