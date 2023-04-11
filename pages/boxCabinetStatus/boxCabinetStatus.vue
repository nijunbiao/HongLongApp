<template>
	<page-meta :page-style="'overflow:' + (isShowPopup ? 'hidden' : 'visible')"></page-meta>
	<view class="content">
		<!-- 筛选弹出层 -->
		<view class="filter">
			<button class="refresh" @click="getBoxCabinetStatus">刷新</button>
			<button class="openPopup" @click="openPopupFilter">筛选</button>
			<uni-popup ref="popup" type="top" mask-background-color="rgba(0, 0, 0, 0.5)" @change="change">
				<view class="condition">
					<uni-forms :modelValue="filterFormData" label-position="left">
						<uni-forms-item label="主控机">
							<uni-data-select v-model="filterFormData.selectValue" :localdata="selectTerminalData"
								:clear="false">
							</uni-data-select>
						</uni-forms-item>
					</uni-forms>
				</view>
				<view class="operation">
					<button class="close" @click="closePopupFilter">关闭</button>
					<button class="define" @click="filter">确定</button>
				</view>
			</uni-popup>
		</view>
		<!-- 内胆柜信息轮播 -->
		<view class="uni-margin-wrap" v-if="isRefreshData">
			<uni-swiper-dot class="uni-swiper-dot-box" @clickItem="swiperDotClickItem" :info="swiperInfo"
				:current="current" mode="indexes" field="content">
				<swiper circular vertical autoplay class="swiper-box" @change="swiperChange" :current="swiperDotIndex">
					<template v-for="(item, index) in terminalList" :index="index">
						<swiper-item v-for="(boxCabinet, boxCabinetIndex) in item.boxCabinets" :index="boxCabinetIndex">
							<view class="boxCabinet">
								<text
									class="title">{{'[' + item.terminalCode + ']' + boxCabinet.boxCabinetNo + '号柜'}}</text>
								<template v-if="boxCabinet.boxLockerList && boxCabinet.boxLockerList.length > 0">
									<template v-for="(count, countIndex) in 18">
										<view
											v-for="(box, boxIndex) in boxCabinet.boxLockerList.filter((b) => b.boxLockerNo == caclBoxLockerNo(countIndex))"
											:key="box" :index="boxIndex" class="box"
											:style="{'background-color':box.page_BackgroundColor}">
											<!-- 格子编号 -->
											<view class="boxLockerNo">
												{{box.boxLockerNo > 9 ? box.boxLockerNo : '0' + box.boxLockerNo}}
											</view>
											<!-- 格子状态 -->
											<view class="boxStatus">{{box.page_BoxStatus}}</view>
											<!-- 内胆自编号 -->
											<view class="boxCode">{{box.boxCode}}</view>
										</view>
									</template>
								</template>
							</view>
						</swiper-item>
					</template>
				</swiper>
			</uni-swiper-dot>
		</view>
		<!-- 底部信息展示 -->
		<view class="gather" v-if="isRefreshData">
			<view v-for="(item, index) in gatherInfo" :key="item" :index="index" class="total"
				:style="{borderLeft: (index == 1 ? '2rpx solid #cccccc' : 'none')}">
				<text class="title">{{item.title}}</text>
				<view class="info">
					空胆
					<text class="number">{{item.emptyCount}}</text>
				</view>
				<view class="info">
					满胆
					<text class="number">{{item.fullCount}}</text>
				</view>
				<view class="info">
					空箱
					<text class="number">{{item.emptyCellCount}}</text>
				</view>
				<view class="info">
					故障
					<text class="number">{{item.hitchCount}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// interval: null,
				//是否显示筛选弹出层
				isShowPopup: false,
				//是否刷新数据
				isRefreshData: false,
				// 表单数据
				filterFormData: {
					selectValue: undefined
				},
				selectTerminalData: [],
				terminalList: [],
				boxLockerList: [],
				//内胆柜轮播信息
				swiperInfo: [],
				//底部信息
				gatherInfo: [{
						title: '单柜汇总',
						emptyCount: 0,
						fullCount: 0,
						emptyCellCount: 0,
						hitchCount: 0
					},
					{
						title: '场站汇总',
						emptyCount: 0,
						fullCount: 0,
						emptyCellCount: 0,
						hitchCount: 0
					}
				],
				//当前内胆柜Index
				current: 0,
				//内胆柜指示点Index
				swiperDotIndex: 0
			};
		},
		onLoad() {
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#000000'
			})

			this.getBoxCabinetStatus()
			// this.interval = setInterval(() => {
			// 	this.getBoxCabinetStatus()
			// }, this.$Monitor_AutoRefreshInterval);
		},
		onShow() {

		},
		onReady() {

		},
		onUnload() {
			// if (this.interval)
			// 	clearInterval(this.interval)
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
				this.current = e.detail.current

				this.updateBottomTipInfo()
			},
			//轮播指示点Click
			swiperDotClickItem(e) {
				//console.log(e)
				this.swiperDotIndex = e

				this.updateBottomTipInfo()
			},
			//更新底部信息展示
			updateBottomTipInfo() {
				var result = {}
				this.terminalList.forEach((r) => {
					r.boxCabinets.forEach((b) => {
						if (b.index == this.current) {
							result = b
							return
						}
					})
				})

				if (result) {
					this.gatherInfo[0].emptyCount = result.boxCabinet_emptyCount
					this.gatherInfo[0].fullCount = result.boxCabinet_fullCount
					this.gatherInfo[0].emptyCellCount = result.boxCabinet_emptyCellCount
					this.gatherInfo[0].hitchCount = result.boxCabinet_hitchCount
				}

				return result
			},
			openPopupFilter() {
				this.$nextTick(() => {
					//console.log(this.$refs)
					this.$refs.popup.open()
				})
			},
			closePopupFilter() {
				this.$nextTick(() => {
					//console.log(this.$refs)
					this.$refs.popup.close()
				})
			},
			filter() {
				this.$nextTick(() => {
					//console.log(this.$refs)
					this.$refs.popup.close()
				})
				console.log(this.filterFormData.selectValue)
				this.getBoxCabinetStatus()
			},
			change(e) {
				this.isShowPopup = e.show
			},
			//获取内胆柜状态
			async getBoxCabinetStatus() {
				//刷新数据初始化默认值
				this.current = 0
				this.swiperDotIndex = 0
				this.isRefreshData = false

				//获取用户所属组织机构
				var data = {}
				var userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					var ids = userInfo.currentUserOrganizationUnits.map((item) => item.id)
					if (ids && ids.length > 0) {
						data.OrganizationUnitIds = ids
					}
				}

				//统计内胆格状态
				var emptyCount = 0 //空胆
				var fullCount = 0 //满胆
				var emptyCellCount = 0 //空箱
				var hitchCount = 0 //故障

				//获取主控柜信息
				var terminalListRes = await this.$Api.GetControlTerminalListWithCabinet(data)
				if(!terminalListRes){
					return
				}
				
				if (terminalListRes.result && terminalListRes.result.items.length > 0) {
					//给主机柜下拉列表赋值
					this.selectTerminalData = [{
						value: '',
						text: '全部'
					}]

					terminalListRes.result.items.forEach((r) => {
						this.selectTerminalData.push({
							value: r.terminalGuid,
							text: r.terminalCode
						})
					})

					//根据过滤条件筛选主机柜
					if (this.filterFormData.selectValue) {
						terminalListRes.result.items = terminalListRes.result.items.filter((r) => r.terminalGuid ==
							this.filterFormData.selectValue)
						data.TerminalGuid = this.filterFormData.selectValue
					}
					this.terminalList = terminalListRes.result.items

					//获取内胆格子信息
					data.TenantId = uni.getStorageSync('userInfo').tenantId
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
								this.swiperInfo.push({
									"current": '[' + terminal.terminalCode + ']' + boxCabinet
										.boxCabinetNo + '号柜'
								})

								var boxCabinet_emptyCount = 0
								var boxCabinet_fullCount = 0
								var boxCabinet_emptyCellCount = 0
								var boxCabinet_hitchCount = 0
								boxCabinet.index = count++
								boxCabinet.boxLockerList = []

								//根据内胆柜过滤出对应的18个格子
								boxCabinet.boxLockerList = this.boxLockerList.filter((box) => box
									.boxCabinetNo == boxCabinet.boxCabinetNo && box.terminalGuid ==
									terminal.terminalGuid)

								//处理内胆格子信息，方便前台使用
								if (boxCabinet.boxLockerList.length > 0) {
									boxCabinet.boxLockerList.forEach((box) => {
										if (!box.boxCode) {
											box.boxCode = ''
										}

										var actionTime = Date.parse(box.actionTime)
										box.page_IsTimeOut = ((dateNow - actionTime) / 1000 /
												60) >
											this
											.$BoxLockerOffLineMinutes

										var page_BoxStatus = box.boxStatus
										var page_BackgroundColor = '#C0C0C0'
										if (box.page_IsTimeOut) {
											page_BoxStatus = '离线'
											page_BackgroundColor = '#C0C0C0'
										} else if (!box.workStatus.includes('正常') && !box
											.workStatus.includes('重启')) {
											page_BoxStatus = '故障'
											page_BackgroundColor = '#D2691E'
											hitchCount++
											boxCabinet_hitchCount++
										} else if (box.doorStatus == '开门') {
											page_BoxStatus = '开门'
											page_BackgroundColor = '#DAA520'
										} else if (box.boxStatus == '无胆') {
											page_BackgroundColor = '#6495ED'
											emptyCellCount++
											boxCabinet_emptyCellCount++
										} else if (box.boxStatus == '空胆') {
											page_BackgroundColor = '#9ACD32'
											emptyCount++
											boxCabinet_emptyCount++
										} else if (box.boxStatus == '满胆') {
											page_BackgroundColor = '#B22222'
											fullCount++
											boxCabinet_fullCount++
										}
										box.page_BoxStatus = page_BoxStatus
										box.page_BackgroundColor = page_BackgroundColor
									})
								} else {
									for (var i = 1; i <= 18; i++) {
										boxCabinet.boxLockerList.push({
											'page_BackgroundColor': '#B9D1EA',
											'boxLockerNo': i,
											'page_BoxStatus': '未知',
											'boxCode': ''
										})
									}
								}

								//总体数据的格子状态汇总
								this.gatherInfo[1].emptyCount = emptyCount
								this.gatherInfo[1].fullCount = fullCount
								this.gatherInfo[1].emptyCellCount = emptyCellCount
								this.gatherInfo[1].hitchCount = hitchCount

								//单柜子状态汇总
								boxCabinet.boxCabinet_emptyCount = boxCabinet_emptyCount
								boxCabinet.boxCabinet_fullCount = boxCabinet_fullCount
								boxCabinet.boxCabinet_emptyCellCount = boxCabinet_emptyCellCount
								boxCabinet.boxCabinet_hitchCount = boxCabinet_hitchCount
							})
						})
					}

					this.updateBottomTipInfo()
					console.log(this.terminalList)
				} else {
					uni.showToast({
						icon: 'none',
						title: '未找到关联的主控机'
					})

					//返回上一页
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				}

				this.isRefreshData = true
			}
		}
	}
</script>

<style scoped>
	/deep/.uni-select__selector-scroll {
		overflow: hidden;
	}

	/deep/.uni-popup__wrapper {
		background-color: #fff !important;
		padding: 20rpx;
		border-radius: 0rpx 0rpx 30rpx 30rpx;
	}

	/deep/.uni-swiper__warp {
		height: 100%;
	}

	/deep/.uni-swiper__dots-box {
		width: 50rpx !important;
		height: 100% !important;
		flex-direction: column !important;
		bottom: 0rpx !important;
		left: 20rpx !important;
	}

	/deep/.uni-swiper__dots-item {
		width: 40rpx !important;
		height: 40rpx !important;
		margin-bottom: 5rpx !important;
		margin-left: 0rpx !important;
	}

	/deep/.uni-swiper__dots-item:first-child {
		margin-bottom: 5rpx !important;
	}
</style>

<style lang="scss">
	page {
		height: 100%;

		.content {
			height: 100%;
		}

		.filter {
			height: 5%;
			position: sticky;
			top: 0rpx;
			z-index: 9999;

			.openPopup::after, .refresh::after {
				border: none;
			}

			.openPopup, .refresh {
				display: inline-block;
				width: 50%;
				height: 70rpx;
				font-size: 30rpx;
				box-shadow: 20rpx 20rpx 30rpx #cccccc;
			}

			.openPopup {
				border-left: 2rpx solid #cccccc;
			}

			.operation {
				text-align: center;

				button {
					display: inline-block;
					width: 30%;
					line-height: 80rpx;
				}

				.close {
					margin-right: 10%;
				}

				.define {
					color: white;
					background-color: black;
				}
			}
		}

		.uni-margin-wrap {
			height: calc(100% - 5% - 10%);

			.swiper-box {
				height: 100%;

				.boxCabinet {
					width: 375rpx;
					margin: 6% auto;
					text-align: center;
					display: table;
					margin-bottom: 50rpx;
					border: 2rpx solid #cccccc;
					border-radius: 20rpx;
					box-shadow: 20rpx 20rpx 30rpx #cccccc;

					.title {
						font-weight: bolder;
						display: block;
					}

					.box {
						width: 167rpx;
						height: 80rpx;
						color: white;
						float: left;
						background-color: aqua;
						margin: 10rpx;
						border-radius: 20rpx;

						view {
							float: left;
							display: inline-block;
						}

						.boxLockerNo {
							font-size: 35rpx;
							width: 40rpx;
							line-height: 80rpx;
						}

						.boxStatus,
						.boxCode {
							width: 127rpx;
							line-height: 40rpx;
						}

						.boxStatus {
							font-size: 30rpx;
						}

						.boxCode {
							font-size: 25rpx;
						}
					}
				}
			}
		}

		.gather {
			color: white;
			text-align: center;
			font-size: 25rpx;
			position: absolute;
			bottom: 0rpx;
			width: 100%;
			height: 10%;
			background-color: rgba(black, 1);
			border-radius: 30rpx 30rpx 0rpx 0rpx;

			.total {
				width: calc(50% - 1rpx);
				height: 100%;
				display: inline-block;
				margin-top: 10rpx;
				margin-bottom: 25rpx;

				.title {
					display: block;
				}

				.info {
					margin: 10rpx 5rpx;
					display: inline-grid;
				}
			}
		}
	}
</style>
