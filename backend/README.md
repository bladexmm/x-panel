# XBlade-Panel
## 项目软件版本
python: 3.10.4
## 节点简介

### 绘图/折线图(DisplayLineChart)
#### options
```python
var = {
    # 基础表格配置
    "chart"     : {
        "height"    : "100%", # 宽度
        "width"     : "100%", # 高度
        "background": 'transparent', # 背景
        "type"      : 'area', # 图标类型： area | line
        "toolbar"   : {
            "show": False # 工具栏显示
        },
        "zoom" :{
            "enabled":False # 缩放控制
        }
    },
    "dataLabels": {
        "enabled": True # 节点显示数据
    },
    "stroke"    : {
        "curve": 'smooth' # 线条类型 smooth (曲线) | straight (直线)
    },
    "grid"      : {
        "row" : {
            "opacity": 0
        },
        "show": False # 横线标线显示
    },
    # 标题
    "title"     : {
        "text" : "温度", # 标题文本
        "align": 'left' # 标题位置
    },
    "xaxis"     : {
        "categories": ["06-13", "06-14"], # x 轴内容
        "labels"    : {
            "show": False # 隐藏标尺内容
        },
        "axisBorder": {
            "show": False  # 隐藏X轴边框
        },
        "axisTicks" : {
            "show": False  # 隐藏X轴刻度线
        },
    },
    "yaxis"     : {
        "labels"    : {
            "show": False # 标尺内容
        },
        "axisBorder": {
            "show": False  # 隐藏X轴边框
        },
        "axisTicks" : {
            "show": False  # 隐藏X轴刻度线
        },
    },
}
```
# 待完成节点
## 组件节点
* CheckBox
* Radio(完成)
* Switch
* TextArea
* ListItem
* Card
* Modal|弹出层(暂不考虑)
* Snackbar|提示框(暂不考虑)
## 系统节点
* 修改音量
* 打开和关闭蓝牙
* 打开关闭WIFI
* CPU占用率
* 内存占用率
* GPU占用率

# 演示版
禁用功能
1. 导入应用
2. 新增应用
3. 修改布局
4. 修改应用
5. 数据备份
6. 浏览壁纸
