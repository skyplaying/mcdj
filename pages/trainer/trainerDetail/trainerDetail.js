import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isclick;
Page({
  data: {},
  onLoad(options) {
    const that = this;
    // options.trainServiceId = 177493;
    const trainerDetail = options && options.trainerDetail ? options.trainerDetail : '';
    this.setData({ trainerDetail });
  },

  // 输入训练详情
  inputDescribe(e) {
    this.setData({ trainerDetail: e.detail.value });
  },

  // 保存
  save() {
    const that = this;
    mcdj.textRiskIdentification(function () {
      if (isclick) return;
      isclick = true;

      let data = mcdj.getStorageSync('addServer') || {};
      data.trainerDetail = that.data.trainerDetail;

      console.log(data)
      mcdj.setStorageSync('addServer', data);

      isclick = false;
      my.navigateBack();
    }, that.data.trainerDetail, '训练详情')
  },

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
