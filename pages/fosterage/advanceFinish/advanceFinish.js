
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {
    reasonList: ['临时有事无法继续寄养', '宠物生病或出事', '宠物具备攻击性', '其他原因'],
  },

  onLoad(options) {
    const that = this;
    const fosterOrderId = options.fosterOrderId || 21;
    const payAmount = options.amount || 0;
    that.setData({
      fosterOrderId, payAmount, isok: true
    })
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 选择原因
  changeReason(e) {
    this.setData({
      reasonIndex: e.detail.value.toString(),
    });
  },

  // 备注
  inputRemark(e) {
    this.setData({
      advanceRemark: e.detail.value
    })
  },

  // 赔付金额
  inputAmount(e) {
    this.setData({
      amount: e.detail.value.toString()
    })
  },

  // 提交申请
  formSubmit() {
    const that = this;
    const d = this.data;
    console.log(d.amount)
    console.log(d.payAmount)

    if (!d.reasonIndex) {
      mcdj.alert('请选择原因');
      return;
    } else if (!d.amount) {
      mcdj.alert('请填写金额');
      return;
    } else if (parseFloat(d.amount) > parseFloat(d.payAmount)) {
      mcdj.alert(`赔付金额不可超过本单的支付金额${d.payAmount}元`);
      return;
    }

    const data = {
      fosterOrderId: d.fosterOrderId,
      advanceReason: d.reasonList[d.reasonIndex],
      advanceRemark: d.advanceRemark || null,
      handleAmount: d.amount,
    };
    mcdj.showLoading();
    mcdj.advanceFinishOrder({
      data,
      success(data) {
        console.log(data)
        my.hideLoading();
        isclick = false;
        mcdj.showToast('已提交申请', 3, null, function () {
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
