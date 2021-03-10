<template>
    <div class="container">
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-alert
                show-icon
                :closable='false'
                title="注意：只允许第三级分类设置相关参数"
                type="warning">
            </el-alert>

        <!--选择商品分类区-->
            <el-row class="cat_opt">
              <el-col>
                  <!--级联选择框-->
                  <div class="block">
                      <span class="demonstration">选择商品分类： </span>
                      <el-cascader
                              v-model="selectedOption"
                              :options="cateList"
                              :props="props"
                              @change="handleChange"></el-cascader>
                  </div>

              </el-col>
            </el-row>

            <!--tab页签区-->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
                    <!--表格-->
                    <el-table
                    :data="manyData"
                    border
                    stripe>
                        <el-table-column type="expand">
                            <!--展开列-->
                            <template slot-scope="scope">
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i"
                                        closable
                                        @close="handleClose(i,scope.row)">
                                    {{item}}
                                </el-tag>
                                <!--输入文本框-->
                                <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                            </template>
                        </el-table-column>
                        <el-table-column label="#" type="index">
                            <!--索引列-->
                        </el-table-column>
                        <el-table-column label="参数名称" prop="attr_name">
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
                    <el-table
                            :data="onlyData"
                            border
                            stripe>
                        <el-table-column type="expand">
                            <!--展开列-->
                            <template slot-scope="scope">
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i"
                                       closable
                                        @close="handleClose(i,scope.row)">
                                   {{item}}
                              </el-tag>
                                <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                            </template>
                        </el-table-column>
                        <el-table-column label="#" type="index">
                            <!--索引列-->

                        </el-table-column>
                        <el-table-column label="属性名称" prop="attr_name">
                        </el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <el-dialog
                :title="'添加'+ titleText"
                :visible.sync="addDialogVisible"
                width="50%"
                @close="addDialogClosed"
        >
            <!--内容主体-->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <!--底部按钮区-->
            <span slot="footer">
                <el-button @click="addDialogVisible=false">取 消</el-button>
                <el-button type="primary" @click="addParams">确定</el-button>
            </span>
        </el-dialog>
        <el-dialog
                :title="'修改'+titleText"
                :visible.sync="editDialogVisible"
                width="50%"
                @close="editDialogClosed"
        >
            <!--内容主体-->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <!--底部按钮区-->
            <span slot="footer">
                <el-button @click="editDialogVisible=false">取 消</el-button>
                <el-button type="primary" @click="editParams">确定</el-button>
            </span>
        </el-dialog>
    </div>

</template>

<script>
    export default {
        data(){
            return{
                editFormRules:{
                    attr_name:[
                        { required:true,message:"请输入参数名称",trigger:'blur' }
                    ]
                },
                editForm:{},
                editDialogVisible:false,
                addForm:{
                    attr_name:''
                },
                addFormRules:{
                  attr_name:[
                      { required:true,message:"请输入参数名称",trigger:'blur' }
                  ]
                },
                addDialogVisible:false,  //控制添加对话框的显示隐藏
                manyData:[],//动态参数
                onlyData:[], //静态属性
                activeName:'many',  //被激活的名称
                selectedOption:[],//级联选择框双向绑定的数组
                cateList:[],
                props:{
                    expandTrigger: 'hover',
                    value:"cat_id",
                    label:"cat_name",
                    children:"children"
                }
            }
        },
        created(){
            this.getCateList();
        },
        methods:{
            handleClose(i,row){
                //删除
                console.log(row.attr_vals);
                row.attr_vals.splice(i,1);
                this.saveData(row);
            },
            async saveData(row){
                const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
                    attr_name:row.attr_name,
                    attr_sel:row.attr_sel,
                    attr_vals:row.attr_vals.join(' '),
                });
                console.log(row.attr_vals);
                if(res.meta.status !== 200){
                    return this.$message.error("修改参数失败")
                }else {
                    return this.$message.success("修改参数成功");
                }
            },
             async handleInputConfirm(row){
              //文本框失去焦点或者enter键
                if(row.inputValue.trim().length ===0 ){
                    row.inputValue='';
                    row.inputVisible=false;
                    return
                }else {
                    row.attr_vals.push(row.inputValue.trim());
                    row.inputValue='';
                    row.inputVisible=false;
                    this.saveData(row);
                }

            },
            showInput(row){
                row.inputVisible=true;
                //容昂文本框自动获取焦点
                //this.$nextTick 当页面上元素被重新渲染之后，才会调用指定代码
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            async removeParams(id){
                //根据id删除对应的参数项
                const confirmRes = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
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
                    const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`);
                    if(res.meta.status!==200){
                        return this.$message.err("删除分类失败");
                    }else {
                        this.$message.success("删除分类成功");
                        this.getParamsData();
                    }
                }
            },
            editParams(){
              //点击按钮修改参数信息
                this.$refs.editFormRef.validate(async valid=>{
                    if(!valid){
                        return
                    }else {
                        const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                            attr_name:this.editForm.attr_name,
                            attr_sel:this.activeName
                        });
                        if(res.meta.status!==200){
                            return this.$message.error("修改参数失败");
                        }else {
                            this.$message.success("修改参数成功");
                            this.getParamsData();
                            this.editDialogVisible=false;
                        }
                    }
                })
            },
            editDialogClosed(){
              this.$refs.editFormRef.resetFields();
            },
            async showEditDialog(id){
                this.editDialogVisible=true;
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`,{params:{
                    attr_sel:this.activeName
                    }});
                if(res.meta.status !==200){
                    return this.$message.error("获取信息失败");
                }else {
                    this.editForm=res.data;
                }
            },
            addParams(){
              this.$refs.addFormRef.validate(async valid=>{
                  if(!valid){
                      return
                  }else {
                      const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
                          attr_name:this.addForm.attr_name,
                          attr_sel:this.activeName
                      });
                      if(res.meta.status !== 201){
                          this.$message('添加参数失败')
                      }else {
                          this.$message.success("添加用户成功");
                          this.addDialogVisible=false;
                          this.getParamsData();
                      }
                  }
              })
            },
            addDialogClosed(){
              this.$refs.addFormRef.resetFields();
            },
            handleTabClick(){
              //tab页签点击事件的处理函数
              this.getParamsData();
            },
            handleChange(){
              //级联选择框变化发生的函数
                this.getParamsData();
            },
            async getParamsData(){
                //获取参数的函数
                if(this.selectedOption.length!==3){
                    return this.selectedOption=[];
                    this.manyData=[];
                    this.onlyData=[]
                }else {
                    const{data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params: {
                            sel:this.activeName
                        }});
                    if(res.meta.status !==200){
                        this.$message.error("获取参数列表失败");
                    }else {
                        res.data.forEach(item=>{
                            item.attr_vals=item.attr_vals? item.attr_vals.split(' '):[];
                            //添加布尔值显示与隐藏输入框
                            item.inputVisible=false;
                            item.inputValue=''
                        });
                        if(this.activeName==='many'){
                            this.manyData=res.data
                        }else {
                            this.onlyData=res.data
                        }

                    }
                }
            },
            async getCateList(){
                //获取所有的商品分类
                const {data:res} = await this.$http.get('categories');
                if(res.meta.status!==200){
                    this.$message.error("获取商品分类失败")
                }else {
                    this.cateList=res.data;
                    this.$message.success("获取商品分类成功");
                }
            }
        },
        computed:{
            isBtnDisabled(){
                if (this.selectedOption.length!==3){
                    return true;
                }else {
                    return false;
                }
            },
            cateId(){
                //三级分类的ID
                if(this.selectedOption.length === 3){
                    return this.selectedOption[2]
                }else {
                    return null;
                }
            },
            titleText(){
                //动态计算标题的函数
                if(this.activeName === 'many'){
                    return '动态参数'
                }else {
                    return '静态属性'
                }
            }
        }
    }
</script>

<style scoped lang="less">
    .cat_opt{
        margin: 15px 0;
    }
    .el-tag{
        margin: 10px;
    }
    .input-new-tag{
        width: 120px;
    }
    .container{
        padding: 20px;
    }
</style>