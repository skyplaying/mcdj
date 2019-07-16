
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {
    addressKey: 'address',
    minpriceArr: [55, 70, 90, 40],
    maxpriceArr: [75, 90, 120, 65],
  },

  // 页面启动的初始化
  initialization() {
    const that = this;
    // 当前的日期
    my.getServerTime({
      success: (res) => {
        const tomorrowTime = res.time + 86400000;
        const nowDate = utils.formatTimestamp(res.time).split(' ')[0];
        const tomorrowDate = utils.formatTimestamp(tomorrowTime).split(' ')[0];
        that.setData({ nowDate, startTime: nowDate, tomorrowDate, endTime: tomorrowDate });
        that.countDay();
      },
    });
  },

  onLoad(options) {
    const that = this;
    // const fosterFoundObj = JSON.parse(options.obj);  //fosterFoundObj={ userId, startTime, endTime, startStr, endStr, countDay, category, maxNum }
    // that.setData(fosterFoundObj)
    // console.log(this.data)
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
          that.initialization();
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
        mcdj.removeStorageSync(that.data.addressKey);
      }
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 寄养时间
  selectSTime() {
    const that = this;
    mcdj.showToast('请选择入住日期', 3);
    my.datePicker({
      startDate: that.data.nowDate,
      success: (res) => {
        that.setData({
          startTime: res.date,
        });
        that.selectETime();
      },
    });
  },
  selectETime() {
    const that = this;
    if (!this.data.startTime) {
      mcdj.alert('请先选中寄养的起始时间');
      return;
    }
    const startTime = new Date(this.data.startTime).getTime() + 86400000;
    const startDate = utils.formatTimestamp(startTime).split(' ')[0];
    console.log(startDate)
    mcdj.showToast('请选择离开日期', 3);
    my.datePicker({
      startDate,
      success: (res) => {
        that.setData({
          endTime: res.date,
        });
        that.countDay();
      },
    });
  },
  countDay() {
    const { startTime, endTime } = this.data;
    const startTimes = startTime.split('-');
    const startDate = startTimes[1] + '月' + startTimes[2] + '日';
    const startStr = this.getDateStr(startTimes);
    const endTimes = endTime.split('-');
    const endDate = endTimes[1] + '月' + endTimes[2] + '日';
    const endStr = this.getDateStr(endTimes);
    let countDay = 0;
    if (startTime && endTime) {
      countDay = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60 * 24) || 1;
      // console.log(countDay)
    }

    this.setData({
      startDate, startStr, endDate, endStr, countDay
    })
  },
  getDateStr(date) {
    const time = new Date(date);
    const day = Math.ceil((time - new Date(this.data.nowDate)) / 86400000) || 0;
    let str = day > 2 ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][time.getDay()] : ['今天', '明天', '后天'][day];
    return str;
  },

  // 获取我的宠物列表
  getPetList() {
    const that = this;
    mcdj.myPets({
      success(petList) {
        that.setData({
          petList,
          isok: true
        })
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
    petList[index].check = !petList[index].check;
    // console.log(petList);
    this.setData({ petList });
    this.countPrice();
  },

  // 计算价格
  countPrice() {
    const { countDay, petList, minpriceArr, maxpriceArr } = this.data;
    let minTotalPrice = 0;
    let maxTotalPrice = 0;
    const petIds = [];
    for (let i in petList) {
      if (petList[i].check) {
        minTotalPrice += parseFloat(minpriceArr[petList[i].petVarietyVo.varietyType]);
        maxTotalPrice += parseFloat(maxpriceArr[petList[i].petVarietyVo.varietyType]);
        petIds.push(petList[i].petId);
      }
    }
    if (!petIds || petIds.length == 0 || !countDay) {
      this.setData({
        totalPrice: 0
      })
      return
    };
    const totalPrice = (minTotalPrice * countDay) + '~' + (maxTotalPrice * countDay);
    this.setData({
      petIds, totalPrice
    })
  },

  // 备注
  inputDescribe(e) {
    this.setData({
      fosterDescribe: e.detail.value
    })
  },

  // 提交发布内容
  formSubmit(e) {
    console.log(e);
    const that = this;
    const d = this.data;

    if (!d.startTime) {
      mcdj.alert('请选择起始日期');
    } else if (!d.endTime) {
      mcdj.alert('请选择终止日期');
    } else if (!d.lngPoint || !d.latPoint) {
      mcdj.alert('请选择您的地址');
    } else if (!d.petIds || d.petIds.length === 0) {
      mcdj.alert('请选中您要寄养的宠物');
    } else {
      // mcdj.textRiskIdentification(function () {
      if (isclick) return;
      isclick = true;
      that.publishDemand();
      // }, d.fosterDescribe, '备注')
    }
  },

  // 发布寄养
  publishDemand() {
    const that = this;
    const d = this.data;
    const petIds = d.petIds.join(',');

    const data = {
      startTime: d.startTime.split('-').join('/'),
      endTime: d.endTime.split('-').join('/'),
      demandAddress: d.addressName,
      addressLng: d.lngPoint,
      addressLat: d.latPoint,
      remarks: d.fosterDescribe,
      petIds,
    };
    mcdj.showLoading();
    mcdj.publishDemand({
      data,
      success(data) {
        my.hideLoading();
        isclick = false;
        const fosterDemandId = data.fosterDemandId;
        that.setData({
          fosterDemandId
        })
        mcdj.showToast('已发布', 2, null, function () {
          app.doLogin({
            anew: 1,
            success() {
              my.redirectTo({
                url: '../display/display?fosterDemandId=' + that.data.fosterDemandId,
              });
            }
          })
        });
      }, fail() {
        my.hideLoading();
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
