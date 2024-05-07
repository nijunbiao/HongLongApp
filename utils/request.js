import qs from 'qs'
import global from '@/common/global.js'

export default class Request {
	http(param) {
		// 请求参数
		var url = param.url,
			method = param.method,
			header = {},
			data = param.data ?? {},
			//是否要显示Loading，默认显示
			isShowLoading = param.isShowLoading ?? true, 
			//控制加载显隐
			hideLoading = false,
			//是否为登录接口
			isLogin = param.isLogin ?? false;

		//拼接完整请求地址
		var requestUrl = url.includes('https') ? url : global.ApiBaseUrl + url;

		//请求方式:GET或POST(POST需配置
		if (method) {
			method = method.toUpperCase(); //小写改为大写

			//GET请求时自己拼接请求Url（参数存在数组时，不处理请求格式不正确）
			//例如OrganizationUnitIds参数，默认是直接拼接OrganizationUnitIds=[code,code...]，正确结果是OrganizationUnitIds=code&OrganizationUnitIds=code...
			if (method == 'GET' && data) {
				requestUrl += '?' + qs.stringify(data)
				data = {}
			}

			header = {
				'content-type': 'application/json', //'application/x-www-form-urlencoded' //自定义请求头信息
			};

			//判断是否添加身份验证
			if (!isLogin && uni.getStorageSync('loginInfo')) {
				console.log(isLogin)
				header.Authorization = global.TokenPrefix + uni.getStorageSync(
					'loginInfo').accessToken
			}
		}

		//加载圈
		if (isShowLoading && !hideLoading) {
			hideLoading = true
			uni.showLoading({
				title: '加载中...'
			})
		}

		//获取当前所在页面
		var pages = getCurrentPages()
		//当前是否为Login界面
		var isLoginPage = pages[pages.length - 1].route.includes("login")

		// 返回promise
		return new Promise((resolve, reject) => {
			//判断token是否过期（当前为调用登录接口时则不用判断）
			if (!isLogin && uni.getStorageSync('expireTime') && uni.getStorageSync('expireTime') <= Date.now()) {
				//当前不为Login页面再跳转
				if (!isLoginPage) {
					console.log('Token过期跳转')
					uni.redirectTo({
						url: '/pages/login/login?isShowToast=1',
					})

					resolve();
					return;
				}
			}

			var errorMsg = ''
			var isRedirectToLogin = false
			// 请求
			uni.request({
				url: requestUrl,
				data: data,
				method: method,
				header: header,
				success: (res) => {
					if (res.data.error) {
						errorMsg = res.data.error.message

						if (res.data.unAuthorizedRequest) {
							isRedirectToLogin = true
						}
					} else {
						// 将结果抛出
						resolve(res.data);
						return;
					}
				},
				//请求失败
				fail: (e) => {
					errorMsg = '请求失败'
					console.log('请求报错提示：', e.errMsg)
					resolve(e.data);
				},
				//请求完成
				complete() {
					//隐藏加载
					if (isShowLoading && hideLoading) {
						hideLoading = false
						uni.hideLoading({
							fail: function(res) {
								//不加fail回调真机会报hideLoading的错误信息
								//console.log('报错了')
							}
						});
					}

					//有错误信息则提示
					if (errorMsg) {
						uni.showToast({
							icon: 'none',
							title: errorMsg
						})
					}

					//判断是否需要跳回登录界面，如果当前是登录界面则不做跳转
					if (isRedirectToLogin && !isLoginPage) {
						console.log('跳转登录页面')
						setTimeout(() => {
							uni.redirectTo({
								url: '/pages/login/login',
							})
						}, 1500)
					}

					resolve();
					return;
				}
			})
		})
	}
}
