import mc from '../../../others/js/weui_mc';
import mcdj from '../../../others/js/interface_mc';

const app = getApp();
Page({
  data: {},

  init() {
    const that = this;

    mcdj.getUserMajorInfo({
      success(data) {
        const balance = data.userInfo.balance;
        that.setData({ balance, isok: true });
      }
    });
    this.queryTodayReward();
  },

  onLoad() {
    const that = this;
    app.doLogin({
      success() {
        that.init();
      }, fail() {
        my.navigateBack();
      }
    })
  },

  // 获取今日赏金列表
  queryTodayReward() {
    // const that = this;
    // const cb = (todayRewardList) => {
    //   console.log(todayRewardList)
    //   that.setData({ todayRewardList })
    // };
    // mc.queryTodayReward(cb);
  },

  // 输入金额
  inputAmount(e) {
    this.setData({ amount: e.detail.value });
  },

  // 是否提现
  isWithdrawals() {
    const that = this;
    const { data: { amount, balance } } = this;
    if (amount > balance) {
      mcdj.showToast('余额不足', 3);
    } else if (!amount || amount <= 0) {
      mcdj.showToast('提现金额不能小于一元', 3);
    } else {
      mcdj.confirm(function () {
        that.withdrawals();
      }, '是否要收米' + amount + '元到支付宝账号');
    }
  },

  // 提现
  withdrawals() {
    const that = this;
    const amount = this.data.amount;
    if (this.data.isclick) return;
    this.setData({ isclick: true });

    mcdj.showLoading('提现中...');
    mcdj.saveWithdraw({
      amount,
      success(data) {
        my.hideLoading();
        mcdj.alert('余额已提现成功，请到支付宝钱包查看支付宝余额')
        that.init();
      }, fail() {
        that.setData({ isclick: false });
      }
    })
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
