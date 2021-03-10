<template>
    <el-container class="home-container">
        <!--头部区域-->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="loginOut">退出</el-button>
        </el-header>
        <el-container>
                <!--侧边栏-->
            <el-aside :width="flag? '64px' : '200px' ">
                <div class="toggle-button" @click="toggle">|||</div>
                <!--侧边栏菜单区域-->
                <el-menu background-color="#333741"
                        text-color="#fff"
                        active-text-color="#409EFF"
                         :collapse="flag"
                         :collapse-transition="false"
                         :router="true"
                         :default-active="activePath"
                         unique-opened>
                    <!--一级菜单的模板-->
                    <el-submenu :index="item.id+''" v-for="item in menuList " :key="item.id">
                        <template slot="title">
                            <!--图标-->
                            <i :class="iconsObj[item.id]"></i>
                            <!--文本-->
                            <span>{{item.authName}}</span>
                        </template>
                        <!--二级菜单-->
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" @click="saveState('/'+subItem.path)">
                            <template slot="title">
                                <!--图标-->
                                <i class="el-icon-menu"></i>
                                <!--文本-->
                                <span>{{subItem.authName}}</span>
                            </template></el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
                <!--主页面-->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        data(){
            return{
                activePath:'',  //被激活的地址
                flag:false,
                menuList:[],
                iconsObj: {
                    125: "iconfont icon-user",
                    103: "iconfont icon-tijikongjian",
                    101: "iconfont icon-shangpin",
                    102: "iconfont icon-danju",
                    145: "iconfont icon-baobiao"
                }
            }
        },
        created(){
          this.getMenuList();
          this.activePath= window.sessionStorage.getItem('activePath');
          },
        methods:{
            saveState(activePath){
                window.sessionStorage.setItem('activePath',activePath);
                this.activePath=activePath;
            }, /*保存链接的激活状态*/
            loginOut(){
                window.sessionStorage.clear();
                this.$router.push('/login');
            },
            //获取所有的菜单
            async getMenuList(){
                const {data : res} = await  this.$http.get('menus');
                if(res.meta.status !== 200){
                    return this.$message.error(res.meta.msg);
                }else {
                    this.menuList=res.data;
                    console.log(this.menuList);
                }
            },
            toggle(){
                this.flag=!this.flag;
            }
        }
    }
</script>

<style scoped lang="less">
    .home-container{
        height: 100%;
    }
    .el-header{
        padding-left: 0;
        align-items: center;
        background-color: #373d41;
        display: flex;
        justify-content: space-between;
        color: #fff;
        font-size: 20px;
        >div{
            display: flex;
            align-items: center;
            span{
                margin-left: 15px;
            }
        }
    }
    .el-aside{
        background-color: #333744;
        .el-menu{
            border-right: none;
        }
    }
    .el-main{
        background-color: #eaedf1;
        padding: 0;
    }
    .iconfont{
        margin: 10px;
    }
    .toggle-button{
        background-color: #4A5064;
        font-size: 20px;
        line-height: 30px;
        color: #ffffff;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
</style>