<template>
	<view class="content">
		<image class="logo" src="@/static/zzsy.png" :style="{marginTop: logoMarginTop}" />
		<view class="example">
			<uni-forms ref="customForm" :rules="customRules" :modelValue="loginFormData" label-position="top">
				<uni-forms-item label="单位代码" required name="TenancyName">
					<uni-easyinput prefixIcon="home-filled" v-model="loginFormData.TenancyName" placeholder="请输入单位代码" />
				</uni-forms-item>
				<uni-forms-item label="账号" required name="UsernameOrEmailAddress">
					<uni-easyinput prefixIcon="person-filled" v-model="loginFormData.UsernameOrEmailAddress"
						placeholder="请输入账号" />
				</uni-forms-item>
				<uni-forms-item label="密码" required name="Password">
					<uni-easyinput prefixIcon="locked-filled" type="password" v-model="loginFormData.Password"
						placeholder="请输入密码" />
				</uni-forms-item>
			</uni-forms>
			<view class="tourist">
				<text @click="visitorLogin">无账号登录</text>
			</view>
			<button type="primary" @click="login">登录</button>
		</view>
	</view>
</template>

<script>
	import {
		Throttle
	} from '@/utils/tool.js'
	import {
		GetVisitorHLToken
	} from '@/common/common.js'
	export default {
		data() {
			return {
				// 自定义表单数据
				loginFormData: {
					TenancyName: '',
					UsernameOrEmailAddress: '',
					Password: ''
				},
				// 自定义表单校验规则
				customRules: {
					TenancyName: {
						rules: [{
							required: true,
							errorMessage: '单位代码不能为空'
						}]
					},
					UsernameOrEmailAddress: {
						rules: [{
							required: true,
							errorMessage: '账号不能为空'
						}]
					},
					Password: {
						rules: [{
							required: true,
							errorMessage: '密码不能为空'
						}]
					}

				},
				logoMarginTop: '0px'
			}
		},
		onReady() {
			this.$refs.customForm.setRules(this.customRules)
		},
		onLoad(options) {
			this.removeStorage()
			if (options.isShowToast) {
				uni.showToast({
					icon: 'none',
					title: '登录超时\r\n请重新登录'
				})
			}
			//  else {
			// 	//先清空相关缓存，再重新登录（无账号登录不清空，避免重复调用接口）
			// 	if (!uni.getStorageSync('isIntrUser')) {
			// 		this.removeStorage()
			// 	}
			// }

			this.loginFormData.TenancyName = uni.getStorageSync('tenancyName')
			this.loginFormData.UsernameOrEmailAddress = uni.getStorageSync('usernameOrEmailAddress')
			this.loginFormData.Password = uni.getStorageSync('password')

			//获取菜单按钮（右上角胶囊按钮）的布局位置信息
			var res = uni.getMenuButtonBoundingClientRect()
			console.log(res)

			//根据菜单按钮设置Logo的Margin
			this.logoMarginTop = res.top + res.height + 'px'
		},
		onHide() {
			this.$refs['customForm'].clearValidate()
		},
		methods: {
			//清空相关缓存
			removeStorage() {
				uni.removeStorageSync('isIntrUser')
				uni.removeStorageSync('loginInfo')
				uni.removeStorageSync('expireTime')
				uni.removeStorageSync('userInfo')
			},
			//无账号登录（节流处理，避免用户重复点击）
			visitorLogin: Throttle(async function visitorLogin() {
				this.visitorLoginDisabled = true
				var result = await GetVisitorHLToken()
				if (result) {
					//跳转首页
					uni.redirectTo({
						url: '/pages/index/index'
					})
				} else {
					this.removeStorage()
					console.log('跳转首页失败')
				}
				this.visitorLoginDisabled = false
			}, 1000),
			//登录（节流处理，避免用户重复点击）
			login: Throttle(function() {
				this.$refs.customForm.validate().then(res => {
					this.$Api.Login({
						'TenancyName': 'H' + this.loginFormData.TenancyName,
						'UsernameOrEmailAddress': this.loginFormData.UsernameOrEmailAddress,
						'Password': this.loginFormData.Password
					}).then((res) => {
						console.log(res)
						var dateTime = new Date()
						if (res) {
							//先清空相关缓存，再重新登录
							this.removeStorage()

							//缓存用户登录信息
							uni.setStorageSync('tenancyName', this.loginFormData.TenancyName)
							uni.setStorageSync('usernameOrEmailAddress', this.loginFormData
								.UsernameOrEmailAddress)
							uni.setStorageSync('password', this.loginFormData.Password)
							//缓存登录返回值token、有效期等
							uni.setStorageSync('isIntrUser', null)
							uni.setStorageSync('loginInfo', res.result)
							uni.setStorageSync('expireTime', dateTime.setSeconds(dateTime
								.getSeconds() +
								res.result.expireInSeconds)) //设置token有效期

							//跳转首页
							uni.redirectTo({
								url: '/pages/index/index'
							})
						}
					})
				}).catch((err) => {
					console.log('err', err)
				})
			}, 1000),
		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
		display: flex;

		.content {
			width: inherit;
			display: flex;
			flex-direction: column;
			align-items: center;
			background: linear-gradient(0deg, #00ccff, #003366);

			.logo {
				width: 474rpx;
				height: 147rpx;
			}

			.example {
				width: 80%;
				margin: auto;
				box-shadow: 0 0 30rpx black;
				padding: 40rpx;
				border-radius: 30rpx;
				background-color: white;

				button {
					border-radius: 60rpx;
					background: linear-gradient(-5deg, #00ccff, #003366);
				}

				.tourist {
					text-align: end;
					margin-bottom: 20rpx;
					color: #0d47a1;
					font-size: 28rpx;
				}
			}
		}
	}
</style>
