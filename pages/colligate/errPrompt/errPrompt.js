
const errorTexts = {
  11: '无权跨域',
  12: '网络出错',
  13: '超时',
  14: '解码失败',
  19: 'HTTP错误'
}

Page({
  data: {

  },

  onLoad(options) {
    const error = options.error;
    const errorText = errorTexts[error];
    this.setData({ errorText });
  },
});
