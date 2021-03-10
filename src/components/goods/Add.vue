<template>
    <div class="container">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品添加</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-alert
            title="添加商品信息"
            type="info"
            center
            show-icon
            :closable="false">
            </el-alert>
            <!--步骤条-->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图像"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!--tab栏区域-->
            <el-form :model="addForm" :rules="addFormRules"
                     ref="addFormRef" label-width="100px"
                    label-position="top">
                <el-tabs :tab-position="'left'"
                        v-model="activeIndex"
                        :before-leave="beforeTabLeave"
                        @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input type="number" v-model="addForm.goods_price"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input type="number" v-model="addForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input type="number" v-model="addForm.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <div class="block">
                                <el-cascader
                                        v-model="addForm.goods_cat"
                                        :options="cateList"
                                        :props="props"
                                        @change="handleChange"></el-cascader>
                            </div>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!--渲染item项-->
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <!--复选框组-->
                                <el-checkbox :label="item1" v-for="(item1,i) in item.attr_vals"
                                             :key="i"
                                             border>
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>

                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals">1</el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!--action:上穿到的网站地址-->
                        <el-upload
                                :on-success="handleSuccess"
                                :headers="headersObj"
                                :action="uploadUrl"
                                :on-preview="handlePreview"
                                :on-remove="handleRemove"
                                list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!--富文本编辑器组件-->
                        <quill-editor
                        v-model="addForm.goods_introduce">
                        </quill-editor>
                        <el-button type="primary" class="btnAdd" @click="add">添加分类</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <el-dialog
                title="图片预览"
                :visible.sync="previewVisible"
                width="50%"
                :before-close="handleClose">
            <img :src="previewPath" class="previewImg">
        </el-dialog>
    </div>
</template>

<script>
    import _ from 'lodash'
    export default {
        data(){
            return{
                previewVisible:false,
                previewPath:'',
                headersObj:{
                  //图片上传组件的请求头对象
                    Authorization : window.sessionStorage.getItem('token')
                },
                uploadUrl:'http://127.0.0.1:8888/api/private/v1/upload',
                onlyTableData:[],  //静态属性
                manyTableData:[],   //动态参数
                props:{
                    expandTrigger: 'hover',
                    label:'cat_name',
                    value:'cat_id',
                    children:'children'
                },
                cateList:[],
                activeIndex:'0',
                addForm: {
                    goods_name:'',
                    goods_price:0,
                    goods_weight:0,
                    goods_number:0,
                    goods_cat:[],
                    pics:[],  //图片数组
                    goods_introduce:'',   //商品介绍
                    attrs:[]
                },
                addFormRules: {
                    goods_name:[
                        { required:true ,message:"请输入商品名称",trigger:'blur'}
                    ],
                    goods_price:[
                        { required:true ,message:"请输入商品价格",trigger:'blur'}
                    ],
                    goods_weight:[
                        { required:true ,message:"请输入商品重量",trigger:'blur'}
                    ],
                    goods_number:[
                        { required:true ,message:"请输入商品数量",trigger:'blur'}
                    ],
                    goods_cat:[
                        { required:true ,message:"请选择商品数量",trigger:'blur'}
                    ]

                }
            }
        },
        created() {
            this.getCateList();
        },
        methods:{
            add(){
              this.$refs.addFormRef.validate(async valid=>{
                  if(!valid){
                      return this.$message.error("请填写必要的表单项！")
                  }else {
                      //由于 表单需要数组形式的goods_cat ,而提交的参数需要字符串型的
                      //所以在转换的时候会冲突报错，所以在转换之前为addForm深拷贝
                      //此时需要用到lodash这个包  cloneDeep(obj)
                      const form = _.cloneDeep(this.addForm);
                      form.goods_cat = form.goods_cat.join(',');
                      //处理动态参数，和静态属性
                      this.manyTableData.forEach(item =>{
                          const newInfo={attr_id:item.attr_id
                              ,attr_value:item.attr_vals.join(' ')};
                          this.addForm.attrs.push(newInfo);
                      });
                      console.log("1");
                      this.onlyTableData.forEach(item =>{
                          const newInfo={attr_id:item.attr_id
                              ,attr_value:item.attr_vals};
                          this.addForm.attrs.push(newInfo);
                      });
                      form.attrs=this.addForm.attrs;
                      const {data:res} =await this.$http.post('goods',form)
                        if(res.meta.status !==201 ){
                            return this.$message.error("添加商品失败");
                        }else {
                            this.$message.success("添加商品成功！");
                            this.$router.push('/goods');
                        }
                  }
              })
            },
            handleClose(){
                this.previewVisible=false;
            },
            handleSuccess(res){
                //拼接得到图片信息对象
                //将图片信息对象，push到pics数组中
                const picInfo = { pic: res.data.tmp_path };
                    this.addForm.pics.push(picInfo);
                console.log(this.addForm)
            },
            handleRemove(file){
                //处理移除图片的操作
                //获取将要删除的图片的临时路径
                //调用数组中的splice方法，把图片信息对象，从PICS数组中移除
                const filePath=file.response.data.tmp_path;
                const i=this.addForm.pics.findIndex(x=>x.pic === filePath)
                //找到索引值
                this.addForm.pics.splice(i,1);
                console.log(this.addForm);
            },
            handlePreview(file){
              //处理图片预览函数
                this.previewPath=file.response.data.url;
                console.log(this.previewPath);
                this.previewVisible=true;
            },
            async tabClicked(){
                if(this.activeIndex === '1'){
                    //动态参数面板
                    const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                        params:{
                            sel:'many'
                        }
                    });
                    if(res.meta.status !== 200){
                        return this.$message.error('获取动态参数列表失败');
                    }else {
                        res.data.forEach(item =>{
                            item.attr_vals=item.attr_vals.length===0 ? [] : item.attr_vals.split(' ');
                        });
                        this.manyTableData=res.data;
                        console.log(this.manyTableData);
                    }
                }else if (this.activeIndex === '2'){
                    const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                        params:{
                            sel:'only'
                        }
                    });
                    if(res.meta.status !== 200){
                        return this.$message.error('获取动态参数列表失败');
                    }else {
                        this.onlyTableData=res.data;
                        console.log(this.onlyTableData);
                    }
                }
            },
            beforeTabLeave(activeName,oldActiveName){
                if(oldActiveName === '0'&&
                this.addForm.goods_cat.length!==3){
                    this.$message.error("请选择商品分类");
                    return false;
                }
            },
            handleChange(){
                if(this.addForm.goods_cat.length!==3){
                    this.addForm.goods_cat=[];
                }
            },
            async getCateList(){
                const {data:res} = await this.$http.get('categories')
                if(res.meta.status !==200){
                    this.$message.error("获取商品分类数据失败");
                }else {
                    this.cateList=res.data;
                }
            }
        },
        computed:{
          cateId(){
             if(this.addForm.goods_cat.length === 3){
                 return this.addForm.goods_cat[2]
             }else {
                 return null
             }
          }
        }
    }
</script>

<style scoped lang="less">
    .el-checkbox{
        margin: 0 15px 0 0!important;
    }
    .previewImg{
        width: 100%;
    }
    .btnAdd{
        margin-top: 15px;
    }
    .container{
        padding: 20px;
    }
</style>