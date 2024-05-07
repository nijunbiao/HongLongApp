import Request from '@/utils/request.js'
let request = new Request().http;

export default {
	/** 
	* 获取稳定版接口调用凭据 
	*/
	GetStableAccessToken(data){
		var defaultData = {
			'isHL': true
		}
		
		//后面相同的属性覆盖前一个，返回一个新对象
		data = Object.assign(defaultData, data);
		return request({
			url: '/api/services/app/WeChatApi/GetStableAccessToken',
			method: 'GET',
			data: data
		})
	},
	/**
	* 获取手机号 
	*/
	GetPhoneNumber(data){
		var defaultData = {
			'isHL': true
		}
		
		//后面相同的属性覆盖前一个，返回一个新对象
		data = Object.assign(defaultData, data);
		return request({
			url: '/api/services/app/WeChatApi/GetPhoneNumber',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 获取不限制的小程序码
	*/
	GetUnlimitedQRCode(data, token){
		return request({
			url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + token,
			method: 'POST',
			data: data
		})
	}
}