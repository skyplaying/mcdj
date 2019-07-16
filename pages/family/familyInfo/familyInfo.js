
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
let isLogin, isToast;
Page({
  data: {
    addressKey: 'address',
    livingConditionArr: ['住宅', '公寓', '别墅'],
    roomArr: ['0房', '1房', '2房', '3房', '4房', '5房'],
    hallArr: ['0厅', '1厅', '2厅', '3厅', '4厅'],
    balconyArr: ['0阳台', '1阳台', '2阳台', '3阳台', '4阳台'],
    facilitiesArr: ['空调环境', '电梯', '封闭阳台', '广场', '附近公园', '交通便利', '私人花园', '小区花园'],
    facilitiesStateArr: []
  },

  onLoad() {
    const that = this;

    app.doLogin({
      success(userInfo) {
        that.setData({ userInfo });
        that.queryAdopterInfo();
      }
    });
  },

  onShow() {
    // 获取联系地址
    if (!isNoFirst) {
      isNoFirst = true;
    } else {
      const addressObj = mcdj.getStorageSync(this.data.addressKey) || '';
      console.log(addressObj);
      if (addressObj) {
        const address = addressObj.commonAddress;
        const addressName = address.split(':')[1];
        const lngPoint = addressObj.lngPoint;
        const latPoint = addressObj.latPoint;
        this.setData({ address, addressName, latPoint, lngPoint });
        this.isCanSubmit();
        mcdj.removeStorageSync(this.data.addressKey);
      }
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
    isLogin = undefined, isToast = undefined;
  },

  // 获取寄养家庭资料(修改时)
  queryAdopterInfo() {
    const that = this;
    mcdj.getKeepPet({
      success(data) {
        const userVo = data.userVo;
        console.log(userVo);

        if (!userVo.adoptionVo || !userVo.adoptionVo.address) {
          that.setData({
            isok: true
          })
          return;
        }

        // 住宅类型
        let livingConditionIndex = null;
        const livingConditionArr = that.data.livingConditionArr;
        for (let i in livingConditionArr) {
          if (livingConditionArr[i] == userVo.adoptionVo.livingCondition) {
            livingConditionIndex = parseInt(i)
            break;
          }
        }
        // 房屋类型
        const houseType = userVo.adoptionVo.houseType || null;
        const buildingVal = [];
        if (houseType) {
          buildingVal[0] = houseType.split('房')[0];
          buildingVal[1] = houseType.split('房')[1].split('厅')[0];
          buildingVal[2] = houseType.split('厅')[1].split('阳台')[0];
        }

        // 配套周边 
        let facilitiesStateArr = [];
        const facilitiesArr = that.data.facilitiesArr;
        const facilities = userVo.adoptionVo.nearbyEnvironment ? userVo.adoptionVo.nearbyEnvironment.split(',') : [];
        for (let i in facilitiesArr) {
          for (let j in facilities) {
            if (facilitiesArr[i] == facilities[j]) {
              facilitiesStateArr[i] = true;
              break;
            }
          }
        }

        that.setData({
          isok: true,
          userVo,

          address: userVo.adoptionVo.address,
          addressName: userVo.adoptionVo.address.split(':')[1],
          lngPoint: userVo.adoptionVo.lngPoint,
          latPoint: userVo.adoptionVo.latPoint,
          livingConditionIndex,
          buildingVal,
          homeArea: userVo.adoptionVo.homeArea,
          facilitiesStateArr,
        });
        that.isCanSubmit();
      }
    });
  },

  // 住宅类型
  changeLivingCondition(e) {
    this.setData({
      livingConditionIndex: e.detail.value,
    });
    this.isCanSubmit();
  },

  // 住宅面积
  inputHomeArea(e) {
    this.setData({ homeArea: e.detail.value });
    this.isCanSubmit();
  },

  // 配套周边
  changefacilities(e) {
    console.log(e.currentTarget.dataset.index)
    const index = e.currentTarget.dataset.index;
    const facilitiesStateArr = this.data.facilitiesStateArr;
    facilitiesStateArr[index] = !facilitiesStateArr[index];
    this.setData({
      facilitiesStateArr
    })
  },

  // 判断信息是否已填完
  isCanSubmit() {
    const d = this.data;
    const noDisabled = d.address && d.livingConditionIndex != undefined &&
      d.buildingVal && (d.buildingVal[0] || d.buildingVal[1] || d.buildingVal[2]) && d.homeArea ? true : false;

    this.setData({
      noDisabled
    })
  },

  // 保存收养信息
  save() {
    if (!this.data.noDisabled) return;
    if (isclick) return;
    isclick = true;

    const that = this;
    const d = this.data;

    // 房屋类型
    const houseType = d.buildingVal[0] + '房' + d.buildingVal[1] + '厅' + d.buildingVal[2] + '阳台';

    // 配套周边
    const facilities = [];
    const facilitiesArr = this.data.facilitiesArr;
    const facilitiesStateArr = this.data.facilitiesStateArr;
    for (let i in facilitiesStateArr) {
      if (facilitiesStateArr[i])
        facilities.push(facilitiesArr[i])
    }

    const data = {
      address: d.address,
      lngPoint: d.lngPoint,
      latPoint: d.latPoint,
      livingCondition: d.livingConditionArr[d.livingConditionIndex],
      houseType,
      homeArea: d.homeArea,
      nearbyEnvironment: facilities.join(','),
    };
    console.log(data);
    mcdj.showLoading();
    mcdj.saveFamily({
      data,
      success(res) {
        my.hideLoading();
        isclick = false;
        // 清除地址
        mcdj.removeStorageSync(d.addressKey);
        my.showToast({
          type: 'none',
          duration: 1500,
          content: '保存成功',
          success() {
            isToast = true;
            that.saveNav();
          },
        });

        app.doLogin({
          anew: 1,
          success(userInfo) {
            isLogin = userInfo;
            that.saveNav();
          }
        })
      },
      fail(err) {
        isclick = false;
      },
    })
  },

  // 保存完跳转
  saveNav() {
    if (isLogin && isToast) {
      if (this.data.userVo && this.data.userVo.userCertifiedStatus == 1 && isLogin.userCertifiedStatus != 1)
        my.redirectTo({ url: '../upload/upload' });
      else
        my.navigateBack();
    }
  },

  // -------------------------房屋类型选择-------------------------

  // 显示选择框
  showBuilding() {
    this.setData({
      showBuilding: !this.data.showBuilding
    })
  },
  // 类型数量选择
  changeBuilding(e) {
    const buildingVal = e.detail.value;
    console.log(buildingVal);
    this.setData({
      buildingVal
    })
  },
  // 确定选择
  confirmBuilding() {
    this.showBuilding();
    this.isCanSubmit();
  },

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
