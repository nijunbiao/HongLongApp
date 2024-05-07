<template>
	<view class="content">
		<uni-segmented-control :current="segmentedCurrent" :values="segmentedItems" styleType="text"
			activeColor="#003366" @clickItem="segmentedItemClick"></uni-segmented-control>
		<view class="info">{{pageParameter.StationName + '（' + pageParameter.TerminalName + '）'}}</view>
		<view class="uni-margin-wrap" v-show="segmentedCurrent == 0">
			<!--内胆柜信息-->
			<boxCabinet id="boxCabinet" :terminalId="pageParameter.Id"></boxCabinet>
		</view>
		<view class="uni-margin-wrap" v-show="segmentedCurrent == 1">
			<!--钥匙柜信息-->
			<keyCabinet id="keyCabinet" :terminalId="pageParameter.Id"></keyCabinet>
		</view>
	</view>
</template>

<script>
	import boxCabinet from '@/components/box-cabinet/box-cabinet.vue'
	import keyCabinet from '@/components/key-cabinet/key-cabinet.vue'
	export default {
		components: {
			boxCabinet,
			keyCabinet
		},
		data() {
			return {
				//上级页面的传参
				pageParameter: null,
				//分段器选项数组
				segmentedItems: ['内胆柜', '钥匙柜'],
				//分段器当前选中索引
				segmentedCurrent: 0,
				//内胆柜组件实列
				boxCabinetControl: null,
				//钥匙柜组件实列
				keyCabinetControl: null
			};
		},
		onLoad(query) {
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#003366'
			})

			this.pageParameter = query
			this.boxCabinetControl = this.selectComponent("#boxCabinet")
			this.boxCabinetControl.$vm.init()

			this.keyCabinetControl = this.selectComponent("#keyCabinet")
		},
		methods: {
			//分段器点击事件
			segmentedItemClick(e) {
				var that = this
				console.log(e)
				this.segmentedCurrent = e.currentIndex

				if (this.segmentedCurrent == 0) {
					uni.setNavigationBarTitle({
						title: '内胆柜信息'
					})

					that.boxCabinetControl.$vm.init()
				} else {
					uni.setNavigationBarTitle({
						title: '钥匙柜信息'
					})

					that.keyCabinetControl.$vm.init()
				}
			}
		}
	}
</script>

<style scoped>
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
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);

		.content {
			height: inherit;

			.info {
				height: 50rpx;
				font-size: 40rpx;
				font-weight: bold;
				text-align: center;
				padding-top: 20rpx
			}

			.uni-margin-wrap {
				//36px为分段器高度
				//70rpx为场站 + 主控机名称高度
				height: calc(100% - 36px - 70rpx);

				box-cabinet {
					height: 100%;
				}

				key-cabinet {
					height: 100%;
				}
			}
		}
	}
</style>
