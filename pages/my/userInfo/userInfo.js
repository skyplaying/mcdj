
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();
let isNoFirst, isclick;

Page({
  data: {
    profileKey: 'userProfile',
    varietiesKey: 'petVariety',
    addressKey: 'address',
    ageArr: ["10后", "00后", "90后", "80后", "70后", "60后"],

    noDisabled: true
  },

  onLoad() { },

  onShow() {
    const that = this;
    my.showNavigationBarLoading();
    app.doLogin({
      success(userInfo) {
        that.setData({
          userInfo,
        });
        // 修改个人资料
        if (isNoFirst) {
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
        my.hideNavigationBarLoading();

        that.userHomeInfo();
        if (userInfo.isBindPhone) {
          that.getUserMajorInfo();
        }
      }
    });
  },
  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 用户主页信息
  userHomeInfo() {
    const that = this;
    mcdj.userHomeInfo({
      success(data) {
        const usersVo = data.usersVo;
        if (isNoFirst) {
          that.setData({
            isExperience: usersVo.keptPetList && usersVo.keptPetList.length > 0,
          })
        } else {
          isNoFirst = true;

          const ageArr = that.data.ageArr;
          let ageIndex = null;
          if (usersVo.ageGroup)
            for (let i in ageArr) {
              if (ageArr[i] == usersVo.ageGroup) {
                ageIndex = i.toString();
                break;
              }
            }
          that.setData({
            isok: true,

            avatar: usersVo.avatar,
            nickName: usersVo.nickName,
            gender: usersVo.gender,
            occupation: usersVo.occupation,
            ageIndex,
            city: usersVo.city,
            profile: usersVo.profile,

            address: usersVo.address,
            addressName: usersVo.address ? usersVo.address.split(':')[1] : '',
            lngPoint: usersVo.addressLng,
            latPoint: usersVo.addressLat,
            isExperience: usersVo.keptPetList && usersVo.keptPetList.length > 0,
          })
        }
      },
    })
  },

  // 获取手机号
  getUserMajorInfo() {
    const that = this;
    mcdj.getUserMajorInfo({
      success(data) {
        console.log(data)
        const phoneNumber = data.userInfo.phoneNumber;
        that.setData({
          phoneNumber
        })
      }
    })
  },

  // 选择头像
  chooseAvatar() {
    const that = this;
    my.chooseImage({
      count: 1,
      success(res) {
        that.setData({
          avatar: res.apFilePaths[0],
        });
      },
    })
  },

  // 昵称
  inputNickName(e) {
    this.setData({ nickName: e.detail.value });
  },

  // 性别
  changeGender(e) {
    this.setData({
      gender: e.detail.value.toString(),
    });
  },

  // 职业
  inputOccupation(e) {
    this.setData({ occupation: e.detail.value });
  },

  // 年龄
  changeAge(e) {
    this.setData({
      ageIndex: e.detail.value.toString(),
    });
  },

  // 选择常居城市
  chooseCity() {
    if (!this.data.noDisabled) return;
    const that = this;
    my.chooseCity({
      showLocatedCity: true,
      success: (res) => {
        console.log(res)
        that.setData({
          city: res.city,
          adCode: res.adCode,
        });
      },
    });
  },

  // 个人简介
  inputProfile(e) {
    this.setData({ profile: e.detail.value });
  },

  // 绑定手机
  bindPhone() {
    if (!this.data.phoneNumber)
      my.navigateTo({
        url: '/pages/colligate/bindPhone/bindPhone'
      });
  },

  // 点击编辑
  edit() {
    this.setData({
      noDisabled: true
    })
  },


  // 提交发布内容
  submit(e) {
    console.log(e);
    const that = this;
    const d = this.data;
    if (isclick) return;

    if (!d.avatar) {
      mcdj.alert('请上传头像照片');
    } else if (!d.nickName) {
      mcdj.alert('昵称不可以为空');
    } else if (!d.gender) {
      mcdj.alert('请选择性别');
    } else if (!d.occupation) {
      mcdj.alert('请填写职业');
    } else if (!d.ageIndex) {
      mcdj.alert('请选择年龄');
    } else if (!d.city) {
      mcdj.alert('请选择常居城市');
    } else if (!d.profile) {
      mcdj.alert('请完善个人简介');
    } else if (!d.address) {
      mcdj.alert('请选择家庭住址');
    } else if (!d.lngPoint || !d.latPoint) {
      mcdj.alert('请重新选择家庭住址');
    } else if (!d.isExperience) {
      mcdj.alert('请完善宠物信息');
    } else if (!d.userInfo.isBindPhone) {
      mcdj.alert('请进行手机绑定');
    } else {
      // mcdj.textRiskIdentification(function () {
      //   mcdj.textRiskIdentification(function () {
      //     mcdj.textRiskIdentification(function () {
      isclick = true;

      // 文件上传
      let urls = utils.formatFilePath("avatar", that.data.avatar.split(','), { dirmkStr: 'userInfo/avatar', "userId": that.data.userInfo.userId });

      mcdj.uploadFile({
        urls,
        success(data) {
          let avatar = null;
          if (that.data.avatar)
            avatar = data['avatar'];
          that.setData({
            avatar
          });
          that.saveUserInfo();
        },
        fail() {
          isclick = false;
        }
      })
      //     }, that.data.profile, '个人简介');
      //   }, that.data.occupation, '职业');
      // }, that.data.nickName, '昵称');
    }
  },

  // 保存用户个人资料
  saveUserInfo() {
    const that = this;
    const d = this.data;

    const data = {
      avatar: d.avatar,
      nickName: d.nickName,
      gender: d.gender,
      occupation: d.occupation,
      ageGroup: d.ageArr[d.ageIndex],
      city: d.city,
      profile: d.profile,

      address: d.address,
      addressLng: d.lngPoint,
      addressLat: d.latPoint,
    };
    mcdj.showLoading();
    mcdj.saveUser({
      data,
      success(data) {
        isclick = false;
        my.hideLoading();
        that.setData({
          noDisabled: false
        })
        app.doLogin({
          anew: 1,
          success() {
            mcdj.showToast('保存成功', 3, null, function () {
              my.navigateBack();
            });
          }
        })
      },
      fail(err) {
        isclick = false;
      },
    })
  },

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
