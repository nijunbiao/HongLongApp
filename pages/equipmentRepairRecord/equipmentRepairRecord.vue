<template>
	<view class="content">
		<uni-notice-bar show-icon scrollable speed="80" background-color="transparent" :color="reportProcess == '扫码' ? '#000000' : '#ffffff'"
			text="非常感谢您提出的宝贵建议，我们会在进行落实后给您一个满意的答复。" />
		<template v-if="reportProcess == '扫码'">
			<view class="scanCode">
				<text class="tip">请先扫描主控机上的报修二维码！</text>
				<button type="primary" @click="scanCode">扫码</button>
			</view>
		</template>
		<template v-else>
			<view class="reportInfo">
				<text class="terminalCode">主机编号：{{terminalInfo.terminalCode ? terminalInfo.terminalCode : '未知'}}</text>
				<uni-forms class="reportFrom" ref="reportFrom" :rules="customRules" :modelValue="reportFormData"
					label-position="top">
					<uni-forms-item label="设备类型" required name="DeviceParam">
						<uni-data-picker :readonly="readonly" :localdata="deviceParamData"
							v-model="reportFormData.DeviceParam" placeholder="请选择设备类型(必填)" popup-title="请选择要报修的设备">
						</uni-data-picker>
					</uni-forms-item>
					<uni-forms-item label="报修类型" required name="RepairReason">
						<picker :disabled="readonly" :range="repairReasonData" range-key="dicName" header-text="报修类型"
							mode="selector" @change="pickerChange">
							<view class="picker">
								<template v-if="reportFormData.RepairReason == ''">
									<text class="placeholder">请选择报修类型(必填)</text>
								</template>
								<template v-else>
									{{ reportFormData.RepairReason }}
								</template>
							</view>
						</picker>
					</uni-forms-item>
					<uni-forms-item label="详细说明">
						<uni-easyinput :disabled="readonly" v-model="reportFormData.ReasonRemark" type="textarea"
							maxlength="100" placeholder="可详细说明原因">
						</uni-easyinput>
					</uni-forms-item>
				</uni-forms>
				<button open-type="getPhoneNumber" v-show="reportProcess == '获取手机号'"
					@getphonenumber="getPhoneNumber">获取手机号</button>
				<button type="primary" v-show="reportProcess == '提交'" @click="submit">提交</button>
				
				<button class="cancel" @click="cancel">取消</button>
			</view>
		</template>
	</view>
</template>

<script>
	import {
		Throttle,
		GenerateGuid,
		DecryptByDES,
		Sleep,
		StrToDate,
		ProcessingQrCodeInfo
	} from '@/utils/tool.js'
	import {
		GetVisitorHLToken
	} from '@/common/common.js'
	export default {
		data() {
			return {
				readonly: true,
				// 自定义表单数据
				reportFormData: {
					DeviceParam: '',
					RepairReason: '',
					ReasonRemark: '',
					PhoneNum: ''
				},
				// 自定义表单校验规则
				customRules: {
					DeviceParam: {
						rules: [{
							required: true,
							errorMessage: '设备类型不能为空'
						}]
					},
					RepairReason: {
						rules: [{
							required: true,
							errorMessage: '报修类型不能为空'
						}]
					}
				},
				//报修流程（'扫码'，'获取手机号'，'注册'）
				reportProcess: '获取手机号',
				//判读是否有入参scene（用来报修后的逻辑判断）
				haveScene: false,
				//报修人信息
				staffInfo: null,
				//主控机信息
				terminalInfo: null,
				//设备类型数据
				deviceParamData: [{
						text: "主机柜",
						value: "主机柜",
						children: []
					},
					{
						text: "钥匙柜",
						value: "钥匙柜",
						children: []
					},
					{
						text: "内胆柜",
						value: "内胆柜",
						children: []
					},
					{
						text: "其它",
						value: "其它",
						children: []
					}
				],
				//报修类型数据
				repairReasonData: []
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

			//query.scene = 'BEvGlXDsVJI='
			this.load(query)
		},
		onShow() {
			uni.hideHomeButton()
		},
		methods: {
			pickerChange(e) {
				this.reportFormData.RepairReason = this.repairReasonData[e.detail.value].dicName
				console.log(e)
			},
			async load(query) {			
				if (query.scene) {
					this.haveScene = true
					var result = await GetVisitorHLToken()
					if (!result) {
						console.log('获取HLToken失败')
						return
					}
					this.parsingQrCode(query.scene)
				}else{
					this.reportProcess = '扫码'
				}
			},
			//获取用户的手机号
			async getPhoneNumber(e) {
				console.log(e.detail.code)

				if (e.detail.code) {
					var that = this

					//根据code换取用户的手机号
					var numberRes = await this.$WXApi.GetPhoneNumber({
						'code': e.detail.code
					})

					console.log(numberRes)
					if (numberRes.result) {
						if (numberRes.result.errcode == 0) {
							//获取到用户的手机号不含区号
							that.reportFormData.PhoneNum = numberRes.result.phone_info.purePhoneNumber

							//根据手机号查询用户信息
							that.getStaffInfoByPhoneNum()
						} else {
							that.reportFormData.PhoneNum = ''
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
			//根据手机号查询用户信息
			getStaffInfoByPhoneNum() {
				this.$Api.Staff_GetPaged({
					'PhoneNum': this.reportFormData.PhoneNum
				}).then((res) => {
					console.log(res)
					if (res) {
						if (res.result.items && res.result.items.length > 0) {
							var staff = res.result.items.filter((s) => s.examineState == '已审核')
							if (staff && staff.length > 0) {
								this.staffInfo = staff[0]
								this.reportProcess = '提交'
							} else {
								uni.showToast({
									icon: "none",
									title: "信息还未通过审核"
								})
							}
						} else {
							uni.showToast({
								icon: "none",
								title: "当前手机未注册"
							})
						}
					}
				})
			},
			//解析扫描出或传递过来的加密信息
			async parsingQrCode(scene) {
				var that = this
				var param = decodeURIComponent(scene)

				//DES解密
				param = DecryptByDES(param)
				console.log(param)
				if (param) {
					//param为主控机的Id
					//1.根据主控机Id查它所属TenantId
					this.$Api.GetControlTerminalListWithCabinet({
						'TerminalId': param
					}).then((terminalRes) => {
						console.log(terminalRes)
						if (terminalRes.result && terminalRes.result.items.length > 0) {
							that.readonly = false
							that.terminalInfo = terminalRes.result.items[0]
							//给选择器数据源添加钥匙柜信息
							that.deviceParamData[1].children = [] //初始化子节点
							for (var i = 1; i <= that.$Global.LockerNum; i++) {
								that.deviceParamData[1].children.push({
									'text': i + '号格',
									'value': that.deviceParamData[1].value + '||' + i
								})
							}

							//给选择器数据源添加内胆柜信息
							that.deviceParamData[2].children = [] //初始化子节点
							for (var i = 0; i < that.terminalInfo.boxCabinets.length; i++) {
								var boxCabinetNo = that.terminalInfo.boxCabinets[i].boxCabinetNo
								that.deviceParamData[2].children.push({
									'text': boxCabinetNo + '号柜',
									'value': that.deviceParamData[2].value + '||' + boxCabinetNo
								})

								that.deviceParamData[2].children[i].children = [] //初始化子节点
								for (var j = 1; j <= that.$Global.CabinetNum; j++) {

									that.deviceParamData[2].children[i].children.push({
										'text': j + '号箱',
										'value': that.deviceParamData[2].children[i].value + '||' + j
									})
								}
							}
							//2.根据TenantId查询对应的字典信息
							that.$Api.GetActiveDictionaryInfos({
								'ParentType': 'ICRepairReason',
								'TenantId': that.terminalInfo.tenantId
							}).then((dicRes) => {
								console.log(dicRes)
								if (dicRes.result) {
									that.repairReasonData = dicRes.result

									that.reportProcess = '获取手机号'
								}
							})
						} else {
							uni.showToast({
								icon: 'none',
								title: '未找到当前主机信息'
							})
						}
					})
				} else {
					uni.showToast({
						icon: 'none',
						title: '请扫描正确的二维码'
					})
				}
			},
			//扫描二维码
			scanCode() {
				var that = this

				uni.scanCode({
					onlyFromCamera: true,
					success(res) {
						console.log(res)
						var val = ProcessingQrCodeInfo(res, that.$mp.page.route)
						that.parsingQrCode(val)
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
			//提交报修记录（节流处理，避免用户重复点击）
			submit: Throttle(function() {
				var that = this

				that.$refs.reportFrom.validate().then(res => {
					//解析设备类型
					var deviceParams = that.reportFormData.DeviceParam.split('||')
					var deviceType, cabinetNo, lockerNo
					deviceType = deviceParams[0]
					switch (deviceType) {
						case '主机柜':
						case '其它':
							break;
						case '钥匙柜':
							cabinetNo = '1' //钥匙柜的柜号默认为1
							lockerNo = deviceParams[1]
							break;
						case '内胆柜':
							cabinetNo = deviceParams[1]
							lockerNo = deviceParams[2]
							break;
						default:
							break;
					}

					var data = {
						'RepairRecord': {
							'RepairRecordGuid': GenerateGuid(),
							'UserName': that.staffInfo.staffName,
							'PhoneNum': that.staffInfo.phoneNum,
							'TerminalId': that.terminalInfo.id,
							'TerminalGuid': that.terminalInfo.terminalGuid,
							'DeviceType': deviceType,
							'CabinetNo': cabinetNo,
							'LockerNo': lockerNo,
							'SubmitTime': StrToDate(new Date()),
							'RepairReason': that.reportFormData.RepairReason,
							'ReasonRemark': that.reportFormData.ReasonRemark,
							'TenantId': that.terminalInfo.tenantId
						}
					}

					that.$Api.RepairRecord_CreateOrUpdate(JSON.stringify(data)).then((res) => {
						console.log(res)
						if (res && res.success == true) {
							uni.showToast({
								icon: 'success',
								title: '报修成功'
							})

							//停留3000毫秒（不停留会直接退出小程序或返回上一级，用户看不到提示信息）
							Sleep(3000)
							if (that.haveScene) {
								//退出小程序
								uni.exitMiniProgram()
							} else {
								//返回到首页
								uni.navigateBack()
							}
						}
					})
				}).catch(err => {
					console.log('err', err)
				})
			}, 1000),
			cancel: Throttle(function() {
				if(this.haveScene){
					uni.redirectTo({
						url: '/pages/index/index'
					})
				}else{
					uni.navigateBack()
				}
			})
		}
	}
</script>

<style scoped lang="scss">
	.content {
		/deep/.uni-noticebar {
			position: absolute;
			top: 0rpx;
			left: 0rpx;
		}

		.reportInfo {
			/deep/.uni-easyinput__content-textarea {
				height: 150rpx;
				min-height: 150rpx;
			}

			/deep/.list {
				padding-bottom: constant(safe-area-inset-bottom);
				padding-bottom: env(safe-area-inset-bottom);
			}
		}
	}
</style>

<style lang="scss">
	page {
		width: 100%;
		height: 100%;
		display: flex;

		.content {
			width: inherit;
			height: inherit;
			display: flex;
			align-items: center;
			justify-content: center;
			background: linear-gradient(0deg, #00ccff, #003366);

			.scanCode {
				width: inherit;
				height: inherit;
				display: flex;
				flex-direction: column;
				text-align: center;
				justify-content: center;
				background-color: #FFF;

				.tip {
					color: #aa0000;
					font-size: 40rpx;
					font-weight: bold;
					margin: 50rpx auto;
				}

				button {
					width: 90%;
					height: 120rpx;
					font-size: 50rpx;
					display: flex;
					flex-direction: column;
					text-align: center;
					justify-content: center;
					color: white;
					border-radius: 60rpx;
					background: linear-gradient(-5deg, #00ccff, #003366);
				}
			}

			.reportInfo {
				width: 80%;
				padding: 40rpx;
				text-align: center;
				background-color: #FFF;
				border-radius: 30rpx;
				box-shadow: 0 0 30rpx black;

				button {
					width: 70%;
					display: inline-block;
					color: white;
					border-radius: 60rpx;
					background: linear-gradient(-5deg, #00ccff, #003366);
				}
				
				.cancel {
					width: 30%;
					background: #FFF;
					color: #606266;
				}
				
				.cancel::after{
					border: none;
				}
				
				.terminalCode {
					color: #606266;
					font-size: 40rpx;
				}

				.picker {
					border: 1px solid #e5e5e5;
					border-radius: 5px;
					display: flex;
					flex-direction: row;
					align-items: center;
					flex-wrap: nowrap;
					color: #333;
					font-size: 14px;
					padding: 0 10px;
					padding-right: 5px;
					overflow: hidden;
					height: 35px;
					box-sizing: border-box;
				}

				.placeholder {
					color: grey;
					font-size: 12px;
				}
			}
		}
	}
</style>
