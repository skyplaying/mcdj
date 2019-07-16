
import mcdj from '../../../others/js/interface_mc';
import utils from '../../../others/js/utils';

const app = getApp();

let isNoFirst, isclick;
Page({
  data: {},

  onLoad() { },

  onShow() {
    const that = this;

    app.doLogin({
      loginType: 0,
      success(userInfo) {
        that.setData({ userInfo });
        // const data = JSON.parse('{"res":{"accuracy":"0.4608","baike":{"introduce":"拉布拉多又称寻回犬，是一种大型犬类，是非常适合被选作经常出入公共场合的导盲犬或地铁警犬及搜救犬和其他工作犬的狗品种，因原产地在加拿大的纽芬兰与拉布拉多省而得名。跟西伯利亚雪撬犬和金毛寻回犬并列三大无攻击性犬类。拉布拉多智商位列世界犬类第六位。个性忠诚、大气、憨厚、温和、阳光、开朗、活泼，智商极高，也对人很友善，拉布拉多猎犬有四种颜色，分别为：黑色、黄色、巧克力、米白色。最常见的是黑色，黄色。在美国犬业俱乐部中拉布拉多是目前登记数量最多的品种，对小孩尤其的友善，对犬主人略粘人。","petName":"拉布拉多猎犬(拉布拉多)","pictures":["https://gss3.bdstatic.com/7Po3dSag_xI4khGkpoWK1HF6hhy/baike/s%3D220/sign=a5244e42b4096b63851959523c328733/30adcbef76094b3603cd9280a9cc7cd98d109d04.jpg","https://gss0.bdstatic.com/-4o3dSag_xI4khGkpoWK1HF6hhy/baike/s%3D220/sign=aae836ee5343fbf2c12ca121807fca1e/fcfaaf51f3deb48fe0e0b238f01f3a292cf5784e.jpg","https://gss3.bdstatic.com/7Po3dSag_xI4khGkpoWK1HF6hhy/baike/s%3D220/sign=fbea218c3ca85edffe8cf921795609d8/c9fcc3cec3fdfc03d59eab64dc3f8794a5c22603.jpg","https://gss3.bdstatic.com/7Po3dSag_xI4khGkpoWK1HF6hhy/baike/s%3D220/sign=1474e9d561d9f2d3241123ed99ec8a53/d52a2834349b033b34352aee16ce36d3d539bd41.jpg"]},"msg":"拉布拉多","status":200},"resultCode":"Y","resultMsg":"操作成功！"}');
        // const petInfo = data.res;
        // that.setData({ petInfo });
      }
    });
  },

  onUnload() {
    // 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
    isclick = undefined, isNoFirst = undefined;
  },

  // 选择照片
  chooseImage(e) {
    const that = this;
    const index = e.currentTarget.dataset.index;
    const sourceType = ['camera', 'album'][index].split(',');
    console.log(sourceType)
    my.chooseImage({
      sourceType,
      count: 1,
      success(res) {
        const images = res.apFilePaths;
        that.setData({
          images
        })
        if (images && images.length > 0)
          that.petDistinguish(images);
      },
    })
  },


  petDistinguish(images) {
    const that = this
    const filePath = images[0];

    my.uploadFile({
      url: 'https://test.qipinke.com/petserver/api/file/petDistinguish',
      filePath,
      fileName: "file",
      fileType: "image",
      success: function (res) {
        console.log(res)
        var data = JSON.parse(res.data);
        if (data.resultCode == "Y") {
          const result = data.res;
          if (result.status == 200) {
            const accuracy = parseFloat(result.accuracy) * 100;
            result.accuracy = parseInt(accuracy)+'%';
            console.log(result)
            that.setData({
              petInfo: result
            })
            that.showPetInfo();
          } else {
            mcdj.showToast('图片识别失败，请换张照片', 3, 3000);
          }
        } else {
          mcdj.showToast(res.data.resultMsg, 3, 3000);
          console.log('请求异常,错误' + res.data.resultMsg)
        }
      },
      fail(err) {
        console.log(err);
      },
    })
  },

  // 显示识别到的宠物
  showPetInfo() {
    this.setData({
      showPetInfo: !this.data.showPetInfo
    })
  },

  // 查看宠物信息
  toDisplay() {
    const petName = this.data.petInfo.msg;
    my.navigateTo({
      url: '../display/display?petName=' + petName
    });
  },


  //-------------------------------------------------------

  // 保存二维码
  setFormId(e) {
    mcdj.setFormId(e);
  },

});
