
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;

Page({
  data: {

  },
  data: {},
  onLoad(options) {
    const cityObj = app.globalData.cityObj || mcdj.getStorageSync('city') || {};
    this.setData({
      city: cityObj.city,
    })
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
        }
      })
      this.getHospitalList();
    }
  },
  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.loading)
      this.load();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.initList();
  },

  // 医院列表
  getHospitalList() {
    const that = this;
    my.showNavigationBarLoading();
    mcdj.getHospitalList({
      city: that.data.city + '市',
      success(data) {
        const hospitalList1 = data.hospitalList || [];
        if (hospitalList1.length == 0) {
          mcdj.getHospitalList({
            city: that.data.city,
            success(data) {
              const hospitalList2 = data.hospitalList || [];
              that.setData({
                hospitalList: hospitalList2,
                total: hospitalList2.length,
                isok: true
              });
              my.hideNavigationBarLoading();
              that.initList();
            }
          });
        } else {
          that.setData({
            hospitalList: hospitalList1,
            total: hospitalList1.length,
            isok: true
          });
          my.hideNavigationBarLoading();
          that.initList();
        }
      }
    });
  },

  // 初始化列表
  initList() {
    this.setData({
      loading: false,
      page: 0,
      list: [],
      nomore: false,
    });
    this.load();
  },

  // 加载列表
  load() {
    const that = this;
    if (!this.data.nomore) {
      const hospitalList = this.data.hospitalList;
      const page = this.data.page + 1;
      this.setData({
        loading: true
      })
      const addList = hospitalList.slice((page - 1) * 10, page * 10).map((item) => {
        const pic = "http://api.pet-city.cn" + item.store_pic;
        item.store_pic = pic;
        return item
      });
      const list = that.data.list.concat(addList);
      const nomore = (page * 10) >= this.data.total;
      console.log(list);
      that.setData({ list, page, nomore, loading: false });
      my.stopPullDownRefresh();
    }
  },


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
        that.getHospitalList();
      }, fail(err) {
        mcdj.alert(err);
      }
    });
  },

  // -------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
