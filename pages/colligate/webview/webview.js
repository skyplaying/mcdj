
import mcdj from '../../../others/js/interface_mc';

const app = getApp();
let isNoFirst, isclick;

Page({
  data: {
    src: 'https://render.alipay.com/p/s/mygrace/ndetail.html?__webview_options__=sms%3DYES%26pd%3DNO&type=VOUCHER&id=20180930000730028512029SGQZW'
  },

  onLoad(options) {
    const that = this;
    const src = options && options.src ? options.src : null;
    this.setData({ src });
  },
});
