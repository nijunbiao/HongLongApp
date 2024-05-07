<template>
	<view class="content">
		<view class="identify" v-if="state == '扫码'">
			<!-- 方式一 -->
			<uni-section class="mb-10" title="方式一" sub-title="根据内胆自编号查询" type="line" titleFontSize="18px"
				subTitleFontSize="14px"></uni-section>
			<view>
				<uni-row>
					<uni-col :span="16">
						<uni-easyinput maxlength="10" v-model="boxCode" placeholder="请输入内胆自编号"
							placeholderStyle="font-size: 18px;" @input="boxCodeInput" />
					</uni-col>
					<uni-col :span="8">
						<button type="default" class="confirm" @click="selBoxByCode">确定</button>
					</uni-col>
				</uni-row>
			</view>

			<!-- 方式二 -->
			<uni-section class="mb-10" title="方式二" sub-title="根据内胆ID查询" type="line" titleFontSize="18px"
				subTitleFontSize="14px"></uni-section>
			<view>
				<uni-row>
					<uni-col :span="16">
						<uni-easyinput maxlength="10" v-model="boxId" placeholder="请输入内胆ID"
							placeholderStyle="font-size: 18px;" @input="boxIdInput" />
					</uni-col>
					<uni-col :span="8">
						<button type="default" class="confirm" @click="selBoxById">确定</button>
					</uni-col>
				</uni-row>
			</view>

			<!-- 方式三 -->
			<uni-section class="mb-10" title="方式三" sub-title="扫描内胆二维码查询" type="line" titleFontSize="18px"
				subTitleFontSize="14px"></uni-section>
			<view>
				<button type="primary" class="scanCode" @click="scanCode">扫码</button>
			</view>
		</view>

		<view v-show="state == '新增'">
			<baseBoxAdd id="baseBoxAdd" :boxId="boxId"></baseBoxAdd>
		</view>
		<view v-show="state == '修改'">
			<baseBoxEdit id="baseBoxEdit" :boxInfo="boxInfo"></baseBoxEdit>
		</view>

		<view class="row" v-show="state != '扫码'">
			<button type="primary" class="operate" @click="operate">{{ state == '新增' ? '新增内胆' : '修改内胆' }}</button>
			<button type="default" class="cancel" @click="cancenl">返回</button>
		</view>
	</view>
</template>

<script>
	import baseBoxAdd from '@/components/baseBox-add/baseBox-add.vue'
	import baseBoxEdit from '@/components/baseBox-edit/baseBox-edit.vue'
	import {
		Throttle
	} from '@/utils/tool.js'
	export default {
		components: {
			baseBoxAdd,
			baseBoxEdit
		},
		data() {
			return {
				state: '扫码', //扫码——新增——修改
				boxCode: '',
				boxId: '',
				boxInfo: null,
				baseBoxAddControl: null,
				baseBoxEditControl: null
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

			this.baseBoxAddControl = this.selectComponent("#baseBoxAdd")
			this.baseBoxEditControl = this.selectComponent("#baseBoxEdit")
		},
		methods: {
			//内胆自编号不能输入非法表情
			boxCodeInput() {
				var reg = /[\ud800-\udbff][\udc00-\udfff]/g
				if (reg.test(this.boxCode)) {
					this.$nextTick(function() {
						this.boxCode = this.boxCode.replace(reg, '')
					})
				}
			},
			//内胆ID只允许输入数字
			boxIdInput() {
				var reg = /[^\d]/ig
				if (reg.test(this.boxId)) {
					this.$nextTick(function() {
						this.boxId = this.boxId.replace(reg, '')
					})
				}
			},
			selBoxByCode() {
				if (this.boxCode.length <= 0) {
					uni.showToast({
						icon: 'none',
						title: '自编号不能为空'
					})
				} else {
					this.GetBoxInfo(false)
				}
			},
			selBoxById() {
				if (this.boxId.length != 10) {
					uni.showToast({
						icon: 'none',
						title: '内胆ID不足10位'
					})
				} else {
					this.GetBoxInfo()
				}
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
								if (!reg.test(paramArray[0]) && paramArray[0].length == 10) {
									that.boxId = paramArray[0]

									that.GetBoxInfo()
								} else {
									uni.showToast({
										icon: 'none',
										title: '内胆ID为10位数字'
									})

									return
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
			GetBoxInfo(isById = true) {
				var that = this

				var data = {
					'IsWeChat': true
				}
				if (isById) {
					data.BoxID = that.boxId
				} else {
					data.BoxCode = that.boxCode
				}


				//根据内胆Id查询内胆信息，存在进行修改，不存在则进行新增；
				that.$Api.Box_GetPaged(data).then((res) => {
					console.log(res)

					that.boxId = ''
					that.boxCode = ''

					if (res.result && res.result.items.length > 0) {
						that.boxInfo = res.result.items[0]
						that.baseBoxEditControl.$vm.load()

						console.log('修改')
						that.state = '修改'

						uni.setNavigationBarTitle({
							title: '修改内胆'
						})
					} else {
						if(isById){
							//根据内胆ID查询，不存在则跳转新增页面
							that.baseBoxAddControl.$vm.load()
							
							console.log('新增')
							that.state = '新增'
							
							uni.setNavigationBarTitle({
								title: '新增内胆'
							})
						}else{
							//根据自编号查询，如果没有则进行提示
							uni.showToast({
								icon: 'none',
								title: '未查询到此内胆'
							})
						}
					}
				})
			},
			operate: Throttle(async function() {
				var result = false
				if (this.state == '新增') {
					result = await this.baseBoxAddControl.$vm.addBox()
					console.log('新增内胆状态' + result)
				} else if (this.state == '修改') {
					result = await this.baseBoxEditControl.$vm.editBox()
					console.log('修改内胆状态' + result)
				}
				
				if (result) {
					this.cancenl()
				}
			}, 1000),
			cancenl() {
				uni.setNavigationBarTitle({
					title: '内胆维护'
				})

				this.state = '扫码'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.identify,
	#baseBoxEdit {
		/deep/.uni-easyinput__content-input {
			font-size: 22px;
			height: 48px;
		}
	}

	/deep/.uni-section-header__content {
		text-align: left;
	}

	/deep/.uni-section-header {
		padding: 30rpx 0px !important;
	}
</style>

<style lang="scss">
	page {
		width: 100%;
		height: 100%;

		.content {
			display: flex;
			flex-direction: column;
			justify-content: center;
			height: inherit;
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
	}
</style>