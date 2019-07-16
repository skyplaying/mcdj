

/*
    这是一个瀑布流列表，头部有搜索栏，标签栏
    列表是宽度固定，高度按比例自适应的两列列表
    利用比较两列图片的高度判断新的图片放在哪一列
*/

import mc from '../../../others/js/weui_mc';

const app = getApp();

let col1H = 0;
let col2H = 0;

Page({

    data: {
        scrollH: 0,
        imgWidth: 0,
        loadingCount: 0,
        images: [],
        col1: [],
        col2: [],

        showloading: false,
        petPage: 0,
        shownomorePet: false,
        firstQueryDate: null,

        keyword: null,
        orderType: null,
        categoryIndex: null,
    },

    initialiseList(cb) {
        col1H = 0;
        col2H = 0;
        this.setData({
            loadingCount: 0,
            images: [],
            col1: [],
            col2: [],

            showloading: false,
            petPage: 0,
            shownomorePet: false,
            firstQueryDate: null,

        })
        this.loadImages(cb);
    },

    onLoad(options) {
        this.setData({
            isShowLifestyle: my.canIUse('lifestyle')
        })
        my.getSystemInfo({
            success: (res) => {
                let ww = res.windowWidth;
                let rpx = res.windowWidth / 750.00;  //1rpx相当于多少px
                let wh = res.windowHeight;
                let imgWidth = ww * 0.47;
                let scrollH = wh - (194 * rpx);  //194为头部的搜索框和标签栏

                this.setData({
                    scrollH: scrollH,
                    imgWidth: imgWidth
                });

                this.loadImages();
            }
        })
        this.queryCategoryList();
    },

    onShow() {
        // 判断来自于首页广场的哪个按钮
        const orderType = mc.getStorageSync('petListOrderType');
        console.log(orderType)
        // 改变排序方式
        if (orderType || orderType == 0) {
            my.clearStorageSync('petListOrderType');
            this.setData({ categoryIndex: null, keyword: null, orderType: !orderType && orderType != 0 ? null : orderType, })
            this.initialiseList();
        }
    },

    // 下拉刷新
    onPullDownRefresh() {
        const cb = () => { my.stopPullDownRefresh(); };
        this.setData({ keyword: null, orderType: null, categoryIndex: null, })
        this.initialiseList(cb);
    },

    onImageLoad(e) {
        let imageId = e.currentTarget.id;
        let oImgW = e.detail.width;                   //图片原始宽度
        let oImgH = e.detail.height;                  //图片原始高度
        let imgWidth = this.data.imgWidth;            //图片设置的宽度
        let scale = imgWidth / oImgW;                 //比例计算
        let imgHeight = oImgH * scale;                //自适应高度

        let images = this.data.images;
        let imageObj = null;

        for (let i = 0; i < images.length; i++) {
            let img = images[i];
            if (img.petId === imageId) {
                imageObj = img;
                break;
            }
        }

        imageObj.height = imgHeight;

        let loadingCount = this.data.loadingCount - 1;
        let col1 = this.data.col1;
        let col2 = this.data.col2;

        if (col1H <= col2H) {
            col1H += imgHeight;
            col1.push(imageObj);
            // console.log(col1)
        } else {
            col2H += imgHeight;
            col2.push(imageObj);
        }

        // if(loadingCount==9){
        //     this.loadImages();
        // }

        let data = {
            loadingCount: loadingCount,
            col1: col1,
            col2: col2
        };

        if (!loadingCount) {
            data.images = [];
        }

        this.setData(data);
    },

    loadImages(cb) {
        if (!this.data.showloading) {
            const that = this;
            const petPage = this.data.petPage + 1;
            if (!this.data.shownomorePet) {
                that.setData({ showloading: true });
                const cb1 = (list, page, ifNoMore) => {
                    let images = that.data.images.concat(list);

                    this.setData({
                        loadingCount: images.length,
                        images: images,
                        petPage: page,
                        showloading: false
                    });

                    // const newlist = that.data.petList.concat(list);
                    // that.setData({ petList: newlist, petPage: page, showloading: false });
                    if (ifNoMore) that.setData({ shownomorePet: true });
                    typeof cb == 'function' && cb();
                };
                const cb2 = (point) => {
                    const lngPoint = point.longitude;
                    const latPoint = point.latitude;
                    const firstQueryDate = that.data.firstQueryDate;
                    const petVarietyId = this.data.category ? this.data.category[this.data.categoryIndex || 0].petCategoryId : null;
                    console.log(petVarietyId)
                    mc.queryPetList(cb1, null, 10, petPage, this.data.keyword, lngPoint, latPoint,
                        firstQueryDate, this.data.orderType, petVarietyId);
                };
                const cb3 = () => {
                    that.getLocation(cb2);
                };
                that.getSysDate(cb3);
            }
        }
    },

    // 获取时间
    getSysDate(cb) {
        const that = this;
        if (that.data.firstQueryDate) {
            typeof cb == "function" && cb()
        } else {
            mc.getSysDate(function (date) {
                that.setData({ firstQueryDate: date })
                typeof cb == "function" && cb()
            });
        }
    },

    // 获取经纬度
    getLocation(cb) {
        let point = app.globalData.location || mcdj.getStorageSync(app.storagekey.locationKey) || {};
        if (!point) {
            const cb1 = (res) => {
                point = res;
                typeof cb == 'function' && cb(point || {});
            };
            mc.getLocation(cb1);
        } else {
            typeof cb == 'function' && cb(point || {});
        }
    },

    // 获取宠物类别
    queryCategoryList() {
        const that = this;
        const cb = (category) => {
            category.unshift({ categoryName: '不限', petCategoryId: 0 });
            console.log(category);
            that.setData({ category })
        };
        mc.queryCategoryList(cb);
    },

    // 分享
    onShareAppMessage() {
        return {
            title: '萌宠广场',
            desc: '一大波炒鸡好看的萌宠照片来袭，就在萌宠广场，使劲翻使劲看，翻到你手软，看到你眼馋。',
            path: 'pages/pet/list/list'
        };
    },

    // 输入搜索内容
    inputTyping(e) {
        this.setData({ inputval: e.detail.value });
    },

    // 搜索
    searchconfirm() {
        const keyword = this.data.inputval;
        this.setData({ keyword, categoryIndex: null, orderType: null, })
        this.initialiseList();
    },

    // 删除输入的内容
    clearInput() {
        this.setData({ inputval: '' });
    },

    // 改变排序的方式
    changeOrderType(e) {
        // console.log(e.currentTarget.dataset.index);
        const orderType = e.currentTarget.dataset.index;
        this.setData({ categoryIndex: null, keyword: null, orderType: !orderType && orderType != 0 ? null : orderType, })
        this.initialiseList();
    },

    // 类型选择
    categoryChange(e) {
        const categoryIndex = e.detail.value;
        this.setData({ categoryIndex, keyword: null, orderType: null, })
        this.initialiseList();
    },

    // 滚动时触发
    onScroll(e) {
        this.setData({ scrollTop: e.detail.scrollTop })
    },

    // 回到顶部
    toTop() {
        const that = this;
        this.setData({ toView: 'top' })
        const cb = () => {
            that.setData({ toView: '' })
        };
        setTimeout(cb, 1000);
    },

    // 保存formId
    setFormId(e) {
        app.setFormId(e);
    },

})