import mcdj from '../../../others/js/interface_mc';

const app = getApp();
let isNoFirst, isclick;

Page({
  data: {},
  onLoad() {
    const that = this;
    app.doLogin({
      loginType: "0",
      success(userInfo) {
        that.setData({
          isok: true
        })
        that.myInsureList();
      }
    })

    if (my.isFavorite) {
      my.isFavorite({
        success: (res) => {
          that.setData({
            isFavorite: res && res.isFavorite ? true : false
          })
        }
      });
    }
  },
  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 我的列表
  myInsureList() {
    const that = this;
    my.showNavigationBarLoading();
    mcdj.myInsureList({
      success(data) {
        const myInsureList = data.insureList;
        console.log(myInsureList)
        that.setData({
          myInsureList,
        });
        my.hideNavigationBarLoading();
      }
    });
  },

  // 申请
  toIntroduce() {
    my.navigateTo({
      url: "../introduce/introduce"
    });
  },

  // 医院列表
  toHospital() {
    my.navigateTo({
      url: `/pages/insurance/hospitalList/hospitalList`
    })
  },

  // 在线理赔
  toCompensate() {
    if (!this.data.myInsureList || this.data.myInsureList.length == 0) {
      mcdj.alert('您还没有宠物申请过医保，请先前往申请');
      return;
    }
    const src = "https://api.pet-city.cn/h5/cardapply/login";
    my.navigateTo({
      url: `/pages/colligate/webview/webview?src=${src}`
    })
  },

  // 领取卡劵
  receiveCardBag() {
    if (isclick) return;
    isclick = true;
    mcdj.showLoading('请稍等');
    mcdj.recCoupon({
      success(data) {
        const pageSrc = data.pageSrc;
        my.call('startApp', {
          appId: '20000067',
          param: {
            url: pageSrc
          }
        });
        isclick = false;
        my.hideLoading();
      }, fail() {
        isclick = false;
      }
    })
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
