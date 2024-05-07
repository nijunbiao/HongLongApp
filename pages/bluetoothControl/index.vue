<template>
	<view class="content">
		<view v-if="scanState" class="search">
			<view class="top">
				<text>{{ '搜索到' + devicesList.length + '个设备' }}</text>
				<button type="default" @click="cancelScan">结束搜索</button>
				<!-- <button type="primary" @click="writeBLECharacteristicValue">请求</button> -->
			</view>
<!-- 			<button type="primary" @click="GetID">获取投币机和内胆ID</button>
			<button type="primary" @click="FBInnerLock">投币机机构锁</button>
			<button type="primary" @click="FBInnerUnlock">投币机机构解锁</button>
			<button type="primary" @click="FareBoxLock">投币机内胆锁</button>
			<button type="primary" @click="FareBoxUnLock">投币机内胆解锁</button>
			<button type="primary" @click="FBCoinInsert">投币机电机入币操作</button>
			<button type="primary" @click="FBCoinReturn">投币机电机退币操作</button>
			<button type="primary" @click="InfraredCorrection">红外口校正</button>
			<button type="primary" @click="LedDisplay">Led显示</button>
			<button type="primary" @click="QueryDeviceInfo">查设备信息</button>
			<button type="primary" @click="QueryDeviceStatus">查设备状态</button>
			<button type="primary" @click="QueryRealTimeStatus">查设备实时状态</button> -->
			<view class="device" v-for="(item, index) in devicesList" :key="item.deviceId"
				@click="createBLEConnection(item.deviceId)">
				<view class="name">{{ item.name }}</view>
				<view class="rssi">
					<!-- {{ '信号强度：' + item.RSSI }} -->
					<view class="rssiImg">
						<view class="rssi_1" :style="{backgroundColor: (item.RSSI>= -130 ? 'green' : '#555555')}">
						</view>
						<view class="rssi_2" :style="{backgroundColor: (item.RSSI>= -80 ? 'green' : '#555555')}"></view>
						<view class="rssi_3" :style="{backgroundColor: (item.RSSI>= -60 ? 'green' : '#555555')}"></view>
						<view class="rssi_4" :style="{backgroundColor: (item.RSSI>= -40 ? 'green' : '#555555')}"></view>
						<view class="rssi_5" :style="{backgroundColor: (item.RSSI>= -20 ? 'green' : '#555555')}"></view>

						<text>{{ item.RSSI  }}</text>
					</view>
				</view>
			</view>
		</view>
		<button v-else id="deviceFound" type="default" :class="isActive ? 'deviceFound reduce' : 'deviceFound'"
			@click="openBluetoothAdapter">搜索蓝牙</button>
		<!-- 		<uni-easyinput v-model="writeValue" placeholder="请输入内容"></uni-easyinput>
		
		<button type="primary" @click="openBluetoothAdapter">初始化蓝牙模块</button>
		<button type="primary" @click="getBLEDeviceServices">获取蓝牙外围设备的服务</button>
		<button type="primary" @click="getBluetoothAdapterState">获取本机蓝牙适配器状态</button>
		<button type="primary" @click="cancelScan">取消扫描</button>
		
		<button type="primary" @click="writeBLECharacteristicValue">请求</button> -->


		<!-- 		<view>
			{{text}}
		</view> -->
	</view>
</template>

<script>
	import buletoothCommand from '@/pages/bluetoothControl/buletoothCommand.js'
	import {
		Sleep,
		HexToDecStr
	} from '@/utils/tool.js'
	export default {
		data() {
			return {
				//0000FFF1（通知，需要监听此特征获取返回值）
				//0000FFF2（主机发送数据通道，发送数据将会再串口发送出去）
				characteristicId_2: '',
				//0000FFF3（读、写，配置通道，IO同步）
				characteristicId_3: '',
				writeValue: '',
				text: '',
				//扫描状态（true：正在扫描中；false：未扫描；）
				scanState: true,
				//蓝牙是否开启（true：已开启；false：未开启；）
				connected: false,
				devicesList: [],
				connectDevice: null,
				connectDeviceId: '',
				characteristics: [],
				Uint8Array: [],
				//波特率
				currentBTL2: 115200,
				//校验位
				currentJYW2: 0,
				//停止位
				currentTZW2: 1,
				//数据位
				currentSJW2: 8,
				//流控：默认关
				openRTSBtn: false,
				//flow
				flow: 0,
				//DTR
				DTR: 1,
				//RTS
				RTS: 1,
				isActive: false
			}
		},
		onLoad() {
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#003366',
				animation: {
					duration: 3000,
					timingFunc: "easeOut"
				}
			})
			
			console.log('bluetoothControl_onLoad方法')
			//this.openBluetoothAdapter()
		},
		onHide() {
			//this.cancelScan()
			console.log('bluetoothControl_onHide方法')
		},
		onShow() {
			this.openBluetoothAdapter()
			
			console.log('触发bluetoothControl_onShow方法')
		},
		onUnload() {
			this.cancelScan()
			console.log('bluetoothControl_onUnload方法')
		},
		methods: {
			GetID() {
				buletoothCommand.SendCommand(buletoothCommand.CMDTypeSend.Query, buletoothCommand.CMDQuerySend.GetID)
			},
			FBInnerLock() {
				//var data = buletoothCommand.EnCodeTestPassword()
				buletoothCommand.SendCommand(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.FBInnerLock, buletoothCommand.TestPassword)
			},
			FBInnerUnlock() {
				//var data = buletoothCommand.EnCodeTestPassword()
				buletoothCommand.SendCommand(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.FBInnerUnlock, buletoothCommand.TestPassword)
			},
			FareBoxLock() {
				//var data = buletoothCommand.EnCodeTestPassword()
				buletoothCommand.SendCommand(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.FareBoxLock, buletoothCommand.TestPassword)
			},
			FareBoxUnLock() {
				//var data = buletoothCommand.EnCodeTestPassword()
				buletoothCommand.SendCommand(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.FareBoxUnLock, buletoothCommand.TestPassword)
			},
			FBCoinInsert() {
				buletoothCommand.SendCommand(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.FBCoinInsert)
			},
			FBCoinReturn() {
				buletoothCommand.SendCommand(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.FBCoinReturn)
			},
			InfraredCorrection() {
				buletoothCommand.SendCommand(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.InfraredCorrection)
			},
			LedDisplay() {
				buletoothCommand.SendCommand(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.LedDisplay)
			},
			QueryDeviceInfo() {
				buletoothCommand.SendCommand(buletoothCommand.CMDTypeSend.Query, buletoothCommand.CMDQuerySend
					.QueryDeviceInfo)
			},
			QueryDeviceStatus() {
				buletoothCommand.SendCommand(buletoothCommand.CMDTypeSend.Query, buletoothCommand.CMDQuerySend
					.QueryDeviceStatus)
			},
			QueryRealTimeStatus() {
				buletoothCommand.SendCommand(buletoothCommand.CMDTypeSend.Query, buletoothCommand.CMDQuerySend
					.QueryRealTimeStatus)
			},
			//取消
			cancelScan() {
				console.log('退出页面')
				this.scanState = false

				this.devicesList = []
				// this.connectDevice = null
				// buletoothCommand.DeviceId = ''
				// this.connectDeviceId = ''
				// this.characteristics = []

				uni.closeBluetoothAdapter({
					success: (res) => {
						this.text = '关闭蓝牙模块'
					},
					fail: (res) => {
						this.text = '关闭蓝牙模块失败'
					}
				})
			},
			//初始化蓝牙模块
			openBluetoothAdapter() {
				this.text = ''

				// 初始化蓝牙模块
				uni.openBluetoothAdapter({
					mode: 'central',
					success: (res) => {
						console.log('蓝牙初始化成功', res)
						this.connected = true
						this.onBluetoothAdapterStateChange()

						this.startBluetoothDevicesDiscovery()
					},
					fail: (err) => {
						console.log('蓝牙初始化失败', err)
						this.scanState = false
						
						uni.showToast({
							icon: 'none',
							title: '请检查手机蓝牙是否打开'
						})
					}
				})
			},
			//开始搜索附近的蓝牙外围设备
			startBluetoothDevicesDiscovery() {
				uni.startBluetoothDevicesDiscovery({
					allowDuplicatesKey: true,
					success: (res) => {
						console.log('开始搜索附近的蓝牙设备', res)

						this.scanState = true

						//开始监听扫描新设备事件
						this.onBluetoothDeviceFound()
					},
					fail: (err) => {
						console.log('搜索蓝牙设备失败', err)
					}
				})
			},
			//搜索过程中检查蓝牙状态（监听）
			onBluetoothAdapterStateChange() {
				var that = this

				//搜索过程中检查蓝牙状态
				uni.onBluetoothAdapterStateChange(function(res) {
					if (res.available) {
						that.connected = true
						console.log('蓝牙适配器状态变为可用')
					} else {
						that.connected = false
						console.log('蓝牙适配器不可用，可能是蓝牙被关闭')

						that.cancelScan()
					}
				})
			},
			//搜索蓝牙设备（监听）
			onBluetoothDeviceFound() {
				//Sleep(500)
				var that = this

				//蓝牙搜索中关闭，则停止搜索
				if (!that.connected) {
					return
				}

				//监听搜索到新设备的事件
				uni.onBluetoothDeviceFound((res) => {
					if (!that.scanState) {
						return
					}

					//更新蓝牙设备列表数据
					res.devices.forEach((device) => {
						// 名字前两位 != 'HJ'开头的设备排除
						if (device.name.slice(0, 2) != 'HJ') {
							return
						}
						
						console.log('监听扫描到的设备', res.devices)

						var index = that.devicesList.findIndex(r => r.deviceId == device.deviceId)
						if (index >= 0) {
							that.devicesList[index].name = device.name
							that.devicesList[index].RSSI = device.RSSI
							that.devicesList[index].connectable = device.connectable
							that.devicesList[index].lostCount = 0
							
							//that.devicesList[index] = device
						} else {
							that.devicesList.push(device)
						}
					})

					//排除三次及以上未搜索到的蓝牙设备
					// that.devicesList.forEach((device) => {
					// 	var index = res.devices.findIndex(r => r.deviceId == device.deviceId)
					// 	if (index < 0) {
					// 		device.lostCount += 1
					// 		console.log(device.deviceId + '未搜索到次数', device.lostCount)

					// 		if (device.lostCount >= 10) {
					// 			console.log('排除未搜索到的设备', index)
					// 			that.devicesList = that.devicesList.filter(r => r.deviceId != device
					// 				.deviceId)
					// 		}
					// 	}
					// })
				})
			},
			createBLEConnection(deviceId) {
				uni.createBLEConnection({
					deviceId: deviceId,
					success: (res) => {
						uni.showToast({
							icon: 'none',
							title: '连接成功'
						})

						buletoothCommand.DeviceId = deviceId
						this.connectDeviceId = deviceId
						console.log('连接成功', res)

						//this.onBLEConnectionStateChange()

						uni.stopBluetoothDevicesDiscovery()

						//发现蓝牙设备上的服务  
						this.getBLEDeviceServices()

						//跳转到通信界面
						uni.navigateTo({
							url: '/pages/bluetoothControl/communication/communication?DeviceId=' + this.connectDeviceId
						})
						
						this.scanState = false
					},
					fail: (res) => {
						uni.showToast({
							icon: 'none',
							title: '连接失败'
						})
						console.log('连接失败')
					}
				})
			},
			//获取蓝牙低功耗设备所有服务
			getBLEDeviceServices() {
				var that = this

				uni.getBLEDeviceServices({
					deviceId: that.connectDeviceId, // 搜索到设备的 deviceId
					success: (res) => {
						for (let i = 0; i < res.services.length; i++) {
							console.log('获取蓝牙低功耗设备所有服务成功', res.services)

							// 可根据具体业务需要，选择一个主服务进行通信（透传服务的UUID为0xFFF0）
							if (res.services[i].uuid.indexOf('0000FFF0') >= 0) {
								buletoothCommand.ServiceId = res.services[i].uuid
								that.connectDevice = res.services[i]
								that.getBLEDeviceCharacteristics()
								return
							}
						}
					},
					fail: (err) => {
						console.log('获取蓝牙低功耗设备所有服务失败', err)
					}
				})
			},
			//获取蓝牙低功耗设备某个服务中所有特征 (characteristic)
			getBLEDeviceCharacteristics() {
				uni.getBLEDeviceCharacteristics({
					deviceId: this.connectDeviceId,
					serviceId: this.connectDevice.uuid,
					success: (res) => {
						console.log('获取特征成功', res.characteristics)
						this.characteristics = res.characteristics

						for (var i = 0; i < res.characteristics.length; i++) {
							var item = res.characteristics[i]

							if (item.uuid.indexOf('0000FFF2') >= 0) {
								this.characteristicId_2 = item.uuid
								buletoothCommand.CharacteristicId = item.uuid
							} else if (item.uuid.indexOf('0000FFF3') >= 0) {
								this.characteristicId_3 = item.uuid
								//this.setValue()
								//this.setValueModem()
							}
						}

						//启用蓝牙低功耗设备特征值变化时的 notify 功能，订阅特征
						this.notifyBLECharacteristicValueChange()

						//读取蓝牙低功耗设备特征值的二进制数据
						//this.readBLECharacteristicValue()
					},
					fail: (err) => {
						console.log('获取特征失败', err)
					}
				})
			},
			//启用蓝牙低功耗设备特征值变化时的 notify 功能，订阅特征
			notifyBLECharacteristicValueChange() {
				var that = this

				for (var i = 0; i < that.characteristics.length; i++) {
					if (that.characteristics[i].properties.notify || that.characteristics[i].properties
						.indicate) {
						uni.notifyBLECharacteristicValueChange({
							deviceId: that.connectDeviceId,
							serviceId: that.connectDevice.uuid,
							characteristicId: that.characteristics[i].uuid,
							state: true,
							type: 'notification',
							success: (res) => {
								//连接成功

								console.log('启用notify成功', res)
							},
							fail: (err) => {
								//连接失败

								console.log('启用notify失败', err)
							}
						})
					}
				}

				//监听蓝牙低功耗设备的特征值变化事件
				//this.onBLECharacteristicValueChange()
				//buletoothCommand.BLECharacteristicValueChange()
			},
			//读取蓝牙低功耗设备特征值的二进制数据
			readBLECharacteristicValue() {
				for (var i = 0; i < this.characteristics.length; i++) {
					if (this.characteristics[i].properties.read) {
						uni.readBLECharacteristicValue({
							deviceId: this.connectDeviceId,
							serviceId: this.connectDevice.uuid,
							characteristicId: this.characteristics[i].uuid,
							success: (res) => {
								console.log('读取蓝牙低功耗设备特征值成功', res)
							},
							fail: (err) => {
								console.log('读取蓝牙低功耗设备特征值失败', err)
							}
						})
					}
				}
			},
			//向蓝牙低功耗设备特征值中写入二进制数据
			writeBLECharacteristicValue() {
				// 向蓝牙设备发送一个0x00的16进制数据
				let buffer = new ArrayBuffer(12)
				let byteArray = new Uint8Array(buffer)
				//let dataView = new DataView(buffer)
				byteArray[0] = buletoothCommand.Head
				byteArray[1] = buffer.byteLength
				byteArray[2] = buletoothCommand.CMDTypeSend.Control
				byteArray[3] = 0x12
				byteArray[4] = 50
				byteArray[5] = 52
				byteArray[6] = 48
				byteArray[7] = 50
				byteArray[8] = 48
				byteArray[9] = 53

				const crc16 = this.CRC16(byteArray, 10)
				//反转一下crc16结果，先取1再取0
				byteArray[10] = crc16[1]
				byteArray[11] = crc16[0]

				//var buffer = this.stringToArrayBuffer('20240307142600')

				console.log('请求数据格式', buffer)

				// 创建一个指向ArrayBuffer的Uint8Array视图  
				// const view = new Uint8Array(7)
				// view[0] = 0x10
				// view[1] = 4
				// view[2] = 0x01
				// view[3] = 0x60
				// view[4] = ''

				// const crc16 = this.CRC16(view)
				// view[5] = crc16[0]
				// view[6] = crc16[1]

				uni.writeBLECharacteristicValue({
					deviceId: this.connectDeviceId,
					serviceId: this.connectDevice.uuid,
					characteristicId: this.characteristicId_2,
					value: buffer,
					success: (res) => {
						console.log('写入数据成功', res)
					},
					fail: (err) => {
						console.log('写入失败', err)
					}
				})

				// var source = '20240307142600'
				// let count = 23 - 3
				// for (let i = 0, len = source.length / count; i < len; i++) {

				// 	let subStr = source.substr(0, count);
				// 	let length = this.countValueLength(subStr.length, false)

				// 	setTimeout(() => {
				// 		uni.writeBLECharacteristicValue({
				// 			deviceId: this.connectDeviceId,
				// 			serviceId: this.connectDevice.uuid,
				// 			characteristicId: this.characteristicId_2,
				// 			value: buffer,
				// 			success: (res) => {
				// 				console.log('写入数据成功', res)
				// 			},
				// 			fail: (err) => {
				// 				console.log('写入失败', err)
				// 			}
				// 		})
				// 	}, 1000)


				// 	source = source.replace(subStr, "");
				// }
			},
			// 写入数据
			handleSendvalue(buffer, flag, deviceId, serviceId, characteristicId, length) {
				let that = this
				uni.writeBLECharacteristicValue({
					deviceId: deviceId,
					serviceId: serviceId,
					characteristicId: characteristicId,
					value: buffer,
					success: function(res) {
						if (flag != 3) { //波特率
							wx.showToast({
								title: 'BleUart:串口设置成功',
								icon: "none",
								duration: 1000
							})
							setTimeout(() => {
								that.readBLECharacteristicValue(that.connectDeviceId, that
									.connectDevice.uuid, that.characteristicId_3)
							}, 100)
						}
					},
					fail: function(res) {
						wx.showToast({
							title: '发送失败',
							icon: "none",
							duration: 1000
						})
					},
					complete: function() {
						// console.log("调用结束");
					}
				})
			},
			//配置参数--Modem
			setValueModem() {
				var buffer = new ArrayBuffer(8);
				let dataView = new DataView(buffer)

				let arr = [0x07, 0x00, 0x05, 0x00,
					this.flow, this.DTR, this.RTS
				]

				var sum = 0
				for (var i = 3; i < 7; i++) {
					var s = (arr[i] & 0xff)
					sum += (arr[i] & 0xff)

				}
				arr.push(sum)

				for (var i = 0; i < 8; i++) {
					dataView.setUint8(i, arr[i])
				}

				setTimeout(() => {
					this.handleSendvalue(buffer, 2, this.connectDeviceId, this.connectDevice.uuid, this
						.characteristicId_3)
				}, 1000)

			},
			// 设置波特率
			setValue() {
				var that = this

				var buffer = new ArrayBuffer(12);
				let dataView = new DataView(buffer)

				let arr = [0x06, 0x00, 0x09, 0x00, that.currentBTL2 & 0xff, (that.currentBTL2 & 0x0000ff00) >> 8,
					(that.currentBTL2 & 0x00ff0000) >> 16, (that.currentBTL2 & 0xff000000) >> 24, that.currentSJW2,
					that.currentTZW2, that.currentJYW2
				]

				var sum = 0
				var str = null
				for (var i = 3; i < 11; i++) {
					var s = (arr[i] & 0xff)
					sum += (arr[i] & 0xff)

				}
				arr.push(sum)

				for (var i = 0; i < 12; i++) {
					dataView.setUint8(i, arr[i])
				}

				setTimeout(() => {
					that.handleSendvalue(buffer, 1, that.connectDevice, that.connectDeviceId.uuid, that
						.characteristicId_3)
				}, 1000)


			},
			CRC16(data) {
				var len = data.Length;
				return (this.CRC16(data, len));
			},
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
			//监听蓝牙低功耗设备的特征值变化事件
			onBLECharacteristicValueChange() {
				var that = this
				uni.onBLECharacteristicValueChange(function(characteristic) {
					console.log('特征值变化', characteristic)

					if (characteristic.characteristicId.indexOf('0000FFF3') >= 0) {
						const length = (that.ab2hex(characteristic.value)).length
						const value = that.ab2hex(characteristic.value)

						if (value.slice(0, 2) == "88" && (length / 2) == 7) { //状态

							const part = that.hexToBin(value.substr(8, 2))
							const sixPart = that.hexToBin(value.substr(10, 2))

							var writeFlag = part & 0x04 ? false : true

							console.log('监听特征值变化FFF3', part, sixPart, writeFlag)

							if (part.substr(6, 1) == 1) { //modem状态有效，更新
								var t = parseInt(sixPart, 2)
								var flag1 = t & 0x80 ? t & 0x80 : 0
								var flag2 = t & 0x40 ? t & 0x40 : 0
								var flag3 = t & 0x20 ? t & 0x20 : 0
								var flag4 = t & 0x10 ? t & 0x10 : 0

								console.log('监听特征值变化FFF3', flag1, flag2, flag3, flag4)
							}
						} else if (value.slice(0, 2) == "87" && (length / 2) == 8) { //flow

							var flag = parseInt(value.substr(8, 2), 16)
							var flow = flag ? '开' : '关'

							console.log('监听特征值变化FFF3', flag, flow)
						}

					}

					if (characteristic.characteristicId.indexOf('0000FFF1') >= 0) {
						var hex = that.ab2hex(characteristic.value)
						console.log('监听特征值变化FFF1(16进制)', hex)

						console.log(buletoothCommand.analysis_0x05(characteristic.value))
						//var ab2 = that.hexToBin(hex)
						//console.log('监听特征值变化FFF1(16进制转2进制)', ab2)

						//获取投币机和内胆ID
						// var shellId = hex.substring(8, 8 + 8)
						// var boxId = hex.substring(16, 16 + 8)
						// var shellIdStr = HexToDecStr(shellId)
						// var boxIdStr = HexToDecStr(boxId)
						//var str = that.hexToString(hex)

						//查设备信息
						// var arr = hex.substring(8, hex.length - 6).split('00')
						// console.log('拆分数组', arr)
						// if(arr.length > 0){
						// 	//设备名称
						// 	var deviceName = that.hexToString(arr[0])
						// 	//硬件版本
						// 	var vwVersion = that.hexToString(arr[1])
						// 	//软件版本
						// 	var swVersion = that.hexToString(arr[2])
						// 	//生成日期
						// 	var buildDate = that.hexToString(arr[3])
						// }

						var str = that.hexToString(hex)
						console.log('监听特征值变化FFF1(16进制转字符串)', str)
					}
					// console.log('read回调方法', characteristic)

					// const dataView = new Uint8Array(characteristic.value)
					// console.log('接收到的数据（解析为二进制数据-分字段显示）:', dataView)

					// // 将每个字节转换为十六进制字符串，并连接它们  
					// const hexString = Array.from(dataView).map(byte => byte.toString(16).padStart(2,
					// 	'0')).join(
					// 	'');
					// console.log('接收到的数据（解析为十六进制数据）:', hexString)

					// const dataString = String.fromCharCode.apply(null, dataView)
					// console.log('接收到的数据（解析为二进制数据）:', dataString)
				})
			},
			//获取蓝牙适配器状态
			getBluetoothAdapterState() {
				this.text += '获取蓝牙适配器状态' + '\n'
				uni.getBluetoothAdapterState({
					success: (res) => {
						this.text += JSON.stringify(res) + '\n'
					},
					fail: (res) => {
						this.text += JSON.stringify(res) + '\n'
					}
				})
			},
			// 将字符串转换成ArrayBufer
			string2buffer(str) {
				let val = ""
				if (!str) return;
				let length = str.length;
				let index = 0;
				let array = []
				while (index < length) {
					array.push(str.substring(index, index + 2));
					index = index + 2;
				}
				val = array.join(",");
				// 将16进制转化为ArrayBuffer
				return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function(h) {
					return parseInt(h, 16)
				})).buffer
			},
			//ArrayBuffer转字符串
			ab2str(arrayBuffer) {
				let unit8Arr = new Uint8Array(arrayBuffer)
				let encodedString = String.fromCharCode.apply(null, unit8Arr)
				return encodedString
			},
			//ArrayBuffer转16进度字符串
			ab2hex(buffer) {
				var hexArr = Array.prototype.map.call(
					new Uint8Array(buffer),
					function(bit) {
						return ('00' + bit.toString(16)).slice(-2)
					}
				)
				return hexArr.join('');
			},
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
			stringToArrayBuffer(str) {
				if (!str) {
					return new ArrayBuffer(0);
				}
				var buffer = new ArrayBuffer(str.length);
				let dataView = new DataView(buffer)

				let ind = 0;
				for (var i = 0, len = str.length; i < len; i += 1) {
					var s = str.charCodeAt(i)
					let code = str.substr(i, 1)
					//  console.log(ind,s,'10进制')
					dataView.setUint8(ind, s)
					ind++
				}

				console.log(buffer, 'buffer')
				return buffer;
			},
			hexToString(hex) {

				let str = '';

				for (let i = 0; i < hex.length; i += 2) {

					str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));

				}

				return str;

			},
			// 计算长度
			countValueLength(val, flag) {
				//  console.log(flag,'flag')
				if (flag) {
					return val / 2
				} else {
					return val
				}
			}
		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
		// 底部安全距离适配
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);

		.content {
			height: inherit;
			display: flex;
			flex-direction: column;
			justify-content: center;
			position: relative;

			.search {
				position: absolute;
				top: 0rpx;
				width: 100%;

				.top {
					height: 100rpx;
					display: flex;
					flex-direction: column;
					justify-content: center;
					margin-left: 10rpx;
					margin-bottom: 10rpx;

					button {
						display: inline-flex;
						position: absolute;
						right: 10rpx;
						color: white;
						background-color: darkred;
						font-size: 40rpx;
					}
				}
			}

			.deviceFound {
				border-radius: 175rpx;
				height: 350rpx;
				width: 350rpx;
				display: flex;
				flex-direction: column;
				justify-content: center;
				font-size: 50rpx;
				color: white;
				background-color: #003366;
				transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)
			}

			.deviceFound.reduce {
				width: 320rpx !important;
				height: 320rpx !important;
			}

			.device {
				width: 98%;
				height: 130rpx;
				border-bottom: 1px solid black;
				border-radius: 10rpx;
				text-align: center;
				display: flex;
				margin: 0rpx 1% 10rpx;
				background-color: #dbdbdb;
				box-shadow: 2px 2px #b9b9b9;

				.name,
				.rssi {
					height: 100%;
					display: flex;
					flex-direction: column;
					justify-content: center;
				}

				.name {
					width: 65%;
					font-weight: bolder;
				}

				.rssi {
					width: 35%;
					color: #9e9e9e;

					.rssiImg {
						view {
							width: 8rpx;
							background-color: #555555;
							display: inline-block;
							margin-right: 5rpx;
						}

						text {
							margin-left: 10rpx;
						}

						.rssi_1 {
							height: 20rpx;
						}

						.rssi_2 {
							height: 25rpx;
						}

						.rssi_3 {
							height: 30rpx;
						}

						.rssi_4 {
							height: 35rpx;
						}

						.rssi_5 {
							height: 40rpx;
						}
					}
				}
			}
		}
	}
</style>