<template>
	<page-meta
		:page-style="'overflow:' + (isShowPopup ? 'hidden' : 'visible') + ';height:' + (isShowNoData ? '100%' : 'auto')">
	</page-meta>
	<view class="content">
		<!-- 筛选弹出层 -->
		<view class="filter">
			<button class="refresh" @click="onRefresh">刷新</button>
			<button class="openPopup" @click="openPopupFilter">筛选</button>
			<uni-popup ref="popup" type="top" mask-background-color="rgba(0, 0, 0, 0.5)" @change="popupChange">
				<view class="condition">
					<uni-forms :modelValue="filterFormData" label-position="left">
						<uni-forms-item label="主控机">
							<uni-data-select v-model="filterFormData.selectValue" :localdata="selectTerminalData"
								:clear="false">
							</uni-data-select>
						</uni-forms-item>
						<uni-forms-item label="时间段">
							<uni-datetime-picker v-model="filterFormData.datetimerange" :start="startDate"
								:end="endDate" type="daterange" rangeSeparator="至" @change="dateTimeChange" />
						</uni-forms-item>
					</uni-forms>
				</view>
				<view class="operation">
					<button class="close" @click="closePopupFilter">关闭</button>
					<button class="define" @click="filter">确定</button>
				</view>
			</uni-popup>
		</view>
		<view v-if="!isShowNoData" class="tip">
			<text>{{'共' + totalCount + '条收满胆记录'}}</text>
		</view>
		<!-- 收满胆列表 -->
		<view v-if="!isShowNoData" class="list"
			:style="{height: itemHeight * (takeFullBoxRecordListAll.length) + 'px'}">
			<view :style="{paddingTop: paddingTop + 'px'}">
				<view v-for="(item, index) in showTakeFullBoxRecordList" :key="index" :index="index" class="info">
					<uni-row class="demo-uni-row">
						<uni-col :span="24">
							<view class="demo-uni-col">
								<text class="title">设备：</text>
								<text class="value">
									{{item.terminalCode + '主机' + item.boxCabinetNo + '号柜' + item.boxLockerNo + '号箱'}}
								</text>
							</view>
						</uni-col>
					</uni-row>
					<uni-row class="demo-uni-row">
						<uni-col :span="14">
							<view class="demo-uni-col">
								<text class="title">内胆：</text>
								<text class="value">{{item.boxCode + '（' + item.boxID + '）'}}</text>
							</view>
						</uni-col>
						<uni-col :span="10">
							<view class="demo-uni-col">
								<text class="title">车号：</text>
								<text class="value">{{item.lastVehicleCode}}</text>
							</view>
						</uni-col>
					</uni-row>
					<uni-row class="demo-uni-row">
						<uni-col :span="14">
							<view class="demo-uni-col">
								<text class="title">还胆：</text>
								<text class="value">{{item.lastUserName + '（' + item.lastUserCode + '）'}}</text>
							</view>
						</uni-col>
						<uni-col :span="10">
							<view class="demo-uni-col">
								<text class="value">{{tool.StrToDate(item.lastOperationTime)}}</text>
							</view>
						</uni-col>
					</uni-row>
					<uni-row class="demo-uni-row">
						<uni-col :span="14">
							<view class="demo-uni-col">
								<text class="title">收胆：</text>
								<text class="value">{{item.userName + '（' + item.userCode + '）'}}</text>
							</view>
						</uni-col>
						<uni-col :span="10">
							<view class="demo-uni-col">
								<text class="value">{{tool.StrToDate(item.operationTime)}}</text>
							</view>
						</uni-col>
					</uni-row>
				</view>
				<uni-load-more iconType="snow" v-show="isShowLoadMore" :status="loadStatus"
					:content-text="loadContentText" />
			</view>
		</view>
		<view v-else class="noData">
			<image src="../../static/noData.png" />
			<text>未查询到数据</text>
		</view>
	</view>
</template>

<script>
	import * as tool from '@/utils/tool.js'
	export default {
		data() {
			return {
				tool: null,
				//是否显示筛选弹出层
				isShowPopup: false,
				//筛选时间段最大最小值
				startDate: "",
				endDate: "",
				// 表单数据
				filterFormData: {
					selectValue: undefined,
					datetimerange: []
				},
				//主控机下拉框数据
				selectTerminalData: [],
				//是否显示无数据
				isShowNoData: true,
				//总条数
				totalCount: 0,
				//查询第几页
				pageNum: 1,
				updateList: false,
				//长列表数据源
				takeFullBoxRecordListAll: [],
				//展示给用户
				showTakeFullBoxRecordList: [],
				//每条数据所占高度
				itemHeight: 0,
				//每次加载到可视区域的数量，itemHeight X showNum 要可视区域高度 ，否则页面滚动不了
				showNum: 10,
				//偏移量
				paddingTop: 0,
				//卷起的高度
				scrollTop: 0,
				//可视区域第一条数据的索引
				startIndex: -1,
				//是否显示底部“加载更多”
				isShowLoadMore: false,
				//底部加载的状态
				loadStatus: 'more',
				loadContentText: {
					contentdown: '快拉下面还有好多呢',
					contentrefresh: '别着急正在加载',
					contentnomore: '别拉了没数据了'
				}
			};
		},
		onReady() {},
		onLoad() {
			this.tool = tool
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#003366'
			})

			this.GetTerminalInfo()

			var date = new Date()
			this.startDate = "2020-01-01"
			this.endDate = tool.StrToDate(date, "YYYY-MM-DD")
			this.filterFormData.datetimerange = [date, date]

			this.GetBoxDistributionDetail_InOutLockerBoxExtension()
		},
		onShow() {
			this.itemHeight = tool.RpxTopx(220)
		},
		onPullDownRefresh() {
			this.pullDownRefresh()
		},
		onReachBottom() {
			this.isShowLoadMore = true
			this.GetBoxDistributionDetail_InOutLockerBoxExtension()
		},
		onPageScroll: tool.Throttle(function(res) {
			if(this.pageNum < 2){
				return;
			}
			
			//减少函数的触发频率，每隔多少ms就执行一次函数
			console.log(res[0].scrollTop)
			this.scrollTop = res[0].scrollTop
			this.getShowList()
		}),
		methods: {
			popupChange(e) {
				this.isShowPopup = e.show
			},
			dateTimeChange(e) {
				this.filterFormData.datetimerange = e
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
				console.log(this.filterFormData)

				this.onRefresh()
			},
			//获取收银柜主控机信息
			async GetTerminalInfo() {
				var data = {}
				var userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					data.OrganizationUnitIds = userInfo.currentUserOrganizationUnitIds
				}

				//获取主控柜信息
				var terminalListRes = await this.$Api.GetControlTerminalListWithCabinet(data)
				if (terminalListRes && terminalListRes.result && terminalListRes.result.items.length > 0) {
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
				}
			},
			//获取收满胆记录
			async GetBoxDistributionDetail_InOutLockerBoxExtension(callBack) {
				//是否为第一页
				var firstPage = this.pageNum == 1
				if (firstPage) {
					this.loadStatus = "more"
					console.log("当前为第一页")
				}

				//如果加载状态为无数据则不继续调用Api
				if (this.loadStatus == 'no-more') {
					return
				}

				this.loadStatus = 'loading'
				var data = {
					'MaxResultCount': this.$Global.PageSize,
					'SkipCount': (this.pageNum - 1) * this.$Global.PageSize,
					'ActionTimeFrom': tool.StrToDate(this.filterFormData.datetimerange[0], "YYYY-MM-DD") +
						" 00:00:00",
					'ActionTimeTo': tool.StrToDate(this.filterFormData.datetimerange[1], "YYYY-MM-DD") +
						" 23:59:59",
				}

				if (this.filterFormData.selectValue) {
					data.TerminalGuid = this.filterFormData.selectValue
				}

				var userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					data.TenantId = userInfo.tenantId
					data.OrganizationUnitIds = userInfo.currentUserOrganizationUnitIds
				}

				var res = await this.$Api.GetBoxDistributionDetail_InOutLockerBoxExtension(data, firstPage)
				if (res) {
					console.log(res)

					this.isShowNoData = true
					if (res) {
						//查询第一页时先清空总列表
						if (this.pageNum == 1) {
							this.takeFullBoxRecordListAll = []
						}

						this.takeFullBoxRecordListAll = this.takeFullBoxRecordListAll.concat(res.result.items)
						this.totalCount = res.result.totalCount

						if (this.takeFullBoxRecordListAll.length > 0) {
							this.isShowNoData = false
						}
					}
					
					this.updateList = true
					this.getShowList()

					if (typeof(callBack) == 'function') {
						callBack()
					}

					this.pageNum += 1

					if (this.totalCount == 0 || this.takeFullBoxRecordListAll.length >= this.totalCount) {
						this.loadStatus = 'no-more'
					} else {
						this.loadStatus = 'more'
					}

					this.isShowLoadMore = false
				}
			},
			//计算可视区域数据
			getShowList() {
				//可视区域第一条数据的索引
				var startIndex = Math.floor(this.scrollTop / this.itemHeight)
				console.log('起始位置：' + startIndex)
				if (startIndex < 0) {
					startIndex = 0
				}
			
				//可视区域最后一条数据的后面那条数据的索引
				var endIndex = startIndex + this.$Global.PageSize
			
				//顶部预留待浏览数据（解决快速滑动时出现白屏情况）
				var offset = 0
				if (startIndex < this.$Global.PageSize) {
					offset = (startIndex + 1) * this.itemHeight
					startIndex = 0
				} else {
					offset = this.$Global.PageSize * this.itemHeight
					startIndex -= this.$Global.PageSize
				}
			
				//开始位置改变或数据源更新，则更新显示数据（减少不必要的SetData）
				if (this.startIndex != startIndex || this.updateList) {
					this.updateList = false
					this.startIndex = startIndex
			
					//可视区域显示的数据，即最后要渲染的数据。实际的数据索引是从this.startIndex到this.endIndex-1
					this.showTakeFullBoxRecordList = this.takeFullBoxRecordListAll.slice(startIndex,
						endIndex)
				}
			
				//获得一个可以被itemHeight整除的数来作为item的偏移量，这样随机滑动时第一条数据都是完整显示的	
				offset = this.scrollTop - offset - (this.scrollTop % this.itemHeight)
				this.paddingTop = offset < 0 ? 0 : offset
			},
			//下拉刷新
			pullDownRefresh() {
				console.log("下拉刷新啦");

				this.pageNum = 1
				//导航条加载动画
				uni.showNavigationBarLoading()
				this.GetBoxDistributionDetail_InOutLockerBoxExtension(tool.StopPullDownRefreshStatus)
			},
			//刷新按钮
			onRefresh() {
				this.isShowNoData = true
				//清空显示的列表
				this.showTakeFullBoxRecordList = []
				//滚动条设置到顶部
				uni.pageScrollTo({
					scrollTop: 0,
					duration: 300
				})
				this.scrollTop = 0
				this.isShowLoadMore = false
				this.pageNum = 1
				
				this.GetBoxDistributionDetail_InOutLockerBoxExtension()
			}
		}
	}
</script>

<style scoped>
	/deep/.uni-row {
		margin-left: 10rpx !important;
		margin-right: 10rpx !important;
	}

	/deep/.uni-popup__wrapper {
		background-color: #fff !important;
		padding: 20rpx;
		border-radius: 0rpx 0rpx 30rpx 30rpx;
	}

	/deep/.uni-calendar--fixed {
		top: 0rpx !important;
		bottom: auto !important;
	}

	/deep/.uni-calendar__header,
	/deep/.uni-calendar__box,
	/deep/.uni-calendar--fixed-top,
	/deep/.uni-date-btn--ok {
		background-color: #fff;
	}

	/deep/.uni-calendar-item--multiple {
		/* 中间日期的背景色 */
		background-color: #c0deff;
	}

	/deep/.uni-calendar-item--after-checked-x,
	/deep/.uni-calendar-item--before-checked-x {
		//首位日期的背景色
	}
</style>

<style lang="scss">
	page {
		height: 100%;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);

		.content {
			height: inherit;

			.filter {
				height: 70rpx;
				position: sticky;
				top: 0rpx;
				z-index: 9999;

				.openPopup::after,
				.refresh::after {
					border: none;
				}

				.openPopup,
				.refresh {
					border-radius: 0rpx;
					display: inline-block;
					width: 50%;
					height: inherit;
					font-size: 30rpx;
					border-bottom: 2rpx solid #cccccc;
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

			.tip {
				position: sticky;
				top: 70rpx;
				text-align: center;
				height: 50rpx;
				width: 100%;
				background-color: white;
				z-index: 9998;
			}

			.list {
				padding: 10rpx;

				.info {
					height: 200rpx;
					font-size: 26rpx;
					text-align: left;
					border: 2rpx solid black;
					border-radius: 20rpx;
					margin-bottom: 20rpx;
					//box-shadow: 0rpx 0rpx 20rpx 10rpx #cccccc inset;

					.demo-uni-row {
						margin-bottom: 10px;
						/* QQ、字节小程序文档写有 :host，但实测不生效 */
						/* 百度小程序没有 :host，需要设置block */
						/* #ifdef MP-TOUTIAO || MP-QQ || MP-BAIDU */
						display: block;
						/* #endif */
					}

					.demo-uni-col {
						height: 50rpx;
						line-height: 50rpx;
						border-radius: 10rpx;

						.title {
							color: #95989e;
						}

						.value {
							color: black;
						}
					}
				}
			}

			.noData {
				height: calc(100% - 70rpx);
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
