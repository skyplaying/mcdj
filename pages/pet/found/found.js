
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

const nowDate = utils.formatTime(new Date()).split(' ')[0];

let isNoFirst, isclick;
let startx, starty, moveUnit; //图片移动的参数

Page({
  data: {
    varietyTypeArray: ['小型（1 - 20kg)', '中型（20 - 50kg)', '大型（50 - 100kg)'],
  },

  // 页面启动的初始化
  initialization() {
    const that = this;
    // 获取手机系统信息
    my.getSystemInfo({
      success: (res) => {
        const rpx = res.windowWidth / 750.00;  //1rpx相当于多少px
        console.log("1rpx相当于" + rpx + "px")
        moveUnit = 176 * rpx; //图片移动多少可替换一个单元的顺序
      }
    })
  },

  onLoad(options) {
    const that = this;
    this.initialization();

    if (options && options.petId) {
      // 修改宠物信息
      my.setNavigationBar({ title: '修改宠物信息' });
      that.setData({ petId: options.petId });
      that.petInfo();
    } else {
      // 添加宠物
      that.setData({ isok: true });
    }
  },

  onShow() {
    const that = this;
    if (!isNoFirst) {
      isNoFirst = true;
      app.doLogin({
        success(userInfo) {
          that.setData({
            userInfo,
          });
        }
      })
    } else {
      // 获取养过的宠物品种
      const varieties = mcdj.getStorageSync('petVariety') || null;
      console.log(varieties)
      if (varieties) {
        const varietyIndex = varieties.varietyType == 3 ? "0" : varieties.varietyType.toString();
        this.setData({
          varieties, varietyIndex
        })
        mcdj.removeStorageSync('petVariety');
        this.isCanSubmit();
      }
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
    startx = undefined, starty = undefined, moveUnit = undefined;
  },

  // 获取宠物信息(修改时)
  petInfo() {
    const that = this;
    const petId = this.data.petId;
    mcdj.showLoading();
    mcdj.petInfo({
      petId,
      success(data) {
        const petInfoVo = data.petInfoVo;
        // 已失效的宠物则返回或者回宠物列表
        if (petInfoVo.isEnable == 0) {
          mcdj.showToast('该宠物信息已失效', 3);
          setTimeout(function () {
            my.navigateBack();
          }, 1500)
          return;
        }

        let varietyIndex = null;
        if (petInfoVo.weight) {
          const varietyTypeArray = that.data.varietyTypeArray;
          for (let i in varietyTypeArray) {
            if (varietyTypeArray[i] == petInfoVo.weight) {
              varietyIndex = i;
            }
          }
        }
        that.setData({
          petPhotos: petInfoVo.petPhotosList,
          petName: petInfoVo.petName,
          varieties: petInfoVo.petVarietyVo,
          varietyIndex,
          gender: petInfoVo.gender,
          birthday: petInfoVo.birthday,
          petSynopsis: petInfoVo.petSynopsis,
          sterilization: petInfoVo.sterilization ? true : false,
          insect: petInfoVo.insect ? true : false,
          isMixedVaccine: petInfoVo.isMixedVaccine ? true : false,
          isRabiesVaccine: petInfoVo.isRabiesVaccine ? true : false,

          isok: true,
        })
        that.isCanSubmit();
        my.hideLoading();
      }
    });
  },

  // 判断信息是否已填完
  isCanSubmit() {
    const d = this.data;
    const noDisabled = (d.petPhotos && d.petPhotos.length > 0) && d.petName && d.varieties && d.gender != undefined && d.birthday ? true : false;
    this.setData({
      noDisabled
    })
  },

  //下一步
  submit(e) {
    const that = this;
    if (!this.data.noDisabled) return;
    if (isclick) return;
    // mcdj.textRiskIdentification(function () {
    //   mcdj.textRiskIdentification(function () {
    isclick = true;
    that.uploadFile();
    //   }, that.data.petSynopsis, '宠物简介')
    // }, that.data.petName, '昵称')
  },

  // 上传照片
  uploadFile() {
    const that = this;
    console.log(that.data);
    // 文件上传
    let urls = utils.formatFilePath("petPhotos", that.data.petPhotos, { dirmkStr: 'pet/photos', "userId": that.data.userInfo.userId });

    mcdj.uploadFile({
      urls,
      success(data) {
        const petAvatar = data['petPhotos'][0];
        let petPhotos = null;
        if (that.data.petPhotos && that.data.petPhotos.length > 0)
          petPhotos = data['petPhotos'].join(",");
        that.savePetInfo(petAvatar, petPhotos);
      },
      fail() {
        isclick = false;
      }
    })
  },

  // 发布寄养
  savePetInfo(petAvatar, petPhotos) {
    const that = this;
    const d = this.data;

    const data = {
      petId: d.petId || null,
      petAvatar,
      petPhotos,
      petName: d.petName,
      petVarietyId: d.varieties.petVarietyId,
      weight: d.varietyTypeArray[d.varietyIndex],
      gender: d.gender,
      birthday: d.birthday,
      petSynopsis: d.petSynopsis,
      sterilization: d.sterilization ? 1 : 0,
      insect: d.insect ? 1 : 0,
      isMixedVaccine: d.isMixedVaccine ? 1 : 0,
      isRabiesVaccine: d.isRabiesVaccine ? 1 : 0,
    };
    console.log(data);
    mcdj.showLoading('保存中...');
    mcdj.savePetInfo({
      data,
      success() {
        my.hideLoading();
        isclick = false;
        my.showToast({
          type: 'none',
          content: '保存成功',
          success() {
            my.navigateBack();
          },
        });
      },
      fail(error) {
        my.hideLoading();
        isclick = false;
      }
    })
  },

  // 删除宠物
  deletePet() {
    const that = this;
    mcdj.confirm(function () {
      mcdj.showLoading('删除中...');
      mcdj.delPet({
        petId: that.data.petId,
        success() {
          my.hideLoading();
          my.showToast({
            type: 'none',
            content: '已删除',
            success() {
              my.navigateBack();
            },
          });
        },
        fail() {
          my.hideLoading();
        }
      })
    }, `是否确认删除${that.data.petName}?`)
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },


  // ------------------------------------------------------------------------------------

  // 昵称
  inputPetName(e) {
    let petName = this.data.petName || '';
    if (e.detail.value.length <= 10) {
      petName = e.detail.value;
    }
    this.setData({
      petName
    })
    this.isCanSubmit();
  },

  //选择品种
  selectVarieties() {
    my.navigateTo({
      url: "../selectVarieties/selectVarieties"
    });
  },

  // 宠物体型
  changeVarietyType(e) {
    this.setData({
      varietyIndex: e.detail.value.toString(),
    });
  },

  // 选择性别
  changeSex(e) {
    this.setData({ gender: e.currentTarget.dataset.value });
    this.isCanSubmit();
  },

  // 生日
  selectBirthday() {
    const that = this;
    my.datePicker({
      endDate: nowDate,
      success: (res) => {
        that.setData({
          birthday: res.date,
        });
        that.isCanSubmit();
      },
    });
  },

  // 特别说明
  inputExplain(e) {
    let petSynopsis = this.data.petSynopsis;
    if (e.detail.value.length <= 50) {
      petSynopsis = e.detail.value;
    }
    this.setData({
      petSynopsis
    })
    this.isCanSubmit();
  },

  // 是否绝育
  sterilizationChange(e) {
    this.setData({
      sterilization: e.detail.value
    })
    this.isCanSubmit();
  },

  // 是否驱虫
  anthelminticChange(e) {
    this.setData({
      insect: e.detail.value
    })
    this.isCanSubmit();
  },

  // 是否注射联苗
  mixedVaccineChange(e) {
    this.setData({
      isMixedVaccine: e.detail.value
    })
    this.isCanSubmit();
  },

  // 是否注射狂犬疫苗
  rabiesVaccineChange(e) {
    this.setData({
      isRabiesVaccine: e.detail.value
    })
    this.isCanSubmit();
  },

  // 选择描述照片
  chooseFosterageImg() {
    const that = this;
    const { data: { petPhotos } } = that;
    const length = petPhotos ? petPhotos.length : 0;
    const count = 4 - length;
    my.chooseImage({
      count,
      success: (res) => {
        that.setData({
          petPhotos: petPhotos ? petPhotos.concat(res.apFilePaths) : res.apFilePaths,
        });
        that.isCanSubmit();
      },
    })
  },

  // 删除描述照片
  deleteFosterageImg(e) {
    const { currentTarget: { dataset: { index } } } = e;
    const petPhotos = this.data.petPhotos;
    petPhotos.splice(index, 1);
    this.setData({ petPhotos });
    this.isCanSubmit();
  },

  // 预览描述照片
  previewFosterageImg(e) {
    my.previewImage({
      urls: this.data.petPhotos,
      current: e.currentTarget.dataset.index,
    });
  },

  // 移动图片顺序
  startImage(e) {
    console.log(e)
    startx = e.touches[0].clientX;
    starty = e.touches[0].clientY;
  },

  longTapImage(e) {
    console.log(e)
    const moveIndex = e.currentTarget.dataset.index;
    this.setData({ moveIndex })
  },

  moveImage(e) {
    const moveIndex = this.data.moveIndex;
    let list = this.data.petPhotos;
    if (moveIndex || moveIndex == 0) {
      const movex = e.touches[0].clientX - startx;
      const movey = e.touches[0].clientY - starty;
      this.setData({ movex, movey })
    }
  },

  endImage(e) {
    let movex = this.data.movex;
    let moveIndex = this.data.moveIndex;
    let petPhotos = this.data.petPhotos;
    const unitNum = parseInt(movex / moveUnit);       //要移动的单元数
    let subscript = moveIndex + unitNum;              //移动后的下标
    if (subscript < 0) {
      subscript = 0;
    } else if (subscript > petPhotos.length) {
      subscript = petPhotos.length;
    }
    const photo = petPhotos.splice(moveIndex, 1);
    const beforeArr = petPhotos.slice(0, subscript);
    const afterArr = petPhotos.slice(subscript);
    console.log(photo)
    console.log(beforeArr)
    console.log(afterArr)
    petPhotos = beforeArr.concat(photo);
    petPhotos = petPhotos.concat(afterArr);
    console.log(petPhotos)
    moveIndex = null;
    movex = 0;
    const movey = 0;
    this.setData({ moveIndex, movex, movey, petPhotos })
  },


});
