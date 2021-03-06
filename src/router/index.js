import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";
import Welcome from "../components/Welcome.vue";
import Users from "../components/user/Users.vue";
import Rights from "../components/power/Rights.vue";
import Roles from "../components/power/Roles.vue";
import Cate from "../components/goods/Cate.vue";
import Params from "../components/goods/Params.vue";
import List from "../components/goods/List.vue";
import Add from "../components/goods/Add.vue";
import Order from "../components/order/Order.vue";
import Report from "../components/report/Report.vue";

Vue.use(VueRouter);

const routes = [
  {path: "/login",component:Login},
  {path: "/", redirect:'/login'},
  {
    path: '/home',
    component:Home,
    redirect:'/welcome',
    children:[
        {path: '/welcome',component:Welcome},
        {path: '/users',component: Users},
        {path: '/rights',component:Rights},
        {path: '/roles',component:Roles},
        {path: '/categories',component:Cate},
        {path: '/params',component:Params},
        {path: '/goods',component:List},
        {path: '/goods/add',component:Add},
        {path: '/orders',component:Order},
        {path: '/reports',component:Report}
        ]
  }
];

const router = new VueRouter({
  routes
});
//挂载路由导航守卫
router.beforeEach((to,from,next) =>{
    //to 表示将要访问路径
    //from 表示哪个路径跳转而来
    //next 是一个函数，表示放行
  if(to.path === '/login'){
    return next();
  }
  const tokenStr=window.sessionStorage.getItem('token');
  if(!tokenStr){
    return next('/login');
  }else {
    next();
  }
})

export default router
