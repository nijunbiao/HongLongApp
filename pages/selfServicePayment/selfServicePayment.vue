<template>
	<view class="content">
		<view v-if="operationProcess == '获取手机号'" class="mask">
			<button v-if="isNeedScan == true" @click="scanCode">扫码</button>
			<button v-else open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">获取手机号</button>
		</view>
		<view v-if="operationProcess == '自助交账'" class="operation">
			<view class="boxInfo">
				<view>{{'外箱编号：' + boxInfo.ShellId }}</view>
				<view>{{'内胆编号：' + boxInfo.BoxId }}</view>
				<view>{{'设备型号：' + boxInfo.DeviceModel }}</view>
				<view>{{'硬件版本：' + boxInfo.HWVersion }}</view>
				<view>{{'软件版本：' + boxInfo.SWVersion }}</view>
			</view>

			<!-- 操作->签到、签退、开箱 -->
			<button type="primary" @click="getShellInfo" :disabled="!connected">获取投币机信息</button>
			<button type="primary" @click="signIn" :disabled="!connected">签到</button>
			<button type="primary" @click="signOut" :disabled="!connected">签退</button>
			<button type="primary" @click="unBox" :disabled="!connected">开箱</button>
		</view>
		<view v-if="operationProcess == '提交'" class="payment">
			<view class="boxAmountInfo">
				<view class="title">原箱内数据展示</view>
				<view>{{ '纸币金额：' + boxAmountInfo.PaperSum }}</view>
				<view>{{ '硬币金额：' + boxAmountInfo.CoinSum }}</view>
				<view>{{ '总金额：' + boxAmountInfo.Total }}</view>
			</view>

			<uni-forms class="recordFrom" ref="recordFrom" :rules="customRules" :modelValue="recordFormData"
				label-position="top">
				<uni-forms-item label="箱内金额" required name="BoxAmount">
					<uni-easyinput maxlength="6" v-model="recordFormData.BoxAmount" placeholder="请输入箱内金额" />
				</uni-forms-item>
				<uni-forms-item label="照片凭证" required name="PhotoVoucher">
					<uni-file-picker v-model="recordFormData.PhotoVoucher" return-type="array" fileMediatype="image"
						file-extname="jpeg,jpg,png" limit="3" mode="grid" auto-upload="false" :sizeType="['compressed']"
						:maxB="photoMaxB" :minB="photoMinB" @select="selectPhoto" @delete="deletePhoto" />
				</uni-forms-item>
			</uni-forms>

			<button type="default" class="submit" @click="submit">提交</button>
		</view>
	</view>
</template>

<script>
	import {
		Throttle,
		Sleep,
		ProcessingQrCodeInfo,
		DecToHexStr,
		SplitHexString,
		PadArrayWithZeros,
		HexToDecStr,
		StrToHexString,
		GetImageBase64_ReadFile
	} from '@/utils/tool.js'
	import Command from '@/pages/selfServicePayment/command.js'
	export default {
		data() {
			return {
				photoMaxB: this.$Global.StaffRegister_ImageMaxB,
				photoMinB: 0, //this.$Global.StaffRegister_ImageMinB,

				isNeedScan: true,

				//蓝牙设备Id
				deviceId: '',
				//蓝牙设备所有服务
				characteristics: [],
				//蓝牙设备通信服务
				service: '',
				//0000FFF2（主机发送数据通道，发送数据将会再串口发送出去）
				characteristicId_2: '',

				connected: false,

				boxInfo: {
					ShellId: '0000000000',
					BoxId: '0000000000',
					DeviceModel: '未知',
					HWVersion: 'v0.0.0',
					SWVersion: 'v0.0.0'
				},

				boxAmountInfo: {
					PaperSum: '0.0',
					CoinSum: '0.0',
					Total: '0.0'
				},

				//获取手机号、连接蓝牙、自助交账、提交
				operationProcess: '自助交账',
				recordFromData: {
					BoxAmount: '',
					PhotoVoucher: []
				},
				customRules: {
					BoxAmount: {
						rules: [{
							required: true,
							errorMessage: '单程票价不能为空'
						}, {
							pattern: '^([0-9]\\d*(\\.\\d+)?)$',
							errorMessage: '请输入正数最多一位小数'
						}]
					},
					PhotoVoucher: {
						rules: [{
							required: true,
							errorMessage: '至少上传一张照片'
						}]
					}
				},

				deviceMACAddress: '383B265E9DD8',

				staffInfo: {},

				SecretKey: [],

				PhoneNum: '15618693587'
			}
		},
		onLoad(query) {
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#003366',
				animation: {
					duration: 3000,
					timingFunc: "easeOut"
				}
			})

			if (query.scene) {
				this.isNeedScan = false
				console.log('自助交账入参', query)

				this.deviceMACAddress = query.scene
			} else {
				this.isNeedScan = true
				console.log('需要用户扫码')
			}

			this.autoConnect()
		},
		watch: {
			connected(newVal, oldVal) {
				if (newVal != oldVal) {
					if (newVal == true) {
						//this.load()
					}
				}
			}
		},
		methods: {
			async autoConnect() {
				if (this.deviceMACAddress) {
					uni.showLoading({
						mask: true,
						title: '正在搜索设备中...'
					})

					// 初始化蓝牙模块
					uni.openBluetoothAdapter({
						mode: 'central',
						success: (res) => {
							console.log('蓝牙初始化成功', res)
							this.onBluetoothAdapterStateChange()

							this.startBluetoothDevicesDiscovery()
						},
						fail: (err) => {
							console.log('蓝牙初始化失败', err)

							uni.showToast({
								icon: 'none',
								title: '请检查手机蓝牙是否打开'
							})
						}
					})

					uni.hideLoading({
						fail: function(res) {
							//不加fail回调真机会报hideLoading的错误信息
							//console.log('报错了')
						}
					})
				}
			},
			//搜索过程中检查蓝牙状态（监听）
			onBluetoothAdapterStateChange() {
				var that = this

				//搜索过程中检查蓝牙状态
				uni.onBluetoothAdapterStateChange(function(res) {
					if (res.available) {
						console.log('蓝牙适配器状态变为可用')
					} else {
						console.log('蓝牙适配器不可用，可能是蓝牙被关闭')
					}
				})
			},
			//开始搜索附近的蓝牙外围设备
			startBluetoothDevicesDiscovery() {
				uni.startBluetoothDevicesDiscovery({
					allowDuplicatesKey: true,
					success: (res) => {
						console.log('开始搜索附近的蓝牙设备', res)

						//开始监听扫描新设备事件
						this.onBluetoothDeviceFound()
					},
					fail: (err) => {
						console.log('搜索蓝牙设备失败', err)
					}
				})
			},
			//搜索蓝牙设备（监听）
			onBluetoothDeviceFound() {
				console.log('搜索蓝牙设备（监听）')
				var that = this

				//监听搜索到新设备的事件
				uni.onBluetoothDeviceFound((res) => {
					//蓝牙搜索中关闭，则停止搜索
					if (that.deviceId) {
						console.log('取消搜索监听')
						return
					}

					//更新蓝牙设备列表数据
					res.devices.forEach((device) => {
						// 名字前两位 != 'HJ'开头的设备排除
						if (device.name.slice(0, 2) != 'HJ' || device.name.length < that.deviceMACAddress
							.length) {
							return
						}

						console.log('监听扫描到的设备', res.devices)

						if (device.name.substring(2, 14) == that.deviceMACAddress) {
							that.createBLEConnection(device.deviceId)
						}
					})
				})
			},
			createBLEConnection(deviceId) {
				uni.createBLEConnection({
					deviceId: deviceId,
					success: (res) => {
						if (this.deviceId) {
							return
						}

						this.deviceId = deviceId
						Command.DeviceId = this.deviceId
						console.log('连接成功', res)

						uni.stopBluetoothDevicesDiscovery()

						//发现蓝牙设备上的服务  
						this.getBLEDeviceServices()
					},
					fail: (res) => {
						uni.showToast({
							icon: 'none',
							title: '连接失败'
						})
						console.log('连接失败')
					},
					complete: (com) => {
						uni.hideLoading({
							fail: function(res) {
								//不加fail回调真机会报hideLoading的错误信息
							}
						})
					}
				})
			},
			//获取蓝牙低功耗设备所有服务
			getBLEDeviceServices() {
				var that = this

				uni.getBLEDeviceServices({
					deviceId: that.deviceId, // 搜索到设备的 deviceId
					success: (res) => {
						if (that.service) {
							return
						}

						for (let i = 0; i < res.services.length; i++) {
							console.log('获取蓝牙低功耗设备所有服务成功', res.services)

							// 可根据具体业务需要，选择一个主服务进行通信（透传服务的UUID为0xFFF0）
							if (res.services[i].uuid.indexOf('0000FFF0') >= 0) {
								that.service = res.services[i]
								Command.ServiceId = that.service.uuid
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
					deviceId: this.deviceId,
					serviceId: this.service.uuid,
					success: (res) => {
						console.log('获取特征成功', res.characteristics)
						this.characteristics = res.characteristics

						for (var i = 0; i < res.characteristics.length; i++) {
							var item = res.characteristics[i]

							if (item.uuid.indexOf('0000FFF2') >= 0) {
								this.characteristicId_2 = item.uuid
								Command.CharacteristicId = this.characteristicId_2
							} else if (item.uuid.indexOf('0000FFF3') >= 0) {}
						}

						//启用蓝牙低功耗设备特征值变化时的 notify 功能，订阅特征
						this.notifyBLECharacteristicValueChange()
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
							deviceId: that.deviceId,
							serviceId: that.service.uuid,
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

				this.connected = true
			},
			scanCode() {
				var that = this

				uni.scanCode({
					onlyFromCamera: true,
					success(res) {
						console.log(res)
						var val = ProcessingQrCodeInfo(res, that.$mp.page.route)
						console.log('蓝牙地址', val)
						if (val) {
							that.deviceMACAddress = val
							that.isNeedScan = false

							that.operationProcess = '自助交账'
							that.autoConnect()
						} else {
							uni.showToast({
								icon: 'none',
								title: '请扫描正确的二维码'
							})
						}
					},
					fail(res) {
						console.log(res)
						uni.showToast({
							icon: 'none',
							title: '未扫描二维码'
						})
					}
				})
			},
			//获取用户的手机号
			async getPhoneNumber(e) {
				var that = this
				console.log('获取手机号code', e.detail.code)

				if (e.detail.code) {

					//根据code换取用户的手机号
					var numberRes = await that.$WXApi.GetPhoneNumber({
						'code': e.detail.code
					})

					console.log('请求获取手机号接口', numberRes)
					if (numberRes.result) {
						if (numberRes.result.errcode == 0) {
							//获取到用户的手机号不含区号
							var phoneNum = numberRes.result.phone_info.purePhoneNumber

							//根据手机号查询用户信息
							var result = that.getBaseStaffInfoForApp(phoneNum)
							if (result && result.success == true) {
								//认证通过后自动连接蓝牙
								that.autoConnect()

								var data = ['01']
								var timeBCDArr = Command.GetCurrentTimeAsBCDArr()
								data = data.concat(timeBCDArr)

								//data.unshift('01')//只更新时间 '0F'全部更新

								var shellInfo = await Command.WriteBLEAndWaitForResponse(Command.CmdId.GetShellInfo,
									data)
								//根据蓝牙获取到的投币机ID，再次调用getBaseStaffInfoForApp，获取员工、线路、车辆信息
								if (shellInfo.Status == true) {
									result = that.getBaseStaffInfoForApp(phoneNum, shellInfo.ShellId)

									if (result && result.success == true) {
										data = ['0F']
										timeBCDArr = Command.GetCurrentTimeAsBCDArr()
										data = data.concat(timeBCDArr)

										data.push(DecToHexStr(result.ticketPrice))

										var routeArr = Array(20).fill('00')
									}
								} else {
									uni.showToast({
										icon: 'none',
										title: '获取投币机信息失败-蓝牙'
									})
								}
							}
						} else {
							uni.showToast({
								icon: 'none',
								title: '获取手机号失败'
							})
						}
					} else {
						console.log('获取手机号无结果')
					}
				}
			},
			async getBaseStaffInfoForApp(phoneNum, shellId = '') {
				var that = this

				var data = {
					'PhoneNum': phoneNum,
					'ShellID': shellId
				}

				console.log('接口请求参数', data)

				var result = await that.$Api.Staff_GetBaseStaffInfoForApp(data)
				return result
			},
			async getShellInfo() {
				var that = this

				var phoneNum = '15618693587'

				//根据手机号查询用户信息
				var res = await that.$Api.Staff_GetBaseStaffInfoForApp({
					'PhoneNum': '15618693587'
				})
				//var res = that.getBaseStaffInfoForApp(phoneNum, '')
				if (res) {
					//认证通过后自动连接蓝牙
					//that.autoConnect()

					console.log('获取员工信息成功', res)

					var data = ['01'] //只更新时间
					var timeBCDArr = Command.GetCurrentTimeAsBCDArr()
					console.log('时间数组', timeBCDArr)
					data = data.concat(timeBCDArr)

					//data.unshift('01')//只更新时间 '0F'全部更新

					console.log('只更新时间-蓝牙请求', data)

					var responseResult = await Command.WriteBLEAndWaitForResponse(Command.CmdId.GetShellInfo, data)
					//根据蓝牙获取到的投币机ID，再次调用getBaseStaffInfoForApp，获取员工、线路、车辆信息

					console.log('只更新时间-蓝牙回复', responseResult)

					if (responseResult.Status == true) {
						that.boxInfo = responseResult.Data
						that.SecretKey = responseResult.Data.SecretKey

						res = await that.$Api.Staff_GetBaseStaffInfoForApp({
							'PhoneNum': that.PhoneNum,
							'ShellID': responseResult.Data.ShellId
						})

						if (res) {
							that.staffInfo.staffCardID = res.result.staffCardID
							that.staffInfo.vehicleCode = res.result.vehicleCode
							that.staffInfo.routeName = res.result.routeName
							that.staffInfo.ticketPrice = res.result.ticketPrice

							data = ['0F'] //更新全部数据

							//当前时间
							timeBCDArr = Command.GetCurrentTimeAsBCDArr()
							data = data.concat(timeBCDArr)

							//票价
							data.push(DecToHexStr(that.staffInfo.ticketPrice * 10))

							//线路号
							data = data.concat(PadArrayWithZeros(SplitHexString(DecToHexStr(that.staffInfo
								.routeName)), 20))

							//车辆编号
							data = data.concat(PadArrayWithZeros(SplitHexString(DecToHexStr(that.staffInfo
								.vehicleCode)), 12))

							responseResult = await Command.WriteBLEAndWaitForResponse(Command.CmdId.GetShellInfo, data)
							console.log('信息全部更新-蓝牙回复', responseResult)

							if (responseResult.Status == true) {
								that.SecretKey = responseResult.Data.SecretKey
							}
						}
					} else {
						uni.showToast({
							icon: 'none',
							title: '获取投币机信息失败-蓝牙'
						})
					}
				}
			},
			async signIn() {
				var that = this

				var data = ['01']

				//当前时间
				var timeBCDArr = Command.GetCurrentTimeAsBCDArr()
				data = data.concat(timeBCDArr)

				//驾驶员卡ID
				var idHexArr = PadArrayWithZeros(SplitHexString(DecToHexStr(this.staffInfo.staffCardID)), 16)
				data = data.concat(idHexArr)

				//加密秘钥
				data = data.concat(this.SecretKey)

				var responseResult = await Command.WriteBLEAndWaitForResponse(Command.CmdId.SignIn, data, this
					.SecretKey)
				console.log('驾驶员签到-蓝牙回复', responseResult)
				if (responseResult.Status == true) {
					that.SecretKey = responseResult.Data.SecretKey
				}
			},
			async signOut() {
				var data = ['01']

				//当前时间
				var timeBCDArr = Command.GetCurrentTimeAsBCDArr()
				data = data.concat(timeBCDArr)

				//驾驶员卡ID
				var idHexArr = PadArrayWithZeros(SplitHexString(DecToHexStr(this.staffInfo.staffCardID)), 16)
				data = data.concat(idHexArr)

				//加密秘钥
				data = data.concat(this.SecretKey)

				var responseResult = await Command.WriteBLEAndWaitForResponse(Command.CmdId.SignOut, data, this
					.SecretKey)
				console.log('驾驶员签退-蓝牙回复', responseResult)
				if (responseResult.Status == true) {
					this.SecretKey = responseResult.Data.SecretKey
				}
			},
			async unBox() {
				var isNeedRequest = true
				var order = 1 //从1开始，重复操作必须保持序号不变，否则每次加1，256溢出归零
				while (isNeedRequest) {
					var data = ['01']
					
					//当前时间
					var timeBCDArr = Command.GetCurrentTimeAsBCDArr()
					data = data.concat(timeBCDArr)

					//驾驶员卡ID
					var idHexArr = PadArrayWithZeros(SplitHexString(DecToHexStr(this.staffInfo.staffCardID)), 16)
					data = data.concat(idHexArr)

					//状态码
					data.push('01') //01：读数据;02：投币机开箱;

					//命令序号
					data.push(order)

					//加密秘钥
					data = data.concat(this.SecretKey)

					var responseResult = await Command.WriteBLEAndWaitForResponse(Command.CmdId.UnBox, data, this
						.SecretKey)
					console.log('驾驶员开箱-蓝牙回复', responseResult)
					if (responseResult.Status == true) {
						this.SecretKey = responseResult.Data.SecretKey
						
						//判断是否还有未读取记录
						isNeedRequest = responseResult.Data.UnreadDataRows > 0

						var deviceRecord = responseResult.Data.DeviceRecord
						var apiData = []

						if (deviceRecord.length > 0) {
							for (var i = 0; i < deviceRecord.length; i++) {
								var item = {
									"actionOrder": deviceRecord[i].Order, //记录序号
									"recordType": deviceRecord[i].Type, // 记录类型 1分班投币机记录 2当天投币记录
									"recordTime": deviceRecord[i].Time, // 记录时间
									"signInTime": deviceRecord[i].SignInTime, // 签到时间
									"signOutTime": deviceRecord[i].SignOutTime, // 签退时间
									"shellID": deviceRecord[i].ShellId, // 投币箱ID
									"vehicleCode": deviceRecord[i].VehicleCode, // 当时所属车辆编号
									"routeName": deviceRecord[i].Route, // 当时所属线路
									"boxID": deviceRecord[i].BoxId, // 内胆编号
									"phoneNum": this.PhoneNum, //手机号码
									"staffCardID": deviceRecord[i].StaffCardId, //驾驶员卡号
									"paperAmount": deviceRecord[i].Paper, // 纸币金额
									"coinAmount": deviceRecord[i].Coins, // 硬币金额
									"peopleCount": deviceRecord[i].PeopleCount, // 投币人次
									"hasCounted": false, //是否点钞
									"countingAmount": 0, //点钞金额
									"foreignNum": 0, //异币张数
									"remark": "", //备注
									"ssCashierImages": [] //照片
								}

								apiData.push(item)
							}
						}
						
						order += 1
						console.log('自助交账数据包', apiData)
					}
				}
			},
			//选择照片
			selectPhoto(e) {
				console.log(e)
			},
			//删除照片
			deletePhoto(e) {
				console.log(e)
			},
			submit: Throttle(function() {
				var that = this

				that.$refs.recordFrom.validate().then(res => {
					console.log('提交')

					var photoVoucher = []

					//处理上传图片参数
					for (var i = 0; i < that.recordFromData.PhotoVoucher.length; i++) {
						console.log(that.recordFromData.PhotoVoucher[i].path)

						var path = that.recordFromData.PhotoVoucher[i].path
						GetImageBase64_ReadFile(path).then((res) => {
							photoVoucher.push({
								'imageName': "照片_" + i + path.substring(path.indexOf('.')),
								'imageData': res
							})
						})
					}

					var data = {
						"recordTime": Date.now(), // 记录时间
						"shellID": boxInfo.ShellId, // 投币箱ID
						"vehicleCode": that.staffInfo.vehicleCode, // 当时所属车辆编号
						"routeName": that.staffInfo.routeName, // 当时所属线路
						"boxID": boxInfo.BoxId, // 内胆编号
						"phoneNum": that.PhoneNum, //手机号码
						"staffCardID": that.staffInfo.staffCardID, //驾驶员卡号
						"hasCounted": true, //是否点钞
						"countingAmount": 0, //点钞金额
						"foreignNum": 0, //异币张数
						"remark": "", //备注
						"ssCashierImages": photoVoucher //照片
					}

					this.$Api.SubmitSelfServiceCashier(JSON.stringify(data)).then((apiRes) => {
						if (result) {
							console.log('新增自助交账记录成功')
						}
					})
				}).catch(err => {
					console.log('err', err)
				})
			})
		}
	}
</script>

<style lang="scss">
	page {
		width: 100%;
		height: 100%;

		.content {
			width: inherit;
			height: inherit;
			display: flex;
			align-items: center;
			justify-content: center;

			.mask {
				width: inherit;

				button {
					width: 65%;
					color: white;
					border-radius: 25rpx;
					font-size: 50rpx;
					background: linear-gradient(-5deg, #00ccff, #003366);
					height: 170rpx;
					line-height: 170rpx;
				}
			}

			.operation {
				width: 90%;
				align-items: center;

				view {
					margin: 10rpx 0rpx;
				}

				button {
					color: white;
					border-radius: 25rpx;
					background: linear-gradient(-5deg, #00ccff, #003366);
					margin: 50rpx 0rpx;
					height: 170rpx;
					line-height: 170rpx;
				}

				.boxInfo {
					border: 2rpx solid #003366;
					border-radius: 50rpx;
					padding: 30rpx;
					color: #003366;
					font-size: 42rpx;
					font-weight: bolder;
				}
			}

			.payment {
				width: 90%;

				.boxAmountInfo {
					color: #003366;
					border: 2rpx solid #003366;
					border-radius: 50rpx;
					padding: 30rpx;
					margin-bottom: 80rpx;

					view {
						font-weight: bolder;
						margin-bottom: 20rpx;
					}

					.title {
						text-align: center;
						font-size: 50rpx;
					}
				}

				.submit {
					color: white;
					border-radius: 60rpx;
					background: linear-gradient(-5deg, #00ccff, #003366);
				}
			}
		}
	}
</style>