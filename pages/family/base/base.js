
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;
Page({
  data: {
    catNumArr: ['0猫', '1猫', '2猫', '3猫', '4猫', '5猫', '6猫', '7猫', '8猫', '9猫', '10猫'],
    dogNumArr: ['0狗', '1狗', '2狗', '3狗', '4狗', '5狗', '6狗', '7狗', '8狗', '9狗', '10狗'],
    priceList: [{
      name: '小型犬',
      checked: 0
    }, {
      name: '中型犬',
      checked: 0
    }, {
      name: '大型犬',
      checked: 0
    }, {
      name: '猫咪',
      checked: 0
    }],
    suspensionPriceList: [{
      name: '小型犬',
      checked: 0
    }, {
      name: '中型犬',
      checked: 0
    }, {
      name: '大型犬',
      checked: 0
    }, {
      name: '猫咪',
      checked: 0
    }],
  },

  onLoad() { },

  onShow() {
    const that = this;

    app.doLogin({
      success(userInfo) {
        that.setData({ userInfo });
        that.queryAdopterInfo();
      }
    });
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 获取寄养家庭资料(修改时)
  queryAdopterInfo() {
    const that = this;
    mcdj.showLoading();
    mcdj.getKeepPet({
      success(data) {
        const userVo = data.userVo;
        console.log(userVo);
        // 家庭名称
        const familyName = userVo.adoptionVo ? userVo.adoptionVo.familyName : '';

        // 家庭信息
        const isFamilyInfo = userVo.adoptionVo && userVo.adoptionVo.address && userVo.adoptionVo.livingCondition
          && userVo.adoptionVo.houseType && userVo.adoptionVo.homeArea ? true : false;

        // 家庭描述
        const familyDescribe = userVo.adoptionVo ? userVo.adoptionVo.familyDescribe : '';

        // 提供物品
        const isProvide = userVo.adoptionVo && (userVo.adoptionVo.catGoods || userVo.adoptionVo.dogGoods) ? true : false;

        // 最多可寄养
        const petNumVal = [];
        petNumVal[0] = userVo.adoptionVo && userVo.adoptionVo.petsNumberCat ? userVo.adoptionVo.petsNumberCat : 0;
        petNumVal[1] = userVo.adoptionVo && userVo.adoptionVo.petsNumber ? userVo.adoptionVo.petsNumber : 0;

        // 日托价格表
        let priceList = that.data.priceList;
        for (let j in priceList) {
          priceList[j].checked = 0;
        }
        const priceArr = userVo.adoptionVo && userVo.adoptionVo.priceList ? userVo.adoptionVo.priceList : [];
        for (let i in priceArr) {
          priceList[parseInt(priceArr[i].petType)].price = priceArr[i].fosterAmount;
          priceList[parseInt(priceArr[i].petType)].checked = 1;
        }

        // 其他资料
        const isOther = userVo.adoptionVo && userVo.adoptionVo.activityArea && userVo.adoptionVo.residentPopulation ? true : false;

        // 个人资料
        const isUserInfo = userVo.occupation && userVo.city ? true : false;

        // 宠物信息
        const isExperience = userVo.adoptionVo && userVo.adoptionVo.keptPetList && userVo.adoptionVo.keptPetList.length > 0 ? true : false;

        that.setData({
          isok: true,
          userVo,

          familyName,
          isFamilyInfo,
          familyDescribe,
          petNumVal,
          isProvide,
          priceList,
          suspensionPriceList: priceList,
          isOther,
          isUserInfo,
          isExperience,
        });
        my.hideLoading();
        that.isCanSubmit();
      }
    });
  },

  // 保存收养信息
  saveAdoption() {
    const that = this;
    const d = this.data;

    if (isclick) return;
    isclick = true;

    // 日托价格
    let priceArray = [];
    for (let i in d.priceList) {
      if (d.priceList[i].price && d.priceList[i].checked) {
        if ((i == 3 && d.petNumVal[0]) || (i < 3 && d.petNumVal[1]))
          priceArray.push(parseInt(i) + '_' + d.priceList[i].price)
      }
    }
    console.log(priceArray)
    priceArray = priceArray.length > 0 ? priceArray.join(',') : null;
    if (!priceArray && (d.userInfo.userCertifiedStatus || d.userInfo.userCertifiedStatus == 0)) {
      mcdj.showToast('请选填您可寄养宠物类型的价格', 3);
      isclick = false;
      return;
    }

    const data = {
      familyName: d.familyName,
      priceArray,
      petsNumberCat: d.petNumVal[0],
      petsNumber: d.petNumVal[1],
    };
    console.log(data);
    mcdj.showLoading();
    mcdj.saveAdoption({
      data,
      success(res) {
        my.hideLoading();
        isclick = false;
        that.queryAdopterInfo();
        // that.isCanSubmit();
      },
      fail(err) {
        isclick = false;
      },
    })
  },

  // 判断信息是否已填完
  isCanSubmit() {
    const d = this.data;

    const priceList = this.data.priceList;
    const isPrice = !((!priceList[0].price || !priceList[0].checked) && (!priceList[1].price || !priceList[1].checked) && (!priceList[2].price || !priceList[2].checked) && (!priceList[3].price || !priceList[3].checked)) ? true : false;

    const noDisabled = d.familyName && d.isFamilyInfo && d.familyDescribe && (d.petNumVal[0] || d.petNumVal[1])
      && isPrice && d.isProvide && d.isOther && d.isUserInfo && d.isExperience ? true : false;

    this.setData({
      noDisabled
    })
  },

  // 下一步
  next() {
    if (!this.data.noDisabled) return;
    if (this.data.userInfo.isVideoAuth && this.data.userVo.adoptionVo.petPhoto) {
      my.navigateBack();
    } else {
      my.redirectTo({ url: '../upload/upload' });
    }
  },

  // -------------------------家庭名称-------------------------

  // 家庭名称
  inputFamilyName(e) {
    let familyName = this.data.familyName;
    this.setData({ familyName: e.detail.value });
    if (e.detail.value.length > 12) {
      this.setData({ familyName });
    }
  },
  blurFamilyName(e) {
    const that = this;
    const userVo = this.data.userVo;
    const familyName = userVo.adoptionVo ? userVo.adoptionVo.familyName : null;
    if (familyName != this.data.familyName && this.data.familyName) {
      mcdj.textRiskIdentification(function () {
        that.saveAdoption();
      }, that.data.familyName, '家庭名称')
    }
  },

  // -------------------------最多可寄养选择-------------------------

  // 显示选择框
  showMaxPet() {
    this.setData({
      showMaxPet: !this.data.showMaxPet
    })
  },
  // 最多数量选择
  petNumChange(e) {
    const petNumVal = e.detail.value;
    console.log(petNumVal);
    this.setData({
      petNumVal
    })
  },
  // 确定最多
  confirmMaxPet() {
    this.showMaxPet();
    this.saveAdoption();
  },

  // -------------------------价格填写-----------------------

  // 可日托的狗狗的体型
  priceChange(e) {
    const index = e.currentTarget.dataset.index;
    const suspensionPriceList = this.data.suspensionPriceList;
    suspensionPriceList[index].checked = !suspensionPriceList[index].checked ? 1 : 0;
    const petNumVal = this.data.petNumVal;
    if (suspensionPriceList[index].checked && (index == 3 && !petNumVal[0])) {
      mcdj.showToast('请先选择最多可寄养的猫的数量', 3);
      return;
    } else if (suspensionPriceList[index].checked && (index < 3 && !petNumVal[1])) {
      mcdj.showToast('请先选择最多可寄养的狗的数量', 3);
      return;
    }
    console.log(suspensionPriceList)
    this.setData({
      suspensionPriceList
    })
    console.log(this.data.suspensionPriceList)
  },
  // 日托价格
  showFoundPrice() {
    this.setData({
      showFoundPrice: !this.data.showFoundPrice
    })
  },
  inputDayCarePrice(e) {
    const index = e.currentTarget.dataset.index;
    const suspensionPriceList = this.data.suspensionPriceList;
    let price = suspensionPriceList[index].price;
    if (e.detail.value <= 1000) {
      price = e.detail.value;
    }
    suspensionPriceList[index].price = price;
    this.setData({
      suspensionPriceList
    })
  },
  // 取消填写日托价格
  cancelFoundPrice() {
    const suspensionPriceList = this.data.priceList;
    this.setData({
      suspensionPriceList
    });
    this.showFoundPrice();
  },
  // 确定日托价格
  confirmFoundPrice() {
    const priceList = this.data.suspensionPriceList;
    const petNumVal = this.data.petNumVal;

    // 日托价格
    let isHavePrice = false;
    for (let i in priceList) {
      if (priceList[i].price && priceList[i].checked) {
        if ((i == 3 && petNumVal[0]) || (i < 3 && petNumVal[1]))
          isHavePrice = true;
        break;
      }
    }
    if (!isHavePrice) {
      mcdj.showToast('请选填您可寄养宠物类型的价格', 3);
      return;
    }
    this.setData({
      priceList
    });
    this.showFoundPrice();
    this.saveAdoption();
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
