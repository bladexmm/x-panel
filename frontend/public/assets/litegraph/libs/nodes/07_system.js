// 获取所有窗口信息
function Windows() {
    this.addInput("in", "cmd");
    this.addOutput("out", "cmd");
    this.addOutput("windows", "array");
    this.size = [120, 50];
}

Windows.title = "获取所有窗口";
Windows.desc = "获取所有窗口";