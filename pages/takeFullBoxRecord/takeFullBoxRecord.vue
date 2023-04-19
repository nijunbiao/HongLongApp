<template>
	<view class="content">
		<view class="list" :style="{height: itemHeight * (takeFullBoxRecordListAll.length) + 'px'}">
			<view :style="{paddingTop: top + 'px'}">
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
								<text class="value">{{StrToDate(item.lastOperationTime)}}</text>
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
								<text class="value">{{StrToDate(item.operationTime)}}</text>
							</view>
						</uni-col>
					</uni-row>
				</view>
				<uni-load-more iconType="snow" v-show="showLoadMore" :status="loadStatus"
					:content-text="loadContentText" />
			</view>
		</view>
	</view>
</template>

<script>
	import * as tool from '@/utils/tool.js'
	export default {
		data() {
			return {
				pageNum: 1,
				updateList: false,
				takeFullBoxRecordListAll: [],
				showTakeFullBoxRecordList: [],
				itemHeight: 0, //每条数据所占高度
				showNum: 10, //每次加载到可视区域的数量，itemHeight X showNum 要可视区域高度 ，否则页面滚动不了。
				top: 0, //偏移量
				scrollTop: 0, //卷起的高度
				startIndex: -1, //可视区域第一条数据的索引
				//endIndex: 0, //可视区域最后一条数据后面那条数据的的索引，因为后面要用slice(start,end)方法取需要的数据，但是slice规定end对应数据不包含在里面		
				showLoadMore: false,
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
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#000000'
			})

			this.GetBoxDistributionDetail_InOutLockerBoxExtension()
		},
		onShow() {
			this.itemHeight = tool.rpxTopx(220)
		},
		onPullDownRefresh() {
			this.onRefresh()
		},
		onReachBottom() {
			this.showLoadMore = true
			this.pageNum += 1
			this.GetBoxDistributionDetail_InOutLockerBoxExtension()
		},
		onPageScroll: tool.throttle(function(res) {
			console.log(res[0].scrollTop)
			this.scrollTop = res[0].scrollTop
			this.getShowList()
			//结果： 减少函数的触发频率，每隔多少ms就执行一次函数
		}),
		methods: {
			GetBoxDistributionDetail_InOutLockerBoxExtension(callback) {
				if (this.loadStatus == 'no-more') {
					return
				}

				this.loadStatus = 'loading'

				var data = {
					'MaxResultCount': this.$PageSize,
					'SkipCount': this.pageNum,
					'ActionTimeFrom': '2023-04-17 00:00:00',
					'ActionTimeTo': '2023-04-17 23:59:59',
				}

				var userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					data.TenantId = userInfo.tenantId
					data.OrganizationUnitIds = userInfo.currentUserOrganizationUnitIds
				}

				this.$Api.GetBoxDistributionDetail_InOutLockerBoxExtension(data, this.pageNum == 1 ? true : false).then((
					res) => {
					console.log(res)

					if (res) {
						if (this.pageNum == 1) {
							this.takeFullBoxRecordListAll = []
						}

						this.takeFullBoxRecordListAll = this.takeFullBoxRecordListAll.concat(res.result)
					}

					if (callback) {
						callback()
					}

					this.updateList = true
					this.getShowList()

					if (this.pageNum >= 5) {
						this.loadStatus = 'no-more'
					} else {
						this.loadStatus = 'more'
					}

					this.showLoadMore = false
				})

			},
			//处理日期字符串
			StrToDate(datestr) {
				return this.$dayjs(datestr).format("YYYY-MM-DD HH:mm:ss")
			},
			//下拉刷新
			onRefresh() {
				console.log("下拉刷新啦");

				this.pageNum = 1
				this.isShowBottomTip = false
				//导航条加载动画
				uni.showNavigationBarLoading()
				this.GetBoxDistributionDetail_InOutLockerBoxExtension(this.stopRefreshStatus)
			},
			//隐藏加载动画，停止下拉刷新
			stopRefreshStatus() {
				console.log('调用了回调函数')
				//wx.hideLoading()
				uni.hideNavigationBarLoading()
				//停止下拉刷新
				uni.stopPullDownRefresh()
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
				var endIndex = startIndex + this.$PageSize

				//顶部预留待浏览数据（解决快速滑动时出现白屏情况）
				var offset = 0
				if (startIndex < this.$PageSize) {
					offset = (startIndex + 1) * this.itemHeight
					startIndex = 0
				} else {
					offset = this.$PageSize * this.itemHeight
					startIndex -= this.$PageSize
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
				this.top = offset < 0 ? 0 : offset
			}
		}
	}
</script>

<style scoped>
	/deep/.uni-row {
		margin-left: 10rpx !important;
		margin-right: 10rpx !important;
	}
</style>

<style lang="scss">
	page {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);

		.content {
			padding: 10rpx;

			.list {
				.info {
					height: 200rpx;
					font-size: 26rpx;
					text-align: left;
					border: 2rpx solid black;
					border-radius: 20rpx;
					margin-bottom: 20rpx;

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

			.bottomTip {
				width: 100%;
				text-align: center;
				color: #95989e;
			}
		}
	}
</style>
