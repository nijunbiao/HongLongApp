<template>
	<view class="content">
		<uni-forms class="vehicleFrom" ref="vehicleForm" :modelValue="vehicleFormData"
			label-position="top">
			<uni-forms-item label="所属线路" required name="BaseRoute">
				<uni-data-select :localdata="SelectRouteData" v-model="vehicleFormData.BaseRoute" clear="true"
					placeholder="请选择所属线路" @change="baseRouteChange"></uni-data-select>
			</uni-forms-item>
			<uni-forms-item label="车辆编号" required name="VehicleCode">
				<uni-easyinput maxlength="10" v-model="vehicleFormData.VehicleCode" placeholder="请输入车辆编号" />
			</uni-forms-item>
			<uni-forms-item label="车牌号码" name="VehicleLicense">
				<uni-easyinput maxlength="8" v-model="vehicleFormData.VehicleLicense" placeholder="请输入车牌号码" />
			</uni-forms-item>
		</uni-forms>

		<button type="primary" class="add" @click="addVehicle">添加车辆</button>
	</view>
</template>

<script>
	import {
		Throttle,
		GenerateGuid
	} from '@/utils/tool.js'
	export default {
		data() {
			return {
				vehicleFormData: {
					BaseRoute: null,
					VehicleCode: '',
					VehicleLicense: ''
				},
				customRules: {
					BaseRoute: {
						rules: [{
							required: true,
							errorMessage: '请选择所属线路'
						}]
					},
					VehicleCode: {
						rules: [{
							required: true,
							errorMessage: '请输入车辆编号'
						}, {
							validateFunction: function(rule, value, data, callback) {
								var regex = /^[a-zA-Z0-9-_*]+$/;
								if (!regex.test(value)) {
									callback('只能包含大小写英文字母、数字和“-_*”')
								}

								return true
							}
						}]
					}
				},
				RouteList: [],
				SelectRouteData: [],
				SelectRouteValue: null
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

			this.load()
		},
		onReady(){
		// 需要在onReady中设置规则
			this.$refs.vehicleForm.setRules(this.customRules)	
		},
		methods: {
			load() {
				this.SelectRouteData = []
				
				this.$Api.Route_GetPaged().then((res) => {
					console.log(res.result.items)
					this.RouteList = res.result.items

					res.result.items.forEach(item => {
						this.SelectRouteData.push({
							'text': item.routeName,
							'value': item.id
						})
					})
				})
			},
			baseRouteChange(e) {
				console.log(e)
				this.SelectRouteValue = null
				var selectRoute = this.RouteList.filter((item) => item.id == e)

				console.log('筛选' + selectRoute)
				if (selectRoute && selectRoute.length > 0) {
					this.SelectRouteValue = selectRoute[0]
					console.log(this.SelectRouteValue)
				}
			},
			addVehicle: Throttle(function() {
				var that = this

				that.$refs.vehicleForm.validate().then(res => {
					var data = {
						'BaseVehicle': {
							'VehicleGuid': GenerateGuid(),
							'VehicleCode': that.vehicleFormData.VehicleCode,
							'VehicleLicense': that.vehicleFormData.VehicleLicense,
							'BaseRouteId': that.SelectRouteValue.id,
							'RouteGuid': that.SelectRouteValue.routeGuid,
							'OrganizationUnitId': that.SelectRouteData.organizationUnitId,
							'TenantId': that.$Global.TenantId
						}
					}

					that.$Api.Vehicle_CreateOrUpdate(JSON.stringify(data)).then((apiRes) => {
						console.log(apiRes)
						if (apiRes && apiRes.success == true) {
							uni.showToast({
								icon: 'success',
								title: '添加车辆成功'
							})

							that.vehicleFormData = {
								BaseRoute: null,
								VehicleCode: '',
								VehicleLicense: ''
							}
						}
					})
				}).catch(err => {
					console.log('err', err)
				})
			}, 1000)
		}
	}
</script>

<style scoped>
	/deep/.uni-forms {
		width: 90%;
	}

	/deep/.uni-forms-item__label {
		color: black;
		height: 30px;
	}
</style>

<style lang="scss">
	page {
		display: flex;
		height: 100%;

		.content {
			width: inherit;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			.add {
				width: 90%;
				color: white;
				border-radius: 60rpx;
				background: linear-gradient(-5deg, #00ccff, #003366);
			}

			.add::after {
				border: none;
			}
		}
	}
</style>