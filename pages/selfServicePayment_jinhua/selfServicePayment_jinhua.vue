<template>
	<view class="content">
		<view v-if="isNeedPhoneNum" class="mask">
			<button v-if="isNeedScan == true" @click="scanCode">扫码</button>
			<button v-else open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">获取手机号</button>
		</view>
		<view v-else class="input">
			<!-- 基本信息 -->
			<view class="basicInfo">
				<view>{{ '上报日期：' + basicInfo.ReportDate }}</view>
				<view>{{ '驾驶员姓名：' + basicInfo.StaffName }}</view>
				<view>{{ '驾驶员ID：' + basicInfo.StaffId }}</view>
				<view>{{ '所属公司：' + basicInfo.CompanyName }}</view>
			</view>
			<!-- 车辆信息 -->
			<view class="vehicleInfo">
				<uni-section title="车辆信息" type="line" titleFontSize="18px"></uni-section>

				<view v-for="(item, index) in inputVehicleList" :key="index" class="vehicleItem">
					<!-- 					<text>线路：</text>
					<uni-data-select v-model="item.RouteId" :localdata="routeData"
						@change="routeChange"></uni-data-select> -->
					<text>{{ '车辆：' + (item.RouteVehicleInfo != null ? '（' + item.RouteVehicleInfo.RouteName + '）' : '') }}</text>
					<!-- <uni-easyinput maxlength="10" v-model="item.VehicleCode" placeholder="请输入车号"></uni-easyinput> -->
					<!-- <uni-easyinput maxlength="1" v-model="item.Times" placeholder="请输入趟数"></uni-easyinput> -->
					<uni-combox :candidates="vehicleData" placeholder="请选择所属车辆"
						@input="vehicleInput(index, $event)"></uni-combox>
					<text>金额：</text>
					<uni-row>
						<uni-col :span="16">
							<view class="boxTotal">
								<uni-easyinput v-model="item.Total" placeholder="请输入金额"
									@input="boxTotalInput(index)"></uni-easyinput>
							</view>

						</uni-col>
						<uni-col :span="8">
							<button type="default" class="scanCode" @click="scanCode(index)">扫码</button>
						</uni-col>
					</uni-row>

					<text v-if="item.ScanInfo.BoxId.length > 0"
						class="shellInfo">{{'内胆ID：' + item.ScanInfo.BoxId + '；纸币：' + item.ScanInfo.Paper + '；硬币：' + item.ScanInfo.Coin }}</text>

					<button type="default" class="delVehicle" v-show="inputVehicleList.length > vehicleMinCount"
						@click="delVehicle(index)">-删除车辆</button>
				</view>

				<text class="addVehicle" v-show="inputVehicleList.length < vehicleMaxCount"
					@click="addVehicle">+添加车辆</text>
			</view>
			<!-- 图片、备注 -->
			<view class="other">
				<uni-section title="补充信息" type="line" titleFontSize="18px"></uni-section>

				<text>备注：</text>
				<uni-easyinput type="textarea" :maxlength="remarkMaxLength" v-model="remark"
					placeholder="请输入备注"></uni-easyinput>

				<text>上传图片：</text>
				<uni-file-picker v-model="photoList" return-type="array" fileMediatype="image"
					file-extname="jpeg,jpg,png" limit="3" mode="grid" auto-upload="false" :maxB="photoMaxB"
					:minB="photoMinB" @select="selectPhoto" @delete="deletePhoto" />

				<text class="total">{{ '总金额：' + Total + '元' }}</text>
			</view>

			<button type="default" class="submit" @click="submit">上报数据</button>
		</view>
	</view>
</template>

<script>
	import {
		StrToDate,
		GetImageBase64_ReadFile,
		Sleep
	} from '@/utils/tool.js'
	export default {
		data() {
			return {
				haveScene: false,
				isNeedPhoneNum: true,
				phoneNum: '',
				userInfo: null,
				vehicleMinCount: 1,
				vehicleMaxCount: 3,
				photoMaxB: this.$Global.StaffRegister_ImageMaxB,
				photoMinB: 0, //this.$Global.StaffRegister_ImageMinB,
				basicInfo: {
					ReportDate: '',
					StaffName: '',
					StaffId: '',
					CompanyName: ''
				},
				inputVehicleList: [{
					RouteVehicleInfo: null,
					Total: '',
					ScanInfo: {
						BoxId: '',
						Paper: 0,
						Coin: 0
					}
				}],
				vehicleList: [],
				vehicleData: [],
				remarkMaxLength: 100,
				remark: '',
				photoList: [],
				Total: 0
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
				this.haveScene = true
			}

			//this.load()
		},
		methods: {
			load() {
				var that = this
				that.vehicleData = []
				
				var data = {
					'TenantId': that.userInfo.tenantId
				}
				that.$Api.Vehicle_GetPaged(data).then((res) => {
					console.log(res.result.items)
					that.vehicleList = res.result.items//.filter(item => item.tenantId == 1012)

					that.vehicleList.forEach(item => {
						this.vehicleData.push(item.vehicleCode)
					})
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
							var res = await that.getBaseStaffInfoForApp(phoneNum)
							console.log('拿到用户信息结果', res)
							if (res && res.success == true) {
								that.userInfo = res.result
								
								that.basicInfo.ReportDate = StrToDate(Date.now(), 'YYYY-MM-DD')
								that.basicInfo.StaffName = that.userInfo.staffName
								that.basicInfo.StaffId = that.userInfo.staffCardID
								that.basicInfo.CompanyName = that.userInfo.staffOrganizationUnit
								
								that.isNeedPhoneNum = false
								
								that.phoneNum = phoneNum
								
								that.load()
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
			async getBaseStaffInfoForApp(phoneNum) {
				var that = this

				var data = {
					'PhoneNum': phoneNum
				}

				console.log('接口请求参数', data)

				var result = await that.$Api.Staff_GetBaseStaffInfoForApp(data)
				
				console.log('获取用户信息', result)
				
				return result
			},
			vehicleInput(index, e) {
				console.log(index, e)

				if (e) {
					var routeVehicleInfo = this.vehicleList.filter(item => item.vehicleCode == e)
					console.log('线路车辆信息：', routeVehicleInfo)
					if (routeVehicleInfo && routeVehicleInfo.length > 0) {
						this.inputVehicleList[index].RouteVehicleInfo = {
							'VehicleId': routeVehicleInfo[0].id,
							"VehicleCode": routeVehicleInfo[0].vehicleCode,
							"RouteId": routeVehicleInfo[0].baseRouteId,
							"RouteName": routeVehicleInfo[0].routeName,
						}
						
						return
					}
				}
				
				this.inputVehicleList[index].RouteVehicleInfo = null
			},
			boxTotalInput(index) {
				this.inputVehicleList[index].ScanInfo = {
					BoxId: '',
					Paper: 0,
					Coin: 0
				}

				this.calcTotal()
			},
			//计算总金额
			calcTotal() {
				var total = 0.0
				for (var i = 0; i < this.inputVehicleList.length; i++) {
					total += this.inputVehicleList[i].Total
				}

				this.Total = total * 1
			},
			routeChange(e) {
				console.log(e)
			},
			vehicleCodeInput(e) {
				console.log(e)
			},
			scanCode(index) {
				var that = this

				uni.scanCode({
					success(res) {
						console.log(res)

						if (res.result) {
							var paramArray = res.result.split('|')

							if (paramArray) {
								console.log(isNaN(paramArray))

								//把角转成元
								var paper = paramArray[1] * 0.1
								var Coin = paramArray[2] * 0.1

								//显示二维码内的内胆ID、纸币金额、硬币金额
								that.inputVehicleList[index].ScanInfo.BoxId = paramArray[0]
								that.inputVehicleList[index].ScanInfo.Paper = paper
								that.inputVehicleList[index].ScanInfo.Coin = Coin

								//计算内胆总金额
								that.inputVehicleList[index].Total = paper + Coin

								that.calcTotal()
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
			addVehicle() {
				if (this.inputVehicleList.length >= 3) {
					uni.showToast({
						icon: 'none',
						title: '最多只能有三个车辆信息'
					})
				} else {
					this.inputVehicleList.push({
						RouteVehicleInfo: null,
						Total: '',
						ScanInfo: {
							BoxId: '',
							Paper: 0,
							Coin: 0
						}
					})
				}
			},
			delVehicle(index) {
				if (this.inputVehicleList.length <= 1) {
					uni.showToast({
						icon: 'none',
						title: '至少有一个车辆信息'
					})
				} else {
					this.inputVehicleList.splice(index, 1)
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
			async submit() {
				var that = this
				var signOutTIme = StrToDate(Date.now())
				var ssCashierDetails = []
				for (var i = 0; i < that.inputVehicleList.length; i++) {
					var d = {
						"baseVehicleId": that.inputVehicleList[i].RouteVehicleInfo.VehicleId,
						"vehicleCode": that.inputVehicleList[i].RouteVehicleInfo.VehicleCode,
						"baseRouteId": that.inputVehicleList[i].RouteVehicleInfo.RouteId,
						"routeName": that.inputVehicleList[i].RouteVehicleInfo.RouteName,
						"boxID": that.inputVehicleList[i].ScanInfo.BoxId,
						"paperAmount": that.inputVehicleList[i].ScanInfo.Paper,
						"coinAmount": that.inputVehicleList[i].ScanInfo.Coin,
						"totalAmount": that.inputVehicleList[i].Total
					}

					ssCashierDetails.push(d)
				}

				var ssCashierImages = []
				for (var i = 0; i < that.photoList.length; i++) {
					console.log(that.photoList[i].path)

					var path = that.photoList[i].path
					var file = await GetImageBase64_ReadFile(path)
					if (file) {
						ssCashierImages.push({
							'imageName': that.photoList[i].cloudPath,
							'imageData': file
						})
					}
				}

				var data = [{
					"signOutTime": signOutTIme,
					"phoneNum": that.phoneNum,
					"ssCashierDetails": ssCashierDetails,
					"countingAmount": that.Total,
					"remark": that.remark,
					"ssCashierImages": ssCashierImages
				}]

				console.log('请求数据', data)

				that.$Api.SubmitSelfServiceCashier(data).then((res) => {
					if (res && res.success) {
						uni.showToast({
							icon: 'none',
							title: '上传数据成功！'
						})

						Sleep(3000)

						if (this.haveScene) {
							uni.exitMiniProgram()
						} else {
							uni.navigateBack()
						}
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	/deep/.uni-section-header {
		padding: 20rpx 0px !important;
	}

	/deep/.uni-easyinput {
		margin: 20rpx 0rpx;
	}

	.vehicleInfo {
		/deep/.uni-stat__select {
			margin: 20rpx 0rpx;
		}
		
		/deep/.uni-combox{
			margin: 20rpx 0rpx;
		}

		.boxTotal {
			/deep/.uni-easyinput {
				width: 95%;
			}
		}
	}

	.other {
		/deep/.uni-file-picker {
			margin: 20rpx 0rpx;
		}
	}
</style>

<style lang="scss">
	page {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		width: 100%;
		height: 100%;

		.content {
			width: inherit;
			height: inherit;
			//display: flex;
			//flex-direction: column;
			//align-items: center; //水平居中
			//justify-content: center; //垂直居中

			.mask {
				width: inherit;
				height: inherit;
				display: flex;
				align-items: center;
				justify-content: center;

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

			.input {
				display: flex;
				flex-direction: column;
				align-items: center;

				.basicInfo {
					width: 85%;
					border: 2rpx solid #003366;
					border-radius: 50rpx;
					margin: 30rpx 0rpx;
					padding: 30rpx;
					color: #003366;
					font-size: 42rpx;
					font-weight: bolder;

					view {
						margin: 10rpx 0rpx;
					}
				}

				.vehicleInfo {
					width: 85%;

					.vehicleItem {
						border: 2rpx solid #003366;
						border-radius: 30rpx;
						padding: 20rpx;
						margin: 20rpx 0rpx;

						.scanCode {
							font-size: 14px;
							color: white;
							background-color: green;
							margin: 20rpx 0rpx;
						}

						.shellInfo {
							font-size: 26rpx;
							font-weight: bolder;
							display: block;
							color: #515151;
							margin: 10rpx 0rpx;
						}
					}

					.addVehicle {
						color: #003366;
						font-weight: bolder;
						margin: 20rpx 0rpx;
					}

					.delVehicle {
						color: red;
						font-size: 30rpx;
						width: 40%;
						background-color: white;
						margin-right: 0rpx;
					}

					.delVehicle::after {
						border: none;
					}
				}

				.other {
					width: 85%;

					.total {
						color: red;
						font-size: 50rpx;
						font-weight: bolder;
					}
				}

				.submit {
					width: 85%;
					margin: 30rpx 0rpx;
					color: white;
					border-radius: 60rpx;
					background: linear-gradient(-5deg, #00ccff, #003366);
					height: 130rpx;
					line-height: 130rpx;
				}
			}
		}
	}
</style>