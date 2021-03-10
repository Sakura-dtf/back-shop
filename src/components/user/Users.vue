<template>
    <div class="container">
        <!--面包屑导航区域-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图区域-->
        <el-card class="box-card">
            <!--搜索区域-->
            <el-row :gutter="25">
                <el-col :span="9">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" :clearable="true" @clear="getUsersList">
                        <el-button @click="getUsersList" slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
                </el-col>
            </el-row>

            <!--用户列表区域-->
            <el-table :data="userList" border stripe>
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column label="姓名" prop="username">
                </el-table-column>
                <el-table-column label="email" prop="email">
                </el-table-column>
                <el-table-column label="电话" prop="mobile">
                </el-table-column>
                <el-table-column label="角色" prop="role_name">
                </el-table-column>
                <el-table-column label="状态" prop="mg_state">
                    <template slot-scope="scope">   <!--作用域插槽-->
                        <el-switch
                                @change="userStateChange(scope.row)"
                                v-model="scope.row.mg_state"
                                active-color="#13ce66"
                                inactive-color="#ff4949">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">   <!--作用域插槽自定义操作-->
                        <!--修改，删除，分配角色-->
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="reMoveById(scope.row.id)"></el-button>
                        <el-tooltip :enterable="false" effect="dark" content="分配角色" placement="top">
                            <el-button size="mini" type="warning" icon="el-icon-setting" @click="setRole(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!--分页区-->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[1, 2, 5, 10]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <!--添加用户的对话框-->
        <el-dialog
                title="添加用户"
                :visible.sync="addDialogVisible"
                width="50%"
                @close="addDialogClose">
            <!--内容主体-->
            <el-form :model="addForm" :rules="rules" ref="ruleForm" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
                <!--底部按钮区-->
            <span slot="footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed"
            >
        <!--内容主体-->
        <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="70px">
            <el-form-item label="用户名">
                <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
                <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <!--底部按钮区-->
        <span slot="footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
    </el-dialog>
        <el-dialog
                title="分配权限"
                :visible.sync="setRightDialogVisible"
                width="50%"
                @close="setRightsDialogClosed"
        >
            <!--内容主体-->
            <div>
                <p>当前的用户：{{usermessage.username}}</p>
                <p>当前的角色：{{usermessage.role_name}}</p>
                <p>分配新角色：
                    <template>
                        <el-select v-model="selectedRoleId" placeholder="请选择">
                            <el-option
                                    v-for="item in rolesList"
                                    :key="item.id"
                                    :label="item.roleName"
                                    :value="item.id">
                            </el-option>
                        </el-select>
                    </template>
                </p>
            </div>
            <!--底部按钮区-->
            <span slot="footer">
                <el-button @click="">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确定</el-button>
            </span>
        </el-dialog>
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
                selectedRoleId:'', //已选中的角色
                rolesList:[],
                usermessage:{},
                setRightDialogVisible:false,
                editRules:{
                    email:[
                        { required: true, message: '请输入邮箱', trigger: 'blur' },
                        { validator: checkEmail, trigger:"blur"}
                    ],
                    mobile:[
                        { required: true, message: '请输入手机号码', trigger: 'blur' },
                        { validator: checkMobile, trigger:"blur"}
                    ],
                },
                editForm:{},
                editDialogVisible:false,
                //获取用户对象参数
                queryInfo:{
                    query: '',
                    pagenum:1,
                    pagesize:2
                },
                userList:[],
                total:0,
                addDialogVisible:false,
                addForm:{
                    username:'',
                    password:'',
                    email:'',
                    mobile:''
                },
                rules:{
                    username:[
                        { required: true, message: '请输入用户名', trigger: 'blur' },
                        { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                    ],
                    password:[
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                    ],
                    email:[
                        { required: true, message: '请输入邮箱', trigger: 'blur' },
                        { validator: checkEmail, trigger:"blur"}
                    ],
                    mobile:[
                        { required: true, message: '请输入手机号码', trigger: 'blur' },
                        { validator: checkMobile, trigger:"blur"}
                    ],
                }

            }
        },
        created() {
            this.getUsersList();
        },
        methods:{
            async saveRoleInfo(){
              //点击按钮分配角色
                if(!this.selectedRoleId){
                    this.$message.error("请选择要分配的角色");
                }else {
                    const {data:res} = await this.$http.put(`users/${this.usermessage.id}/role`,{rid:this.selectedRoleId});
                    console.log(res);
                    if(res.meta.status!==200){
                        return this.$message.error("更新用户失败");
                    }else {
                        this.$message.success("更新用户成功");
                        this.getUsersList();
                        this.setRightDialogVisible=false;
                    }
                }
            },
            async setRole(userInfo){
                //展示分配角色的对话框
                this.usermessage=userInfo;
                this.setRightDialogVisible=true;
                //在展现对话框之前获取列表
                const {data:res} = await this.$http.get('roles');
                if(res.meta.status!==200){
                    return this.$message.error("获取角色失败！")
                }else {
                    this.rolesList=res.data;
                }
            },
            setRightsDialogClosed(){
                //监听分配权限的关闭功能
                this.selectedRoleId = '';
                this.usermessage={};
            },
            //根据ID删除操作
            async reMoveById(id){
                //弹框提示
                const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err=>{
                    return err
                });
                //如果用户确认删除，则返回值为字符串 confirm
                //如果用户取消删除，则放回值为字符串 cancel
                if(confirmRes!=='confirm'){
                    //已经取消
                }else {
                    //确认了
                    const {data:res} = await this.$http.delete('users/'+id)
                    if(res.meta.status!==200){
                        return this.$message.error("删除用户失败");
                    }else {
                        this.$message.success("删除用户成功");
                        this.editDialogVisible=false;
                        this.getUsersList();
                    }
                }


            },
            //修改用户信息并提交
            editUserInfo(){
                this.$refs.editFormRef.validate(async valid=>{
                    if(!valid){
                        return
                    }else{
                        const {data:res} = await this.$http.put('users/'+this.editForm.id,{
                            email: this.editForm.email,
                            mobile:this.editForm.mobile
                        });
                        if(res.meta.status!==200){
                            return this.$message.error("用户更新失败")
                        }else {
                            this.editDialogVisible=false;
                            this.getUsersList();
                            this.$message.success("更新用户成功");
                        }
                    }
                })
            },
            //监听修改用户对话框的关闭事件
            editDialogClosed(){
                this.$refs.editFormRef.resetFields();
            },
            //展现修改的对话框
            async showEditDialog(id){
                const {data:res} = await this.$http.get('users/'+id);
                if(res.meta.status!==200){
                    return this.$message.error('查询用户失信息败')
                }else {
                    this.editForm=res.data;
                    this.editDialogVisible = true;
                }

            },
            addUser(){
                this.$refs.ruleForm.validate(async valid=>{
                    if(!valid){
                        return
                    }else{
                        const {data:res} = await this.$http.post('users',this.addForm);
                        console.log(res);
                        if(res.meta.status!==201){
                            return this.$message.error("添加用户失败")
                        }else {
                            this.$message.success("添加用户成功");
                            this.addDialogVisible = false;
                            this.getUsersList();
                        }
                    }
                })
            }, //点击按钮预校验
            addDialogClose(){
                this.$refs.ruleForm.resetFields();
            },//监听对话框的关闭功能
            async getUsersList(){
                const {data:res}=await this.$http.get('users',{params:this.queryInfo})
                if(res.meta.status !==200){
                    return this.$messages.error("获取用户列表失败");
                }else {
                    this.userList=res.data.users;
                    this.total=res.data.total
                }
            },
            /*监听pagesize的改变的事件*/
            handleSizeChange(newSize){
                this.queryInfo.pagesize=newSize;
                this.getUsersList();
            },
            /*监听页码值改变的事件*/
            handleCurrentChange(newPage){
                this.queryInfo.pagenum=newPage;
                this.getUsersList();
            },
            async userStateChange(userinfo){
                const {data:res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`);
                if(res.meta.status !== 200){
                    userinfo=!userinfo;
                    return this.$message.error("更新用户状态失败！")
                }else {
                    this.$message.success("更新用户状态成功");
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