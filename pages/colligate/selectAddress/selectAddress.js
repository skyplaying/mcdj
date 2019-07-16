
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

Page({
  data: {
    defaultIndex: 0,
  },

  onLoad(options) {
    const that = this;

    const key = options.key || 'address';
    this.setData({ key });
  },

  onShow() {
    this.queryCommonAddress();
  },

  // 地址列表
  queryCommonAddress() {
    const that = this;
    my.showNavigationBarLoading();
    mcdj.queryCommonAddress({
      success(commentList) {
        console.log(commentList);
        that.setData({ commentList });
        my.hideNavigationBarLoading();
      }
    });
  },

  // 是否设为默认
  changeDefault(e) {
    const that = this;
    const { currentTarget: { dataset: { index } } } = e;
    console.log(this.data.commentList[index]);
    const commonAddressId = this.data.commentList[index].commonAddressId;

    mcdj.showLoading();
    mcdj.saveCommonAddress({
      commonAddressId, isDefault: 1,
      success() {
        mcdj.setStorageSync(app.storagekey.defaultAddressKey, that.data.commentList[index]);
        that.setData({
          defaultIndex: index,
        });
        my.hideLoading();
      }
    })

  },

  // 删除地址
  deteleDefault(e) {
    const that = this;
    const { currentTarget: { dataset: { index } } } = e;
    const commonAddressId = this.data.commentList[index].commonAddressId;
    mcdj.showLoading('删除中');
    mcdj.confirm(function () {
      mcdj.delCommonAddress({
        commonAddressId,
        success() {
          const commentList = that.data.commentList;
          commentList.splice(index, 1);
          that.setData({ commentList });
          my.hideLoading();
        }
      });
    }, '是否确认要删除该常用地址？')
  },

  //选中地址
  select(e) {
    const that = this;
    const { currentTarget: { dataset: { index } } } = e;
    const address = this.data.commentList[index];
    mcdj.setStorageSync(this.data.key, address);
    my.navigateBack();
  },

  // 添加地址
  addAddress() {
    my.navigateTo({
      url: '../addAddress/addAddress'
    });
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },



});
