import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();
Page({
  data: {},

  init() {
    const that = this;
    // 当前的日期
    my.getServerTime({ 
      success(res) {
        // const nowDate = utils.formatTimestamp(new Date("2018-09-03 00:00:00").getTime()).split(' ')[0];
        const nowDate = utils.formatTimestamp(res.time).split(' ')[0];
        const year = nowDate.split('-')[0];
        const month = nowDate.split('-')[1];
        that.setData({ year, month });
        const firstQueryDate = year + "-" + month;
        mcdj.getFamilyManager({
          firstQueryDate,
          success(obj) {
            // console.log(obj);
            obj.income = obj.income.toFixed(2);
            that.setData({ obj, isok: true });
          }
        });
      },
    });
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

  // 钱包
  toWallet() {
    my.navigateTo({
      url: "/pages/my/wallet/wallet"
    });
  },

  // 敬请期待
  showToast() {
    mcdj.showToast('该功能暂未开放', 2);
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
