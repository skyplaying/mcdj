
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
  data: {
    varietiesKey: 'petVariety',

    experienceArr: ['三个月', '半年', '一年', '两年', '三年', '四年', '五年', '五年以上'],
    experienceIndexs: [],
    sexs: [],
  },

  onLoad() { },

  onShow() {
    const that = this;
    if (!isNoFirst) {
      isNoFirst = true;
      app.globalData.isAnew = 0;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo
          })
          that.myPetsList();
          that.userHomeInfo();
        }
      })
    } else {
      // 刷新宠物列表
      const isNoAnewMyPetList = mcdj.getStorageSync('isNoAnewMyPetList');
      if (!isNoAnewMyPetList) {
        this.myPetsList();
      }
      // 获取养过的宠物品种
      const varieties = mcdj.getStorageSync('petVariety') || {};
      const varietyName = varieties.petVarietyName || '';
      if (varietyName) {
        console.log(varietyName);
        const varietiesList = this.data.varietiesList || [];
        varietiesList.push({
          varietyName, sex: 0, experienceIndex: 0
        });
        this.setData({ varietiesList });
        mcdj.removeStorageSync('petVariety');
      }
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 获取我的宠物列表
  myPetsList() {
    const that = this;
    mcdj.myPets({
      success(list) {
        const petList = list;
        that.setData({ petList });
      }
    });
  },

  // 获取养宠经验(修改时)
  userHomeInfo() {
    const that = this;
    const experienceArr = this.data.experienceArr;
    const varietiesList = this.data.varietiesList || [];
    mcdj.userHomeInfo({
      success(data) {
        const usersVo = data.usersVo;
        const keptPetList = usersVo.keptPetList || [];
        for (let i in keptPetList) {
          const varieties = {
            varietyName: keptPetList[i].petType,
            sex: keptPetList[i].petSex,
            experienceIndex: experienceArr.indexOf(keptPetList[i].spoilLong)
          }
          varietiesList.push(varieties);
        }
        that.setData({
          isok: true,
          varietiesList,
        });
      }
    });
  },

  // 跳转了添加宠物
  toFoundPet() {
    my.navigateTo({ url: '/pages/pet/found/found' });
  },

  // 性别选择
  changeSex(e) {
    const index = e.currentTarget.dataset.index;
    const sex = e.currentTarget.dataset.sex;
    const svarietiesListexs = this.data.varietiesList;
    this.setData({
      [`varietiesList[${index}].sex`]: parseInt(sex),
    });
    console.log(this.data.varietiesList)
  },

  // 养宠经验选择
  changeExperience(e) {
    const index = e.currentTarget.dataset.index;
    const varietiesList = this.data.varietiesList;
    this.setData({
      [`varietiesList[${index}].experienceIndex`]: e.detail.value,
    });
    console.log(this.data.varietiesList)
  },

  // 删除养过的宠物
  deleteVarieties(e) {
    const { currentTarget: { dataset: { index } } } = e;
    const { data: { varietiesList } } = this;
    varietiesList.splice(index, 1);
    this.setData({ varietiesList });
  },

  // 保存养宠经验
  saveExperience() {
    const that = this;
    const d = this.data;
    if (!d.varietiesList || d.varietiesList.length == 0) {
      mcdj.showToast('请选择您养过的宠物', 3);
      return;
    }

    if (isclick) return;
    isclick = true;

    const keptPetArray = [];
    for (let i in d.varietiesList) {
      const keptPet = d.varietiesList[i].varietyName + '_' + d.experienceArr[d.varietiesList[i].experienceIndex] + '_' + d.varietiesList[i].sex;
      keptPetArray.push(keptPet)
    }
    mcdj.showLoading();
    mcdj.saveUser({
      data: { keptPetArray },
      success(res) {
        isclick = false;
        my.hideLoading();
        mcdj.showToast('保存成功', 3, null, function () {
          app.doLogin({
            anew: 1,
            success(userInfo) {
              my.navigateBack();
            }
          })
        });
      },
      fail(err) {
        isclick = false;
      },
    })
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
