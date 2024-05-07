<template>
	<view class="content">
		<view class="keyCabinet cabinet" v-for="(item, index) in terminalList" :index="index" :key="index">
			<text class="keyCabinetTitle title">{{'1号柜'}}</text>
			<template v-if="item.keyLockerList && item.keyLockerList.length > 0">
				<template v-for="(count, countIndex) in 16">
					<view
						v-for="(key, keyIndex) in item.keyLockerList.filter((b) => b.keyLockerNo == caclKeyLockerNo(countIndex))"
						:key="key" :index="keyIndex" class="keyBox box" :style="{'background-color':key.page_BackgroundColor, 
								 'margin-left': keyBoxMargin + 'rpx'}">
						<!-- 格子编号 -->
						<view class="keyLockerNo lockerNo">
							{{key.keyLockerNo > 9 ? key.keyLockerNo : '0' + key.keyLockerNo}}
						</view>
						<!-- 格子状态 -->
						<view class="keyStatus status">{{key.page_KeyStatus}}</view>
						<!-- 钥匙自编号 -->
						<view class="keyCode code">{{key.keySerial}}</view>
					</view>
				</template>
			</template>
		</view>
	</view>
</template>

<script>
	import {
		PxTorpx,
		RpxTopx
	} from '@/utils/tool.js'
	export default {
		name: "key-cabinet",
		props: {
			terminalId: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				keyBoxMargin: 0,
				//主控机-内胆柜信息
				terminalList: [],
				//主控机-钥匙柜信息
				keyLockerList: []
			}
		},
		computed: {
			//根据index获取对应的boxLockerNo值
			caclKeyLockerNo() {
				return function(index) {
					index += 1
					return (Math.ceil(index / 4) + (((index + 3) % 4) * 4))
				}
			}
		},
		methods: {
			//初始化加载数据
			init() {
				var that = this
				this.$nextTick(() => {
					that.getKeyCabinetStatus()
				})
				
				//计算每个钥匙格的左边距
				var windowWidth = uni.getSystemInfoSync().windowWidth
				var windowWidth_rpx = PxTorpx(windowWidth)
				var space = (windowWidth_rpx - 10 - PxTorpx(2) - (170 * 4) - 4) / 4
				this.keyBoxMargin = space < 0 ? 0 : space
			},
			//获取钥匙柜状态
			async getKeyCabinetStatus() {
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
						terminal.keyLockerList = []
						for (var i = 1; i <= this.$Global.LockerNum; i++) {
							terminal.keyLockerList.push({
								'page_BackgroundColor': '#B9D1EA',
								'keyLockerNo': i,
								'page_KeyStatus': '未知',
								'keySerial': ''
							})
						}
					})

					data.TenantId = userInfo.tenantId
					var keyLockerListRes = await this.$Api.GetKeyLockerList(data)
					if (keyLockerListRes && keyLockerListRes.result && keyLockerListRes.result.items.length > 0) {
						this.keyLockerList = keyLockerListRes.result.items

						//数据处理与整合
						var dateNow = Date.now()
						this.terminalList.forEach((terminal) => {
							//主控机下的16个钥匙格子
							terminal.keyLockerList = []

							//根据主机柜过滤出对应的16个格子
							var keyLockerList = this.keyLockerList.filter((key) => key
								.keyCabinetNo == 1 && key.terminalGuid ==
								terminal.terminalGuid)

							//处理内胆格子信息，方便前台使用
							if (keyLockerList.length > 0) {
								keyLockerList.forEach((key) => {
									if (!key.keySerial) {
										key.keySerial = ''
									}

									var actionTime = Date.parse(key.actionTime)
									key.page_IsTimeOut = ((dateNow - actionTime) / 1000 /
											60) >
										this.$Global.BoxLockerOffLineMinutes

									var page_KeyStatus = key.keyStatus
									var page_BackgroundColor = '#C0C0C0'
									if (key.page_IsTimeOut) {
										page_KeyStatus = '离线'
										page_BackgroundColor = '#C0C0C0'
									} else if (!key.workStatus.includes('正常') && !key
										.workStatus.includes('重启')) {
										page_KeyStatus = '故障'
										page_BackgroundColor = '#D2691E'
									} else if (key.doorStatus == '开门') {
										page_KeyStatus = '开门'
										page_BackgroundColor = '#DAA520'
									} else if (key.keyStatus == '无钥匙') {
										page_BackgroundColor = '#B22222'
									} else if (key.keyStatus == '有钥匙') {
										page_BackgroundColor = '#9ACD32'
									}
									key.page_KeyStatus = page_KeyStatus
									key.page_BackgroundColor = page_BackgroundColor
								})
								
								terminal.keyLockerList = keyLockerList
							}
						})
					}
				}
			}
		}
	}
</script>

<style lang="scss">
	.content {
		display: flex;
		align-items: center;
		padding: 0rpx 5rpx;

		.keyCabinet {
			width: 100%;
			height: 425rpx;
			// margin: auto;
			padding: 10rpx 0rpx;
		}

		.cabinet {
			text-align: center;
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

		.keyBox {
			width: 168rpx;
			margin: 8rpx 0rpx;

			.keyLockerNo {
				font-size: 40rpx;
				width: 48rpx;
			}

			.keyStatus,
			.keyCode {
				width: 119rpx;
			}

			.keyCode {
				font-size: 20rpx;
			}
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
</style>
