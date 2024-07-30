function CMDStart() {
    this.addOutput("out", "cmd")
    this.size = [80, 30];
}

CMDStart.title = "开始";
CMDStart.desc = "程序开始";
CMDStart.prototype.onExecute = function () {
    this.setOutputData(0, 'start');
};



function CMDEnd() {
    this.addInput("in", "cmd");
    this.size = [80, 30];
}

CMDEnd.title = "结束";
CMDEnd.desc = "程序结束";




function MultiMerge(){
    this.addInput("in", "cmd");
    this.addInput("in", "cmd");

    this.addOutput("out", "cmd");
    // this.horizontal = true;

    this.size = [100, 85];
}

MultiMerge.title = "合并运行";
MultiMerge.desc = "多个执行合并成一个";


MultiMerge.prototype.onDrawBackground = function (ctx, graphcanvas, canvas, pos) {
    if (this.flags.collapsed)
        return;
    var y = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
    // button
    var over = LiteGraph.isInsideRectangle(pos[0], pos[1], this.pos[0], this.pos[1] + y, this.size[0], LiteGraph.NODE_TITLE_HEIGHT);
    let overleft = LiteGraph.isInsideRectangle(pos[0], pos[1], this.pos[0], this.pos[1] + y, this.size[0] / 2, LiteGraph.NODE_TITLE_HEIGHT)
    ctx.fillStyle = over ? "#555" : "#222";
    ctx.beginPath();
    if (this._shape == LiteGraph.BOX_SHAPE) {
        if (overleft) {
            ctx.rect(0, y, this.size[0] / 2 + 1, LiteGraph.NODE_TITLE_HEIGHT);
        } else {
            ctx.rect(this.size[0] / 2, y, this.size[0] / 2 + 1, LiteGraph.NODE_TITLE_HEIGHT);
        }
    }
    else {
        if (overleft) {
            ctx.roundRect(0, y, this.size[0] / 2 + 1, LiteGraph.NODE_TITLE_HEIGHT, [0, 0, 8, 8]);
        } else {
            ctx.roundRect(this.size[0] / 2, y, this.size[0] / 2 + 1, LiteGraph.NODE_TITLE_HEIGHT, [0, 0, 8, 8]);
        }
    }
    if (over) {
        ctx.fill();
    } else {
        ctx.fillRect(0, y, this.size[0] + 1, LiteGraph.NODE_TITLE_HEIGHT);
    }
    // button
    ctx.textAlign = "center";
    ctx.font = "24px Arial";
    ctx.fillStyle = over ? "#DDD" : "#999";
    ctx.fillText("+", this.size[0] * 0.25, y + 24);
    ctx.fillText("-", this.size[0] * 0.75, y + 22);
}

MultiMerge.prototype.onMouseDown = function (e, localpos, graphcanvas) {
    var y = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
    if (localpos[1] > y) {
        if (localpos[0] < this.size[0] / 2) {
            // add input node
            this.addInput("in", "cmd")
            this.size= [100, this.size[1] + 24];
        } else {
            if(this.inputs.length > 2){
                this.removeInput(this.inputs.length - 1);
                this.size= [100, this.size[1] + 24];
            }
        }
    }
}


function JumpNode(){
    this.addInput("in", "cmd");
    this.addOutput("out", "cmd");
    var randomName = Math.random().toString(36).substring(2, 7);
    this.addProperty("name", randomName);
    this.addWidget("text","name", randomName, "name");

    this.size = [130, 50];
}

JumpNode.title = "跳转运行";
JumpNode.desc = "跳转节点跳转到指定节点继续运行";




function CMDDebug() {
    this.addInput("in", "cmd");
    this.addOutput("out", "cmd");
    this.size = [80, 30];
}

CMDDebug.title = "调试";
CMDDebug.desc = "从调试节点开始运行";
CMDDebug.prototype.onExecute = function () {
    this.setOutputData(0, 'start');
};
