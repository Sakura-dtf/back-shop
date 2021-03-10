import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/globel.css'
import  'element-ui/lib/theme-chalk/index.css'
import './plugins/element.js'

import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
//导入富文本编辑器的样式

//导入nprogress  页面的加载条
//在request拦截器中显示进度条   Nprogress.start()
//在respond拦截器中隐藏进度条   Nprogress.done()


import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'


import axios from 'axios'
axios.defaults.baseURL = "https://shopback.dtfei.cn/api/private/v1/"
Vue.prototype.$http=axios;


Vue.filter('dateFormat',function (orgVal) {
  const dt = new Date(orgVal);
  const y = dt.getFullYear();
  const m = (dt.getMinutes() + 1 +'').padStart(2,'0');
  const d = (dt.getDate()+'').padStart(2,'0');
  const hh = (dt.getHours()+'').padStart(2,'0');
  const mm = (dt.getMinutes()+'').padStart(2,'0');
  const ss = (dt.getSeconds()+'').padStart(2,'0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
});

//过滤器
axios.interceptors.request.use(config=>{
  Nprogress.start();
  config.headers.Authorization = window.sessionStorage.getItem('token');
  /*必须return config*/
  return config;
});




axios.interceptors.response.use(config=>{
  Nprogress.done();
  /*必须return config*/
  return config;
});

Vue.component('tree-table',TreeTable);
Vue.config.productionTip = false;
Vue.use(VueQuillEditor);
//注册富文本编辑器

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
