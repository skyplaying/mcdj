
import mcdj from '../../../../others/js/interface_mc';
import utils from '../../../../others/js/utils';
const app = getApp();

let isNoFirst, isclick;
let checkNum = 0;
Page({
  data: {
    isAgree: true,
    modeArr: ['寄养训练', '上门训练'],

    addressKey: 'address',
  },

  onLoad(options) {
    const that = this;
    const trainServiceId = options.trainServiceId || 9;
    that.setData({ trainServiceId })
  },

  onShow() {
    const that = this;
    const isNoAnewMyPetList = mcdj.getStorageSync('isNoAnewMyPetList');
    if (!isNoFirst || !isNoAnewMyPetList) {
      isNoFirst = true;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo
          })
          that.trainServiceInfo();
          that.getPetList();
        }
      })
    } else {
      // 获取联系地址
      const addressObj = mcdj.getStorageSync(that.data.addressKey) || '';
      console.log(addressObj);
      if (addressObj) {
        const address = addressObj.commonAddress;
        const addressName = address.split(':')[1];
        const lngPoint = addressObj.lngPoint;
        const latPoint = addressObj.latPoint;
        that.setData({ address, addressName, latPoint, lngPoint });
        that.countCost();
        mcdj.removeStorageSync(that.data.addressKey);
      }
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined, checkNum = 0;
  },

  // 获取我空闲的宠物列表
  getPetList() {
    const that = this;
    const category = that.data.category;
    mcdj.myPets({
      petStatus: 0,
      success(petList) {
        that.setData({
          petList,
          isok: true
        })
      }
    });
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
        const trainAmount = trainServiceVo.trainAmount;
        const serverImg = trainServiceVo.servicePath.split(',')[0];
        const modeArr = trainServiceVo.serviceMode == '以上均可' ? ['上门训练', '寄养训练'] : [trainServiceVo.serviceMode];
        const modeIndex = modeArr.length == 1 ? 0 : null;

        that.setData({
          isok: true,
          trainServiceVo,
          trainAmount,
          serverImg,
          modeArr,
          modeIndex,
        });
        typeof cb == "function" && cb();
      }
    });
  },

  // 选择要寄养的宠物
  selectPet(e) {
    const { currentTarget: { dataset: { index } } } = e;
    const petList = this.data.petList || [];
    petList[index].check = !petList[index].check;
    // console.log(petList);
    this.setData({ petList });
    this.countPrice();
  },

  // 服务方式
  changeMode(e) {
    this.setData({
      modeIndex: e.detail.value,
    });
  },

  // 上门接送
  changeIsShuttle(e) {
    const isShuttle = e.detail.value;
    this.setData({
      isShuttle, addressName: null, lngPoint: null, latPoint: null, address: '', cost: 0,
    })
    if (!isShuttle)
      this.countPrice();
  },

  // 计算接送费
  countCost() {
    const that = this;
    const userId = this.data.trainServiceVo.usersVo.userId;
    const lngPoint = this.data.lngPoint;
    const latPoint = this.data.latPoint;
    const runAboutAmount = this.data.trainServiceVo.runAboutAmount;
    if (runAboutAmount == 0)
      this.setData({
        cost: 0
      })
    else
      mcdj.getDistance({
        userId, lngPoint, latPoint,
        success(data) {
          const distance = data.distance;
          const cost = Math.max(distance * parseFloat(runAboutAmount) * 2, 50);
          that.setData({
            distance, cost
          })
          that.countPrice();
          if (distance <= 2) {
            my.alert({
              title: "接送提醒",
              content: "您距离训练师距离在2公里内，建议送宠上门，可免除50元的接送费用"
            })
          }
        }
      })
  },

  // 计算订单价格
  countPrice() {
    const { cost, trainAmount, petList } = this.data;
    const petIds = [];
    for (let i in petList) {
      if (petList[i].check) {
        petIds.push(petList[i].petId);
      }
    }
    const totalPrice = ((trainAmount * petIds.length) + (cost || 0)).toFixed(2);
    this.setData({
      totalPrice, petIds
    })
    this.myCouponList();
  },

  // 获取我可以的优惠券列表
  myCouponList() {
    const that = this;
    const gtAmount = this.data.totalPrice || 0;
    mcdj.myCouponList({
      pageSize: 100, couponStatus: 1, gtAmount,
      success(data) {
        const couponList = data.results;
        that.setData({
          couponList
        })
      }
    });
  },

  // 备注
  inputRemark(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  // 显示优惠券
  showCoupon() {
    this.setData({
      showCoupon: !this.data.showCoupon
    })
  },

  // 选择优惠券
  couponChange(e) {
    const { currentTarget: { dataset: { index } } } = e;
    this.setData({
      couponIndex: index.toString()
    })
    this.countPrice();
    this.showCoupon();
  },

  // 是否同意
  changeAgree(e) {
    console.log('isAgree:' + this.data.isAgree)
    this.setData({
      isAgree: !this.data.isAgree,
    });
  },

  // 跳转协议
  toGuarantee(e) {
    my.navigateTo({
      url: '/pages/colligate/guarantee/guarantee?index=3',
    });
  },

  // 提交发布内容
  formSubmit(e) {
    console.log(e);
    const that = this;
    const d = this.data;
    if (!d.isAgree) { return; }

    console.log(this.data)
    if (!d.petIds || d.petIds.length == 0) {
      mcdj.alert('请选中您要寄养的宠物');
    } else if (d.modeIndex == undefined) {
      mcdj.alert('请选择服务方式');
    } else if (d.isShuttle && (!d.address || !d.lngPoint || !d.latPoint)) {
      mcdj.alert('请选择接宠地址');
    } else {
      mcdj.textRiskIdentification(function () {
        if (isclick) return;
        isclick = true;
        that.subimtTrainOrder();
      }, d.fosterDescribe, '备注')
    }
  },

  // 发布训练订单
  subimtTrainOrder() {
    const that = this;
    const d = this.data;
    const petIds = d.petIds.join(',');

    const data = {
      trainServiceId: d.trainServiceId,
      petIds,
      serviceMode: d.modeArr[d.modeIndex],
      isShuttle: d.isShuttle ? 1 : 0,
      shuttleAddress: d.address,
      shuttleLng: d.lngPoint,
      shuttleLat: d.latPoint,
      remark: d.remark,
      couponConsumeId: this.data.couponIndex ? this.data.couponList[this.data.couponIndex].couponConsumeId : null,
    };
    mcdj.showLoading();
    new Promise(function (resolve, reject) {
      mcdj.subimtTrainOrder({
        data,
        success(data) {
          const trainOrderId = data.trainOrderId;
          const orderStr = data.orderStr;
          that.setData({
            trainOrderId
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
      mcdj.showToast('下单成功', 3, null, function () {
        my.redirectTo({
          url: '../display/display?trainOrderId=' + that.data.trainOrderId,
        });
      })
      my.hideLoading();
      isclick = false;
    }, function () {
      if (that.data.trainOrderId) {
        setTimeout(function () {
          my.redirectTo({
            url: '../display/display?trainOrderId=' + that.data.trainOrderId,
          });
        }, 1500);
      }
      isclick = false;
    })
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
