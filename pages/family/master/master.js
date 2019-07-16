

import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {
    gradeArr: ['未评星', '一星家庭', '二星家庭', '三星家庭', '四星家庭', '五星家庭']
  },

  onLoad(options) {
    const that = this;
    // options.userId = 438;
    const userId = options && options.userId ? options.userId : null;

    this.setData({ userId, isShowToIndex: getCurrentPages().length === 1 });
  },

  onShow() {
    const that = this;
    if (!isNoFirst) {
      isNoFirst = true;
      app.globalData.isAnew = 0;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo
          })
          that.myPetsList();
          that.queryAdopterInfo();
        }, fail() {
          my.navigateBack();
        }
      })
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

  // 获取寄养家庭资料
  queryAdopterInfo() {
    const that = this;
    my.showNavigationBarLoading();
    const userId = this.data.userId;
    mcdj.getKeepPet({
      userId,
      success(data) {
        const userVo = data.userVo;

        //技能
        const skillAptitudeArr = userVo.adoptionVo && userVo.adoptionVo.skillAptitude ? userVo.adoptionVo.skillAptitude.split(',') : [];

        that.setData({
          userVo,
          skillAptitudeArr,
          isok: true,
        });
        my.hideNavigationBarLoading();
      }
    });
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },


});
