import mcdj from '../../others/js/interface_mc';
import utils from '../../others/js/utils';
const app = getApp();

let isNoFirst, isclick;
let isRefreshUserInfo;
Page({
  data: {
    defImg: 'http://petshare.oss-cn-shanghai.aliyuncs.com/icon/list_image_def.png',
    distanceList: ['不限', '3千米', '5千米', '10千米'],  //距离列表
    sortList: ['智能排序', '距离优先', '低价优先', '高价优先', '好评优先', '人气优先'],  //订单排序列表
    petTypeList: ['小型犬', '中型犬', '大型犬', '猫咪'],  //宠物类型列表
    gradesList: ['寄养', '训宠'],  //星级列表
    demandSortList: ['智能排序', '距离优先', '最新优先', '短期优先', '长期优先'],  //需求排序列表
    demandPetTypeList: ['不限', '小型犬', '中型犬', '大型犬', '猫咪'],  //需求宠物类型列表

    bannerList: [{
      bannerPath: 'http://image.qipinke.com/banner/banner180912.png',
      navType: 'navigateTo',
      jumpPath: '{ "url": "/pages/family/flow/flow" }',
    }, {
      img: 'http://image.qipinke.com/banner/banner_shs_20181030.png',
      navType: 'navigateToMiniProgram',
      navObj: '{ "appId": "2017082808428283","path": "pages/home/home" }',
    }, {
      img: 'http://image.qipinke.com/banner/banner180920.png',
      navType: 'navigateToMiniProgram',
      navObj: '{ "appId": "2018122562686742","path": "pages/index/index?originAppId=2017090608580011&newUserTemplate=20190104000000101476" }',
    }],

    tabs: ['服务订单', '寄养需求'],
    tabsWidth: 750,   //单位为rpx的大小,因为translateX暂不支持rpx
    sliderWidth: 80,  //需要设置slider的宽度，用于计算中间位置,一般是屏幕宽度除以tabs的个数
    activeIndex: "0",
    sliderOffset: 0,
    sliderLeft: 0,
  },

  onLoad() {
    const that = this;

    if (my.isFavorite) {
      my.isFavorite({
        success: (res) => {
          that.setData({
            isFavorite: res && res.isFavorite ? true : false
          })
        }
      });
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      my.alert({
        title: '提示',
        content: '当前支付宝版本过低，无法使用此功能，请升级最新版本的支付宝'
      });
    }

    const isFamily = mcdj.getStorageSync('isFamily') || null;
    this.setData({
      isFamily,
      canIUseFavorite: my.canIUse('favorite') //收藏组件
    })
    this.initTabs();      // 初始化标题导航栏的tbas

    this.getCity(function () {
      app.doLogin({
        loginType: "0",
        success(userInfo) {
          // console.log(app.globalData.userInfo)
          that.setData({
            userInfo
          })
          that.init();
        }
      })
    });

    this.updateLastTime();
  },

  onShow() {
    const that = this;
    if (app.globalData.isAnewIdentity) {
      app.globalData.isAnewIdentity = 0;
      const isFamily = mcdj.getStorageSync('isFamily');
      that.setData({
        isFamily
      })
      that.initList();
    }

    if (isNoFirst) {
      app.doLogin({
        loginType: null,
        success(userInfo) {
          that.setData({
            userInfo
          })
        }
      })
    } else {
      isNoFirst = true;
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isRefreshUserInfo = undefined, isNoFirst = undefined, isclick = undefined;
  },

  // 启动
  init() {
    const userInfo = this.data.userInfo;
    // 身份状态（0代表未提交过服务申请，1代表有已经通过审核的服务，2代表有且只有已提交审核的服务）
    let identityStatus = 2;
    if (userInfo.userCertifiedStatus == undefined && userInfo.trainReviewStatus == undefined) {
      identityStatus = 0;
    } else if (userInfo.userCertifiedStatus == 1 || userInfo.trainReviewStatus == 1) {
      identityStatus = 1;
    }
    if (identityStatus == 1 && !this.data.isFamily) {
      mcdj.setStorageSync('isFamily', 1);
      this.setData({
        isFamily: true
      })
      app.globalData.isAnewIdentity = 1;
    } else if (identityStatus != 1 && this.data.isFamily) {
      mcdj.showToast('已自动帮您切回普通用户身份', 3);
      mcdj.setStorageSync('isFamily', 0);
      this.setData({
        isFamily: false
      })
      app.globalData.isAnewIdentity = 1;
    }

    this.initList();
    this.queryBannerList();
  },

  // 去宠物识别
  toDistinguish() {
    my.navigateToMiniProgram({
      appId: '2019011763031535',
      envVersion: "develop",
      success(res) {
        console.log(JSON.stringify(res))
      },
      fail(res) {
        mcdj.showToast('跳转失败', 2);
        console.log(JSON.stringify(res))
      }
    });
  },

  showImg() {
    const that = this;
    let adopterList = this.data.adopterList;
    if (adopterList[adopterList.length - 1].show) return;
    let windowHeight = this.data.windowHeight; // 页面的可视高度
    my.createSelectorQuery().selectAll('.family-item_bottom').boundingClientRect().exec((ret) => {
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

  // 页面滚动事件
  onPageScroll(e) { 
    // this.showImg();
    // console.log(e.scrollTop)
    if (e.scrollTop > 686 * (this.data.px || 0.5) && !this.data.isChangeNavbar) {
      this.setData({ isChangeNavbar: true });
    } else if (e.scrollTop < 686 * (this.data.px || 0.5) && this.data.isChangeNavbar) {
      this.setData({ isChangeNavbar: false });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.initList();
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.showloading)
      this.load();
  },

  // 轮播图
  queryBannerList() {
    const that = this;
    mcdj.queryBannerList({
      success(data) {
        const bannerList = data.results;
        // console.log(bannerList);
        that.setData({
          bannerList, isok: true
        })
      }
    })
  },

  // 初始化列表
  initList() {
    const isFamily = this.data.isFamily;
    if (!isFamily)
      this.initFamilyList();
    else if (this.data.activeIndex == 0)
      this.initOrderList();
    else if (this.data.activeIndex == 1)
      this.initDemandList();
  },

  // 加载列表
  load() {
    const isFamily = this.data.isFamily;
    if (!isFamily)
      this.loadFamily();
    else if (this.data.activeIndex == 0)
      this.loadOrder();
    else if (this.data.activeIndex == 1)
      this.loadDemand();
  },

  // 初始化订单列表
  initOrderList() {
    this.setData({
      showloading: false,
      orderPage: 0,
      orderList: [],
      nomoreOrder: false,
    });
    this.loadOrder();
  },

  // 加载订单列表
  loadOrder() {
    const that = this;
    if (!this.data.nomoreOrder) {
      const queryStaus = 2;
      const page = this.data.orderPage + 1;
      this.setData({
        loading: true
      })
      // my.showNavigationBarLoading();
      mcdj.queryUserOrderList({
        queryType: 2,
        queryStaus,
        page,
        success(data) {
          const orderPage = data.page;
          const nomoreOrder = data.noMore;
          const orderList = that.data.orderList.concat(data.results);
          const total = data.total;
          console.log(orderList);
          that.setData({ orderList, orderPage, nomoreOrder, total, loading: false });
          // my.hideNavigationBarLoading();
          my.stopPullDownRefresh();
        }
      });
    }
  },

  // 发布需求
  toDemandFound() {
    my.navigateTo({
      url: '/pages/demand/found/found'
    });
  },

  // 查看需求
  toDemandDisplay() {
    const fosterDemandId = this.data.userInfo.fosterDemandId;
    my.navigateTo({
      url: '../demand/display/display?fosterDemandId=' + fosterDemandId
    });
  },

  // 附近需求
  toDemandList() {
    my.navigateTo({
      url: '/pages/demand/list/list'
    });
  },

  // 隐藏收藏有礼悬浮框
  hidFavorite() {
    this.setData({
      isFavorite: !this.data.isFavorite
    })
  },

  // 寄养订单页
  toOrderDisplay(e) {
    const index = e.currentTarget.dataset.index;
    const orderList = this.data.orderList;
    const fosterOrderId = orderList[index].fosterOrderId;
    if (orderList[index].orderType == 1) {
      my.navigateTo({
        url: '/pages/fosterage/display/display?fosterOrderId=' + fosterOrderId,
      });
    } else if (orderList[index].orderType == 2) {
      my.navigateTo({
        url: '/pages/fosterage/trainer/display/display?trainOrderId=' + fosterOrderId,
      });
    }
  },

  // 去用户主页
  toUser(e) {
    const index = parseInt(e.currentTarget.dataset.id);
    const userId = e.currentTarget.dataset.id;
    my.navigateTo({
      url: '/pages/personal/display/display?userId=' + userId
    });
  },

  // 接单状态改变
  receiptChange(e) {
    const that = this;
    const isOrderTaking = e.detail.value ? 1 : 0;
    mcdj.showLoading();
    mcdj.orderSwitch({
      isOrderTaking,
      success(data) {
        my.hideLoading();
        app.doLogin({
          anew: 1,
          success(userInfo) {
            that.setData({
              userInfo
            })
          }
        })
      }
    })
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
    // const that = this;
    // if (!this.data.nomoreAdopter) {
    //   const lngPoint = this.data.lngPoint;
    //   const latPoint = this.data.latPoint;
    //   const pointCity = this.data.city;
    //   const distance = this.data.distanceIndex ? parseInt(this.data.distanceList[this.data.distanceIndex].split('千米')[0]) * 1000 : null;
    //   const sortType = this.data.sortIndex || null;
    //   const petTypes = this.data.petTypes || null;
    //   const serviceType = this.data.grades == undefined || this.data.grades.split(',').length == 2 ? null : (parseInt(this.data.grades) + 1);

    //   const page = this.data.adopterPage + 1;
    //   const firstQueryDate = this.data.firstQueryDate || utils.formatTime(new Date());
    //   this.setData({
    //     showloading: true
    //   })
    //   my.showNavigationBarLoading();
    //   mcdj.queryHomeUserList({
    //     distance, sortType, petTypes, serviceType,
    //     page, pageSize: 5, firstQueryDate, lngPoint, latPoint, pointCity,
    //     success(data) {
    //       const adopterPage = data.page;
    //       const nomoreAdopter = data.noMore;
    //       const adopterList = that.data.adopterList.concat(data.results);
    //       const total = data.total;
    //       that.setData({ adopterList, adopterPage, nomoreAdopter, total, showloading: false });
    //       my.hideNavigationBarLoading();
    //       my.stopPullDownRefresh();
    //       if (adopterPage == 1) {
    //         setTimeout(function () {
    //           that.showImg();
    //         }, 500);
    //       }

    //       if (total == 0) {
    //         my.confirm({
    //           title: "服务申请提示",
    //           content: "当前城市暂无提供服务人员，您是否愿意成为开荒服务的第一人？",
    //           success: (res) => {
    //             if (res.confirm) {
    //               my.navigateTo({
    //                 url: "/pages/my/job/job"
    //               })
    //             }
    //           },
    //         });
    //       }
    //     }
    //   });
    // }
  },

  // 初始化需求列表
  initDemandList() {
    this.setData({
      showloading: false,
      demandPage: 0,
      demandList: [],
      nomoreDemand: false,
    });
    this.loadDemand();
  },

  // 加载附近需求列表
  loadDemand() {
    const that = this;
    if (!this.data.nomoreDemand) {
      const addressLng = this.data.lngPoint;
      const addressLat = this.data.latPoint;
      const city = this.data.city;
      const sortType = this.data.demandSortIndex || null;
      const fosterPetTypes = this.data.demandPetTypeIndex ? this.data.demandPetTypeList[this.data.demandPetTypeIndex] : null;

      const page = this.data.demandPage + 1;
      this.setData({
        showloading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryFosterDemandList({
        page, addressLng, addressLat, city, sortType, fosterPetTypes,
        success(data) {
          const demandPage = data.page;
          const nomoreDemand = data.noMore;
          const demandList = that.data.demandList.concat(data.results);
          const total = data.total;
          console.log(demandList);
          that.setData({ demandList, demandPage, nomoreDemand, total, showloading: false });
          my.hideNavigationBarLoading();
          my.stopPullDownRefresh();
        }
      });
    }
  },

  // 获取城市
  getCity(cb) {
    const that = this;
    // let type = my.canIUse('getLocation.type') ? 1 : 0;
    // console.log('citytype:' + type)
    let type = 0;

    new Promise(function (resolve, reject) {
      my.getLocation({
        type,
        success(res) {
          resolve(res)
        }, fail(err) {
          //如果拒绝授权则设置为默认经纬度
          type = 1;
          const res = {
            latitude: 22.532637, longitude: 113.926997, city: '深圳', adcode: '440300'
          };
          mcdj.showToast('已帮您设置了默认位置', 3);
          resolve(res)
        }
      })
    }).then(function (res) {
      console.log(res)
      const p = new Promise(function (resolve, reject) {
        app.globalData.location = res;
        that.setData({
          latPoint: res.latitude,
          lngPoint: res.longitude,
        })
        resolve(res)
      })
      return p;
    }).then(function (res) {
      //如果不兼容getLocation的type属性，则反向获取当前城市的对象
      const p = new Promise(function (resolve, reject) {
        if (type) {
          const cityObj = {
            city: res.city,
            adcode: res.cityAdcode,
          };
          resolve(cityObj);
        } else {
          const latPoint = res.latitude;
          const lngPoint = res.longitude;
          mcdj.analysisLocation({
            latPoint, lngPoint,
            success(cityObj) {
              resolve(cityObj);
            }, fail() {
              reject();
            }
          })
        }
      })
      return p;
    }).then(function (cityObj) {
      //判断是否要切换为当前城市
      const p = new Promise(function (resolve, reject) {
        const storage = mcdj.getStorageSync('city') || null;
        // console.log('storageCity:' + storage);
        if (!storage || cityObj.adcode == storage.adcode) {
          const isSetStorage = !storage ? 1 : 0;
          resolve([cityObj, isSetStorage]);
        } else {
          my.confirm({
            content: '当前定位城市为' + cityObj.city + '，是否要切换到该城市',
            success(res) {
              if (res.confirm) {
                resolve([cityObj, 1]);
              } else {
                resolve([storage, 0]);
              }
            }, fail(err) {
              resolve([storage, 0]);
            }
          });
        }
      })
      return p;
    }).then(function ([data, isSetStorage]) {
      that.setData({
        city: data.city,
        adcode: data.adcode,
      });
      app.globalData.cityObj = data;
      typeof cb == 'function' && cb();
      if (isSetStorage)
        mcdj.setStorageSync('city', data);
    }, function (err) {
      if (err)
        mcdj.alert(err);
    })
  },

  // -----------------------------------------------

  // 选择城市
  chooseCity() {
    const that = this;
    my.chooseCity({
      showLocatedCity: true,
      success(data) {
        console.log(data)
        that.setData({
          city: data.city,
          adcode: data.adcode,
        });
        app.globalData.cityObj = data;
        // 缓存城市信息
        mcdj.setStorageSync('city', data);
        that.initFamilyList();
      }, fail(err) {
        mcdj.alert(err);
      }
    });
  },

  // 需求组件内刷新了登录
  demandLogin() {
    const that = this;
    app.doLogin({
      success(userInfo) {
        that.setData({
          userInfo
        })
      }
    })
  },

  // 发布需求完成
  finishDemand() {
    const that = this;
    app.doLogin({
      anew: 1,
      success(userInfo) {
        that.setData({
          userInfo
        })
      }
    })
  },

  // 隐藏需求发布框
  hidDemandPublish() {
    this.setData({
      hidDemandPublish: !this.data.hidDemandPublish
    })
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

  // 家庭星级选择
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

  // 切换列表显示
  switchList() {
    this.setData({
      isHidListPhoto: !this.data.isHidListPhoto
    })
  },

  // 选择需求排序
  changeDemandSort(e) {
    this.setData({
      demandSortIndex: e.detail.value,
    });
    this.initList();
  },

  // 选择需求宠物类型
  changeDemandPetType(e) {
    this.setData({
      demandPetTypeIndex: e.detail.value,
    });
    this.initList();
  },

  // 去家庭主页
  toFamilyDisplay(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const adopterList = this.data.adopterList;
    my.navigateTo({
      url: '/pages/family/display/display?userId=' + adopterList[index].userId
    });
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

  //登录后调整
  loginAfterNav(e) {
    const url = e.currentTarget.dataset.url;
    const type = e.currentTarget.dataset.type;
    console.log(type)
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

  //轮播图跳转
  swiperNav(e) {
    const index = e.currentTarget.dataset.index;
    const bannerList = this.data.bannerList;
    const navType = bannerList[index].navType || 'navigateTo';
    const navObj = JSON.parse(bannerList[index].jumpPath);
    app.doLogin({
      success() {
        my[navType](navObj)
      }
    })
  },

  //-------------------------------------------------------

  // 分享
  onShareAppMessage() {
    return {
      title: '萌宠到家',
      desc: '有事外出，萌宠没人养？找萌宠到家，专业的家庭式寄养，让您放心出行！',
      path: 'pages/index/index'
    };
  },

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

  // 更新最后登录时间
  updateLastTime() {
    // 当前的日期
    my.getServerTime({
      success: (res) => {
        const nowDate = utils.formatTimestamp(res.time).split(' ')[0];
        my.setStorage({
          key: 'lastTime', // 缓存数据的key
          data: nowDate, // 要缓存的数据
          success: (res) => {

          },
        });
      },
    });
  },

  // -------------------------------------初始化tabs----------------------------------------
  initTabs() {
    const that = this;
    my.getSystemInfo({
      success(res) {
        // console.log(res)
        const px = res.windowWidth / 750;
        that.setData({
          px,
          windowHeight: res.windowHeight,
          sliderLeft: (that.data.tabsWidth / that.data.tabs.length - that.data.sliderWidth) / 2 * px,
          sliderOffset: (that.data.tabsWidth / that.data.tabs.length) * parseInt(that.data.activeIndex) * px,
        });
      },
    })
  },
  // 切换tabs
  tabClick(e) {
    var id = e.currentTarget.id
    this.setData({
      sliderOffset: (this.data.tabsWidth / this.data.tabs.length) * parseInt(id) * this.data.px,
      activeIndex: id,
    });
    this.initList();
  },


});
