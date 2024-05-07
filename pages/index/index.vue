<template>
	<view class="content">
		<template v-if="loading">
			<indexSkeleton></indexSkeleton>
		</template>
		<template v-else>
			<view class="userInfo">
				<text class="tenantName">{{ tenantName }}</text>
				<text class="exit" @click="exitMinProgram">退出</text>
			</view>
			<uni-group v-for="(item, index) in functionList"
				v-show="(item.isShow && item.items.findIndex(r => r.isShow) > -1 ? true : false)"
				:title="item.moduleName" :index="index" :key="index" mode="card">
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
		</template>
	</view>
</template>

<script>
	import {
		StopPullDownRefreshStatus,
		StrToDate
	} from '@/utils/tool.js'
	import indexSkeleton from '@/components/index-skeleton/index-skeleton.vue'
	export default {
		components: {
			indexSkeleton
		},
		data() {
			return {
				loading: true,
				//租户名称
				tenantName: '',
				//游客功能模块
				functionListTemplate_Visitor: [{
					moduleName: '辅助功能',
					isShow: true,
					items: [{
							name: '人员注册',
							pagePath: '/pages/register/register',
							iconPath: '../../static/register.png',
							isShow: true
						},
						{
							name: '人员认证',
							pagePath: '/pages/staffCertification/staffCertification',
							iconPath: '../../static/certification.png',
							isShow: true
						},
						{
							name: '设备报修',
							pagePath: '/pages/equipmentRepairRecord/equipmentRepairRecord',
							iconPath: '../../static/repairRecord.png',
							isShow: true
						},
						{
							name: '测试页面',
							pagePath: '/pages/test/test',
							iconPath: '../../static/love.png',
							isShow: true
						}
					]
				}, {
					moduleName: '自助服务',
					isShow: true,
					items: [{
						name: '自助交账',
						pagePath: '/pages/selfServicePayment/selfServicePayment',
						iconPath: '../../static/selfServicePayment.png',
						isShow: false
					},
					{
						name: '自助交账',
						pagePath: '/pages/selfServicePayment_jinhua/selfServicePayment_jinhua',
						iconPath: '../../static/selfServicePayment.png',
						isShow: true
					}]
				}],
				functionListTemplate: [{
						winformDisplayName: '基础信息模块', //winform中的模块名称（用于权限名称对比）
						moduleName: '基础信息维护', //小程序中重写的名称
						isShow: false,
						items: [{
								winformDisplayName: '线路信息',
								name: '线路维护',
								pagePath: '/pages/route/route',
								iconPath: '../../static/route.png',
								isShow: false
							},
							{
								winformDisplayName: '车辆信息',
								name: '车辆维护',
								pagePath: '/pages/vehicle/vehicle',
								iconPath: '../../static/vehicle.png',
								isShow: false
							},
							{
								winformDisplayName: '内胆信息',
								name: '内胆维护',
								pagePath: '/pages/box/box',
								iconPath: '../../static/box.png',
								isShow: false
							},
							{
								winformDisplayName: '票箱信息',
								name: '票箱维护',
								pagePath: '/pages/shell/shell',
								iconPath: '../../static/shell.png',
								isShow: false
							}
						]
					},
					{
						winformDisplayName: '自助收银管理',
						moduleName: '自助收银管理',
						isShow: false,
						items: [{
								winformDisplayName: '收银箱管理(已弃用)',
								name: '内胆柜状态',
								pagePath: '/pages/boxCabinetStatus/boxCabinetStatus',
								iconPath: '../../static/boxCabinet.png',
								isShow: false
							}, {
								winformDisplayName: '钥匙柜管理(已弃用)',
								name: '钥匙柜状态',
								pagePath: '/pages/keyCabinetStatus/keyCabinetStatus',
								iconPath: '',
								isShow: false
							}, {
								winformDisplayName: '收银箱管理',
								name: '收银柜信息',
								pagePath: '/pages/cashCabinet/index',
								iconPath: '../../static/boxCabinet.png',
								isShow: false
							}, {
								winformDisplayName: '内胆分布统计',
								name: '收满胆记录',
								pagePath: '/pages/takeFullBoxRecord/takeFullBoxRecord',
								iconPath: '../../static/takeFullBoxRecord.png',
								isShow: false
							}, {
								winformDisplayName: '内胆分布统计',
								name: '还满胆记录',
								pagePath: '',
								iconPath: '../../static/export.png',
								isShow: false
							},
							// {
							// 	winformDisplayName: '内胆分布统计(测试)',
							// 	name: '测试页面',
							// 	pagePath: '/pages/cashCabinet/index',
							// 	iconPath: '../../static/love.png',
							// 	isShow: true
							// }
						]
					},
					{
						winformDisplayName: '点钞报表(暂时用不到，先不显示)',
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
						winformDisplayName: '自助收银管理',
						moduleName: '蓝牙控制模块',
						isShow: false,
						items: [{
							winformDisplayName: '收银箱管理',
							name: '蓝牙控制',
							pagePath: '/pages/bluetoothControl/index', //'/pages/bluetoothControl/communication/communication',//'/pages/bluetoothControl/index',
							iconPath: '../../static/bluetoothControl.png',
							isShow: false
						}]
					}
				],
				functionList: [],
				//是否为无账号登录
				isVisitor: false
			}
		},
		onLoad(query) {
			this.isVisitor = uni.getStorageSync('isIntrUser')
			console.log('打开了首页Index', this.isVisitor)

			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#003366',
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
			this.pullDownRefresh()
		},
		onReachBottom() {
			console.log("触底了")
		},
		methods: {
			exitMinProgram() {
				uni.showModal({
					title: '',
					content: '确定要退出吗？',
					cancelColor: '#003366',
					confirmColor: '#003366',
					success(res) {
						if (res.confirm) {
							uni.redirectTo({
								url: '/pages/login/login'
							})
						}
					}
				})
			},
			//根据用户权限加载功能模块
			async loadFunction(callBack) {
				if (this.isVisitor) {
					this.tenantName = '游客'
					console.log('当前为无账号登录模式')
				} else {
					this.loading = true
					var userInfo = await this.getUserInfos()
					if (userInfo) {
						this.tenantName = userInfo.tenantName

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
							var parentIsShow = false
							if (userGrantedPermission.some(r => r.displayName == this.functionListTemplate[i]
									.winformDisplayName)) {
								parentIsShow = true
							}
							this.functionListTemplate[i].isShow = parentIsShow;

							//模块有权限再判断子级
							if (parentIsShow) {
								console.log('模块显示' + this.functionListTemplate[i]
									.winformDisplayName)

								for (var j = 0; j < this.functionListTemplate[i].items.length; j++) {
									var childIsShow = false
									if (this.functionListTemplate[i].items[j].name == '还满胆记录') {
										if (userInfo.tenantId == 1013) {
											childIsShow = true
										}
									} else {
										if (userGrantedPermission.some(r => r.displayName == this.functionListTemplate[
													i]
												.items[j]
												.winformDisplayName)) {
											childIsShow = true
										}
									}

									console.log('子模块' + this.functionListTemplate[
											i]
										.items[j]
										.winformDisplayName + (childIsShow == true ? '显示' : '隐藏'))
									this.functionListTemplate[i].items[j].isShow = childIsShow
								}
							}
						}
					} else {
						uni.redirectTo({
							url: '/pages/login/login'
						})
					}
				}

				//重新给功能集合赋值
				this.functionList = this.isVisitor ? this.functionListTemplate_Visitor : this.functionListTemplate
				this.loading = false

				//判断是否有回调函数
				if (typeof(callBack) == 'function') {
					callBack()
				}
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

						this.$Global.TenantId = res.result.tenantId
						console.log('写入global类' + this.$Global.TenantId)

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
				if (pagePath) {
					uni.navigateTo({
						url: pagePath,
						fail: (res) => {
							uni.showToast({
								icon: 'error',
								title: '跳转页面失败',

							})
						}
					})
				} else {
					this.exportData()
				}
			},
			//下拉刷新
			pullDownRefresh() {
				console.log("下拉刷新啦");
				//导航条加载动画
				uni.showNavigationBarLoading()
				this.loadFunction(StopPullDownRefreshStatus)
			},
			// 导出
			exportData() {
				var that = this

				var organizationUnitIds = []
				var userInfo = uni.getStorageSync('userInfo')
				if (userInfo) {
					organizationUnitIds = userInfo.currentUserOrganizationUnitIds
				}

				var yesterday = (new Date).getTime() - 24 * 60 * 60 * 1000
				this.$Api.GetInLockerFullBox_ExportExcel_Temporary({
					'ActionTimeFrom': StrToDate(yesterday, 'YYYY-MM-DD') + ' 00:00:00',
					'ActionTimeTo': StrToDate(yesterday, 'YYYY-MM-DD') + ' 23:59:59',
					'TenantId': userInfo.tenantId,
					'OrganizationUnitIds': organizationUnitIds
				}).then((res) => {
					if (res && res.result == true) {
						uni.downloadFile({
							//下载
							url: that.$Global.ApiBaseUrl + '/ExcelTemplate/FullBoxRecord.xls',
							header: {
								'content-type': 'application/vnd.ms-excel'
							},
							success(res) {
								console.log(res)
								if (res.statusCode === 200) {
									let savePath = wx.env.USER_DATA_PATH + '/DriverFullBoxRecord_' + Date
										.now() + '.xls';
									uni.getFileSystemManager().saveFile({
										//下载成功后保存到本地
										tempFilePath: res.tempFilePath,
										filePath: savePath,
										success(res) {
											console.log(res);
											let savePath = res.savedFilePath;
											uni.openDocument({
												//打开
												filePath: savePath,
												showMenu: true,
												success(res) {
													console.log(res);
												},
												fail(err) {
													uni.showModal({
														title: '提示',
														content: "文件打开失败",
														showCancel: false, //是否显示取消按钮
														success: function(
															result) {}
													})
												}
											});
											// uni.showModal({
											// 	title: "昨日驾驶员还胆数据",
											// 	content: "是否打开?",
											// 	confirmColor: "#0bc183",
											// 	confirmText: "打开",
											// 	success(res) {
											// 		if (res.confirm) {
											// 			uni.openDocument({
											// 				//打开
											// 				filePath: savePath,
											// 				showMenu: true,
											// 				success(res) {
											// 					console.log(res);
											// 				},
											// 			});
											// 		} else if (res.cancel) {}
											// 	},
											// });
										},
										fail(err) {
											uni.showModal({
												title: '提示',
												content: "文件下载失败",
												showCancel: false, //是否显示取消按钮
												success: function(result) {}
											})
										},
									});
								} else {
									uni.showModal({
										title: '提示',
										content: "文件下载失败",
										showCancel: false, //是否显示取消按钮
										success: function(result) {}
									})
								}
							},
							fail(err) {
								uni.showModal({
									title: '提示',
									content: "文件下载失败",
									showCancel: false, //是否显示取消按钮
									success: function(result) {}
								})
							}
						});
					} else {
						uni.showModal({
							title: '提示',
							content: "数据写入失败",
							showCancel: false, //是否显示取消按钮
							success: function(result) {}
						})
					}
				})
			},
		}
	}
</script>

<style scoped>
	/deep/.uni-group--card {
		box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.3);
	}

	/deep/.uni-group__title {
		background: linear-gradient(-5deg, #00ccff, #003366);
	}

	/deep/.uni-group__title-text {
		font-weight: bold;
		color: white;
	}
</style>

<style lang="scss">
	page {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);

		.userInfo {
			position: sticky;
			top: 0rpx;
			z-index: 99;
			font-size: 35rpx;
			padding: 10px;
			color: #ffffff;
			background-color: #003366;

			.tenantName {
				font-weight: bolder;
			}

			.exit {
				float: right;
			}
		}

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