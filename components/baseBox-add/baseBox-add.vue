<template>
	<view class="baseBoxAddContent">
		<view class="baseBoxAdd">
			<view class="boxId">
				<label>{{ '内胆ID:' + boxFormData.BoxID }}</label>
			</view>
			
			<uni-forms class="boxFrom" ref="boxForm" :rules="customRules" :modelValue="boxFormData" label-position="top">
<!-- 				<uni-forms-item label="内胆ID" name="BoxID">
					<uni-easyinput v-model="boxFormData.BoxID" disabled="true" maxlength="10" />
				</uni-forms-item> -->
				<uni-forms-item label="内胆自编号" label-width="100" required name="BoxCode">
					<uni-easyinput v-model="boxFormData.BoxCode" placeholder="请输入内胆自编号" @input="boxCodeInput" />
				</uni-forms-item>
				<uni-forms-item label="内胆型号" name="ProductModel">
					<uni-data-select :localdata="productModelData" v-model="boxFormData.ProductModel" clear="true"
						placeholder="请选择内胆型号" @change="productModelChange"></uni-data-select>
				</uni-forms-item>
				<uni-forms-item label="所属单位" name="OrganizationUnitId">
					<uni-data-select :localdata="organizationUnitData" v-model="boxFormData.OrganizationUnitId" clear="true"
						placeholder="请选择所属单位" @change="organizationChange"></uni-data-select>
				</uni-forms-item>
			</uni-forms>
		</view>
	</view>
</template>

<script>
	import {
		Sleep,
		GenerateGuid,
		StrToDate
	} from '@/utils/tool.js'
	export default {
		name: "baseBox-add",
		props: {
			boxId: {
				default: ''
			}
		},
		data() {
			return {
				boxFormData: {
					BoxID: '',
					BoxCode: '',
					ProductModel: '',
					OrganizationUnitId: null
				},
				customRules: {
					BoxCode: {
						rules: [{
							required: true,
							errorMessage: '请输入内胆自编号'
						}]
					}
				},
				productModelData: [],
				organizationUnitData: []
			};
		},
		methods: {
			load() {
				this.$refs.boxForm.clearValidate()
				this.organizationUnitData = []
				this.productModelData = []
				
				console.log('扫描到的内胆ID' + this.boxId)
				this.boxFormData.BoxID = this.boxId
				
				this.$Api.GetOrganizationUnits().then((res) => {
					console.log(res.result.items)
					res.result.items.forEach(item => {
						this.organizationUnitData.push({
							'text': item.displayName,
							'value': item.id
						})
					})
				})
			
				this.$Api.GetActiveDictionaryInfos({
					'ParentType': 'BoxType',
					'TenantId': this.$Global.TenantId
				}).then((res) => {
					console.log(res)
					if (res.result) {
						res.result.forEach(item => {
							this.productModelData.push({
								'text': item.dicName,
								'value': item.dicName
							})
						})
					}
				})
			},
			boxCodeInput(){
				var reg = /[\ud800-\udbff][\udc00-\udfff]/g
				if(reg.test(this.boxFormData.BoxCode)){
				    this.$nextTick(function() {
				    	this.boxFormData.BoxCode = this.boxFormData.BoxCode.replace(reg, '')
				    })
				}
			},
			productModelChange(e){
				console.log(e)
			},
			organizationChange(e){
				console.log(e)
			},
			async addBox(){
				var that = this
			
				var formResult = await that.$refs.boxForm.validate().catch(err => {
					console.log('err', err)
					return false
				})
				console.log(formResult)
				if(formResult){
					var boxGuid = GenerateGuid()
					
					var boxStatus = {
						'BoxGuid': boxGuid,
						'BoxStatus': '新增',
						'StatusTime': StrToDate(new Date())
					}
					
					var data = {
						'BaseBox': {
							'BoxGuid': boxGuid,
							'BoxID': that.boxFormData.BoxID,
							'BoxCode': that.boxFormData.BoxCode,
							'ProductModel': that.boxFormData.ProductModel,
							'BaseBoxStatuses': [ boxStatus ],
							'TenantId': that.$Global.TenantId,
							'OrganizationUnitId': that.boxFormData.OrganizationUnitId
						}
					}
					
					var apiRes = await that.$Api.Box_CreateOrUpdate(JSON.stringify(data))
					if (apiRes && apiRes.success == true) {
						uni.showToast({
							icon: 'success',
							title: '添加内胆成功'
						})
						
						Sleep(1000)
								
						that.boxFormData = {
							BoxID: '',
							BoxCode: '',
							ProductModel: '',
							OrganizationUnitId: null
						}
						
						return true
					}
					
					return false
				}
			}
		}
	}
</script>

<style lang="scss">
	.baseBoxAddContent {
		height: 100%;
		width: 100%;
		align-items: center;
		display: flex;
		justify-content: center;
		
		.baseBoxAdd{
			height: inherit;
			width: 90%;
			
			.boxId{
				text-align: center;
				color: #606266;
				font-size: 50rpx;
			}
		}
	}
</style>