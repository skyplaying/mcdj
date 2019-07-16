
import mc from '../../../others/js/weui_mc';

let key;

Page({
  data: {
    typeArray:['每日晒图','养宠心得','撸猫记','汪星人的故事'],
    placeholder:'',
    maxlength:'',
    isCanEmpty:'',
  },

  onLoad(options) {
    // if (!options || !options.petId) {
    //   const cb = () => {
    //     my.navigateBack();
    //   };
    //   mc.alert('欠缺有效的缓存key', cb);
    // }
    console.log(options);

    const { petId } = options;
    this.setData({
       petId
    });
  },

  input(e) {
    this.setData({
      value: e.detail.value,
    });
  },

  // 选择描述照片
  chooseFosterageImg() {
    const that = this;
    const { data: { picturesPath } } = that;
    const length = picturesPath ? picturesPath.length : 0;
    const count = 4 - length;
    const cb = (apFilePaths) => {
      console.log(apFilePaths);
      that.setData({
        picturesPath: picturesPath ? picturesPath.concat(apFilePaths) : apFilePaths,
      });
    };
    mc.chooseImage(cb, count);
  },

  // 删除描述照片
  deleteFosterageImg(e) {
    const { currentTarget: { dataset: { index } } } = e;
    const path = this.data.picturesPath;
    path.splice(index, 1);
    this.setData({ picturesPath: path });
  },

  // 预览描述照片
  previewFosterageImg(e) {
    my.previewImage({
      urls: this.data.picturesPath,
      current: e.currentTarget.dataset.index,
    });
  },

  typeChange(e) {
    this.setData({
      typeIndex: e.detail.value,
    });
  },

  // 选择要寄养的宠物
  selectPet(e) {
    const { currentTarget: { dataset: { id } } } = e;
    const isSelects = this.data.isSelects || [];
    const petIds = this.data.petIds || [];
    if (isSelects[id]) {
      // 取消选择
      isSelects[id] = false;
      for (let i in petIds) {
        if (petIds[i] === id) {
          petIds.splice(i, 1);
          break;
        }
      }
    } else {
      isSelects[id] = true;
      petIds.push(id);
    }
    console.log(petIds);
    this.setData({ petIds, isSelects });
  },

  submit() {
    const { data: { value, picturesPath } } = this;
    // 判断是否可以为空
    if (!this.data.isCanEmpty && !value) {
      mc.alert(this.data.placeholder);
      return;
    }
    console.log(key);
    const initialObj = { value, picturesPath };
    mc.setStorageSync(key, initialObj);
    my.navigateBack();
  },


});

