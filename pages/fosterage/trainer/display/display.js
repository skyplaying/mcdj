

import mcdj from '../../../../others/js/interface_mc';
import utils from '../../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},

  onLoad(options) {
    const that = this;
    const trainOrderId = options.trainOrderId || 4;
    this.setData({ trainOrderId });
    this.init();
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
          that.orderInfo();
        }
      })
    } else {
      that.orderInfo();
    }
  },

  onPullDownRefresh() {
    console.log('onPullDownRefresh')
    this.orderInfo();
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 页面启动的初始化
  init() {
    const that = this;
    // 当前的日期
    my.getServerTime({
      success: (res) => {
        const nowDate = utils.formatTimestamp(res.time).split(' ')[0];
        that.setData({ nowDate });
      },
    });
  },

  // 订单详情
  orderInfo() {
    const that = this;
    my.showNavigationBarLoading();
    const trainOrderId = this.data.trainOrderId;
    mcdj.trainOrderInfo({
      trainOrderId,
      success(data) {
        const trainOrderVo = data.trainOrderVo;

        that.setData({
          trainOrderVo,
          isok: true,
        });
        my.hideNavigationBarLoading();
        my.stopPullDownRefresh();
      }
    });
  },

  // 留言
  leaveWord() {
    const usersVo = this.data.trainOrderVo.usersVo;
    my.navigateTo({
      url: `/pages/news/display/display?userId=${usersVo.userId}&userName=${usersVo.nickName}`
    });
  },

  // 拨打电话
  dialing() {
    const number = this.data.trainOrderVo.usersVo.phoneNumber;
    my.makePhoneCall({ number });
  },

  // 付款
  pay() {
    const that = this;
    const trainOrderId = this.data.trainOrderId;
    mcdj.showLoading();
    new Promise(function (resolve, reject) {
      mcdj.subimtTrainOrder({
        data: { trainOrderId },
        success(data) {
          const orderStr = data.orderStr;
          resolve(orderStr);
        }, fail() {
          reject();
        }
      })
    }).then((orderStr) => {
      return new Promise(function (resolve, reject) {
        mcdj.tradePay({
          orderStr,
          success() {
            resolve();
          }, fail() {
            reject();
          }
        });
      })
    }).then(function () {
      isclick = false;
      my.hideLoading();
      mcdj.showToast('支付成功', 3);
      that.orderInfo();
    }, function () {
      my.hideLoading();
      isclick = false;
    })
  },

  // 取消订单
  cancelOrder(e) {
    const that = this;
    mcdj.confirm(function () {
      mcdj.showLoading();
      const trainOrderId = that.data.trainOrderId;
      mcdj.cancelTrainOrder({
        trainOrderId,
        success(data) {
          my.hideLoading();
          mcdj.showToast('订单已关闭', 3);
          that.orderInfo();
        }
      });
    }, '是否确认取消订单？');
  },

  // 服务码输入悬浮框
  showPassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 取消输入服务码
  hidPassword() {
    this.setData({
      showPassword: !this.data.showPassword, serviceCode: null
    })
  },

  // 输入服务码
  inputPassword(e) {
    this.setData({
      serviceCode: e.detail.value
    })
  },

  // 开始训练
  startTrainOrder() {
    const that = this;
    if (!that.data.serviceCode) return;
    if (isclick) return;
    isclick = true;

    const trainOrderId = that.data.trainOrderId;
    const serviceCode = that.data.serviceCode;
    mcdj.showLoading();
    mcdj.startTrainOrder({
      trainOrderId, serviceCode,
      success() {
        isclick = false;
        my.hideLoading();
        mcdj.showToast('开始训练咯', 3);
        that.orderInfo();
        that.hidPassword();
      }, fail() {
        isclick = false;
      }
    })
  },

  // 完成训宠订单
  finishTrainOrder() {
    const that = this;
    const trainOrderId = this.data.trainOrderId;
    my.confirm({
      title: "接宠提示",
      content: "你是否确认已经接到宠物，完成了此次训练？",
      success(res) {
        if (res.confirm) {
          mcdj.showLoading();
          mcdj.finishTrainOrder({
            trainOrderId,
            success(data) {
              my.hideLoading();
              mcdj.showToast('订单已完成', 3);
              that.orderInfo();
            }
          });
        }
      }
    })
  },

  // 发布评价
  toCommentFound() {
    my.navigateTo({
      url: "/pages/comment/trainer/found/found?trainOrderId=" + this.data.trainOrderId
    });
  },

  // 查看评价
  toCommentDisplay() {
    my.navigateTo({
      url: "/pages/comment/trainer/display/display?trainOrderId=" + this.data.trainOrderId
    });
  },

  // 查看宠物
  toPet(e) {
    const petId = e.currentTarget.dataset.id;
    my.navigateTo({
      url: "/pages/pet/display/display?petId=" + petId
    })
  },

  // 打开地址位置
  openLocation() {
    const d = this.data.trainOrderVo.usersVo;
    if (!my.canIUse('openLocation')) {
      mcdj.showToast('该版本不支持openLocation', 3);
      return;
    } else if (!d.address || !d.addressLng || !d.addressLat) {
      return;
    }
    const addressStr = d.address.split('-')[0];
    const address = addressStr.split(':')[0];
    const name = addressStr.split(':')[1] || '家庭地址';
    console.log(name)
    console.log(address)
    console.log(d.addressLng)
    console.log(d.addressLat)
    my.openLocation({
      longitude: d.addressLng,
      latitude: d.addressLat,
      name,
      address,
    });
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },


});
