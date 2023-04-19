<template>
	<view class="content">
		<uni-group v-for="(item, index) in functionList"
			v-show="(item.isShow && item.items.findIndex(r => r.isShow) > -1 ? true : false)" :title="item.moduleName"
			:index="index" :key="index" mode="card">
			<uni-grid :column="4" :highlight="true" :showBorder="false">
				<uni-grid-item v-for="(child, childIndex) in item.items" v-show="child.isShow" :index="childIndex"
					:key="childIndex">
					<view class="grid-item-box" style="background-color: #fff;" @click="childClick(child.pagePath)">
						<image :src="(child.iconPath == '' ? '../../static/defaultIcon.png' : child.iconPath)"
							class="image" mode="aspectFill" />
						<text class="text">{{child.name}}</text>
					</view>
				</uni-grid-item>
			</uni-grid>
		</uni-group>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				functionListTemplate: [{
						winformDisplayName: '基础信息模块', //winform中的模块名称（用于权限名称对比）
						moduleName: '基础信息维护', //小程序中重写的名称
						isShow: false,
						items: [{
								winformDisplayName: '线路信息',
								name: '线路维护',
								pagePath: '/pages/route/route',
								iconPath: '',
								isShow: false
							},
							{
								winformDisplayName: '车辆信息',
								name: '车辆维护',
								pagePath: '/pages/vehlicle/vehlicle',
								iconPath: '',
								isShow: false
							},
							{
								winformDisplayName: '票箱信息',
								name: '票箱维护',
								pagePath: '/pages/shell/shell',
								iconPath: '',
								isShow: false
							},
							{
								winformDisplayName: '内胆信息',
								name: '内胆维护',
								pagePath: '/pages/box/box',
								iconPath: '',
								isShow: false
							}
						]
					},
					{
						winformDisplayName: '自助收银管理',
						moduleName: '自助收银管理',
						isShow: false,
						items: [{
							winformDisplayName: '收银箱管理',
							name: '内胆柜状态',
							pagePath: '/pages/boxCabinetStatus/boxCabinetStatus',
							iconPath: '../../static/love.png',
							isShow: false
						}, {
							winformDisplayName: '钥匙柜管理',
							name: '钥匙柜状态',
							pagePath: '/pages/keyCabinetStatus/keyCabinetStatus',
							iconPath: '../../static/love.png',
							isShow: false
						}, {
							winformDisplayName: '内胆分布统计',
							name: '收满胆记录',
							pagePath: '/pages/takeFullBoxRecord/takeFullBoxRecord',
							iconPath: '../../static/love.png',
							isShow: false
						}]
					},
					{
						winformDisplayName: '点钞报表',
						moduleName: '点钞报表统计',
						isShow: false,
						items: [{
							winformDisplayName: '总金额汇总表',
							name: '总金额汇总表',
							pagePath: '',
							iconPath: '',
							isShow: false
						}]
					},
					{
						winformDisplayName: '其它',
						moduleName: '其它',
						isShow: false,
						items: [{
							winformDisplayName: '设备保修',
							name: '设备报修',
							pagePath: '',
							iconPath: '',
							isShow: false
						}]
					}
				],
				functionList: []
			}
		},
		onLoad() {
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#000000',
				animation: {
					duration: 3000,
					timingFunc: "easeOut"
				}
			})
		},
		onShow() {
			//隐藏左上角的Home按钮
			uni.hideHomeButton()

			this.loadFunction()
		},
		onPullDownRefresh() {
			this.onRefresh()
		},
		onReachBottom() {
			console.log("触底了")
		},
		methods: {
			//根据用户权限加载功能模块
			async loadFunction(callBack) {
				var userInfo = await this.getUserInfos()
				if (userInfo) {
					var permissions = userInfo.permissions; //程序所有权限
					var grantedPermissionNames = userInfo.grantedPermissionNames; //当前用户被授权的权限名称

					//根据用户授权的权限名称，查询对应的权限信息，用于后面的功能显隐
					var userGrantedPermission = []
					for (var i = 0; i < grantedPermissionNames.length; i++) {
						permissions.find(p => {
							if (p.name == grantedPermissionNames[i]) {
								userGrantedPermission.push(p);
							}
						})
					}

					//根据用户权限，对功能模块进行显隐
					for (var i = 0; i < this.functionListTemplate.length; i++) {
						//判断模块是否有权限
						var parentIsShow = false;
						if (userGrantedPermission.some(r => r.displayName == this.functionListTemplate[i]
								.winformDisplayName)) {
							parentIsShow = true;
						}
						this.functionListTemplate[i].isShow = parentIsShow;

						//模块有权限再判断子级
						if (parentIsShow) {
							for (var j = 0; j < this.functionListTemplate[i].items.length; j++) {
								var childIsShow = false;
								if (userGrantedPermission.some(r => r.displayName == this.functionListTemplate[i]
										.items[j]
										.winformDisplayName)) {
									childIsShow = true;
								}
								this.functionListTemplate[i].items[j].isShow = childIsShow;
							}
						}
					}
				}

				//重新给功能集合赋值
				this.functionList = this.functionListTemplate;

				//判断是否有回调函数
				if (callBack)
					callBack()
			},
			//根据登录信息获取用户信息（组织机构、权限等）
			async getUserInfos() {
				if (uni.getStorageSync('loginInfo')) {
					var res = await this.$Api.GetUserInfos({
						'Id': uni.getStorageSync('loginInfo').userId
					})

					if (res) {
						//处理用户组织机构
						var currentUserOrganizationUnits = []
						if (res.result.allOrganizationUnits && res.result.memberedOrganizationUnits) {
							for (var i = 0; i < res.result.memberedOrganizationUnits.length; i++) {
								res.result.allOrganizationUnits.some(r => {
									if (r.code == res.result.memberedOrganizationUnits[i]) {
										currentUserOrganizationUnits.push(r)
									}
								})
							}
						}
						res.result.currentUserOrganizationUnits = currentUserOrganizationUnits
						res.result.currentUserOrganizationUnitIds = currentUserOrganizationUnits.length > 0 ?
							currentUserOrganizationUnits.map((item) => item.id) : []

						//缓存用户信息（组织机构、权限等）
						uni.setStorageSync('userInfo', res.result)

						return res.result
					} else {
						// uni.showToast({
						// 	icon: 'error',
						// 	title: '获取权限失败'
						// })

						// //权限获取失败则跳回到登录界面
						// setTimeout(() => {
						// 	uni.redirectTo({
						// 		url: '/pages/login/login',
						// 	})
						// }, 1500)

					}
				}
			},
			//功能按钮点击跳转对应路径
			childClick(pagePath) {
				console.log("您要跳转到" + pagePath)
				uni.navigateTo({
					url: pagePath,
					fail: (res) => {
						uni.showToast({
							icon: 'error',
							title: '跳转页面失败',

						})
					}
				})
			},
			//下拉刷新
			onRefresh() {
				console.log("下拉刷新啦");
				//导航条加载动画
				uni.showNavigationBarLoading()
				this.loadFunction(this.stopRefreshStatus)
			},
			//隐藏加载动画，停止下拉刷新
			stopRefreshStatus() {
				console.log('调用了回调函数')
				//wx.hideLoading();
				uni.hideNavigationBarLoading();
				//停止下拉刷新
				uni.stopPullDownRefresh();
			}
		}
	}
</script>

<style scoped>
	/deep/.uni-group--card {
		box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.3);
	}

	/deep/.uni-group__title-text {
		font-weight: bold;
		color: black;
	}
</style>

<style lang="scss">
	page {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);

		.grid-item-box {
			flex: 1;
			// position: relative;
			/* #ifndef APP-NVUE */
			display: flex;
			/* #endif */
			flex-direction: column;
			align-items: center;
			justify-content: center;

			.image {
				width: 50rpx;
				height: 50rpx;
			}

			.text {
				width: 100%;
				color: #696969;
				font-size: 28rpx;
				margin-top: 10rpx;
				//不允许换行
				white-space: nowrap;
				//文字超出隐藏
				overflow: hidden;
				//超出部分...显示
				text-overflow: ellipsis;
				text-align: center;
			}
		}
	}
</style>
