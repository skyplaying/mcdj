
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';
const app = getApp();

let isNoFirst, isclick;
let checkNum = 0;
Page({
  data: {
    isAgree: true,
  },

  onLoad(options) {
    const that = this;
    //fosterFoundObj={ userId, startTime, endTime, startStr, endStr, countDay, category, maxNum }
    // category：0是猫1是狗2是全部 maxNum:最大可寄养数（不限可传10000）
    const fosterFoundObj = JSON.parse(options.obj);
    that.setData(fosterFoundObj)
    console.log(this.data)
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
          that.getKeepPet();
          that.getPetList();
        }
      })
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
      success(petArr) {
        const petList = [];
        for (let i in petArr) {
          if (category == 0 && petArr[i].petVarietyVo.varietyType == 3)
            petList.push(petArr[i]);
          else if (category == 1 && petArr[i].petVarietyVo.varietyType < 3)
            petList.push(petArr[i]);
          else if (category == 2)
            petList.push(petArr[i]);
        }
        that.setData({
          petList,
          isok: true
        })
      }
    });
  },

  // 获取寄养家庭资料
  getKeepPet() {
    const that = this;
    const userId = this.data.userId;
    mcdj.getKeepPet({
      userId,
      success(data) {
        const priceList = data.userVo.adoptionVo.priceList;
        const petTypeList = [];
        for (let i in priceList) {
          petTypeList.push(priceList[i].petType);
        }
        that.setData({
          priceList, petTypeList
        });
      }
    });
  },

  // 选择要寄养的宠物
  selectPet(e) {
    const { currentTarget: { dataset: { index } } } = e;
    const petList = this.data.petList || [];
    const petTypeList = this.data.petTypeList || [];
    const category = this.data.category;
    const maxNum = this.data.maxNum;
    if (checkNum >= maxNum && !petList[index].check) {
      mcdj.showToast(`可寄养的${category == 0 ? '猫猫' : '狗狗'}数量不足`, 3);
      return
      // } else if (petList[index].petStatus != 0) {
      //   mcdj.showToast('该宠物有未完成的订单，请到我的订单中查看', 3);
      //   return
    } else if (petTypeList.indexOf(petList[index].petVarietyVo.varietyType) < 0) {
      mcdj.showToast('当前家庭不支持该类宠物寄养', 3);
      return
    }
    petList[index].check = !petList[index].check;
    checkNum = checkNum + (petList[index].check ? 1 : -1);
    // console.log(petList);
    this.setData({ petList });
    this.countPrice();
  },

  // 计算价格
  countPrice() {
    const { countDay, petList, priceList } = this.data;
    // console.log(priceList)
    let totalPrice = 0;
    const petIds = [];
    for (let i in petList) {
      if (petList[i].check) {
        for (let j in priceList) {
          if (petList[i].petVarietyVo.varietyType == priceList[j].petType) {
            totalPrice += parseFloat(priceList[j].fosterAmount);
            petIds.push(petList[i].petId);
          }
        }
      }
    }
    if (!petIds || petIds.length == 0 || !countDay) {
      this.setData({
        couponList: null, couponIndex: null, totalPrice: 0
      })
      return
    };
    this.setData({
      petIds
    })
    // console.log((totalPrice * countDay))
    totalPrice = totalPrice * countDay;
    this.myCouponList(totalPrice);
  },

  // 获取我可以的优惠券列表
  myCouponList(totalPrice) {
    const that = this;
    const gtAmount = totalPrice || 0;
    mcdj.myCouponList({
      pageSize: 100, couponStatus: 1, gtAmount,
      success(data) {
        const couponList = data.results;
        let couponIndex = null;
        if (couponList && couponList.length > 0) {
          couponIndex = "0";
        }
        const couponAmount = couponIndex ? couponList[couponIndex].couponVo.couponAmount : 0;
        console.log(parseFloat(couponAmount))
        totalPrice = (totalPrice - parseFloat(couponAmount)).toFixed(2);
        that.setData({
          couponList, couponIndex, totalPrice
        })
      }
    });
  },

  // 备注
  inputDescribe(e) {
    this.setData({
      fosterDescribe: e.detail.value
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
    // const { currentTarget: { dataset: { index } } } = e;
    // this.setData({
    //   couponIndex: index.toString()
    // })
    // this.countPrice();
    this.showCoupon();
  },

  // 宠物责任险
  petInsurance() {
    my.call('startApp', {
      appId: '20000936',
      param: {
        url: '/www/new-order.html?bizScenario=xcx&prodId=F0050000000000001663',
        transparentTitle: 'auto',
        scrollDistance: 80,
        canDestroy: 'NO',
      }
    });
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

    if (!d.startTime) {
      mcdj.alert('请选择起始日期');
    } else if (!d.endTime) {
      mcdj.alert('请选择终止日期');
    } else if (!d.petIds || d.petIds.length === 0) {
      mcdj.alert('请选中您要寄养的宠物');
    } else {
      mcdj.textRiskIdentification(function () {
        if (isclick) return;
        isclick = true;
        that.submitFosterOrder();
      }, d.fosterDescribe, '备注')
    }
  },

  // 发布寄养
  submitFosterOrder() {
    const that = this;
    const d = this.data;
    const petIds = d.petIds.join(',');

    const data = {
      fosterUserId: d.userId,
      petIds,
      remark: d.fosterDescribe,
      couponConsumeId: this.data.couponIndex ? this.data.couponList[this.data.couponIndex].couponConsumeId : null,
      startTime: d.startTime.split('-').join('/'),
      endTime: d.endTime.split('-').join('/'),
    };
    mcdj.showLoading();
    new Promise(function (resolve, reject) {
      mcdj.submitFosterOrder({
        data,
        success(data) {
          const fosterOrderId = data.fosterOrderId;
          const orderStr = data.orderStr;
          that.setData({
            fosterOrderId
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
          url: '../display/display?fosterOrderId=' + that.data.fosterOrderId,
        });
      })
      my.hideLoading();
      isclick = false;
    }, function () {
      if (that.data.fosterOrderId) {
        setTimeout(function () {
          my.redirectTo({
            url: '../display/display?fosterOrderId=' + that.data.fosterOrderId,
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
