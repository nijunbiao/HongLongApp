<template>
	<page-meta :page-style="'height:' + (registerProcess == '扫码' ? '100%' : 'inherit')"></page-meta>
	<view class="content">
		<uni-notice-bar show-icon scrollable speed="80" background-color="transparent"
			:color="registerProcess == '扫码' ? '#000000' : '#ffffff'" text="欢迎使用自助收银,正式开启按需收银新时代!" />
		<template v-if="registerProcess == '扫码'">
			<view class="scanCode">
				<text class="tip">请先扫描主控机上的注册二维码！</text>
				<button type="primary" @click="scanCode">扫码</button>
			</view>
		</template>
		<template v-else>
			<view class="staffInfo">
				<text class="staffCardNum">员工卡号：{{registerFormData.CardNum ? registerFormData.CardNum : '未知'}}</text>
				<uni-forms class="registerFrom" ref="registerForm" :rules="customRules" :modelValue="registerFormData"
					label-position="top">
					<uni-forms-item label="姓名" required name="Name">
						<uni-easyinput prefixIcon="staff-filled" maxlength="8" v-model="registerFormData.Name"
							placeholder="请输入姓名" />
					</uni-forms-item>
					<uni-forms-item label="工号" required name="Num">
						<uni-easyinput prefixIcon="wallet-filled" maxlength="10" v-model="registerFormData.Num"
							placeholder="请输入工号" @input="numInput" />
					</uni-forms-item>
					<uni-forms-item label="照片" required name="StaffPhoto">
						<uni-file-picker v-model="registerFormData.StaffPhoto" return-type="array" fileMediatype="image"
							file-extname="jpeg,jpg,png" limit="3" mode="grid" auto-upload="false" :maxB="photoMaxB"
							:minB="photoMinB" @select="selectPhoto" @delete="deletePhoto" />
					</uni-forms-item>
					<uni-forms-item label="手机号" required name="PhoneNum">
						<uni-easyinput disabled prefixIcon="phone-filled" v-model="registerFormData.PhoneNum"
							placeholder="请获取手机号" />
					</uni-forms-item>
				</uni-forms>

				<button open-type="getPhoneNumber" v-show="registerProcess == '获取手机号'"
					@getphonenumber="getPhoneNumber">获取手机号</button>
				<button type="primary" v-show="registerProcess == '注册'" @click="register">注册</button>

				<button class="cancel" @click="cancel">取消</button>
			</view>
		</template>
	</view>
</template>

<script>
	import {
		Throttle,
		GenerateGuid,
		DecryptByDES,
		Sleep,
		ProcessingQrCodeInfo,
		HexToDecStr
	} from '@/utils/tool.js'
	import {
		GetVisitorHLToken
	} from '@/common/common.js'
	export default {
		data() {
			return {
				photoMaxB: this.$Global.StaffRegister_ImageMaxB,
				photoMinB: this.$Global.StaffRegister_ImageMinB,
				//StaffPhotoArr: [],
				// 自定义表单数据
				registerFormData: {
					Name: '',
					Num: '',
					StaffPhoto: [],
					PhoneNum: '',
					CardNum: '',
					TenantId: '',
					CreateTime: ''
				},
				// 自定义表单校验规则
				customRules: {
					Name: {
						rules: [{
							required: true,
							errorMessage: '姓名不能为空'
						}]
					},
					Num: {
						rules: [{
							required: true,
							errorMessage: '工号不能为空'
						}]
					},
					StaffPhoto: {
						rules: [{
							required: true,
							errorMessage: '至少上传一张人脸照片'
						}]
					},
					PhoneNum: {
						rules: [{
							required: true,
							errorMessage: '手机号不能为空'
						}]
					}
				},
				//注册流程（'扫码'，'获取手机号'，'注册'）
				registerProcess: '获取手机号',
				//判读是否有入参scene（用来注册后的逻辑判断）
				haveScene: false
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

			//query.scene = 'TV8wXIrzgi0a+HGmGtJMXUTeT9T+04HM'
			this.load(query)
		},
		onShow() {
			uni.hideHomeButton()
		},
		methods: {
			//选择照片
			selectPhoto(e) {
				console.log(e)
			},
			//删除照片
			deletePhoto(e) {
				console.log(e)
				//this.StaffPhotoArr.splice(this.StaffPhotoArr.findIndex((p) => p.Url == e.tempFilePath), 1)
			},
			async getImageBase64_readFile(tempFilePath) {
				return new Promise(resolve => {
					//获取全局唯一的文件管理器 
					uni.getFileSystemManager().readFile({ //读取本地文件内容
						filePath: tempFilePath, // 文件路径
						encoding: 'base64', // 返回格式
						success: ({
							data
						}) => {
							return resolve(data)
						}
					})
				})
			},
			progress(e) {
				console.log(e)
			},
			success(e) {
				console.log(e)
			},
			async load(query) {
				if (query.scene) {
					uni.setStorageSync('ScanCodeEntry', 'true')
					this.haveScene = true
					var result = await GetVisitorHLToken()
					if (!result) {
						console.log('获取HLToken失败')
						return
					}

					this.parsingQrCode(query.scene)
				} else {
					this.registerProcess = '扫码'
				}
			},
			//获取用户的手机号
			async getPhoneNumber(e) {
				console.log(e.detail.code)

				if (e.detail.code) {
					var that = this

					//根据code换取用户的手机号
					var numberRes = await this.$WXApi.GetPhoneNumber({
						'code': e.detail.code
					})

					console.log(numberRes)
					if (numberRes.result) {
						if (numberRes.result.errcode == 0) {
							//获取到用户的手机号不含区号
							that.registerFormData.PhoneNum = numberRes.result.phone_info.purePhoneNumber

							that.registerProcess = '注册'
						} else {
							that.registerFormData.PhoneNum = ''
							uni.showToast({
								icon: 'none',
								title: '获取手机号失败'
							})
						}
					} else {
						console.log('获取手机号无结果')
					}
				}
			},
			//解析扫描出或传递过来的加密信息
			async parsingQrCode(scene) {
				var param = decodeURIComponent(scene)

				//DES解密
				param = DecryptByDES(param)
				console.log(param)
				//分割后会有三个item，第一个：员工卡号；第二个：租户Id；第三个：二维码生成时间用来判断是否失效
				var paramArray = param.split('|')
				if (paramArray && paramArray.length == 3) {
					//16进制转10进制（二维码创建时间）
					//当前时间戳单位为秒，所以需要再乘1000，转换成毫秒的时间戳
					this.registerFormData.CreateTime = parseInt(paramArray[2], 16) * 1000

					//判断当前二维码是否超过有效期
					var currentTime = Date.now()
					var qrCodeCreateTime = new Date(this.registerFormData.CreateTime)
					console.log(((currentTime - qrCodeCreateTime) / 1000 /
						60))
					if (((currentTime - qrCodeCreateTime) / 1000 /
							60) < this.$Global.StaffRegister_QrCodeExpireMinutes) {
						//16进制转10进制（员工卡卡号）
						var cardNum = HexToDecStr(paramArray[0])
						this.registerFormData.CardNum = cardNum
						console.log(this.registerFormData.CardNum)
						
						//拿到租户Id
						this.registerFormData.TenantId = paramArray[1]

						this.registerProcess = '获取手机号'
						return
					} else {
						uni.showToast({
							icon: 'none',
							title: '二维码已失效'
						})
					}
				} else {
					uni.showToast({
						icon: 'none',
						title: '请扫描正确的二维码'
					})
				}
			},
			//扫描二维码
			scanCode() {
				var that = this

				uni.scanCode({
					onlyFromCamera: true,
					success(res) {
						console.log(res)
						var val = ProcessingQrCodeInfo(res, that.$mp.page.route)
						that.parsingQrCode(val)
					},
					fail(res) {
						console.log(res)
						uni.showToast({
							icon: 'none',
							title: '未扫描二维码'
						})
					}
				})
			},
			//工号校验，不允许输入中文
			numInput() {
				let num = this.registerFormData.Num
				console.log(num)
				if (!num || num == " ") {
					return
				}

				const reg = /[\u4e00-\u9fa5]/ig
				if (reg.test(num)) {
					this.$nextTick(function() {
						this.registerFormData.Num = num.replace(reg, '')
					})
				}
			},
			//注册（节流处理，避免用户重复点击）
			register: Throttle(function() {
				var that = this

				that.$refs.registerForm.validate().then(res => {
					uni.showModal({
						title: '注册信息',
						content: '姓名:' + that.registerFormData.Name + '\n' +
							'工号:' + that.registerFormData.Num,
						cancelColor: '#003366',
						confirmColor: '#003366',
						success(res) {
							if (res.confirm) {
								//员工的GUID
								var staffGuid = GenerateGuid()
								//员工上传的照片信息，最多三张
								var BaseStaffImages = []

								//处理上传图片参数
								for (var i = 0; i < that.registerFormData.StaffPhoto.length; i++) {
									console.log(that.registerFormData.StaffPhoto[i].path)

									var path = that.registerFormData.StaffPhoto[i].path
									that.getImageBase64_readFile(path).then((res) => {
										BaseStaffImages.push({
											'StaffGuid': staffGuid,
											'ImageGuid': GenerateGuid(),
											'ImageName': that.registerFormData.Num
												.padStart(8,
													'0') + '_00' + (BaseStaffImages
													.length + 1) + path
												.substring(path.indexOf('.')),
											'Bytes': res
										})

										//最后一个完成后去注册
										if (that.registerFormData.StaffPhoto.length ==
											BaseStaffImages.length) {
											var data = {
												'BaseStaff': {
													'StaffGuid': staffGuid,
													'StaffName': that.registerFormData
														.Name,
													'StaffRole': '驾驶员',
													'StaffNum': that.registerFormData
														.Num,
													'StaffCardID': that
														.registerFormData.CardNum,
													'PhoneNum': that.registerFormData
														.PhoneNum,
													'ExamineState': '待审核',
													'DataSource': '小程序注册',
													'TenantId': that.registerFormData
														.TenantId,
													'BaseStaffImages': BaseStaffImages
												}
											}

											that.$Api.Staff_CreateOrUpdate(JSON.stringify(data))
												.then((res) => {
													console.log(res)
													if (res && res.success == true) {
														uni.showToast({
															icon: 'success',
															title: '注册成功'
														})

														//停留3000毫秒（不停留会直接退出小程序或返回上一级，用户看不到提示信息）
														Sleep(3000)
														if (that.haveScene) {
															//退出小程序
															uni.exitMiniProgram()
														} else {
															//返回到首页
															uni.navigateBack()
														}
													}
												})
										}
									})
								}
							} else if (res.cancel) {
								console.log('已取消注册')
							}
						}
					})
				}).catch(err => {
					console.log('err', err)
				})
			}, 1000),
			cancel: Throttle(function() {
				if (this.haveScene) {
					uni.redirectTo({
						url: '/pages/index/index'
					})
				} else {
					uni.navigateBack()
				}
			})
		},
	}
</script>

<style scoped>
	/deep/.uni-noticebar {
		position: absolute;
		top: 0rpx;
		left: 0rpx;
	}
</style>

<style lang="scss">
	page {
		display: flex;

		.content {
			width: inherit;
			height: inherit;
			display: flex;
			align-items: center;
			justify-content: center;
			background: linear-gradient(0deg, #00ccff, #003366);

			.scanCode {
				width: inherit;
				height: inherit;
				display: flex;
				flex-direction: column;
				text-align: center;
				justify-content: center;
				background-color: #FFF;

				.tip {
					color: #aa0000;
					font-size: 40rpx;
					font-weight: bold;
					margin: 50rpx auto;
				}

				button {
					width: 90%;
					height: 120rpx;
					font-size: 50rpx;
					display: flex;
					flex-direction: column;
					text-align: center;
					justify-content: center;
					color: white;
					border-radius: 60rpx;
					background: linear-gradient(-5deg, #00ccff, #003366);
				}
			}

			.staffInfo {
				width: 80%;
				padding: 40rpx;
				margin: 100rpx 0rpx 50rpx;
				text-align: center;
				background-color: #FFF;
				border-radius: 30rpx;
				box-shadow: 0 0 30rpx black;

				button {
					width: 70%;
					display: inline-block;
					color: white;
					border-radius: 60rpx;
					background: linear-gradient(-5deg, #00ccff, #003366);
				}

				.staffCardNum {
					color: #606266;
					font-size: 40rpx;
				}

				.cancel {
					width: 30%;
					background: #FFF;
					color: #606266;
				}

				.cancel::after {
					border: none;
				}
			}
		}
	}
</style>
