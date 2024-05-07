import {
	ArrayBufferToHex,
	SplitHexString,
	HexToString,
	HexToDecStr
} from '@/utils/tool.js'
const buletoothCommand = {
	/**
	 * 报文起始标志
	 */
	Head: 0x10,
	/**
	 * 蓝牙测试密码
	 */
	TestPassword: 240205,
	/**
	 * ASCII编码的字节数组_蓝牙测试密码
	 */
	TestPassword_Bytes: null,
	/**
	 * 蓝牙设备 id
	 */
	DeviceId: '',
	/**
	 * 蓝牙特征对应服务的 UUID
	 */
	ServiceId: '',
	/**
	 * 蓝牙特征的 UUID
	 */
	CharacteristicId: '',
	/**
	 * 通信列表（每次调用SendCommand方法时需要在列表中添加一项，回复后从列表移除）
	 * 避免解析回复信息错误
	 */
	CommandList: [],
	CMDTypeSend: {
		IAP: 0x01, //IAP相关命令
		Control: 0x02, //壁挂式控制命令
		Query: 0x03, //壁挂式查询命令
		Other: 0x04
	},
	CMDTypeReceive: {
		/**
		 * ACK收到正确命令
		 */
		ACK: 80,
		/**
		 * NCK收到错误命令
		 */
		NCK: 81,
		/**
		 * 上一帧命令未完成
		 */
		CNC: 82
	},
	CMDIAPSend: {
		/**
		 * 跳转到bootIAP
		 */
		JumpToBootIAP: 0x20,
		/**
		 * 擦除程序区
		 */
		EraseProgram: 0x30,
		/**
		 * 上传程序
		 */
		UploadProgram: 0x50,
		/**
		 * 读IAP版本号
		 */
		ReadIAPVersion: 0x60,
		/**
		 * 读指定地址128字节数据
		 */
		Read128Byte: 0x70
	},

	// CMDIAPReceive: {
	// 	Correct: { value: 0x00, description: '正确'}, //正确
	// 	CRCError: { value: 0x01, description: 'CRC错误'}, //CRC错误
	// 	CMDError: { value: 0x02, description: 'CMD错误'}, //CMD错误
	// 	NameError: { value: 0x03, description: '程序名字错误'}, //程序名字错误
	// 	OutOfMemory: { value: 0x04, description: '程序大于内存空间'}, //程序大于内存空间
	// 	LenHLenLError: { value: 0x05, description: '接收程序第LenH LenL帧错误'}, //接收程序第LenH LenL帧错误
	// 	ProgramTooLong: { value: 0x06, description: '接收的数据过长'}, //接收的数据过长
	// 	ProgramOverflow: { value: 0x07, description: '接收程序帧溢出'}, //接收程序帧溢出
	// 	SendNext: { value: 0x08, description: '发下一个数据帧'}, //发下一个数据帧
	// 	MemoryAddreError: { value: 0x09, description: '内存地址错误'} //内存地址错误
	// },

	CMDIAPReceive: [{
			value: 0x00,
			description: '正确'
		}, //正确
		{
			value: 0x01,
			description: 'CRC错误'
		}, //CRC错误
		{
			value: 0x02,
			description: 'CMD错误'
		}, //CMD错误
		{
			value: 0x03,
			description: '程序名字错误'
		}, //程序名字错误
		{
			value: 0x04,
			description: '程序大于内存空间'
		}, //程序大于内存空间
		{
			value: 0x05,
			description: '接收程序第LenH LenL帧错误'
		}, //接收程序第LenH LenL帧错误
		{
			value: 0x06,
			description: '接收的数据过长'
		}, //接收的数据过长
		{
			value: 0x07,
			description: '接收程序帧溢出'
		}, //接收程序帧溢出
		{
			value: 0x08,
			description: '发下一个数据帧'
		}, //发下一个数据帧
		{
			value: 0x09,
			description: '内存地址错误'
		} //内存地址错误
	],

	CMDControlSend: {
		/**
		 * 蓝牙重启
		 */
		BTRestart: 0x01,
		/**
		 * 蓝牙改密码
		 */
		BTChangePassword: 0x02,
		/**
		 * 蓝牙改名字
		 */
		BTChangeName: 0x03,
		/**
		 * 蓝牙恢复出厂设置
		 */
		BTFactoryReset: 0x04,
		/**
		 * 设备重启
		 */
		DeviceRestart: 0x05,
		/**
		 * 投币机机构锁
		 */
		FBInnerLock: 0x11,
		/**
		 * 投币机机构解锁
		 */
		FBInnerUnLock: 0x12,
		/**
		 * 投币机内胆锁
		 */
		FareBoxLock: 0x13,
		/**
		 * 投币机内胆解锁
		 */
		FareBoxUnLock: 0x14,
		/**
		 * 投币机电机入币操作
		 */
		FBCoinInsert: 0x15,
		/**
		 * 投币机电机退币操作
		 */
		FBCoinReturn: 0x16,
		/**
		 * 红外口校正
		 */
		InfraredCorrection: 0x17,
		/**
		 * Led显示
		 */
		LedDisplay: 0x18,
		/**
		 * 写入记录信息
		 */
		WriteRecord: 0x19,
		/**
		 * 清除数据和记录
		 */
		ClearRecord: 0x20
	},

	CMDControlReceive: [{
			value: 0x00,
			description: '正确'
		}, //正确
		{
			value: 0x01,
			description: 'CRC错误'
		}, //CRC错误
		{
			value: 0x02,
			description: 'CMD错误'
		}, //CMD错误
		{
			value: 0x03,
			description: '操作失败'
		}, //操作失败
		{
			value: 0x04,
			description: '当前模式不可操作'
		}, //当前模式不可操作
		{
			value: 0x05,
			description: '密码错误'
		}, //密码错误
	],

	CMDQuerySend: {
		/**
		 * 获取投币机和内胆ID
		 */
		GetID: 0x01,
		/**
		 * 查开箱记录
		 */
		QueryActionDetail: 0x02,
		/**
		 * 查刷卡记录
		 */
		QueryCardRecord: 0x03,
		/**
		 * 查设备信息
		 */
		QueryDeviceInfo: 0x04,
		/**
		 * 查设备状态
		 */
		QueryDeviceStatus: 0x05,
		/**
		 * 查实时状态
		 */
		QueryRealTimeStatus: 0x06,
		/**
		 * 读出记录信息
		 */
		ReadRecord: 0x08
	},

	CMDQueryReceive: [{
			value: 0x00,
			description: '正确'
		}, //正确
		{
			value: 0x01,
			description: 'CRC错误'
		}, //CRC错误
		{
			value: 0x02,
			description: 'CMD错误'
		}, //CMD错误
		{
			value: 0x03,
			description: ''
		},
		{
			value: 0x04,
			description: ''
		}
	],

	DeviceStatus: {
		霍尔故障: 0,
		开状态: 1,
		关状态: 2,
		不在位置: 3
	},

	LedStatus: {
		灭: 0, //白
		亮: 1 //红
	},

	LedDisplay: {
		不亮: 0, //LED不亮（故障错误）灰
		亮红: 1, //LED亮红（有钱胆）
		亮绿: 2, //LED亮绿（空钱胆）
		黄色: 3, //LED黄色（预留）
		亮蓝: 4, //LED亮蓝（预留）
		品红: 5, //LED品红（预留）
		青色: 6, //LED青色（预留）
		白色: 7 //LED白色（传感器校正）
	},

	InfraredStatus: {
		停止工作: 0,
		红外开: 1,
		机构开锁: 2,
		钞箱开箱: 3,
		红外校正: 4
	},

	MotorStatus: {
		停转: 0, //白
		正转: 1, //绿
		反转: 2 //绿
	},

	FaultStatus: {
		正常: 0,
		故障或未检测到: 1
	},

	RealTimeInfState: {
		红外关: 0,
		红外开: 1,
	},

	RealTimeInfStatus: {
		正常: 0,
		有遮挡: 1,
	},

	Photoelectricity: {
		装机失败: 0, //红
		装机完成: 1, //绿
	},

	ShellLockStatus: {
		霍尔故障: 0, //红
		入钞口开: 1, //绿
		入钞口关: 2, //绿
		不在位置: 3, //红
	},

	LockStatus: {
		正常: 0,
		故障: 1,
		在锁状态: 2,
	},

	MotorStateEnum: {
		正常: 0,
		空转: 1,
		堵转: 2,
		故障: 3,
	},
	BoxLockStatus: {
		霍尔故障: 0, //红
		门锁开: 1, //绿
		门锁关: 2, //绿
		不在位: 3, //红
	},

	/**
	 * 反向映射（仅当枚举值是字符串时有效）  
	 * @param {Object} data -枚举对象
	 * @param {Object} value -枚举值
	 */
	GetValueName(data, value) {
		for (const name in data) {
			if (data[name] === value) {
				return name;
			}
		}

		return undefined;
	},
	/**
	 * 按位与计算
	 * @param {Object} data -数据
	 * @param {Object} pos -左移位数
	 */
	GetBitValue(data, pos) {
		if ((data & (1 << pos)) > 0) //按位与之后的结果非0
		{
			console.log('1')
			return 1;
		} else {
			console.log('0')
			return 0;
		}
	},
	/**
	 * 返回由字节数组中指定位置的两个字节转换来的 16 位有符号整数
	 * @param {Object} value -字节数组
	 * @param {Object} startIndex -起始位置
	 */
	ToInt16(value, startIndex) {
		// 确保startIndex是偶数，因为int16占用2个字节  
		if (startIndex % 2 !== 0) {
			throw new Error('startIndex must be an even number');
		}

		// 获取两个字节  
		let byte1 = HexToDecStr(value[startIndex]);
		let byte2 = HexToDecStr(value[startIndex + 1]);

		// 将字节转换为16位整数  
		// 注意：JavaScript的位操作默认是有符号的，因此不需要额外的转换  
		let int16 = (byte1 << 8) | byte2;

		return int16;
	},
	/**
	 * CRC16
	 * @param {Object} data -加密数据
	 * @param {Object} dataLength -数据长度
	 */
	CRC16(data, dataLength) {
		var len = dataLength
		if (len > 0) {
			var crc = 0
			for (var i = 0; i < dataLength; i++) {
				crc = this.UpdateCRC16(crc, data[i]);
			}
			crc = this.UpdateCRC16(crc, 0);
			crc = this.UpdateCRC16(crc, 0);

			var hi = (crc & 0xFF00) >> 8 //高位置
			var lo = crc & 0x00FF //低位置

			return new Uint8Array([hi, lo])
		}
		return new Uint8Array([0, 0])
	},
	UpdateCRC16(crcIn, bytee) {
		var crc = crcIn;
		var ins = bytee | 0x100;

		do {
			crc <<= 1;
			ins <<= 1;
			if ((ins & 0x100) == 0x100) {
				++crc;
			}
			if ((crc & 0x10000) == 0x10000) {
				crc ^= 0x1021;
			}
		}
		while (!((ins & 0x10000) == 0x10000));
		return crc;
	},
	/**
	 * 将指定的 System.String 中的所有字符编码为一个字节序列
	 */
	AsciiGetBytes(component){
		return unescape(encodeURIComponent(component)).split("").map(val => val.charCodeAt())
	},
	GetByteH(data) {
		return ((data & 0xF0) >> 4);
	},
	GetByteL(data) {
		return (data & 0x0F);
	},
	/**
	 * 初始化Js本地变量
	 */
	InitJs(page) {
		// this.BasicInfo = {}
		// this.DeviceInfo = {}
		// this.DeviceStatus = {}
		this.communication_page = page
		this.TestPassword_Bytes = this.AsciiGetBytes(this.TestPassword)
	},
	/**
	 * 封装写入蓝牙并等待回复的函数
	 * @param {Object} cmdType -命令类型
	 * @param {Object} cmdBtye -命令字
	 * @param {Object} data -请求内容
	 */  
	WriteBLEAndWaitForResponse(cmdType, cmdBtye, data = []) {
		var that = this

		return new Promise((resolve, reject) => {
			var isIAP = cmdType == that.CMDTypeSend.IAP //是否为IAP
			var length = 4 + data.length + (isIAP ? 1 : 2) //IAP长度为4+n+1；其它长度为4+n+2

			var buffer = new ArrayBuffer(length)
			var byteArray = new Uint8Array(buffer)
			byteArray[0] = buletoothCommand.Head
			byteArray[1] = buffer.byteLength
			byteArray[2] = cmdType
			byteArray[3] = cmdBtye

			for (var i = 0; i < data.length; i++) {
				byteArray[4 + i] = data[i]
			}

			if (cmdType == that.CMDTypeSend.IAP) {
				console.log('IAP')

				var sumcrc = 0
				byteArray[byteArray.length - 1] = sumcrc
			} else {
				console.log('Query')

				var crc16 = that.CRC16(byteArray, 4 + data.length)
				//反转一下crc16结果，先取1再取0
				byteArray[byteArray.length - 2] = crc16[1]
				byteArray[byteArray.length - 1] = crc16[0]
			}
			
			console.log(that.DeviceId, that.ServiceId, that.CharacteristicId)
			
			uni.writeBLECharacteristicValue({
				deviceId: that.DeviceId,
				serviceId: that.ServiceId,
				characteristicId: that.CharacteristicId,
				value: buffer,
				success: (res) => {
					console.log('写入数据成功', res, Date.now())

					// 监听特征值变化以等待回复  
					const listener = (result) => {
						console.log('收到蓝牙设备回复:', result)
						if (result.deviceId === that.DeviceId && result.serviceId ===
							that.ServiceId && result.characteristicId.indexOf('0000FFF1') >= 0) {
							console.log('收到蓝牙设备回复:', result.value)
							// 取消监听特征值变化  
							uni.offBLECharacteristicValueChange(function(res) {}, listener)
							
							var responseResult = that.ResponseHanding(cmdType, cmdBtye, result.value)
							resolve(responseResult)
						}
					}

					uni.onBLECharacteristicValueChange(listener)
				},
				fail: (err) => {
					reject(err)
					console.log('写入失败', err)
				}
			})
		})
	},
	/**
	 * 处理响应结果
	 * @param {Object} data --蓝牙回复内容
	 */
	ResponseHanding(cmdType, cmdBtye, data){
		var that = this
		var responseResult = {
			Status: false,
			Message: '',
			Data: null
		}
		
		// 解析回复数据并进行下一步操作
		var hex = ArrayBufferToHex(data)
		var hexArr = SplitHexString(hex)
		if (hexArr.length <= 0) {
			that.ReceiveResult.Description = 'hexArr为空'
			return
		}
		
		//处理回应信息
		var cmdTypeReceive = parseInt(hexArr[2])
		var cmdStateReceive = parseInt(hexArr[3])
		
		if (cmdType == that.CMDTypeSend.IAP) {
			console.log('IAP', cmdBtye)
		
			if (cmdTypeReceive == that.CMDTypeReceive.ACK) {
				responseResult.Status = true
				responseResult.Message = '正确'
		
				switch (cmdBtye) {
					case that.CMDIAPSend.EraseProgram:
						break
					case that.CMDIAPSend.UploadProgram:
						break
					case that.CMDIAPSend.ReadIAPVersion:
						break
					case that.CMDIAPSend.Read128Byte:
						break
				}
			} else if (cmdTypeReceive == that.CMDTypeReceive.NCK) {
				responseResult.Message.Description = that.CMDIAPReceive.filter(item => parseInt(item
					.value) == cmdStateReceive)[0].description
			} else if (cmdTypeReceive == that.CMDTypeReceive.CNC) {
				responseResult.Message.Description = '上一帧命令未完成'
			}
		} else if (cmdType == that.CMDTypeSend.Query) {
			console.log('Query', cmdBtye)
		
			if (cmdTypeReceive == that.CMDTypeReceive.ACK) {
				responseResult.Status = true
				responseResult.Message = '正确'
		
				switch (cmdBtye) {
					case that.CMDQuerySend.GetID:
						responseResult.Data = that.GetID(hexArr)
						break
					case that.CMDQuerySend.QueryDeviceInfo:
						responseResult.Data = that.QueryDeviceInfo(hexArr)
						break
					case that.CMDQuerySend.QueryDeviceStatus:
						responseResult.Data = that.QueryDeviceStatus(hexArr)
						break
					case that.CMDQuerySend.QueryRealTimeStatus:
						responseResult.Data = that.QueryRealTimeStatus(hexArr)
						break
				}
			} else if (cmdTypeReceive == that.CMDTypeReceive.NCK) {
				responseResult.Message = that.CMDQueryReceive.filter(item => parseInt(item
					.value) == cmdStateReceive)[0].description
			} else if (cmdTypeReceive == that.CMDTypeReceive.CNC) {
				responseResult.Message = '上一帧命令未完成'
			}
		} else if (cmdType == that.CMDTypeSend.Control) {
			console.log('Control', cmdBtye)
		
			if (cmdTypeReceive == that.CMDTypeReceive.ACK) {
				if (cmdStateReceive == 0) {
					responseResult.Status = true
					responseResult.Message = '正确'
				} else {
					responseResult.Message = '操作失败'
					resolve(responseResult)
				}
		
				switch (cmdBtye) {
					case that.CMDControlSend.FareBoxLock:
						responseResult.Data = that.FareBoxLock(hexArr)
						break
					case that.CMDControlSend.FareBoxUnLock:
						responseResult.Data = that.FareBoxUnLock(hexArr)
						break
					case that.CMDControlSend.FBInnerLock:
						responseResult.Data = that.FBInnerLock(hexArr)
						break
					case that.CMDControlSend.FBInnerUnLock:
						responseResult.Data = that.FBInnerUnLock(hexArr)
						break
					case that.CMDControlSend.FBCoinInsert:
						responseResult.Data = that.FBCoinInsert(hexArr)
						break
					case that.CMDControlSend.FBCoinReturn:
						responseResult.Data = that.FBCoinReturn(hexArr)
						break
					case that.CMDControlSend.InfraredCorrection:
						responseResult.Data = that.InfraredCorrection(hexArr)
						break
					case that.CMDControlSend.LedDisplay:
						break
					case that.CMDControlSend.WriteRecord:
						responseResult.Data = that.WriteRecord(hexArr)
						break
					case that.CMDControlSend.ClearRecord:
						break
				}
			} else if (cmdTypeReceive == that.CMDTypeReceive.NCK) {
				responseResult.Message = that.CMDControlReceive.filter(item => parseInt(item
					.value) == cmdStateReceive)[0].description
			} else if (cmdTypeReceive == that.CMDTypeReceive.CNC) {
				responseResult.Message = '上一帧命令未完成'
			}
		}
		
		return responseResult
	},
	// /**
	//  * 蓝牙通信统一方法
	//  * @param {Object} cmdType -加密数据
	//  * @param {Object} cmdBtye -数据长度
	//  * @param {Object} data -请求内容
	//  */
	// SendCommand(cmdType, cmdBtye, data = []) {
	// 	if (!this.DeviceId) {
	// 		return '错误：无指定蓝牙设备'
	// 	}

	// 	var index = this.CommandList.findIndex(item => item.CMDType == cmdType && item.CMDBtye == cmdBtye)
	// 	if (index >= 0) {
	// 		var nowTime = Date.now()
	// 		var span = nowTime - this.CommandList[index].CommandTime
	// 		console.log('请求时间差', span)
	// 		if (span > 1500) {
	// 			this.CommandList.splice(index, 1)
	// 		} else {
	// 			return
	// 		}
	// 	}

	// 	this.CommandList.push({
	// 		'CMDType': cmdType,
	// 		'CMDBtye': cmdBtye,
	// 		'CommandTime': Date.now()
	// 	})
	// 	console.log('添加请求项-----------------', this.CommandList)

	// 	var isIAP = cmdType == this.CMDTypeSend.IAP //是否为IAP
	// 	var length = 4 + data.length + (isIAP ? 1 : 2) //IAP长度为4+n+1；其它长度为4+n+2

	// 	var buffer = new ArrayBuffer(length)
	// 	var byteArray = new Uint8Array(buffer)
	// 	byteArray[0] = buletoothCommand.Head
	// 	byteArray[1] = buffer.byteLength
	// 	byteArray[2] = cmdType
	// 	byteArray[3] = cmdBtye

	// 	for (var i = 0; i < data.length; i++) {
	// 		byteArray[4 + i] = data[i]
	// 	}

	// 	if (cmdType == this.CMDTypeSend.IAP) {
	// 		console.log('IAP')

	// 		var sumcrc = 0
	// 		byteArray[byteArray.length - 1] = sumcrc
	// 	} else {
	// 		console.log('Query')

	// 		var crc16 = this.CRC16(byteArray, 4 + data.length)
	// 		//反转一下crc16结果，先取1再取0
	// 		byteArray[byteArray.length - 2] = crc16[1]
	// 		byteArray[byteArray.length - 1] = crc16[0]
	// 	}

	// 	return new Promise((resolve, reject) => {
	// 		uni.writeBLECharacteristicValue({
	// 			deviceId: this.DeviceId,
	// 			serviceId: this.ServiceId,
	// 			characteristicId: this.CharacteristicId,
	// 			value: buffer,
	// 			success: (res) => {
	// 				resolve(res)
	// 				console.log('写入数据成功', res, Date.now())
	// 			},
	// 			fail: (err) => {
	// 				reject(err)
	// 				console.log('写入失败', err)
	// 			}
	// 		})
	// 	})

	// 	//Sleep(500)
	// },

	ReceiveResult: {},

	// /**
	//  * 监听蓝牙低功耗设备的特征值变化事件
	//  */
	// BLECharacteristicValueChange() {
	// 	var that = this
	// 	uni.onBLECharacteristicValueChange(function(characteristic) {
	// 		console.log('特征值变化', characteristic)

	// 		if (characteristic.characteristicId.indexOf('0000FFF3') >= 0) {
	// 			const length = (ArrayBufferToHex(characteristic.value)).length
	// 			const value = ArrayBufferToHex(characteristic.value)

	// 			if (value.slice(0, 2) == "88" && (length / 2) == 7) { //状态

	// 				const part = that.hexToBin(value.substr(8, 2))
	// 				const sixPart = that.hexToBin(value.substr(10, 2))

	// 				var writeFlag = part & 0x04 ? false : true

	// 				console.log('监听特征值变化FFF3', part, sixPart, writeFlag)

	// 				if (part.substr(6, 1) == 1) { //modem状态有效，更新
	// 					var t = parseInt(sixPart, 2)
	// 					var flag1 = t & 0x80 ? t & 0x80 : 0
	// 					var flag2 = t & 0x40 ? t & 0x40 : 0
	// 					var flag3 = t & 0x20 ? t & 0x20 : 0
	// 					var flag4 = t & 0x10 ? t & 0x10 : 0

	// 					console.log('监听特征值变化FFF3', flag1, flag2, flag3, flag4)
	// 				}
	// 			} else if (value.slice(0, 2) == "87" && (length / 2) == 8) { //flow
	// 				var flag = parseInt(value.substr(8, 2), 16)
	// 				var flow = flag ? '开' : '关'

	// 				console.log('监听特征值变化FFF3', flag, flow)
	// 			}

	// 		}

	// 		if (characteristic.characteristicId.indexOf('0000FFF1') >= 0) {
	// 			console.log('数据回复', Date.now())

	// 			if (that.CommandList.length <= 0) {
	// 				console.log('无请求数据')
	// 				return
	// 			}

	// 			var cmd = that.CommandList[0]
	// 			that.CommandList.shift()

	// 			console.log('移除请求项-----------------', that.CommandList)

	// 			var hex = ArrayBufferToHex(characteristic.value)
	// 			console.log('监听特征值变化FFF1(16进制)', hex)

	// 			that.ReceiveResult.CMDType = parseInt(cmd.CMDType)
	// 			that.ReceiveResult.CMDBtye = parseInt(cmd.CMDBtye)
	// 			that.ReceiveResult.HexData = hex

	// 			var hexArr = SplitHexString(hex)

	// 			if (hexArr.length <= 0) {
	// 				that.ReceiveResult.Description = 'hexArr为空'
	// 				return
	// 			}

	// 			//处理回应信息
	// 			var cmdTypeReceive = parseInt(hexArr[2])
	// 			var cmdStateReceive = parseInt(hexArr[3])

	// 			that.ReceiveResult.CMDTypeReceive = cmdTypeReceive
	// 			that.ReceiveResult.CMDStateReceive = cmdStateReceive

	// 			if (cmd.CMDType == that.CMDTypeSend.IAP) {
	// 				console.log('IAP', cmd.CMDBtye)

	// 				if (cmdTypeReceive == that.CMDTypeReceive.ACK) {
	// 					that.ReceiveResult.Description = '正确'

	// 					switch (cmd.CMDBtye) {
	// 						case that.CMDIAPSend.EraseProgram:
	// 							break
	// 						case that.CMDIAPSend.UploadProgram:
	// 							break
	// 						case that.CMDIAPSend.ReadIAPVersion:
	// 							break
	// 						case that.CMDIAPSend.Read128Byte:
	// 							break
	// 					}
	// 				} else if (cmdTypeReceive == that.CMDTypeReceive.NCK) {
	// 					that.ReceiveResult.Description = that.CMDIAPReceive.filter(item => parseInt(item
	// 						.value) == cmdStateReceive)[0].description
	// 				} else if (cmdTypeReceive == that.CMDTypeReceive.CNC) {
	// 					that.ReceiveResult.Description = '上一帧命令未完成'
	// 				}
	// 			} else if (cmd.CMDType == that.CMDTypeSend.Query) {
	// 				console.log('Query', cmd.CMDBtye)

	// 				if (cmdTypeReceive == that.CMDTypeReceive.ACK) {
	// 					that.ReceiveResult.Description = '正确'

	// 					switch (cmd.CMDBtye) {
	// 						case that.CMDQuerySend.GetID:
	// 							that.GetID(hexArr)
	// 							break
	// 						case that.CMDQuerySend.QueryDeviceInfo:
	// 							that.QueryDeviceInfo(hexArr)
	// 							break
	// 						case that.CMDQuerySend.QueryDeviceStatus:
	// 							that.QueryDeviceStatus(hexArr)
	// 							break
	// 						case that.CMDQuerySend.QueryRealTimeStatus:
	// 							that.QueryRealTimeStatus(hexArr)
	// 							break
	// 					}
	// 				} else if (cmdTypeReceive == that.CMDTypeReceive.NCK) {
	// 					that.ReceiveResult.Description = that.CMDQueryReceive.filter(item => parseInt(item
	// 						.value) == cmdStateReceive)[0].description
	// 				} else if (cmdTypeReceive == that.CMDTypeReceive.CNC) {
	// 					that.ReceiveResult.Description = '上一帧命令未完成'
	// 				}
	// 			} else if (cmd.CMDType == that.CMDTypeSend.Control) {
	// 				console.log('Control', cmd.CMDBtye)

	// 				if (cmdTypeReceive == that.CMDTypeReceive.ACK) {
	// 					if (cmdStateReceive == 0) {
	// 						that.ReceiveResult.Description = '正确'
	// 					} else {
	// 						that.ReceiveResult.Description = '操作失败'
	// 					}

	// 					switch (cmd.CMDBtye) {
	// 						case that.CMDControlSend.FareBoxLock:
	// 							that.FareBoxLock(hexArr)
	// 							break
	// 						case that.CMDControlSend.FareBoxUnLock:
	// 							that.FareBoxUnLock(hexArr)
	// 							break
	// 						case that.CMDControlSend.FBInnerLock:
	// 							that.FBInnerLock(hexArr)
	// 							break
	// 						case that.CMDControlSend.FBInnerUnLock:
	// 							that.FBInnerUnLock(hexArr)
	// 							break
	// 						case that.CMDControlSend.FBCoinInsert:
	// 							that.FBCoinInsert(hexArr)
	// 							break
	// 						case that.CMDControlSend.FBCoinReturn:
	// 							that.FBCoinReturn(hexArr)
	// 							break
	// 						case that.CMDControlSend.InfraredCorrection:
	// 							that.InfraredCorrection(hexArr)
	// 							break
	// 						case that.CMDControlSend.LedDisplay:
	// 							break
	// 						case that.CMDControlSend.WriteRecord:
	// 							break
	// 						case that.CMDControlSend.ClearRecord:
	// 							break
	// 					}
	// 				} else if (cmdTypeReceive == that.CMDTypeReceive.NCK) {
	// 					that.ReceiveResult.Description = that.CMDControlReceive.filter(item => parseInt(item
	// 						.value) == cmdStateReceive)[0].description
	// 				} else if (cmdTypeReceive == that.CMDTypeReceive.CNC) {
	// 					that.ReceiveResult.Description = '上一帧命令未完成'
	// 				}
	// 			}

	// 			that.communication_page.receiveResult = that.ReceiveResult
	// 		}
	// 	})
	// },
	/**
	 * 16进制转2进制
	 * @param {Object} str
	 */
	hexToBin(str) {
		let hex_array = [{
				key: 0,
				val: "0000"
			}, {
				key: 1,
				val: "0001"
			}, {
				key: 2,
				val: "0010"
			}, {
				key: 3,
				val: "0011"
			}, {
				key: 4,
				val: "0100"
			}, {
				key: 5,
				val: "0101"
			}, {
				key: 6,
				val: "0110"
			}, {
				key: 7,
				val: "0111"
			},
			{
				key: 8,
				val: "1000"
			}, {
				key: 9,
				val: "1001"
			}, {
				key: 'a',
				val: "1010"
			}, {
				key: 'b',
				val: "1011"
			}, {
				key: 'c',
				val: "1100"
			}, {
				key: 'd',
				val: "1101"
			}, {
				key: 'e',
				val: "1110"
			}, {
				key: 'f',
				val: "1111"
			}
		]

		let value = ""
		for (let i = 0; i < str.length; i++) {
			for (let j = 0; j < hex_array.length; j++) {
				if (str.charAt(i).toLowerCase() == hex_array[j].key) {
					value = value.concat(hex_array[j].val)
					break
				}
			}
		}
		// console.log(value)
		return value
	},
	communication_page: null,
	BasicInfo: {},

	/**
	 * 获取投币机和内胆ID
	 * @param {Object} data
	 */
	GetID(hexArr) {
		this.BasicInfo = {}
		// var result = {
		// 	ShellId: '',
		// 	BoxId: ''
		// }

		console.log('GetID-hexArr', hexArr)
		
		var shellIdHex = hexArr.slice(5, 9).join('')
		var boxIdHex = hexArr.slice(8, -2).join('')

		this.BasicInfo.ShellId = '外箱ID：' + HexToDecStr(shellIdHex)
		this.BasicInfo.BoxId = '内胆ID：' + HexToDecStr(boxIdHex)

		// if (this.communication_page) {
		// 	this.communication_page.basicInfo = this.BasicInfo
		// }

		console.log('GetID', this.BasicInfo)
		
		return this.BasicInfo
	},

	DeviceInfo: {},

	/**
	 * 查设备信息
	 * @param {Object} data
	 */
	QueryDeviceInfo(hexArr) {
		this.DeviceInfo = {}

		//data.substring(8, data.length - 6)
		var arr = hexArr.slice(5, -3).join('').split('00')
		console.log('拆分数组', arr)
		if (arr && arr.length > 3) {
			//设备名称
			this.DeviceInfo.DeviceName = HexToString(arr[0])
			//硬件版本
			this.DeviceInfo.VWVersion = HexToString(arr[1])
			//软件版本
			this.DeviceInfo.SWVersion = HexToString(arr[2])
			//生成日期
			this.DeviceInfo.BuildDate = HexToString(arr[3])
		}

		//this.communication_page.deviceInfo = this.DeviceInfo
		console.log('QueryDeviceInfo', this.DeviceInfo)
		
		return this.DeviceInfo
	},

	DeviceStatus: {},

	/**
	 * 查设备状态
	 * @param {Object} data
	 */
	QueryDeviceStatus(hexArr) {
		this.DeviceStatus = {}
		// var result = {
		// 	ShellStatus: '', //机构状态
		// 	BoxStatus: '', //内胆状态
		// 	LED_BoxDoor: '', //箱门LED状态
		// 	LED_Mechanism: '', //机构锁LED状态
		// 	LED_Fault: '', //故障LED状态
		// 	LED_BoxFull: '', //钞箱满LED状态
		// 	LED_BackLight: '', //背光显示
		// 	IRStatus: '', //红外状态
		// 	DutyCycle: '', //占空比
		// 	IROffVoltage: '', //红外关电压（mV）
		// 	IROnVoltage: '', //红外开电压（mV）
		// 	DValue: '', //比较压差值
		// 	CashInputMotor: '', //入钞电机
		// 	AverageCurrent: '', //平均电流
		// 	Speed: '', //转速(<600为停转)
		// 	HallCounting: '', //入钞电机霍尔计数
		// 	InputCount: '', //投入计数		
		// 	BanknoteBoxMotorStatus: '', //钞箱电机状态
		// 	MechanismMotorStatus: '', //机构电机状态
		// 	CashInputMotorStatus: '', //入钞电机状态
		// 	InfraredState: '', //红外状态
		// 	CashEntryStatus: '', //入钞口状态
		// 	CoinMachineIDStatus: '', //投币机ID状态
		// 	InnerLinerIDStatus: '', //内胆ID状态
		// 	BanknoteBoxFullStatus: '', //钞箱满状态
		// 	Message: '' //返回信息
		// }

		//ArrayBuffer转16进制
		//var hex = ArrayBufferToHex(data)

		//console.log('QueryDeviceStatus-data', data)

		//var hexArr = SplitHexString(data)
		console.log('QueryDeviceStatus-hexArr', hexArr)

		// if (hexArr.length > 0) {
		// 	if (parseInt(hexArr[2]) == this.CMDTypeReceive.ACK) {
		// 		if (parseInt(hexArr[3]) == this.CMDQueryReceive.Correct) {
		this.DeviceStatus.ShellStatus = this.GetValueName(this.DeviceStatus, parseInt(hexArr[4]))
		this.DeviceStatus.BoxStatus = this.GetValueName(this.DeviceStatus, parseInt(hexArr[5]))
		//LED
		this.DeviceStatus.LED_BoxDoor = this.GetValueName(this.LedStatus, this.GetBitValue(hexArr[6],
			1)) //箱门LED状态
		this.DeviceStatus.LED_Mechanism = this.GetValueName(this.LedStatus, this.GetBitValue(hexArr[6],
			2)) //机构锁LED状态
		this.DeviceStatus.LED_Fault = this.GetValueName(this.LedStatus, this.GetBitValue(hexArr[6],
			3)) //故障LED状态
		this.DeviceStatus.LED_BoxFull = this.GetValueName(this.LedStatus, this.GetBitValue(hexArr[6],
			4)) //钞箱满LED状态
		this.DeviceStatus.LED_BackLight = this.GetValueName(this.LedDisplay, ((parseInt(hexArr[6], 16) &
				0xE0) >>
			5)) //背光显示

		//红外
		this.DeviceStatus.IRStatus = this.GetValueName(this.InfraredStatus, parseInt(hexArr[7]))
		//占空比
		this.DeviceStatus.DutyCycle = parseInt(hexArr[8]) + '%'
		//红外关电压（mV）
		this.DeviceStatus.IROffVoltage = this.ToInt16(new Uint8Array([hexArr[9], hexArr[10]]), 0)
		//红外开电压（mV）
		this.DeviceStatus.IROnVoltage = this.ToInt16(new Uint8Array([hexArr[11], hexArr[12]]), 0)
		//比较压差值
		this.DeviceStatus.DValue = this.ToInt16(new Uint8Array([hexArr[13], hexArr[14]]), 0)
		//入钞电机
		this.DeviceStatus.CashInputMotor = this.GetValueName(this.MotorStatus, hexArr[15])
		//平均电流
		this.DeviceStatus.AverageCurrent = this.ToInt16(new Uint8Array([hexArr[16], hexArr[17]]), 0)
		//转速(<600为停转)
		this.DeviceStatus.Speed = this.ToInt16(new Uint8Array([hexArr[18], hexArr[19]]), 0)
		//入钞电机霍尔计数
		this.DeviceStatus.HallCounting = this.ToInt16(new Uint8Array([hexArr[20], hexArr[21]]), 0)
		//投入计数
		this.DeviceStatus.InputCount = this.ToInt16(new Uint8Array([hexArr[22], hexArr[23]]), 0)
		//故障
		this.DeviceStatus.BanknoteBoxMotorStatus = this.GetValueName(this.FaultStatus, this.GetBitValue(
			hexArr[24],
			0))
		this.DeviceStatus.MechanismMotorStatus = this.GetValueName(this.FaultStatus, this.GetBitValue(
			hexArr[24],
			1))
		this.DeviceStatus.CashInputMotorStatus = this.GetValueName(this.FaultStatus, this.GetBitValue(
			hexArr[24],
			2))
		this.DeviceStatus.InfraredState = this.GetValueName(this.FaultStatus, this.GetBitValue(hexArr[
			24], 3))
		this.DeviceStatus.CashEntryStatus = this.GetValueName(this.FaultStatus, this.GetBitValue(hexArr[
			24], 4))
		this.DeviceStatus.CoinMachineIDStatus = this.GetValueName(this.FaultStatus, this.GetBitValue(
			hexArr[24],
			5))
		this.DeviceStatus.InnerLinerIDStatus = this.GetValueName(this.FaultStatus, this.GetBitValue(
			hexArr[24], 6))
		this.DeviceStatus.BanknoteBoxFullStatus = this.GetValueName(this.FaultStatus, this.GetBitValue(
			hexArr[24],
			7))
		// 		} else {
		// 			this.DeviceStatus.Message = '参数错误' + hexArr[3]
		// 		}
		// 	} else {
		// 		this.DeviceStatus.Message = '请求失败' + hexArr[2]
		// 	}
		// }

		console.log('QueryDeviceStatus', this.DeviceStatus)
		return this.DeviceStatus
	},

	DeviceRealTimeStatus: {},
	IsTest: false,

	/**
	 * 查看设备实时状态
	 * @param {Object} data
	 */
	QueryRealTimeStatus(hexArr) {
		this.DeviceRealTimeStatus = {}
		//console.log('QueryRealTimeStatus-data', data)

		//var hexArr = SplitHexString(data)
		console.log('QueryRealTimeStatus-hexArr', hexArr)

		// if (hexArr.length > 0) {
		// 	if (parseInt(hexArr[2]) == this.CMDTypeReceive.ACK) {
		// 		if (parseInt(hexArr[3]) == this.CMDQueryReceive) {

		this.DeviceRealTimeStatus.Data = hexArr.join(',')

		if (this.IsTest) {
			console.log('测试-实时状态')
			this.DeviceRealTimeStatus.ShellLockStatus = this.GetByteL(hexArr[7])
			this.DeviceRealTimeStatus.BoxLockStatus = this.GetByteL(hexArr[8])

			//this.communication_page.test_DeviceRealTimeStatus = this.DeviceRealTimeStatus
		} else {
			console.log('实时状态')
			this.DeviceRealTimeStatus.InfraredState = this.GetValueName(this.RealTimeInfState, this
				.GetByteH(parseInt(hexArr[4], 16)))
			this.DeviceRealTimeStatus.InfraredState_BackColor = this.DeviceRealTimeStatus.InfraredState == '红外开' ?
				'#00FF00' : '#FF0000'

			this.DeviceRealTimeStatus.InfraredStatus = this.GetValueName(this.RealTimeInfStatus, this
				.GetByteL('0x' + hexArr[4]))
			this.DeviceRealTimeStatus.InfraredStatus_BackColor = this.DeviceRealTimeStatus.InfraredStatus == '正常' ?
				'#00FF00' : '#FF0000'

			this.DeviceRealTimeStatus.PhotoelectricityStatus = this.GetValueName(this.Photoelectricity,
				parseInt(hexArr[5]))
			this.DeviceRealTimeStatus.PhotoelectricityStatus_BackColor = this.DeviceRealTimeStatus
				.PhotoelectricityStatus == '装机完成' ? '#00FF00' : '#FF0000'

			this.DeviceRealTimeStatus.MotorStatus = this.GetValueName(this.MotorStatus, this.GetByteH(
				hexArr[6]))
			this.DeviceRealTimeStatus.MotorStatus_BackColor = this.DeviceRealTimeStatus
				.MotorStatus == '停转' ? '#FFFFFF' : '#00FF00'

			this.DeviceRealTimeStatus.ShellMotorState = this.GetValueName(this.MotorStatus, this.GetByteH(
				hexArr[7]))
			this.DeviceRealTimeStatus.ShellMotorState_BackColor = this.DeviceRealTimeStatus.ShellMotorState ==
				'停转' ?
				'#FFFFFF' : '#00FF00'

			this.DeviceRealTimeStatus.ShellMotorStatus = this.GetValueName(this.ShellLockStatus, this.GetByteL(
				hexArr[7]))
			this.DeviceRealTimeStatus.ShellMotorStatus_BackColor =
				this.DeviceRealTimeStatus.ShellMotorStatus == '入钞口开' ||
				this.DeviceRealTimeStatus.ShellMotorStatus == '入钞口关' ? '#00FF00' : '#FF0000'

			this.DeviceRealTimeStatus.BoxMotorState = this.GetValueName(this.MotorStatus, this.GetByteH(
				hexArr[8]))
			this.DeviceRealTimeStatus.BoxMotorState_BackColor = this.DeviceRealTimeStatus
				.BoxMotorState == '停转' ? '#FFFFFF' : '#00FF00'

			this.DeviceRealTimeStatus.BoxMotorStatus = this.GetValueName(this.BoxLockStatus, this.GetByteL(
				hexArr[8]))
			this.DeviceRealTimeStatus.BoxMotorStatus_BackColor =
				this.DeviceRealTimeStatus.BoxMotorStatus == '门锁开' ||
				this.DeviceRealTimeStatus.BoxMotorStatus == '门锁关' ? '#00FF00' : '#FF0000'

			this.DeviceRealTimeStatus.ShellLockLed = this.GetValueName(this.LedStatus, this.GetBitValue(
				hexArr[9], 1))
			this.DeviceRealTimeStatus.ShellLockLed_BackColor = this.DeviceRealTimeStatus.ShellLockLed == '灭' ?
				'#FFFFFF' : '#FF0000'

			this.DeviceRealTimeStatus.MotorLockLed = this.GetValueName(this.LedStatus, this.GetBitValue(
				hexArr[9], 2))
			this.DeviceRealTimeStatus.MotorLockLed_BackColor = this.DeviceRealTimeStatus.MotorLockLed == '灭' ?
				'#FFFFFF' : '#FF0000'

			this.DeviceRealTimeStatus.FaultLed = this.GetValueName(this.LedStatus, this.GetBitValue(hexArr[
				9], 3))
			this.DeviceRealTimeStatus.FaultLed_BackColor = this.DeviceRealTimeStatus.FaultLed == '灭' ?
				'#FFFFFF' : '#FF0000'

			this.DeviceRealTimeStatus.ShellFullLed = this.GetValueName(this.LedStatus, this.GetBitValue(
				hexArr[9], 4))
			this.DeviceRealTimeStatus.ShellFullLed_BackColor = this.DeviceRealTimeStatus.ShellFullLed == '灭' ?
				'#FFFFFF' : '#FF0000'

			this.DeviceRealTimeStatus.BacklightLed = this.GetValueName(this.LedDisplay, ((parseInt(hexArr[
				9], 16) & 0xE0) >> 5))
			var backlightLed_BackColor = ''
			switch (this.DeviceRealTimeStatus.BacklightLed) {
				case '不亮':
					backlightLed_BackColor = '#D3D3D3'
					break;
				case '亮红':
					backlightLed_BackColor = '#FF0000'
					break;
				case '亮绿':
					backlightLed_BackColor = '#00FF00'
					break;
				case '黄色':
					backlightLed_BackColor = '#FFFF00'
					break;
				case '亮蓝':
					backlightLed_BackColor = '#0000FF'
					break;
				case '品红':
					backlightLed_BackColor = '#FF00FF'
					break;
				case '青色':
					backlightLed_BackColor = '#00FFFF'
					break;
				case '白色':
					backlightLed_BackColor = '#FFFFFF'
					break;
			}
			this.DeviceRealTimeStatus.BacklightLed_BackColor = backlightLed_BackColor

			//this.communication_page.deviceRealTimeStatus = this.DeviceRealTimeStatus
		}

		// 		}
		// 	}
		// }

		console.log('QueryRealTimeStatus', this.DeviceRealTimeStatus)
		return this.DeviceRealTimeStatus
	},

	FBInnerLockInfo: {},

	/**
	 * 机构锁
	 * @param {Object} data
	 */
	FBInnerLock(hexArr) {
		this.FBInnerLockInfo = {}

		//console.log('FBInnerLock-data', data)

		//var hexArr = SplitHexString(data)
		console.log('FBInnerLock-hexArr', hexArr)
		// if (hexArr.length > 0) {
		// 	if (parseInt(hexArr[2]) == this.CMDTypeReceive.ACK) {
		// 		if (parseInt(hexArr[3]) == this.CMDQueryReceive.Correct) {
		this.FBInnerLockInfo.State = this.GetValueName(this.LockStatus, this.GetByteH(hexArr[4]))
		this.FBInnerLockInfo.State_BackColor = this.FBInnerLockInfo.State == '正常' ? '	#00FF00' : '#FF0000'
		this.FBInnerLockInfo.Status = this.GetValueName(this.ShellLockStatus, this.GetByteL(hexArr[4]))
		this.FBInnerLockInfo.Status_BackColor = this.FBInnerLockInfo.Status == '入钞口开' || this.FBInnerLockInfo
			.Status == '入钞口关' ? '#00FF00' : '#FF0000'
		// 		}
		// 	}
		// }

		this.FBInnerLockInfo.Data = hexArr.join(',')

		//this.communication_page.fbInnerLockInfo = this.FBInnerLockInfo
		return this.FBInnerLockInfo
	},
	FBInnerUnLockInfo: {},

	/**
	 * 机构解锁
	 * @param {Object} data
	 */
	FBInnerUnLock(hexArr) {
		this.FBInnerUnLockInfo = {}

		//console.log('FBInnerUnlock-data', data)

		//var hexArr = SplitHexString(data)
		console.log('FBInnerUnlock-hexArr', hexArr)
		// if (hexArr.length > 0) {
		// 	if (parseInt(hexArr[2]) == this.CMDTypeReceive.ACK) {
		// 		if (parseInt(hexArr[3]) == this.CMDQueryReceive.Correct) {
		this.FBInnerUnLockInfo.State = this.GetValueName(this.LockStatus, this.GetByteH(hexArr[4]))
		this.FBInnerUnLockInfo.State_BackColor = this.FBInnerUnLockInfo.State == '正常' ? '	#00FF00' : '#FF0000'
		this.FBInnerUnLockInfo.Status = this.GetValueName(this.ShellLockStatus, this.GetByteL(hexArr[
			4]))
		this.FBInnerUnLockInfo.Status_BackColor = this.FBInnerUnLockInfo.Status == '入钞口开' || this.FBInnerUnLockInfo
			.Status == '入钞口关' ? '#00FF00' : '#FF0000'
		// 		}
		// 	}
		// }

		this.FBInnerUnLockInfo.Data = hexArr.join(',')

		//this.communication_page.fbInnerUnLockInfo = this.FBInnerUnLockInfo
		return this.FBInnerUnLockInfo
	},
	FareBoxLockInfo: {},
	/**
	 * 内胆锁
	 * @param {Object} data
	 */
	FareBoxLock(hexArr) {
		this.FareBoxLockInfo = {}

		//console.log('FareBoxLock-data', data)

		//var hexArr = SplitHexString(data)
		console.log('FareBoxLock-hexArr', hexArr)
		// if (hexArr.length > 0) {
		// 	if (parseInt(hexArr[2]) == this.CMDTypeReceive.ACK) {
		// 		if (parseInt(hexArr[3]) == this.CMDQueryReceive.Correct) {
		this.FareBoxLockInfo.State = this.GetValueName(this.LockStatus, this.GetByteH(hexArr[4]))
		this.FareBoxLockInfo.State_BackColor = this.FareBoxLockInfo.State == '正常' ? '	#00FF00' : '#FF0000'
		this.FareBoxLockInfo.Status = this.GetValueName(this.BoxLockStatus, this.GetByteL(hexArr[4]))
		this.FareBoxLockInfo.Status_BackColor = this.FareBoxLockInfo.Status == '门锁开' || this.FareBoxLockInfo
			.Status == '门锁关' ? '#00FF00' : '#FF0000'
		// 		}
		// 	}
		// }

		this.FareBoxLockInfo.Data = hexArr.join(',')

		//this.communication_page.fareBoxLockInfo = this.FareBoxLockInfo
		return this.FareBoxLockInfo
	},
	FareBoxUnLockInfo: {},
	/**
	 * 内胆解锁
	 * @param {Object} data
	 */
	FareBoxUnLock(hexArr) {
		this.FareBoxUnLockInfo = {}

		//console.log('FareBoxUnLock-data', data)

		//var hexArr = SplitHexString(data)
		console.log('FareBoxUnLock-hexArr', hexArr)
		// if (hexArr.length > 0) {
		// 	if (parseInt(hexArr[2]) == this.CMDTypeReceive.ACK) {
		// 		if (parseInt(hexArr[3]) == this.CMDQueryReceive.Correct) {
		this.FareBoxUnLockInfo.State = this.GetValueName(this.LockStatus, this.GetByteH(hexArr[4]))
		this.FareBoxUnLockInfo.State_BackColor = this.FareBoxUnLockInfo.State == '正常' ? '	#00FF00' : '#FF0000'
		this.FareBoxUnLockInfo.Status = this.GetValueName(this.BoxLockStatus, this.GetByteL(hexArr[
			4]))
		this.FareBoxUnLockInfo.Status_BackColor = this.FareBoxUnLockInfo.Status == '门锁开' || this.FareBoxUnLockInfo
			.Status == '门锁关' ? '#00FF00' : '#FF0000'
		// 		}
		// 	}
		// }

		this.FareBoxUnLockInfo.Data = hexArr.join(',')

		//this.communication_page.fareBoxUnLockInfo = this.FareBoxUnLockInfo
		return this.FareBoxUnLockInfo
	},
	FBCoinInsertInfo: {},
	/**
	 * 电机入钞
	 * @param {Object} data
	 */
	FBCoinInsert(hexArr) {
		this.FBCoinInsertInfo = {}

		//console.log('FBCoinInsert-data', data)

		//var hexArr = SplitHexString(data)
		console.log('FBCoinInsert-hexArr', hexArr)
		// if (hexArr.length > 0) {
		// 	if (parseInt(hexArr[2]) == this.CMDTypeReceive.ACK) {
		// 		if (parseInt(hexArr[3]) == this.CMDQueryReceive.Correct) {
		this.FBCoinInsertInfo.AvgCurrent = '平均电流：' + this.ToInt16(new Uint8Array([hexArr[4], hexArr[5]]), 0) + 'mA'
		this.FBCoinInsertInfo.AvgCurrent_BackColor = '#00FF00'

		this.FBCoinInsertInfo.Speed = '转速：' + this.ToInt16(new Uint8Array([hexArr[6], hexArr[7]]), 0) + '转/分'
		this.FBCoinInsertInfo.Speed_BackColor = this.FBCoinInsertInfo.Speed < 600 ? '#FF0000' : '#00FF00'

		this.FBCoinInsertInfo.Hall = 'Hall数：' + this.ToInt16(new Uint8Array([hexArr[8], hexArr[9]]), 0)
		this.FBCoinInsertInfo.Hall_BackColor = '#00FF00'

		var motorState = this.GetValueName(this.MotorStateEnum, parseInt(hexArr[10]))
		this.FBCoinInsertInfo.MotorState = '电机状态：' + motorState
		this.FBCoinInsertInfo.MotorState_BackColor = motorState == '正常' ? '#00FF00' :
			'#FF0000'
		// 		}
		// 	}
		// }

		this.FBCoinInsertInfo.Data = hexArr.join(',')

		//this.communication_page.fbCoinInsertInfo = this.FBCoinInsertInfo
		return this.FBCoinInsertInfo
	},
	FBCoinReturnInfo: {},
	/**
	 * 电机退钞
	 * @param {Object} data
	 */
	FBCoinReturn(hexArr) {
		this.FBCoinReturnInfo = {}

		//console.log('FBCoinReturn-data', data)

		//var hexArr = SplitHexString(data)
		console.log('FBCoinReturn-hexArr', hexArr)
		// if (hexArr.length > 0) {
		// 	if (parseInt(hexArr[2]) == this.CMDTypeReceive.ACK) {
		// 		if (parseInt(hexArr[3]) == this.CMDQueryReceive.Correct) {
		this.FBCoinReturnInfo.AvgCurrent = '平均电流：' + this.ToInt16(new Uint8Array([hexArr[4], hexArr[5]]), 0) + 'mA'
		this.FBCoinReturnInfo.AvgCurrent_BackColor = '#00FF00'

		this.FBCoinReturnInfo.Speed = '转速：' + this.ToInt16(new Uint8Array([hexArr[6], hexArr[7]]), 0) + '转/分'
		this.FBCoinReturnInfo.Speed_BackColor = this.FBCoinReturnInfo.Speed < 600 ? '#FF0000' : '#00FF00'

		this.FBCoinReturnInfo.Hall = 'Hall数：' + this.ToInt16(new Uint8Array([hexArr[8], hexArr[9]]), 0)
		this.FBCoinReturnInfo.Hall_BackColor = '#00FF00'

		var motorState = this.GetValueName(this.MotorStateEnum, parseInt(hexArr[10]))
		this.FBCoinReturnInfo.MotorState = '电机状态：' + motorState
		this.FBCoinReturnInfo.MotorState_BackColor = motorState == '正常' ? '#00FF00' :
			'#FF0000'
		// 		}
		// 	}
		// }

		this.FBCoinReturnInfo.Data = hexArr.join(',')

		//this.communication_page.fbCoinReturnInfo = this.FBCoinReturnInfo
		return this.FBCoinReturnInfo
	},
	InfraredCorrectionInfo: {},
	/**
	 * 红外口校正
	 * @param {Object} hexArr
	 */
	InfraredCorrection(hexArr) {
		this.InfraredCorrectionInfo = {}

		//console.log('InfraredCorrection-data', data)

		//var hexArr = SplitHexString(data)
		console.log('InfraredCorrection-hexArr', hexArr)
		// if (hexArr.length > 0) {
		// 	if (parseInt(hexArr[2]) == this.CMDTypeReceive.ACK) {
		// 		if (parseInt(hexArr[3]) == this.CMDQueryReceive.Corrfect) {
		this.InfraredCorrectionInfo.DutyCycle = '占空比：' + HexToDecStr(hexArr[4], 0) + '%'
		this.InfraredCorrectionInfo.DutyCycle_BackColor = this.InfraredCorrectionInfo.DutyCycle >= 99 ? '#FF0000' :
			'#00FF00'

		this.InfraredCorrectionInfo.InfOffVoltage = '关电压：' + this.ToInt16(new Uint8Array([hexArr[5], hexArr[6]]),
			0) + 'mV'
		this.InfraredCorrectionInfo.InfOffVoltage_BackColor = '#00FF00'

		this.InfraredCorrectionInfo.InfOnVoltage = '开电压：' + this.ToInt16(new Uint8Array([hexArr[7], hexArr[8]]),
			0) + 'mV'
		this.InfraredCorrectionInfo.InfOnVoltage_BackColor = '#00FF00'

		var infVoltageDiff = this.ToInt16(new Uint8Array([hexArr[9], hexArr[10]]), 0)
		this.InfraredCorrectionInfo.InfVoltageDiff = '电压差：' + infVoltageDiff + 'mV'
		this.InfraredCorrectionInfo.InfVoltageDiff_BackColor = infVoltageDiff <= 800 ?
			'#FF0000' : '#00FF00'
		// 		}
		// 	}
		// }

		this.InfraredCorrectionInfo.Data = hexArr.join(',')

		//this.communication_page.infraredCorrectionInfo = this.InfraredCorrectionInfo
		return this.InfraredCorrectionInfo
	},
	/**
	 * 写入记录信息
	 * @param {Object} hexArr
	 */
	WriteRecord(hexArr){
		//var regex = /^[\w\\-]{0,128}$/
		// if (!regex.test(value)) {
		// 	callback('只能包含大小写英文字母、数字和“-_*”')
		// }
	},
};

export default buletoothCommand;