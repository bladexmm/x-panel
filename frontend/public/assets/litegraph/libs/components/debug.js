function LocateNode(idx = 0) {
    let id = outputs[idx].id;
    const nodeToHighlight = graph.getNodeById(id);
    let nodes = Object.keys(canvas.selected_nodes);
    let last_id = outputs[outputsFocusIdx].id;
    const node = graph.getNodeById(last_id);
    node.is_selected = false;
    const nodeLocate = document.getElementById("log-id-" + outputsFocusIdx.toString());
    nodeLocate.classList.remove("focus");

    for (let i = 0; i < nodes.length; i++) {
        const node = graph.getNodeById(nodes[i]);
        node.is_selected = false;
    }
    if (nodeToHighlight) {
        nodeToHighlight.is_selected = true;
        canvas.draw(true);
        outputsFocusIdx = idx;
        const nodeLocate = document.getElementById("log-id-" + outputsFocusIdx.toString());
        nodeLocate.classList.add("focus");
        showLog(idx)
    }
}

function showLog(idx = 0) {
    let output = outputs[idx];
    let consoleOutputDisplay = document.getElementsByClassName('console-outputs-display');
    consoleOutputDisplay = consoleOutputDisplay[0];
    // 清空元素内部内容
    consoleOutputDisplay.innerHTML = '';
    let log_html = ''
    for (let i = 0; i < output.data.length; i++) {
        log_html += "<div class=\"console-log-item normal\">\n" +
            "            <span>" + JSON.stringify(output.data[i]) + "</span>\n" +
            "        </div>"
    }
    consoleOutputDisplay.innerHTML = log_html;
}

function logPreview() {
    let nodeIdx = outputsFocusIdx;
    if (nodeIdx - 1 < 0) {
        nodeIdx = outputs.length - 1;
    } else {
        nodeIdx -= 1;
    }
    LocateNode(nodeIdx);
}

let timer;

function playStart() {
    if (outputsFocusIdx + 1 === outputs.length) {
        clearInterval(timer);
    } else {
        logNext();
    }
}

function logPause() {
    clearInterval(timer);
}

function logPlay() {
    timer = setInterval(playStart, 500);
}

function logNext() {
    let nodeIdx = outputsFocusIdx;
    if (nodeIdx + 1 >= outputs.length) {
        nodeIdx = 0;
    } else {
        nodeIdx += 1;
    }
    LocateNode(nodeIdx);
}

function initConsoleLogs() {
    const consoleDisplay = document.querySelector('.console-display');
    // 清空元素内部内容
    consoleDisplay.innerHTML = '';
    let consoleHtml = ''
    for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i];
        const name = output.type[output.type.length - 1];
        let className = '';
        if (output.code === 3) {
            className = 'normal';
        } else if (output.code === 2) {
            className = 'error';
        } else if (output.code === 1) {
            className = 'normal'
        }
        consoleHtml += "<div id=\"log-id-" + i.toString() + "\" class=\"console-log-item " + className + "\">\n" +
            "            <span>" + name + "</span>\n" +
            "            <button onclick=\"LocateNode(" + i.toString() + ")\" class=\"btn\">\n" +
            "                定位\n" +
            "            </button>\n" +
            "        </div>"
    }
    consoleDisplay.innerHTML = consoleHtml;

}