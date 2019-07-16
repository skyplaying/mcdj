
import mcdj from '../../others/js/interface_mc';
import utils from '../../others/js/utils';
const app = getApp();
Component({
  // 这里定义了对外的属性，属性值可以在组件使用时指定，不能在自定义组件内部代码中修改
  props: {
    show: false,                        //提供给外部用来显示组件的
    onHidden: () => { },                //提供给外部用来隐藏组件的
    onFinish: (data) => { },            //告知外部已经完成的函数
    onAnewLogin: (data) => { },         //告知外部要刷新的函数
    isNoFixed: false,                   //是否不要悬浮

    id: undefined,                      //需求的Id
    lng: undefined,                     //用户的实时经纬度
    lat: undefined,                     //用户的实时经纬度
    onGetInfo: (data) => { },           //告知外部需求详情函数
  },
  data: {
    petTypeList: ['小型犬', '中型犬', '大型犬', '猫咪'],  //宠物类型列表
  },
  // 首次渲染完毕后的回调
  didMount() {
    this._init();
  },
  // 更新属性会触发组件生命周期didUpdate
  didUpdate(prevProps, prevData) {
    // console.log(prevProps, this.props, prevData, this.data);
    if ((prevProps.show == false && this.props.show == true) || prevProps.id != this.props.id) {
      this._init();
    }
  },
  methods: {
    // 隐藏组件
    _hidden() {
      this.props.onHidden();
    },

    // 初始化组件
    _init() {
      const that = this;
      // 当前的日期
      my.getServerTime({
        success(res) {
          const nowDate = utils.formatTimestamp(res.time).split(' ')[0];
          // console.log(that.props.id)
          let isEdit = that.props.id ? true : false;
          that.setData({ nowDate, startTime: nowDate, endTime: null, isEdit });
          if (isEdit) {
            that._demandInfo();
          }
        },
      });
    },

    // 寄养需求发布的宠物类型选择
    _petTypeChange(e) {
      const index = parseInt(e.currentTarget.dataset.index);
      const petTypeStates = this.data.petTypeStates || [];
      petTypeStates[index] = !petTypeStates[index];
      this.setData({
        petTypeStates
      })
    },


    // 寄养时间
    _selectSTime() {
      const that = this;
      my.datePicker({
        startDate: that.data.nowDate,
        success: (res) => {
          that.setData({
            startTime: res.date,
          });
        },
      });
    },
    _selectETime() {
      const that = this;
      if (!this.data.startTime) {
        mcdj.alert('请先选中寄养的起始时间');
        return;
      }
      my.datePicker({
        startDate: that.data.startTime,
        success: (res) => {
          that.setData({
            endTime: res.date,
          });
        },
      });
    },

    // 选择地址
    _chooseLocation() {
      const that = this;

      if (!my.canIUse('chooseLocation')) {
        const lngPoint = '120.12703';
        const latPoint = '30.273923';
        const address = '国际会展中心';
        this.setData({
          lngPoint, latPoint, address,
        })
      } else
        my.chooseLocation({
          success(res) {
            // mcdj.alert(res);
            const lngPoint = res.longitude;
            const latPoint = res.latitude;
            const address = res.name;
            that.setData({
              lngPoint, latPoint, address,
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

    // 发布需求
    _publishDemand() {
      const that = this;
      new Promise(function (resolve, reject) {
        if (app.globalData.userInfo) {
          resolve();
        } else {
          app.doLogin({
            success() {
              that.props.onAnewLogin();
              resolve();
            }
          })
        }
      }).then(function () {
        const p = new Promise(function (resolve, reject) {
          const d = that.data;
          const petTypeStates = that.data.petTypeStates || [];
          let petTypeStateArr = [];
          for (let i in petTypeStates) {
            if (petTypeStates[i])
              petTypeStateArr.push(d.petTypeList[i]);
          }

          if (petTypeStateArr.length == 0) {
            mcdj.showToast('请选择寄养的宠物类型', 3);
            reject();
          } else if (!d.endTime) {
            mcdj.showToast('请选择寄养的时间', 3);
            reject();
          } else if (!d.address) {
            mcdj.showToast('请选择您的宠物所在的地址', 3);
            reject();
          } else {
            mcdj.showLoading('保存中');

            const data = {
              fosterDemandId: that.props.id || null,
              fosterPetTypes: petTypeStateArr.join(','),
              startTime: d.startTime.split('-').join('/'),
              endTime: d.endTime.split('-').join('/'),
              demandAddress: d.address,
              adressLng: d.lngPoint,
              addressLat: d.latPoint,
            };
            mcdj.publishDemand({
              data,
              success(data) {
                resolve();
              }, fail() {
                reject();
              }
            })
          }
        })
        return p;
      }).then(function () {
        my.hideLoading();
        mcdj.showToast('保存成功', 3);

        if (that.data.isEdit) {
          that._demandInfo();
        }
        that.props.onFinish(); // axml中的事件只能由methods中的方法响应
      }, function () {
        return;
      })
    },


    // 关闭需求
    _closeDemand() {
      const that = this;
      app.doLogin({
        success() {
          that.props.onAnewLogin();
          my.confirm({
            content: '是否要关闭需求？',
            success(res) {
              if (res.confirm) {
                const fosterDemandId = that.props.id;
                mcdj.showLoading('关闭中');
                mcdj.closeDemand({
                  fosterDemandId,
                  success(data) {
                    my.hideLoading();
                    mcdj.showToast('已关闭', 3);
                    that.props.onFinish(); // axml中的事件只能由methods中的方法响应
                  }
                })
              }
            },
          });
        }
      })
    },

    // 应答情况
    _toDemandDisplay() {
      const that = this;
      if (!this.data.isEdit || !this.props.isNoFixed) return;
      const fosterDemandId = this.props.id;

      app.doLogin({
        success() {
          that.props.onAnewLogin();
          my.navigateTo({
            url: '/pages/demand/display/display?fosterDemandId=' + fosterDemandId
          })
        }
      })
    },

    //附近需求
    _toDemandList() {
      const that = this;
      app.doLogin({
        success() {
          that.props.onAnewLogin();
          my.navigateTo({
            url: '/pages/demand/list/list'
          })
        }
      })
    },

    // 寄养需求详情(修改时)
    _demandInfo() {
      const that = this;
      const fosterDemandId = this.props.id;
      const addressLng = this.props.lng || null;
      const addressLat = this.props.lat || null;
      mcdj.demandInfo({
        fosterDemandId,
        addressLng,
        addressLat,
        success(data) {
          const demandVo = data.demandVo;

          const petTypeStateArr = demandVo.fosterPetTypes.split(',');
          const petTypeList = that.data.petTypeList;
          let petTypeStates = [];
          for (let i in petTypeList) {
            if (petTypeStateArr.indexOf(petTypeList[i]) >= 0)
              petTypeStates[i] = true;
          }

          that.setData({
            demandVo,
            petTypeStates,
            startTime: demandVo.startTime.split('/').join('-'),
            endTime: demandVo.endTime.split('/').join('-'),
            address: demandVo.demandAddress,
            lngPoint: demandVo.addressLng,
            latPoint: demandVo.addressLat,
          });
          that.props.onGetInfo(demandVo);
        }
      });
    },

  },

})