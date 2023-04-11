<template>
	<view class="content">
		<image class="logo" src="@/static/HongLongLogo.png" />
		<view class="example">
			<uni-forms ref="customForm" :rules="customRules" :modelValue="loginFormData" label-position="top">
				<uni-forms-item label="单位代码" required name="TenancyName">
					<uni-easyinput prefixIcon="home-filled" v-model="loginFormData.TenancyName"
						placeholder="请输入单位代码" />
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
			<button type="primary" @click="submit('customForm')">登录</button>
		</view>
	</view>
</template>

<script>
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
			}
		},
		onLoad(options) {
			if(options.isShowToast){
				uni.showToast({
					icon:'none',
					title:'登录超时\r\n请重新登录'
				})
			}
			
			this.loginFormData.TenancyName = uni.getStorageSync('tenancyName')
			this.loginFormData.UsernameOrEmailAddress = uni.getStorageSync('usernameOrEmailAddress')
			this.loginFormData.Password = uni.getStorageSync('password')
		},
		methods: {
			submit(ref) {
				this.$refs[ref].validate().then(res => {
					//先清空相关缓存，再重新登录
					uni.removeStorageSync('loginInfo')
					uni.removeStorageSync('expireTime')
					
					this.$Api.login({
						'TenancyName':'H' + this.loginFormData.TenancyName,
						'UsernameOrEmailAddress': this.loginFormData.UsernameOrEmailAddress,
						'Password': this.loginFormData.Password
					}).then((res) => {
						console.log(res);
						var dateTime = new Date()
						if(res){
							//缓存用户登录信息
							uni.setStorageSync('tenancyName', this.loginFormData.TenancyName)
							uni.setStorageSync('usernameOrEmailAddress', this.loginFormData.UsernameOrEmailAddress)
							uni.setStorageSync('password', this.loginFormData.Password)
							//缓存登录返回值token、有效期等
							uni.setStorageSync('loginInfo', res.result)
							uni.setStorageSync('expireTime', dateTime.setSeconds(dateTime.getSeconds() + res.result.expireInSeconds))//设置token有效期
							
							//跳转首页
							uni.redirectTo({
								url: '/pages/index/index'
							})
						}
					})
				}).catch(err => {
					console.log('err', err)
				})
			},
		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
		display: flex;
		.content {
			width: 600rpx;
			margin: auto;
			text-align: center;
		
			.logo {
				width: 345rpx;
				height: 58rpx;
				margin-bottom: 80rpx;
			}
		}
	}
</style>
