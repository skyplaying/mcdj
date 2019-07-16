
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
          that.setData({
            userInfo,
          })
          that.trainInfo();
        }
      })
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 获取训练师详情
  trainInfo() {
    const that = this;
    mcdj.trainInfo({
      success(data) {
        const trainerVo = data.trainerVo;
        console.log(trainerVo);

        // 视频
        const video = trainerVo.trainingVideoPath || '';

        that.setData({
          isok: true,
          trainerVo,

          video,
        });
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
          "dirmkStr": 'trainer/videos', "userId": that.data.userInfo.userId
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
  saveVideo(trainingVideoPath) {
    const that = this;
    mcdj.showLoading('保存中');
    mcdj.saveTrain({
      data: {
        trainingVideoPath,
      },
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

  // 视频示例
  showVideo() {
    this.setData({
      showVideo: !this.data.showVideo
    })
  },

  // 下一步
  next() {
    if (!this.data.video) {
      mcdj.showToast('请根据示例上传视频', 3);
      return;
    }
    const userInfo = this.data.userInfo;
    if (userInfo.isFaceRec) {
      const currentPages = getCurrentPages();
      console.log(currentPages)
      if (currentPages[currentPages.length - 2].route.indexOf('/trainer/flow/flow') >= 0) {
        my.navigateBack();
      } else {
        my.redirectTo({ url: '/pages/trainer/flow/flow' });
      }
    }
    else
      my.redirectTo({ url: '/pages/colligate/authentication/authentication' });
  },

  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
