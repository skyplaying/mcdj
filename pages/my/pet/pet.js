
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;

Page({
  data: {

  },
  data: {},
  onLoad(options) { },
  onShow() {
    const that = this;
    const isNoAnewMyPetList = mcdj.getStorageSync('isNoAnewMyPetList');
    if (!isNoFirst || !isNoAnewMyPetList) {
      isNoFirst = true;
      app.globalData.isAnew = 0;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo
          })
        }
      })
      this.myPetsList();
    }
  },
  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isNoFirst = undefined, isclick = undefined;
  },

  // 我的宠物列表
  myPetsList() {
    const that = this;
    my.showNavigationBarLoading();
    mcdj.myPets({
      success(myPetList) {
        console.log(myPetList)
        // 显示新增的宠物
        const isShowNewPet = mcdj.getStorageSync('isNewPet');
        that.setData({
          myPetList,
          isShowNewPet,
          isok: true
        });
        mcdj.removeStorageSync('isNewPet');
        my.hideNavigationBarLoading();
      }
    });
  },

  // 进入详情页
  toDisplayPet(e) {
    const index = e.currentTarget.dataset.index;
    my.navigateTo({
      url: `../../pet/display/display?petId=${this.data.myPetList[index].petId}`
    })
  },

  // 编辑宠物
  editPet(e) {
    const index = e.currentTarget.dataset.index;
    my.navigateTo({
      url: `../../pet/found/found?petId=${this.data.myPetList[index].petId}`
    })
  },

  // 添加证件
  addCertificates(e) {
    mcdj.showToast('该功能暂未开放',3);
    // const index = e.currentTarget.dataset.index;
    // const petId = this.data.myPetList[index].petId;
    // my.showActionSheet({
    //   itemList: ['联苗', '养犬许可证（狗证）', '狂犬疫苗'],
    //   success(res) {
    //     const tapIndex = res.tapIndex || 0;
    //     const pathType = ['mixedVaccinePath', 'dogCardPath', 'rabiesVaccinePath'][tapIndex];
    //     my.navigateTo({
    //       url: `../certificates/certificates?petId=${petId}&pathType=${pathType}`,
    //     })
    //   }
    // })
  },

  // 操作选择
  detelePet(e) {
    const that = this;
    my.showActionSheet({
      items: ['删除'], // 菜单按钮的文字数组
      success: (res) => {
        if (res.index === 0) {
          that.delPet(e);
        }
      },
    });
  },


  // 删除宠物
  delPet(e) {
    const that = this;
    const index = e.currentTarget.dataset.index;
    const myPetList = that.data.myPetList;
    my.confirm({
      title: '温馨提示',
      content: `是否确认删除${myPetList[index].petName}?`,
      success(res) {
        if (res.confirm) {
          mcdj.showLoading('删除中...');
          mcdj.delPet({
            petId: myPetList[index].petId,
            success() {
              my.hideLoading();
              myPetList.splice(index, 1);
              that.setData({
                myPetList
              })
            },
            fail() {
              my.hideLoading();
            }
          })
        }
      }
    })
  },

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
