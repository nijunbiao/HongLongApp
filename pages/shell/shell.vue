<template>
	<view class="content">
		<view class="identify" v-if="state == '扫码'">
			<!-- 方式一 -->
			<uni-section class="mb-10" title="方式一" sub-title="根据票箱ID查询" type="line" titleFontSize="18px"
				subTitleFontSize="14px"></uni-section>
			<view>
				<uni-row>
					<uni-col :span="16">
						<uni-easyinput maxlength="10" v-model="shellId" placeholder="请输入票箱ID"
							placeholderStyle="font-size: 18px;" @input="shellIdInput" />
					</uni-col>
					<uni-col :span="8">
						<button type="default" class="confirm" @click="confirm">确定</button>
					</uni-col>
				</uni-row>
			</view>

			<!-- 方式二 -->
			<uni-section class="mb-10" title="方式二" sub-title="扫描票箱二维码查询" type="line" titleFontSize="18px"
				subTitleFontSize="14px"></uni-section>
			<view>
				<button type="primary" class="scanCode" @click="scanCode">扫码</button>
			</view>
		</view>

		<view class="baseShellAdd" v-if="state == '新增'">
			<view class="shellId">
				<label>{{'票箱ID:' + shellFormData.ShellID + '（' + shellId_8 + '）'}}</label>
			</view>

			<uni-forms class="shellFrom" ref="shellFrom" :rules="customRules" :modelValue="shellFormData"
				label-position="top">
				<!-- 				<uni-forms-item :label="'票箱ID（' + (shellId_8.length == 0 ? shellFormData.ShellID : shellId_8) + '）'" 
					label-width="200" required name="ShellID">
					<uni-easyinput v-model="shellFormData.ShellID" maxlength="10" disabled="true" placeholder="请输入票箱ID" />
				</uni-forms-item> -->
				<!-- 				<uni-forms-item label="所属线路" required name="Route">
					<uni-data-select :localdata="routeData" v-model="shellFormData.Route" disabled="true"
						placeholder="请选择所属线路" @change="routeChange"></uni-data-select>
				</uni-forms-item> -->
				<uni-forms-item :label="'所属车辆' + (routeName.length > 0 ? '（' + routeName + '）' : '')" label-width="200"
					required name="Vehicle">
					<!-- 					<uni-data-select :localdata="vehicleData" v-model="shellFormData.Vehicle" clear="true"
						placeholder="请选择所属车辆" @change="vehicleChange"></uni-data-select> -->
					<uni-combox :candidates="candidates" placeholder="请选择所属车辆" @input="vehicleInput">
					</uni-combox>
				</uni-forms-item>
				<uni-forms-item label="票箱类型" name="ShellMode">
					<uni-data-select :localdata="shellModeData" v-model="shellFormData.ShellMode" clear="true"
						placeholder="请选择票箱类型"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="票箱位置" name="ShellLocation">
					<uni-data-select :localdata="shellLocationData" v-model="shellFormData.ShellLocation" clear="true"
						placeholder="请选择票箱位置"></uni-data-select>
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="baseShellEdit" v-if="state == '修改'">
			<view class="oldBaseShell">
				<uni-row>
					<label>原票箱信息</label>
				</uni-row>
				<uni-row>
					<uni-col :span="12">16进制ID：</uni-col>
					<uni-col :span="12">{{ shellId_8 }}</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="12">票箱ID：</uni-col>
					<uni-col :span="12">{{ shellInfo.shellID }}</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="12">票箱类型：</uni-col>
					<uni-col :span="12">{{ shellInfo.shellMode == null || shellInfo.shellMode == '' ? '未知' : shellInfo.shellMode }}</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="12">所属线路：</uni-col>
					<uni-col :span="12">{{ shellInfo.routeName }}</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="12">所属车辆：</uni-col>
					<uni-col :span="12">{{ shellInfo.vehicleCode }}</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="12">所属单位：</uni-col>
					<uni-col
						:span="12">{{ shellInfo.organizationUnitString == null ? '未知' : shellInfo.organizationUnitString }}</uni-col>
				</uni-row>
			</view>
			<view class="baseShell">
				<uni-forms class="newShellFrom" ref="newShellFrom" :rules="newShellCustomRules" :modelValue="newShellFromData"
					label-position="top">
					<uni-forms-item label="内胆ID" required name="ShellID">
						<uni-row>
							<uni-col :span="16">
								<uni-easyinput v-model="newShellFromData.ShellID" maxlength="10" placeholder="请输入票箱ID或扫码"
									placeholderStyle="font-size: 18px;" />
							</uni-col>
							<uni-col :span="8">
								<button type="default" class="scanNewCode" @click="scanCode">扫码</button>
							</uni-col>
						</uni-row>

					</uni-forms-item>
				</uni-forms>
			</view>
		</view>
		
		<view class="row" v-show="state != '扫码'">
			<button type="primary" class="operate" @click="operate">{{ state == '新增' ? '新增票箱' : '修改票箱' }}</button>
			<button type="default" class="cancel" @click="cancenl">返回</button>
		</view>
	</view>
</template>

<script>
	import {
		GenerateGuid,
		Throttle,
		Sleep,
		DecToHexStr,
		HexToDecStr
	} from '@/utils/tool.js'
	export default {
		data() {
			return {
				state: '扫码', //扫码——新增——修改
				shellId_8: '',
				shellId: '',
				shellInfo: null,
				shellFormData: {
					ShellID: '',
					ShellMode: '',
					ShellLocation: '',
					Route: null,
					Vehicle: null
				},
				routeName: '',
				customRules: {
					ShellID: {
						rules: [{
							required: true,
							errorMessage: '请输入票箱ID'
						}]
					},
					Route: {
						rules: [{
							required: true,
							errorMessage: '请选择所属线路'
						}]
					},
					Vehicle: {
						rules: [{
							required: true,
							errorMessage: '请选择所属车辆'
						}]
					}
				},
				shellModeData: [],
				shellLocationData: [{
					'text': '前',
					'value': 0
				}, {
					'text': '中',
					'value': 1
				}, {
					'text': '后',
					'value': 2
				}],
				routeList: [],
				routeData: [],
				vehicleList: [],
				vehicleData: [],
				candidates: [],
				city: '',
				newShellFromData: {
					ShellID: ''
				},
				newShellCustomRules: {
					ShellID: {
						rules: [{
							required: true,
							errorMessage: '请输入票箱ID或扫码'
						}]
					}
				}
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

			this.load()
		},
		methods: {
			load() {
				this.shellModeData = []

				this.$Api.GetActiveDictionaryInfos({
					'ParentType': 'ShellType',
					'TenantId': this.$Global.TenantId
				}).then((res) => {
					console.log(res)
					if (res.result) {
						res.result.forEach(item => {
							this.shellModeData.push({
								'text': item.dicName,
								'value': item.dicName
							})
						})
					}
				})
			},
			//票箱ID只允许输入数字
			shellIdInput() {
				// 正则表达式，只允许字母和数字  
				var reg = /^[a-fA-F0-9]+$/;
				if (!reg.test(this.shellId)) {
					console.log(this.shellId)
					this.$nextTick(function() {
						this.shellId = this.shellId.slice(0, this.shellId.length - 1)
					})
				}
			},
			confirm() {
				if (this.shellId.length == 10) {
					this.shellId_8 = DecToHexStr(this.shellId)
				} else if (this.shellId.length == 8) {
					//16进制转10进制
					var shellId10 = HexToDecStr(this.shellId)

					this.shellId_8 = this.shellId
					this.shellId = shellId10
				} else {
					uni.showToast({
						icon: 'none',
						title: '票箱ID为8位或10位'
					})

					return
				}

				this.GetShellById()
			},
			//扫描二维码
			scanCode() {
				var that = this

				uni.scanCode({
					success(res) {
						console.log(res)

						if (res.result) {
							var paramArray = res.result.split('|')

							if (paramArray) {
								console.log(isNaN(paramArray[0]))

								var reg = /^[a-fA-F0-9]+$/;
								if (reg.test(paramArray[0])) {
									if (paramArray[0].length == 10) {
										that.shellId = paramArray[0]
										that.shellId_8 = DecToHexStr(that.shellId)
									} else if (paramArray[0].length == 8) {
										console.log('16进制:' + paramArray[0])

										//16进制转10进制
										var shellId10 = HexToDecStr(paramArray[0])

										that.shellId_8 = paramArray[0]
										that.shellId = shellId10
									} else {
										uni.showToast({
											icon: 'none',
											title: '票箱ID为10位数字或8位16进制'
										})

										return
									}

									that.GetShellById()
								}
							}
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
			GetShellById() {
				var that = this

				//根据内胆Id查询内胆信息，存在进行修改，不存在则进行新增；
				that.$Api.Shell_GetPaged({
					'ShellID': that.shellId
				}).then((res) => {
					console.log(res)

					if (res.result && res.result.items.length > 0) {
						that.shellInfo = res.result.items[0]
						
						that.shellId_8 = DecToHexStr(that.shellInfo.shellID)

						console.log('修改')
						that.state = '修改'

						uni.setNavigationBarTitle({
							title: '修改票箱'
						})
					} else {
						that.shellFormData.ShellID = this.shellId

						that.InitSelectData()

						console.log('新增')
						that.state = '新增'

						uni.setNavigationBarTitle({
							title: '新增票箱'
						})
					}

					that.shellId = ''
				})
			},
			InitSelectData() {
				this.routeData = []
				this.candidates = []
				this.vehicleData = []
				
				this.$Api.Route_GetPaged().then((res) => {
					console.log(res.result.items)
					this.routeList = res.result.items

					res.result.items.forEach(item => {
						this.routeData.push({
							'text': item.routeName,
							'value': item.id
						})
					})
				})

				this.$Api.Vehicle_GetPaged().then((res) => {
					console.log(res.result.items)
					this.vehicleList = res.result.items

					res.result.items.forEach(item => {
						this.candidates.push(item.vehicleCode)

						this.vehicleData.push({
							'text': item.vehicleCode,
							'value': item.id
						})
					})
				})
			},
			routeChange(e) {
				console.log(e)
				//this.vehicleList = []
				//this.vehicleData = []

				// if (e) {
				// 	var route = this.routeList.filter(item => item.id == e)[0]
				// 	this.$Api.Vehicle_GetPaged({
				// 		'RouteGuids': [route.routeGuid]
				// 	}).then((res) => {
				// 		console.log(res.result.items)
				// 		this.vehicleList = res.result.items

				// 		res.result.items.forEach(item => {
				// 			this.vehicleData.push({
				// 				'text': item.vehicleCode,
				// 				'value': item.id
				// 			})
				// 		})
				// 	})
				// }
			},
			vehicleChange(e) {
				console.log(e)

				if (e) {
					var route = this.vehicleList.filter(item => item.id == e)[0]
					console.log('线路信息：' + route)
					if (route) {
						this.routeName = route.routeName
						this.shellFormData.Route = route.baseRouteId
					}
				} else {
					this.shellFormData.Route = null
				}
			},
			vehicleInput(e) {
				console.log(e)

				if (e) {
					var vehicle = this.vehicleList.filter(item => item.vehicleCode == e)
					console.log('线路信息：' + vehicle)
					if (vehicle && vehicle.length > 0) {
						this.routeName = vehicle[0].routeName
						this.shellFormData.Vehicle = vehicle[0].id
						this.shellFormData.Route = vehicle[0].baseRouteId

						return
					}
				}

				this.routeName = ''
				this.shellFormData.Vehicle = null
				this.shellFormData.Route = null
			},
			operate: Throttle(async function() {
				var that = this
				var formResult = false
				
				if(that == '新增'){
					formResult = await that.$refs.shellFrom.validate().catch(err => {
						console.log('err', err)
						return false
					})
					console.log(formResult)
					if (formResult) {
						var vehicle = that.vehicleList.filter(item => item.id == that.shellFormData.Vehicle)[0]
						console.log(vehicle)
					
						var shellMode = that.shellModeData.filter(item => item.value == that.shellFormData
							.ShellMode)
						var shellLocation = that.shellLocationData.filter(item => item.value == that.shellFormData
							.ShellLocation)
					
						var data = {
							'BaseShell': {
								'ShellGuid': GenerateGuid(),
								'ShellID': that.shellFormData.ShellID,
								'BaseVehicleId': vehicle.id,
								'VehicleGuid': vehicle.vehicleGuid,
								'ShellMode': shellMode.length > 0 ? shellMode[0].text : '',
								'ShellLocation': shellLocation.length > 0 ? shellLocation[0].text : '',
								'ShellStatus': '已绑定',
								'TenantId': that.$Global.TenantId
							}
						}
					
						var apiRes = await that.$Api.Shell_CreateOrUpdate(JSON.stringify(data))
						if (apiRes && apiRes.success == true) {
							uni.showToast({
								icon: 'success',
								title: '添加票箱成功'
							})
					
							Sleep(1000)
					
							that.shellFormData = {
								ShellID: '',
								ShellLocation: '',
								Route: null,
								Vehicle: null
							}
					
							that.state = '扫码'
							return true
						}
					
						return false
					}
				}else{
					if (that.newShellFromData.ShellID.length == 10) {
					} else if (that.newShellFromData.ShellID.length == 8) {
						console.log('16进制:' + that.newShellFromData.ShellID)
					
						//16进制转10进制
						that.newShellFromData.ShellID = HexToDecStr(that.newShellFromData.ShellID)
					} else {
						uni.showToast({
							icon: 'none',
							title: '票箱ID为10位数字或8位16进制'
						})
					
						return
					}
					
					formResult = await that.$refs.newShellFrom.validate().catch(err => {
						console.log('err', err)
						return false
					})
					console.log(formResult)
					
					if(formResult){
						var data = {
							'BaseShell': {
								'Id': that.shellInfo.id,
								'ShellGuid': that.shellInfo.shellGuid,
								'ShellID': that.newShellFromData.ShellID,
								'BaseVehicleId': that.shellInfo.baseVehicleId,
								'VehicleGuid': that.shellInfo.vehicleGuid,
								'ShellLocation': that.shellInfo.shellLocation,
								'ShellMode': that.shellInfo.shellMode,
								'ProductDate': that.shellInfo.productDate,
								'ProductVersion': that.shellInfo.productVersion,
								'ShellStatus': that.shellInfo.shellStatus,
								'Remark': that.shellInfo.remark,
								'TenantId': that.shellInfo.tenantId,
								'OrganizationUnitId': that.shellInfo.organizationUnitId
							}
						}
						
						var apiRes = await that.$Api.Shell_CreateOrUpdate(JSON.stringify(data))
						if(apiRes && apiRes.success){
							uni.showToast({
								icon: 'success',
								title: '修改内胆成功'
							})
							
							Sleep(1000)
							
							that.newShellFromData = {
								ShellID: ''
							}
							
							that.state = '扫码'
							return true
						}
							
						return false	
					}
				}

			}),
			cancenl() {
				uni.setNavigationBarTitle({
					title: '票箱维护'
				})

				this.shellId_8 = ''
				this.shellId = ''
				this.state = '扫码'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.identify, .baseShell {
		/deep/.uni-easyinput__content-input {
			font-size: 22px;
			height: 48px;
		}
	}
	
	/deep/.uni-section-header__content {
		text-align: left;
	}
	
	/deep/.uni-section-header {
		padding: 15px 0px !important;
	}
</style>

<style lang="scss">
	page {
		height: 100%;
		width: 100%;
		align-items: center;
		display: flex;
		justify-content: center;

		.content {
			display: flex;
			flex-direction: column;
			justify-content: center;
			height: inherit;
			width: inherit;
			margin: 0rpx 20rpx;

			.identify {
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

				.confirm {
					height: 48px;
					width: 90%;
					display: flex;
					flex-direction: column;
					justify-content: center;
					color: white;
					background-color: green;
				}

				.confirm::after {
					border: none;
				}

				.scanCode {
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
		}

		.baseShellAdd {
			.shellId {
				text-align: center;
				color: #606266;
				font-size: 50rpx;
			}

			.operate {
				width: 60%;
				margin-right: 5%;
				float: left;
				color: white;
				border-radius: 60rpx;
				background: linear-gradient(-5deg, #00ccff, #003366);
			}

			.operate::after {
				border: none;
			}

			.cancel {
				width: 35%;
				background: #FFF;
				color: #606266;
			}

			.cancel::after {
				border: none;
			}
		}

		.baseShellEdit{			
			.oldBaseShell{
				border: 1px solid black;
				border-radius: 50rpx;
				padding: 20rpx 0rpx;
				text-align: center;
				line-height: 60rpx;
				margin-bottom: 20rpx;
				font-size: 46rpx;
			}
			
			.baseShell{				
				.scanNewCode{
					line-height: 48px;
					margin: 0rpx 5rpx;
					color: white;
					background-color: green;
				}
				
				.scanNewCode::after{
					border: none;
				}
			}
		}
		
		.row {
			width: 90%;
			margin-left: 5%;
		
			.operate {
				width: 60%;
				margin-right: 5%;
				float: left;
				color: white;
				border-radius: 60rpx;
				background: linear-gradient(-5deg, #00ccff, #003366);
			}
		
			.operate::after {
				border: none;
			}
		
			.cancel {
				width: 35%;
				background: #FFF;
				color: #606266;
			}
		
			.cancel::after {
				border: none;
			}
		}
	}
</style>