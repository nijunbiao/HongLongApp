<template>
	<page-meta :page-style="'overflow:'+(isShowPopup ? 'hidden' : 'visible')"></page-meta>
	<view class="content">
		<uni-popup ref="popup" type="dialog" background-color="#fff" @change="popupChange">
			<view class="popup-content">
				<text class="popup-title" :style="'color:' + (chartCurrentIndex == 0 ? '#B22222' : '#9ACD32')">{{ (chartCurrentIndex == 0 ? '满胆' : '空胆') + '详情' }}</text>
				<text v-for="(item, index) in boxCountList"
					:key="index">{{ item.productModel + '内胆:' + (chartCurrentIndex == 0 ? item.fullBoxCount : item.emptyBoxCount) }}</text>
			</view>
		</uni-popup>
		
		<view v-for="(item, index) in terminalList" :key="index" class="terminalInfo">
			<view class="title">
				<text class="stationName">{{ pageParameter.StationName + '（' + (item.terminalCode ? item.terminalCode : '未命名') + '）' }}</text>
				<text class="cabinetInfo">{{ '内胆柜:' + item.boxCabinetCount + 
											 '\t电子钥匙:' + item.keyCount}}
				</text>
				<text :id="item.id" class="detailBtn" @click="cardClick">查看详情 ></text>
			</view>
		
			<view :id="item.id" class="chart" @click="GetBoxCountGroupByTerminalAndType">
				<qiun-data-charts type="pie" :opts="opts" :tapLegend="false" :canvas2d="true" :loadingType="3"
					:chartData="item.chartData" @getIndex="chartsClick" />
			</view>
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
				isShowPopup: false,
				//主控机信息
				terminalList: [],
				//上级页面的传参
				pageParameter: null,
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
							legendShape: this.legendShape
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
		onLoad(query) {
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#003366',
				animation: {
					duration: 3000,
					timingFunc: "easeOut"
				}
			})

			this.pageParameter = query
			this.getControlTerminalGroupByTerminal()
		},
		onPullDownRefresh() {
			this.pullDownRefresh()
		},
		methods: {
			GetBoxCountGroupByTerminalAndType(e) {
				console.log(e)
				if (this.chartCurrentIndex == 0 || this.chartCurrentIndex == 1) {
					var organizationUnitIds = []
					var userInfo = uni.getStorageSync('userInfo')
					if (userInfo) {
						organizationUnitIds = userInfo.currentUserOrganizationUnitIds
					}
			
					this.$Api.GetBoxCountGroupByTerminalAndType({
						'TenantId': userInfo.tenantId,
						'OrganizationUnitIds': organizationUnitIds,
						'TerminalId': e.currentTarget.id
					}).then((res) => {
						console.log(res)
						this.boxCountList = res.result
						this.$refs.popup.open()
					})
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
			getControlTerminalGroupByTerminal(callBack) {
				var organizationUnitIds = []
				var userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					organizationUnitIds = userInfo.currentUserOrganizationUnitIds
				}

				this.$Api.GetControlTerminalGroupByTerminal({
					'PageNumber': 1,
					'PageSize': 99,
					'TenantId': userInfo.tenantId,
					'OrganizationUnitIds': organizationUnitIds,
					'BusTerminalId': this.pageParameter.TerminalId != 0 ? this.pageParameter.TerminalId : ''
				}).then((res) => {
					console.log(res)
					if (res) {
						this.terminalList = res.result.items
						
						for (var i = 0; i < this.terminalList.length; i++) {
							this.terminalList[i].chartData = {}
						
							let chartData = {
								series: [{
									data: [{
											'pointShape': this.legendShape,
											'legendShape': this.legendShape,
											'color': '#B22222',
											'name': '满胆',
											'legendText': '满胆' + this.terminalList[i]
												.fullBoxCount,
											'value': this.terminalList[i].fullBoxCount,
											'labelText': '满胆:' + this.terminalList[i]
												.fullBoxCount,
											'labelShow': false
										},
										{
											'pointShape': this.legendShape,
											'legendShape': this.legendShape,
											'color': '#9ACD32',
											'name': '空胆',
											'legendText': '空胆' + this.terminalList[i]
												.emptyBoxCount,
											'value': this.terminalList[i].emptyBoxCount,
											'labelText': '空胆:' + this.terminalList[i]
												.emptyBoxCount,
											'labelShow': false
										},
										{
											'pointShape': this.legendShape,
											'legendShape': this.legendShape,
											'color': '#6495ED',
											'name': '无胆',
											'legendText': '无胆' + this.terminalList[i]
												.emptyCellCount,
											'value': this.terminalList[i].emptyCellCount,
											'labelText': '无胆:' + this.terminalList[i]
												.emptyCellCount,
											'labelShow': false
										},
										{
											'pointShape': this.legendShape,
											'legendShape': this.legendShape,
											'color': '#D2691E',
											'name': '故障',
											'legendText': '故障' + this.terminalList[i]
												.hitchCount,
											'value': this.terminalList[i].hitchCount,
											'labelShow': false
										}
									]
								}]
							};
						
							this.terminalList[i].chartData = chartData
							console.log(chartData)
						}
					}

					//判断是否有回调函数
					if (typeof(callBack) == 'function') {
						callBack()
					}
				})
			},
			cardClick: Throttle(function(e) {
				console.log(e)
				console.log(e[0].currentTarget.id)

				//跳转到内胆柜/钥匙柜详细信息
				uni.navigateTo({
					url: '/pages/cashCabinet/cabinet/cabinet?Id=' + e[0].currentTarget.id +
						'&StationName=' + this.pageParameter.StationName + '&TerminalName=' + this
						.terminalList.filter((t) => t.id == e[0].currentTarget.id)[0].terminalCode
				})
			}),
			pullDownRefresh() {
				console.log("下拉刷新啦");
				//导航条加载动画
				uni.showNavigationBarLoading()
				this.getControlTerminalGroupByTerminal(StopPullDownRefreshStatus)
			}
		}
	}
</script>

<style scoped>
	/deep/.uni-popup__wrapper {
		background-color: #fff;
		width: calc(100% - 40rpx);
		padding: 20rpx 0rpx;
		text-align: center;
		line-height: 60rpx;
		border-radius: 10rpx;
	}
</style>

<style lang="scss">
	page {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		
		.popup-content {
			text {
				display: block;
				color: #666666;
			}
			
			.popup-title{
				font-weight: bolder;
				margin-bottom: 30rpx;
			}
		}

		.terminalInfo {
			margin: 20rpx;
			border-radius: 10rpx;
			box-shadow: 0rpx 0rpx 20rpx #cccccc;

			.title {
				padding: 20rpx;
				background-color: #003366;
				color: white;
				border-radius: 10rpx 10rpx 0rpx 0rpx;
			
				.stationName {
					display: block;
					font-size: 35rpx;
					font-weight: bolder;
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
				border-radius: 0rpx 0rpx 10rpx 10rpx;
			}
		}
	}
</style>
