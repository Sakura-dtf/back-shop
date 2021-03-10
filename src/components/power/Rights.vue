<template>
    <div class="container">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card>
            <el-table :data="rightsList" border stripe>
                <el-table-column type="index">
                </el-table-column>
                <el-table-column label="权限名称" prop="authName">
                </el-table-column>
                <el-table-column label="路径" prop="path">
                </el-table-column>
                <el-table-column label="权限等级" prop="level">
                    <template slot-scope="scope">
                        <el-tag type="primary" v-if="scope.row.level === '0'">一级权限</el-tag>
                        <el-tag type="success" v-else-if="scope.row.level === '1'">二级权限</el-tag>
                        <el-tag type="warning" v-else>三级权限</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>


</template>

<script>
    export default {
        data(){
            //验证邮箱规则
            var checkEmail=(rules,value,cb)=>{
                const regEmail=/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
                if(regEmail.test(value)){
                    return cb();
                }else {
                    cb(new Error("请输入合法的邮箱"));
                }
            };
            //验证手机号的规则
            var checkMobile=(rules,value,cb)=>{
                const regMobile=/^1[3456789]\d{9}$/;
                if(regMobile.test(value)){
                    return cb();
                }else {
                    cb(new Error("请输入合法的手机号码"));
                }
            };
            return{
                /*权限列表*/
                rightsList:[],
                email:[
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger:"blur"}
                ],
                mobile:[
                    { required: true, message: '请输入手机号码', trigger: 'blur' },
                    { validator: checkMobile, trigger:"blur"}
                ],
            }
        },
        created(){
          this.getRightsList();
        },
        methods:{
            async getRightsList(){
                const {data:res} = await this.$http.get('rights/list');
                if(res.meta.status!==200){
                    return this.$message.error("获取列表失败")
                }else {
                    this.rightsList=res.data;
                }
            }
        }
    }
</script>

<style scoped lang="less">
    .container{
        padding: 20px;
    }
</style>