<template>
    <div class="container">
        <div class="login_box">
            <div class="avatar_box">
                <!--图形区域-->
                <img src="../assets/logo.png" alt="">
            </div>
            <!--表单区域-->
            <el-form :model="form" :rules="rules" label-width="0px" class="login_form" ref="loginRef">
                <el-form-item prop="username">
                    <el-input v-model="form.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" prefix-icon="iconfont icon-lock_fill" v-model="form.password"></el-input>
                </el-form-item>
                <el-form-item class="btn">
                <el-button type="primary" @click="login">登录</el-button>
                <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
            <!--按钮区域-->


        </div>
    </div>

</template>

<script>
    export default {
        data(){
            return{
                form:{
                    username:'admin',
                    password:'123456'
                },
                rules:{
                    username: [
                        { required: true, message: '请输入username', trigger: 'blur' },
                        { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                    ],
                  password:[
                      { required: true, message: '请输入password', trigger: 'blur' },
                      { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                  ]
                }
            }
        },
        methods:{
            reset(){
                this.$refs.loginRef.resetFields();
            },
            login() {
                this.$refs.loginRef.validate(async valid => {
                    if (!valid) return
                    const { data: res } = await this.$http.post('login', this.form)
                    console.log(res);
                    if (res.meta.status !== 200) return this.$message.error('登录失败！')
                    this.$message.success('登录成功')
                    // 1. 将登录成功之后的 token，保存到客户端的 sessionStorage 中
                    //   1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
                    //   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
                    window.sessionStorage.setItem('token', res.data.token)
                    // 2. 通过编程式导航跳转到后台主页，路由地址是 /home
                    this.$router.push('/home')
                })
            }
        }
    }
</script>

<style scoped lang="less">
    .container{
        background-color: #2b4b6b;
        height: 100%;
    }
    .login_box{
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        .avatar_box{
            height: 130px;
            width: 130px;
            border: 1px solid #ffffff;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 0 10px #dddddd;
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
            background-color: #fff;
            img{
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #eeeeee;
            }
        }
    }
    .btn{
        display: flex;
        justify-content: flex-end;
    }
    .login_form{
        width: 100%;
        padding: 10px 20px;
        box-sizing: border-box;
        position: absolute;
        bottom: 0;
    }
</style>
