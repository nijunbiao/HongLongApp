<template>
	<view>
		<!-- <view class="uni-margin-wrap">
			<uni-swiper-dot class="uni-swiper-dot-box" @clickItem="clickItem" :info="test" :current="current"
				mode="indexes" :dots-styles="dotsStyles" field="content">
				<swiper circular vertical class="swiper-box" @change="change" :current="swiperDotIndex">
					<swiper-item v-for="(item, index) in 13" :key="index">
						<view class="swiper-item" :class="'swiper-item' + index">
							<text style="color: #fff; font-size: 32px;">{{index+1}}</text>
						</view>
					</swiper-item>
				</swiper>
			</uni-swiper-dot> 
		</view> -->
		<!-- 		<button @click="popup">打开模态框</button>
		<view class="modal-mask" @click="hideModal" :animation="animationData"  catchtouchmove="preventTouchMove" v-show="showModal"></view>
		<view class="modal-dialog" :animation="animationData" v-show="showModal" >
			<uni-section title="基本用法" type="line" padding>
				<uni-steps :options="list1" :active="active" />
			</uni-section>
		</view> -->

		<uni-section title="本地数据" type="line" padding style="height: calc(100vh - 100px);">
			<uni-data-picker placeholder="请选择哈哈" popup-title="请选择对应场站" :localdata="dataTree" v-model="classes"
				@change="onchange" @nodeclick="onnodeclick" @popupopened="onpopupopened" @popupclosed="onpopupclosed">
			</uni-data-picker>
		</uni-section>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				classes: '1-2',
				dataTree: [{
						text: "一年级",
						value: "1-0",
						children: [{
								text: "1.1班",
								value: "1-1"
							},
							{
								text: "1.2班",
								value: "1-2"
							}
						]
					},
					{
						text: "二年级",
						value: "2-0",
						children: [{
								text: "2.1班",
								value: "2-1"
							},
							{
								text: "2.2班",
								value: "2-2"
							}
						]
					},
					{
						text: "三年级",
						value: "3-0",
						disable: true
					}
				],
				test: [{
					name: ''
				}, {
					name: ''
				}, {
					name: ''
				}],
				info: [{
						colorClass: 'uni-bg-red',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 A'
					},
					{
						colorClass: 'uni-bg-green',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 B'
					},
					{
						colorClass: 'uni-bg-blue',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 C'
					},
					{
						colorClass: 'uni-bg-blue',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 D'
					},
					{
						colorClass: 'uni-bg-blue',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 E'
					},
					{
						colorClass: 'uni-bg-blue',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 F'
					},
					{
						colorClass: 'uni-bg-blue',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 G'
					},
					{
						colorClass: 'uni-bg-blue',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 H'
					},
					{
						colorClass: 'uni-bg-blue',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 I'
					},
					{
						colorClass: 'uni-bg-blue',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 J'
					},
					{
						colorClass: 'uni-bg-blue',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 K'
					},
					{
						colorClass: 'uni-bg-blue',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 L'
					},
					{
						colorClass: 'uni-bg-blue',
						url: 'https://web-assets.dcloud.net.cn/unidoc/zh/shuijiao.jpg',
						content: '内容 M'
					}
				],
				dotStyle: [{
						backgroundColor: 'rgba(0, 0, 0, .3)',
						border: '1px rgba(0, 0, 0, .3) solid',
						color: '#fff',
						selectedBackgroundColor: 'rgba(0, 0, 0, .9)',
						selectedBorder: '1px rgba(0, 0, 0, .9) solid'
					},
					{
						backgroundColor: 'rgba(255, 90, 95,0.3)',
						border: '1px rgba(255, 90, 95,0.3) solid',
						color: '#fff',
						selectedBackgroundColor: 'rgba(255, 90, 95,0.9)',
						selectedBorder: '1px rgba(255, 90, 95,0.9) solid'
					},
					{
						backgroundColor: 'rgba(83, 200, 249,0.3)',
						border: '1px rgba(83, 200, 249,0.3) solid',
						color: '#fff',
						selectedBackgroundColor: 'rgba(83, 200, 249,0.9)',
						selectedBorder: '1px rgba(83, 200, 249,0.9) solid'
					}
				],
				modeIndex: -1,
				styleIndex: -1,
				current: 0,
				mode: 'default',
				dotsStyles: {},
				swiperDotIndex: 0,
				showModal: false,
				active: 1,
				list1: [{
					title: '事件一'
				}, {
					title: '事件二'
				}, {
					title: '事件三'
				}, {
					title: '事件四'
				}],
				animationData: {}
			}
		},
		onLoad() {},
		onShow() {},
		methods: {
			onnodeclick(e) {
				console.log(e);
			},
			onpopupopened(e) {
				console.log('popupopened');
			},
			onpopupclosed(e) {
				console.log('popupclosed');
			},
			onchange(e) {
				console.log('onchange:', e);
			},
			change(e) {
				this.current = e.detail.current
			},
			clickItem(e) {
				this.swiperDotIndex = e
			},
			popup(e) {
				this.showModal = true
				var animation = uni.createAnimation({
					duration: 3000,
					timingFunction: 'ease-in-out',
				})

				this.animation = animation

				animation.step()

				this.animationData = animation.export()

				setTimeout(function() {
					animation.step()
					this.animationData = animation.export()
				}.bind(this), 1000)
			},
			// 模态框隐藏

			hideModal() {
				this.showModal = false
			},
			//  阻止冒泡，谨慎删除
			stop() {

			},
			preventTouchMove() {},
		}
	}
</script>

<style scoped>
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

<style>
	.swiper-box {
		height: 1000rpx;
	}

	.swiper-item {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: #fff;
	}

	.swiper-item0 {
		background-color: #cee1fd;
	}

	.swiper-item1 {
		background-color: #b2cef7;
	}

	.swiper-item2 {
		background-color: #40fd86;
	}

	.swiper-item3 {
		background-color: #555500;
	}

	.swiper-item4 {
		background-color: #ffff7f;
	}

	.swiper-item5 {
		background-color: #5500ff;
	}

	.swiper-item6 {
		background-color: #550000;
	}

	.swiper-item7 {
		background-color: #00557f;
	}

	.swiper-item8 {
		background-color: #ffaaff;
	}

	.swiper-item9 {
		background-color: #aaaaff;
	}

	.swiper-item10 {
		background-color: #aaaa00;
	}

	.swiper-item11 {
		background-color: #00007f;
	}

	.swiper-item12 {
		background-color: #ff00ff;
	}

	.modal-mask {
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		background: #000;
		opacity: 0.5;
		overflow: hidden;
		z-index: 9000;
	}

	.modal-dialog {
		box-sizing: border-box;
		width: 85%;
		padding: 30rpx;
		overflow: hidden;
		position: fixed;
		top: 20%;
		left: 0;
		right: 0;
		margin: 0 auto;
		z-index: 9999;
		background: white;
		border-radius: 5rpx;

	}
</style>
