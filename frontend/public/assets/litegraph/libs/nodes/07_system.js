// 获取所有窗口信息
function Windows() {
    this.addInput("in", "cmd");
    this.addOutput("out", "cmd");
    this.addOutput("windows", "array");
    this.size = [120, 50];
}

Windows.title = "获取所有窗口";
Windows.desc = "获取所有窗口";


// 获取系统基本信息
function SystemUsage() {
    this.addInput("in", "cmd");

    this.addOutput("out", "cmd");
    this.addOutput("cpu", "array");
    this.addOutput("mem", "array");

    this.size = [80, 70];
}

SystemUsage.title = "系统资源";
SystemUsage.desc = "系统资源";