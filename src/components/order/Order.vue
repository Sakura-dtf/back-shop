<template>
    <div class="container">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
                        <el-button  slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <el-table border stripe :data="orderList">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status">
                    <template slot-scope="scope">
                        <el-tag type="danger" v-if="scope.row.pay_status==='0'">未付款</el-tag>
                        <el-tag type="success" v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="showBox">修改</el-button>
                        <el-button type="success" size="mini" icon="el-icon-location" @click="showProgressBox">物流</el-button>
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
                    :total="total">
            </el-pagination>
        </el-card>

        <el-dialog
                title="修改地址"
                :visible.sync="addressDialogVisible"
                width="50%"
                @close="addressDialogClose"
        >
            <el-form :model="addressForm" :rules="addressFormRules"
                     ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader :options="citydata" v-model="addressForm.address1">

                    </el-cascader>
                </el-form-item>
                <el-form-item label="详细位置" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressDialogVisible=false">取 消</el-button>
                 <el-button type="primary" @click="addressDialogVisible=false">确 定</el-button>
        </span>
        </el-dialog>
        <el-dialog
                title="物流进度"
                :visible.sync="propressDialogVisible"
                width="50%"
        >
            <el-timeline>
                <el-timeline-item
                        v-for="(activity, index) in propressInfo"
                        :key="index"
                        :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
    import citydata from "./citydata.js";
    export default {
        data(){
            return{
                propressInfo:[],
                propressDialogVisible:false,
                citydata,
                addressFormRules:{
                    address1:[
                        { required:true,message:"请选择省市/区",trigger:'blur' }
                    ],
                    address2:[
                        { required:true,message:"请填写详细地址",trigger:'blur' }
                    ]
                },
                addressForm:{
                    address1:[],
                    address2:''
                },
                addressDialogVisible:false,
                queryInfo:{
                    query:'',
                    pagenum:1,
                    pagesize:10,
                },
                total:0,
                orderList:[]
            }
        },
        created() {
            this.getOrderList();
        },
        methods:{
            async showProgressBox(){
                const {data:res} = await this.$http.get('/kuaidi/1106975712662');
                if(res.meta.status!==200){
                    this.$message.error('获取物流进度失败');
                }else {
                    this.propressInfo=res.data;
                    console.log(this.propressInfo);
                }
                this.propressDialogVisible=true
            },
            addressDialogClose(){
                this.$refs.addressFormRef.resetFields();
            },
            showBox(){
                this.addressDialogVisible=true;
            },
            handleSizeChange(newSize){
                this.queryInfo.pagesize=newSize;
                this.getOrderList();
            },
            handleCurrentChange(newPage){
              this.queryInfo.pagenum=newPage;
              this.getOrderList();
            },
            async getOrderList(){
                const {data:res} = await this.$http.get('orders',
                    {params:this.queryInfo});
                if(res.meta.status !==200){
                    return this.$message.error("获取列表失败");
                }else {
                    this.total=res.data.total;
                    this.orderList=res.data.goods
                }
            },
        }
    }
</script>

<style scoped lang="less">
    .el-cascader{
        width: 100%;
    }
    .container{
        padding: 20px;
    }
</style>