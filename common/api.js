import Request from '@/utils/request.js'
let request = new Request().http;

export default {
	//登录
	login(data) {
		return request({
			url: '/api/TokenAuth/Authenticate',
			method: 'POST',
			data: data
		})
	},
	//获取用户对应权限以及组织机构（根据login返回的userId进行查询）
	GetUserInfos(data) {
		return request({
			url: '/api/services/app/User/GetUserInfos',
			method: 'GET',
			data: data
		})
	},
	//获取主控机信息
	GetControlTerminalListWithCabinet(data) {
		var defaultData = {
			'MaxResultCount': 999,
			'SkipCount': 0,
			'Sorting': 'TerminalCode ASC'
		}

		//后面相同的属性覆盖前一个，返回一个新对象
		data = Object.assign(defaultData, data);
		return request({
			url: '/api/services/app/ControlTerminal/GetControlTerminalListWithCabinet',
			method: 'GET',
			data: data
		})
	},
	//获取每个内胆格子信息
	GetBoxLockerList(data) {
		var defaultData = {
			'MaxResultCount': 999,
			'SkipCount': 0,
			'Sorting': 'BoxCabinetNo ASC, BoxLockerNo ASC'
		}
		
		//后面相同的属性覆盖前一个，返回一个新对象
		data = Object.assign(defaultData, data);
		return request({
			url: '/api/services/app/BoxLocker/GetBoxLockerList',
			method: 'GET',
			data: data
		})
	},
	//获取每个钥匙格子信息
	GetKeyLockerList(data) {
		var defaultData = {
			'MaxResultCount': 999,
			'SkipCount': 0,
			'Sorting': 'KeyCabinetNo ASC, KeyLockerNo ASC'
		}
		
		//后面相同的属性覆盖前一个，返回一个新对象
		data = Object.assign(defaultData, data);
		return request({
			url: '/api/services/app/KeyLocker/GetKeyLockerList',
			method: 'GET',
			data: data
		})
	}
}
