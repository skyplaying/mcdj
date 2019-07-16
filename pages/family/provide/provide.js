
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isclick;
Page({
  data: {
    goodsDogArr: ['食具', '窝', '牵引绳', '玩具', '饮用水'],
    goodsCatArr: ['食具', '窝', '猫砂', '玩具', '饮用水'],
    catGoodsArr: [],
    dogGoodsArr: []
  },

  onLoad() {
    const that = this;

    app.doLogin({
      success() {
        that.queryAdopterInfo();
      }
    });
  },

  onShow() { },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined;
  },

  // 获取寄养家庭资料(修改时)
  queryAdopterInfo() {
    const that = this;
    mcdj.showLoading();
    mcdj.getKeepPet({
      success(data) {
        const userVo = data.userVo;
        const goodsCatArr = that.data.goodsCatArr;
        const goodsDogArr = that.data.goodsDogArr;
        // 猫 
        let catGoodsArr = [];
        const catGoods = userVo.adoptionVo.catGoods ? userVo.adoptionVo.catGoods.split(',') : [];
        for (let i in goodsCatArr) {
          for (let j in catGoods) {
            if (goodsCatArr[i] == catGoods[j]) {
              catGoodsArr[i] = true;
              break;
            }
          }
        }
        // 狗
        let dogGoodsArr = [];
        const dogGoods = userVo.adoptionVo.dogGoods ? userVo.adoptionVo.dogGoods.split(',') : [];
        for (let i in goodsDogArr) {
          for (let j in dogGoods) {
            if (goodsDogArr[i] == dogGoods[j]) {
              dogGoodsArr[i] = true;
              break;
            }
          }
        }

        that.setData({
          isok: true,

          catGoodsArr,
          dogGoodsArr,
        });
        my.hideLoading();
      }
    });
  },

  // 狗狗
  changeDogGoods(e) {
    console.log(e.currentTarget.dataset.index)
    const index = e.currentTarget.dataset.index;
    const dogGoodsArr = this.data.dogGoodsArr;
    dogGoodsArr[index] = !dogGoodsArr[index];
    this.setData({
      dogGoodsArr
    })
  },

  // 猫咪
  changeCatGoods(e) {
    console.log(e.currentTarget.dataset.index)
    const index = e.currentTarget.dataset.index;
    const catGoodsArr = this.data.catGoodsArr;
    catGoodsArr[index] = !catGoodsArr[index];
    this.setData({
      catGoodsArr
    })
  },

  // 保存提供的物品
  save() {
    const dogGoodsArr = this.data.dogGoodsArr;
    const catGoodsArr = this.data.catGoodsArr;

    let noDisabled = false;
    for (let i in dogGoodsArr) {
      if (dogGoodsArr[i]) {
        noDisabled = true;
        break;
      }
    }
    for (let j in catGoodsArr) {
      if (catGoodsArr[j]) {
        noDisabled = true;
        break;
      }
    }
    if (!noDisabled) {
      mcdj.showToast('请选择提供的物品', 2);
      return;
    }

    if (isclick) return;
    isclick = true;

    const that = this;

    const dogGoods = [];
    const catGoods = [];
    const goodsDogArr = this.data.goodsDogArr;
    const goodsCatArr = this.data.goodsCatArr;
    for (let i in dogGoodsArr) {
      if (dogGoodsArr[i])
        dogGoods.push(goodsDogArr[i])
    }
    for (let j in catGoodsArr) {
      if (catGoodsArr[j])
        catGoods.push(goodsCatArr[j])
    }

    const data = {
      dogGoods: dogGoods.join(','),
      catGoods: catGoods.join(','),
    };
    console.log(data);
    mcdj.showLoading();
    mcdj.saveAdoption({
      data,
      success(res) {
        my.hideLoading();
        isclick = false;
        // 清除地址
        my.showToast({
          type: 'none',
          content: '已保存',
          success() {
            app.doLogin({
              anew: 1,
              success(userInfo) {
                my.navigateBack();
              }
            })
          },
        });
      },
      fail(err) {
        isclick = false;
      },
    })
  },

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
