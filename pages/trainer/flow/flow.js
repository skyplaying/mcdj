
import mc from '/others/js/weui_mc';
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},
  onLoad(options) {
    const that = this;
    // options.userId = 2;
    const inviteUserId = options && options.userId ? options.userId : null;
    if (inviteUserId) {
      this.inviteFamily(inviteUserId);
    }
  },
  onShow() {
    const that = this;
    app.doLogin({
      success(userInfo) {
        console.log(userInfo);
        that.setData({ userInfo })
        if (!userInfo.isBindPhone) {
          my.alert({
            content: '您还未绑定手机，请先前往绑定手机',
            buttonText: '绑定手机',
            success() {
              my.navigateTo({
                url: '/pages/colligate/bindPhone/bindPhone'
              })
            },
          });
        } else {
          that.userHomeInfo();
          that.trainInfo();
        }
      }
    })
  },
  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 获取训练师详情
  trainInfo() {
    const that = this;
    mcdj.trainInfo({
      success(data) {
        const trainerVo = data.trainerVo || {};
        console.log(trainerVo);

        // 资格认证是否已完成
        const noDisabled1 = trainerVo.grade && trainerVo.experience && trainerVo.serviceMode
          && trainerVo.qualificationsPath ? true : false;

        // 上传视频是否已完成
        const noDisabled2 = trainerVo.trainingVideoPath ? true : false;

        that.setData({
          trainerVo,
          isok: true,

          noDisabled1,
          noDisabled2,
        });
        that.isCanSubmit();
      }
    });
  },

  // 用户主页信息
  userHomeInfo() {
    const that = this;
    mcdj.userHomeInfo({
      success(data) {
        const usersVo = data.usersVo;
        that.setData({
          usersVo
        })
      },
    })
  },

  // 保存邀请人
  inviteFamily(inviteUserId) {
    mcdj.inviteFamily({
      inviteUserId,
      success() {
        mcdj.showToast('已保存邀请人', 2);
      }
    })
  },

  toAuthentication() {
    if (!this.data.userInfo.isFaceRec) {
      my.navigateTo({ url: "/pages/colligate/authentication/authentication" });
    } else {
      mcdj.showToast('您已通过实名验证', 3);
    }
  },

  // 跳转协议
  toGuarantee(e) {
    my.navigateTo({
      url: '/pages/colligate/guarantee/guarantee?index=2',
    });
  },

  // 是否同意
  changeAgree(e) {
    this.setData({
      isAgree: !this.data.isAgree,
    });
    this.isCanSubmit();
  },

  // 是否可以提交审核
  isCanSubmit() {
    const d = this.data;
    const noDisabled = d.noDisabled1 && d.noDisabled2 && d.userInfo.isFaceRec && d.isAgree ? true : false;
    this.setData({
      noDisabled
    })
  },

  // 完成
  complete() {
    const that = this;
    this.isUserPerfect(function () {
      if (isclick) return
      isclick = true;
      mcdj.showLoading();
      mcdj.submitTrainReview({
        success() {
          mcdj.showToast('已提交', 2);
          app.doLogin({
            anew: 1,
            success(userInfo) {
              that.setData({
                userInfo, isShowPlow: null
              })
              that.trainInfo();
              my.hideLoading();
              isclick = false;
            }, fail() {
              isclick = false;
            }
          })
        }, fail() {
          isclick = false;
        }
      })
    })
  },

  // 进入流程
  intoFlow() {
    const that = this;
    this.isUserPerfect(function () {
      that.setData({
        isShowPlow: true
      })
    })
  },

  // 判断是否已完善个人信息
  isUserPerfect(cb) {
    const usersVo = this.data.usersVo;
    console.log(usersVo)
    if (usersVo.avatar && usersVo.nickName && usersVo.gender != undefined && usersVo.occupation && usersVo.ageGroup && usersVo.city && usersVo.profile && usersVo.address && usersVo.addressLng && usersVo.addressLat && usersVo.keptPetList && usersVo.keptPetList.length > 0) {
      typeof cb == "function" && cb();
    } else {
      my.confirm({
        title: '完善信息提示',
        content: "您还未完善个人信息，请先完善再继续申请",
        confirmButtonText: '马上完善',
        cancelButtonText: '暂不申请',
        success: (res) => {
          if (res.confirm) {
            my.navigateTo({
              url: "/pages/my/userInfo/userInfo"
            });
          }
        },
      });
    }
  },

  // 回首页
  toIndex() {
    my.switchTab({
      url: '/pages/index/index'
    });
  },

  // 联系客服
  customerService() {
    my.makePhoneCall({
      number: '075588823343',
    });
  },

  // 复制手机号
  handleCopy() {
    my.setClipboard({
      text: '13410633367',
      success() {
        mcdj.showToast('手机号已复制', 2);
      }
    });
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },


});
