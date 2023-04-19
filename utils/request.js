//Api地址
const baseUrl = 'http://47.101.163.135:22742' //正式Api地址'http://47.101.163.135:22742'
const authorizationScheme = 'Bearer '

export default class Request {
	http(param) {
		// 请求参数
		var url = param.url,
			method = param.method,
			header = {},
			data = param.data || {},
			isShowLoading = param.isShowLoading ?? true,//是否要显示Loading，默认显示
			hideLoading = false;

		//拼接完整请求地址
		var requestUrl = baseUrl + url;

		//请求方式:GET或POST(POST需配置
		if (method) {
			method = method.toUpperCase(); //小写改为大写

			//GET请求时自己拼接请求Url（参数存在数组时，不处理请求格式不正确）
			//例如OrganizationUnitIds参数，默认是直接拼接OrganizationUnitIds=[code,code...]，正确结果是OrganizationUnitIds=code&OrganizationUnitIds=code...
			if (method == 'GET' && data) {
				const qs = require('qs')
				requestUrl += '?' + qs.stringify(data)
				data = {}
			}

			header = {
				'content-type': 'application/json', //'application/x-www-form-urlencoded' //自定义请求头信息
				//身份验证
				'Authorization': uni.getStorageSync('loginInfo') ? authorizationScheme + uni.getStorageSync(
					'loginInfo').accessToken : ''
			};
		}

		//加载圈
		if (isShowLoading && !hideLoading) {
			hideLoading = true
			uni.showLoading({
				title: '加载中...'
			})
		}

		// 返回promise
		return new Promise((resolve, reject) => {
			//判断token是否过期
			if (uni.getStorageSync('expireTime') && uni.getStorageSync('expireTime') < Date.now()) {
				uni.redirectTo({
					url: '/pages/login/login?isShowToast=1',

				})
				resolve();
				return;
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
					// 判断 请求api 格式是否正确
					if (res.statusCode == 200) {
						// 将结果抛出
						resolve(res.data);
						return;
					} else {
						if (res.data.unAuthorizedRequest) {
							errorMsg = res.data.error.message

							isRedirectToLogin = true
						} else {
							if (res.statusCode == 400 || res.statusCode == 401 || res
								.statusCode ==
								403) {
								errorMsg = res.data.error.message
							} else if (res.statusCode == 404) {
								errorMsg = '调用接口失败'
							} else if (res.statusCode == 500) {
								errorMsg = res.data.error.details
							}
						}

						return;
					}
				},
				//请求失败
				fail: (e) => {
					errorMsg = '请求失败'
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
								console.log('报错了')
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

					//判断是否需要跳回登录界面
					if (isRedirectToLogin) {
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
