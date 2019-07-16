

import mcdj from '../../../others/js/interface_mc';
import qcloud from '../../../others/qcloud-weapp-client-sdk/index';

const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},

  onLoad(options) {
    const petName = options.petName;
    this.setData({ petName })
    console.log(petName)
    this.queryPetBaike();
  },

  queryPetBaike() {
    const that = this;
    my.showNavigationBarLoading();
    const petVarietyName = this.data.petName;
    qcloud.request({
      url: 'https://test.qipinke.com/petserver/api/common/queryPetBaike',
      data: { petVarietyName },
      success(res) {
        if (res.data.resultCode == 'Y') {
          const baike = res.data.baike;
          console.log(baike)
          that.setData({
            baike, isok: true
          })
        } else {
          mcdj.showToast(res.data.resultMsg, 3, 3000);
          console.log(res.data.resultMsg)
        }
      },
      fail(error) {
        my.alert({
          content: "网络请求出错"
        });
        console.log(error)
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const that = this;
    const { currentTarget: { dataset: { index } } } = e;
    my.previewImage({
      current: index,
      urls: that.data.baike.pictures,
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `给你介绍一下${this.data.petName}`,
      desc: '更多不认识的宠物，识别一下就知道了',
      path: `../display/display?petName=${this.data.petName}`
    };
  },

  // 保存formId
  setFormId(e) {
    mcdj.setFormId(e);
  },


});
