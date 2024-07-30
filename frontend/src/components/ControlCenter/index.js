import "./index.css"
import Grid from "@mui/joy/Grid";
import {ListItem, ListItemButton, Sheet, Slider, styled, Tooltip} from "@mui/joy";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import StopIcon from '@mui/icons-material/Stop';
import React, {useEffect, useRef, useState} from "react";
import IconButton from "@mui/joy/IconButton";
import * as PropTypes from "prop-types";
import {useSnackbar} from "../SnackbarUtil/SnackbarUtil";
import {getUserSettings} from "../../utils/settings";
import RepartitionIcon from '@mui/icons-material/Repartition';
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import request from "../../utils/request";
import CleaningServicesRoundedIcon from '@mui/icons-material/CleaningServicesRounded';
import io from 'socket.io-client';
import socketService from "../../utils/socket";


const ImportAppsVisuallyHiddenInput = styled('input')`
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    left: 0;
    white-space: nowrap;
    width: 1px;
`;

ImportAppsVisuallyHiddenInput.propTypes = {
    onChange: PropTypes.any,
    type: PropTypes.string
};
const ControlCenter = ({defaultLayout, yPosition, setYPosition}) => {
    const inputRef = useRef(null);
    const {showMessage} = useSnackbar();
    const [host, setHost] = useState(getUserSettings('settings.host'));
    const [fullscreen, setFullscreen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [appRunning, setAppRunning] = useState([]);
    const [volume, setVolume] = useState(30);

    const handleImportClick = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };


    const handleFullScreen = () => {
        if (document.fullscreenEnabled) {
            if (!document.fullscreenElement) {
                setFullscreen(true)
                document.documentElement.requestFullscreen();
            } else {
                setFullscreen(false)
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
    };


    const importApps = (event) => {
        const formData = new FormData();
        formData.append('file', event.target.files[0]);
        formData.append('layout', defaultLayout);
        // 使用fetch发送POST请求到Flask上传接口
        fetch(host + '/api/tools/import', {
            method: 'PUT',
            body: formData
        }).then(response => {
            if (response.ok) {
                // 解析JSON格式的响应数据
                return response.json();
            } else {
                throw new Error('File upload failed');
            }
        }).then(res => {
            showMessage(res.msg, res.code);
            window.location.reload();
        })
    }

    function valueText(value) {
        return `${value}%`;
    }

    const formatSeconds = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let formattedHours = hours !== 0 ? `${hours}小时` : '';
        let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        formattedMinutes = minutes !== 0 ? `${formattedMinutes}分钟` : '';
        if (hours > 0) {
            return `${formattedHours}${formattedMinutes}`;
        }
        let formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

        return `${formattedHours}${formattedMinutes}${formattedSeconds}秒`;
    };


    const StopApp = (id) => {
        request({
            url: "/api/apps/stop",
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: {"id": id},
        }).then((result) => {

        });
    }

    const CleanApp = (ids = []) => {
        request({
            url: "/api/apps/clean",
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: {ids: ids}
        }).then((result) => {

        });
    }

    // 清除mousemove监听器，避免内存泄漏
    useEffect(() => {
        const source = new EventSource(host + '/api/tools/control');
        source.onmessage = (event) => {
            const result = JSON.parse(event.data);
            setAppRunning(result.apps);
            setVolume(result.system.volume);
        };
        source.onerror = (err) => {
            console.error('Error with SSE:', err);
            source.close();
        };

        setYPosition(document.documentElement.clientHeight);

        return () => {
            source.close();
        };
    }, []);

    return (
        <React.Fragment>
            <Grid container className="control-center"
                  spacing={2}
                  sx={{flexGrow: 1, bottom: yPosition, transition: isDragging ? 0 : '0.3s', overflowY: 'scroll'}}>

                <Grid xs={12} md={6}>
                    <Sheet variant="soft" sx={{p: 2, borderRadius: 'sm', backgroundColor: 'transparent'}}>
                        <Typography
                            level="h3"
                            fontSize="xl2"
                            fontWeight="xl"
                            mb={1}>
                            控制中心
                        </Typography>
                        <ImportAppsVisuallyHiddenInput ref={inputRef} onChange={importApps} type="file"/>

                        <div className="control-center-left">
                            <div>
                                <Tooltip title="导入应用">
                                    <IconButton onClick={handleImportClick} sx={{
                                        "--IconButton-size": "4rem",
                                        borderRadius: '1rem',
                                    }} variant="soft">
                                        <RepartitionIcon/>
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <div>
                                <Tooltip title="全屏">
                                    <IconButton variant="soft" sx={{
                                        "--IconButton-size": "4rem",
                                        borderRadius: '1rem',
                                    }} onClick={handleFullScreen}>
                                        {
                                            fullscreen === true ?
                                                <FullscreenExitRoundedIcon/> :
                                                <FullscreenRoundedIcon/>
                                        }
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <div>
                                <Tooltip title="音量">
                                    <Slider
                                        aria-labelledby="track-inverted-slider"
                                        getAriaValueText={valueText}
                                        value={volume}
                                        disabled={false}
                                        max={100}
                                        onChange={(event) => {
                                            setVolume(event.target.value);
                                            socketService.emit('setVolume', event.target.value)
                                        }}
                                        sx={{
                                            '--Slider-trackSize': '4rem',
                                            '--Slider-trackRadius': '1rem',
                                            '--Slider-thumbSize': 0,
                                            borderRadius: '1rem',
                                            overflow: 'hidden',
                                            width: '8rem',
                                            height: '4rem'
                                        }}
                                    />
                                </Tooltip>
                            </div>

                        </div>

                    </Sheet>
                </Grid>

                <Grid xs={12} md={6}>
                    <Sheet variant="soft" sx={{p: 2, borderRadius: 'sm', backgroundColor: 'transparent'}}>
                        <div className="control-notify">
                            <Typography
                                level="h3"
                                fontSize="xl2"
                                fontWeight="xl"
                                mb={1}>
                                通知中心

                            </Typography>
                            <Button variant="plain" color="neutral"
                                    onClick={() => socketService.emit('clearApps', [])}
                                    startDecorator={<CleaningServicesRoundedIcon/>}>一键清除</Button>
                        </div>

                        {appRunning.map((item, index) => (
                            <ListItem className="app-running" sx={{padding: '1rem 2rem'}}>
                                <ListItem nested>
                                    <Typography
                                        level="title-lg"
                                        mb={1}
                                        sx={{margin: 0, color: 'black'}}>
                                        {item.name} &nbsp;
                                        <Typography color="neutral" level="title-sm">
                                            第{item.step}步
                                        </Typography>
                                    </Typography>
                                    <Typography color="neutral" level="title-sm">
                                        {item.tag} - {formatSeconds(Math.floor(Date.now() / 1000) - item.start)}
                                    </Typography>
                                </ListItem>
                                <div className="control-center-clear-btn">
                                    {item.status === 'end' ? (
                                        <Button variant="soft" color="neutral"
                                                onClick={() => socketService.emit('clearApps', [item.id])}
                                                startDecorator={<DeleteRoundedIcon/>}>清除</Button>

                                    ) : item.status === 'running' ? (
                                        <Button variant="soft" color="neutral"
                                                onClick={() => StopApp(item.id)}
                                                startDecorator={<StopIcon/>}>停止</Button>
                                    ) : item.status === 'stopping' ? (
                                        <Button variant="soft" color="neutral"
                                                loadingPosition="start" loading>暂停</Button>
                                    ) : (
                                        <Button variant="soft" color="neutral"
                                                onClick={() => socketService.emit('clearApps', [item.id])}
                                                startDecorator={<DeleteRoundedIcon/>}>清除</Button>
                                    )}
                                </div>

                            </ListItem>
                        ))}

                    </Sheet>

                </Grid>

            </Grid>

            <div className='control-center-close'
                 onClick={() => setYPosition(document.documentElement.clientHeight)}
                 style={{bottom: yPosition, transition: isDragging ? 0 : '0.3s'}}>
                <div className='control-center-close-btn'></div>
            </div>
        </React.Fragment>

    )

}

export default ControlCenter;