
import mcdj from '../../../others/js/interface_mc';

let key, petCategoryId;

Page({
  data: {},
  onLoad(options) {
    const that = this;
    key = options.key || 'petVariety';
    petCategoryId = options.petCategoryId || null;

    that.queryCategoryList();
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    key = undefined, petCategoryId = undefined
  },

  // 获取宠物类别
  queryCategoryList() {
    const that = this;
    my.showNavigationBarLoading();
    mcdj.queryCategoryList({
      success(categoryList) {
        petCategoryId = petCategoryId ? petCategoryId : categoryList[0].petCategoryId;
        that.setData({ categoryList, petCategoryId });
        my.hideNavigationBarLoading();
        that.queryVarietyList();
      }
    });
  },

  // 获取宠物品种
  queryVarietyList() {
    const that = this;
    const petVarietyName = that.data.petVarietyName;
    const petCategoryId = petVarietyName ? null : that.data.petCategoryId;
    my.showNavigationBarLoading();
    mcdj.queryByPetVarietyList({
      petCategoryId, petVarietyName,
      success(list) {
        that.setData({ varietyList: list });
        my.hideNavigationBarLoading();
      }
    });
  },

  // 选中类别
  selectCategory(e) {
    const petCategoryId = e.currentTarget.dataset.id;
    this.setData({ petCategoryId });
    this.queryVarietyList();
  },

  // 删除输入的内容
  clearInput() {
    this.setData({ petVarietyName: '' });
    const petCategoryId = this.data.petCategoryId;
    this.setData({ petCategoryId });
    this.queryVarietyList();
  },

  // 输入搜索内容
  inputTyping(e) {
    this.setData({ petVarietyName: e.detail.value });
    this.queryVarietyList();
  },

  // 选中品种
  selectVariety(e) {
    const { currentTarget: { dataset: { index } } } = e;
    const petVariety = this.data.varietyList[index];
    mcdj.setStorageSync(key, petVariety);
    my.navigateBack();
  },

});
