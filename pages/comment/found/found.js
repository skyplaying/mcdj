
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {
    array: ['养宠能力', '寄养环境', '沟通交流',],
    laberArr: ['有耐心', '很细心', '很懂宠物', '用品齐全', '房子干净', '有伴', '态度很好', '礼貌', '热情'],
    fractionArr: [],
    laberIndexs: [],
  },
  onLoad(options) {
    const that = this;
    const fosterOrderId = options.fosterOrderId || 22;
    that.setData({
      fosterOrderId
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
            userInfo,
            isok: true
          })
        }
      })
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // // 选择评价标签
  // laberChange(e) {
  //   const { currentTarget: { dataset: { index } } } = e;
  //   const laberIndexs = this.data.laberIndexs;
  //   if (!laberIndexs[index]) {
  //     laberIndexs[index] = true;
  //   } else {
  //     laberIndexs[index] = false;
  //   }
  //   this.setData({ laberIndexs })
  // },

  // 评价内容
  inputCommentContent(e) {
    const commentContent = e.detail.value;
    this.setData({
      commentContent
    })
  },

  // 评价分数
  commentFraction(e) {
    console.log(e)
    const { currentTarget: { dataset: { sindex, index } } } = e;
    const fractionArr = this.data.fractionArr;
    fractionArr[index] = sindex;
    this.setData({ fractionArr });
  },

  formSubmit(e) {
    const that = this;
    const d = this.data;
    const laberIndexs = d.laberIndexs || [];
    const laberArr = d.laberArr;

    for (let i in d.array) {
      if (!d.fractionArr[i]) {
        mcdj.showToast('请选择' + d.array[i] + '的分数', 3);
        return;
      }
    }
    mcdj.textRiskIdentification(function () {
      that.commentOrder(that.data.commentContent);
    }, that.data.commentContent, '评价内容');
  },

  // 保存评价
  commentOrder(commentContent) {
    const that = this;
    const d = this.data;

    const data = {
      fosterOrderId: d.fosterOrderId,
      commentContent,
      petAbility: d.fractionArr[0],
      petEnvironment: d.fractionArr[1],
      communicators: d.fractionArr[2],
    };
    mcdj.showLoading();
    mcdj.commentOrder({
      data,
      success(data) {
        my.hideLoading();
        isclick = false;
        mcdj.showToast('评价成功', 3, null, function () {
          my.navigateBack();
        })
      }, fail() {
        isclick = false;
      }
    })
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
