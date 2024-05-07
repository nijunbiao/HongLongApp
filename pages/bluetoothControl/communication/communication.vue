<template>
	<view class="content">
		<uni-segmented-control :current="current" :values="items" @clickItem="onClickItem" styleType="text"
			activeColor="#003366"></uni-segmented-control>
		<view class="content">
			<view v-show="current === 0">
				<!-- 设备详情 -->
				<uni-collapse>
					<uni-collapse-item title="设备信息" :open="true">
						<uni-section title="设备名称" type="line"></uni-section>
						<text>{{ deviceInfo.DeviceName }}</text>
						<uni-section title="硬件版本" type="line"></uni-section>
						<text>{{ deviceInfo.VWVersion }}</text>
						<uni-section title="软件版本" type="line"></uni-section>
						<text>{{ deviceInfo.SWVersion }}</text>
						<uni-section title="生成日期" type="line"></uni-section>
						<text>{{ deviceInfo.BuildDate }}</text>
					</uni-collapse-item>
					<uni-collapse-item title="设备状态" :open="true">
						<uni-section title="红外口状态" type="line"></uni-section>
						<uni-row>
							<uni-col :span="12"><text
									:style="{ 'background-color': deviceRealTimeStatus.InfraredState_BackColor }">{{ deviceRealTimeStatus.InfraredState }}</text></uni-col>
							<uni-col :span="12"><text
									:style="{ 'background-color': deviceRealTimeStatus.InfraredStatus_BackColor }">{{ deviceRealTimeStatus.InfraredStatus }}</text></uni-col>
						</uni-row>
						<uni-section title="装机光电状态" type="line"></uni-section>
						<text
							:style="{ 'background-color': deviceRealTimeStatus.PhotoelectricityStatus_BackColor }">{{ deviceRealTimeStatus.PhotoelectricityStatus }}</text>
						<uni-section title="入钞电机" type="line"></uni-section>
						<text
							:style="{ 'background-color': deviceRealTimeStatus.MotorStatus_BackColor }">{{ deviceRealTimeStatus.MotorStatus }}</text>
						<uni-section title="机构锁电机" type="line"></uni-section>
						<uni-row>
							<uni-col :span="12"><text
									:style="{ 'background-color': deviceRealTimeStatus.ShellMotorState_BackColor }">{{ deviceRealTimeStatus.ShellMotorState }}</text></uni-col>
							<uni-col :span="12"><text
									:style="{ 'background-color': deviceRealTimeStatus.ShellMotorStatus_BackColor }">{{ deviceRealTimeStatus.ShellMotorStatus }}</text></uni-col>
						</uni-row>
						<uni-section title="内胆锁电机" type="line"></uni-section>
						<uni-row>
							<uni-col :span="12"><text
									:style="{ 'background-color': deviceRealTimeStatus.BoxMotorState_BackColor }">{{ deviceRealTimeStatus.BoxMotorState }}</text></uni-col>
							<uni-col :span="12"><text
									:style="{ 'background-color': deviceRealTimeStatus.BoxMotorStatus_BackColor }">{{ deviceRealTimeStatus.BoxMotorStatus }}</text></uni-col>
						</uni-row>
						<uni-section title="箱门锁LED" type="line"></uni-section>
						<text
							:style="{ 'background-color': deviceRealTimeStatus.ShellLockLed_BackColor }">{{ deviceRealTimeStatus.ShellLockLed }}</text>
						<uni-section title="机构锁LED" type="line"></uni-section>
						<text
							:style="{ 'background-color': deviceRealTimeStatus.MotorLockLed_BackColor }">{{ deviceRealTimeStatus.MotorLockLed }}</text>
						<uni-section title="钞箱满LED" type="line"></uni-section>
						<text
							:style="{ 'background-color': deviceRealTimeStatus.ShellFullLed_BackColor }">{{ deviceRealTimeStatus.ShellFullLed }}</text>
						<uni-section title="故障LED" type="line"></uni-section>
						<text
							:style="{ 'background-color': deviceRealTimeStatus.FaultLed_BackColor }">{{ deviceRealTimeStatus.FaultLed }}</text>
						<uni-section title="背光板LED" type="line"></uni-section>
						<text
							:style="{ 'background-color': deviceRealTimeStatus.BacklightLed_BackColor }">{{ deviceRealTimeStatus.BacklightLed }}</text>
					</uni-collapse-item>
				</uni-collapse>
			</view>
			<view v-show="current === 1">
				<!-- 设备测试 -->
				<button type="primary" @click="startTest" :disabled="isTest">开始测试</button>

				<uni-section title="基本信息" type="line" @click="getId"></uni-section>
				<uni-row>
					<uni-col :span="24"><text>{{ basicInfo.ShellId }}</text></uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="24"><text>{{ basicInfo.BoxId }}</text></uni-col>
				</uni-row>

				<uni-section title="机构锁测试(开)" type="line" @click="fbInnerUnLock"></uni-section>
				<uni-row>
					<uni-col>
						<text>{{ fbInnerUnLockInfo.Data }}</text>
					</uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fbInnerUnLockInfo.State_BackColor }">{{ fbInnerUnLockInfo.State }}</text></uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fbInnerUnLockInfo.Status_BackColor }">{{ fbInnerUnLockInfo.Status }}</text></uni-col>
				</uni-row>
				<uni-section title="机构锁测试(关)" type="line" @click="fbInnerLock"></uni-section>
				<uni-row>
					<uni-col>
						<text>{{ fbInnerLockInfo.Data }}</text>
					</uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fbInnerLockInfo.State_BackColor }">{{ fbInnerLockInfo.State }}</text></uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fbInnerLockInfo.Status_BackColor }">{{ fbInnerLockInfo.Status }}</text></uni-col>
				</uni-row>
				<uni-section title="内胆锁测试(开)" type="line" @click="fareBoxUnLock"></uni-section>
				<uni-row>
					<uni-col>
						<text>{{ fareBoxUnLockInfo.Data }}</text>
					</uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fareBoxUnLockInfo.State_BackColor }">{{ fareBoxUnLockInfo.State }}</text></uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fareBoxUnLockInfo.Status_BackColor }">{{ fareBoxUnLockInfo.Status }}</text></uni-col>
				</uni-row>
				<uni-section title="内胆锁测试(关)" type="line" @click="fareBoxLock"></uni-section>
				<uni-row>
					<uni-col>
						<text>{{ fareBoxLockInfo.Data }}</text>
					</uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fareBoxLockInfo.State_BackColor }">{{ fareBoxLockInfo.State }}</text></uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fareBoxLockInfo.Status_BackColor }">{{ fareBoxLockInfo.Status }}</text></uni-col>
				</uni-row>
				<uni-section title="电机测试(入币)" type="line" @click="fbCoinInsert"></uni-section>
				<uni-row>
					<uni-col>
						<text>{{ fbCoinInsertInfo.Data }}</text>
					</uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fbCoinInsertInfo.AvgCurrent_BackColor }">{{ fbCoinInsertInfo.AvgCurrent }}</text></uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fbCoinInsertInfo.Speed_BackColor }">{{ fbCoinInsertInfo.Speed }}</text></uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fbCoinInsertInfo.Hall_BackColor }">{{ fbCoinInsertInfo.Hall }}</text></uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fbCoinInsertInfo.MotorState_BackColor }">{{ fbCoinInsertInfo.MotorState }}</text></uni-col>
				</uni-row>
				<uni-section title="电机测试(退币)" type="line" @click="fbCoinReturn"></uni-section>
				<uni-row>
					<uni-col>
						<text>{{ fbCoinReturnInfo.Data }}</text>
					</uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fbCoinReturnInfo.AvgCurrent_BackColor }">{{ fbCoinReturnInfo.AvgCurrent }}</text></uni-col>
					<uni-col :span="12">
						<text
							:style="{ 'background-color': fbCoinReturnInfo.Speed_BackColor }">{{ fbCoinReturnInfo.Speed }}</text></uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="12"><text
							:style="{ 'background-color': fbCoinReturnInfo.Hall_BackColor }">{{ fbCoinReturnInfo.Hall }}</text></uni-col>
					<uni-col :span="12"><text
							:style="{ 'background-color': fbCoinReturnInfo.MotorState_BackColor }">{{ fbCoinReturnInfo.MotorState }}</text></uni-col>
				</uni-row>
				<uni-section title="红外口测试" type="line" @click="infraredCorrection"></uni-section>
				<uni-row>
					<uni-col>
						<text>{{ infraredCorrectionInfo.Data }}</text>
					</uni-col>
					<uni-col :span="12"><text
							:style="{ 'background-color': infraredCorrectionInfo.InfOnVoltage_BackColor }">{{ infraredCorrectionInfo.InfOnVoltage }}</text></uni-col>
					<uni-col :span="12"><text
							:style="{ 'background-color': infraredCorrectionInfo.InfOffVoltage_BackColor }">{{ infraredCorrectionInfo.InfOffVoltage }}</text></uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="12"><text
							:style="{ 'background-color': infraredCorrectionInfo.DutyCycle_BackColor }">{{ infraredCorrectionInfo.DutyCycle }}</text></uni-col>
					<uni-col :span="12"><text
							:style="{ 'background-color': infraredCorrectionInfo.InfVoltageDiff_BackColor }">{{ infraredCorrectionInfo.InfVoltageDiff }}</text></uni-col>
				</uni-row>
				<uni-section title="LED测试" type="line" @click="LedDisplay"></uni-section>
			</view>
			<view v-show="current === 2">
				<!-- 设备升级 -->
			</view>
		</view>
	</view>
</template>

<script>
	import buletoothCommand from '@/pages/bluetoothControl/buletoothCommand.js'
	import {
		Sleep
	} from '@/utils/tool.js'
	export default {
		data() {
			return {
				items: ['设备详情', '设备测试', '设备升级'],
				current: 0,
				pageParameter: null,
				deviceInfo_IntervalId: -1,
				deviceRealTimeStatus_IntervalId: -1,
				deviceInfo: {}, //设备信息
				deviceRealTimeStatus: {}, //设备实时状态
				basicInfo: {}, //基础信息
				fbInnerLockInfo: {},
				fbInnerUnLockInfo: {},
				fareBoxLockInfo: {},
				fareBoxUnLockInfo: {},
				fbCoinInsertInfo: {},
				fbCoinReturnInfo: {},
				infraredCorrectionInfo: {},
				receiveResult: null, //请求结果
				//testDisabled: false,
				isTest: false,
				test_DeviceRealTimeStatus: {}
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

			this.pageParameter = query
			console.log('query', this.pageParameter)

			this.onload()
		},
		onHide() {
			console.log('触发onHide方法')
			this.closeConnection()
		},
		onUnload() {
			console.log('触发onUnload方法')
			this.closeConnection()
		},
		watch: {
			deviceInfo(newVal, oldVal) {
				if (this.deviceInfo_IntervalId != -1) {
					clearInterval(this.deviceInfo_IntervalId)
					this.deviceInfo_IntervalId = -1
				}

				console.log('-----------添加实时状态刷新方法------------')
				this.deviceRealTimeStatus_IntervalId = setInterval(this.queryDeviceRealTimeStatus, 800)
			},
			isTest(newVal, oldVal){
				buletoothCommand.IsTest = this.isTest
			},
			// test_DeviceRealTimeStatus(newVal, oldVal){
			// 	if(this.isTest){
			// 		this.getId()
			// 	}
			// },
			// basicInfo(newVal, oldVal){
			// 	if(this.isTest){
			// 		this.fbInnerUnLock()
			// 	}
			// },
			// fbInnerUnLockInfo(newVal, oldVal){
			// 	if(this.isTest){
			// 		this.fbInnerLock()
			// 	}
			// },
			// fbInnerLockInfo(newVal, oldVal){
			// 	if(this.isTest){
			// 		this.fareBoxUnLock()
			// 	}
			// },
			// fareBoxUnLockInfo(newVal, oldVal){
			// 	if(this.isTest){
			// 		this.fareBoxLock()
			// 	}
			// },
			// fareBoxLockInfo(newVal, oldVal){
			// 	if(this.isTest){
			// 		this.fbCoinInsert()
			// 	}
			// },
			// fbCoinInsertInfo(newVal, oldVal){
			// 	if(this.isTest){
			// 		this.fbCoinReturn()
			// 	}
			// },
			// fbCoinReturnInfo(newVal, oldVal){
			// 	if(this.isTest){
			// 		this.infraredCorrection()
			// 	}
			// },
			// infraredCorrectionInfo(newVal, oldVal){
			// 	if(this.isTest){
			// 		//this.LedDisplay()
			// 		this.isTest = false
			// 		buletoothCommand.IsTest = this.isTest
			// 	}
			// },
		},
		methods: {
			onload() {
				this.onBLEConnectionStateChange()

				buletoothCommand.InitJs(this)

				//this.queryDeviceInfo()
				
				this.$nextTick(() => {
					this.queryDeviceInfo()
				})
				//this.deviceInfo_IntervalId = setInterval(this.queryDeviceInfo, 1500)
			},
			closeConnection() {
				if (this.deviceRealTimeStatus_IntervalId != -1) {
					clearInterval(this.deviceRealTimeStatus_IntervalId)
				}

				if (this.pageParameter && this.pageParameter.DeviceId && this.pageParameter.DeviceId.length > 0) {
					var deviceId = this.pageParameter.DeviceId
					this.pageParameter = null

					uni.closeBLEConnection({
						deviceId: deviceId,
						success: (res) => {
							uni.showToast({
								icon: 'none',
								title: '断开成功'
							})

							console.log('断开成功', res)
						},
						fail: (res) => {
							uni.showToast({
								icon: 'none',
								title: '断开失败'
							})
							console.log('断开失败', res)
						}
					})


					uni.navigateBack()
				}

				uni.closeBluetoothAdapter({
					success: (res) => {
						this.text = '关闭蓝牙模块'
					},
					fail: (res) => {
						this.text = '关闭蓝牙模块失败'
					}
				})
			},
			onBLEConnectionStateChange() {
				var that = this

				uni.onBLEConnectionStateChange(function(res) {
					if (!res.connected) {
						console.log('断开连接')

						if (that.deviceRealTimeStatus_IntervalId != -1) {
							clearInterval(that.deviceRealTimeStatus_IntervalId)
							that.deviceRealTimeStatus_IntervalId = -1
						}

						that.closeConnection()
					} else {
						console.log('连接中')
					}
				})
			},
			onClickItem(e) {
				if (this.current != e.currentIndex) {
					this.current = e.currentIndex

					if (this.current == 0) {
						this.deviceRealTimeStatus_IntervalId = setInterval(this.queryDeviceRealTimeStatus, 800)
						console.log('-----------添加循环方法', this.deviceRealTimeStatus_IntervalId)
					} else {
						if (this.deviceRealTimeStatus_IntervalId != -1) {
							clearInterval(this.deviceRealTimeStatus_IntervalId)
							this.deviceRealTimeStatus_IntervalId = -1
							//buletoothCommand.CommandList = []

							console.log('-----------移除循环方法', this.deviceRealTimeStatus_IntervalId)
						}
					}
				}
			},
			async startTest() {
				this.isTest = true

				await this.getId()
				
				this.test_DeviceRealTimeStatus = {
					ShellLockStatus: buletoothCommand.ShellLockStatus.入钞口开,
					BoxLockStatus: buletoothCommand.BoxLockStatus.门锁关
				}
				await this.queryDeviceRealTimeStatus()

				if (this.test_DeviceRealTimeStatus.ShellLockStatus != buletoothCommand.ShellLockStatus.入钞口开) {
					await this.fbInnerLock()
				}

				await this.fbInnerUnLock()

				await this.fbInnerLock()

				if (this.test_DeviceRealTimeStatus.BoxLockStatus != buletoothCommand.BoxLockStatus.门锁关) {
					await this.fareBoxLock()
				}

				await this.fareBoxUnLock()

				await this.fareBoxLock()

				await this.fbCoinInsert()

				await this.fbCoinReturn()

				await this.infraredCorrection()

				await this.LedDisplay()

				this.isTest = false
			},
			async queryDeviceInfo() {
			 	var result = await buletoothCommand.WriteBLEAndWaitForResponse(buletoothCommand.CMDTypeSend.Query, buletoothCommand.CMDQuerySend
					.QueryDeviceInfo)
				this.deviceInfo = result.Data
			},
			async queryDeviceRealTimeStatus() {
				var result = await buletoothCommand.WriteBLEAndWaitForResponse(buletoothCommand.CMDTypeSend.Query, buletoothCommand.CMDQuerySend
					.QueryRealTimeStatus)
				this.isTest ? this.test_DeviceRealTimeStatus : this.deviceRealTimeStatus = result.Data
			},
			async getId() {
				var result = await buletoothCommand.WriteBLEAndWaitForResponse(buletoothCommand.CMDTypeSend.Query, buletoothCommand.CMDQuerySend.GetID)
				this.basicInfo = result.Data
			},
			async fbInnerUnLock() {
				var result = await buletoothCommand.WriteBLEAndWaitForResponse(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.FBInnerUnLock, buletoothCommand.TestPassword_Bytes)
				this.fbInnerUnLockInfo  = result.Data
			},
			async fbInnerLock() {
				var result = await buletoothCommand.WriteBLEAndWaitForResponse(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.FBInnerLock, buletoothCommand.TestPassword_Bytes)
				this.fbInnerLockInfo = result.Data
			},
			async fareBoxUnLock() {
				var result = await buletoothCommand.WriteBLEAndWaitForResponse(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.FareBoxUnLock, buletoothCommand.TestPassword_Bytes)
				this.fareBoxUnLockInfo = result.Data
			},
			async fareBoxLock() {
				var result = await buletoothCommand.WriteBLEAndWaitForResponse(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.FareBoxLock, buletoothCommand.TestPassword_Bytes)
				this.fareBoxLockInfo = result.Data
			},
			async fbCoinInsert() {
				var result = await buletoothCommand.WriteBLEAndWaitForResponse(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.FBCoinInsert)
				this.fbCoinInsertInfo = result.Data
			},
			async fbCoinReturn() {
				var result = await buletoothCommand.WriteBLEAndWaitForResponse(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.FBCoinReturn)
				this.fbCoinReturnInfo = result.Data
			},
			async infraredCorrection() {
				var result = await buletoothCommand.WriteBLEAndWaitForResponse(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.InfraredCorrection)
				this.infraredCorrectionInfo = result.Data
			},
			LedDisplay() {
				buletoothCommand.WriteBLEAndWaitForResponse(buletoothCommand.CMDTypeSend.Control, buletoothCommand.CMDControlSend
					.LedDisplay)
			}
		}
	}
</script>

<style scoped>
	/deep/.uni-collapse-item__title-box {
		padding: 0;
	}

	/deep/.uni-section .uni-section-header__content {
		font-weight: bolder;
	}
</style>

<style lang="scss">
	page {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);

		.content {
			text {
				font-size: 14px;
				margin-left: 30rpx;
			}
		}
	}
</style>