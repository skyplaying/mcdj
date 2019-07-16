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
	var type = (!type ? 'success' : '') + (type == 1 ? 'fail' : '') + (type == 2 ? 'exception ' : '') + (type == 3 ?
		'none' : '')
	my.showToast({
		content: content,
		type: type,
		duration: duration || 2000,
		success(res) {
			typeof cb == "function" && cb();
		},
	});
}

// 显示加载中
var showLoading = (content, delay) => {
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
	return my.getStorageSync({
		key: key
	}).data;
}

// 同步清除缓存
var removeStorageSync = (key) => {
	my.removeStorageSync({
		key: key
	});
}

//接口调用失败的回调函数(点击事件失败后放开防止双击字段需要用到失败回调函数)
const fail = (obj) => {
	const err = obj.err;
	const fail = obj.fail;
	const errorTexts = {
		11: '无权跨域',
		12: '网络出错',
		13: '请求超时，请检查网络',
		14: '服务器正在升级，请稍后再试',
		19: '服务器正在升级，请稍后再试',
		// 19: 'HTTP错误',
	};
	alert(errorTexts[err.error] || err.errorMessage);
	typeof fail == "function" && fail(err);
}

//接口调用成功的回调函数
const success = (obj) => {
	const res = obj.res;
	const success = obj.success;
	const fail = obj.fail;
	if (res.data.resultCode == 'Y') {
		typeof success == "function" && success(res.data)
	} else {
		alert(res.data.resultMsg || ('错误' + res.data.status));
		console.log('请求异常,' + (res.data.resultMsg || ('错误' + res.data.status)))
		typeof fail == "function" && fail(res.data)
	}
}

//有分页的列表接口调用成功的回调函数
const listSuccess = (obj) => {
	const res = obj.res;
	// console.log(res)
	const success = obj.success;
	// 判断是否还有数据可以加载
	const noMore = isNoMore(res)
	res.data.noMore = noMore;

	typeof success == "function" && success(res.data)
}

// 判断是否还有数据可以加载
const isNoMore = (res) => {
	const ifNoMore1 = res.data.total % res.data.pageSize == 0 && res.data.total / res.data.pageSize == res.data.page
	const ifNoMore2 = res.data.total % res.data.pageSize != 0 && res.data.total / res.data.pageSize < res.data.page
	const ifNoMore = res.data.total == 0 || ifNoMore1 || ifNoMore2
	return ifNoMore;
}
// --------------------------------------------------------------------------


//支付宝认证请求

function faceCheck(obj) {
	const bizId = obj.bizId;
	const zimId = obj.zimId;
	const userId = obj.userId;
	const success = obj.success;
	const fail = obj.fail;
	qcloud.request({
		url: api + 'user/faceVerify',
		data: {
			bizId,
			zimId,
			userId
		},
		login: true,
		success,
		fail
	})
}
// 支付宝认证
// function faceCheck(obj){
// 	const bizId=obj.bizId;
// 	const zimId=obj.zimId;
// 	return qcloud.request({
// 		url: 'user/faceVerify',
// 		data: {
// 			bizId,
// 			zimId
// 		},
// 		login:true,
// 	})
// }
// 

//兑换五一活动保险
function receiveGift(obj) {
	const success = obj.success;
	const fail = obj.fail;
	qcloud.request({
		url: api + 'common/receiveGift',
		method: "POST",
		login: true,
		success,
		fail
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
		success,
		fail
	})
}

// 审核展示到首页的家庭
function familyDisplayReview(obj) {
	const userId = obj.userId;
	const isHome = obj.isHome;
	qcloud.request({
		url: api + 'user/familyDisplayReview',
		data: {
			userId,
			isHome
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// ------------------------------------------------------




//保险医院列表
function getHospitalList(obj) {
	const that = this;
	const province = obj.province || null;
	const city = obj.city || null;
	const area = obj.area || null;
	const name = obj.name || null;
	qcloud.request({
		url: api + 'insure/getHospitalList',
		data: {
			province,
			city,
			area,
			name
		},
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 询我的保险列表
function myInsureList(obj) {
	qcloud.request({
		url: api + 'insure/myInsureList',
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 查询保单详情
function insureInfo(obj) {
	const insureRecordId = obj.insureRecordId;
	qcloud.request({
		url: api + 'insure/insureInfo',
		data: {
			insureRecordId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 提交保险资料
function saveInsure(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'insure/saveInsure',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 查看训练订单评论信息
function trainCommentByOrder(obj) {
	const trainOrderId = obj.trainOrderId;
	qcloud.request({
		url: api + 'train/findCommentByOrder',
		data: {
			trainOrderId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 管理员删除违规的训宠订单评论
function delTrainerComment(obj) {
	const commentId = obj.commentId;
	qcloud.request({
		url: api + 'train/delTrainerComment',
		data: {
			commentId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 评论训宠订单
function commentTrainOrder(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'train/submitComment',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}


// 完成训宠订单
function finishTrainOrder(obj) {
	const trainOrderId = obj.trainOrderId;
	qcloud.request({
		url: api + 'train/finishTrainOrder',
		data: {
			trainOrderId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 开始训宠订单
function startTrainOrder(obj) {
	const trainOrderId = obj.trainOrderId;
	const serviceCode = obj.serviceCode;
	qcloud.request({
		url: api + 'train/startTrainOrder',
		data: {
			trainOrderId,
			serviceCode
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 取消训练订单
function cancelTrainOrder(obj) {
	const trainOrderId = obj.trainOrderId;
	qcloud.request({
		url: api + 'train/cancelOrder',
		data: {
			trainOrderId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 训练订单详情
function trainOrderInfo(obj) {
	const trainOrderId = obj.trainOrderId;
	qcloud.request({
		url: api + 'train/orderInfo',
		data: {
			trainOrderId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 提交训练订单
function subimtTrainOrder(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'train/subimtTrainOrder',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//查询训犬师服务评论列表
function queryServiceCommentList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const trainServiceId = obj.trainServiceId || null;
	qcloud.request({
		url: api + 'train/queryServiceCommentList',
		login: true,
		data: {
			page,
			pageSize,
			trainServiceId
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

// 查询训练服务详情
function trainServiceInfo(obj) {
	const trainServiceId = obj.trainServiceId;
	const lngPoint = obj.lngPoint || null;
	const latPoint = obj.latPoint || null;
	qcloud.request({
		url: api + 'train/trainServiceInfo',
		data: {
			trainServiceId,
			lngPoint,
			latPoint,
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 保存训犬服务信息
function saveTrainService(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'train/saveTrainService',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//查询训练师服务列表
function queryTrainServiceList(obj) {
	const userId = obj.userId || null;
	const trainServiceId = obj.trainServiceId || null;
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	qcloud.request({
		url: api + 'train/queryTrainServiceList',
		login: true,
		data: {
			userId,
			trainServiceId,
			page,
			pageSize,
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

// 提交训宠资料审核
function submitTrainReview(obj) {
	qcloud.request({
		url: api + 'train/submitTrainReview',
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 查看训练师详情
function trainInfo(obj) {
	qcloud.request({
		url: api + 'train/trainInfo',
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 保存训练师信息
function saveTrain(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'train/saveTrain',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 查询家庭可寄养状态
function queryFamilyCalendar(obj) {
	const userId = obj.userId || null;
	const startTime = obj.startTime || null;
	const endTime = obj.endTime || null;
	qcloud.request({
		url: api + 'user/queryFamilyCalendar',
		data: {
			userId,
			startTime,
			endTime
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 我的家庭寄养收入记录列表
function myIncomeList(obj) {
	const month = obj.month;
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	qcloud.request({
		url: api + 'common/myIncomeList',
		login: true,
		data: {
			month,
			page,
			pageSize,
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

// 获取家庭管理信息
function getFamilyManager(obj) {
	const firstQueryDate = obj.firstQueryDate || null;
	qcloud.request({
		url: api + 'user/getFamilyManager',
		data: {
			firstQueryDate
		},
		login: true,
		success(res) {
			typeof obj.success == 'function' && obj.success(res.data);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 领取支付宝优惠券卡券
function recCoupon(obj) {
	qcloud.request({
		url: api + 'common/recCoupon',
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 保存邀请用户信息
function inviteFamily(obj) {
	const inviteUserId = obj.inviteUserId || null;
	qcloud.request({
		url: api + 'user/inviteFamily',
		data: {
			inviteUserId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//查询邀请家庭记录列表
function queryInvFamilyList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	qcloud.request({
		url: api + 'user/queryInvFamilyList',
		login: true,
		data: {
			page,
			pageSize,
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}


// 领取国庆中秋优惠券
function recNationalDayCoupon(obj) {
	qcloud.request({
		url: api + 'coupon/recNationalDayCoupon',
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 查询国庆中秋优惠券列表
function queryNationalDay(obj) {
	qcloud.request({
		url: api + 'coupon/queryNationalDay',
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}


//我的优惠券列表
function myCouponList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const couponStatus = obj.couponStatus || 1; //1可用 2已使用
	const gtAmount = obj.gtAmount || null; //筛选满此金额的优惠券
	qcloud.request({
		url: api + 'coupon/myCouponList',
		login: true,
		data: {
			page,
			pageSize,
			couponStatus,
			gtAmount
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

//寄养需求推荐家庭列表
function queryRecFamilyList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const fosterDemandId = obj.fosterDemandId || null;
	qcloud.request({
		url: api + 'demand/queryRecFamilyList',
		login: true,
		data: {
			page,
			pageSize,
			fosterDemandId
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

//寄养需求应答列表
function queryAnswerListByDemand(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const fosterDemandId = obj.fosterDemandId || null;
	qcloud.request({
		url: api + 'demand/queryAnswerList',
		login: true,
		data: {
			page,
			pageSize,
			fosterDemandId
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

// 应答寄养需求
function demandAnser(obj) {
	const fosterDemandId = obj.fosterDemandId;
	qcloud.request({
		url: api + 'demand/demandAnser',
		data: {
			fosterDemandId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//附近寄养需求列表/我的寄养需求列表
function queryFosterDemandList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const sortType = obj.sortType || 1;
	const fosterPetTypes = obj.fosterPetTypes || null;
	const city = obj.city || null;
	const addressLng = obj.addressLng || null;
	const addressLat = obj.addressLat || null;
	const isMe = obj.isMe || 0;
	qcloud.request({
		url: api + 'demand/queryFosterDemandList',
		login: true,
		data: {
			page,
			pageSize,
			sortType,
			fosterPetTypes,
			city,
			addressLng,
			addressLat,
			isMe
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

// 关闭寄养需求
function closeDemand(obj) {
	const fosterDemandId = obj.fosterDemandId;
	qcloud.request({
		url: api + 'demand/closeDemand',
		data: {
			fosterDemandId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 寄养需求详情
function demandInfo(obj) {
	const fosterDemandId = obj.fosterDemandId;
	const addressLng = obj.addressLng;
	const addressLat = obj.addressLat;
	qcloud.request({
		url: api + 'demand/demandInfo',
		data: {
			fosterDemandId,
			addressLng,
			addressLat
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 发布寄养需求
function publishDemand(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'demand/publishDemand',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}


//获取用户订单列表
function queryUserOrderList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const queryStaus = obj.queryStaus || null;
	const queryType = obj.queryType || 1;
	qcloud.request({
		url: api + 'user/queryUserOrderList',
		data: {
			page,
			pageSize,
			queryStaus,
			queryType,
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

//查询寄养评论列表
function queryCommentList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const userId = obj.userId || null;
	qcloud.request({
		url: api + 'fosterOrder/queryCommentList',
		login: true,
		data: {
			page,
			pageSize,
			userId
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

// 管理员删除违规的寄养订单评论
function delOrderComment(obj) {
	const commentId = obj.commentId;
	qcloud.request({
		url: api + 'fosterOrder/delOrderComment',
		data: {
			commentId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 查看评论信息
function findCommentByOrder(obj) {
	const fosterOrderId = obj.fosterOrderId;
	qcloud.request({
		url: api + 'fosterOrder/findCommentByOrder',
		data: {
			fosterOrderId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 评论寄养订单
function commentOrder(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'fosterOrder/commentOrder',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}


// 完成寄养订单
function finishOrder(obj) {
	const fosterOrderId = obj.fosterOrderId;
	const finishPwd = obj.finishPwd;
	qcloud.request({
		url: api + 'fosterOrder/finishOrder',
		data: {
			fosterOrderId,
			finishPwd
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}


// 提前完成订单
function advanceFinishOrder(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'fosterOrder/advanceFinishOrder',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 接到宠物
function receivedPet(obj) {
	const fosterOrderId = obj.fosterOrderId;
	const receivePetPicture = obj.receivePetPicture;
	qcloud.request({
		url: api + 'fosterOrder/receivedPet',
		data: {
			fosterOrderId,
			receivePetPicture
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 确认接单
function confirmOrder(obj) {
	const fosterOrderId = obj.fosterOrderId;
	qcloud.request({
		url: api + 'fosterOrder/confirmOrder',
		data: {
			fosterOrderId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 取消订单
function cancelOrder(obj) {
	const fosterOrderId = obj.fosterOrderId;
	qcloud.request({
		url: api + 'fosterOrder/cancelOrder',
		data: {
			fosterOrderId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 订单详情
function fosterOrderInfo(obj) {
	const fosterOrderId = obj.fosterOrderId;
	qcloud.request({
		url: api + 'fosterOrder/fosterOrderInfo',
		data: {
			fosterOrderId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 提交寄养订单
function submitFosterOrder(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'fosterOrder/submitFosterOrder',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//获取寄养家庭列表
function queryAdopterList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const firstQueryDate = obj.firstQueryDate || null;
	const lngPoint = obj.lngPoint || null; //当前经纬度
	const latPoint = obj.latPoint || null; //当前经纬度
	const nickName = obj.nickName || null; //搜索关键字
	const pointCity = obj.pointCity || null; //查询的城市
	const distance = obj.distance || null; //距离范围
	const sortType = obj.sortType || null; //排序类型（1从近到远2价格从低到高3从高到低4好评5星级6订单数）
	const petTypes = obj.petTypes || null; //宠物类型(0小型1中型3大型4猫)
	const grades = obj.grades || null; //星级查询(0普通家庭，其他几星级就是数字几)
	qcloud.request({
		url: api + 'user/queryAdopterList',
		data: {
			page,
			pageSize,
			firstQueryDate,
			lngPoint,
			latPoint,
			nickName,
			pointCity,
			distance,
			sortType,
			petTypes,
			grades,
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

//获取我关注的寄养家庭
function myFollowFamilyList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const lngPoint = obj.lngPoint || null;
	const latPoint = obj.latPoint || null;
	qcloud.request({
		url: api + 'user/myFollowFamilyList',
		data: {
			page,
			pageSize,
			lngPoint,
			latPoint,
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

// 关注/取消关注 寄养家庭
function familyFollow(obj) {
	const followUserId = obj.followUserId;
	qcloud.request({
		url: api + 'user/familyFollow',
		data: {
			followUserId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 改变家庭接单状态
function orderSwitch(obj) {
	const isOrderTaking = obj.isOrderTaking;
	qcloud.request({
		url: api + 'user/orderSwitch',
		data: {
			isOrderTaking
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 完成家庭认证
function submitReview(obj) {
	const isShowPhone = obj.isShowPhone || null;
	qcloud.request({
		url: api + 'user/submitReview',
		data: {
			isShowPhone
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 保存认证视频信息
function saveAuthVideo(obj) {
	const authVideoPath = obj.authVideoPath;
	qcloud.request({
		url: api + 'user/saveAuthVideo',
		data: {
			authVideoPath
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 保存家庭信息
function saveFamily(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'user/saveFamily',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 保存基础资料
function saveAdoption(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'user/saveAdoption',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//用户常用地址列表
function queryCommonAddress(obj) {
	const that = this;
	qcloud.request({
		url: api + 'address/queryCommonAddress',
		data: {},
		login: true,
		success(res) {
			typeof obj.success == 'function' && obj.success(res.data);
			that.setStorageSync('isNoAnewMyPetList', true);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 删除常用地址
function delCommonAddress(obj) {
	const commonAddressId = obj.commonAddressId;
	qcloud.request({
		url: api + 'address/delCommonAddress',
		data: {
			commonAddressId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 添加常用地址（设置默认地址）
function saveCommonAddress(obj) {
	const commonAddressId = obj.commonAddressId;
	const commonAddress = obj.commonAddress;
	const lngPoint = obj.lngPoint;
	const latPoint = obj.latPoint;
	const isDefault = obj.isDefault;
	qcloud.request({
		url: api + 'address/saveCommonAddress',
		data: {
			commonAddressId,
			commonAddress,
			lngPoint,
			latPoint,
			isDefault,
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 芝麻认证授权确认
function zhimaCreditConfirm(obj) {
	const userName = obj.userName;
	const idCard = obj.idCard;
	qcloud.request({
		url: api + 'user/zhimaCreditConfirm',
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 提交芝麻认证授权申请(姓名与身份证号码)
function zhimaCreditApply(obj) {
	const userName = obj.userName;
	const idCard = obj.idCard;
	qcloud.request({
		url: api + 'user/zhimaCreditApply',
		data: {
			userName,
			idCard
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 提交寄养家庭养宠经验
function saveKeepPet(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'user/saveKeepPet',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		}
	});
}


// 获取寄养家庭资料
function getKeepPet(obj) {
	const userId = obj.userId;
	qcloud.request({
		url: api + 'user/getKeepPet',
		data: {
			userId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		}
	});
}

//发送私聊信息（留言给用户）
function saveLeaveComment(obj) {
	const toUserId = obj.toUserId || null;
	const commentsContent = obj.commentsContent || null;
	qcloud.request({
		url: api + 'leaveComments/saveLeaveComment',
		login: true,
		data: {
			toUserId,
			commentsContent,
		},
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//获取和某个用户的私聊列表
function queryPrivateChatList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const userId = obj.userId || null;
	const firstQueryDate = obj.firstQueryDate || null;
	const isNewMsg = obj.isNewMsg ? 1 : 0;
	qcloud.request({
		url: api + 'leaveComments/queryPrivateChatList',
		login: true,
		data: {
			page,
			pageSize,
			userId,
			firstQueryDate,
			isNewMsg,
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

//获取消息列表
function queryLeaveCommentList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	qcloud.request({
		url: api + 'leaveComments/queryCommentList',
		login: true,
		data: {
			page,
			pageSize,
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}


//获取通知消息列表
function queryMyNoticeList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const firstQueryDate = obj.firstQueryDate || null;
	qcloud.request({
		url: api + 'msg/myMsgList',
		login: true,
		data: {
			page,
			pageSize,
			firstQueryDate,
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

//是否有新的消息
function queryIsNewMsg(obj) {
	qcloud.request({
		url: api + 'leaveComments/queryIsNewMsg',
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//举报宠物
function savePetReport(obj) {
	const petId = obj.petId;
	const reportContent = obj.reportContent;
	qcloud.request({
		url: api + 'pet/savePetReport',
		data: {
			petId,
			reportContent
		},
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 宠物信息
function petInfo(obj) {
	const petId = obj.petId;
	qcloud.request({
		url: api + 'pet/petInfo',
		data: {
			petId
		},
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//我的宠物列表
function myPets(obj) {
	const that = this;
	const userId = obj.userId || null;
	const petStatus = obj.petStatus || null;
	qcloud.request({
		url: api + 'pet/myPets',
		data: {
			userId,
			petStatus
		},
		login: true,
		success(res) {
			typeof obj.success == 'function' && obj.success(res.data);
			that.setStorageSync('isNoAnewMyPetList', true);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 删除宠物
function delPet(obj) {
	const petId = obj.petId;
	qcloud.request({
		url: api + 'pet/delPet',
		data: {
			petId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
			removeStorageSync('isNoAnewMyPetList');
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 添加宠物
function savePetInfo(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'pet/savePetInfo',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
			removeStorageSync('isNoAnewMyPetList');
			// 不存在petId说明是新增宠物
			if (!data.petsId)
				setStorageSync('isNewPet', 1);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//宠物品种列表
function queryByPetVarietyList(obj) {
	const that = this;
	const petCategoryId = obj.petCategoryId || null;
	const petVarietyName = obj.petVarietyName || null;
	qcloud.request({
		url: api + 'pet/queryByPetVarietyList',
		data: {
			petCategoryId,
			petVarietyName
		},
		success(res) {
			typeof obj.success == 'function' && obj.success(res.data);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//宠物类别列表
function queryCategoryList(obj) {
	const that = this;
	qcloud.request({
		url: api + 'pet/queryCategoryList',
		data: {},
		success(res) {
			typeof obj.success == 'function' && obj.success(res.data);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

// 提交用户基本信息
function saveUser(obj) {
	const data = obj.data;
	qcloud.request({
		url: api + 'user/saveUsers',
		data,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		}
	});
}

//查询用户评论列表
function queryUserCommentList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const userId = obj.userId || null;
	const comment = obj.comment || null;
	qcloud.request({
		url: api + 'user/queryUserCommentList',
		login: true,
		data: {
			page,
			pageSize,
			userId,
			comment,
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

//获取我关注的用户
function myFollowList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const lngPoint = obj.lngPoint || null;
	const latPoint = obj.latPoint || null;
	qcloud.request({
		url: api + 'user/myFollowList',
		data: {
			page,
			pageSize,
			lngPoint,
			latPoint,
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}

// 关注/取消关注 用户
function userFollow(obj) {
	const followUserId = obj.followUserId;
	qcloud.request({
		url: api + 'user/userFollow',
		data: {
			followUserId
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//获取用户服务列表
function queryHomeUserList(obj) {
	const pageSize = obj.pageSize || 10;
	const page = obj.page || 1;
	const firstQueryDate = obj.firstQueryDate || null;
	const lngPoint = obj.lngPoint || null; //当前经纬度
	const latPoint = obj.latPoint || null; //当前经纬度
	const nickName = obj.nickName || null; //搜索关键字
	const pointCity = obj.pointCity || null; //查询的城市
	const distance = obj.distance || null; //距离范围
	const sortType = obj.sortType || null; //排序类型（1从近到远2价格从低到高3从高到低4好评5星级6订单数）
	const petTypes = obj.petTypes || null; //宠物类型(0小型1中型3大型4猫)
	const serviceType = obj.serviceType || null; //星级查询(0普通家庭，其他几星级就是数字几)
	qcloud.request({
		url: api + 'user/queryHomeUserList',
		data: {
			page,
			pageSize,
			firstQueryDate,
			lngPoint,
			latPoint,
			nickName,
			pointCity,
			distance,
			sortType,
			petTypes,
			serviceType,
		},
		success(res) {
			obj.res = res;
			listSuccess(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj);
		},
	})
}


//查询用户主页信息
function userHomeInfo(obj) {
	const userId = obj.userId || null;
	const lngPoint = obj.lngPoint || null;
	const latPoint = obj.latPoint || null;

	qcloud.request({
		url: api + 'user/userHomeInfo',
		data: {
			userId,
			lngPoint,
			latPoint
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj)
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		},
	})
}


//获取个人隐私信息
function getUserMajorInfo(obj) {
	qcloud.request({
		url: api + 'auth/getUserMajorInfo',
		login: true,
		success(res) {
			obj.res = res;
			success(obj)
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		},
	})
}

//获取用户信息(不传ID则为获取个人信息)
function getUserInfo(obj) {
	const userId = obj.userId || null;
	const loginType = obj.loginType || null;
	const lngPoint = obj.lngPoint || null;
	const latPoint = obj.latPoint || null;

	qcloud.request({
		url: api + 'auth/getUserInfo',
		data: {
			userId,
			lngPoint,
			latPoint
		},
		login: userId ? false : true,
		loginType,
		success(res) {
			console.log(obj)
			obj.res = res;
			success(obj)
		},
		fail(err) {
			obj.err = err;
			if (!userId && err.type == 'ERR_GET_USER_INFO') {
				return;
			}
			if (err.error)
				fail(obj)
		},
	})
}

// 判断用户是否授权
function isAuthUserInfo() {
	const session = qcloud.getSession();
	return session;
}

// 查询训宠师和我家的家庭距离
function getDistance(obj) {
	const userId = obj.userId;
	const lngPoint = obj.lngPoint || null;
	const latPoint = obj.latPoint || null;
	qcloud.request({
		url: api + 'common/getDistance',
		data: {
			userId,
			lngPoint,
			latPoint,
		},
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(error) {
			obj.err = err;
			fail(obj)
		}
	});
}

//钱包提现
function saveWithdraw(obj) {
	const amount = obj.amount;
	qcloud.request({
		url: api + 'common/saveWithdraw',
		data: {
			amount
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		},
	})
}

//检验验证码
function judgeVerifyCode(obj) {
	const phoneNumber = obj.phoneNumber;
	const verifyCode = obj.verifyCode;
	qcloud.request({
		url: api + 'user/judgeVerifyCode',
		data: {
			phoneNumber,
			verifyCode
		},
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		},
	})
}

//获取验证码
function sendPhoneCode(obj) {
	const phoneNumber = obj.phoneNumber;
	qcloud.request({
		url: api + 'user/sendPhoneCode/' + phoneNumber,
		login: true,
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		},
	})
}

//查询轮播图列表
function queryBannerList(obj) {
	qcloud.request({
		url: api + 'common/queryBannerList',
		success(res) {
			obj.res = res;
			success(obj);
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		},
	})
}


//获取搜索热门词
function queryHotSearch(obj) {
	qcloud.request({
		url: api + 'common/queryHotSearch',
		success(res) {
			typeof obj.success == 'function' && obj.success(res.data);
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		},
	})
}


//反解析定位
function analysisLocation(obj) {
	const latPoint = obj.latPoint;
	const lngPoint = obj.lngPoint;
	qcloud.request({
		url: api + 'common/location',
		data: {
			latPoint,
			lngPoint
		},
		success(res) {
			typeof obj.success == 'function' && obj.success(res.data);
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		},
	})
}

//上传formIds至服务器
function saveFormIds() {
	//调用API从本地缓存中获取数据
	const that = this;
	var formIds = this.getStorageSync('formIds') || [] // 获取formIds
	if (formIds.length == 0) return
	//gloabalFomIds存在的情况下 将数组转换为JSON字符串
	formIds = JSON.stringify(formIds);
	console.log(formIds)
	qcloud.request({
		url: api + 'userForm/saveUserForm',
		login: true,
		data: {
			userFormVorms: formIds
		},
		success: function(res) {
			if (res.data.resultCode == "Y")
				that.setStorageSync('formIds', []); //保存推送码并赋值给全局变量
		}
	});
}

//保存formId
function setFormId(e) {
	var formId = e.detail.formId
	if (!formId) return
	let formIds = this.getStorageSync('formIds') || []; //获取全局数据中的推送码formIds数组
	let data = {
		formId: formId,
		formTime: parseInt(new Date().getTime()) //当前时间戳
	}
	formIds.push(data); //将data添加到数组的末尾
	console.log(formIds)
	this.setStorageSync('formIds', formIds); //保存推送码并赋值给全局变量
}

// 判断文字内容敏感词
function textRiskIdentification(cb, content, where, type) {
	if (!content) {
		typeof cb == 'function' && cb();
		return;
	}
	const mc = this;
	my.textRiskIdentification({
		content,
		type: type || ['keyword', '0', '1', '2', '3'],
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
					} else if (data[i].type == 3) {
						mc.alert('您的' + where + '中涉及低俗辱骂，请修改');
						return;
					}
				}
			}
			typeof cb == 'function' && cb();
		},
		fail(err) {
			mc.alert(err)
		},
	})
}

//支付
function tradePay(obj) {
	const orderStr = obj.orderStr;
	my.tradePay({
		orderStr,
		success(res) {
			const errs = [];
			errs[8000] = {
				errorMessage: '正在处理中',
			};
			errs[4000] = {
				errorMessage: '订单支付失败',
			};
			errs[6001] = {
				errorMessage: '您已取消支付',
			};
			errs[6002] = {
				errorMessage: '网络连接出错',
			};
			errs[99] = {
				errorMessage: '订单未支付成功',
			};
			const resultCode = res.resultCode;
			if (resultCode == 9000) {
				typeof obj.success == 'function' && obj.success();
			} else {
				obj.err = errs[res.resultCode];
				fail(obj);
			}
		},
		fail(err) {
			obj.err = err;
			fail(obj)
		},
	});
}

/**
 * 上传文件组并返回上传后的文件的地址数组
 * urls是临时文件路径组，newUrlsObj是多个服务器文件路径组的对象
 * urls的元素对象格式为：{name:name,url:url,formData:formData},可以用utils中的formatFilePath方法格式化临时文件路径组
 * newUrlsObj是多个不同类型照片组的对象，例如头像组和描叙组
 */
function uploadFile(obj) {
	const that = this
	const urls = obj.urls || []; //临时文件路径组
	const newUrlsObj = obj.newUrlsObj || {}; //多个服务器文件路径组的对象
	const num = obj.num || urls.length; //要上传的照片的总张数
	const success = obj.success;
	const fail = obj.fail;
	obj.num = num;
	if (typeof success != "function") return

	if (urls.length == 0) {
		// 已无要上传的照片
		my.hideLoading();
		success(newUrlsObj);
		return
	}
	const url = urls[0];
	// if (url["url"].indexOf("http://") >= 0) {
	if (url["url"].indexOf("https://resource") < 0 && url["url"].indexOf("temp://") < 0) {
		urls.shift();
		var arr = newUrlsObj && newUrlsObj[url.name] ? newUrlsObj[url.name] : new Array
		arr.push(url["url"])
		newUrlsObj[url.name] = arr
		obj.urls = urls;
		obj.newUrlsObj = newUrlsObj;
		that.uploadFile(obj)
		return
	}

	// showLoading(`上传中 ${num - urls.length + 1}/${num}`);
	my.uploadFile({
		url: config.service.api + 'file/uploadFile',
		filePath: url["url"],
		fileName: "file",
		fileType: "image",
		formData: url["formData"],
		success: function(res) {
			console.log(res)
			var data = JSON.parse(res.data);
			if (data.resultCode == "Y") {
				urls.shift()
				const arr = newUrlsObj && newUrlsObj[url.name] ? newUrlsObj[url.name] : new Array

				arr.push(data.accessUrl)
				newUrlsObj[url.name] = arr
				obj.urls = urls;
				obj.newUrlsObj = newUrlsObj;
				that.uploadFile(obj)
			} else {
				showToast(res.data.resultMsg, 1, 3000);
				console.log('请求异常,错误' + res.data.resultMsg)
				typeof fail == "function" && fail(res.data)
			}
		},

		fail(err) {
			obj.err = err;
			fail(obj)
		},
	})
}


module.exports = {
	faceCheck: faceCheck,
	getHospitalList: getHospitalList,
	myInsureList: myInsureList,
	insureInfo: insureInfo,
	saveInsure: saveInsure,

	delTrainerComment: delTrainerComment,
	trainCommentByOrder: trainCommentByOrder,
	commentTrainOrder: commentTrainOrder,
	finishTrainOrder: finishTrainOrder,
	startTrainOrder: startTrainOrder,
	cancelTrainOrder: cancelTrainOrder,
	trainOrderInfo: trainOrderInfo,
	subimtTrainOrder: subimtTrainOrder,
	queryServiceCommentList: queryServiceCommentList,
	trainServiceInfo: trainServiceInfo,
	saveTrainService: saveTrainService,
	queryTrainServiceList: queryTrainServiceList,
	submitTrainReview: submitTrainReview,
	trainInfo: trainInfo,
	saveTrain: saveTrain,

	queryFamilyCalendar: queryFamilyCalendar,
	myIncomeList: myIncomeList,
	getFamilyManager: getFamilyManager,
	recCoupon: recCoupon,
	inviteFamily: inviteFamily,
	queryInvFamilyList: queryInvFamilyList,

	recNationalDayCoupon: recNationalDayCoupon,
	queryNationalDay: queryNationalDay,
	myCouponList: myCouponList,

	queryRecFamilyList: queryRecFamilyList,
	queryAnswerListByDemand: queryAnswerListByDemand,
	demandAnser: demandAnser,
	queryFosterDemandList: queryFosterDemandList,
	demandInfo: demandInfo,
	closeDemand: closeDemand,
	publishDemand: publishDemand,

	queryUserOrderList: queryUserOrderList,
	queryCommentList: queryCommentList,
	delOrderComment: delOrderComment,
	findCommentByOrder: findCommentByOrder,
	commentOrder: commentOrder,

	finishOrder: finishOrder,
	advanceFinishOrder: advanceFinishOrder,
	receivedPet: receivedPet,
	confirmOrder: confirmOrder,
	cancelOrder: cancelOrder,
	fosterOrderInfo: fosterOrderInfo,
	submitFosterOrder: submitFosterOrder,

	queryAdopterList: queryAdopterList,
	myFollowFamilyList: myFollowFamilyList,
	familyFollow: familyFollow,
	orderSwitch: orderSwitch,
	submitReview: submitReview,
	saveAuthVideo: saveAuthVideo,
	saveFamily: saveFamily,
	saveAdoption: saveAdoption,

	queryCommonAddress: queryCommonAddress,
	delCommonAddress: delCommonAddress,
	saveCommonAddress: saveCommonAddress,

	zhimaCreditConfirm: zhimaCreditConfirm,
	zhimaCreditApply: zhimaCreditApply,
	saveKeepPet: saveKeepPet,
	getKeepPet: getKeepPet,

	saveLeaveComment: saveLeaveComment,
	queryPrivateChatList: queryPrivateChatList,
	queryLeaveCommentList: queryLeaveCommentList,
	queryMyNoticeList: queryMyNoticeList,
	queryIsNewMsg: queryIsNewMsg,

	savePetReport: savePetReport,
	petInfo: petInfo,
	myPets: myPets,
	delPet: delPet,
	savePetInfo: savePetInfo,
	queryByPetVarietyList: queryByPetVarietyList,
	queryCategoryList: queryCategoryList,

	saveUser: saveUser,
	queryUserCommentList: queryUserCommentList,
	myFollowList: myFollowList,
	userFollow: userFollow,
	queryHomeUserList: queryHomeUserList,
	userHomeInfo: userHomeInfo,
	getUserMajorInfo: getUserMajorInfo,
	getUserInfo: getUserInfo,

	//   --------------------------------------  
	receiveGift: receiveGift,
	checkIsChange: checkIsChange,
	familyDisplayReview: familyDisplayReview,

	isAuthUserInfo: isAuthUserInfo,
	getDistance: getDistance,
	saveWithdraw: saveWithdraw,
	judgeVerifyCode: judgeVerifyCode,
	sendPhoneCode: sendPhoneCode,
	queryBannerList: queryBannerList,
	queryHotSearch: queryHotSearch,
	analysisLocation: analysisLocation,
	textRiskIdentification: textRiskIdentification,
	tradePay: tradePay,
	uploadFile: uploadFile,
	saveFormIds: saveFormIds,
	setFormId: setFormId,
	fail: fail,
	removeStorageSync: removeStorageSync,
	getStorageSync: getStorageSync,
	setStorageSync: setStorageSync,
	alert: alert,
	confirm: confirm,
	showToast: showToast,
	showLoading: showLoading,

}




