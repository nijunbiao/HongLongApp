import {
	ArrayBufferToHex,
	SplitHexString,
	HexToString,
	HexToDecStr,
	HLCommDecrypt,
	HLCommEncrypt,
	DecryptByDES,
	DecToHexStr
} from '@/utils/tool.js'
const buletoothCommand = {
	/**
	 * 蓝牙设备 id
	 */
	DeviceId: '',
	/**
	 * 蓝牙特征对应服务的 UUID
	 */
	ServiceId: '',
	/**
	 * 蓝牙特征的 UUID（写入）
	 */
	CharacteristicId: '',
	/**
	 * 蓝牙特征的 UUID（回复）
	 */
	ReplyCharacteristicId: 'FFF1',
	/**
	 * 帧头
	 */
	STX_1: 0x55,
	STX_2: 0xAA,
	STX_3: 0x5C,
	/**
	 * 帧尾
	 */
	ETX: 0xFF,
	CmdId: {
		GetShellInfo: 0x08,
		SignIn: 0x09,
		SignOut: 0x0A,
		UnBox: 0x0B
	},
	DeviceType: {
		Other: 0x01,
		POS: 0x02,
		Box: 0x03,
		Manager: 0x04,
		App: 0x05
	},
	/**
	 * 设备类型
	 */
	DeviceModel: [{
			value: 0x01,
			name: 'HJ-1'
		},
		{
			value: 0x02,
			name: 'HJ-2'
		},
		{
			value: 0x03,
			name: 'HJ-3'
		}
	],
	Status: {
		Success: 0x00,
		Error: 0x01,
		RepeatFrame: 0x02,
		RepeatSignIn: 0x03,
		RepeatSignOut: 0x04,
		ContinueCollect: 0x05
	},
	/**
	 * 异或（XOR）校验
	 * @param {Object} data --数据
	 * @param {Object} len	--长度
	 */
	XOR(data, len) {
		let xorResult = 0;
		for (let i = 0; i < len; i++) {
			xorResult ^= data[i];
		}

		return xorResult;
	},
	/**
	 * 根据当前时间，获取YYMMDDhhmmss格式的BCD数组
	 */
	GetCurrentTimeAsBCDArr() {
		var date_BCD = []

		const now = new Date()
		const year = now.getFullYear().toString().slice(-2); // 获取年份的后两位  
		const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份（0-11），加1后转为字符串并补零 
		const date = (now.getDate()).toString().padStart(2, '0'); // 日期，补零  
		const hours = (now.getHours()).toString().padStart(2, '0'); // 小时，补零  
		const minutes = (now.getMinutes()).toString().padStart(2, '0'); // 分钟，补零
		const seconds = (now.getSeconds()).toString().padStart(2, '0'); // 秒，补零

		date_BCD[0] = year
		date_BCD[1] = month
		date_BCD[2] = date
		date_BCD[3] = hours
		date_BCD[4] = minutes
		date_BCD[5] = seconds

		return date_BCD
	},
	/**
	 * 将10进制数据处理成两个字节（低字节在前）
	 * @param {Object} decimalNumber --十进制数据
	 */
	DecimalToTwoBytesLowByteFirst(decimalNumber) {
		// // 将十进制数转换为十六进制字符串  
		// const hexString = decimalNumber.toString(16).toUpperCase()

		// // 如果十六进制字符串长度不足2，则在前面补0  
		// const paddedHexString = hexString.padStart(2, '0')

		// // 将十六进制字符串转换为字节数组，低字节在前  
		// var lowByte = 0
		// var highByte = 0
		// if (paddedHexString.length > 2) {
		// 	highByte = parseInt(paddedHexString.substring(0, 2), 16)
		// 	lowByte = parseInt(paddedHexString.substring(2), 16)
		// } else {
		// 	lowByte = parseInt(paddedHexString.substring(0, 2), 16)
		// 	highByte = 0
		// }

		// return [lowByte, highByte]

		// 创建一个Buffer来存储两个字节，并设置字节序为小端序
		const buffer = Buffer.alloc(2);
		buffer.writeUInt16LE(decimalNumber, 0); // LE代表小端序（low-endian）  

		// 将Buffer转换为数组  
		const byte = [buffer.readUInt8(0), buffer.readUInt8(1)];
		console.log('低字节在前', byte)
		return byte
	},
	/**
	 * 封装写入蓝牙并等待回复的函数
	 * @param {Object} cmdType -命令类型
	 * @param {Object} cmdBtye -命令字
	 * @param {Object} data -请求内容
	 */
	WriteBLEAndWaitForResponse(cmdId, data, secretKey = []) {
		var that = this

		console.log(cmdId, '请求参数打印', data, '加密密钥', secretKey)

		return new Promise((resolve, reject) => {
			var length = 12 + data.length

			var buffer = new ArrayBuffer(length)
			var byteArray = new Uint8Array(buffer)
			byteArray[0] = that.STX_1
			byteArray[1] = that.STX_2
			byteArray[2] = that.STX_3

			var lengthBytes = this.DecimalToTwoBytesLowByteFirst(length)

			byteArray[3] = lengthBytes[0]
			byteArray[4] = lengthBytes[1]
			byteArray[5] = 0x05 //DeviceType
			byteArray[6] = 0x00 //DeviceID
			byteArray[7] = cmdId
			byteArray[8] = 0x00 //Status
			byteArray[9] = 0x00 //SerialID

			if (secretKey && secretKey.length > 0) {
				var encryptbuffer = new ArrayBuffer(data.length)
				var encryptbyteArray = new Uint8Array(encryptbuffer)
				
				for(var i = 0; i < data.length; i++){
					encryptbyteArray[i] = data[i]
				}
				
				var keybuffer = new ArrayBuffer(8)
				var keybyteArray = new Uint8Array(keybuffer)
				
				for(var i = 0; i < 8; i++){
					keybyteArray[i] = secretKey[i]
				}
				
				var newData = HLCommEncrypt(encryptbyteArray, keybyteArray, data.length)
				
				console.log('请求需加密', newData)
				
				for (var i = 0; i < newData.length; i++) {
					byteArray[10 + i] = newData[i]
				}
			} else {
				for (var i = 0; i < data.length; i++) {
					byteArray[10 + i] = data[i]
				}
			}
			
			// for (var i = 0; i < data.length; i++) {
			// 	byteArray[10 + i] = data[i]
			// }

			//帧尾
			byteArray[byteArray.length - 2] = that.ETX

			//XOR
			byteArray[byteArray.length - 1] = that.XOR(byteArray, byteArray.length - 1)

			console.log(that.DeviceId, that.ServiceId, that.CharacteristicId)
			console.log('写入数据', buffer)

			uni.writeBLECharacteristicValue({
				deviceId: that.DeviceId,
				serviceId: that.ServiceId,
				characteristicId: that.CharacteristicId,
				value: buffer,
				success: (res) => {
					console.log('写入数据成功', res, Date.now())

					// 监听特征值变化以等待回复  
					const listener = (result) => {
						console.log('收到蓝牙设备回复-外部:', result)
						if (result.deviceId === that.DeviceId && result.serviceId ===
							that.ServiceId && result.characteristicId.indexOf(that
								.ReplyCharacteristicId) >= 0) {
							console.log('收到蓝牙设备回复-内部:', result.value)
							// 取消监听特征值变化  
							uni.offBLECharacteristicValueChange(function(res) {}, listener)

							var responseResult = that.ResponseHanding(cmdId, result.value,
								keybyteArray)

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
	 * @param {Object} cmdId 		--请求命令
	 * @param {Object} data 		--蓝牙回复内容
	 * @param {Object} secretKey	--解密密钥
	 */
	ResponseHanding(cmdId, data, secretKey) {
		var that = this
		var responseResult = {
			Status: false,
			Message: '',
			Data: null
		}
		
		// 解析回复数据并进行下一步操作
		var hex = ArrayBufferToHex(data)
		
		console.log('hex', hex)
		
		var hexArr = SplitHexString(hex)
		
		console.log('hexArr', hexArr)

		//先进行解密操作
		if (secretKey && secretKey.length > 0) {
			var decryptData = hexArr.slice(10, hexArr.length - 2)
			
			console.log('解密前原始数据', decryptData)
			
			var decryptbuffer = new ArrayBuffer(decryptData.length)
			var decryptbyteArray = new Uint8Array(decryptbuffer)
			
			for(var i = 0; i < decryptData.length; i++){
				decryptbyteArray[i] = decryptData[i]
			}
			
			// var keybuffer = new ArrayBuffer(8)
			// var keybyteArray = new Uint8Array(keybuffer)
			
			// for(var i = 0; i < 8; i++){
			// 	keybyteArray[i] = secretKey[i]
			// }
			
			var newData = HLCommDecrypt(decryptbyteArray, secretKey, decryptData.length)
			console.log('数据需要解密', newData, '使用的密钥', secretKey)
			
			var hexNewData = []
			for(var i = 0; i < newData.length; i++){
				var toHex = newData[i].toString(16)
				hexNewData[i] = toHex.length === 1 ? '0' + toHex : toHex
			}
				
			hexArr = hexArr.slice(0, 11).concat(hexNewData).concat(hexArr.slice(hexArr.length - 2, hexArr.length))
			
			console.log('hexArr插入解密部分', hexArr)
		}

		if (hexArr.length <= 0) {
			responseResult.Message = 'hexArr为空'
			return responseResult
		}

		var status = parseInt(hexArr[8])
		if (status == that.Status.Success) {
			responseResult.Status = true
			responseResult.Message = '成功'

			switch (cmdId) {
				case that.CmdId.GetShellInfo:
					responseResult.Data = that.GetShellInfo(hexArr)
					break;
				case that.CmdId.SignIn:
					responseResult.Data = that.SignIn(hexArr)
					break;
				case that.CmdId.SignOut:
					responseResult.Data = that.SignOut(hexArr)
					break;
				case that.CmdId.UnBox:
					responseResult.Data = that.UnBox(hexArr)
					break;
			}
		}

		return responseResult
	},

	/**
	 * 获取投币机信息
	 * @param {Object} hexArr
	 */
	GetShellInfo(hexArr) {
		console.log('GetShellInfo-hexArr', hexArr)

		var shellInfo = {
			SWVersion: '',
			HWVersion: '',
			DeviceModel: '',
			ShellId: '',
			BoxId: '',
			SecretKey: []
		}

		shellInfo.SWVersion = HexToString(hexArr.slice(10, 14).join(''))
		shellInfo.HWVersion = HexToString(hexArr.slice(14, 18).join(''))
		shellInfo.DeviceModel = this.DeviceModel.filter(item => parseInt(item.value) == hexArr[18])[0].name
		shellInfo.ShellId = HexToDecStr(hexArr.slice(19, 23).reverse().join(''))
		shellInfo.BoxId = HexToDecStr(hexArr.slice(23, 27).reverse().join(''))
		shellInfo.SecretKey = hexArr.slice(28, 36)

		return shellInfo
	},
	/**
	 * 签到
	 * @param {Object} hexArr
	 */
	SignIn(hexArr) {
		var signIn = {
			Status: '',
			SecretKey: []
		}
		
		console.log('SignIn-hexArr', hexArr)

		signIn.Status = hexArr[11]
		signIn.SecretKey = hexArr.slice(12, 20)

		return signIn
	},
	/**
	 * 签退
	 * @param {Object} hexArr
	 */
	SignOut(hexArr) {
		var signOut = {
			Status: '',
			SecretKey: []
		}
		
		console.log('SignOut-hexArr', hexArr)

		signOut.Status = hexArr[11]
		signOut.SecretKey = hexArr.slice(12, 20)

		return signOut
	},
	/**
	 * 开箱
	 * @param {Object} hexArr
	 */
	UnBox(hexArr) {
		var unBox = {
			Status: '',
			UnBoxResult: '',
			SecretKey: [],
			RowTotal: 0,
			DeviceRecord: [] //投币机记录数组
		}

		//投币记录数据对象
		var record = {
			Order: '',
			Type: '',
			Time: '',
			SignInTime: '',
			SignOutTime: '',
			routeName: '',
			VehicleCode: '',
			ShellId: '',
			BoxId: '',
			StaffCardId: '',
			Coins: '',
			Paper: '',
			PeopleCount: ''
		}
		
		console.log('UnBox-hexArr', hexArr)

		unBox.Status = hexArr[11]
		unBox.UnBoxResult = hexArr[12]
		unBox.SecretKey = hexArr.slice(13, 21)
		unBox.RowTotal = HexToDecStr(hexArr[21])

		var hexRecord = hexArr.slice(22, hexArr.length)
		console.log('记录数据包', hexRecord, unBox.RowTotal)
		// for (var i = 0; i < unBox.RowTotal; i++) {
		// 	var sIndex = 0

		// 	console.log('开始循环')

			//record = {}
			// record.Order = HexToDecStr(hexRecord.slice(0 + sIndex, 4 + sIndex), 0)
			// record.Type = hexRecord[4 + sIndex]
			// record.Time = hexRecord.slice(5 + sIndex, 11 + sIndex)
			// record.SignInTime = hexRecord.slice(11 + sIndex, 17 + sIndex)
			// record.SignOutTime = hexRecord.slice(17 + sIndex, 23 + sIndex)
			// record.routeName = HexToString(hexRecord.slice(23 + sIndex, 43 + sIndex))
			// record.VehicleCode = HexToString(hexRecord.slice(43 + sIndex, 55 + sIndex))
			// record.ShellId = HexToDecStr(hexRecord.slice(55 + sIndex, 59 + sIndex))
			// record.BoxId = HexToDecStr(hexRecord.slice(59 + sIndex, 63 + sIndex))
			// record.StaffCardId = HexToDecStr(hexRecord.slice(63 + sIndex, 79 + sIndex))
			// record.Coins = hexRecord.slice(79 + sIndex, 83 + sIndex) / 10
			// record.Paper = hexRecord.slice(83 + sIndex, 87 + sIndex) / 10
			// record.PeopleCount = HexToDecStr(hexRecord.slice(87 + sIndex, 91 + sIndex), 0)

			// console.log(record)

			// sIndex += 92

			// unBox.DeviceRecord.push(record)
		//}

		// deviceRecord.No = HexToDecStr(hexArr.slice(10, 14), 0)
		// deviceRecord.Type = hexArr[14]
		// deviceRecord.Time = hexArr.slice(15, 21)
		// deviceRecord.SignInTime = hexArr.slice(21, 27)
		// deviceRecord.SignOutTime = hexArr.slice(27, 33)
		// deviceRecord.Route = HexToString(hexArr.slice(33, 53))
		// deviceRecord.VehicleCode = HexToString(hexArr.slice(53, 65))
		// deviceRecord.ShellId = HexToDecStr(hexArr.slice(65, 69))
		// deviceRecord.BoxId = HexToDecStr(hexArr.slice(69, 73))
		// deviceRecord.DriverId = HexToDecStr(hexArr.slice(73, 89))
		// deviceRecord.Coins = hexArr.slice(89, 93) / 10
		// deviceRecord.Paper = hexArr.slice(93, 97) / 10
		// deviceRecord.Frequency = HexToDecStr(hexArr.slice(97, 101), 0)

		return unBox
	}
};

export default buletoothCommand;