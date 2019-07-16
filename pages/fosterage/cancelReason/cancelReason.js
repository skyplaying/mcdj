import mc from '../../../others/js/weui_mc';

Page({
  data: {
    adoptionReason: [
      '联系不上对方', '跟对方协商后不合适收养', '虚假寄养信息', '对方已经找到收养了', '对方不需要寄养了', '宠物生病了', '对方更改了时间，无法收养', '临时有事，无法收养', '接宠地址太远，不方便接送', '寄养描述与实际不符', '其他原因'
    ],
    fosterReason: [
      '联系不上对方', '对方不符合我的寄养要求', '跟收寄方达不成共识，找别人寄养', '收寄方态度不好，我不信任', '填错时间和报酬了，我要重新填写', '宠物生病了', '有亲戚、朋友帮我寄养', '不需要寄养了', '找到更合适的人寄养了', '对方要求加价或者现金交易', '其他原因'
    ],
  },
  onLoad(options) {
    // options.type = 0
    // options.adoptRecordId = 92
    this.setData({ type: options.type, adoptRecordId: options.adoptRecordId });
    this.queryReasonArr()
  },

  selectCancel(e) {
    const cancelIndex = e.currentTarget.dataset.index;
    this.setData({ cancelIndex });
  },

  // 获取取消的原因列表
  queryReasonArr(cb) {
    const that = this;
    const adoptRecordId = that.data.adoptRecordId;
    const type = that.data.type;
    const cb1 = (reasonArr) => {
      that.setData({ reasonArr });
      typeof cb == 'function' && cb();
    };
    mc.queryCancalList(cb1, type);
  },

  // 取消收养 
  cancalAdopt() {
    const that = this;
    const { data: { adoptRecordId, reasonArr, cancelIndex } } = this;
    if (cancelIndex || cancelIndex == 0) {
      const cancelReason = reasonArr[cancelIndex].cancelReason;
      mc.showLoading();
      const cb1 = () => {
        my.hideLoading();
        my.navigateBack({
          delta: 2
        });
      };
      mc.cancalAdopt(cb1, adoptRecordId, cancelReason);
    }
  },

});
