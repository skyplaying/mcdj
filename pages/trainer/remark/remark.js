
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isclick;
Page({
  data: {
    advanceNumArr: ["1", "2", "3", "4", "5", "6", "7"],
    advanceNumIndex: 0,

    advanceUnit: "天",

    remarkArr: ["宠物须注射过疫苗", "请提前告知宠物性格、习惯", "不接受烈性犬", "享受终身免费复训"],
    remarkStateArr: [],
  },

  onLoad(options) {
    const that = this;
    console.log(options)
    if (options) {
      const isReserve = options.isReserve || false;
      const advanceNum = options.advanceNum || null;
      const remark = options.remark || '';
      // 提前的天数
      let advanceNumIndex = 0;
      const advanceNumArr = this.data.advanceNumArr;
      if (advanceNum) {
        for (let i in advanceNumArr) {
          if (advanceNumArr[i] == advanceNum) {
            advanceNumIndex = i;
            break;
          }
        }
      }
      // 备注
      const remarks = remark ? remark.split(',') : [];
      const remarkArr = this.data.remarkArr;
      const remarkStateArr = this.data.remarkStateArr;
      for (let i in remarks) {
        const index = remarkArr.indexOf(remarks[i]);
        if (index >= 0) {
          remarkStateArr[index] = true;
        } else {
          remarkArr.push(remarks[i]);
          remarkStateArr[remarkArr.length - 1] = true;
        }
      }

      this.setData({ isReserve, advanceNumIndex, remarkStateArr });
    }
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined;
  },

  // 是否需要提前预订
  changeIsReserve(e) {
    const isReserve = e.detail.value;
    this.setData({
      isReserve
    })
  },

  // 提前时间
  changeAdvanceNum(e) {
    this.setData({
      advanceNumIndex: e.detail.value,
    });
  },

  // 备注说明
  changeRegion(e) {
    console.log(e.currentTarget.dataset.index)
    const index = e.currentTarget.dataset.index;
    const remarkStateArr = this.data.remarkStateArr;
    remarkStateArr[index] = !remarkStateArr[index];
    this.setData({
      remarkStateArr
    })
  },

  // 其他说明输入
  inputRemark(e) {
    const remarkText = e.detail.value;
    this.setData({
      remarkText
    })
  },

  // 确定其他说明
  submitRemark() {
    const remarkText = this.data.remarkText;
    const remarkArr = this.data.remarkArr;
    const remarkStateArr = this.data.remarkStateArr;
    remarkArr.push(remarkText);
    remarkStateArr[remarkArr.length - 1] = true;
    this.setData({
      remarkArr, remarkStateArr, remarkText: '',
    })
  },

  // 保存 
  save() {
    const that = this;
    const isReserve = this.data.isReserve;
    const advanceNum = isReserve ? this.data.advanceNumArr[this.data.advanceNumIndex] : null;
    const advanceUnit = this.data.advanceUnit;
    const remarkArr = this.data.remarkArr;
    const remarkStateArr = this.data.remarkStateArr;
    let remarks = [];
    for (let i in remarkArr) {
      if (remarkStateArr[i]) {
        remarks.push(remarkArr[i])
      }
    }
    const remark = remarks.join(',');
    console.log(remark);

    mcdj.textRiskIdentification(function () {
      if (isclick) return;
      isclick = true;

      let data = mcdj.getStorageSync('addServer') || {};
      data.isReserve = isReserve;
      data.advanceNum = advanceNum;
      data.advanceUnit = advanceUnit;
      data.remark = remark;

      console.log(data)
      mcdj.setStorageSync('addServer', data);

      isclick = false;
      my.navigateBack();
    }, remark, '备注说明')
  },

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
