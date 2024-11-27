const nodes = [

    {name: "基础/开始(CMDStart)", callback: CMDStart},
    {name: "基础/结束(CMDEnd)", callback: CMDEnd},
    {name: "基础/合并运行(MultiMerge)", callback: MultiMerge},
    {name: "基础/跳转运行(JumpNode)", callback: JumpNode},


    {name: "绘图/开始(DisplayStart)", callback: DisplayStart},
    {name: "绘图/布局(DisplayGrid)", callback: DisplayGrid},
    {name: "绘图/图片(DisplayImage)", callback: DisplayImage},
    {name: "绘图/文字(DisplayText)", callback: DisplayText},
    {name: "绘图/输入框(DisplayInput)", callback: DisplayInput},
    {name: "绘图/折线图(DisplayLineChart)", callback: DisplayLineChart},
    {name: "绘图/按钮(DisplayButton)", callback: DisplayButton},
    {name: "绘图/选择框(DisplaySelector)", callback: DisplaySelector},
    {name: "绘图/滑动条(DisplaySlider)", callback: DisplaySlider},


    {name: "编程/等待(TimeWait)", callback: TimeWait},
    {name: "编程/请求接口(FetchApi)", callback: FetchApi},
    {name: "编程/获取JSON参数(GetJson)", callback: GetJson},
    {name: "编程/判断(IfValid)", callback: IfValid},
    {name: "编程/选择结构(switchValid)", callback: SwitchValid},
    {name: "编程/循环列表(ForLoop)", callback: ForLoop},
    {name: "编程/格式化字符串(FormatText)", callback: FormatText},
    {name: "编程/记录日志(logDebug)", callback: logDebug},
    {name: "编程/配置局部变量(SetLocalVariables)", callback: SetLocalVariables},
    {name: "编程/获取局部变量(GetLocalVariables)", callback: GetLocalVariables},
    {name: "编程/配置全局变量(SetGlobalVariables)", callback: SetGlobalVariables},
    {name: "编程/获取全局变量(GetGlobalVariables)", callback: GetGlobalVariables},


    {name: "输入/文本(TextInput)", callback: TextInput},
    {name: "输入/列表(ArrayInput)", callback: ArrayInput},
    {name: "输入/图片(ImageInput)", callback: ImageInput},

    {name: "自动化/图片定位(LocateOnScreenNode)", callback: LocateOnScreenNode},
    {name: "自动化/查找图片(FindImage)", callback: FindImage},
    {name: "自动化/运行软件(startApp)", callback: startApp},
    {name: "自动化/打开链接(openLink)", callback: openLink},

    {name: "组件/实例化(Subgraph)", callback: Subgraph},
    {name: "组件/输入(SubgraphInput)", callback: SubgraphInput},
    {name: "组件/输出(SubgraphOutput)", callback: SubgraphOutput},

    {name: "模拟/快捷键(Hotkeys)", callback: Hotkeys},
    {name: "模拟/文本输入(TypeText)", callback: Type_Text},
    {name: "模拟/鼠标移动(MouseMove)", callback: MouseMove},
    {name: "模拟/鼠标左键(MouseLeft)", callback: MouseLeft},
    {name: "模拟/鼠标中键(MouseMiddle)", callback: MouseMiddle},
    {name: "模拟/鼠标右键(MouseRight)", callback: MouseRight},

    {name: "系统/获取所有窗口(Windows)", callback: Windows},

]

const NODE_TYPES = [
    'text','array','location','response','image'
]