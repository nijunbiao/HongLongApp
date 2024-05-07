import Request from '@/utils/request.js'
let request = new Request(false).http;

export default {
	/**
	 * 登录
	*/
	Login(data) {
		return request({
			url: '/api/TokenAuth/Authenticate',
			method: 'POST',
			data: data,
			isLogin: true
		})
	},
	/**
	 * 获取用户对应权限以及组织机构（根据login返回的userId进行查询）
	*/
	GetUserInfos(data) {
		return request({
			url: '/api/services/app/User/GetUserInfos',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 获取主控机信息
	*/
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
	/**
	 * 获取按场站分组的汇总信息（小程序使用）
	*/
	GetControlTerminalGroupByBusTerminal(data) {	
		return request({
			url: '/api/services/app/ControlTerminal/GetControlTerminalGroupByBusTerminal',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 获取按主控机分组的汇总信息（小程序使用）
	*/
	GetControlTerminalGroupByTerminal(data) {	
		return request({
			url: '/api/services/app/ControlTerminal/GetControlTerminalGroupByTerminal',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 获取按场站或主控机查询不同类型（空、满）内胆数量（小程序使用）
	*/
	GetBoxCountGroupByTerminalAndType(data) {	
		return request({
			url: '/api/services/app/ControlTerminal/GetBoxCountGroupByTerminalAndType',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 获取每个内胆格子信息
	*/
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
	/**
	 * 获取每个钥匙格子信息
	*/
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
	},
	/**
	 * 获取收银员收满胆记录
	*/
	GetBoxDistributionDetail_InOutLockerBoxExtension(data, isShowLoading = false) {
		var defaultData = {
			'DetailType': 'OutLockerFullBox'
		}

		//后面相同的属性覆盖前一个，返回一个新对象
		data = Object.assign(defaultData, data);
		return request({
			url: '/api/services/app/BoxStorage/GetBoxDistributionDetail_InOutLockerBoxExtension',
			method: 'GET',
			data: data,
			isShowLoading: isShowLoading
		})
	},
	GetInLockerFullBox_ExportExcel_Temporary(data) {
		//后面相同的属性覆盖前一个，返回一个新对象
		return request({
			url: '/api/services/app/BoxStorage/GetInLockerFullBox_ExportExcel_Temporary',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 新增人员信息
	*/
	Staff_CreateOrUpdate(data) {
		return request({
			url: '/api/services/app/BaseStaff/CreateOrUpdate',
			method: 'POST',
			data: data
		})
	},
	/**
	 * 获取人员信息
	*/
	Staff_GetPaged(data) {
		return request({
			url: '/api/services/app/BaseStaff/GetPaged',
			method: 'GET',
			data: data
		})
	},
	/**
	 * app驾驶员鉴权
	 * @param {Object} data
	 */
	Staff_GetBaseStaffInfoForApp(data){
		return request({
			url: '/api/services/app/BaseStaff/GetBaseStaffInfoForApp',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 新增或修改报修记录
	*/
	RepairRecord_CreateOrUpdate(data) {
		return request({
			url: '/api/services/app/RepairRecord/CreateOrUpdate',
			method: 'POST',
			data: data
		})
	},
	/**
	 * 获取字典信息
	*/
	GetActiveDictionaryInfos(data) {
		return request({
			url: '/api/services/app/DictionaryInfo/GetActiveDictionaryInfos',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 添加线路信息
	 */
	Route_CreateOrUpdate(data){
		return request({
			url: '/api/services/app/BaseRoute/CreateOrUpdate',
			method: 'POST',
			data: data
		})
	},
	/**
	 * 查询线路信息
	 */
	Route_GetPaged(data){
		var defaultData = {
			'MaxResultCount': 999,
			'SkipCount': 0
		}
		
		//后面相同的属性覆盖前一个，返回一个新对象
		data = Object.assign(defaultData, data);
		return request({
			url: '/api/services/app/BaseRoute/GetPaged',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 添加或修改车辆信息
	 */
	Vehicle_CreateOrUpdate(data){
		return request({
			url: '/api/services/app/BaseVehicle/CreateOrUpdate',
			method: 'POST',
			data: data
		})
	},
	Vehicle_GetPaged(data){
		var defaultData = {
			'MaxResultCount': 999,
			'SkipCount': 0
		}
		
		//后面相同的属性覆盖前一个，返回一个新对象
		data = Object.assign(defaultData, data);
		return request({
			url: '/api/services/app/BaseVehicle/GetPaged',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 获取内胆信息
	 */
	Box_GetPaged(data){
		var defaultData = {
			'MaxResultCount': 999,
			'SkipCount': 0
		}
		
		//后面相同的属性覆盖前一个，返回一个新对象
		data = Object.assign(defaultData, data);
		return request({
			url: '/api/services/app/BaseBox/GetPaged',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 添加或修改内胆信息
	 */
	Box_CreateOrUpdate(data){
		return request({
			url: '/api/services/app/BaseBox/CreateOrUpdate',
			method: 'POST',
			data: data
		})
	},
	/**
	 * 获取票箱信息
	 */
	Shell_GetPaged(data){
		var defaultData = {
			'MaxResultCount': 999,
			'SkipCount': 0
		}
		
		//后面相同的属性覆盖前一个，返回一个新对象
		data = Object.assign(defaultData, data);
		return request({
			url: '/api/services/app/BaseShell/GetPaged',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 添加或修改票箱信息
	 */
	Shell_CreateOrUpdate(data){
		return request({
			url: '/api/services/app/BaseShell/CreateOrUpdate',
			method: 'POST',
			data: data
		})
	},
	/**
	 * 获取所有单位
	 */
	GetOrganizationUnits(data){
		return request({
			url: '/api/services/app/OrganizationUnit/GetOrganizationUnits',
			method: 'GET',
			data: data
		})
	},
	/**
	 * 自助交账接口
	 * @param {Object} data
	 */
	SubmitSelfServiceCashier(data){
		return request({
			url: '/api/services/app/SelfServiceCashier/SubmitSelfServiceCashier',
			method: 'POST',
			data: data
		})
	}
}
