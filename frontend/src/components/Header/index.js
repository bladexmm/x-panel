import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import Grid from '@mui/joy/Grid';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import { ListItemContent, styled, Tooltip } from '@mui/joy';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import AddLinkRoundedIcon from '@mui/icons-material/AddLinkRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import TuneIcon from '@mui/icons-material/Tune';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

const Header = ({
    editing = false,
    dockIsShow = 'show',
    goHome = () => {},
    goSetting = () => {},
    defaultLayout,
    StopPaneEditing,
    openAddDiag,
    setPaneDraggable,
    yPosition,
    setYPosition,
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="header">
            <Grid container sx={{ flexGrow: 1, height: '100%' }}>
                <Grid xs={4} className="items-left">
                    <ListItemContent>
                        {dockIsShow === 'show' && (
                            <Typography
                                className="time"
                                color="white"
                                level="body-xs"
                                variant="soft">
                                {currentTime.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: true,
                                })}
                            </Typography>
                        )}

                    </ListItemContent>
                </Grid>
                <Grid xs={4}></Grid>

                <Grid xs={4} className="items-right">
                    {dockIsShow === 'hidden' && (
                        <React.Fragment>
                            <Tooltip title="首页" size="sm">
                                <IconButton
                                    onClick={() => goHome()}
                                    className="right-btn"
                                    id="add-app-btn"
                                    variant="soft">
                                    <HomeRoundedIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="设置" size="sm">
                                <IconButton
                                    onClick={() => goSetting()}
                                    className="right-btn"
                                    id="add-app-btn"
                                    variant="soft">
                                    <TuneIcon />
                                </IconButton>
                            </Tooltip>
                        </React.Fragment>
                    )}
                    <Tooltip title="控制中心" size="sm">
                        <IconButton
                            onClick={() => setYPosition(0)}
                            className="right-btn"
                            id="add-app-btn"
                            variant="soft">
                            <ControlCameraIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="新增应用" size="sm">
                        <IconButton
                            onClick={openAddDiag}
                            className="right-btn"
                            id="add-app-btn"
                            variant="soft">
                            <AddLinkRoundedIcon />
                        </IconButton>
                    </Tooltip>

                    {editing ? (
                        <Tooltip title="保存布局" size="sm">
                            <IconButton
                                variant="soft"
                                onClick={StopPaneEditing}
                                className="right-btn">
                                <LockOpenRoundedIcon />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Tooltip title="修改布局" size="sm">
                            <IconButton
                                variant="soft"
                                onClick={() => setPaneDraggable(true)}
                                className="right-btn">
                                <LockRoundedIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Grid>
            </Grid>
        </div>
    );
};

export default Header;
