

import mc from '../../../others/js/weui_mc';
const app = getApp();
let isclick;
Page({
  data: {},

  onShow() {
    this.checkIsChange();
  },

  toIndex() {
    my.switchTab({
      url: '/pages/index/index',
    });
  },

  //领取详情
  checkIsChange() {
    const that = this;
    my.showNavigationBarLoading();
    new Promise(function (resolve, reject) {
      mc.checkIsChange({
        success(res) {
          const resultCode = res.data.resultCode;
          if (resultCode == 'Y') {  //领取成功
            that.setData({ info: res.data, isok: true });
            resolve(res.data);
          } else {
            reject(res.data.resultMsg);
          }
        }, fail(err) {
          reject(`错误${err.error}`);
        }
      })
    }).then(function () {
      my.hideNavigationBarLoading();
    }, function (err) {
      mc.showToast(err, 3, 3000);
      my.hideNavigationBarLoading();
    })
  },


  // 领取
  receive() {
    const that = this;
    if (this.data.info.isReceive == 0) {  //还没有发布的寄养，不可领取
      my.confirm({
        content: '您需要先发布寄养信息，才可领取保险',
        success: (res) => {
          if (res.confirm) {
            my.navigateTo({ url: '/pages/found/fosterage/fosterage' });
          }
        },
        confirmButtonText: '去发布',
      });
      return;
    }

    if (isclick) return;
    isclick = true;
    mc.showLoading('领取中...');
    new Promise(function (resolve, reject) {
      mc.receiveGift({
        success(res) {
          const resultCode = res.data.resultCode;
          if (resultCode == 'Y') {  //领取成功
            that.checkIsChange();
            that.showFictitiousCode();
            resolve();
          } else {
            reject(res.data.resultMsg);
          }
        }, fail(err) {
          reject(`错误${err.error}`);
        }
      })
    }).then(function () {
      isclick = false;
      my.hideLoading();
    }, function (err) {
      mc.showToast(err, 3, 3000);
      isclick = false;
      my.hideLoading();
    })


  },

  // 复制
  setClipboardCode() {
    const code = this.data.info.redeemCode;
    my.setClipboard({
      text: code, // 剪贴板数据
      success: (res) => {
        mc.showToast('复制成功', 3);
      },
    });
  },

  // 显示兑换码浮层
  showFictitiousCode() {
    this.setData({ isShowFictitiousCode: !this.data.isShowFictitiousCode });
  }

});
