

import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;
Page({
  data: {
    tabs: [{
      text: '服务',
      num: '1'
    }, {
      text: '评价',
      state: '30'
    }, {
      text: '个人资料',
    }],
    tabsWidth: 750,   //单位为rpx的大小,因为translateX暂不支持rpx
    sliderWidth: 80,  //需要设置slider的宽度，用于计算中间位置,一般是屏幕宽度除以tabs的个数
    activeIndex: "0",
    sliderOffset: 0,
    sliderLeft: 0,

    // 评论
    commentIndex: 0
  },

  onLoad(options) {
    const that = this;
    // options.userId = 177493;
    const userId = options && options.userId ? options.userId : null;
    const isFamily = mcdj.getStorageSync('isFamily') || null;
    const location = app.globalData.location || mcdj.getStorageSync(app.storagekey.locationKey) || {};


    this.setData({
      userId, isFamily,
      isShowToIndex: getCurrentPages().length === 1,
      latPoint: location.latitude,
      lngPoint: location.longitude,
    });

    this.initTabs();      // 初始化标题导航栏的tbas
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
            userInfo
          })
          that.userHomeInfo();
          that.myPetsList();
          that.initList();
        }, fail() {
          that.setData({ isNoAuth: true, isok: false });
        }
      })
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.loading) {
      if (this.data.activeIndex == 0) {
        this.loadServer();
      } else if (this.data.activeIndex == 1) {
        this.loadComment();
      }
    }
  },

  // 用户主页信息
  userHomeInfo() {
    const that = this;
    const userId = this.data.userId;
    const latPoint = this.data.latPoint;
    const lngPoint = this.data.lngPoint;
    mcdj.userHomeInfo({
      latPoint, lngPoint, userId,
      success(data) {
        const usersVo = data.usersVo;
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

  // 初始化列表
  initList() {
    if (this.data.activeIndex == 0) {
      this.initServer();
    } else if (this.data.activeIndex == 1) {
      this.initComment();
    }
  },

  // 初始化服务列表
  initServer() {
    this.setData({
      loading: false,
      pageServer: 0,
      listServer: [],
      nomoreServer: false,
      totalServer: 0
    });
    my.showNavigationBarLoading();
    this.loadServer();
  },

  // 加载服务列表
  loadServer() {
    const that = this;
    if (!this.data.nomoreServer) {
      const userId = this.data.userId;

      const page = this.data.pageServer + 1;
      this.setData({
        loading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryTrainServiceList({
        page, userId,
        success(data) {
          const pageServer = data.page;
          const nomoreServer = data.noMore;
          const listServer = that.data.listServer.concat(data.results);
          const totalServer = data.total;
          console.log(listServer);
          that.setData({ listServer, pageServer, nomoreServer, totalServer, loading: false });
          my.hideNavigationBarLoading();
          my.stopPullDownRefresh();
        }
      });
    }
  },

  // 初始化评论列表
  initComment() {
    this.setData({
      loading: false,
      pageComment: 0,
      listComment: [],
      nomoreComment: false,
      totalComment: null
    })
    this.loadComment();
  },

  // 加载评论列表
  loadComment() {
    const that = this;
    if (!this.data.nomoreComment) {
      const userId = this.data.userId;
      const comment = this.data.commentIndex || null;
      const page = this.data.pageComment + 1;
      this.setData({
        loading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryUserCommentList({
        userId,
        comment,
        page,
        pageSize: 10,
        success(data) {
          const pageComment = data.page;
          const nomoreComment = data.noMore;
          const listComment = that.data.listComment.concat(data.results);
          const totalComment = data.total;
          console.log(listComment);
          that.setData({ listComment, pageComment, nomoreComment, totalComment, loading: false });
          my.hideNavigationBarLoading();
          my.stopPullDownRefresh();
        }
      });
    }
  },

  // 切换评论列表的标签
  commentTabClick(e) {
    const commentIndex = e.currentTarget.dataset.index;
    this.setData({
      commentIndex
    })
    this.initList();
  },

  // 管理员删除违规评价
  delOrderComment(e) {
    const that = this;
    const index = e.currentTarget.dataset.index;
    const listComment = this.data.listComment;
    const commentType = listComment[index].commentType;
    const commentId = listComment[index].commentId;
    const content = listComment[index].commentContent;
    my.confirm({
      title: "删除提示",
      content: `是否确认删除评价内容为‘${content}’的评价信息`,
      success: (res) => {
        if (res.confirm) {
          mcdj.showLoading();
          mcdj[commentType == 1 ? "delOrderComment" : "delTrainerComment"]({
            commentId,
            success(data) {
              my.hideLoading();
              mcdj.showToast('已删除', 2);
              listComment.splice(index, 1);
              that.setData({
                listComment
              })
            }
          })
        }
      },
    });
  },

  // 关注
  userFollow(e) {
    const that = this;
    const followUserId = this.data.userId;
    mcdj.showLoading();
    mcdj.userFollow({
      followUserId,
      success(data) {
        my.hideLoading();
        that.setData({
          'usersVo.isFollow': data.res
        })
      }
    })
  },

  // 打开地址位置
  openLocation() {
    const d = this.data.usersVo;
    if (!my.canIUse('openLocation')) {
      mcdj.showToast('该版本不支持openLocation', 3);
      return;
    } else if (!d.address || !d.addressLng || !d.addressLat) {
      return;
    }
    const addressStr = d.address.split('-')[0];
    const address = addressStr.split(':')[0];
    const name = addressStr.split(':')[1] || '家庭地址';
    console.log(name)
    console.log(address)
    console.log(d.addressLng)
    console.log(d.addressLat)
    my.openLocation({
      longitude: d.addressLng,
      latitude: d.addressLat,
      name,
      address,
    });
  },

  // 编辑
  editUserInfo() {
    my.navigateTo({
      url: "/pages/my/userInfo/userInfo"
    });
  },

  // 服务详情
  toServerDisplay(e) {
    console.log(e.currentTarget.dataset.index);
    const index = e.currentTarget.dataset.index;
    const listServer = this.data.listServer;
    if (listServer[index].serviceType == 1) {
      my.navigateTo({
        url: "/pages/family/display/display?userId=" + listServer[index].trainServiceId
      })
    } else if (listServer[index].serviceType == 2) {
      my.navigateTo({
        url: "/pages/trainer/display/display?trainServiceId=" + listServer[index].trainServiceId
      })
    }
  },

  // 编辑服务
  editServer(e) {
    console.log(e.currentTarget.dataset.index);
    const index = e.currentTarget.dataset.index;
    const listServer = this.data.listServer;
    if (listServer[index].serviceType == 1) {
      this.editFamily();
    } else if (listServer[index].serviceType == 2) {
      my.navigateTo({
        url: "/pages/trainer/addServer/addServer?trainServiceId=" + listServer[index].trainServiceId
      })
    }
  },

  // 编辑家庭信息
  editFamily() {
    my.showActionSheet({
      items: ['更改家庭资料', '编辑家庭图片', '变更家庭地址（变更需审核）'], // 菜单按钮文字数组
      success(res) {
        if (res.index == 0) {
          my.navigateTo({
            url: '/pages/family/base/base'
          });
        } else if (res.index == 1) {
          my.navigateTo({
            url: '/pages/family/upload/upload'
          });
        } else if (res.index == 2) {
          my.navigateTo({
            url: '/pages/family/familyInfo/familyInfo'
          });
        }
      },
    });
  },

  // 服务管理
  toServerList() {
    my.navigateTo({
      url: "/pages/personal/serverList/serverList"
    });
  },

  // 分享
  onShareAppMessage() {
    const usersVo = this.data.usersVo;
    const nickName = usersVo.nickName;
    return {
      title: `嗨，我是${nickName}，您的宠物助手`,
      desc: '把您家主子交给我，我会给它家的温暖和爱心的陪伴。',
      path: `pages/personal/display/display?userId=${this.data.usersVo.userId}`
    };
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },

  // -------------------------------------初始化tabs----------------------------------------
  initTabs() {
    const that = this;
    my.getSystemInfo({
      success(res) {
        const px = res.windowWidth / 750;
        const windowHeight = res.windowHeight;
        that.setData({
          px,
          windowHeight,
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
