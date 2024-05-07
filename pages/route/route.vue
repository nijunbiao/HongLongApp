<template>
	<view class="content">
		<uni-forms class="routeFrom" ref="routeForm" :modelValue="routeFormData" label-position="top">
			<uni-forms-item label="所属单位" name="OrganizationUnitId">
				<uni-data-select :localdata="organizationUnit" v-model="routeFormData.OrganizationUnitId" clear="true"
					placeholder="可选择所属单位" @change="organizationChange"></uni-data-select>
			</uni-forms-item>
			<uni-forms-item label="线路名称" required name="RouteName">
				<uni-easyinput maxlength="10" v-model="routeFormData.RouteName" placeholder="请输入线路名称" />
			</uni-forms-item>
			<uni-forms-item label="数据采集方式" label-width="100" required name="DataAcquisitionMode">
				<uni-data-select :localdata="dataAcquisitionMode" v-model="routeFormData.DataAcquisitionMode"
					clear="true" placeholder="请选择数据采集方式" @change="dataAcquisitionModeChange"></uni-data-select>
			</uni-forms-item>
			<uni-forms-item label="允许开箱次数" label-width="100" required name="UnlockingTimes">
				<uni-easyinput v-model="routeFormData.UnlockingTimes" format="number" maximum="10" minimum="1"
					placeholder="请输入允许开箱次数" />
			</uni-forms-item>
			<uni-forms-item label="单程票价" required name="TicketPrice">
				<uni-easyinput v-model="routeFormData.TicketPrice" type="number" maxlength="3" placeholder="请输入单程票价" />
			</uni-forms-item>
		</uni-forms>

		<button type="primary" class="add" @click="addRoute">添加线路</button>
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
				routeFormData: {
					OrganizationUnitId: null,
					RouteName: '',
					DataAcquisitionMode: '',
					TicketPrice: '1',
					UnlockingTimes: 1
				},
				customRules: {
					RouteName: {
						rules: [{
							required: true,
							errorMessage: '请输入线路名称'
						}]
					},
					DataAcquisitionMode: {
						rules: [{
							required: true,
							errorMessage: '请选择数据采集方式'
						}]
					},
					UnlockingTimes: {
						rules: [{
							required: true,
							errorMessage: '请输入允许开箱次数'
						}, {
							validateFunction: function(rule, value, data, callback) {
								var i = Number(value);
								if(i === 0 || isNaN(i)){
									callback('请输入正整数')
								}
								
								if(i < 0 || i > 10){
									callback('取值范围1~10')
								}
								
								return true
							}
						}]
					},
					TicketPrice: {
						rules: [{
							required: true,
							errorMessage: '单程票价不能为空'
						}, {
							pattern: '^\\d+\\.?\\d?$',
							errorMessage: '请输入正数最多一位小数'
						}]
					}
				},
				organizationUnit: [],
				dataAcquisitionMode: []
			}
		},
		onReady() {
			this.$refs.routeForm.setRules(this.customRules)
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
		methods: {
			load() {
				this.organizationUnit = []
				this.dataAcquisitionMode = []
				
				this.$Api.GetOrganizationUnits().then((res) => {
					console.log(res.result.items)
					res.result.items.forEach(item => {
						this.organizationUnit.push({
							'text': item.displayName,
							'value': item.id
						})
					})
				})

				this.$Api.GetActiveDictionaryInfos({
					'ParentType': 'DataAcquisitionMode',
					'TenantId': this.$Global.TenantId
				}).then((res) => {
					console.log(res)
					if (res.result) {
						res.result.forEach(item => {
							this.dataAcquisitionMode.push({
								'text': item.dicName,
								'value': item.dicName
							})
						})
					}
				})
			},
			organizationChange(e) {
				console.log(e)
			},
			dataAcquisitionModeChange(e) {
				console.log(e)
			},
			addRoute: Throttle(function() {
				var that = this

				that.$refs.routeForm.validate().then(res => {
					var data = {
						'BaseRoute': {
							'RouteGuid': GenerateGuid(),
							'RouteName': that.routeFormData.RouteName,
							'TicketPrice': that.routeFormData.TicketPrice,
							'UnlockingTimes': that.routeFormData.UnlockingTimes,
							'DataAcquisitionMode': that.routeFormData.DataAcquisitionMode,
							'TenantId': that.$Global.TenantId,
							'OrganizationUnitId': that.routeFormData.OrganizationUnitId
						}
					}

					that.$Api.Route_CreateOrUpdate(JSON.stringify(data)).then((apiRes) => {
						console.log(apiRes)
						if (apiRes && apiRes.success == true) {
							uni.showToast({
								icon: 'success',
								title: '添加线路成功'
							})

							that.routeFormData = {
								OrganizationUnitId: null,
								RouteName: '',
								DataAcquisitionMode: '',
								TicketPrice: '1',
								UnlockingTimes: 1
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