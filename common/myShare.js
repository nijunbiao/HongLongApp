//全局点亮所有页面的 '分享给朋友' 和 '分享到朋友圈'
export default {
	data() {
		return {
			//设置默认的分享参数
			share: {
				title: '鸿隆自助收银小程序',
				path: '/pages/login/login',
				imageUrl: '',
				query: ''
			}
		}
	},
	//分享给朋友
	onShareAppMessage(res) {
		return {
			title: this.share.title,
			path: this.share.path,
			imageUrl: this.share.imageUrl,
			success(res) {
				console.log(res)
			},
			fail(res) {
				console.log(res)
			}
		}
	},
	//分享到朋友圈
	onShareTimeline(res) {
		return {
			title: this.share.title,
			query: this.share.query,
			imageUrl: this.share.imageUrl,
			success(res) {
				console.log(res)
			},
			fail(res) {
				console.log(res)
			}
		}
	}
}
