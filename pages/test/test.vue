<template>
	<view>		
		<view :style="{height: itemHeight * (listAll.length) + 'px', position: 'relative'}" scroll-y="true" @scroll="scrollEvent">
			
			<!--可视区域里所有数据的渲染区域-->
			<view :style="{position: 'absolute', top: top + 'px'}">
				
				<!--单条数据渲染区域-->
				<view class="item" v-for="(item,index) in showList" :key="index" >
					<image src="../../static/01.png" mode="aspectFill" style="height: 100px; width: 100px;"></image>
					{{item}}
				</view>
			</view>
		</view>		
	</view>
</template>

<script>
	export default {    
		data(){
			return{
				listAll: [],  //所有数据
				showList: [],  //可视区域显示的数据				
				itemHeight: 105, //每条数据所占高度
				showNum: 20,  //每次加载到可视区域的数量，itemHeight X showNum 要可视区域高度 ，否则页面滚动不了。
				top: 0, //偏移量
				scrollTop: 0,  //卷起的高度
				startIndex: 0,  //可视区域第一条数据的索引
				endIndex: 0,  //可视区域最后一条数据后面那条数据的的索引，因为后面要用slice(start,end)方法取需要的数据，但是slice规定end对应数据不包含在里面				
			}
		},
				
		onLoad() {
			this.getAllList()
			this.getShowList()
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop
			this.getShowList()	
		},
		methods:{
			//构造2万条数据
			getAllList(){
				for(let i=0;i<20000;i++){
					this.listAll.push(`我是第${i}号佳丽`)
				}				
			},
			
			//计算可视区域数据
			getShowList(){				
				this.startIndex = Math.floor(this.scrollTop/this.itemHeight);   //可视区域第一条数据的索引
				this.endIndex = this.startIndex + this.showNum;   //可视区域最后一条数据的后面那条数据的索引
				this.showList = this.listAll.slice(this.startIndex, this.endIndex + 5)  //可视区域显示的数据，即最后要渲染的数据。实际的数据索引是从this.startIndex到this.endIndex-1
				this.top = this.scrollTop - (this.scrollTop % this.itemHeight);  //在这需要获得一个可以被itemHeight整除的数来作为item的偏移量，这样随机滑动时第一条数据都是完整显示的
			},
			
			//区域滚动事件
			scrollEvent(e){				
				this.scrollTop = e.detail.scrollTop
				this.getShowList()	
			}
			
			
		}
		
	}
</script>

<style scoped>	
	.item{
		height:105px;
		padding: 5px;
		color: #666;
		box-sizing: border-box;
		
	}
	.scroll-box{
		height: 300px; 
		width: 99%; 
		position: relative; 
		border: 1px solid red;
		margin-top: 100px;
	}
</style>

