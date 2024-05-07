<template>
	<view class="baseBoxEditContent">
		<view class="baseBoxEdit">
			<view class="oldBaseBox">
				<uni-row>
					<label>原内胆信息</label>
				</uni-row>
				<uni-row>
					<uni-col :span="12">内胆ID：</uni-col>
					<uni-col :span="12">{{ boxInfo.boxID }}</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="12">内胆自编号：</uni-col>
					<uni-col :span="12">{{ boxInfo.boxCode }}</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="12">所属单位：</uni-col>
					<uni-col :span="12">{{ boxInfo.organizationUnitString == null ? '未知' : boxInfo.organizationUnitString }}</uni-col>
				</uni-row>
			</view>
			<view class="baseBox">
				<uni-forms class="boxFrom" ref="boxForm" :rules="customRules" :modelValue="boxFormData" label-position="top">
					<uni-forms-item label="内胆ID" required name="BoxID">
						<uni-row>
							<uni-col :span="16">
								<uni-easyinput v-model="boxFormData.BoxID" maxlength="10" placeholder="请输入内胆ID或扫码"
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
	</view>
</template>

<script>
	import { Sleep } from '@/utils/tool.js'
	export default {
		name:"baseBox-edit",
		props: {
			boxInfo: {
				default: ''
			}
		},
		data() {
			return {
				boxFormData: {
					BoxID: ''
				},
				customRules: {
					BoxID: {
						rules: [{
							required: true,
							errorMessage: '请输入内胆ID或扫码'
						}]
					}
				}
			};
		},
		methods: {
			load(){
				this.$refs.boxForm.clearValidate()
				console.log(this.boxInfo)
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
								
								//判断是否为10位数字
								var reg = /[^\d]/ig
								if(!reg.test(paramArray[0]) && paramArray[0].length == 10){
									that.boxFormData.BoxID = paramArray[0]
								}else{
									uni.showToast({
										icon: 'none',
										title: '内胆ID为10位数字'
									})
									
									return	
								}
							}
						}
					},
					fail(res){
						console.log(res)
						uni.showToast({
							icon: 'none',
							title: '未扫描二维码'
						})
					}
				})
			},
			async editBox() {
				var that = this
							
				var formResult = await that.$refs.boxForm.validate().catch(err => {
					console.log('err', err)
					return false
				})
				console.log(formResult)
				if(formResult){
					var data = {
						'BaseBox': {
							'Id': that.boxInfo.id,
							'BoxGuid': that.boxInfo.boxGuid,
							'BoxID': that.boxFormData.BoxID,
							'BoxCode': that.boxInfo.boxCode,
							'ProductModel': that.boxInfo.productModel,
							'TenantId': that.boxInfo.tenantId,
							'OrganizationUnitId': that.boxInfo.organizationUnitId
						}
					}
					
					var apiRes = await that.$Api.Box_CreateOrUpdate(JSON.stringify(data))
					if(apiRes && apiRes.success){
						uni.showToast({
							icon: 'success',
							title: '修改内胆成功'
						})
						
						Sleep(1000)
						
						that.boxFormData = {
							BoxID: ''
						}
						
						return true
					}
						
					return false	
				}
			}
		}
	}
</script>

<style scoped>
	/deep/.uni-easyinput__content-input{
		font-size: 22px;
		height: 48px;
	}	
</style>

<style lang="scss">
	.baseBoxEditContent {
		height: 100%;
		width: 100%;
		align-items: center;
		display: flex;
		justify-content: center;
		
		.baseBoxEdit{
			height: inherit;
			width: 90%;
			
			.oldBaseBox{
				border: 1px solid black;
				border-radius: 50rpx;
				padding: 20rpx 0rpx;
				text-align: center;
				line-height: 60rpx;
				margin-bottom: 20rpx;
				font-size: 46rpx;
			}
			
			.baseBox{				
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
	}
</style>