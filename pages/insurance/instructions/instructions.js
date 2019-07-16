Page({
  data: {
    titleArr: ['购买须知', '免责声明']
  },
  onLoad(options) {
    const index = parseInt(options.index);
    this.setData({
      index
    })
    const title = this.data.titleArr[index-1];
    my.setNavigationBar({
      title
    });
  },
});
