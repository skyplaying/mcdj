
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isclick;
Page({
  data: {
    regionArr: ['允许宠物上床', '允许宠物上沙发', '可以进卧室', '有专门的宠物活动区'],
    regionStateArr: [],
    skillArr: ['宠物美容', '兽医知识', '训宠经验', '技能证书'],
    skillStateArr: [],
    inhabitantArr: ['伴侣', '父母', '小孩', '朋友', '独居', '老人'],
    inhabitantStateArr: []
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
        // 活动区域
        const regionStateArr = [];
        const regionArr = that.data.regionArr;
        const regions = userVo.adoptionVo.activityArea ? userVo.adoptionVo.activityArea.split(',') : [];
        for (let i in regionArr) {
          for (let j in regions) {
            if (regionArr[i] == regions[j]) {
              regionStateArr[i] = true;
              break;
            }
          }
        }
        // 技能
        const skillStateArr = [];
        const skillArr = that.data.skillArr;
        const skillAptitudes = userVo.adoptionVo.skillAptitude ? userVo.adoptionVo.skillAptitude.split(',') : [];
        for (let i in skillArr) {
          for (let j in skillAptitudes) {
            if (skillArr[i] == skillAptitudes[j]) {
              skillStateArr[i] = true;
              break;
            }
          }
        }
        // 常住人口
        let inhabitantStateArr = [];
        const inhabitantArr = that.data.inhabitantArr;
        const residentPopulations = userVo.adoptionVo.residentPopulation ? userVo.adoptionVo.residentPopulation.split(',') : [];
        for (let i in inhabitantArr) {
          for (let j in residentPopulations) {
            if (inhabitantArr[i] == residentPopulations[j]) {
              inhabitantStateArr[i] = true;
              break;
            }
          }
        }

        that.setData({
          isok: true,

          regionStateArr,
          skillStateArr,
          inhabitantStateArr,
        });
        my.hideLoading();
      }
    });
  },

  // 活动区域
  changeRegion(e) {
    console.log(e.currentTarget.dataset.index)
    const index = e.currentTarget.dataset.index;
    const regionStateArr = this.data.regionStateArr;
    regionStateArr[index] = !regionStateArr[index];
    this.setData({
      regionStateArr
    })
  },

  // 技能和资质
  changeSkill(e) {
    console.log(e.currentTarget.dataset.index)
    const index = e.currentTarget.dataset.index;
    const skillStateArr = this.data.skillStateArr;
    skillStateArr[index] = !skillStateArr[index];
    this.setData({
      skillStateArr
    })
  },

  // 常住人口
  changeInhabitant(e) {
    console.log(e.currentTarget.dataset.index)
    const index = e.currentTarget.dataset.index;
    const inhabitantStateArr = this.data.inhabitantStateArr;
    inhabitantStateArr[index] = !inhabitantStateArr[index];
    this.setData({
      inhabitantStateArr
    })
  },

  // 保存提供的物品
  save() {
    const that = this;
    const d = this.data;
    
    // 活动区域
    const activityArea = [];
    const regionStateArr = d.regionStateArr;
    const regionArr = d.regionArr;
    for (let i in regionStateArr) {
      if (regionStateArr[i])
        activityArea.push(regionArr[i])
    }

    // 技能
    const skillAptitude = [];
    const skillStateArr = d.skillStateArr;
    const skillArr = d.skillArr;
    for (let i in skillStateArr) {
      if (skillStateArr[i])
        skillAptitude.push(skillArr[i])
    }

    // 常住人口
    const residentPopulation = [];
    const inhabitantStateArr = d.inhabitantStateArr;
    const inhabitantArr = d.inhabitantArr;
    for (let j in inhabitantStateArr) {
      if (inhabitantStateArr[j])
        residentPopulation.push(inhabitantArr[j])
    }

    if (activityArea.length == 0) {
      mcdj.showToast('请选择活动区域', 2);
      return;
    } else if (residentPopulation.length == 0) {
      mcdj.showToast('常住人口', 2);
      return;
    }

    if (isclick) return;
    isclick = true;

    const data = {
      activityArea: activityArea.join(','),
      skillAptitude: skillAptitude.join(','),
      residentPopulation: residentPopulation.join(','),
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
