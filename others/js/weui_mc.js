
import utils from '/others/js/utils';
import qcloud from '/others/qcloud-weapp-client-sdk/index';
import config from '/config';
const api = config.service.api;

// 显示警告框
var alert = (content, cb, buttonText) => {
    my.hideToast();
    my.hideLoading();
    my.hideNavigationBarLoading();

    my.alert({
        content: JSON.stringify(content),
        buttonText: buttonText || '知道了',
        success() {
            typeof cb == "function" && cb();
        },
    });
};

// 显示确认框
var confirm = (cb, content, confirmButtonText, cancelButtonText) => {
    my.hideToast();
    my.hideLoading();
    my.hideNavigationBarLoading();

    my.confirm({
        title: '温馨提示',
        content: content,
        confirmButtonText: confirmButtonText || '确定',
        cancelButtonText: cancelButtonText || '取消',
        success(res) {
            console.log(res)
            if (res.confirm) {
                typeof cb == "function" && cb();
            }
        },
    });
};

// 显示Toast提示
var showToast = (content, type, duration, cb) => {
    my.hideToast();
    my.hideLoading();
    my.hideNavigationBarLoading();
    var type = (!type ? 'success' : '') + (type == 1 ? 'fail' : '') + (type == 2 ? 'exception ' : '') + (type == 3 ? 'none' : '')
    my.showToast({
        content: content,
        type: type,
        duration: duration || 1500,
        success(res) {
            typeof cb == "function" && cb();
        },
    });
}

// 显示加载中
var showLoading = (content, delay) => {
    my.hideToast();
    my.hideLoading();
    my.hideNavigationBarLoading();
    // isNavbar决定是头部显示加载还是页面显示加载
    my.showLoading({
        content: content || '加载中...',
        delay: delay || 0,
    })
}

// 同步缓存
var setStorageSync = (key, data) => {
    my.setStorageSync({
        key: key,
        data: data
    });
}

// 同步获取缓存
var getStorageSync = (key) => {
    return my.getStorageSync({ key: key }).data;
}

// 同步清除缓存
var removeStorageSync = (key) => {
    my.removeStorageSync({ key: key });
}

// 选取图片
var chooseImage = (cb, count, sourceType) => {
    var sourceType = ['album', 'camera']
    if (sourceType == 'a')
        sourceType = ['album']
    else if (sourceType == 'c')
        sourceType = ['camera']

    my.chooseImage({
        count, sourceType,
        success(res) {
            typeof cb == "function" && cb(res.apFilePaths)
        },
        // fail(err) {
        //     console.log(err)
        //     if (err.error == 11)
        //         alert('权限不够');
        // }
    })
}

//接口调用失败的回调函数(点击事件失败后放开防止双击字段需要用到失败回调函数)
var fail = (err, errcb) => {
    const errorTexts = {
        11: '无权跨域',
        12: '网络出错',
        13: '超时',
        14: '解码失败',
        19: 'HTTP错误'
    };
    showToast(errorTexts[err.error] || err.errorMessage, 1, 3000);
    // showToast(err.errorMessage, 1, 3000);
    // alert(err);
    // my.redirectTo({
    //   url: '/pages/colligate/errPrompt/errPrompt?error='+err.error,
    // });
    typeof errcb == 'function' && errcb();
    console.log(err);
}

//接口调用成功的回调函数
var success = (res, cb, errcb) => {
    // console.log(res)
    if (res.data.resultCode == 'Y') {
        typeof cb == "function" && cb(res.data)
    } else {
        alert(res.data.resultMsg);
        console.log('请求异常,错误' + res.data.resultMsg)
        typeof errcb == "function" && errcb(res.data)
    }
}

//有分页的列表接口调用成功的回调函数
var listSuccess = (res, cb) => {
    // 判断是否还有数据可以加载
    var ifNoMore = isNoMore(res)

    typeof cb == "function" && cb(res.data.results, res.data.page, ifNoMore, res.data.total, res.data)
}

// 判断是否还有数据可以加载
var isNoMore = (res) => {
    var ifNoMore1 = res.data.total % res.data.pageSize == 0 && res.data.total / res.data.pageSize == res.data.page
    var ifNoMore2 = res.data.total % res.data.pageSize != 0 && res.data.total / res.data.pageSize < res.data.page
    var ifNoMore = res.data.total == 0 || ifNoMore1 || ifNoMore2
    return ifNoMore;
}
// --------------------------------------------------------------------------


//兑换五一活动保险
function receiveGift(obj) {
    const success = obj.success;
    const fail = obj.fail;
    qcloud.request({
        url: api + 'common/receiveGift',
        method: "POST",
        login: true,
        success, fail
    })
}

//五一活动详情
function checkIsChange(obj) {
    const success = obj.success;
    const fail = obj.fail;
    qcloud.request({
        url: api + 'common/checkIsChange',
        method: "POST",
        login: true,
        success, fail
    })
}

// ------------------------------------------------------

//获取我的配对订单列表
function queryMyPairOrderList(cb, pageSize, page, petId) {
    qcloud.request({
        url: api + 'pairOrder/queryMyPairOrderList',
        method: "POST",
        data: { page, pageSize, petId },
        success(res) { listSuccess(res, cb) }, fail
    })
}

//归还配对的宠物(输入还宠口令)
function finishPetPair(cb, errcb, pairOrderId, returnPassWord) {
    qcloud.request({
        url: api + 'pairOrder/finishPetPair',
        method: "POST",
        login: true,
        data: { pairOrderId, returnPassWord },
        success(res) { success(res, cb, errcb) },
        fail(err) { fail(err, errcb) }
    })
}

//接到配对的宠物
function receivedPairPet(cb, errcb, pairOrderId) {
    qcloud.request({
        url: api + 'pairOrder/receivePet',
        method: "POST",
        login: true,
        data: { pairOrderId },
        success(res) { success(res, cb, errcb) },
        fail(err) { fail(err, errcb) }
    })
}

// 上传支付配对订单至服务器
function payPetPoir(cb, pairOrderId) {
    qcloud.request({
        url: api + 'pairOrder/payPetPoir',
        data: { pairOrderId },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

// 借配人支付(信用借还)
function confirmPoirPetByCredit(cb, out_order_no, deposit_amount, rent_amount, expiry_time, pairOrderId) {
    // 归还时间
    expiry_time = expiry_time + " 23:59:59";
    my.zmCreditBorrow({
        out_order_no: out_order_no,
        product_code: "w1010100000000002858",
        goods_name: "萌宠到家宠物",
        rent_unit: "YUAN_ONCE",
        rent_amount: rent_amount + '',
        deposit_amount: deposit_amount + '',
        deposit_state: "Y",
        invoke_return_url: "alipays://platformapi/startapp?appId=2017090608580011&query=number%3D1&page=pages/display/pairApply/pairApply?pairOrderId=" + pairOrderId,
        invoke_type: "TINYAPP",
        // borrow_time: "2017-11-24 00:00:00",
        expiry_time: expiry_time,
        rent_info: "",
        borrow_cycle: "0", //免费多久
        borrow_cycle_unit: "DAY", //免费多久的单位
        borrow_shop_name: "萌宠到家平台",
        success: (res) => {
            // try {
            const { resultStatus, result } = res;
            switch (resultStatus) {
                case '9000':
                    const callbackData = res.result.callbackData;
                    const decodedCallbackData = decodeURIComponent(callbackData)
                    const json = JSON.parse(decodedCallbackData.match(/{.*}/));
                    const jsonStr = JSON.stringify(json, null, 4);
                    if (json.success === true || json.success === 'true') {
                        // 创建订单成功, 此时可以跳转到订单详情页面
                        payPetPoir(cb, pairOrderId)
                        // my.alert({ content: '下单成功: ' + jsonStr })
                    } else {
                        // 创建订单失败, 请提示用户创建失败
                        // my.alert({ content: '下单失败: ' + jsonStr })
                    }
                    this.setData({
                        callbackData: callbackData,
                        decodedCallbackData: decodedCallbackData,
                        parsedJSON: jsonStr,
                    })
                    break;
                case '6001':
                    // 用户点击返回, 取消此次服务, 此时可以给提示
                    my.alert({ content: '取消' })
                    break;
                default:
                    break;
            }
            // } catch (error) {
            //     // 异常, 请在这里提示用户稍后重试
            //     my.alert({
            //         content: '异常' + JSON.stringify(error, null, 4)
            //     });
            // }
        },
        fail: (error) => {
            // 调用接口失败, •请在这里提示用户稍后重试
            my.alert({
                content: '调用失败' + JSON.stringify(error, null, 4)
            });
        }
    });
}

// 取消宠物配对订单
function cancelPairOrder(cb, pairOrderId) {
    qcloud.request({
        url: api + 'pairOrder/cancelPairOrder',
        data: { pairOrderId },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

// 配对流程的详情
function pairOrderInfo(cb, pairOrderId) {
    qcloud.request({
        url: api + 'pairOrder/pairOrderInfo',
        login: true,
        data: { pairOrderId },
        success(res) { success(res, cb) }, fail
    });
}

//删除钟意我的宠物（钟意我的宠物配对列表）
function delPairLike(cb, pairLikeId) {
    qcloud.request({
        url: api + 'pairLike/delPairLike',
        data: { pairLikeId },
        login: true,
        success(res) { success(res, cb) }, fail
    })
}

//获取我的配对列表(isEstrus：是否发情 1是 null全部；pairType 0配对 1钟意我 2我钟意的;petId null表示我的所有配对)
function queryMyPairList(cb, Storagename, pageSize, page, petId, pairType, isEstrus) {
    qcloud.request({
        url: api + 'pairLike/queryMyPairList',
        method: "POST",
        data: {
            page, pageSize, petId, pairType, isEstrus,
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

//钟意宠物（配对）
function savePairLike(cb, aPetId, bPetId) {
    qcloud.request({
        url: api + 'pairLike/savePairLike',
        data: { aPetId, bPetId },
        login: true,
        success(res) { success(res, cb) }, fail
    })
}

//获取宠物配对列表(distanceType:1：当前城市 2 ：10KM 3：5KM null： 全国；isLikeMyPet：1是 null 全部；isEstrus：是否发情 1是 null全部；)
function queryPetPairList(cb, Storagename, pageSize, page, petId, distanceType, isLikeMyPet, isEstrus, age, endAge, lngPoint, latPoint, firstQueryDate) {
    qcloud.request({
        url: api + 'pet/queryPetPairList',
        method: "POST",
        data: {
            page, pageSize, petId, isLikeMyPet, isEstrus, lngPoint, latPoint, firstQueryDate,
            distanceType: distanceType || null,
            age: age || 1, endAge: endAge || 10
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}


//保存寄养转发信息
function saveFosterForward(fosterId) {
    qcloud.request({
        url: api + 'foster/saveFosterForward',
        data: { fosterId },
        login: true
    });
}


//获取收养人的评价列表
function queryAdopterCommentList(cb, pageSize, page, beUserId) {
    qcloud.request({
        url: api + 'serviceComment/queryComentList',
        data: {
            page, pageSize, beUserId
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

//获取宠物的评价列表
function queryPetCommentList(cb, pageSize, page, petId) {
    qcloud.request({
        url: api + 'adoptComment/queryPetCommentList',
        data: {
            page, pageSize, petId
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

//获取我的领养列表
function myAdoptApplyList(cb, Storagename, pageSize, page) {
    qcloud.request({
        url: api + 'adopt/myAdoptApplyList',
        login: true,
        data: {
            page, pageSize,
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

//获取我关注的宠物列表
function myFollowPets(cb, Storagename, pageSize, page) {
    qcloud.request({
        url: api + 'pet/myFollowPets',
        login: true,
        data: {
            page, pageSize,
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

//获取我关注的寄养列表
function myCollectFosterList(cb, Storagename, pageSize, page) {
    qcloud.request({
        url: api + 'foster/myCollectFosterList',
        login: true,
        data: {
            page, pageSize,
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

//获取我的寄养列表
function myFosterPetList(cb, Storagename, pageSize, page, keyword, fosterStatus, userId) {
    qcloud.request({
        url: api + 'foster/myFosterPetList',
        login: true,
        method: "POST",
        data: {
            page, pageSize,
            keyword: keyword || null,
            fosterStatus: fosterStatus || fosterStatus == 0 ? fosterStatus : null,
            userId
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

// 查看评价（领养人评价寄养的宠物）
function getAdoptCommentInfo(cb, adoptRecordId) {
    qcloud.request({
        url: api + 'adoptComment/getAdoptCommentInfo',
        data: { adoptRecordId },
        success(res) { success(res, cb) }, fail
    });
}

// 寄养流程评价（领养人评价寄养的宠物）
function submitAdoptComment(cb, adoptRecordId, commentContent, picturesPath) {
    qcloud.request({
        url: api + 'adoptComment/submitAdoptComment',
        method: "POST",
        data: { adoptRecordId, commentContent, picturesPath: picturesPath || '' },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

// 寄养流程评价（寄养人评价收养人）
function submitFosterComment(cb, adoptRecordId, commentContent, petAbility, petEnvironment, communicators) {
    qcloud.request({
        url: api + 'serviceComment/saveComment',
        method: "POST",
        data: { adoptRecordId, commentContent, petAbility, petEnvironment, communicators },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

//已归还宠物(输入还宠口令)
function fulfilAdopt(cb, errcb, adoptRecordId, returnPassWord) {
    qcloud.request({
        url: api + 'adopt/fulfilAdopt',
        method: "POST",
        login: true,
        data: { adoptRecordId, returnPassWord },
        success(res) { success(res, cb, errcb) },
        fail(err) { fail(err, errcb) }
    })
}

//获取宠物日记的列表
function queryAdoptLogList(cb, pageSize, page, adoptRecordId) {
    qcloud.request({
        url: api + 'adoptLog/queryAdoptLogList',
        data: {
            page, pageSize, adoptRecordId,
        },
        login: true,
        success(res) { listSuccess(res, cb) }, fail
    })
}

// 发布动态日记
function writePetLog(cb, adoptRecordId, logContent, picturesPath) {
    qcloud.request({
        url: api + 'adoptLog/writePetLog',
        method: "POST",
        data: { adoptRecordId, logContent, picturesPath },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

//接到宠物(输入接宠口令)
function receivedPet(cb, errcb, adoptRecordId, petPassWord) {
    qcloud.request({
        url: api + 'adopt/receivedPet',
        method: "POST",
        login: true,
        data: { adoptRecordId, petPassWord },
        success(res) { success(res, cb, errcb) },
        fail(err) { fail(err, errcb) }
    })
}

// 寄养宠物协议内容信息
function findByProtocol(cb, adoptRecordId) {
    qcloud.request({
        url: api + 'foster/findByProtocol',
        login: true,
        data: { adoptRecordId },
        success(res) { success(res, cb) }, fail
    });
}

// 寄养者确认签名(并且支付酬金)
function submitAdoptPet(cb, adoptRecordId) {
    qcloud.request({
        url: api + 'adopt/submitAdoptPet',
        data: { adoptRecordId },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

// 收养人确认签名(并且支付押金)
function confirmAdoptPet(cb, adoptRecordId) {
    qcloud.request({
        url: api + 'adopt/confirmAdoptPet',
        data: { adoptRecordId },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

function confirmCreditAdoptPet(cb, adoptRecordId, creditOrderNo) {
    qcloud.request({
        url: api + 'adopt/confirmCreditAdoptPet',
        data: { adoptRecordId, creditOrderNo },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

// 收养人确认签名(信用借还)
function confirmAdoptPetByCredit(cb, userId, deposit_amount, expiry_time, adoptRecordId, adoptApplyId) {
    generateOrderNumToCredit(function (out_order_no) {
        my.zmCreditBorrow({
            out_order_no: out_order_no,
            product_code: "w1010100000000002858",
            goods_name: "萌宠到家宠物",
            rent_unit: "DAY_YUAN",
            rent_amount: "0.00",
            deposit_amount: deposit_amount + '',
            deposit_state: "Y",
            invoke_return_url: "alipays://platformapi/startapp?appId=2017090608580011&query=number%3D1&page=pages/display/fosterProcess/fosterProcess?adoptApplyId=" + adoptApplyId,
            invoke_type: "TINYAPP",
            // borrow_time: "2017-11-24 00:00:00",
            expiry_time: expiry_time + " 23:59:59",
            rent_info: "免费",
            borrow_cycle: "0", //免费多久
            borrow_cycle_unit: "DAY", //免费多久的单位
            borrow_shop_name: "萌宠到家平台",
            success: (res) => {
                // try {
                const { resultStatus, result } = res;
                switch (resultStatus) {
                    case '9000':
                        const callbackData = res.result.callbackData;
                        const decodedCallbackData = decodeURIComponent(callbackData)
                        const json = JSON.parse(decodedCallbackData.match(/{.*}/));
                        const jsonStr = JSON.stringify(json, null, 4);
                        if (json.success === true || json.success === 'true') {
                            // 创建订单成功, 此时可以跳转到订单详情页面
                            confirmCreditAdoptPet(cb, adoptRecordId, out_order_no)
                            // my.alert({ content: '下单成功: ' + jsonStr })
                        } else {
                            // 创建订单失败, 请提示用户创建失败
                            my.alert({ content: '下单失败: ' + jsonStr })
                        }
                        this.setData({
                            callbackData: callbackData,
                            decodedCallbackData: decodedCallbackData,
                            parsedJSON: jsonStr,
                        })
                        break;
                    case '6001':
                        // 用户点击返回, 取消此次服务, 此时可以给提示
                        my.alert({ content: '取消' })
                        break;
                    default:
                        break;
                }
                // } catch (error) {
                //     // 异常, 请在这里提示用户稍后重试
                //     my.alert({
                //         content: '异常' + JSON.stringify(error, null, 4)
                //     });
                // }
            },
            fail: (error) => {
                // 调用接口失败, •请在这里提示用户稍后重试
                my.alert({
                    content: '调用失败' + JSON.stringify(error, null, 4)
                });
            }
        });
    }, userId)
}

// 生成信用借还的外部订单号
function generateOrderNumToCredit(cb, userId) {
    getSysDate(function (date) {
        const arr = date.split(' ');
        const arr1 = arr[0].split('-');
        const arr2 = arr[1].split(':');
        const code = Math.floor(Math.random() * 900) + 100;
        const out_order_no = arr1[0] + arr1[1] + arr1[2] + arr2[0] + arr2[1] + arr2[2] + code + userId;
        console.log(out_order_no);
        typeof cb == "function" && cb(out_order_no);
    })
}

// 寄养流程的详情
function adoptPetInfo(cb, adoptRecordId) {
    qcloud.request({
        url: api + 'adopt/adoptPetInfo',
        login: true,
        data: { adoptRecordId },
        success(res) { success(res, cb) }, fail
    });
}

//获取认证领养人列表
function queryAdopterList(cb, Storagename, pageSize, page, lngPoint, latPoint, firstQueryDate, pointCity, fosterId) {
    qcloud.request({
        url: api + 'user/queryAdopterList',
        method: "POST",
        data: {
            page, lngPoint, latPoint, pageSize,
            firstQueryDate, pointCity, fosterId,
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

//获取取消收养的原因（cancelType 0寄养者 1收养者）
function queryCancalList(cb, cancelType) {
    qcloud.request({
        url: api + 'common/queryCancalList',
        data: { cancelType },
        success(res) {
            typeof cb == 'function' && cb(res.data);
        }, fail
    })
}

// 取消收养
function cancalAdopt(cb, adoptRecordId) {
    qcloud.request({
        url: api + 'adopt/cancalAdopt',
        data: { adoptRecordId },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

// 收养Ta(收养人点击)
function applyAdopt(cb, fosterId) {
    qcloud.request({
        url: api + 'adopt/applyAdopt',
        method: "POST",
        data: { fosterId },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

// 请Ta(寄养人邀请)养
function askedHimAdopt(cb, fosterId, userId) {
    qcloud.request({
        url: api + 'adopt/askedHimAdopt',
        method: "POST",
        data: { fosterId, userId },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

//关注/取消关注寄养
function fosterPetCollect(cb, fosterId) {
    qcloud.request({
        url: api + 'foster/fosterPetCollect',
        data: { fosterId },
        login: true,
        success(res) { success(res, cb) }, fail
    })
}

//获取寄养列表(fosterStatus:0待寄养信息 null为全部)
function queryFosterPetList(cb, Storagename, pageSize, page, keyword, lngPoint, latPoint, pointCity, firstQueryDate, fosterStatus) {
    qcloud.request({
        url: api + 'foster/queryFosterPetList',
        method: "POST",
        data: {
            page, lngPoint, latPoint, pointCity, pageSize,
            fosterStatus: fosterStatus || fosterStatus == 0 ? fosterStatus : null,
            keyword: keyword || null,
            firstQueryDate,
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

//获取宠物列表(首页展示，orderType：null为昨天到今天新增时间排序 0按距离排序 1按时间排序 2 为按点赞数和时间排序 ,默认为null; petVarietyId:null是不限宠物类型)
function queryPetList(cb, Storagename, pageSize, page, keyword, lngPoint, latPoint, firstQueryDate, orderType, petVarietyId) {
    qcloud.request({
        url: api + 'pet/queryPetList',
        method: "POST",
        data: {
            page, lngPoint, latPoint, pageSize,
            orderType: !orderType && orderType != 0 ? null : orderType,
            petVarietyId: !petVarietyId ? null : petVarietyId,
            keyword: keyword || null,
            firstQueryDate,
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}


// 获取领养人个人资料
function getKeepPet(cb, userId) {
    qcloud.request({
        url: api + 'user/getKeepPet',
        data: { userId },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

// 删除领养（寄养人）
function delFosterPet(cb, fosterId) {
    qcloud.request({
        url: api + 'foster/delFosterPet',
        data: { fosterId },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

// 关闭领养（寄养人）
function cancelFosterPet(cb, fosterId) {
    qcloud.request({
        url: api + 'foster/cancelFosterPet',
        data: { fosterId },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

// 开启领养（寄养人）
function openFosterPet(cb, fosterId) {
    qcloud.request({
        url: api + 'foster/openFosterPet',
        data: { fosterId },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

// 寄养详情
function fosterPetInfo(cb, fosterId, lngPoint, latPoint) {
    qcloud.request({
        url: api + 'foster/fosterPetInfo',
        login: true,
        data: { fosterId, lngPoint, latPoint },
        success(res) { success(res, cb) }, fail
    });
}

// 删除我的宠物
function delPet(cb, petId) {
    qcloud.request({
        url: api + 'pet/delPet',
        data: { petId },
        login: true,
        success(res) { success(res, cb) }, fail
    })
}

//我的宠物(petStatus null:全部 0:空闲宠物)
function myPets(cb, petStatus, userId) {
    qcloud.request({
        url: api + 'pet/myPets',
        login: true,
        data: { petStatus: petStatus || petStatus == 0 ? petStatus : null, userId },
        success: function (res) {
            var list = res.data
            setStorageSync('petCategoryList', list)
            typeof cb == "function" && cb(list)
        },
        fail: function (err) { fail = (err, cb) }
    })
}

//点赞/取消点赞宠物
function petLikes(cb, petId) {
    qcloud.request({
        url: api + 'pet/petLikes',
        data: { petId },
        login: true,
        success(res) { success(res, cb) }, fail
    })
}

//关注/取消关注宠物
function petFollow(cb, petId) {
    qcloud.request({
        url: api + 'pet/petFollow',
        data: { petId },
        login: true,
        success(res) { success(res, cb) }, fail
    })
}

//举报宠物
function savePetReport(cb, petId, reportContent) {
    qcloud.request({
        url: api + 'pet/savePetReport',
        method: "POST",
        login: true,
        data: { petId, reportContent },
        success(res) { success(res, cb) }, fail
    })
}

//获取宠物的打赏列表
function queryPetRewardList(cb, pageSize, page, petId, firstQueryDate) {
    qcloud.request({
        url: api + 'petReward/queryPetRewardList',
        method: "POST",
        data: {
            page, pageSize, petId, firstQueryDate,
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

// 打赏宠物(PayType:0 余额打赏 1支付宝打赏,默认为1)
function savePetReward(cb, petId, rewardAmount, PayType) {
    qcloud.request({
        url: api + 'petReward/savePetReward',
        data: { petId, rewardAmount, PayType },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

// 宠物信息
function petInfo(cb, petId) {
    qcloud.request({
        url: api + 'pet/petInfo',
        login: true,
        data: { petId },
        success(res) { success(res, cb) }, fail
    });
}

//宠物品种列表
function queryByPetVarietyList(cb, petCategoryId, petVarietyName) {
    qcloud.request({
        url: api + 'pet/queryByPetVarietyList',
        data: { petCategoryId, petVarietyName },
        method: 'POST',
        success: function (res) {
            var list = res.data
            if (!petVarietyName) setStorageSync('petVarietyListBy' + petCategoryId, list)
            typeof cb == "function" && cb(list)
        },
        fail: function (err) {
            showToast(err.errorMessage, 1, 3000);
            var list = getStorageSync('petVarietyListBy' + petCategoryId)
            typeof cb == "function" && cb(list)
        }
    })
}

//宠物类别列表
function queryCategoryList(cb) {
    qcloud.request({
        url: api + 'pet/queryCategoryList',
        data: {},
        success: function (res) {
            var list = res.data
            setStorageSync('petCategoryList', list)
            typeof cb == "function" && cb(list)
        },
        fail: function (err) {
            showToast(err.errorMessage, 1, 3000);
            var list = getStorageSync('petCategoryList')
            typeof cb == "function" && cb(list)
        }
    })
}

//获取热门词
function queryHotSearch(cb) {
    qcloud.request({
        url: api + 'common/queryHotSearch',
        success(res) { typeof cb == "function" && cb(res.data) }, fail
    })
}

//获取首页公告列表
function queryNoticeList(cb) {
    qcloud.request({
        url: api + 'common/queryNoticeList',
        success(res) { typeof cb == "function" && cb(res.data) }, fail
    })
}

//用户常用地址列表
function queryCommonAddress(cb) {
    qcloud.request({
        url: api + 'address/queryCommonAddress',
        data: {},
        success: function (res) {
            var list = res.data
            setStorageSync('commentAddressList', list)
            typeof cb == "function" && cb(list)
        },
        fail: function (err) {
            showToast(err.errorMessage, 1, 3000);
            var list = getStorageSync('commentAddressList')
            typeof cb == "function" && cb(list)
        }
    })
}

//删除常用地址
function delCommonAddress(cb, commonAddressId) {
    qcloud.request({
        url: api + 'address/delCommonAddress',
        data: { commonAddressId },
        login: true,
        success(res) { success(res, cb) }, fail
    });
}

//添加常用地址（设置默认地址）
function saveCommonAddress(cb, commonAddress, lngPoint, latPoint, isDefault, commonAddressId) {
    qcloud.request({
        url: api + 'address/saveCommonAddress',
        method: 'POST',
        data: {
            commonAddress: commonAddress || null,
            isDefault, lngPoint, latPoint, commonAddressId
        },
        login: true,
        success(res) { success(res, cb); }, fail
    });
}

// 发送私聊信息（留言给用户）
function saveLeaveComment(cb, errcb, toUserId, commentsContent) {
    qcloud.request({
        url: api + 'leaveComments/saveLeaveComment',
        method: "POST",
        data: { toUserId, commentsContent },
        login: true,
        success(res) { success(res, cb, errcb) },
        fail(err) { fail(err, errcb) }
    });
}

//获取和某个用户的私聊列表
function queryPrivateChatList(cb, pageSize, page, userId, firstQueryDate, isNewMsg) {
    qcloud.request({
        url: api + 'leaveComments/queryPrivateChatList',
        login: true,
        data: {
            page, pageSize, userId, firstQueryDate, isNewMsg: isNewMsg ? 1 : 0,
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

//获取消息列表
function queryCommentList(cb, pageSize, page) {
    qcloud.request({
        url: api + 'leaveComments/queryCommentList',
        login: true,
        data: {
            page, pageSize,
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

//获取通知消息列表
function queryMyNoticeList(cb, pageSize, page, firstQueryDate) {
    qcloud.request({
        url: api + 'msg/myMsgList',
        login: true,
        data: {
            page, pageSize, firstQueryDate
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

// 是否有新的消息
function queryIsNewMsg(cb) {
    qcloud.request({
        url: api + 'leaveComments/queryIsNewMsg',
        login: true,
        success(res) { success(res, cb) }, fail
    })
}

//获取我的账单明细
function myDetailedList(cb, pageSize, page) {
    qcloud.request({
        url: api + 'common/myTransactionDetail',
        login: true,
        method: "POST",
        data: {
            page, pageSize,
        },
        success(res) { listSuccess(res, cb) }, fail
    })
}

//今日的赏金列表(打赏给宠物的赏金)
function queryTodayReward(cb) {
    qcloud.request({
        url: api + 'petReward/queryTodayReward',
        login: true,
        success: function (res) {
            var list = res.data
            typeof cb == "function" && cb(list)
        },
        fail: function (err) { fail = (err, cb) }
    })
}

//钱包提现
function saveWithdraw(cb, errcb, amount) {
    qcloud.request({
        url: api + 'common/saveWithdraw',
        method: 'POST',
        login: true,
        data: { amount },
        success(res) { success(res, cb, errcb) },
        fail(err) { fail(err, errcb) }
    })
}


//获取个人隐私信息
function getUserMajorInfo(cb) {
    qcloud.request({
        url: api + 'auth/getUserMajorInfo',
        login: true,
        success(res) { success(res, cb) }, fail
    })
}

//获取用户信息(不传ID则为获取个人信息)
function getUserInfo(cb, userId, lngPoint, latPoint, errcb) {
    qcloud.request({
        url: api + 'auth/getUserInfo',
        data: {
            userId: userId || null,
            lngPoint: lngPoint || null,
            latPoint: latPoint || null,
        },
        login: userId ? false : true,
        success(res) { success(res, cb) },
        fail(err) { fail(err, errcb) }
    })
}

//获取验证码
function sendVerifyCode(cb, errcb, phoneNumber) {
    qcloud.request({
        url: api + 'user/sendPhoneCode/' + phoneNumber,
        login: true,
        success(res) { success(res, cb, errcb) },
        fail(err) { fail(err, errcb) }
    })
}


//更新芝麻信用分
function updateZhimaCredit(cb, code) {
    qcloud.request({
        url: api + 'auth/updateZhimaCredit',
        data: { code },
        login: true,
        success(res) { success(res, cb) }, fail
    })
}


//完成收养人认证
function submitReview(cb, errcb, isShowPhone) {
    qcloud.request({
        url: api + 'user/submitReview',
        data: { isShowPhone },
        success(res) { success(res, cb, errcb) },
        fail(err) { fail(err, errcb) }
    })
}


//获取养宠知识题目列表
function querySubjectList(cb) {
    qcloud.request({
        url: api + 'subject/querySubjectList',
        method: "POST",
        login: true,
        success(res) {
            typeof cb == 'function' && cb(res.data);
        }, fail
    })
}

//上传养宠知识答案
function submitExam(cb, examResultScore) {
    qcloud.request({
        url: api + 'subject/submitExam',
        method: "POST",
        login: true,
        data: { examResultScore },
        success(res) { success(res, cb) }, fail
    })
}


//芝麻认证授权确认
function zhimaCreditConfirm(cb, errcb) {
    qcloud.request({
        url: api + 'user/zhimaCreditConfirm',
        success(res) { success(res, cb, errcb) },
        fail(err) { fail(err, errcb) }
    })
}


//提交芝麻认证授权申请(姓名与身份证号码)
function zhimaCreditApply(cb, errcb, userName, idCard) {
    qcloud.request({
        url: api + 'user/zhimaCreditApply',
        method: 'POST',
        data: {
            userName: userName,
            idCard: idCard
        },
        success(res) { success(res, cb, errcb) },
        fail(err) { fail(err, errcb) }
    })
}

// 判断文字内容敏感词
function textRiskIdentification(cb, content, where, type) {
    const mc = this;
    my.textRiskIdentification({
        content,
        type: type || ['keyword', '0', '1', '2'],
        success(res) {
            const data = res.result;
            // mc.alert(data)
            if (data[0].hitKeywords) {
                const hitKeywordArr = data[0].hitKeywords;
                const hitKeyword = hitKeywordArr.join(',');
                mc.alert('您的' + where + '中涉及以下敏感性字段:‘' + hitKeyword + '’，请修改');
                return;
            }
            for (let i in data) {
                if (data[i].score >= 90) {
                    if (data[i].type == 0) {
                        mc.alert('您的' + where + '中涉及广告，请修改');
                        return;
                    } else if (data[i].type == 1) {
                        mc.alert('您的' + where + '中涉政，请修改');
                        return;
                    } else if (data[i].type == 2) {
                        mc.alert('您的' + where + '中涉黄，请修改');
                        return;
                    }
                }
            }
            typeof cb == 'function' && cb();
        }, fail(err) {
            mc.alert(err)
        },
    })
}


//添加登录日记
function addLogs(page, fb) {
    // const logs = getStorageSync('logs') || [];
    // console.log(logs)
    // getSysDate(function (sysDate) {
    //     const arrs = sysDate.split(' ');
    //     const date = arrs[0];
    //     const time = arrs[1];
    //     const log = { page, fb, date, time }
    //     logs.unshift(log);
    //     console.log(logs)
    //     setStorageSync('logs', logs);
    // })
}

// 反解析定位
function analysisLocation(cb, latPoint, lngPoint) {
    qcloud.request({
        url: api + 'common/location',
        method: 'POST',
        data: {
            latPoint, lngPoint
        },
        success(res) {
            typeof cb == 'function' && cb(res.data);
        }, fail
    })
}

// 支付
function tradePay(cb, errcb, orderStr) {
    my.tradePay({
        orderStr,
        success(res) {
            const errs = [];
            errs[8000] = { errorMessage: '正在处理中', };
            errs[4000] = { errorMessage: '订单支付失败', };
            errs[6001] = { errorMessage: '您已取消支付', };
            errs[6002] = { errorMessage: '网络连接出错', };
            errs[99] = { errorMessage: '订单未支付成功', };
            const resultCode = res.resultCode;
            if (resultCode == 9000) {
                typeof cb == 'function' && cb();
            } else {
                fail(errs[res.resultCode], errcb)
            }
        },
        fail(err) { fail(err, errcb) }
    });
}

// 获取定位
function getLocation(cb, type) {
    my.getLocation({
        type,
        success(res) {
            typeof cb == 'function' && cb(res);
        },
        fail(err) {
            // showToast('定位失败', 1, 3000);
            alert(err)
        },
    });
}

//服务器的当前时间
function getSysDate(cb) {
    my.getServerTime({
        success: (res) => {
            const sysDate = utils.formatTimestamp(res.time)
            // console.log(sysDate)
            typeof cb == "function" && cb(sysDate)
        }, fail(err) { fail(err) }
    });
}

/**
 * 上传文件组并返回上传后的文件的地址数组
 * urls是临时文件路径组，cb是上传结束后要执行的方法，newUrlObj是服务器文件路径组的对象
 * urls的元素对象格式为：{name:name,url:url,formData:formData},可以用utils中的formatFilePath方法格式化临时文件路径组
 */
function uploadFile(urls, cb, errcb, newUrlObj) {
    var that = this
    newUrlObj = newUrlObj || {}
    if (typeof cb != "function") return
    if (urls.length == 0) {
        cb(newUrlObj)
        // my.hideLoading();
        return
    }
    var url = urls[0]
    if (url["url"].indexOf("http://") != -1) {
        urls.shift()
        var arr = newUrlObj && newUrlObj[url.name] ? newUrlObj[url.name] : new Array
        arr.push(url["url"])
        newUrlObj[url.name] = arr
        that.uploadFile(urls, cb, errcb, newUrlObj)
        return
    }
    // showLoading('图片上传中...');
    my.uploadFile({
        url: config.service.api + 'file/uploadPicture',
        filePath: url["url"],
        fileName: "file",
        fileType: "image",
        formData: url["formData"],
        success: function (res) {
            console.log(res)
            var data = res.data
            if (typeof data != 'object') {
                data = JSON.parse(data);
            };

            if (data.resultCode == "Y") {
                urls.shift();
                var arr = newUrlObj && newUrlObj[url.name] ? newUrlObj[url.name] : new Array;

                arr.push(data.accessUrl);
                newUrlObj[url.name] = arr;
                that.uploadFile(urls, cb, errcb, newUrlObj);
            } else {
                // my.hideLoading();
                alert(data.resultMsg);
                console.log('请求异常,错误' + data.resultMsg);
                typeof errcb == "function" && errcb(data);
            }
        },
        fail(err) { fail(err, errcb) }
    })
}


module.exports = {
    receiveGift: receiveGift,
    checkIsChange: checkIsChange,
    queryMyPairOrderList: queryMyPairOrderList,
    finishPetPair: finishPetPair,
    receivedPairPet: receivedPairPet,
    confirmPoirPetByCredit: confirmPoirPetByCredit,
    cancelPairOrder: cancelPairOrder,
    pairOrderInfo: pairOrderInfo,
    delPairLike: delPairLike,
    queryMyPairList: queryMyPairList,
    savePairLike: savePairLike,
    queryPetPairList: queryPetPairList,
    saveFosterForward: saveFosterForward,
    queryAdopterCommentList: queryAdopterCommentList,
    queryPetCommentList: queryPetCommentList,
    myAdoptApplyList: myAdoptApplyList,
    myFollowPets: myFollowPets,
    myCollectFosterList: myCollectFosterList,
    myFosterPetList: myFosterPetList,
    getAdoptCommentInfo: getAdoptCommentInfo,
    submitAdoptComment: submitAdoptComment,
    submitFosterComment: submitFosterComment,
    fulfilAdopt: fulfilAdopt,
    queryAdoptLogList: queryAdoptLogList,
    writePetLog: writePetLog,
    receivedPet: receivedPet,
    findByProtocol: findByProtocol,
    submitAdoptPet: submitAdoptPet,
    confirmAdoptPet: confirmAdoptPet,
    confirmAdoptPetByCredit: confirmAdoptPetByCredit,
    generateOrderNumToCredit: generateOrderNumToCredit,
    adoptPetInfo: adoptPetInfo,
    queryAdopterList: queryAdopterList,
    queryCancalList: queryCancalList,
    cancalAdopt: cancalAdopt,
    applyAdopt: applyAdopt,
    askedHimAdopt: askedHimAdopt,
    fosterPetCollect: fosterPetCollect,
    queryFosterPetList: queryFosterPetList,
    queryPetList: queryPetList,
    getKeepPet: getKeepPet,
    delFosterPet: delFosterPet,
    cancelFosterPet: cancelFosterPet,
    openFosterPet: openFosterPet,
    fosterPetInfo: fosterPetInfo,
    delPet: delPet,
    myPets: myPets,
    petLikes: petLikes,
    petFollow: petFollow,
    savePetReport: savePetReport,
    queryPetRewardList: queryPetRewardList,
    savePetReward: savePetReward,
    petInfo: petInfo,
    queryByPetVarietyList: queryByPetVarietyList,
    queryCategoryList: queryCategoryList,
    queryHotSearch: queryHotSearch,
    queryNoticeList: queryNoticeList,
    queryCommonAddress: queryCommonAddress,
    delCommonAddress: delCommonAddress,
    saveCommonAddress: saveCommonAddress,
    saveLeaveComment: saveLeaveComment,
    queryPrivateChatList: queryPrivateChatList,
    queryCommentList: queryCommentList,
    queryMyNoticeList: queryMyNoticeList,
    queryIsNewMsg: queryIsNewMsg,
    myDetailedList: myDetailedList,
    queryTodayReward: queryTodayReward,
    saveWithdraw: saveWithdraw,
    getUserMajorInfo: getUserMajorInfo,
    getUserInfo: getUserInfo,
    sendVerifyCode: sendVerifyCode,
    updateZhimaCredit: updateZhimaCredit,
    submitReview: submitReview,
    querySubjectList: querySubjectList,
    submitExam: submitExam,
    zhimaCreditConfirm: zhimaCreditConfirm,
    zhimaCreditApply: zhimaCreditApply,
    textRiskIdentification: textRiskIdentification,
    addLogs: addLogs,
    analysisLocation: analysisLocation,
    getLocation: getLocation,
    tradePay: tradePay,
    getSysDate: getSysDate,
    uploadFile: uploadFile,
    fail: fail,
    chooseImage: chooseImage,
    removeStorageSync: removeStorageSync,
    getStorageSync: getStorageSync,
    setStorageSync: setStorageSync,
    alert: alert,
    confirm: confirm,
    showToast: showToast,
    showLoading: showLoading,
}