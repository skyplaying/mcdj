
import mc from '../../../others/js/weui_mc';
import utils from '../../../others/js/utils';
import qcloud from '../../../others/qcloud-weapp-client-sdk/index';
import config from '../../../config';
import mcdj from '../../../others/js/interface_mc';


Page({
  data: {
    feedbackArray: ["反馈bug", "功能建议", "举报投诉", "其他"],
    feedbackIndex: null,
    feedback: "",
    feedbackImagePath: [],
  },
  onLoad() { },

  selectFeedbackType: function (e) {
    this.setData({ feedbackIndex: e.currentTarget.dataset.index })
  },

  inputFeedback: function (e) {
    this.setData({ feedback: e.detail.value })
  },

  // 选择描述照片
  chooseFeedbackImage() {
    const that = this;
    const { data: { feedbackImagePath } } = that;
    const length = feedbackImagePath ? feedbackImagePath.length : 0;
    const count = 4 - length;
    const cb = (apFilePaths) => {
      console.log(apFilePaths);
      that.setData({
        feedbackImagePath: feedbackImagePath ? feedbackImagePath.concat(apFilePaths) : apFilePaths,
      });
    };
    mc.chooseImage(cb, count);
  },

  // 删除描述照片
  deleteFeedbackImage(e) {
    const { currentTarget: { dataset: { index } } } = e;
    const path = this.data.feedbackImagePath;
    path.splice(index, 1);
    this.setData({ feedbackImagePath: path });
  },

  // 预览描述照片
  previewFeedbackImage(e) {
    my.previewImage({
      urls: this.data.feedbackImagePath,
      current: e.currentTarget.dataset.index,
    });
  },

  formSubmit() {
    const that = this
    const d = this.data;
    if (!d.feedbackIndex && d.feedbackIndex != 0) {
      mc.alert('请选择反馈类型');
    } else if (!d.feedback) {
      mc.alert('请填写您的意见或建议');
    } else {
      if (this.data.ifClick) return;
      this.setData({ ifClick: true });
      // 图片上传
      const urls = utils.formatFilePath('feedbackImagePath', d.feedbackImagePath, { dirmkStr: 'feedback' });
      const cb = (data) => {
        let path = '';
        if (d.feedbackImagePath && d.feedbackImagePath.length !== 0) {
          path = data.feedbackImagePath.join(',');
        }
        that.saveFeedBack(path);
      };
      const errcb = () => {
        that.setData({ ifClick: false });
      };
      mc.uploadFile(urls, cb, errcb);
    }
  },

  saveFeedBack(imagesPath) {
    const that = this;
    const d = this.data;

    const data = {
      feedBackContent: d.feedback,
      feedBackType: d.feedbackIndex,
      imagesPath
    };
    console.log(data);
    mc.showLoading();
    qcloud.request({
      url: config.service.api + 'feedBack/saveFeedBack',
      method: "POST",
      data,
      login: true,
      success(res) {
        if (res.data.resultCode === 'Y') {
          that.setData({ ifClick: false });
          my.hideLoading();

          const cb = () => {
            my.navigateBack();
          };
          mc.alert('您的反馈内容已经提交成功，感谢您的宝贵意见和建议，我们会及时改善，谢谢！', cb);
        } else {
          mc.alert(res.data.resultMsg);
          that.setData({ ifClick: false });
        }
      },
      fail(err) {
        mc.showToast(err.errorMessage, 1, 3000);
        that.setData({ ifClick: false });
      },
    });
  },

  // 联系客服
  customerService() {
    my.makePhoneCall({
      number: '075588823343',
      success: (res) => {

      },
    });
  },

});
