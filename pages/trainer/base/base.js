
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;
let isLogin, isToast;
Page({
  data: {
    addressKey: 'address',
    gradeArr: ['初级训宠师', '中级训宠师', '高级训宠师', '训宠技师', '高级训宠技师'],
    experienceArr: ['1年以下', '1年', '2年', '3年', '4年', '5年', '5年以上'],
    modeArr: ['寄养训练', '上门训练', '以上均可'],
  },

  onLoad() {
    const that = this;

    app.doLogin({
      success(userInfo) {
        that.setData({ userInfo });
        that.trainInfo();
      }
    });
  },

  onShow() { },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
    isLogin = undefined, isToast = undefined;
  },

  // 获取训练师详情
  trainInfo() {
    const that = this;
    mcdj.trainInfo({
      success(data) {
        const trainerVo = data.trainerVo;
        console.log(trainerVo);

        // 描述的图片
        const petPhoto = trainerVo.qualificationsPath ? trainerVo.qualificationsPath.split(',') : [];

        // 资格等级
        let gradeIndex = null;
        const gradeArr = that.data.gradeArr;
        for (let i in gradeArr) {
          if (gradeArr[i] == trainerVo.grade) {
            gradeIndex = parseInt(i)
            break;
          }
        }

        // 从业经验
        let experienceIndex = null;
        const experienceArr = that.data.experienceArr;
        for (let i in experienceArr) {
          if (experienceArr[i] == trainerVo.experience) {
            experienceIndex = parseInt(i)
            break;
          }
        }

        // 服务方式
        let modeIndex = null;
        const modeArr = that.data.modeArr;
        for (let i in modeArr) {
          if (modeArr[i] == trainerVo.serviceMode) {
            modeIndex = parseInt(i)
            break;
          }
        }

        that.setData({
          isok: true,
          trainerVo,

          petPhoto,
          gradeIndex,
          experienceIndex,
          modeIndex,
        });
        that.isCanSubmit();
      }
    });
  },

  // 选择资格证书照片
  choosePhoto() {
    const that = this;
    const { data: { petPhoto } } = that;
    const length = petPhoto ? petPhoto.length : 0;
    const count = 4 - length;
    my.chooseImage({
      count,
      success(res) {
        that.setData({
          petPhoto: petPhoto ? petPhoto.concat(res.apFilePaths) : res.apFilePaths,
        });
        that.isCanSubmit();
      },
    })
  },

  // 删除照片
  deletePhoto(e) {
    const { currentTarget: { dataset: { index } } } = e;
    const petPhoto = this.data.petPhoto;
    petPhoto.splice(index, 1);
    this.setData({ petPhoto });
    this.isCanSubmit();
  },

  // 预览照片
  previewPhoto(e) {
    my.previewImage({
      urls: this.data.petPhoto,
      current: e.currentTarget.dataset.index,
    });
  },

  // 图片示例
  imgExamples() {
    const urls = [
      'http://image.qipinke.com/familyInfo/petPhoto/20181027/JPEG/BF035793-7354-4DF9-8F68-81681E8FFC45.JPEG?x-oss-process=style/watermarkStyle',
      'http://image.qipinke.com/familyInfo/petPhoto/20181027/JPEG/AB3AB97A-A2F2-4CDF-A3D6-C3C8F00437A2.JPEG?x-oss-process=style/watermarkStyle',
      'http://image.qipinke.com/familyInfo/petPhoto/20181027/JPEG/05484628-300E-4AB1-87F8-F9B018B425C5.JPEG?x-oss-process=style/watermarkStyle',
      'http://image.qipinke.com/familyInfo/petPhoto/20181027/JPEG/DF599B81-56F8-489C-B406-19C731B6967A.JPEG?x-oss-process=style/watermarkStyle',
      'http://image.qipinke.com/familyInfo/petPhoto/20181027/JPEG/AA74F206-E8F5-4D00-B648-990812196E85.JPEG?x-oss-process=style/watermarkStyle',
      'http://image.qipinke.com/familyInfo/petPhoto/20181027/JPEG/78F485FC-4F6F-4BCC-908A-C25BF3E832A6.JPEG?x-oss-process=style/watermarkStyle',
      'http://image.qipinke.com/familyInfo/petPhoto/20181027/JPEG/985845F0-EC56-429E-987E-4F2DF718590A.JPEG?x-oss-process=style/watermarkStyle',
      'http://image.qipinke.com/familyInfo/petPhoto/20181027/JPEG/17438379-D697-4528-A57F-604A89828C45.JPEG?x-oss-process=style/watermarkStyle',
      'http://image.qipinke.com/familyInfo/petPhoto/20181027/JPEG/4B5036EC-5FB5-4CFD-969F-8657A3DEEE94.JPEG?x-oss-process=style/watermarkStyle',
      'http://image.qipinke.com/familyInfo/petPhoto/20181027/JPEG/02F9921C-2C40-44D7-9431-4D75DB814D62.JPEG?x-oss-process=style/watermarkStyle',
      'http://image.qipinke.com/familyInfo/petPhoto/20181027/JPEG/33974E6E-49D2-433A-A400-6BC555010026.JPEG?x-oss-process=style/watermarkStyle',
      'http://image.qipinke.com/familyInfo/petPhoto/20181027/JPEG/9CB66EA9-3A5B-4BC2-A0AE-949EEB946D48.JPEG?x-oss-process=style/watermarkStyle',
    ];
    my.previewImage({
      urls,
    });
  },

  // 资格等级
  changeGrade(e) {
    this.setData({
      gradeIndex: e.detail.value,
    });
    this.isCanSubmit();
  },

  // 从业经验
  changeExperience(e) {
    this.setData({
      experienceIndex: e.detail.value,
    });
    this.isCanSubmit();
  },

  // 服务方式
  changeMode(e) {
    this.setData({
      modeIndex: e.detail.value,
    });
    this.isCanSubmit();
  },

  // 判断信息是否已填完
  isCanSubmit() {
    const d = this.data;
    const noDisabled = d.gradeIndex != undefined && d.experienceIndex != undefined && d.modeIndex != undefined &&
      (d.petPhoto && d.petPhoto.length >= 1) ? true : false;

    this.setData({
      noDisabled
    })
  },

  //提交信息
  submit(e) {
    const that = this;

    if (!this.data.noDisabled) return;
    if (isclick) return;
    isclick = true;

    // 文件上传
    let urls = utils.formatFilePath("petPhoto", that.data.petPhoto, { dirmkStr: 'trainerInfo/qualifications', "userId": that.data.userInfo.userId });

    mcdj.uploadFile({
      urls,
      success(data) {
        let petPhoto = null;
        if (that.data.petPhoto && that.data.petPhoto.length > 0)
          petPhoto = data['petPhoto'];
        that.setData({
          petPhoto
        });
        that.save(petPhoto.join(","));
      },
      fail() {
        isclick = false;
      }
    })
  },

  // 保存收养信息
  save(qualificationsPath) {
    const that = this;
    const d = this.data;

    const data = {
      qualificationsPath,
      grade: d.gradeArr[d.gradeIndex],
      experience: d.experienceArr[d.experienceIndex],
      serviceMode: d.modeArr[d.modeIndex],
    };
    console.log(data);
    mcdj.showLoading();
    mcdj.saveTrain({
      data,
      success(res) {
        my.hideLoading();
        isclick = false;
        my.showToast({
          type: 'none',
          duration: 1500,
          content: '保存成功',
          success() {
            isToast = true;
            that.saveNav();
          },
        });

        app.doLogin({
          anew: 1,
          success(userInfo) {
            isLogin = userInfo;
            that.saveNav();
          }
        })
      },
      fail(err) {
        isclick = false;
      },
    })
  },

  // 保存完跳转
  saveNav() {
    if (isLogin && isToast) {
      // if (this.data.trainerVo.userCertifiedStatus == 1 && isLogin.userCertifiedStatus != 1)
        my.redirectTo({ url: '../video/video' });
      // else
      // my.navigateBack();
    }
  },

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
