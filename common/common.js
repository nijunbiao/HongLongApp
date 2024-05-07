import global from '@/common/global.js'
import Api from '@/common/api.js'
import WXApi from '@/common/wxApi.js'

/*获取游客的鸿隆Token*/
async function GetVisitorHLToken() {
	var result = true

	//判断是否有游客Token信息，并且有效期大于所设置的阈值
	if (uni.getStorageSync('isInterUser') == true && uni.getStorageSync('loginInfo') && uni.getStorageSync('expireTime') && ((uni.getStorageSync(
			'expireTime') - Date.now()) / 1000 / 60) > global.Token_MinValidityPeriod) {
		console.log('鸿隆游客Token有效期大于5分钟')
	} else {
		//登录无租户账号，用于添加用户
		var login = await Api.Login({
			'UsernameOrEmailAddress': global.HL_LoginName,
			'Password': global.HL_LoginPassword
		})

		if (login) {
			var expireTime = new Date()
			//缓存登录返回值token、有效期等
			uni.setStorageSync('isIntrUser', true)
			uni.setStorageSync('loginInfo', login.result)
			uni.setStorageSync('expireTime', expireTime.setSeconds(expireTime.getSeconds() +
				login.result.expireInSeconds)) //设置token有效期

			console.log('请求鸿隆游客Token成功')
		} else {
			result = false
			console.log('请求鸿隆游客Token失败')
		}
	}

	return result
}

export {
	GetVisitorHLToken
}