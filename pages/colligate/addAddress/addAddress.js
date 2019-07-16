
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let key;
Page({
  data: {},

  initialise() {
    const that = this;

    // const lngPoint = '120.12703';
    // const latPoint = '30.273923';
    // const address = '浙江省杭州市西湖区科海路云溪小镇国际会展中心:国际会展中心';
    // this.setData({
    //   lngPoint, latPoint, address,
    // })

    my.chooseLocation({
      success(res) {
        console.log(res);
        const lngPoint = res.longitude;
        const latPoint = res.latitude;
        const address = res.address || '';
        const addressName = res.name == '[位置]' ? '' : res.name;
        if (!address || !addressName) {
          mcdj.alert('请点击‘重选’按钮，选择具体的地址(ps:请注意不要选择第一个蓝色的定位地址)');
          return;
        }
        that.setData({
          lngPoint, latPoint, address, addressName
        })
      },
      fail(err) {
        if (err.error == 1) {
          mcdj.showToast('请更新支付宝，当前版本无法使用地图功能', 3)
        } else if (err.error == 11) {
          console.log('用户取消了操作')
        } else {
          mcdj.alert(err);
        }
      }
    })
  },

  onLoad(options) {
    const that = this;
    this.initialise();
  },

  inputHouseNumber(e) {
    this.setData({ houseNumber: e.detail.value });
  },

  // 是否设为默认
  changeDefault(e) {
    console.log(e);
    this.setData({
      isDefault: !this.data.isDefault,
    });
  },

  submit() {
    if (!this.data.lngPoint || !this.data.address || !this.data.addressName) {
      mcdj.showToast('请点击‘重选’按钮，通过地图找到对应的地址', 3);
      return;
    }
    const that = this;
    const lngPoint = this.data.lngPoint;
    const latPoint = this.data.latPoint;
    const commonAddress = this.data.address + ':' + this.data.addressName + (this.data.houseNumber ? ('-' + this.data.houseNumber) : '');
    const isDefault = this.data.isDefault ? 1 : 0;
    mcdj.showLoading();
    mcdj.saveCommonAddress({
      lngPoint, latPoint, commonAddress, isDefault,
      success(data) {
        const commonAddressId = data.commonAddressId;
        if (isDefault == 1) {
          mcdj.setStorageSync(app.storagekey.defaultAddressKey, {
            commonAddress, lngPoint, latPoint, commonAddressId
          });
        }
        my.hideLoading();
        my.navigateBack();
      }
    })
  },

  // 重选
  reset() {
    const that = this;
    that.setData({
      lngPoint: '',
      latitude: '',
      address: '',
    });
    this.initialise();
  },
});
