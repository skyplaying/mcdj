import mc from '/others/js/weui_mc';
import mcdj from '../../../others/js/interface_mc';
const app = getApp();

let isNoFirst, isclick;
let isFaceRec;
Page({
	data: {},
	onLoad(options) {
		const that = this;
		// options.userId = 2;
		const inviteUserId = options && options.userId ? options.userId : null;
		if (inviteUserId) {
			this.inviteFamily(inviteUserId);
		}
	},
	onShow() {
		const that = this;
		// 获取是否实名认证
		let isFaceRec2 = mcdj.getStorageSync('face');
		app.doLogin({
			success(userInfo) {
				console.log(userInfo);
				let isface=userInfo.isFaceRec;
				    console.log(isFaceRec2)
				if(isFaceRec2!=''){
					isface=isFaceRec2;
				}	
				console.log(isface)
				that.setData({
					userInfo,
					isok: true,
					isface
				})
				if (!userInfo.isBindPhone) {
					my.alert({
						content: '您还未绑定手机，请先前往绑定手机',
						buttonText: '绑定手机',
						success() {
							my.navigateTo({
								url: '/pages/colligate/bindPhone/bindPhone'
							})
						},
					});
				} else {
					that.queryAdopterInfo();
				}
			}
		})

	},
	onUnload() {
		// 页面卸载时还原页面的全局变量（因为全局变量会保存，再次打开该页面时会造成一些数据错误）
		isNoFirst = undefined, isclick = undefined;
	},

	// 获取寄养家庭资料(修改时)
	queryAdopterInfo() {
		const that = this;
		mcdj.showLoading();
		mcdj.getKeepPet({
			success(data) {
				const userVo = data.userVo;
				console.log(userVo);
				// 家庭名称
				const familyName = userVo.adoptionVo ? userVo.adoptionVo.familyName : '';

				// 家庭信息
				const isFamilyInfo = userVo.adoptionVo && userVo.adoptionVo.address && userVo.adoptionVo.livingCondition &&
					userVo.adoptionVo.houseType && userVo.adoptionVo.homeArea ? true : false;

				// 家庭描述
				const familyDescribe = userVo.adoptionVo ? userVo.adoptionVo.familyDescribe : '';

				// 最多可寄养
				const isPetsNum = userVo.adoptionVo && (userVo.adoptionVo.petsNumberCat || userVo.adoptionVo.petsNumber);

				// 日托价格表
				const isPrice = userVo.adoptionVo && userVo.adoptionVo.priceList && userVo.adoptionVo.priceList.length > 0;

				// 提供物品
				const isProvide = userVo.adoptionVo && (userVo.adoptionVo.catGoods || userVo.adoptionVo.dogGoods) ? true :
					false;

				// 其他资料
				const isOther = userVo.adoptionVo && userVo.adoptionVo.activityArea && userVo.adoptionVo.residentPopulation ?
					true : false;

				// 个人资料
				const isUserInfo = userVo.occupation && userVo.city ? true : false;

				// 宠物信息
				const isExperience = userVo.adoptionVo && userVo.adoptionVo.keptPetList && userVo.adoptionVo.keptPetList.length >
					0 ? true : false;

				// 基础资料是否已完成
				const noDisabled1 = familyName && isFamilyInfo && familyDescribe && isPetsNum &&
					isPrice && isProvide && isOther && isUserInfo && isExperience ? true : false;

				// 上传照片是否已完成
				const noDisabled2 = userVo.adoptionVo && userVo.adoptionVo.petPhoto && that.data.userInfo.isVideoAuth;

				that.setData({
					isok: true,
					userVo,
					noDisabled1,
					noDisabled2,
				});
				my.hideLoading();
				that.isCanSubmit();
			}
		});
	},

	// 保存邀请人
	inviteFamily(inviteUserId) {
		mcdj.inviteFamily({
			inviteUserId,
			success() {
				mcdj.showToast('已保存邀请人', 2);
			}
		})
	},

	toAuthentication() {
		if (!this.data.isface) {
			my.navigateTo({
				url: "/pages/colligate/authentication/authentication"
			});
		} else {
			mcdj.showToast('您已通过实名验证', 3);
			// 	my.navigateTo({
			// 	url: "/pages/colligate/authentication/authentication"
			// });
		}
	},

	// 跳转协议
	toGuarantee(e) {
		my.navigateTo({
			url: '/pages/colligate/guarantee/guarantee?index=2',
		});
	},

	// 是否同意
	changeAgree(e) {
		this.setData({
			isAgree: !this.data.isAgree,
		});
		this.isCanSubmit();
	},

	// 是否可以提交审核
	isCanSubmit() {
		const d = this.data;
		const noDisabled = d.noDisabled1 && d.noDisabled2 && d.isface && d.isAgree ? true :
			false;
			console.log(noDisabled)
		this.setData({
			noDisabled
		})
	},

	// 完成
	complete() {
		const that = this;
		if (isclick) return
		isclick = true;
		mcdj.showLoading();
		mcdj.submitReview({
			success() {
				mcdj.showToast('已提交', 2);
				app.doLogin({
					anew: 1,
					success(userInfo) {
						that.setData({
							userInfo,
							isShowPlow: null
						})
						my.hideLoading();
						isclick = false;
					},
					fail() {
						isclick = false;
					}
				})
			},
			fail() {
				isclick = false;
			}
		})
	},

	// 知识答题
	toAdopterKnowledge() {
		if (!this.data.userInfo.currSurplusCount) {
			mcdj.alert('该月答题次数已用尽，请下个月再接再厉吧！')
		} else {
			my.navigateTo({
				url: '/pages/knowledge/display/display'
			});
		}
	},

	// 进入流程
	intoFlow() {
		this.setData({
			isShowPlow: true
		})
	},

	// 回首页
	toIndex() {
		my.switchTab({
			url: '/pages/index/index'
		});
	},

	// 联系客服
	customerService() {
		my.makePhoneCall({
			number: '075588823343',
		});
	},
	
	// 复制手机号
	handleCopy() {
		my.setClipboard({
			text: '13410633367',
			success() {
				mcdj.showToast('手机号已复制', 2);
			}
		});
	},

	// 保存formId
	setFormId(e) {
		mcdj.setFormId(e);
	},


});
