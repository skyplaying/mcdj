
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

Page({
  data: {},
  onLoad(options) {
    const that = this;

    app.doLogin({
      success(userInfo) {
        that.setData({
          userInfo
        })
        that.initList();
        that.trainInfo();
      }, fail() {
        my.navigateBack();
      }
    })
  },

  onShow() {
    // 页面被切换显示时，从数据中检查是否有页面B传递来的数据
    if (app.pageTrainerAddServer && app.pageTrainerAddServer.gotoPage === 'personalServerList') {
      // 从数据中获取回传给本页面的数据
      const data = app.pageTrainerAddServer.data;
      if (data.isAddServer) {
        this.initList();
        app.pageTrainerAddServer.data.isAddServer = false;
      }
    }
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.loading)
      this.loadList();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.initList();
  },

  // 获取接送价格
  trainInfo() {
    const that = this;
    mcdj.trainInfo({
      success(data) {
        const trainerVo = data.trainerVo;
        console.log(trainerVo);
        const runAboutAmount = trainerVo.runAboutAmount || trainerVo.runAboutAmount == 0 ? trainerVo.runAboutAmount : null;

        that.setData({
          isok: true,
          runAboutAmount,
        });
      }
    });
  },

  // 更改接送状态
  changeRunAboutAmount(e) {
    const value = e.detail.value;
    let runAboutAmount = this.data.runAboutAmount;
    runAboutAmount = value ? 1 : -1;
    this.saveRunAboutAmount(runAboutAmount);
  },

  // 修改接送价格
  inputRunAboutAmount(e) {
    const runAboutAmount = e.detail.value;
    this.saveRunAboutAmount(runAboutAmount);
  },

  // 保存接送价格
  saveRunAboutAmount(runAboutAmount) {
    const that = this;
    mcdj.showLoading();
    mcdj.saveTrain({
      data: {
        runAboutAmount
      },
      success(res) {
        my.hideLoading();
        mcdj.showToast('保存成功', 2);

        that.trainInfo();
      },
      fail(err) {
        isclick = false;
      },
    })
  },

  // 更改服务的上架状态
  changeServer(e) {
    const index = e.currentTarget.dataset.index;
    const isOrderTaking = e.detail.value ? 1 : 0;
    const list = this.data.list;
    if (list[index].serviceType == 1) {
      this.receiptChange(isOrderTaking, index);
    } else if (list[index].serviceType == 2) {
      this.saveTrainService(isOrderTaking, index);
    }
  },

  // 改变训宠师接单状态
  saveTrainService(trainStatus, index) {
    const that = this;
    const list = this.data.list;
    const trainServiceId = list[index].trainServiceId;
    mcdj.showLoading();
    mcdj.saveTrainService({
      data: {
        trainServiceId, trainStatus,
      },
      success() {
        my.hideLoading();
        list[index].trainStatus = trainStatus;
        that.setData({
          list
        })
      }
    })
  },

  // 改变寄养家庭接单状态
  receiptChange(isOrderTaking, index) {
    const that = this;
    const list = this.data.list;
    mcdj.showLoading();
    mcdj.orderSwitch({
      isOrderTaking,
      success(data) {
        my.hideLoading();
        list[index].trainStatus = isOrderTaking;
        that.setData({
          list
        })
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

  // 初始化列表
  initList() {
    this.setData({
      loading: false,
      page: 0,
      list: [],
      nomore: false,
    });
    my.showNavigationBarLoading();
    this.loadList();
  },

  // 加载列表
  loadList() {
    const that = this;
    if (!this.data.nomore) {
      const lngPoint = this.data.lngPoint;
      const latPoint = this.data.latPoint;

      const page = this.data.page + 1;
      this.setData({
        loading: true
      })
      my.showNavigationBarLoading();
      mcdj.queryTrainServiceList({
        page,
        success(data) {
          const page = data.page;
          const nomore = data.noMore;
          const list = that.data.list.concat(data.results);
          const total = data.total;
          console.log(list);
          that.setData({ list, page, nomore, total, loading: false });
          my.hideNavigationBarLoading();
          my.stopPullDownRefresh();
        }
      });
    }
  },

  // 保存二维码
  setFormId(e) {
    wk.setFormId(e);
  },

})