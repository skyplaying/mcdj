
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},
  onLoad(options) {
    const petId = options.petId || 1997;
    this.setData({
      petId
    })
  },
  onShow() {
    const that = this;
    const isNoAnewMyPetList = mcdj.getStorageSync('isNoAnewMyPetList');
    if (!isNoFirst || !isNoAnewMyPetList) {
      isNoFirst = true;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo
          })
        }
      })
      this.petInfo();
    }
  },
  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 获取宠物详情
  petInfo() {
    const that = this
    const petId = this.data.petId;
    mcdj.petInfo({
      petId,
      success(data) {
        const petInfoVo = data.petInfoVo;
        console.log(petInfoVo)
        // 已失效的宠物则返回或者回宠物列表
        if (petInfoVo.isEnable == 0) {
          my.showToast({
            content: '该宠物信息已失效',
            type: 'none',
            success(res) {
              if (getCurrentPages().length == 1)
                my.redirectTo({
                  url: '../list/list'
                })
              else my.navigateBack();
            },
          })
          return;
        }

        const petPhotosList = petInfoVo.petPhotosList;
        const swiperPetPhotosList = [];
        for (let i in petPhotosList) {
          const str = petPhotosList[i];
          const index = str.lastIndexOf('/');
          const str1 = str.slice(0, index);
          const str2 = str.slice(index);
          const swiperStr = str1 + '/plain' + str2;
          petPhotosList[i] = petPhotosList[i] + '?x-oss-process=style/watermarkStyle';
          swiperPetPhotosList.push(swiperStr);
        }
        that.setData({
          petInfoVo,
          petPhotosList,
          swiperPetPhotosList,
          isok: true
        })
      },
    })
  },

  // 预览图片
  previewImage(e) {
    const urls = this.data.petInfoVo.petPhotosList;
    my.previewImage({
      urls,
      current: e.currentTarget.dataset.index,
    });
  },

  // 编辑
  edit() {
    const petId = this.data.petInfoVo.petId;
    my.navigateTo({
      url: `../found/found?petId=${petId}`
    });
  },

  // 举报
  report() {
    const that = this;
    const petId = that.data.petId;
    mcdj.confirm(function () {
      mcdj.savePetReport({
        petId,
        success() {
          mcdj.showToast('已举报', 3);
        }
      })
    }, '是否举报该宠物');
  },

  // 查看主人
  seeMaster() {
    // const pages = getCurrentPages();
    // if (pages[pages.length - 2].route.indexOf('family/display/display') >= 0) {
    //   my.navigateBack();
    // } else {
    //   my.redirectTo({
    //     url: '/pages/register/display/display?userId=' + this.data.petsVo.usersVo.userId,
    //   })
    // }
  },

  // 保存二维码
  setFormId(e) {
    wk.setFormId(e);
  },

})







// import mc from '../../../others/js/weui_mc';

// const app = getApp();

// let selectPetId;

// Page({
//   data: {
//     showloading: false,
//     commentPage: 0,
//     commentList: [],
//     shownomoreComment: false,

//     giftArr: [],
//   },

//   // 初始化
//   initialise(cb) {
//     this.initialiseList();

//     this.getUserMajorInfo();
//     this.queryPetInfo(cb);
//     this.queryPetCommentList();
//   },

//   // 初始化列表（清空已存在的列表）
//   initialiseList() {
//     this.setData({
//       showloading: false,
//       commentPage: 0,
//       commentList: [],
//       shownomoreComment: false,
//     });
//   },

//   onLoad(options) {
//     const that = this;
//     // options.petId = 16
//     // options.petId = 444

//     const petId = options.petId;
//     const giftArr = app.globalData.petGift

//     this.setData({ petId, giftArr });


//     const cb = (userInfo) => {
//       that.setData({ userInfo });
//       this.initialise();
//       this.getPetList();
//     };
//     app.doLogin(cb);
//   },

//   // 下拉刷新
//   onPullDownRefresh() {
//     const cb = () => { my.stopPullDownRefresh(); };
//     this.initialise(cb);
//   },

//   // 上拉加载
//   onReachBottom() {
//     if (!this.data.showloading) {
//       this.queryPetCommentList();
//     }
//   },

//   onShow() {

//     // 弹出选择框时调用onShow说明是跳转添加宠物，所以要刷新我的宠物列表
//     if (this.data.isShowMyPet) {
//       this.getPetList();
//     }
//   },

//   // 获取我可配对的宠物列表
//   getPetList(cb) {
//     const that = this;
//     const cb1 = (myPetList) => {
//       that.setData({ myPetList });
//       console.log(that.data.myPetList);
//       typeof cb == 'function' && cb();
//     };
//     mc.myPets(cb1, 1);
//   },
//   // 选择宠物
//   showMyPet() {
//     this.setData({ isShowMyPet: true })
//   },
//   // 悬浮框选择宠物
//   hiddenMyPet() {
//     this.setData({ isShowMyPet: false })
//   },
//   // 选中宠物
//   selectMyPet(e) {
//     const that = this;
//     const selectPetIndex = e.currentTarget.dataset.index;
//     const selectPetId = this.data.myPetList[selectPetIndex].petId;
//     const aPetId = this.data.petInfoVo.petId;
//     const cb = () => {
//       mc.showToast('已钟意');
//       that.setData({ isShowMyPet: false });
//     }
//     mc.savePairLike(cb, aPetId, selectPetId);
//   },

//   // 获取宠物信息
//   queryPetInfo(cb) {
//     const that = this;
//     const petId = this.data.petId;
//     mc.showLoading();
//     const cb1 = (data) => {
//       const d = data.petInfoVo;
//       console.log(d);

//       // 是否关注和是否点赞及相关数
//       const isFollow = d.isFollow;
//       const isLikes = d.isLikes;
//       const followCount = d.followCount;
//       const likesCount = d.likesCount;

//       // 最后一次打赏的礼物
//       const rewardAmount = d.rewardAmount;
//       let olrGiftIndex = rewardAmount ? Math.floor((parseFloat(rewardAmount) - 0.01) / 0.25) : null;

//       that.setData({
//         petInfoVo: d,
//         isOk: true,
//         isFollow, isLikes, followCount, likesCount, olrGiftIndex
//       });
//       my.hideLoading();
//       typeof cb == 'function' && cb();
//     };
//     mc.petInfo(cb1, petId);
//   },

//   // 获取宠物评价列表
//   queryPetCommentList() {
//     const that = this;
//     const petId = this.data.petId;
//     const commentPage = this.data.commentPage + 1;
//     if (!this.data.shownomoreComment) {
//       that.setData({ showloading: true });
//       const cb = (list, page, ifNoMore) => {
//         const newlist = that.data.commentList.concat(list);
//         that.setData({ commentList: newlist, commentPage: page, showloading: false });
//         if (ifNoMore) that.setData({ shownomoreComment: true });
//       };
//       mc.queryPetCommentList(cb, 10, commentPage, petId);
//     }
//   },

//   // 获取用户隐私信息
//   getUserMajorInfo() {
//     const that = this;
//     const cb = (data) => {
//       that.setData({ majorInfo: data.userInfo })
//     };
//     mc.getUserMajorInfo(cb);
//   },

//   // 预览图片
//   previewImage(e) {
//     const that = this;
//     const { currentTarget: { dataset: { index } } } = e;
//     my.previewImage({
//       current: index,
//       urls: this.data.petInfoVo.petPhotosList,
//     });
//   },

//   // 预览头像
//   previewAvatar(e) {
//     const that = this;
//     my.previewImage({
//       current: 0,
//       urls: this.data.petInfoVo.petAvatar.split(','),
//     });
//   },

//   // 生成随机打赏金额和相应的礼物
//   generateRewardAmount() {
//     let rewardAmount = (Math.random() + 0.01).toFixed(2);
//     rewardAmount = rewardAmount > 1 ? 1.00 : rewardAmount;
//     let giftIndex = app.queryGiftByReward(rewardAmount);
//     console.log(giftIndex)
//     this.setData({ rewardAmount, giftIndex });
//   },

//   // 显示打赏浮动框
//   showReward() {
//     this.generateRewardAmount()
//     this.setData({ isShowReward: true });
//   },
//   // 关闭打赏
//   closeReward() {
//     this.setData({ isShowReward: false });
//   },
//   // 刷新打赏
//   refreshReward() {
//     this.generateRewardAmount()
//   },
//   //打赏宠物
//   rewardPet() {
//     console.log(this);
//     const that = this;
//     const petId = that.data.petId
//     const rewardAmount = that.data.rewardAmount
//     // 支付宝支付的回调
//     const cb = (data) => {
//       if (data.orderStr) {
//         mc.tradePay(that.rewardSuccess(), null, data.orderStr);
//       } else {
//         mc.alert('暂时无法打赏');
//       }
//     };
//     if (that.data.majorInfo.balance < rewardAmount) {
//       mc.savePetReward(cb, petId, rewardAmount);
//       return
//     }
//     my.showActionSheet({
//       title: '支付方式',
//       items: ['萌宠余额', '支付宝'],
//       success: (res) => {
//         if (res.index == 0) {
//           mc.savePetReward(that.rewardSuccess(), petId, rewardAmount, 0);
//         } else if (res.index == 1) {
//           mc.savePetReward(cb, petId, rewardAmount);
//         }
//       },
//     });
//   },

//   // 打赏成功后执行显示动效
//   rewardSuccess() {
//     const that = this;
//     const cb = () => {
//       that.setData({
//         isShowReward: false,
//         'petInfoVo.rewardUserName': that.data.userInfo.nickName,
//         olrGiftIndex: that.data.giftIndex,
//         isShowRewardAnimation: true
//       });
//       setTimeout(function () {
//         that.setData({ isShowRewardAnimation: false })
//       }, 3000);
//       my.vibrate();
//     };
//     return cb;
//   },

//   // 关注/取关
//   follow() {
//     const that = this;
//     const cb = (data) => {
//       const isFollow = data.status;
//       const followCount = data.status ? that.data.followCount + 1 : that.data.followCount - 1;
//       if (isFollow) {
//         mc.showToast('已关注');
//       } else {
//         mc.showToast('已取消关注');
//       }
//       that.setData({ isFollow, followCount });
//     };

//     mc.petFollow(cb, this.data.petId);
//   },

//   // 点赞/取消点赞
//   likes() {
//     const that = this;
//     const cb = (data) => {
//       const isLikes = data.status;
//       const likesCount = data.status ? that.data.likesCount + 1 : that.data.likesCount - 1;
//       if (isLikes) {
//         mc.showToast('已点赞');
//       } else {
//         mc.showToast('已取消点赞');
//       }
//       that.setData({ isLikes, likesCount });
//     };

//     mc.petLikes(cb, this.data.petId);
//   },

//   // 举报
//   report() {
//     const that = this;
//     const cb = () => {
//       const cb1 = () => {
//         mc.showToast('举报成功');
//       };
//       mc.savePetReport(cb1, that.data.petId);
//     };
//     mc.confirm('是否举报该宠物', cb);
//   },

//   // 分享
//   onShareAppMessage() {
//     const d = this.data.petInfoVo
//     return {
//       title: '萌宠到家',
//       desc: d.petVarietyName + d.petName + '正在召唤你哦！',
//       path: 'pages/pet/display/display?petId=' + this.data.petId
//     };
//   },

//   // 保存formId
//   setFormId(e) {
//     app.setFormId(e);
//   },

//   toFound() {
//     mc.alert('该功能暂未开放，敬请期待')
//   },


// });
