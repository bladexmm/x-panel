let host = getUserSettings('settings.host');

function FindImage(){

    this.desc = "根据图片定位屏幕指定坐标";

    this.addProperty("searchTime", 5);
    this.addWidget("number","searchTime", 5, "searchTime");

    this.addProperty("confidence", 0.9);
    this.addWidget("slider","confidence", 0.9, "confidence", { min: 0, max: 1} );

    // 灰度匹配
	this.addProperty("grayscale", false);
    this.addWidget("toggle","grayscale", false,"grayscale", { on: "on", off:"off"} );


    this.addInput("in", "cmd");
    this.addInput("1", "image");
    this.addInput("2", "image");

    this.addOutput("error", "cmd");
    this.addOutput("location", "location");

    this.addOutput("1", "cmd");
    this.addOutput("2", "cmd");

    this.size = [180, 200];
    // this.widgets_up = true;
}

FindImage.title = "查找图片";


FindImage.prototype.onDrawBackground = function (ctx, graphcanvas, canvas, pos) {
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


FindImage.prototype.onMouseDown = function (e, localpos, graphcanvas) {
    var y = this.size[1] - LiteGraph.NODE_TITLE_HEIGHT + 0.5;
    if (localpos[1] > y) {
        if (localpos[0] < this.size[0] / 2) {
            // add input node
            let startIndex = this.inputs.length
            this.addInput(startIndex.toString(), "image")
            this.addOutput(startIndex.toString(), "cmd")
            this.size = [180, this.size[1] + 24];
        } else {
            if (this.inputs.length > 3) {
                this.removeInput(this.inputs.length - 1);
                this.removeOutput(this.outputs.length - 1);
                this.size = [180, this.size[1] + 24];
            }
        }
    }
}



function LocateOnScreenNode() {
    this.addInput("in", "cmd");
    this.addInput("image", "image");
    this.addOutput("out", "cmd");
    this.addOutput("location", "location");
    this.addOutput("error", "cmd");

    // 创建 HTML 元素用于上传图片
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    // 创建用于显示图片的 img 元素
    const img = new Image();
    img.style.maxWidth = "100%"; // 设置最大宽度为父元素的宽度
    img.style.objectFit = "contain";
    img.onload = function() {
        const aspectRatio = this.width / this.height;
        const parentWidth = this.parentElement.clientWidth;
        const parentHeight = this.parentElement.clientHeight;
        
        if (parentWidth / parentHeight > aspectRatio) {
            // 图像的高度将填满容器
            this.style.width = "auto";
            this.style.height = "100%";
        } else {
            // 图像的宽度将填满容器
            this.style.width = "100%";
            this.style.height = "auto";
        }
    };
    img.src = "";
    this.addWidget("image", "", null, img);

    const self = this;
    let aspectRatio = 1; // 图标的宽高比，默认为1
    let imageValues = []; // 存储图片地址的数组

    // 当文件被选择时触发
    fileInput.onchange = function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const src = event.target.result;
            img.src = src === '' ? '' : host + src;
            // 在图像加载完成后更新宽高比
            img.onload = function () {
                aspectRatio = img.width / img.height;
            };
        };

        reader.readAsDataURL(file);

        // 上传图片到服务器
        const formData = new FormData();
        formData.append('file', file);
        fetch(host + '/api/upload/script', {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('File upload failed');
            }
        }).then(result => {
            if (result.code === 1) {
                const imageUrl = result.data;
                if (!imageValues.includes(imageUrl)) {
                    imageValues.push(imageUrl);
                    self.widgets[2].options.values = imageValues;
                    self.setProperty('image', imageUrl);
                }
            } else {
                throw new Error('File upload failed');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    };

    // this.addWidget("button", "Upload Image", null, function () {
    //     fileInput.click();
    // });

    this.addWidget("button", "粘贴图片", null, function () {
        fetch(host + '/api/system/grabclipboard', {
            method: 'GET',
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('File upload failed');
            }
        }).then(result => {
            if (result.code === 1) {
                const imageUrl = result.data;
                if (!imageValues.includes(imageUrl) && imageUrl !== null) {
                    imageValues.push(imageUrl);
                    self.widgets[2].options.values = imageValues;
                    self.setProperty('image', imageUrl);
                }
            } else {
                throw new Error('File upload failed');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    });


    this.addProperty("image", '');

    this.addProperty("searchTime", 5);
    this.addWidget("number","searchTime", 5, "searchTime");

    this.addProperty("confidence", 0.9);
    this.addWidget("slider","confidence", 0.9, "confidence", { min: 0, max: 1} );

    // 灰度匹配
	this.addProperty("grayscale", false);
    this.addWidget("toggle","grayscale", false,"grayscale", { on: "on", off:"off"} );
    this.size = [200, 380];
    this.onPropertyChanged = function (name, value) {
        if (name === 'image') {
            self.setProperty('image', value);
            img.src = value === '' ? '' : host + value;
        }
    }
    // 在背景绘制方法中绘制图片
    this.onDrawBackground = function (ctx) {
        if (this.flags.collapsed)
            return;

        // 根据节点的大小和宽高比确定图标的宽度和高度
        let iconWidth = this.size[0];
        let iconHeight = this.size[0] / aspectRatio;
        if (iconHeight > this.size[1]) {
            iconHeight = this.size[1];
            iconWidth = this.size[1] * aspectRatio;
        }

        // 计算图标在节点内部的位置
        const x = (this.size[0] - iconWidth) / 2;
        const y = 200 + (this.size[1] - 200 - iconHeight) / 2;

        // 在节点内部绘制图标
        ctx.drawImage(img, x, y, iconWidth, iconHeight);
    };
}

LocateOnScreenNode.title = "图片定位";
LocateOnScreenNode.desc = "根据图片定位屏幕指定坐标";



function startApp(){
    this.addInput("in", "cmd");
    this.addOutput("out", "cmd");
    this.addProperty("app", '$path');
    this.addWidget("text","app", '$path', "app");
    this.addProperty("folder", '');
    this.addWidget("text","folder", '', "folder");
}

startApp.title = "启动应用";
startApp.desc = "启动应用，可用指定软件打开文件夹/文件";




function openLink() {
    this.addInput("in", "cmd");
    this.addInput("link", "text");
    this.addOutput("out", "cmd");
    this.size = [120, 50];
}

openLink.title = "打开链接";
openLink.desc = "打开链接";