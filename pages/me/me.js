import mcdj from '../../others/js/interface_mc';

const app = getApp()

Page({
  data: {},
  onLoad() {
    const isFamily = mcdj.getStorageSync('isFamily') || 0;
    this.setData({
      isFamily,
    })
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const that = this;
    my.showNavigationBarLoading();
    app.doLogin({
      anew: 1,
      success(userInfo) {
        console.log(userInfo);

        // 身份状态（0代表未提交过服务申请，1代表有已经通过审核的服务，2代表有且只有已提交审核的服务）
        let identityStatus = 2;
        if (userInfo.userCertifiedStatus == undefined && userInfo.trainReviewStatus == undefined) {
          identityStatus = 0;
        } else if (userInfo.userCertifiedStatus == 1 || userInfo.trainReviewStatus == 1) {
          identityStatus = 1;
        }
        console.log("1");

        my.hideNavigationBarLoading();
        that.setData({ userInfo, identityStatus, isok: true });

        if (identityStatus != 1 && that.data.isFamily) {
          mcdj.showToast('已自动帮您切回普通用户身份', 3);
          mcdj.setStorageSync('isFamily', 0);
          that.setData({
            isFamily: false
          })
          app.globalData.isAnewIdentity = 1;
          console.log("2");
        }
      }, fail(err) {
        my.hideNavigationBarLoading();
        that.setData({ isNoAuth: true, isok: false });
      }
    });
  },

  // 切换身份
  switchIdentity() {
    const that = this;
    const isFamily = !this.data.isFamily;
    my.confirm({
      title: '温馨提醒',
      content: `是否要切换身份为${isFamily ? '寄养家庭' : '宠物主人'}？`,
      success(res) {
        if (res.confirm) {
          mcdj.setStorageSync('isFamily', isFamily);
          that.setData({
            isFamily
          })
          app.globalData.isAnewIdentity = 1;
        }
      },
    });
  },

  // 联系客服
  customerService() {
    my.makePhoneCall({
      number: '075588823343',
    });
  },

  // 提升家庭星级
  promoteFamily() {
    mcdj.showToast('暂未开放', 3);
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },



});
