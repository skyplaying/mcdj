

import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},

  onLoad(options) {
    const that = this;
    // options.userId = 177493;
    const userId = options && options.userId ? options.userId : null;

    this.setData({
      userId,
    });
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const that = this;
    if (!isNoFirst) {
      isNoFirst = true;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo
          })
          that.getUserInfo();
          that.myPetsList();
        }
      })
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 用户主页信息
  getUserInfo() {
    const that = this;
    const userId = this.data.userId;
    mcdj.getUserInfo({
      userId,
      success(data) {
        const usersVo = data.userInfo;
        that.setData({
          usersVo, isok: true
        })
      },
    })
  },

  // 宠物列表
  myPetsList() {
    const that = this;
    const userId = this.data.userId;
    mcdj.myPets({
      userId,
      success(myPetList) {
        that.setData({
          myPetList,
        });
      }
    });
  },

  // Ta的服务主页
  toUserHome() {
    my.navigateTo({
      url: "/pages/personal/display/display?userId=" + this.data.userId
    })
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },


});
