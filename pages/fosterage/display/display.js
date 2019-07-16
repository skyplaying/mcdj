

import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},

  onLoad(options) {
    const that = this;
    const fosterOrderId = options.fosterOrderId || 25;
    this.setData({ fosterOrderId });
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
          that.fosterOrderInfo();
        }
      })
    } else {
      that.fosterOrderInfo();
    }
  },

  onPullDownRefresh() {
    console.log('onPullDownRefresh')
    this.fosterOrderInfo();
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
  fosterOrderInfo() {
    const that = this;
    my.showNavigationBarLoading();
    const fosterOrderId = this.data.fosterOrderId;
    mcdj.fosterOrderInfo({
      fosterOrderId,
      success(data) {
        const fosterOrderVo = data.fosterOrderVo;
        //距离寄养结束的天数
        const expireDay = (new Date(fosterOrderVo.endTime.split('/').join('-')) - new Date(that.data.nowDate)) / (1000 * 60 * 60 * 24);

        const userInfo = that.data.userInfo;
        // 订单信息是否显示取消寄养
        const infoIsCanCancel = (userInfo.userId == fosterOrderVo.fosterUserId && fosterOrderVo.fosterStatus == 3) || (userInfo.userId == fosterOrderVo.userId && fosterOrderVo.fosterStatus >= 1 && fosterOrderVo.fosterStatus <= 3);
        // 订单信息是否显示提前完成
        const infoIsAdvanceFinish = fosterOrderVo.fosterStatus==4 && userInfo.userId==fosterOrderVo.fosterUserId && expireDay>0 && (!fosterOrderVo.handleAmount || fosterOrderVo.handleAmount<0);

        that.setData({
          fosterOrderVo,
          expireDay,
          infoIsCanCancel,
          infoIsAdvanceFinish,
          isok: true,
        });
        my.hideNavigationBarLoading();
        my.stopPullDownRefresh();
      }
    });
  },

  // 留言
  leaveWord() {
    const usersVo = this.data.fosterOrderVo.usersVo;
    my.navigateTo({
      url: `/pages/news/display/display?userId=${usersVo.userId}&userName=${usersVo.nickName}`
    });
  },

  // 拨打电话
  dialing() {
    const number = this.data.fosterOrderVo.usersVo.phoneNumber;
    my.makePhoneCall({ number });
  },

  // 付款
  pay() {
    const that = this;
    const fosterOrderId = this.data.fosterOrderId;
    mcdj.showLoading();
    new Promise(function (resolve, reject) {
      mcdj.submitFosterOrder({
        data: { fosterOrderId },
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
      that.fosterOrderInfo();
    }, function () {
      my.hideLoading();
      isclick = false;
    })
  },

  // 取消寄养、拒绝预定
  cancelOrder(e) {
    const that = this;
    mcdj.confirm(function () {
      mcdj.showLoading();
      const fosterOrderId = that.data.fosterOrderId;
      mcdj.cancelOrder({
        fosterOrderId,
        success(data) {
          my.hideLoading();
          mcdj.showToast('订单已关闭', 3);
          that.fosterOrderInfo();
        }
      });
    }, '是否确认取消订单？');
  },

  // 接受预定
  confirmOrder() {
    const that = this;
    mcdj.showLoading();
    const fosterOrderId = this.data.fosterOrderId;
    mcdj.confirmOrder({
      fosterOrderId,
      success(data) {
        my.hideLoading();
        mcdj.showToast('接单成功', 3);
        that.fosterOrderInfo();
      }
    });
  },

  // 接宠照片上传悬浮框
  showPhoto() {
    this.setData({
      showPhoto: !this.data.showPhoto
    })
  },

  // 取消上传照片
  hidPhoto() {
    this.setData({
      showPhoto: !this.data.showPhoto, receivePetPicture: []
    })
  },

  // 选择宠物到家照片
  choosePetPhoto() {
    const that = this;
    const { data: { receivePetPicture } } = that;
    const length = receivePetPicture ? receivePetPicture.length : 0;
    const count = 1 - length;
    my.chooseImage({
      count,
      sourceType: ['camera'],
      success(res) {
        that.setData({
          receivePetPicture: res.apFilePaths,
          // receivePetPicture: receivePetPicture ? receivePetPicture.concat(res.apFilePaths) : res.apFilePaths,
        });
      },
    })
  },

  // 接到宠物
  receivedPet() {
    const that = this;
    if (!that.data.receivePetPicture || that.data.receivePetPicture.length == 0) return;
    if (isclick) return;
    isclick = true;

    // 文件上传
    let urls = utils.formatFilePath("receivePetPicture", that.data.receivePetPicture, { dirmkStr: 'fosterOrder/receivePetPicture', "userId": that.data.userInfo.userId });

    mcdj.uploadFile({
      urls,
      success(data) {
        console.log(data)
        let receivePetPicture = null;
        if (that.data.receivePetPicture && that.data.receivePetPicture.length > 0)
          receivePetPicture = data['receivePetPicture'].join(",");
        if (receivePetPicture) {
          const fosterOrderId = that.data.fosterOrderId;
          mcdj.showLoading();
          mcdj.receivedPet({
            fosterOrderId, receivePetPicture,
            success() {
              isclick = false;
              my.hideLoading();
              mcdj.showToast('保存成功', 3);
              that.fosterOrderInfo();
              that.hidPhoto();
            }, fail() {
              isclick = false;
            }
          })
        }
      },
      fail() {
        isclick = false;
      }
    })
  },

  // 家庭点击提前完成
  advanceFinish() {
    my.navigateTo({
      url: `../advanceFinish/advanceFinish?fosterOrderId=${this.data.fosterOrderId}&amount=${this.data.fosterOrderVo.payableAmount}`
    });
  },

  // 主人提前完成提示
  masterAdvanceFinishMsg() {
    const that = this;
    const fosterOrderVo = this.data.fosterOrderVo;
    // 已寄养的天数
    const pastDay = (new Date(that.data.nowDate) - new Date(fosterOrderVo.startTime.split('/').join('-'))) / (1000 * 60 * 60 * 24) || 1;
    // 剩余天数
    const surplusDay = parseInt(fosterOrderVo.fosterNum) - pastDay;
    // 一天的价格
    const dayAmount = parseFloat((fosterOrderVo.orderAmount)) / parseInt(fosterOrderVo.fosterNum);
    //剩余金额
    let surplusAmount = surplusDay * dayAmount - fosterOrderVo.discountAmount;
    surplusAmount = surplusAmount > 0 ? surplusAmount : 0;
    // 应退金额
    const refundAmount = (surplusAmount * 0.9).toFixed(2);
    my.confirm({
      title: '温馨提示',
      content: `距离您寄养结束还有${this.data.expireDay}天,可退款的天数${surplusDay}天，提前完成将退款${refundAmount}元（优惠券金额将不生效，且需扣取剩余金额10%违约金），是否确认？`,
      success(res) {
        if (res.confirm) {
          that.setData({
            refundAmount
          })
          that.showPassword();
        }
      },
    });
  },

  // 口令输入悬浮框
  showPassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 取消输入口令
  hidPassword() {
    this.setData({
      showPassword: !this.data.showPassword, finishPwd: null
    })
  },

  // 输入口令
  inputPassword(e) {
    this.setData({
      finishPwd: e.detail.value
    })
  },

  // 完成寄养订单
  finishOrder() {
    const that = this;
    if (!that.data.finishPwd) return;
    if (isclick) return;
    isclick = true;

    const fosterOrderId = that.data.fosterOrderId;
    const finishPwd = that.data.finishPwd;
    mcdj.showLoading();
    mcdj.finishOrder({
      fosterOrderId, finishPwd,
      success() {
        isclick = false;
        my.hideLoading();
        mcdj.showToast('订单已完成', 3);
        that.fosterOrderInfo();
        that.hidPassword();
      }, fail() {
        isclick = false;
      }
    })
  },

  // 主人提前完成寄养订单
  masterAdvanceFinish() {
    const that = this;
    if (!that.data.finishPwd) return;
    if (isclick) return;
    isclick = true;

    const fosterOrderId = that.data.fosterOrderId;
    const finishPwd = that.data.finishPwd;
    mcdj.showLoading();
    mcdj.advanceFinishOrder({
      data: { fosterOrderId, finishPwd },
      success(data) {
        my.hideLoading();
        isclick = false;
        mcdj.showToast('订单已完成', 3);
        that.fosterOrderInfo();
        that.hidPassword();
      }, fail() {
        isclick = false;
      }
    })
  },

  // 发布评价
  toCommentFound() {
    my.navigateTo({
      url: "/pages/comment/found/found?fosterOrderId=" + this.data.fosterOrderId
    });
  },

  // 查看评价
  toCommentDisplay() {
    my.navigateTo({
      url: "/pages/comment/display/display?fosterOrderId=" + this.data.fosterOrderId
    });
  },

  // 查看宠物
  toPet(e) {
    const petId = e.currentTarget.dataset.id;
    my.navigateTo({
      url: "/pages/pet/display/display?petId=" + petId
    })
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },


});
