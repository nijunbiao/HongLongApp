<template>
	<page-meta
		:page-style="'overflow:'+(isShowPopup ? 'hidden' : 'visible') + ';' + (!isShowNoData ? '' : 'height:100%')">
	</page-meta>
	<view class="content">
		<uni-popup ref="popup" :class="{'dialogPopup' : pupopType == 'dialog'}" :type="pupopType" @change="popupChange">
			<view class="popup-content" :style="'padding-bottom:' + (pupopType == 'bottom' ? '120rpx' : '')">
				<text class="popup-title" :style="'color:' + (chartCurrentIndex == 0 ? '#B22222' : '#9ACD32')">
					{{ (chartCurrentIndex == 0 ? '满胆' : '空胆') + '详情' }}
				</text>
				<text v-for="(item, index) in boxCountList" :key="index">
					{{ item.productModel + '内胆:' + (chartCurrentIndex == 0 ? item.fullBoxCount : item.emptyBoxCount) }}
				</text>
			</view>
		</uni-popup>

		<uni-easyinput prefixIcon="search" v-model="searchValue" placeholder="按场站名搜索" :inputBorder="true"
			@change="getControlTerminalGroupByBusTerminal">
		</uni-easyinput>

		<view v-if="!isShowNoData" v-for="(item, index) in busTerminalList" :key="index" class="busTerminalInfo">
			<view class="title">
				<label :id="item.busTerminalId" class="stationName"
					:class="checkboxDetail.findIndex((detail) => detail == item.busTerminalId) > -1 ? 'checked' : 'unChecked'"
					@click="checked">
					<image></image>
					{{ (item.stationName ? item.stationName : '未分组') }}
				</label>
				<text class="cabinetInfo">{{ '主控柜:' + item.terminalCount + 
											 '\t内胆柜:' + item.boxCabinetCount + 
											 '\t电子钥匙:' + item.keyCount}}
				</text>
				<text :id="item.busTerminalId" class="detailBtn" @click="cardClick">查看详情 ></text>
			</view>

			<view :id="item.busTerminalId" class="chart" @click="boxDetails">
				<qiun-data-charts type="pie" :opts="opts" :tapLegend="false" :canvas2d="true" :loadingType="3"
					:chartData="item.chartData" @getIndex="chartsClick" />
			</view>
		</view>

		<button v-if="!isShowNoData" class="sumBtn" :class="{'sumBtnAvailable': checkboxDetail.length > 1}"
			:style="'z-index:' + (pupopType == 'bottom' ? '99' : '9')" @click="boxSumDetails">
			<uni-badge class="badge" :text="checkboxDetail.length" size="normal">
			</uni-badge>
			查看汇总
		</button>
		<view v-else class="noData">
			<image src="../../static/noData.png" />
			<text>未查询到数据</text>
		</view>
	</view>
</template>

<script>
	import {
		StopPullDownRefreshStatus,
		Throttle
	} from '@/utils/tool.js'
	export default {
		data() {
			return {
				//popup弹出方式
				pupopType: '',
				//是否显示无数据
				isShowNoData: false,
				//记录选中的场站Id
				checkboxDetail: [],
				//搜索的场站名
				searchValue: '',
				//是否
				isShowPopup: false,
				busTerminalList: [],
				//图列形状
				legendShape: 'rect',
				opts: {
					timing: 'easeOut',
					color: ['#B22222', '#9ACD32', '#6495ED', '#D2691E', '#999999'],
					padding: [5, 5, 5, 5],
					enableScroll: false,
					extra: {
						pie: {
							activeOpacity: 0.5,
							activeRadius: 10,
							offsetAngle: 0,
							labelWidth: 15,
							border: true,
							borderWidth: 2,
							borderColor: '#FFFFFF'
						},
						tooltip: {
							legendShape: this.legendShape,
							//showBox: false
						}
					},
					legend: {
						position: 'left',
						lineHeight: 20,
						float: 'center'
					}
				},
				chartCurrentIndex: -1,
				boxCountList: []
			}
		},
		onLoad() {
			console.log('onLoad')
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#003366',
				animation: {
					duration: 3000,
					timingFunc: "easeOut"
				}
			})

			this.getControlTerminalGroupByBusTerminal()
		},
		onPullDownRefresh() {
			this.pullDownRefresh()
		},
		methods: {
			checked(e) {
				console.log(e)

				//处理选中的场站集合
				if (this.checkboxDetail.includes(e.currentTarget.id)) {
					this.checkboxDetail = this.checkboxDetail.filter((item) => item != e.currentTarget.id)
				} else {
					this.checkboxDetail.push(e.currentTarget.id)
				}
			},
			boxSumDetails() {
				if (this.checkboxDetail.length > 1) {
					if (this.isShowPopup) {
						this.$refs.popup.close()
					} else {
						this.pupopType = 'bottom'
						this.chartCurrentIndex = 0
						this.getBoxCountGroupByTerminalAndType(this.checkboxDetail.join())
					}
				} else {
					uni.showToast({
						icon: 'none',
						title: '至少选择两个项'
					})
				}
			},
			boxDetails(e) {
				console.log(e)
				if (this.chartCurrentIndex == 0 || this.chartCurrentIndex == 1) {
					this.pupopType = 'dialog'
					this.getBoxCountGroupByTerminalAndType(e.currentTarget.id)
				}
			},
			popupChange(e) {
				this.isShowPopup = e.show
			},
			chartsClick(e) {
				console.log(e)

				if (e.currentIndex >= 0) { //点击了饼图
					this.chartCurrentIndex = e.currentIndex
				} else if (e.legendIndex >= 0) { //点击了图列
					this.chartCurrentIndex = e.legendIndex
				} else {
					this.chartCurrentIndex = -1
				}
			},
			getBoxCountGroupByTerminalAndType(busTerminalIds) {
				var organizationUnitIds = []
				var userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					organizationUnitIds = userInfo.currentUserOrganizationUnitIds
				}

				this.$Api.GetBoxCountGroupByTerminalAndType({
					'TenantId': userInfo.tenantId,
					'OrganizationUnitIds': organizationUnitIds,
					'BusTerminalId': busTerminalIds
				}).then((res) => {
					console.log(res)
					this.boxCountList = res.result
					this.$refs.popup.open()
				})
			},
			getControlTerminalGroupByBusTerminal(callBack) {
				var organizationUnitIds = []
				var userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					organizationUnitIds = userInfo.currentUserOrganizationUnitIds
				}

				this.$Api.GetControlTerminalGroupByBusTerminal({
					'PageNumber': 1,
					'PageSize': 99,
					'TenantId': userInfo.tenantId,
					'OrganizationUnitIds': organizationUnitIds,
					'StationName': this.searchValue
				}).then((res) => {
					console.log(res)
					if (res) {
						this.busTerminalList = res.result.items
						//this.busTerminalList = this.busTerminalList.concat(res.result.items)

						this.isShowNoData = true
						for (var i = 0; i < this.busTerminalList.length; i++) {
							this.busTerminalList[i].chartData = {}

							let chartData = {
								series: [{
									data: [{
											'pointShape': this.legendShape,
											'legendShape': this.legendShape,
											'color': '#B22222',
											'name': '满胆',
											'legendText': '满胆' + this.busTerminalList[i]
												.fullBoxCount,
											'value': this.busTerminalList[i].fullBoxCount,
											'labelText': '满胆:' + this.busTerminalList[i]
												.fullBoxCount,
											'labelShow': false
										},
										{
											'pointShape': this.legendShape,
											'legendShape': this.legendShape,
											'color': '#9ACD32',
											'name': '空胆',
											'legendText': '空胆' + this.busTerminalList[i]
												.emptyBoxCount,
											'value': this.busTerminalList[i].emptyBoxCount,
											'labelText': '空胆:' + this.busTerminalList[i]
												.emptyBoxCount,
											'labelShow': false
										},
										{
											'pointShape': this.legendShape,
											'legendShape': this.legendShape,
											'color': '#6495ED',
											'name': '无胆',
											'legendText': '无胆' + this.busTerminalList[i]
												.emptyCellCount,
											'value': this.busTerminalList[i].emptyCellCount,
											'labelText': '无胆:' + this.busTerminalList[i]
												.emptyCellCount,
											'labelShow': false
										},
										{
											'pointShape': this.legendShape,
											'legendShape': this.legendShape,
											'color': '#D2691E',
											'name': '故障',
											'legendText': '故障' + this.busTerminalList[i]
												.hitchCount,
											'value': this.busTerminalList[i].hitchCount,
											'labelText': '故障:' + this.busTerminalList[i]
												.hitchCount,
											'labelShow': false
										}
									]
								}]
							};

							this.busTerminalList[i].chartData = chartData
							console.log(chartData)
						}
						
						console.log(this.busTerminalList)
						if (this.busTerminalList.length > 0) {
							this.isShowNoData = false
						}
					}

					//判断是否有回调函数
					if (typeof(callBack) == 'function')
						callBack()
				})
			},
			cardClick: Throttle(function(e) {
				console.log(e)
				console.log(e[0].currentTarget.id)

				//跳转到主控机信息页面
				uni.navigateTo({
					url: '/pages/cashCabinet/controlTerminal/controlTerminal?TerminalId=' + e[0]
						.currentTarget.id + '&StationName=' + this.busTerminalList.filter((b) => b
							.busTerminalId == e[0].currentTarget.id)[0].stationName
				})
			}),
			//下拉刷新
			pullDownRefresh() {
				console.log("下拉刷新啦");
				//导航条加载动画
				uni.showNavigationBarLoading()
				this.getControlTerminalGroupByBusTerminal(StopPullDownRefreshStatus)
			}
		}
	}
</script>

<style scoped lang="scss">
	/deep/.uni-easyinput {
		width: calc(100% - 10rpx) !important;
		margin: 5rpx 5rpx 0rpx;
		position: fixed;
		top: 0px;
		z-index: 9;
	}

	/deep/.is-input-border {
		border-radius: 50rpx;
	}

	.dialogPopup {
		/deep/.uni-popup__wrapper {
			width: calc(100% - 40rpx);
			border-radius: 10rpx;
		}
	}

	/deep/.vue-ref {
		padding-bottom: 0rpx !important;
	}

	/deep/.uni-popup__wrapper {
		background-color: #fff !important;
		padding: 20rpx 0rpx;
		text-align: center;
		line-height: 60rpx;
		border-radius: 10rpx 10rpx 0rpx 0rpx;
	}

	/deep/.uni-badge--x {
		position: fixed;
		right: 15rpx;
		bottom: 90rpx;
	}
</style>

<style lang="scss">
	page {
		padding: 90rpx 0rpx 120rpx 0rpx;
		// padding-bottom: constant(safe-area-inset-bottom);
		// padding-bottom: env(safe-area-inset-bottom);

		.content {
			height: inherit;

			.popup-content {
				text {
					display: block;
					color: #666666;
				}

				.popup-title {
					font-weight: bolder;
					margin-bottom: 30rpx;
				}
			}

			.sumBtn {
				position: fixed;
				bottom: 0px;
				background-color: #000000;
				color: #a9a9a9;
				margin: 20rpx;
				width: calc(100% - 40rpx);
				border-radius: 50rpx;
				
				.badge{
					border: none;
				}
			}
			
			.sumBtn::after {
				border: none;
			}

			.sumBtnAvailable {
				background-color: #00ccff;
				color: #003366;
				font-weight: bolder;
			}

			.busTerminalInfo {
				margin: 20rpx;
				border-radius: 10rpx;
				box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.3);

				.title {
					padding: 20rpx;
					background-color: #003366;
					color: white;
					border-radius: 10rpx 10rpx 0rpx 0rpx;

					.stationName {
						color: white;
						display: flex;
						width: fit-content;
						padding: 10rpx;
						font-size: 40rpx;
						font-weight: bolder;
						align-items: center;
						border-radius: 10rpx;
						border: 1px solid white;

						image {
							width: 40rpx;
							height: 40rpx;
						}
					}

					.checked {
						color: #00ccff;
						border: 1px solid #00ccff;

						image {
							content: url('../../static/checkboxChecked.png')
						}
					}

					.unChecked {
						image {
							content: url('../../static/checkboxUnChecked.png')
						}
					}

					.cabinetInfo {
						font-size: 26rpx;
					}

					.detailBtn {
						color: #00ccff;
						float: right;
						font-size: 30rpx;
						font-weight: bolder;
					}
				}

				.chart {
					width: inherit;
					height: 300rpx;
				}
			}

			.noData {
				height: calc(100% - 80rpx);
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				image {
					width: 100rpx;
					height: 100rpx;
					margin-bottom: 20rpx;
				}

				text {
					color: #999999;
					font-size: 30rpx;
				}
			}
		}
	}
</style>
