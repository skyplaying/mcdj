Page({
  data: {
  },
  onLoad() { },

  toPetList() {
    my.redirectTo({
      url:"../petList/petList"
    });
  },

  error(e){
    console.log(e)
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },


});
