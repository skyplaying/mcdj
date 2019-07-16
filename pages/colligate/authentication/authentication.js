// 引入配置
import mcdj from '/others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
Page({
	data: {
		name: null,
		idcard: null,
		zimId: null
	},
	onLoad() {
		var that = this
		var _self = this
		app.doLogin({
			success(userInfo) {
				mcdj.getUserMajorInfo({
					success(data) {
						const UserMajorInfo = data.userInfo;
						console.log(UserMajorInfo)
						that.setData({
							userInfo,
							name: UserMajorInfo.userName,
							idcard: UserMajorInfo.idCard,
							isok: true,
							userId: UserMajorInfo.userId,
						})
						that.isCanSubmit();
						let userId = that.data.userId;
						console.log(userId);
					}
				})
			}
		});

	},

	onUnload() {
		// 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
		isclick = undefined, isNoFirst = undefined;
	},

	inputName(e) {
		this.setData({
			name: e.detail.value
		})
		this.isCanSubmit();
	},

	inputIdcard(e) {
		this.setData({
			idcard: e.detail.value
		})
		this.isCanSubmit();
	},

	// 是否能提交
	isCanSubmit() {
		const isName = this.data.name.length >= 2 ? 1 : 0;
		var regIdcard1 = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;
		var regIdcard2 = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|x|X)$/;
		const isIdcard = regIdcard1.test(this.data.idcard) || regIdcard2.test(this.data.idcard) ? 1 : 0;
		this.setData({
			noDisabled: isName && isIdcard
		})
	},

	//原芝麻认证  现支付宝认证
	submit() {
		if (isclick) {
			return isclick = true;
		}
		var that = this;
		var _self = this
		let userName = that.data.name
		let idCard = that.data.idcard
		let tradeNo = that.tradeNo().toString() //订单号
		let bizId = tradeNo;
		let userId = that.data.userId;
		console.log(userId)
		mcdj.zhimaCreditApply({
			userName,
			idCard,
			success(data) {
				if (data.resultCode == 'Y') {
					my.ap.faceVerify({
						bizId: tradeNo, //业务请求的唯一标识，需要保证唯一性
						bizType: '2', //业务场景参数，必须填写‘2’，代表刷脸认证  
						success: (res) => {
							var zimId = res.zimId;
							mcdj.faceCheck({
								'zimId': zimId,
								'bizId': bizId,
								'userId': userId,
								success: (e) => {
									let msg = _self.IdMsg(e.data.code)
									mcdj.showToast(msg)
									console.log(e)
								},
								fail: () => {
									mcdj.showToast('服务器繁忙,请稍后再试')
								}
							})
						},
						fail: () => {
							mcdj.showToast('服务器繁忙,请稍后再试')
						}
					});
				}
			}
		})


	},
	//生成 唯一订单号
	tradeNo() {
		const now = new Date()
		const year = now.getFullYear();
		let month = now.getMonth() + 1;
		let day = now.getDate();
		let hour = now.getHours();
		let minutes = now.getMinutes();
		let seconds = now.getSeconds();
		let milliseconds = now.getMilliseconds(); //毫秒
		String(month).length < 2 ? (month = "0" + month) : month;
		String(day).length < 2 ? (day = "0" + day) : day;
		String(hour).length < 2 ? (hour = "0" + hour) : hour;
		String(minutes).length < 2 ? (minutes = "0" + minutes) : minutes;
		String(seconds).length < 2 ? (seconds = "0" + seconds) : seconds;
		String(milliseconds).length < 2 ? (milliseconds = "0" + milliseconds) : milliseconds;
		const yyyyMMddHHmmss = year + '' + month + '' + day + '' + hour + '' + minutes + '' + seconds + '' + milliseconds;
		var ob = yyyyMMddHHmmss + Math.random().toString(36).substr(2, 9);
		console.log(ob)
		return ob;
	},
	//根据身份验证返回码,提示信息
	IdMsg(e) {
		e = parseInt(e)
		let msg = ''; //返回
		if (e == 10000) {
			msg = '支付宝认证成功'
			mcdj.setStorageSync('face', '1') //1是 通过 0是未完成
			my.navigateBack();
		} else {
			msg = "认证失败,请联系客服进行反馈"
			mcdj.setStorageSync('face', '0')
		}
		return msg;
	},


})
