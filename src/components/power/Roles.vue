<template>
    <div class="container">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card>
            <el-row>
                <el-col>
                    <!--添加角色列表-->
                    <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
                </el-col>
            </el-row>
            <el-table :data="rolesList" border stripe>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['dbbottom',i1===0 ? 'dbtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                            <!--渲染一级权限-->
                            <el-col :span="5">
                                <el-tag closable @close="removeRoleById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!--渲染二级和三级权限-->
                            <el-col :span="19">
                                <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2===0?'':'dbtop','vcenter']">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRoleById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag closable @close="removeRoleById(scope.row,item3.id)" type="warning" v-for="(item3,i3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>   <!--展开列-->
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column label="角色名称" prop="roleName">
                </el-table-column>
                <el-table-column label="角色描述" prop="roleDesc">
                </el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)" >编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="reMoveById(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <el-dialog
                title="添加用户"
                :visible.sync="addDialogVisible"
                width="50%"
                @close="addDialogClose">
            <!--内容主体-->
            <el-form :model="addForm" :rules="rules" ref="ruleForm" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!--底部按钮区-->
            <span slot="footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog
                title="修改用户"
                :visible.sync="editDialogVisible"
                width="50%"
                @close="editDialogClosed"
        >
            <!--内容主体-->
            <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
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
            <el-tree :data="rightsList" :props="treeProps"
             show-checkbox node-key="id"
             default-expand-all
                     ref="treeRef"
             :default-checked-keys="defKeys"
                ></el-tree>
            <!--底部按钮区-->
            <span slot="footer">
            <el-button @click="">取 消</el-button>
            <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                //所有角色列表数据
                roleId:'',//即将分配权限的ID
                setRightDialogVisible:false,
                editDialogVisible:false,
                addDialogVisible:false,
                rolesList:[],
                editForm:{

                },
                defKeys:[],
                treeProps:{
                    children:'children',
                    label:'authName'
                },
                rightsList:[],
                addForm: {
                    roleName:'',
                    roleDesc:''
                },
                rules: {
                    roleName: [
                        {required: true, message: '请输入角色名称', trigger: 'blur'},
                    ],
                },
                editRules:{
                    roleName: [
                        {required: true, message: '请输入角色名称', trigger: 'blur'},
                    ],
                }
            }
        },
        created() {
            this.getRolesList();
        },
        methods:{
            async allotRights(){
                //点击给角色分配权限
                const keys=[
                    ...this.$refs.treeRef.
                    getCheckedKeys(),
                    ...this.$refs.treeRef.
                    getHalfCheckedKeys()
                ];
                const idStr=keys.join(',');
                const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
                if(res.meta.status!==200){
                    return this.$message.error("分配权限失败")
                }else {
                    this.$message.success("分配权限成功");
                    this.getRolesList();
                    this.setRightDialogVisible=false;
                }
            },
            setRightsDialogClosed(){
               //监听分配权限的关闭功能

                this.defKeys=[];
            },
            getLeafKeys(node,arr){
                //通过递归的形式获取角色下三级权限的id并保存在数组defKeys中
                if(!node.children){
                    return arr.push(node.id);
                    //如果node节点不包含children属性，则将id保存在数组中
                }else {
                    node.children.forEach(item=>{
                        this.getLeafKeys(item,arr);
                    })
                }
            },
            async showSetRightDialog(role){
                //展示分配权限的对话框
                //获取所有的权限数据
                this.roleId=role.id;
                const {data:res} = await this.$http.get('rights/tree');
                if(res.meta.status !==200){
                    return this.$message.error("获取权限失败");
                }else {
                    this.rightsList=res.data;
                }
                //获取三级节点的id
                this.getLeafKeys(role,this.defKeys);
                this.setRightDialogVisible=true;
            },
            async removeRoleById(role,rightId){
                //根据ID删除队友的权限
                //弹框提示是否继续删除
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
                    return this.$message.info("取消删除权限");
                }else {
                    //确认了
                    const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                    console.log(res);
                    if(res.meta.status!==200){
                        return this.$message.error("删除权限失败");
                    }else {
                        this.$message.success("删除权限成功");
                        role.children=res.data;

                    }
                }
            },
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
                    const {data:res} = await this.$http.delete('roles/'+id)
                    if(res.meta.status!==200){
                        return this.$message.err("删除用户失败");
                    }else {
                        this.$message.success("删除用户成功");
                        this.editDialogVisible=false;
                        this.getRolesList();
                    }
                }
            },
            async showEditDialog(id){
                const {data:res} = await this.$http.get('roles/'+id);
                if(res.meta.status!==200){
                    return this.$message.error('查询用户失信息败')
                }else {
                    this.editForm=res.data;
                    console.log(this.editForm);
                    this.editDialogVisible = true;
                }
            },
            editUserInfo(){
                this.$refs.editFormRef.validate(async valid=>{
                    if(!valid){
                        return
                    }else{
                        console.log(this.editForm.roleId);
                        const {data:res} = await this.$http.put('roles/'+this.editForm.roleId,{
                            roleName:this.editForm.roleName,
                            roleDesc:this.editForm.roleDesc,
                        });
                        console.log(res);
                        if(res.meta.status!==200){
                            return this.$message.error("用户更新失败")
                        }else {
                            this.editDialogVisible=false;
                            this.getRolesList();
                            this.$message.success("更新用户成功");
                        }
                    }
                })
            },
            editDialogClosed(){
                this.$refs.editFormRef.resetFields();
            },
            addDialogClose(){
                this.$refs.ruleForm.resetFields();
            },//监听对话框的关闭功能
            addRole(){
                this.$refs.ruleForm.validate(async valid=>{
                    if(!valid){                      //预校验
                        return
                    }else{
                        const {data:res} = await this.$http.post('roles',this.addForm);
                        console.log(res);
                        if(res.meta.status!==201){
                            return this.$message.error("添加用户失败")
                        }else {
                            this.$message.success("添加用户成功");
                            this.addDialogVisible = false;
                            this.getRolesList();
                        }
                    }
                })
            }, //点击按钮预校验
            async getRolesList(){
                const {data:res} = await this.$http.get('roles')
                if(res.meta.status!==200) {
                    return this.$message.error("获取数据失败");
                }else {
                    this.rolesList=res.data;
                }
            }
        }
    }
</script>

<style scoped lang="less">
    .el-tag{
        margin:7px;
    }
    .dbtop{
        border-top: 1px solid #eeeeee;
    }
    .dbbottom{
        border-bottom: 1px solid #eeeeee;
    }
    .vcenter{
        display: flex;
        align-items: center;
    }
    .container{
        padding: 20px;
    }
</style>