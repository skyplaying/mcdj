

Page({
  data: {

  },

  onLoad(options) {
    const that = this;
    const selectIndex = options.index;
    this.setData({ selectIndex });
  },

  showContent(e) {
    const { currentTarget: { dataset: { index } } } = e;
    if (this.data.selectIndex == index) {
      this.setData({ selectIndex: -1 });
    } else {
      this.setData({ selectIndex: index });
    }
  },
});
