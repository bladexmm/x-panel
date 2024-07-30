function TimeWait() {
    this.addInput("in", "cmd");
    this.addOutput("out", "cmd");
    this._value = [];
    this.addProperty("value", "500");
    this.widget = this.addWidget("text", "w", this.properties.value, "value");
    this.widgets_up = true;
    this.size = [100, 30];
}

TimeWait.title = "等待(ms)";
TimeWait.desc = "在等待N毫秒";


function isNumeric(str) {
    return /^\d+$/.test(str);
}


TimeWait.prototype.onPropertyChanged = function (name, value) {
    this.widget.value = value;
    if (value == null || value === "") {
        return;
    }
    if (isNumeric(value)) {
        this.boxcolor = "#AEA";
    } else {
        this.boxcolor = "red";
        alert("只能输入整数")
    }
};

function FetchApi() {
    this.desc = "fetch";
    this.addInput("in", "cmd")
    this.addOutput("out", "cmd")

    this.addInput("url", "text")
    this.addInput("data", "text")
    this.addInput("header", "text")
    this.addOutput("response", "response")
    this.addOutput("error", "cmd")

    this.addProperty("method", 'GET');
    this.inputTypeWidget = this.addWidget("combo", "method", 'GET', {
        values: ["GET", "POST", "PUT", "DELETE"],
        property: "method"
    });


    this.addProperty("type", 'form-data');
    this.inputTypeWidget = this.addWidget("combo", "type", 'form-data', {
        values: ["form-data", "x-www-form-urlencoded", "json"],
        property: "contentType"
    });

    this.size = [180, 150];
}

FetchApi.title = "请求接口";


function GetJson() {
    this.desc = "获取JSON参数";
    this.addInput("in", "cmd")
    this.addOutput("out", "cmd")
    this.addOutput("error", "cmd")

    this.addInput("response", "response")
    this.addInput("path", "text")
    this.addOutput("out", "text")
    this.addOutput("out", "array")

    this.size = [140, 90];
}


GetJson.title = "获取JSON参数";


function IfValid() {
    this.desc = "if";
    this.addInput("in", "cmd")
    this.addOutput("true", "cmd")
    this.addOutput("false", "cmd")

    this.addInput("input1", "text")
    this.addInput("input2", "text")

    this.size = [120, 90];
}


IfValid.title = "判断(eq)";


function SwitchValid() {
    this.desc = "switch";
    this.addInput("in", "cmd")
    this.addOutput("error", "cmd")

    this.addInput("input", "text")
    this.addInput("valid_1", "text")
    this.addInput("valid_2", "text")


    this.addOutput("input", "text")
    this.addOutput("1", "cmd")
    this.addOutput("2", "cmd")

    this.size = [120, 120];
}

SwitchValid.title = "选择结构(switch)";

SwitchValid.prototype.onDrawBackground = function (ctx, graphcanvas, canvas, pos) {
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
    } else {
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

SwitchValid.prototype.onMouseDown = function (e, localpos, graphcanvas) {
    var y = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
    if (localpos[1] > y) {
        if (localpos[0] < this.size[0] / 2) {
            // add input node
            let startIndex = this.inputs.length - 1
            this.addInput(`valid_${startIndex}`, "text")
            this.addOutput(startIndex.toString(), "cmd")
            this.size[1] += 24;
        } else {
            if (this.inputs.length > 4) {
                this.removeInput(this.inputs.length - 1);
                this.removeOutput(this.outputs.length - 1);
                this.size[1] += 24;
            }
        }
    }
}


function FormatText() {
    this.desc = "格式化字符串";
    this.addInput("in", "cmd")
    this.addOutput("out", "cmd")
    this.addOutput("out", "text")

    this.addInput("text1", "text")
    this.addInput("text2", "text")
    this.addInput("array1", "array")
    this.addInput("array2", "array")

    this.addProperty("text", '');
    this.addWidget("text", "text", '', "text", {multiline: true});
    this.size = [120, 130];
}


FormatText.title = "格式化字符串";


function logDebug() {
    this.desc = "记录日志(logDebug)";
    this.addInput("in", "cmd")
    this.addOutput("out", "cmd")

    this.addProperty("type", 'text');
    this.inputTypeWidget = this.addWidget("combo", "type", 'text', {
        values: NODE_TYPES,
        property: "type"
    });

    this.size = [140, 80];
}

logDebug.title = "记录日志";

logDebug.prototype.onDrawBackground = function (ctx, graphcanvas, canvas, pos) {
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
    } else {
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

logDebug.prototype.onMouseDown = function (e, localpos, graphcanvas) {
    var y = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
    if (localpos[1] > y) {
        if (localpos[0] < this.size[0] / 2) {
            // add input node
            this.addInput(this.properties.type, this.properties.type)
            this.size= [140, this.size[1] + 24];
        } else {
            if (this.inputs.length > 2) {
                this.removeInput(this.inputs.length - 1);
                this.size= [140, this.size[1] + 24];
            }
        }
    }
}


function SetLocalVariables() {
    this.desc = "配置局部变量";
    this.addInput("in", "cmd")
    this.addOutput("out", "cmd")

    this.addProperty("name", '');
    this.addWidget("text", "name", '', "name", {multiline: true});

    this.addProperty("type", 'text');
    this.inputTypeWidget = this.addWidget("combo", "type", 'text', {
        values: NODE_TYPES,
        property: "type"
    });
    this.size = [140, 110];

}

SetLocalVariables.title = "配置局部变量";

SetLocalVariables.prototype.onDrawBackground = function (ctx, graphcanvas, canvas, pos) {
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
    } else {
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

SetLocalVariables.prototype.onMouseDown = function (e, localpos, graphcanvas) {
    var y = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
    if (localpos[1] > y) {
        if (localpos[0] < this.size[0] / 2) {
            // add input node
            this.addInput(this.properties.type, this.properties.type)
            this.size= [140, this.size[1] + 24];
        } else {
            if (this.inputs.length > 1) {
                this.removeInput(this.inputs.length - 1);
                this.size= [140, this.size[1] + 24];
            }
        }
    }
}



function GetLocalVariables() {
    this.desc = "获取局部变量";
    this.addInput("in", "cmd")
    this.addOutput("out", "cmd")

    this.addProperty("name", '');
    this.addWidget("text", "name", '', "name", {multiline: true});

    this.addProperty("type", 'text');
    this.inputTypeWidget = this.addWidget("combo", "type", 'text', {
        values: NODE_TYPES,
        property: "type"
    });


    this.size = [140, 130];
}


GetLocalVariables.title = "获取局部变量";


GetLocalVariables.prototype.onDrawBackground = function (ctx, graphcanvas, canvas, pos) {
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
    } else {
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

GetLocalVariables.prototype.onMouseDown = function (e, localpos, graphcanvas) {
    var y = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
    if (localpos[1] > y) {
        if (localpos[0] < this.size[0] / 2) {
            // add input node
            this.addOutput(this.properties.type, this.properties.type)
            this.size= [140, this.size[1] + 24];
        } else {
            if (this.outputs.length > 1) {
                this.removeOutput(this.outputs.length - 1);
                this.size= [140, this.size[1] + 24];
            }
        }
    }
}




function SetGlobalVariables() {
    this.desc = "配置全局变量";
    this.addInput("in", "cmd")
    this.addOutput("out", "cmd")

    this.addProperty("name", '');
    this.addWidget("text", "name", '', "name", {multiline: true});

    this.addProperty("type", 'text');
    this.inputTypeWidget = this.addWidget("combo", "type", 'text', {
        values: NODE_TYPES,
        property: "type"
    });

    this.size = [140, 130];
}

SetGlobalVariables.prototype.onDrawBackground = function (ctx, graphcanvas, canvas, pos) {
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
    } else {
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

SetGlobalVariables.prototype.onMouseDown = function (e, localpos, graphcanvas) {
    var y = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
    if (localpos[1] > y) {
        if (localpos[0] < this.size[0] / 2) {
            // add input node
            this.addInput(this.properties.type, this.properties.type)
            this.size= [140, this.size[1] + 24];
        } else {
            if (this.inputs.length > 1) {
                this.removeInput(this.inputs.length - 1);
                this.size= [140, this.size[1] + 24];
            }
        }
    }
}

SetGlobalVariables.title = "配置全局变量";


function GetGlobalVariables() {
    this.desc = "获取全局变量";
    this.addInput("in", "cmd")
    this.addOutput("out", "cmd")

    this.addProperty("name", '');
    this.addWidget("text", "name", '', "name", {multiline: true});

    this.addProperty("type", 'text');
    this.inputTypeWidget = this.addWidget("combo", "type", 'text', {
        values: NODE_TYPES,
        property: "type"
    });

    this.size = [140, 130];
}


GetGlobalVariables.title = "获取全局变量";


GetGlobalVariables.prototype.onDrawBackground = function (ctx, graphcanvas, canvas, pos) {
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
    } else {
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

GetGlobalVariables.prototype.onMouseDown = function (e, localpos, graphcanvas) {
    var y = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
    if (localpos[1] > y) {
        if (localpos[0] < this.size[0] / 2) {
            // add input node
            this.addOutput(this.properties.type, this.properties.type)
            this.size= [140, this.size[1] + 24];
        } else {
            if (this.outputs.length > 1) {
                this.removeOutput(this.outputs.length - 1);
                this.size= [140, this.size[1] + 24];
            }
        }
    }
}
