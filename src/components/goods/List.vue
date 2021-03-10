<template>
    <div class="container">
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>
            </el-row>
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index" label="#">
                </el-table-column>
                <el-table-column label="商品名称" prop="goods_name">
                </el-table-column>
                <el-table-column label="商品价格（元）" width="95px" prop="goods_price">
                </el-table-column>
                <el-table-column label="商品重量" width="70px" prop="goods_weight">
                </el-table-column>
                <el-table-column label="创建时间" width="170px" prop="add_time">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.goods_id)">编辑</el-button>
                        <el-button type="warning" size="mini" icon="el-icon-delete" @click="removeById(scope.row.goods_id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                background>
        </el-pagination>
        </el-card>
        <el-dialog
                title="修改商品"
                :visible.sync="editDialogVisible"
                width="50%"
                @close="editDialogClosed"
        >
            <!--内容主体-->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="editForm.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格" prop="goods_price">
                    <el-input v-model="editForm.goods_price"></el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                    <el-input v-model="editForm.goods_number"></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model="editForm.goods_weight"></el-input>
                </el-form-item>
            </el-form>
            <!--底部按钮区-->
            <span slot="footer">
                <el-button @click="editDialogVisible=false">取 消</el-button>
                <el-button type="primary" @click="editGoods">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                goodsId:'',
                editForm:{
                    goods_name:'',
                    goods_price:'',
                    goods_number:'',
                    goods_weight:'',
                    goods_introduce:'',
                    pics:{},
                    attrs:[],
                },
                editFormRules:{
                    goods_name:[
                        { required:true ,message:"请输入商品名称",trigger:'blur'}
                    ],
                    goods_price:[
                        { required:true ,message:"请输入商品价格",trigger:'blur'}
                    ],
                    goods_number:[
                        { required:true ,message:"请输入商品数量",trigger:'blur'}
                    ],
                    goods_weight:[
                        { required:true ,message:"请输入商品重量",trigger:'blur'}
                    ]
                },
                editDialogVisible:false,
                queryInfo:{
                    query:'',
                    pagenum:1,
                    pagesize:10
                },
                goodsList:[],
                total:0,
            }
        },
        created() {
            this.getGoodsList();
        },
        methods:{
            editGoods(id){
                //点击按钮修改参数信息
                this.$refs.editFormRef.validate(async valid=>{
                    if(!valid){
                        return
                    }else {
                        const {data:res} = await this.$http.put(`goods/${this.goodsId}`,this.editForm);
                        console.log(res);
                        if(res.meta.status!==200){
                            return this.$message.error("修改参数失败");
                        }else {
                            this.$message.success("修改参数成功");
                            this.getGoodsList();
                            this.editDialogVisible=false;
                        }
                    }
                })
            },
            async showEditDialog(id){
                this.goodsId=id;

                const {data:res} = await this.$http.get(`goods/${id}`);
                console.log(res);
                if(res.meta.status!== 200){
                    return this.$message.error("获取商品数据失败");
                }else {
                    this.editForm=res.data;
                    this.editDialogVisible=true;
                }
            },
            editDialogClosed(){
                this.$refs.editFormRef.resetFields();
            },
            goAddpage(){
                this.$router.push('/goods/add')
            },
            async removeById(id){
                const confirmRes = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
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
                    const {data:res} = await this.$http.delete(`goods/${id}`);
                    if(res.meta.status!==200){
                        return this.$message.err("删除商品失败");
                    }else {
                        this.$message.success("删除商品成功");
                        this.getGoodsList();
                    }
                }
            },
            handleSizeChange(newSize){
                this.queryInfo.pagesize=newSize;
                this.getGoodsList();
            },
            handleCurrentChange(newnum){
                this.queryInfo.pagenum=newnum;
                this.getGoodsList();
            },
            async getGoodsList(){
                const {data:res} = await this.$http.get('goods',{
                    params:this.queryInfo
                });
                if(res.meta.status !== 200){
                    this.$message.error("获取商品列表失败!");
                }else {
                    this.$message.success("获取商品列表成功！");
                    this.goodsList=res.data.goods;
                    this.total=res.data.total;
                }
            }
        }
    }
</script>

<style scoped>
    .container{
        padding: 20px;
    }
</style>