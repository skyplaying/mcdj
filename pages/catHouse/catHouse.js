

const app = getApp();
Page({
  data: {
    list: ["http://image.qipinke.com/catHouse/content2_bd1.jpg", "http://image.qipinke.com/catHouse/content2_bd2.jpg", "http://image.qipinke.com/catHouse/content2_bd3.jpg"]
  },
  onLoad() { },

  //轮播图跳转
  swiperNav(e) {
    const index = e.currentTarget.dataset.index;
    app.doLogin({
      success() {
        my.navigateToMiniProgram({
          "appId": "2018112662329617",
          "path": "page=pages/life/life?from=mengchong"
        })
      }
    })
  },

  //登录后跳转
  loginAfterNav(e) {
    const url = e.currentTarget.dataset.url;
    console.log(url)
    app.doLogin({
      success() {
        my.navigateToMiniProgram({
          "appId": "2018112662329617",
          "path": url
        })
      }
    })
  },



});
