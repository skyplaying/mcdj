
import mc from '../../../others/js/weui_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isPublish;

Page({
  data: {
    showloading: false,
    logPage: 0,
    logList: [],
    shownomoreLog: false,

    logKey: 'logKey',
  },

  // 初始化
  initialization() {
    const that = this;

    app.doLogin(function (userInfo) {
      that.setData({ userInfo })
      const cb = () => {
        that.setData({ isOk: true });
      };
      that.queryFosterMessage(cb);

      that.initializationList();
      that.queryAdoptLogList();
    })
  },

  // 初始化列表
  initializationList() {
    this.setData({
      showloading: false,
      logPage: 0,
      logList: [],
      shownomoreLog: false,
    });
  },

  onLoad(options) {
    const that = this;

    // options.adoptRecordId = 95;

    this.setData({ adoptRecordId: options.adoptRecordId, logKey: this.data.logKey + options.adoptRecordId });

    this.initialization();
  },

  onShow() {
    if (isPublish) {
      // 获取宠物日记
      const petLog = mc.getStorageSync(this.data.logKey) || {};
      console.log(petLog);
      this.sublimePetLog(petLog);
    }
  },

  // 获取寄养的内容
  queryFosterMessage(cb) {
    const that = this;
    const adoptRecordId = this.data.adoptRecordId;
    mc.showLoading();
    const cb1 = (data) => {
      const d = data.fosterPetVo;
      console.log(d);

      that.setData({
        fosterPetVo: d,
      });
      typeof cb == 'function' && cb();
      my.hideLoading();
    };
    mc.findByProtocol(cb1, adoptRecordId);
  },

  // 获取宠物日记的列表
  queryAdoptLogList(cb) {
    const that = this;
    const adoptRecordId = that.data.adoptRecordId;
    const logPage = this.data.logPage + 1;
    if (!this.data.shownomoreLog) {
      that.setData({ showloading: true });
      const cb1 = (list, page, ifNoMore) => {
        const newlist = that.data.logList.concat(list);
        that.setData({ logList: newlist, logPage: page, showloading: false });
        if (ifNoMore) that.setData({ shownomoreLog: true });
        typeof cb == 'function' && cb();
      };
      mc.queryAdoptLogList(cb1, 5, logPage, adoptRecordId);
    }
  },


  // 预览图片
  previewImage(e) {
    const that = this;
    const { currentTarget: { dataset: { index, imgindex } } } = e;
    my.previewImage({
      current: imgindex,
      urls: that.data.logList[index].picturesPathList,
    });
  },

  // 提交日记图片
  sublimePetLog(petLog) {
    const that = this;
    if (!petLog.value) return;

    // 图片上传
    const urls = utils.formatFilePath('picturesPath', petLog.picturesPath, { dirmkStr: 'petLog' });
    const cb = (data) => {
      let path = '';
      if (petLog.picturesPath && petLog.picturesPath.length !== 0) {
        path = data.picturesPath.join(',');
      }
      that.writePetLog(petLog.value, path);
    };
    console.log(urls);
    mc.uploadFile(urls, cb);
  },
  // 发布动态日记
  writePetLog(logContent, picturesPath) {
    const that = this;
    const adoptRecordId = that.data.adoptRecordId
    if (logContent) {
      const cb = () => {
        my.hideLoading();
        mc.removeStorageSync(that.data.logKey);
        isPublish = false
        that.initializationList();
        that.queryAdoptLogList();
      };
      mc.showLoading();
      mc.writePetLog(cb, adoptRecordId, logContent, picturesPath);
    }
  },

  // 发布日记按钮
  publish() {
    my.navigateTo({
      url: '/pages/found/textareaImg/textareaImg?key=' + this.data.logKey + '&placeholder=请填写宠物日记内容',
      success(res) {
        isPublish = true;
      }
    });
  },

  // 前往寄养流程展示页
  toFosterProcess() {
    console.log(getCurrentPages());
    const that = this;
    const pages = getCurrentPages();
    for (let i in pages) {
      if (pages[i].route.indexOf('display/fosterProcess') >= 0) {
        const delta = pages.length - (parseInt(i) + 1);
        my.navigateBack();
      } else if (pages.length == parseInt(i) + 1) {
        my.redirectTo({
          url: '/pages/display/fosterProcess/fosterProcess?adoptRecordId=' + that.data.adoptRecordId,
        });
      }
    }
  },


});
