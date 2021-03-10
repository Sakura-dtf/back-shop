<template>
    <div class="container">
        <!--面包屑导航区域-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDiolog">添加分类</el-button>
                </el-col>
            </el-row>
            <!--表格区域-->
            <tree-table :data="cateList"
            class="tree"
            :columns="columns"
            :selection-type="false"
            :expand-type="false"
            :show-index="true"
            index-text="#"
            border
            :show-row-hover="false">
            <template slot="isOk" slot-scope="scope">
                <i class="el-icon-circle-check" v-if="scope.row.cat_deleted===false"
                style="color:lightgreen"></i>
                <i class="el-icon-circle-close" style="color:lightgreen" v-else></i>
            </template>
            <template slot="sort"
            slot-scope="scope">
                <el-tag type="primary" size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
                <el-tag type="danger" size="mini" v-else>三级</el-tag>
            </template>
                <template slot="opt"
                          slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="reSave(scope.row)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="reMoveById(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>
            <!--分页区-->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[3, 5, 10, 15]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <!--添加分类对话框-->
        <el-dialog
                title="添加分类"
                :visible.sync="addDialogVisible"
                width="50%"
                @close="addCateDialogVisible"
        >
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级名称：">
                    <div class="block">
                        <!--options指定数据源-->
                        <el-cascader
                                clearable
                                v-model="selectedKeys"
                                :options="parentCateList"
                                :props="cateProps"
                                @change="parentCateChange"></el-cascader>
                    </div>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible=false">取 消</el-button>
                 <el-button type="primary" @click="addCate">确 定</el-button>
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
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <!--底部按钮区-->
            <span slot="footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                id:0,
                editRules:{
                    cat_name:[
                        {required: true, message: '请输入分类名称', trigger: 'blur'},
                    ]
                },
                editForm:{
                    cat_name:''
                },
                editDialogVisible:false,
                selectedKeys:[],//选中的分类的ID数组
                cateProps:{
                    //配置对象
                    expandTrigger: 'hover',
                    /*multiple:true,*/
                    value: 'cat_id',
                    label: 'cat_name',
                    children:'children'
                },
                addCateForm:{
                  //将要添加的名称
                    cat_pid:0,
                    cat_name:'',
                    //父级分类的ID 如果父级为一级则为0
                    cat_level:0, //默认等级为一级分类
                },
                addCateFormRules:{
                    cat_name:[
                        { required: true,message: "请输入分类名称", trigger: 'blur' }
                    ]
                },
                addDialogVisible:false,
                columns: [
                    {
                    //为tabel指定列的对象
                    label: '分类名称',
                    prop: 'cat_name'
                    },
                    {
                    //是否有效   模板列
                        label:'是否有效',
                        type:'template',
                        template:'isOk'
                    },
                    {
                        //是否有效   模板列
                        label:'排序',
                        type:'template',
                        template:'sort'
                    },
                    {
                        //是否有效   模板列
                        label:'操作',
                        type:'template',
                        template:'opt'
                    }
                ],
                cateList: [],
                //查询条件
                queryInfo:{
                    type:3,  //请求的级别
                    pagenum:1, //请求页码
                    pagesize:5
                },
                total:0,   //总数
                parentCateList:[]
            }
        },
        created(){
            this.getCateList();
        },
        methods: {
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
                    this.$message.info("取消删除分类")
                }else {
                    //确认了
                    const {data:res} = await this.$http.delete('categories/'+id);
                    if(res.meta.status!==200){
                        return this.$message.err("删除分类失败");
                    }else {
                        this.$message.success("删除分类成功");
                        this.getCateList();
                        this.editDialogVisible=false;
                    }
                }
            },
            reSave(cate){
                console.log(cate);
                this.id=cate.cat_id;
                this.editDialogVisible=true;
                console.log(this.id);
            },
            editUserInfo(){
                this.$refs.editFormRef.validate(async valid=>{
                    if(!valid){
                        return
                    }else{
                        const {data:res} = await this.$http.put('categories/'+this.id,{
                            cat_name:this.editForm.cat_name,
                        });
                        if(res.meta.status!==200){
                            return this.$message.error("用户更新失败")
                        }else {
                            this.getCateList();
                            this.$message.success("更新用户成功");
                            this.editDialogVisible=false;

                        }
                    }
                })
            },
            editDialogClosed(){
                this.$refs.editFormRef.resetFields();
            },
            addCateDialogVisible(){
                //监听对话框的关闭事件，重置表单数据
                this.$refs.addCateFormRef.resetFields();
                this.selectedKeys=[];
                this.addCateForm.cat_level=0;
                this.addCateForm.cat_pid=0
            },
            addCate(){
                //点击按钮添加新的分类
                this.$refs.addCateFormRef.validate(async valid=>{
                    if(!valid){
                        return
                    }else {
                        const {data:res} = await this.$http.post('categories',this.addCateForm);
                        if(res.meta.status!==201){
                            return this.$message.error("添加分类失败")
                        }else {
                            this.$message.success("添加分类成功");
                            this.getCateList();
                            this.addDialogVisible=false;
                        }
                    }
                });
            },
            parentCateChange() {
                //如果selectKeys>1或者=0,就说明没有选择任意的父级分类
                if(this.selectedKeys.length > 0){
                    console.log(this.selectedKeys);
                    this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]

                    this.addCateForm.cat_level=2;
                    return
                }else {
                    this.addCateForm.cat_pid=0;
                    this.addCateForm.cat_level=0;
                }


            },
            async getParentCateList(){
                //获取父级分类的数据列表
                const {data:res} = await this.$http.get('categories',{params:{
                    type:2
                    }});
                if(res.meta.status!==200){
                    this.$message.error("获取父级分类数据失败！")
                }else {
                    this.parentCateList=res.data;
                }
            },
            showAddCateDiolog(){
                this.getParentCateList();
                //现获取列表，在展现出对话框
                this.addDialogVisible=true;
            },
            handleCurrentChange(newNum){
                //监听pagenum改变的事件
                this.queryInfo.pagenum=newNum;
                this.getCateList();
            },
            handleSizeChange(newSize){
                //监听pagesize改变的事件
                this.queryInfo.pagesize=newSize;
                this.getCateList();
            },
            async getCateList(){
                const {data:res} = await this.$http.get("categories",{params:this.queryInfo});
                if(res.meta.status!==200){
                    this.$message.error("获取商品列表失败")
                }else {
                    this.cateList=res.data.result;
                    this.total=res.data.total
                }
            }
        }
    }
</script>

<style scoped lang="less">
    .el-cascader{
        width: 100%
    }
    .tree{
        margin-top: 20px;
    }
    .container{
        padding: 20px;
    }
</style>