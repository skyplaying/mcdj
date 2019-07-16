import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isclick;
Page({
  data: {},
  onLoad() {
    const that = this;
    app.doLogin({
      success() {
        that.queryAdopterInfo();
      }
    })
  },

  // 获取寄养家庭资料(修改时)
  queryAdopterInfo() {
    const that = this;
    mcdj.showLoading();
    mcdj.getKeepPet({
      success(data) {
        const userVo = data.userVo;
        // 家庭描述
        const familyDescribe = userVo.adoptionVo ? userVo.adoptionVo.familyDescribe : '';

        that.setData({
          isok: true,
          familyDescribe,
        });
        my.hideLoading();
      }
    });
  },

  // 输入描述
  inputDescribe(e) {
    this.setData({ familyDescribe: e.detail.value });
  },

  // 保存收养信息
  saveAdoption() {
    const that = this;
    mcdj.textRiskIdentification(function () {
      if (isclick) return;
      isclick = true;

      mcdj.showLoading();
      mcdj.saveAdoption({
        data: { familyDescribe: that.data.familyDescribe },
        success(res) {
          my.hideLoading();
          isclick = false;
          my.navigateBack();
        },
        fail(err) {
          isclick = false;
        },
      })
    }, that.data.familyDescribe, '家庭名称')
  },

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
