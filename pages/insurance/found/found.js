
import mcdj from '../../../others/js/interface_mc';

const app = getApp();
let isNoFirst, isclick;

Page({
  data: {
    addressKey: 'address',
  },
  onLoad(options) {
    const that = this;

    const petInfo = JSON.parse(options.pet);
    console.log(petInfo)
    this.setData({
      petInfo
    })

    app.doLogin({
      success(userInfo) {
        const address = userInfo.address || '';
        const addressName = address.split(':')[1] || '';
        const latPoint = userInfo.addressLat || null;
        const lngPoint = userInfo.addressLng || null;
        mcdj.getUserMajorInfo({
          success(data) {
            const UserMajorInfo = data.userInfo;
            console.log(UserMajorInfo)
            that.setData({
              userInfo,
              userName: UserMajorInfo.userName,
              idCard: UserMajorInfo.idCard,
              phoneNumber: UserMajorInfo.phoneNumber,
              address, addressName, latPoint, lngPoint,
              isok: true
            })
          }
        })
      }
    });
  },
  onShow() {
    const that = this;
    if (isNoFirst) {
      // 获取联系地址
      const addressObj = mcdj.getStorageSync(that.data.addressKey) || '';
      console.log(addressObj);
      if (addressObj) {
        const address = addressObj.commonAddress;
        const addressName = address.split(':')[1];
        const lngPoint = addressObj.lngPoint;
        const latPoint = addressObj.latPoint;
        that.setData({ address, addressName, latPoint, lngPoint });
        mcdj.removeStorageSync(that.data.addressKey);
      }
    } else {
      isNoFirst = true;
    }
  },
  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 姓名
  inputUserName(e) {
    this.setData({ userName: e.detail.value });
  },

  // 身份证
  inputIdCard(e) {
    this.setData({ idCard: e.detail.value });
  },

  // 手机号
  inputPhoneNumber(e) {
    this.setData({ phoneNumber: e.detail.value });
  },

  // 是否同意
  changeAgree(e) {
    this.setData({
      isAgree: !this.data.isAgree,
    });
  },

  // 跳转购买须知
  toPurchaseInstructions(e) {
    my.navigateTo({
      url: '../instructions/instructions?index=1',
    });
  },

  // 跳转免责声明
  toDisclaimer(e) {
    my.navigateTo({
      url: '../instructions/instructions?index=2',
    });
  },

  // 提交发布内容
  formSubmit(e) {
    console.log(e);
    const that = this;
    const d = this.data;

    if (!d.userName) {
      mcdj.alert('请输入姓名');
    } else if (!d.idCard) {
      mcdj.alert('请输入身份证');
    } else if (!d.phoneNumber) {
      mcdj.alert('请输入手机号');
    } else if (!d.address || !d.lngPoint || !d.latPoint) {
      mcdj.alert('请选择地址'); 
    } else if (!d.isAgree) {
      mcdj.alert('请阅读并同意购买须知和免责声明');
    } else {
      if (isclick) return;
      isclick = true;
      that.saveInsure();
    }
  },

  // 发布
  saveInsure() {
    const that = this;
    const d = this.data;

    const data = {
      insureRecordId: d.insureRecordId,
      petId: d.petInfo.petId,
      userName: d.userName,
      phoneNumber: d.phoneNumber,
      idCard: d.idCard,
      address: d.address,
      addressLng: d.lngPoint,
      addressLat: d.latPoint,
    };
    mcdj.showLoading();
    new Promise(function (resolve, reject) {
      mcdj.saveInsure({
        data,
        success(data) {
          const insureRecordId = data.insureRecordId;
          const orderStr = data.orderStr;
          that.setData({
            insureRecordId
          })
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
      mcdj.showToast('投保成功', 3, null, function () {
        my.redirectTo({
          url: '../display/display?insureRecordId=' + that.data.insureRecordId,
        });
      })
      my.hideLoading();
      isclick = false;
    }, function () {
      my.hideLoading();
      isclick = false;
    })
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },



});
