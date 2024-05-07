<template>
	<view class="content">
		<!-- <button @click="getBoxCabinetStatus">刷新</button> -->
		<template v-for="(item, index) in terminalList" :index="index">
			<view class="boxCabinet" v-if="isShow">
				<text class="title">{{'[' + item.terminalCode + ']' + '1号柜'}}</text>
				<template v-if="item.keyLockerList && item.keyLockerList.length > 0">
					<template v-for="(count, countIndex) in 16">
						<view
							v-for="(key, keyIndex) in item.keyLockerList.filter((b) => b.keyLockerNo == caclKeyLockerNo(countIndex))"
							:key="key" :index="keyIndex" class="box"
							:style="{'background-color':key.page_BackgroundColor}">
							<!-- 格子编号 -->
							<view class="boxLockerNo">
								{{key.keyLockerNo > 9 ? key.keyLockerNo : '0' + key.keyLockerNo}}
							</view>
							<!-- 格子状态 -->
							<view class="boxStatus">{{key.page_KeyStatus}}</view>
							<!-- 内胆自编号 -->
							<view class="boxCode">{{key.keySerial}}</view>
						</view>
					</template>
				</template>
			</view>
		</template>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isShow: false,
				terminalList: [],
				keyLockerList: []
			};
		},
		onLoad() {
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#003366'
			})

			this.getKeyCabinetStatus()
		},
		onShow() {

		},
		onReady() {

		},
		onUnload() {},
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
			//获取钥匙柜状态
			async getKeyCabinetStatus() {
				this.isShow = false
				var data = {}
				var userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					data.OrganizationUnitIds = userInfo.currentUserOrganizationUnitIds
				}

				//获取主控柜信息
				var terminalListRes = await this.$Api.GetControlTerminalListWithCabinet(data)
				if (terminalListRes.result && terminalListRes.result.items.length > 0) {
					this.terminalList = terminalListRes.result.items

					//获取钥匙格子信息
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
							terminal.keyLockerList = this.keyLockerList.filter((key) => key
								.keyCabinetNo == 1 && key.terminalGuid ==
								terminal.terminalGuid)

							//处理内胆格子信息，方便前台使用
							if (terminal.keyLockerList.length > 0) {
								terminal.keyLockerList.forEach((key) => {
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
							} else {
								for (var i = 1; i <= this.$Global.LockerNum; i++) {
									terminal.keyLockerList.push({
										'page_BackgroundColor': '#B9D1EA',
										'keyLockerNo': i,
										'page_KeyStatus': '未知',
										'keySerial': ''
									})
								}
							}
						})
					}
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
				
				this.isShow = true
			}
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);

		.boxCabinet {
			width: 714rpx;
			margin: 30rpx auto 30rpx;
			text-align: center;
			display: table;
			margin-bottom: 50rpx;
			border: 1px solid #cccccc;
			box-shadow: 20rpx 20rpx 30rpx #cccccc;

			.title {
				font-weight: bolder;
				display: block;
			}

			.box {
				width: 171rpx;
				height: 80rpx;
				color: white;
				float: left;
				background-color: aqua;
				margin: 5rpx;
				border-radius: 20rpx;

				view {
					float: left;
					display: inline-block;
				}

				.boxLockerNo {
					font-size: 40rpx;
					width: 50rpx;
					line-height: 80rpx;
				}

				.boxStatus,
				.boxCode {
					width: 121rpx;
					line-height: 40rpx;
				}

				.boxStatus {
					font-size: 30rpx;
				}

				.boxCode {
					font-size: 20rpx;
				}
			}
		}
	}
</style>
