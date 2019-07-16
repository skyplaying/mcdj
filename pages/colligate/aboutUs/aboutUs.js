

const app = getApp();

Page({
  data: {},
  onLoad() {
    this.setData({
      edition: app.globalData.edition,
      lifeNum: app.globalData.lifeNum,
      company: app.globalData.company,
    })
  },
  makePhoneCall() {
    my.makePhoneCall({ number: '0755-88823343' });
  },
});
