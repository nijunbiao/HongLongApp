import App from './App'
import Api from '@/common/api.js'
import dayjs from 'dayjs'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'

//全局变量
Vue.prototype.$Api = Api
Vue.prototype.$dayjs = dayjs//处理时间和日期的js库
Vue.prototype.$PageSize = 30//每页查询数据量
Vue.prototype.$BoxLockerOffLineMinutes = 10//收银箱离线时间阈值
Vue.prototype.$Monitor_AutoRefreshInterval = 15 * 1000//票箱监控自动刷新时间

try {
  function isPromise(obj) {
    return (
      !!obj &&
      (typeof obj === "object" || typeof obj === "function") &&
      typeof obj.then === "function"
    );
  }

  // 统一 vue2 API Promise 化返回格式与 vue3 保持一致
  uni.addInterceptor({
    returnValue(res) {
      if (!isPromise(res)) {
        return res;
      }
      return new Promise((resolve, reject) => {
        res.then((res) => {
          if (res[0]) {
            reject(res[0]);
          } else {
            resolve(res[1]);
          }
        });
      });
    },
  });
} catch (error) { }

const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif