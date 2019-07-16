
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();
let isNoFirst, isclick;
Page({
  data: {
    distanceList: ['不限', '3千米', '5千米', '10千米'],  //距离列表
    sortList: ['智能排序', '距离优先', '低价优先', '高价优先', '好评优先', '人气优先'],  //订单排序列表
    petTypeList: ['小型犬', '中型犬', '大型犬', '猫咪'],  //宠物类型列表
    gradesList: ['寄养', '训宠'],  //星级列表
    demandSortList: ['智能排序', '距离优先', '最新优先', '短期优先', '长期优先'],  //需求排序列表
    demandPetTypeList: ['不限', '小型犬', '中型犬', '大型犬', '猫咪'],  //需求宠物类型列表
    isok: true
  },
  onLoad(options) {
    const that = this;
    //获取定位
    const location = app.globalData.location || mcdj.getStorageSync(app.storagekey.locationKey) || {};
    const cityObj = app.globalData.cityObj || mcdj.getStorageSync('city') || {};

    const gradesIndex = options.gradesIndex;
    const gradesState = [];
    gradesState[gradesIndex] = true;
    const grades = gradesIndex;


    that.setData({
      latPoint: location.latitude,
      lngPoint: location.longitude,
      city: cityObj.city,
      adcode: cityObj.adcode,
      gradesState,
      grades
    })

    app.doLogin({
      loginType: "0",
      success() {
        that.initFamilyList();
      }, fail() {
        my.navigateBack();
      }
    })
  },

  onShow(options) {
    if (isNoFirst) {
      const cityObj = app.globalData.cityObj;
      // 更换了城市则重新刷新
      if (cityObj.adcode != this.data.adcode) {
        this.setData({
          city: cityObj.city,
          adcode: cityObj.adcode,
        })
        this.initFamilyList();
      }
    } else {
      isNoFirst = true;
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 上拉加载
  onReachBottom() {
    console.log(this.data)
    if (!this.data.loading)
      this.loadFamily();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.initFamilyList();
  },

  // 页面滚动事件
  onPageScroll(e) {
    this.showImg();
  },

  // 初始化家庭列表
  initFamilyList() {
    this.setData({
      showloading: false,
      adopterPage: 0,
      adopterList: [],
      nomoreAdopter: false,
      firstQueryDate: null,
    });
    this.loadFamily();
  },

  // 加载家庭列表
  loadFamily() {
    const that = this;
    if (!this.data.nomoreAdopter) {
      const lngPoint = this.data.lngPoint;
      const latPoint = this.data.latPoint;
      const pointCity = this.data.city;
      const distance = this.data.distanceIndex ? parseInt(this.data.distanceList[this.data.distanceIndex].split('千米')[0]) * 1000 : null;
      const sortType = this.data.sortIndex || null;
      const petTypes = this.data.petTypes || null;
      const serviceType = this.data.grades == undefined || this.data.grades.split(',').length == 2 ? null : (parseInt(this.data.grades) + 1);

      const page = this.data.adopterPage + 1;
      const firstQueryDate = this.data.firstQueryDate || utils.formatTime(new Date());
      this.setData({
        showloading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryHomeUserList({
        distance, sortType, petTypes, serviceType,
        page, pageSize: 5, firstQueryDate, lngPoint, latPoint, pointCity,
        success(data) {
          const adopterPage = data.page;
          const nomoreAdopter = data.noMore;
          const adopterList = that.data.adopterList.concat(data.results);
          console.log(adopterList)
          const total = data.total;
          that.setData({ adopterList, adopterPage, nomoreAdopter, total, showloading: false });
          my.hideNavigationBarLoading();
          my.stopPullDownRefresh();
          if (adopterPage == 1) {
            setTimeout(function () {
              that.showImg();
            }, 500);
          }

          if (total == 0) {
            my.confirm({
              title: "服务申请提示",
              content: "当前城市暂无提供服务人员，您是否愿意成为开荒服务的第一人？",
              success: (res) => {
                if (res.confirm) {
                  my.navigateTo({
                    url: "/pages/my/job/job"
                  })
                }
              },
            });
          }
        }
      });
    }
  },

  // 距离选择
  distanceChange(e) {
    const distanceIndex = parseInt(e.currentTarget.dataset.index);
    this.setData({
      distanceIndex, showNavIndex: 0
    })
    this.initFamilyList();
  },

  // 家庭排序选择
  sortChange(e) {
    const sortIndex = parseInt(e.currentTarget.dataset.index);
    this.setData({
      sortIndex, showNavIndex: 0
    })
    this.initFamilyList();
  },

  // 家庭宠物类型选择
  petTypeChange(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const petTypeState = this.data.petTypeState || [];
    petTypeState[index] = !petTypeState[index];
    this.setData({
      petTypeState
    })
  },

  // 服务选择
  gradesChange(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const gradesState = this.data.gradesState || [];
    gradesState[index] = !gradesState[index];
    this.setData({
      gradesState
    })
  },

  // 重置筛选
  resetScreen() {
    this.setData({
      petTypeState: [], gradesState: [], petTypes: [], grades: []
    })
  },

  // 完成筛选
  completeScreen() {
    const petTypeState = this.data.petTypeState;
    const gradesState = this.data.gradesState;
    let petTypeArr = [];
    for (let i in petTypeState) {
      if (petTypeState[i])
        petTypeArr.push(i);
    }
    let gradesArr = [];
    for (let i in gradesState) {
      if (gradesState[i])
        gradesArr.push(i);
    }

    this.setData({
      showNavIndex: 0,
      oldPetTypeState: this.data.petTypeState,
      oldGradesState: this.data.gradesState,
      petTypes: petTypeArr.join(','),
      grades: gradesArr.join(','),
    })

    this.initFamilyList();
  },

  // 显示列表条件选择框
  showNav(e) {
    // 判断如果是点击灰色蒙板隐藏筛选内容的时候，把原先的筛选条件置换上去
    const showNavIndex = parseInt(e.currentTarget.dataset.index);
    if (this.data.showNavIndex == 3 && showNavIndex == 0) {
      this.setData({
        petTypeState: (this.data.oldPetTypeState || []), gradesState: (this.data.oldGradesState || [])
      })
    }
    this.setData({
      showNavIndex
    })
  },

  // 切换列表显示
  switchList() {
    this.setData({
      isHidListPhoto: !this.data.isHidListPhoto
    })
  },

  showImg() {
    const that = this;
    let adopterList = this.data.adopterList;
    if (!adopterList[adopterList.length - 1] || adopterList[adopterList.length - 1].show) return;
    let windowHeight = this.data.windowHeight; // 页面的可视高度
    my.createSelectorQuery().selectAll('.family-item_server-list').boundingClientRect().exec((ret) => {
      // console.log(windowHeight)
      // console.log(ret[0])
      ret[0].forEach((item, index) => {
        if (item.top <= windowHeight && item.bottom >= 0) {
          // 判断是否在显示范围内
          adopterList[index].show = true // 根据下标改变状态
        }
      })
      // console.log(adopterList)
      that.setData({
        adopterList
      })
    })
  },

  //登录后调整
  loginAfterNav(e) {
    const url = e.currentTarget.dataset.url;
    const type = e.currentTarget.dataset.type;
    app.doLogin({
      success() {
        my[type || 'navigateTo']({
          url
        })
      }
    })
  },

  // 查看服务
  toServer(e) {
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;
    app.doLogin({
      success() {
        if (type == 1)
          my.navigateTo({
            url: "/pages/family/display/display?userId=" + id
          })
        else if (type == 2)
          my.navigateTo({
            url: "/pages/trainer/display/display?trainServiceId=" + id
          })
      }
    })
  },

  // 保存二维码
  setFormId(e) {
    wk.setFormId(e);
  },

})