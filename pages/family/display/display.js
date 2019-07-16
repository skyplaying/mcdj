

import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;
let isUserVo, isPetList;
Page({
  data: {},

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
    // options.userId = 177493;
    const userId = options && options.userId ? options.userId : null;
    const isFamily = mcdj.getStorageSync('isFamily') || null;

    this.setData({ userId, isFamily, isShowToIndex: getCurrentPages().length === 1 });
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const that = this;
    if (!isNoFirst || !this.data.userInfo) {
      isNoFirst = true;
      app.globalData.isAnew = 0;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo,
          })
          that.initialization();
          that.myPetsList();
          that.queryAdopterInfo();
          that.queryCommentList();
        }, fail() {
          that.setData({ isNoAuth: true, isok: false });
        }
      })
    } else {
      that.queryAdopterInfo();
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 获取我的宠物列表
  myPetsList() {
    const that = this;
    const userId = this.data.userId;
    mcdj.myPets({
      userId,
      success(list) {
        const petList = list;
        that.setData({ petList });
      }
    });
  },

  // 获取评论
  queryCommentList() {
    const that = this;
    const userId = this.data.userId || this.data.userInfo.userId;
    mcdj.queryCommentList({
      userId, pageSize: 1,
      success(data) {
        const commentList = data.results;
        const noMoreComment = data.noMore;
        const commentTotal = data.total;
        that.setData({
          commentList, noMoreComment, commentTotal
        })
      }
    })
  },

  // 获取寄养家庭资料
  queryAdopterInfo() {
    const that = this;
    my.showNavigationBarLoading();
    const userId = this.data.userId;
    mcdj.getKeepPet({
      userId,
      success(data) {
        const userVo = data.userVo;

        const isFamilySetUp = userVo.userId == that.data.userInfo.userId && that.data.isFamily;

        // 描述的图片
        const picturesPath = userVo.adoptionVo && userVo.adoptionVo.petPhoto ? userVo.adoptionVo.petPhoto.split(',') : [];
        const swiperPicturesPath = [];
        for (let i in picturesPath) {
          const str = picturesPath[i];
          const index = str.lastIndexOf('/');
          const str1 = str.slice(0, index);
          const str2 = str.slice(index);
          const swiperStr = str1 + '/plain' + str2;
          picturesPath[i] = picturesPath[i] + '?x-oss-process=style/watermarkStyle';
          swiperPicturesPath.push(swiperStr);
        }
        // 地址
        const address = userVo.adoptionVo && userVo.adoptionVo.address ? userVo.adoptionVo.address.split(':')[1] : '';
        const addressName = address && address.split('-')[0] || '地址';
        //价格
        let catPrice = null;
        const dogPriceArr = [];
        const priceList = userVo.adoptionVo && userVo.adoptionVo.priceList || [];
        for (let i in priceList) {
          if (priceList[i].petType == 3) {
            catPrice = priceList[i].fosterAmount;
          } else {
            dogPriceArr.push(priceList[i])
          }
        }
        //配套周边
        const nearbyEnvironment = userVo.adoptionVo && userVo.adoptionVo.nearbyEnvironment ? userVo.adoptionVo.nearbyEnvironment.split(',') : [];
        const isElevator = nearbyEnvironment.indexOf('电梯') >= 0;
        const isAirConditioner = nearbyEnvironment.indexOf('空调环境') >= 0;
        const isBalcony = nearbyEnvironment.indexOf('封闭阳台') >= 0;
        const isPrivateGarden = nearbyEnvironment.indexOf('私人花园') >= 0;
        const isCommunityGarden = nearbyEnvironment.indexOf('小区花园') >= 0;
        const isPark = nearbyEnvironment.indexOf('附近公园') >= 0;
        const isSquare = nearbyEnvironment.indexOf('广场') >= 0;
        const isTraffic = nearbyEnvironment.indexOf('交通便利') >= 0;
        //提供物品
        const catGoods = userVo.adoptionVo && userVo.adoptionVo.catGoods ? userVo.adoptionVo.catGoods.split(',') : [];
        const isCatTableware = catGoods.indexOf('食具') >= 0;
        const isCatNest = catGoods.indexOf('窝') >= 0;
        const isCatLitter = catGoods.indexOf('猫砂') >= 0;
        const isCatToy = catGoods.indexOf('玩具') >= 0;
        const isCatWater = catGoods.indexOf('饮用水') >= 0;
        const dogGoods = userVo.adoptionVo && userVo.adoptionVo.dogGoods ? userVo.adoptionVo.dogGoods.split(',') : [];
        const isDogTableware = dogGoods.indexOf('食具') >= 0;
        const isDogNest = dogGoods.indexOf('窝') >= 0;
        const isDogTractionRope = dogGoods.indexOf('牵引绳') >= 0;
        const isDogToy = dogGoods.indexOf('玩具') >= 0;
        const isDogWater = dogGoods.indexOf('饮用水') >= 0;
        // 活动区域
        const activityArea = userVo.adoptionVo && userVo.adoptionVo.activityArea ? userVo.adoptionVo.activityArea.split(',') : [];

        // 可收寄宠物
        const petTypeArr = userVo.adoptionVo && userVo.adoptionVo.petType ? userVo.adoptionVo.petType.split(',') : [];
        that.setData({
          userVo,
          isFamilySetUp,
          picturesPath,
          swiperPicturesPath,
          addressName,

          catPrice,
          dogPriceArr,

          isElevator,
          isAirConditioner,
          isBalcony,
          isPrivateGarden,
          isCommunityGarden,
          isPark,
          isSquare,
          isTraffic,

          isCatTableware,
          isCatNest,
          isCatLitter,
          isCatToy,
          isCatWater,

          isDogTableware,
          isDogNest,
          isDogTractionRope,
          isDogToy,
          isDogWater,

          activityArea,
          petTypeArr,
          isok: true,
        });
        my.hideNavigationBarLoading();
      }
    });
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
    this.queryFamilyCalendar();
  },
  getDateStr(date) {
    const time = new Date(date);
    const day = Math.ceil((time - new Date(this.data.nowDate)) / 86400000) || 0;
    let str = day > 2 ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][time.getDay()] : ['今天', '明天', '后天'][day];
    return str;
  },
  queryFamilyCalendar() {
    const that = this;
    const { startTime, endTime } = this.data;
    const userId = this.data.userId || this.data.userInfo.userId;
    mcdj.queryFamilyCalendar({
      userId, startTime, endTime,
      success(res) {
        const maxFosterCat = res.data.maxFosterCat;
        const maxFosterDog = res.data.maxFosterDog;
        that.setData({
          maxFosterCat, maxFosterDog
        })
      }
    })
  },

  // 预览图片
  previewImage(e) {
    const that = this;
    const { currentTarget: { dataset: { index } } } = e;
    my.previewImage({
      current: index,
      urls: that.data.picturesPath,
    });
  },

  // 全部环境悬浮框
  environmentChange() {
    this.setData({
      isShowEnvironment: !this.data.isShowEnvironment
    })
  },

  // 打开地址位置
  openLocation() {
    if (!my.canIUse('openLocation')) {
      mcdj.showToast('该版本不支持openLocation', 3);
      return;
    }
    const d = this.data.userVo.adoptionVo;
    const addressStr = d.address.split('-')[0];
    const address = addressStr.split(':')[0];
    const name = addressStr.split(':')[1] || '家庭地址';
    console.log(name)
    console.log(address)
    console.log(d.lngPoint)
    console.log(d.latPoint)
    my.openLocation({
      longitude: d.lngPoint,
      latitude: d.latPoint,
      name,
      address,
    });
  },

  // 展示全部描述
  showAllDescribe() {
    this.setData({
      isShowAllDescribe: !this.data.isShowAllDescribe
    })
  },

  // 升级
  upgrade() {
    mcdj.showToast('暂未开放', 3);
  },

  // 查看所有评论
  toCommentList() {
    const userVo = this.data.userVo;
    my.navigateTo({
      url: `/pages/comment/list/list?userId=${userVo.userId}`
    });
  },

  // 留言
  leaveWord() {
    const userVo = this.data.userVo;
    if (userVo.userId == this.data.userInfo.userId) {
      mcdj.showToast('不可以和自己联系', 2);
      return;
    }
    my.navigateTo({
      url: `/pages/news/display/display?userId=${userVo.userId}&userName=${userVo.nickName}`
    });
  },

  // 关注
  familyFollow(e) {
    const that = this;
    const followUserId = this.data.userId;
    mcdj.showLoading();
    mcdj.familyFollow({
      followUserId,
      success(data) {
        my.hideLoading();
        that.setData({
          'userVo.isFollow': data.res
        })
      }
    })
  },

  // 下单
  toFosterage(e) {
    const { currentTarget: { dataset: { category, num } } } = e; //category：0是猫1是狗 
    const { userId, startTime, endTime, startStr, endStr, countDay } = this.data;
    if (!userId || userId == this.data.userInfo.userId) {
      mcdj.showToast('不能给自己下单', 2);
      return;
    }
    const fosterFoundObj = JSON.stringify({ userId, startTime, endTime, startStr, endStr, countDay, category, maxNum: num });
    my.redirectTo({
      url: `/pages/fosterage/found/found?obj=${fosterFoundObj}`
    })
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

  // 编辑家庭信息
  edit() {
    my.showActionSheet({
      items: ['更改家庭资料', '变更家庭地址（变更需审核）'], // 菜单按钮文字数组
      success(res) {
        if (res.index == 0) {
          my.navigateTo({
            url: '/pages/family/base/base'
          });
        } else if (res.index == 1) {
          my.navigateTo({
            url: '/pages/family/familyInfo/familyInfo'
          });
        }
      },
    });
  },

  // 分享
  onShareAppMessage() {
    const userVo = this.data.userVo;
    const familyName = userVo.adoptionVo.familyName;
    return {
      title: `${familyName}寄养家庭开张了`,
      desc: '把您家主子交给我，我会给它家的温暖和爱心的陪伴，让您放心出行，安心远游。',
      path: `pages/family/display/display?userId=${this.data.userId}`
    };
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },


});
