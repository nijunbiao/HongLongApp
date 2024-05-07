<template>
	<view class="content">
		<uni-notice-bar show-icon scrollable speed="80" :background-color="(isShowMask ? '#def0fa' : '#ffffff')"
			color="#ff0000" text="道路千万条，安全第一条，行车不规范，亲人两行泪!" />
		<view class="mask" :style="{display: (isShowMask ? '' : 'none')}">
			<image src="@/static/drivingRegulations.jpg" />
			<button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">获取手机号</button>
		</view>
		<view class="qrCode" :style="{display: (isShowMask ? 'none' : '')}">
			<text>{{ timeTip }}</text>
			<tkiQrcode ref="qrcode" :val="qrval" :size="qrsize" :unit="unit" :background="background"
				:foreground="foreground" :pdground="pdground" :icon="codeImage" :iconSize="codeImageSize"
				:loadMake="loadMake" :onval="onval" @result="qrR" />
			<text>{{'（将于' + codeValidityDate + '时失效）'}}</text>
		</view>
		<view class="operate">
			<button @click="makeCode(staffInfo.staffNum)">刷新二维码</button>
		</view>
	</view>
</template>

<script>
	import {
		EncryptByDES,
		StrToDate,
		AddMilliseconds,
		TimeTip
	} from '@/utils/tool.js'
	import tkiQrcode from '@/components/tki-qrcode/tki-qrcode.vue'
	export default {
		components: {
			tkiQrcode
		},
		data() {
			return {
				isShowMask: true,
				//要生成的内容
				qrval: '',
				//生成的二维码大小
				qrsize: 550,
				//大小单位尺寸（可选值：px）
				unit: 'upx',
				//二维码背景色
				background: '#ffffff',
				//二维码前景色
				foreground: '#59b42b',
				//二维码角标色
				pdground: '#59b42b',
				//二维码图标Url
				codeImage: '../../static/logo.jpg',
				//二维码图标大小
				codeImageSize: '40',
				//组件初始化完成后，val有值自动生成二维码
				loadMake: false,
				//监听val值变化自动重新生成二维码
				onval: true,
				//是否需要还原屏幕亮度（减少不必要的重复调用）
				isRestoreScreenBrightness: false,
				//用户的屏幕亮度
				screenBrightness: 0,
				//员工信息
				staffInfo: null,
				//用户手机号
				phoneNum: '',
				//二维码失效时间（仅作显示，实际控制在主控机）
				codeValidityDate: '',
				//时间提示
				timeTip: ''
			}
		},
		onLoad() {
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#003366',
				animation: {
					duration: 3000,
					timingFunc: "easeOut"
				}
			})
		},
		onUnload() {
			this.revertScreenBrightness()
		},
		onHide() {
			this.revertScreenBrightness()
		},
		methods: {
			//获取用户的手机号
			async getPhoneNumber(e) {
				var that = this
				console.log(e.detail.code)

				if (e.detail.code) {
					var that = this

					//根据code换取用户的手机号
					var numberRes = await this.$WXApi.GetPhoneNumber({
						'code': e.detail.code
					})

					console.log(numberRes)
					if (numberRes.result) {
						if (numberRes.result.errcode == 0) {
							//获取到用户的手机号不含区号
							that.phoneNum = numberRes.result.phone_info.purePhoneNumber

							//根据手机号查询用户信息
							this.getStaffInfoByPhoneNum()
						} else {
							uni.showToast({
								icon: 'none',
								title: '获取手机号失败'
							})
						}
					} else {
						console.log('获取手机号无结果')
					}
				}
			},
			//根据手机号查询用户信息
			getStaffInfoByPhoneNum() {
				this.$Api.Staff_GetPaged({
					'PhoneNum': this.phoneNum
				}).then((res) => {
					console.log(res)
					if (res) {
						if (res.result.items && res.result.items.length > 0) {
							var staff = res.result.items.filter((s) => s.examineState == '已审核')
							if (staff && staff.length > 0) {
								this.staffInfo = staff[0]
								this.timeTip = TimeTip() + '，' + (this.staffInfo.staffName.length > 0 ? this
									.staffInfo.staffName : '同志') + '\n' + '工号：' + this.staffInfo.staffNum
								this.isShowMask = false
								this.makeCode(this.staffInfo.staffNum)
							} else {
								uni.showToast({
									icon: "none",
									title: "信息还未通过审核"
								})
							}
						} else {
							uni.showToast({
								icon: "none",
								title: "当前手机未注册"
							})
						}
					}
				})
			},
			// 二维码生成工具
			qrR(res) {
				this.src = res
			},
			//生成二维码
			makeCode(staffNum) {
				var that = this
				//获取用户的屏幕亮度
				uni.getScreenBrightness({
					success: function(res) {
						console.log(res)
						that.screenBrightness = res.value
					}
				})

				//刷新过期时间
				var dateNow = new Date()

				//更新过期时间
				var codeValidityDate = AddMilliseconds(dateNow, this.$Global.StaffCertification_QrCodeExpireMillisecond)
				this.codeValidityDate = StrToDate(codeValidityDate)
				
				//拼接要加密的字符串
				var qrCodeVal = staffNum + '|' + StrToDate(dateNow)

				console.log(qrCodeVal)

				//重新加密
				this.qrval = EncryptByDES(qrCodeVal)
				console.log(this.qrval)

				//console.log(this.$refs.qrcode)
				//this.$refs.qrcode._makeCode();

				//生成二维码后，将用户屏幕亮度调制最亮，方便扫码识别
				if (this.screenBrightness != 1) {
					uni.setScreenBrightness({
						value: 1,
						success: function() {
							that.isRestoreScreenBrightness = true
							console.log('设置亮度成功')
						}
					})
				}
			},
			//清除二维码
			clearCode() {
				this.$refs.qrcode._clearCode();
			},
			//保存二维码
			saveCode() {
				this.$refs.qrcode._saveCode();
			},
			//还原用户屏幕亮度
			revertScreenBrightness() {
				var that = this
				//退出此功能后，要将原来用户的屏幕亮度还原
				if (this.isRestoreScreenBrightness) {
					uni.setScreenBrightness({
						value: that.screenBrightness,
						success: function() {
							console.log('还原屏幕亮度成功')
						}
					})
				}
			}
		}
	}
</script>

<style scoped>
	/deep/.uni-noticebar {
		margin: 0rpx !important;
	}
</style>

<style lang="scss">
	page {
		width: 100%;
		height: 100%;

		.content {
			width: inherit;
			height: inherit;

			button {
				color: #ffffff;
				border-radius: 60rpx;
				background: linear-gradient(-5deg, #00ccff, #003366);
			}

			.mask {
				z-index: 9999;
				width: inherit;
				height: inherit;
				display: flex;
				flex-direction: column;
				align-items: center;

				image {
					width: inherit;
					height: 75%;
				}

				button {
					width: 90%;
					margin-top: 50rpx;
				}
			}

			.qrCode {
				width: inherit;
				height: 65%;
				display: flex;
				text-align: center;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				font-size: 34rpx;
				color: #666666;

				.tki-qrcode {
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 10rpx;
				}
			}

			.operate {
				button {
					width: 70%;
					margin: auto 15%;
					display: inline-block;
				}
			}
		}
	}
</style>
