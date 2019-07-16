
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;
let isLogin, isToast;
Page({
  data: {
    trainTypeArr: ['行为矫正', '技能训练'],
    trainStatus: true
  },

  onLoad(options) {
    const that = this;
    // options.trainServiceId = 2;
    console.log(options)
    const trainServiceId = options && options.trainServiceId ? options.trainServiceId : null;
    this.setData({ trainServiceId });

    app.doLogin({
      success(userInfo) {
        that.setData({ userInfo });
        if (that.data.trainServiceId)
          that.trainServiceInfo();
        else
          that.setData({
            isok: true
          })
      }
    });

    if (trainServiceId) {
      my.setNavigationBar({
        title: '修改训练项目',
      })
    } else {
      my.setNavigationBar({
        title: '新增训练项目',
      })
    }
  },

  onShow() {
    console.log('onShow')
    let data = mcdj.getStorageSync('addServer');
    console.log(data)
    if (!data || (this.data.trainServiceId && !isNoFirst)) {
      isNoFirst = true;
      return;
    };
    const trainTypeIndex = data.trainTypeIndex;
    const itemName = data.itemName || '';
    const trainAmount = data.trainAmount || '';
    const dayNum = data.dayNum || '';
    const trainStatus = data.trainStatus;
    const petPhoto = data.petPhoto || this.data.petPhoto; //后面的this.data.petPhoto是为了兼容手机选择图片时也会调用onshow导致报错而设置的
    const trainerDetail = data.trainerDetail || '';
    const isReserve = data.isReserve;
    const advanceNum = data.advanceNum;
    const advanceUnit = data.advanceUnit;
    const remark = data.remark;
    this.setData({
      trainTypeIndex, itemName, trainAmount, dayNum, trainStatus, trainerDetail, isReserve, advanceNum, advanceUnit, remark
    })
    console.log(this.data)
    this.isCanSubmit();
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
    isLogin = undefined, isToast = undefined;
  },

  onHide() {
    console.log('onHide')
    const d = this.data;
    let data = mcdj.getStorageSync('addServer') || {};

    data.trainTypeIndex = d.trainTypeIndex;
    data.itemName = d.itemName || null;
    data.trainAmount = d.trainAmount || null;
    data.dayNum = d.dayNum || null;
    data.trainStatus = d.trainStatus;
    data.petPhoto = d.petPhoto;
    data.trainerDetail = d.trainerDetail || '';
    data.isReserve = d.isReserve || false;
    data.advanceNum = d.advanceNum || null;
    data.advanceUnit = d.advanceUnit || '天';
    data.remark = d.remark || '';

    console.log(data)
    mcdj.setStorageSync('addServer', data);
  },

  // 获取训练服务详情
  trainServiceInfo() {
    const that = this;
    const trainServiceId = this.data.trainServiceId;
    mcdj.trainServiceInfo({
      trainServiceId,
      success(data) {
        const trainServiceVo = data.trainServiceVo || {};
        console.log(trainServiceVo);

        // 描述的图片
        const petPhoto = trainServiceVo.servicePath ? trainServiceVo.servicePath.split(',') : [];

        // 服务方式
        let trainTypeIndex = null;
        const trainTypeArr = that.data.trainTypeArr;
        for (let i in trainTypeArr) {
          if (trainTypeArr[i] == trainServiceVo.trainType) {
            trainTypeIndex = parseInt(i)
            break;
          }
        }

        that.setData({
          isok: true,
          trainServiceVo,

          trainTypeIndex,
          itemName: trainServiceVo.itemName,
          trainAmount: trainServiceVo.trainAmount,
          dayNum: trainServiceVo.dayNum,
          trainerDetail: trainServiceVo.trainerDetail,
          trainStatus: trainServiceVo.trainStatus,
          isReserve: trainServiceVo.isReserve || false,
          advanceNum: trainServiceVo.advanceNum || '',
          advanceUnit: trainServiceVo.advanceUnit || '',
          remark: trainServiceVo.remark || '',
          petPhoto,
        });
        that.isCanSubmit();
      }
    });
  },

  // 训练类型
  changeTrainType(e) {
    this.setData({
      trainTypeIndex: e.detail.value,
    });
    this.isCanSubmit();
  },

  // 项目名称
  inputItemName(e) {
    let itemName = this.data.itemName;
    this.setData({ itemName: e.detail.value });
    if (e.detail.value.length > 12) {
      this.setData({ itemName });
    }
    this.isCanSubmit();
  },

  // 价格
  inputTrainAmount(e) {
    let trainAmount = this.data.itemName;
    this.setData({ trainAmount: e.detail.value });
    this.isCanSubmit();
  },

  // 训练天数
  inputDayNum(e) {
    let dayNum = this.data.itemName;
    this.setData({ dayNum: e.detail.value });
    this.isCanSubmit();
  },

  // 是否上架
  changeTrainStatus(e) {
    const trainStatus = e.detail.value;
    this.setData({
      trainStatus
    })
  },

  // 选择图片
  choosePhoto() {
    const that = this;
    const { data: { petPhoto } } = that;
    console
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

  // 删除图片
  deletePhoto(e) {
    const { currentTarget: { dataset: { index } } } = e;
    const petPhoto = this.data.petPhoto;
    petPhoto.splice(index, 1);
    this.setData({ petPhoto });
    this.isCanSubmit();
  },

  // 预览图片
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

  // 判断信息是否已填完
  isCanSubmit() {
    const d = this.data;
    const noDisabled = d.trainTypeIndex != undefined && d.itemName && d.trainAmount && d.dayNum &&
      d.trainerDetail && (d.petPhoto && d.petPhoto.length >= 1) ? true : false;

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
    let urls = utils.formatFilePath("petPhoto", that.data.petPhoto, { dirmkStr: 'trainerServer/servicePath', "userId": that.data.userInfo.userId });

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
  save(servicePath) {
    const that = this;
    const d = this.data;

    const data = {
      trainServiceId: d.trainServiceId || null,
      trainType: d.trainTypeArr[d.trainTypeIndex],
      itemName: d.itemName,
      trainAmount: d.trainAmount,
      dayNum: d.dayNum,
      trainerDetail: d.trainerDetail,
      isReserve: d.isReserve ? 1 : 0,
      advanceNum: d.advanceNum,
      advanceUnit: d.advanceUnit,
      remark: d.remark,
      trainStatus: d.trainStatus ? 1 : 0,
      servicePath,
    };
    console.log(data);
    mcdj.showLoading();
    mcdj.saveTrainService({
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
      mcdj.removeStorageSync('addServer');
      // console.log(mcdj.getStorageSync('addServer'))
      app.pageTrainerAddServer = {
        gotoPage: "personalServerList",
        data: {
          isAddServer: true
        }
      }
      my.navigateBack();
    }
  },

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
