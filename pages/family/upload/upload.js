
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},
  onLoad() { },
  onShow() {
    const that = this;
    if (!isNoFirst) {
      isNoFirst = true;
      app.doLogin({
        success(userInfo) {
          const video = userInfo.isVideoAuth || null;
          that.setData({
            userInfo,
            video
          })
          that.queryAdopterInfo();
        }
      })
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 获取寄养家庭资料(修改时)
  queryAdopterInfo() {
    const that = this;
    mcdj.showLoading();
    mcdj.getKeepPet({
      success(data) {
        const userVo = data.userVo;
        console.log(userVo);

        // 描述的图片
        const petPhoto = userVo.adoptionVo.petPhoto ? userVo.adoptionVo.petPhoto.split(',') : [];
        that.setData({
          userVo,
          isok: true,

          petPhoto,
        });
        my.hideLoading();
      }
    });
  },

  // 上传视频
  chooseVideo() {
    const that = this;
    my.chooseVideo({
      // sourceType:['album'],
      success(res) {
        if (res.duration > 60) {
          mcdj.showToast('视频时长过长，请重新上传', 2);
          return;
        }

        const video = res.apFilePath;
        that.setData({
          video
        });
        console.log(res)

        if (isclick) return;
        isclick = true;

        let urls = utils.formatFilePath('video', video.split(','), {
          "dirmkStr": 'family/videos', "userId": that.data.userInfo.userId
        })
        mcdj.uploadFile({
          urls,
          success(data) {
            let authVideoPath = null
            if (video)
              authVideoPath = data['video'].join(",")
            console.log(authVideoPath)
            that.setData({
              video: authVideoPath
            });
            that.saveVideo(authVideoPath);
          },
          fail() {
            isclick = false;
          }
        })
      }
    })
  },

  // 保存视频
  saveVideo(authVideoPath) {
    const that = this;
    mcdj.showLoading('保存中');
    mcdj.saveAuthVideo({
      authVideoPath,
      success(res) {
        isclick = false;
        my.hideLoading();
        app.doLogin({
          anew: 1,
          success(userInfo) {
            that.setData({
              userInfo
            })
            mcdj.showToast('已保存', 3);
          }
        })
      },
      fail(err) {
        isclick = false;
      },
    })
  },

  // 删除视频
  clearVideo() {
    const that = this;
    my.confirm({
      content: '是否要删除该视频？',
      success(res) {
        if (res.confirm)
          that.setData({
            video: null,
          });
      },
    });
  },

  // 播放视频
  playVideo() {
    const video = this.data.video;
    if (video.indexOf('http://') >= 0) {
      my.navigateTo({
        url: '/pages/colligate/webview/webview?src=' + video
      });
    } else {
      mcdj.showToast('暂时无法播放', 2);
    }
  },

  // 选择照片
  choosePhoto() {
    const that = this;
    const { data: { petPhoto } } = that;
    const length = petPhoto ? petPhoto.length : 0;
    const count = 8 - length;
    my.chooseImage({
      count,
      success(res) {
        that.setData({
          petPhoto: petPhoto ? petPhoto.concat(res.apFilePaths) : res.apFilePaths,
        });
        that.submitPhoto();
      },
    })
  },

  //提交照片
  submitPhoto(e) {
    const that = this;

    if (isclick) return;
    isclick = true;

    // 文件上传
    let urls = utils.formatFilePath("petPhoto", that.data.petPhoto, { dirmkStr: 'familyInfo/petPhoto', "userId": that.data.userInfo.userId });

    mcdj.uploadFile({
      urls,
      success(data) {
        let petPhoto = null;
        if (that.data.petPhoto && that.data.petPhoto.length > 0)
          petPhoto = data['petPhoto'];
        that.setData({
          petPhoto
        });
        that.savePhoto(petPhoto.join(","));
      },
      fail() {
        isclick = false;
      }
    })
  },

  // 保存照片
  savePhoto(petPhoto) {
    const that = this;
    const d = this.data;

    mcdj.showLoading();
    mcdj.saveAdoption({
      data: { petPhoto },
      success(res) {
        my.hideLoading();
        isclick = false;
        mcdj.showToast('已保存', 3);
      },
      fail(err) {
        isclick = false;
      },
    })
  },

  // 删除照片
  deletePhoto(e) {
    const { currentTarget: { dataset: { index } } } = e;
    const petPhoto = this.data.petPhoto;
    petPhoto.splice(index, 1);
    this.setData({ petPhoto });
    this.savePhoto(petPhoto.join(","));
  },

  // 预览照片
  previewPhoto(e) {
    my.previewImage({
      urls: this.data.petPhoto,
      current: e.currentTarget.dataset.index,
    });
  },

  // 下一步
  next() {
    if (this.data.petPhoto.length < 4) {
      mcdj.showToast('请根据示例上传不少于四张照片', 3);
      return;
    } else if (!this.data.video) {
      mcdj.showToast('请根据示例上传视频', 3);
      return;
    }
    const userInfo = this.data.userInfo;
    if (userInfo.isFaceRec) {
      const currentPages = getCurrentPages();
      if (currentPages[currentPages.length - 2].route.indexOf('/family/flow/flow') >= 0 || this.data.userVo.userCertifiedStatus == 1) {
        my.navigateBack();
      } else {
        my.redirectTo({ url: '/pages/family/flow/flow' });
      }
    }
    else
      my.redirectTo({ url: '/pages/colligate/authentication/authentication' });
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

  // 视频示例
  showVideo() {
    this.setData({
      showVideo: !this.data.showVideo
    })
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
