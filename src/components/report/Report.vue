<template>
    <div class="container">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <div id="main" style="width:750px;height:400px;">

            </div>
        </el-card>
    </div>
</template>

<script>
    import echarts from 'echarts'
    //导入echarts
    import _ from 'lodash'
    export default {
        data(){
            return {
                options: {
                    title: {
                        text: '用户来源'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#E9EEF3'
                            }
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            boundaryGap: false
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ]
                }
                //需要合并的数据
            }
        },
        created(){

        },
        methods:{

        },
        async mounted() {
            const {data:res} = await this.$http.get('reports/type/1');
            if(res.meta.status!==200){
                this.$message.error("获取折线图数据失败");
            }

             const result = _.merge(res.data,this.options);
            //只要执行到了mounted函数时，此时页面上的元素已经被渲染完毕了
            var myChart = echarts.init(document.getElementById('main'));
            //准备数据和对象
            //两个对象的合并得到一个新对象
            //展示图表
            myChart.setOption(result);

        }
    }
</script>

<style scoped lang="less">
    .container{
        padding: 20px;
    }
</style>