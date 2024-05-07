<script>
	export default {
		onLaunch: function() {
			wx.onAppRoute((route) => {
				console.log('路由监听', route)
				if (route.query.scene && (route.path.includes('equipmentRepairRecord') ||
						route.path.includes('register'))) {
					//此处不做跳转处理，避免扫码进入页面后又跳转回登录或首页
					console.log('扫码跳转进入')
				} else {
					if (uni.getStorageSync('loginInfo') && route.path.includes('login')) {
						console.log('跳转首页')
						uni.redirectTo({
							url: '/pages/index/index'
						})
					} else if(!uni.getStorageSync('loginInfo') && !route.path.includes('login')) {
						// console.log('跳转登录')
						uni.redirectTo({
							url: '/pages/login/login'
						})
					}
				}
				// if(uni.getStorageSync('loginInfo')){
				// 	console.log('跳转首页')
				// 	uni.redirectTo({
				// 		url: '/pages/index/index' + (uni.getStorageSync('isIntrUser') ? '?isVisitor=true' : '')
				// 	})
				// }else{
				// 	console.log('跳转登录')
				// 	uni.redirectTo({
				// 		url: '/pages/login/login'
				// 	})
				// }
			})
			//console.log('触发App——onLaunch')			
			// if(uni.getStorageSync('loginInfo')){
			// 	console.log('跳转首页')
			// 	uni.redirectTo({
			// 		url: '/pages/index/index' + (uni.getStorageSync('isIntrUser') ? '?isVisitor=true' : '')
			// 	})
			// }else{
			// 	console.log('跳转登录')
			// 	uni.redirectTo({
			// 		url: '/pages/login/login'
			// 	})
			// }
		},
		onShow: function() {
			//console.log('App Show')
		},
		onHide: function() {
			//console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
