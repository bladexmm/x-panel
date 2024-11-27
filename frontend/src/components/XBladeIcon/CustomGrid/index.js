import {useEffect} from "react";
import * as React from "react";
import request from "../../../utils/request";
import {getUserSettings} from "../../../utils/settings";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import "./index.css";
import Chart from "react-apexcharts";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Slider from '@mui/joy/Slider';
import socketService from "../../../utils/socket";

export default function CustomGrid({id}) {
    const [gridStyle, setGridStyle] = React.useState({});
    const [nodes, setNodes] = React.useState([]);
    const [refresh, setRefresh] = React.useState(0);
    const host = getUserSettings('settings.host')
    const intervalRef = React.useRef(null);  // 用来保存定时器 ID


    function isFullUrl(str) {
        // 创建正则表达式，匹配以'http://'、'https://'或'//'开头的字符串
        const pattern = /^(https?:\/\/|\/\/)/;

        // 使用test方法测试字符串是否符合正则表达式的规则
        return pattern.test(str);
    }

    function GridClick(nid, tid, method, value = null) {
        let StartNode = {
            nid: nid,
            method: method
        };
        for (let i = 0; i < nodes.length; i++) {

            if (["grid_input", "grid_selector"].includes(nodes[i].type)) {
                let inputNode = document.getElementsByClassName(nodes[i].id);
                inputNode = inputNode[0].getElementsByTagName('input')[0];
                nodes[i].value = inputNode.value;
            }
            if(value != null && nid === nodes[i]['nid']) {
                nodes[i].value = value;
            }
        }
        request({
            url: "/api/apps/open?id=" + id + "&nodes=" + encodeURIComponent(JSON.stringify(nodes)) + "&startNode=" + JSON.stringify(StartNode),
            method: "GET",
            headers: {"Content-Type": "application/json"},
        }).then((data) => {
            if (data.data != null && Object.keys(data.data).includes("style")) {
                setGridStyle(data.data.style)
                setNodes(data.data.nodes)
            }
        });
    }

    const handleKeyDown = (event, nidParam, idParam, methodParam) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            GridClick(nidParam, idParam, methodParam);
        }
    };

    useEffect(() => {
        // 发起请求
        request({
            url: "/api/apps/open?id=" + id,
            method: "GET",
            headers: {"Content-Type": "application/json"},
            body: {},
        }).then((data) => {
            if (data.data != null) {
                setGridStyle(data.data.style);
                setNodes(data.data.nodes != null ? data.data.nodes : []);
                setRefresh(data.data.refresh);
                // 判断 refresh 是否不为 0，开始定时请求
                if (parseInt(data.data.refresh) > 0) {
                    // 清除之前的定时器（如果有）
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }

                    // 设置新的定时器
                    intervalRef.current = setInterval(() => {
                        request({
                            url: "/api/apps/open?id=" + id,
                            method: "GET",
                            headers: {"Content-Type": "application/json"},
                            body: {},
                        }).then((data) => {
                            if (data.data != null) {
                                setGridStyle(data.data.style);
                                setNodes(data.data.nodes != null ? data.data.nodes : []);
                            }
                        });
                    }, parseInt(data.data.refresh) * 1000); // 刷新时间间隔，单位为秒，转为毫秒
                }
            }
        });

        // 清理定时器，当组件卸载或 id 发生变化时
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [id]);


    return (
        <div className="grid-component-node" style={gridStyle}>
            {nodes.map((node, i) => {
                if (node.type === 'grid_image') {
                    node.image = isFullUrl(node.image) ? node.image : host + node.image;
                    return <img key={node.id} onClick={() => GridClick(node.nid, node.id, 'onClick')}
                                className={node.id}
                                src={node.image} style={node.style} alt={node.id}/>

                } else if (node.type === 'grid_string') {
                    return <Typography key={node.id} className={node.id} {...node.properties} sx={node.style}
                                       onClick={() => GridClick(node.nid, node.id, 'onClick')}> {node.text}</Typography>

                } else if (node.type === 'grid_input') {
                    return <Input {...node.properties}
                                  onKeyDown={(event) => handleKeyDown(event, node.nid, node.id, 'Enter')} key={node.id}
                                  className={node.id} placeholder={node.placeholder} style={node.style}/>

                } else if (node.type === 'grid_line_chart') {
                    return <Chart style={node.style} className={node.id} key={node.id}
                                  options={node.options}
                                  series={node.series}
                                  type="line"
                    />

                } else if (node.type === 'grid_button') {
                    return <Button key={node.id} sx={node.style} {...node.properties} className={node.id}
                                   onClick={() => GridClick(node.nid, node.id, 'onClick')}>{node.placeholder}</Button>
                } else if (node.type === 'grid_selector') {
                    return <Select sx={node.style} {...node.properties} className={node.id}>
                        {Object.entries(node.options).map(([key, value]) => (
                            <Option value={key}>{value}</Option>
                        ))}
                    </Select>
                } else if (node.type === 'grid_slider') {
                    return <Slider sx={node.style}  {...node.properties} className={node.id} onChange={(event) => {
                        GridClick(node.nid, node.id, 'onChange',event.target.value)
                    }}/>
                }
            })}
        </div>
    )
}