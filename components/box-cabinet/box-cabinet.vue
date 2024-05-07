<template>
	<view class="content">
		<!-- 内胆柜信息轮播 -->
		<view class="boxInfo">
			<uni-swiper-dot @clickItem="swiperDotClickItem" :info="swiperInfo" :current="swiperCurrent" mode="indexes"
				field="content">
				<swiper vertical class="swiper-box" @change="swiperChange" :current="swiperDotCurrent">
					<template v-for="(item, index) in terminalList" :index="index">
						<swiper-item v-for="(boxCabinet, boxCabinetIndex) in item.boxCabinets" :index="boxCabinetIndex"
							:key="boxCabinetIndex">
							<view class="boxCabinet cabinet">
								<text class="boxCabinetTitle title">{{boxCabinet.boxCabinetNo + '号柜'}}</text>
								<template v-if="boxCabinet.boxLockerList && boxCabinet.boxLockerList.length > 0">
									<template v-for="(count, countIndex) in 18">
										<view
											v-for="(box, boxIndex) in boxCabinet.boxLockerList.filter((b) => b.boxLockerNo == caclBoxLockerNo(countIndex))"
											:key="box" :index="boxIndex" class="boxBox box"
											:style="{'background-color':box.page_BackgroundColor}">
											<!-- 格子编号 -->
											<view class="boxLockerNo lockerNo">
												{{box.boxLockerNo > 9 ? box.boxLockerNo : '0' + box.boxLockerNo}}
											</view>
											<!-- 格子状态 -->
											<view class="boxStatus status">{{box.page_BoxStatus}}</view>
											<!-- 内胆自编号 -->
											<view class="boxCode code">{{box.boxCode}}</view>
										</view>
									</template>
								</template>
							</view>
						</swiper-item>
					</template>
				</swiper>
			</uni-swiper-dot>
		</view>
	</view>
</template>

<script>
	export default {
		name: "box-cabinet",
		props: {
			terminalId: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				//内胆柜格子信息
				boxLockerList: [],
				//内胆柜轮播信息
				swiperInfo: [],
				//主控机-内胆柜信息
				terminalList: [],
				//当前内胆柜Index
				swiperCurrent: 0,
				//内胆柜指示点Index
				swiperDotCurrent: 0
			}
		},
		onLoad() {
			console.log('子组件加载数据')
			this.getBoxCabinetStatus()
		},
		computed: {
			//根据index获取对应的boxLockerNo值
			caclBoxLockerNo() {
				return function(index) {
					index += 1
					return (Math.ceil(index / 2) + (((index + 1) % 2) * 9))
				}
			}
		},
		methods: {
			//轮播Change
			swiperChange(e) {
				//console.log(e)
				this.swiperCurrent = e.detail.current
			},
			//轮播指示点Click
			swiperDotClickItem(e) {
				//console.log(e)
				this.swiperDotCurrent = e
			},
			//初始化加载数据
			init() {
				var that = this
				this.$nextTick(() => {
					that.getBoxCabinetStatus()
				})
			},
			//获取内胆柜状态
			async getBoxCabinetStatus() {
				console.log('子组件getBoxCabinetStatus方法')

				//刷新数据初始化默认值
				// this.swiperCurrent = 0
				// this.swiperDotCurrent = 0

				//获取用户所属组织机构
				var data = {}
				var userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					data.OrganizationUnitIds = userInfo.currentUserOrganizationUnitIds
				}

				if (this.terminalId) {
					data.TerminalId = this.terminalId
				}

				//获取主控柜信息
				var terminalListRes = await this.$Api.GetControlTerminalListWithCabinet(data)
				if (terminalListRes && terminalListRes.result && terminalListRes.result.items.length > 0) {
					this.terminalList = terminalListRes.result.items
					this.terminalList.forEach((terminal) => {
						//循环主控机对应的内胆柜
						terminal.boxCabinets.forEach((boxCabinet) => {
							boxCabinet.boxLockerList = []
							for (var i = 1; i <= this.$Global.CabinetNum; i++) {
								boxCabinet.boxLockerList.push({
									'page_BackgroundColor': '#B9D1EA',
									'boxLockerNo': i,
									'page_BoxStatus': '未知',
									'boxCode': ''
								})
							}
						})
					})

					data.TenantId = userInfo.tenantId

					console.log(this.swiperInfo)

					//获取内胆格子信息
					var boxLockerListRes = await this.$Api.GetBoxLockerList(data)
					if (boxLockerListRes.result && boxLockerListRes.result.items.length > 0) {
						this.boxLockerList = boxLockerListRes.result.items

						//数据处理
						var dateNow = Date.now()
						var count = 0
						this.swiperInfo = []
						this.terminalList.forEach((terminal) => {
							//循环主控机对应的内胆柜
							terminal.boxCabinets.forEach((boxCabinet) => {
								//会有空格，需要去除
								boxCabinet.boxCabinetNo = boxCabinet.boxCabinetNo.trim()
								
								this.swiperInfo.push({
									"current": '[' + terminal.terminalCode + ']' +
										boxCabinet
										.boxCabinetNo + '号柜'
								})

								boxCabinet.index = count++
								boxCabinet.boxLockerList = []

								//根据内胆柜过滤出对应的18个格子
								boxCabinet.boxLockerList = this.boxLockerList.filter((box) => box
									.boxCabinetNo == boxCabinet.boxCabinetNo && box
									.terminalGuid ==
									terminal.terminalGuid)

								//处理内胆格子信息，方便前台使用
								if (boxCabinet.boxLockerList.length > 0) {
									boxCabinet.boxLockerList.forEach((box) => {
										if (!box.boxCode) {
											box.boxCode = ''
										}

										var actionTime = Date.parse(box.actionTime)
										box.page_IsTimeOut = ((dateNow - actionTime) /
												1000 /
												60) >
											this.$Global.BoxLockerOffLineMinutes

										var page_BoxStatus = box.boxStatus
										var page_BackgroundColor = '#C0C0C0'
										if (box.page_IsTimeOut) {
											page_BoxStatus = '离线'
											page_BackgroundColor = '#C0C0C0'
										} else if (!box.workStatus.includes('正常') && !box
											.workStatus.includes('重启')) {
											page_BoxStatus = '故障'
											page_BackgroundColor = '#D2691E'
										} else if (box.doorStatus == '开门') {
											page_BoxStatus = '开门'
											page_BackgroundColor = '#DAA520'
										} else if (box.boxStatus == '无胆') {
											page_BackgroundColor = '#6495ED'
										} else if (box.boxStatus == '空胆') {
											page_BackgroundColor = '#9ACD32'
										} else if (box.boxStatus == '满胆') {
											page_BackgroundColor = '#B22222'
										}
										box.page_BoxStatus = page_BoxStatus
										box.page_BackgroundColor = page_BackgroundColor
									})
								}
							})
						})
					}

					console.log(this.terminalList)
				}
			}
		}
	}
</script>

<style lang="scss">
	.content {
		height: 100%;

		.boxInfo {
			height: inherit;

			.swiper-box {
				height: inherit;

				swiper-item {
					display: flex;
					align-items: center;

					.boxCabinet {
						width: 380rpx;
						height: 940rpx;
						margin: auto;
						padding: 10rpx 0rpx;
					}

					.boxBox {
						width: 167rpx;
						margin: 10rpx;
 
						.boxLockerNo {
							font-size: 35rpx;
							width: 40rpx;
						}
  
						.boxStatus,
						.boxCode {
							width: 127rpx;
						}

						.boxCode {
							font-size: 25rpx;
						}
					}
				}
			}

			.cabinet {
				text-align: center;
				display: table;
				border: 1px solid #cccccc;
				border-radius: 10rpx;
				box-shadow: 20rpx 20rpx 30rpx #cccccc;
			}

			.title {
				font-size: 30rpx;
				line-height: 40rpx;
				font-weight: bolder;
				display: block;
			}

			.box {
				height: 80rpx;
				color: white;
				float: left;
				background-color: aqua;
				border-radius: 20rpx;
				border: 1rpx solid #666666;
				box-shadow: 5rpx 10rpx 10rpx #666666;

				view {
					float: left;
					display: inline-block;
				}

				.lockerNo {
					line-height: 80rpx;
				}

				.status,
				.code {
					line-height: 40rpx;
				}

				.status {
					font-size: 30rpx;
				}

				.code {
					font-size: 20rpx;
				}
			}
		}
	}
</style>
