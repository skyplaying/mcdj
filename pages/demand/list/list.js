
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst;
Page({
  data: {
    sortList: ['智能排序', '距离优先', '最新优先', '短期优先', '长期优先'],
    petTypeList: ['不限', '小型犬', '中型犬', '大型犬', '猫咪'],  //宠物类型列表


  },
  onLoad(options) {
    const that = this;
    //获取定位
    const location = app.globalData.location || mcdj.getStorageSync(app.storagekey.locationKey) || {};
    const cityObj = app.globalData.cityObj || mcdj.getStorageSync('city') || {};

    that.setData({
      latPoint: location.latitude,
      lngPoint: location.longitude,
      city: cityObj && cityObj.city ? cityObj.city : null
    })

  },

  onShow() {
    const that = this;
    if (!isNoFirst) {
      isNoFirst = true;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo, isok: true,
          })
          that.initList();
        }
      })
    } else
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo
          })
        }
      })
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined;
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.showloading)
      this.loadDemand();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.initList();
  },

  // 初始化列表
  initList() {
    this.setData({
      showloading: false,
      page: 0,
      list: [],
      nomore: false,
    });
    my.showNavigationBarLoading();
    this.loadDemand();
  },

  // 加载附近需求列表
  loadDemand() {
    const that = this;
    if (!this.data.nomore) {
      const addressLng = this.data.lngPoint;
      const addressLat = this.data.latPoint;
      const city = this.data.city;
      const sortType = this.data.sortIndex || null;
      const fosterPetTypes = this.data.petTypeIndex ? this.data.petTypeList[this.data.petTypeIndex] : null;

      const page = this.data.page + 1;
      this.setData({
        showloading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryFosterDemandList({
        page, addressLng, addressLat, city, sortType, fosterPetTypes,
        success(data) {
          const page = data.page;
          const nomore = data.noMore;
          const addList = data.results;
          addList.map((item) => {
            const petAvatarList = item.petAvatar ? item.petAvatar.split(',') : [];
            item.petAvatarList = petAvatarList;
            return item
          })
          const list = that.data.list.concat(addList);
          const total = data.total;
          console.log(list);
          that.setData({ list, page, nomore, total, showloading: false });
          my.hideNavigationBarLoading();
          my.stopPullDownRefresh();
        }
      });
    }
  },

  // 选择排序
  changeSort(e) {
    this.setData({
      sortIndex: e.detail.value,
    });
    this.initList();
  },

  // 选择宠物类型
  changePetType(e) {
    this.setData({
      petTypeIndex: e.detail.value,
    });
    this.initList();
  },

  // 发布需求
  toDemandFound() {
    my.navigateTo({
      url: '/pages/demand/found/found'
    });
  },

  // 我的需求
  toMyDemand() {
    my.navigateTo({
      url: '/pages/my/demand/demand'
    });
  },

  // 需求应答情况
  toDemandDisplay() {
    const fosterDemandId = this.data.userInfo.fosterDemandId;
    my.navigateTo({
      url: '../display/display?fosterDemandId=' + fosterDemandId
    });
  },

  // 保存二维码
  setFormId(e) {
    wk.setFormId(e);
  },

})