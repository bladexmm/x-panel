import * as React from 'react';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import {Autocomplete, AutocompleteOption, Avatar, ListItemContent, ListItemDecorator} from "@mui/joy";
import request from "../../../utils/request";
import {getUserSettings} from "../../../utils/settings";
import "./index.css";
import Grid from '@mui/joy/Grid';
import SvgIcon from '@mui/joy/SvgIcon';
import {styled} from '@mui/joy';
import {useEffect, useState} from "react";
import FileIconAuto from "../../FileIconAuto/FileIconAuto";
import Typography from "@mui/joy/Typography";
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';
import DatasetLinkedRoundedIcon from '@mui/icons-material/DatasetLinkedRounded';
import AppShortcutRoundedIcon from '@mui/icons-material/AppShortcutRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import SVGIcon from "../../XBladeIcon/SVGIcon";

const VisuallyHiddenInput = styled('input')`
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

export default function AddApps({
                                    open,
                                    onClose,
                                    app = null,
                                    app_id = null,
                                    iconDefault = null,
                                    setIconDefault = () => {
                                    },
                                    apps = [],
                                    setIconSelectorOpen,
                                    appName = '',
                                    appPath = '',
                                    appIcons = [],
                                    defaultLayout = 'pane'
                                }) {
    const [name, setName] = React.useState(appName);
    const [path, setPath] = React.useState(appPath);
    const [submitBtn, setSubmitBtn] = React.useState(false);
    const [icons, setIcons] = React.useState(appIcons);
    const [iconSelect, setIconSelect] = React.useState(0);
    const host = getUserSettings('settings.host');
    const [appBind, setAppBind] = React.useState(null);
    const [thirdImg, setThirdImg] = React.useState('');

    useState(() => {
        setName(appName)
        setPath(appPath)
        setIcons(iconDefault !== null ? iconDefault : appIcons);

        if (app_id != null && app['pid'] != null) {
            for (let i = 0; i < apps.length; i++) {
                if (apps[i].id === app.pid) {
                    setAppBind(apps[i]);
                    break;
                }
            }
        }
    }, [open, iconDefault, appName, appPath, appIcons])
    const onAppBindChange = (event, values) => {
        setAppBind(values);
    }
    const fetchUrlDetails = () => {
        setSubmitBtn(true)
        request({
            url: "/api/apps/fetch",
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: {"path": path !== '' ? path : appPath},
        }).then((data) => {
            setSubmitBtn(false);
            setName(data.data.title);
            setIcons(data.data.images);
            setIconDefault(null);
        });
    }


    const submitBtnClick = () => {
        // socket.emit("chat", { user: "user.username", msg: "chatInput" });
        // return
        setSubmitBtn(true)
        let icon = icons.length > 0 ? icons[iconSelect] : appIcons[0]
        let pid = appBind !== null ? appBind['id'] : null;
        let layoutName = defaultLayout === 'pane' ? null : defaultLayout;
        pid = pid !== null ? pid : layoutName;
        let appImg = iconDefault !== null ? JSON.stringify(iconDefault) : icon;
        appImg = thirdImg !== '' ? thirdImg : appImg;
        const bodySend = {
            "name": name,
            "icon": appImg,
            "path": path,
            "pid": pid,
            "type": 'default',
        }
        if (app_id != null) {
            bodySend.id = app_id
        }
        request({
            url: "/api/apps",
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: bodySend,
        }).then((data) => {
            setSubmitBtn(false)
            open = false
            onClose()
        });
    }


    const handleFileChange = (event) => {
        const formData = new FormData();
        formData.append('file', event.target.files[0]);
        // 使用fetch发送POST请求到Flask上传接口
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
            const iconsArray = Array.isArray(icons) ? icons : [];
            if (!iconsArray.includes(result.data)) {
                setIcons([result.data, ...iconsArray]);
            }
            setIconDefault(null);
        })
    };
    return (
        <React.Fragment>

            <form id="add-app-dialog">
                <Stack spacing={2}>
                    <FormControl>
                        <Grid container columns={{xs: 5}} alignItems="center">
                            <Grid xs={1} alignItems='center'>
                                <Typography level="title-sm" startDecorator={<ViewQuiltRoundedIcon/>}> 名称</Typography>
                            </Grid>
                            <Grid xs={4}>
                                <Input required className="add-app-name-step" placeholder="应用程序描述" sx={{
                                    '--Input-focusedInset': 'var(--any, )',
                                    '--Input-focusedThickness': '0.25rem',
                                    '--Input-focusedHighlight': 'rgba(13,110,253,.25)',
                                    '&::before': {
                                        transition: 'box-shadow .15s ease-in-out',
                                    },
                                    '&:focus-within': {
                                        borderColor: '#86b7fe',
                                    },
                                }} value={name}
                                       onChange={(event) => setName(event.target.value)}/>

                            </Grid>
                        </Grid>
                    </FormControl>
                    <FormControl>
                        <Grid container columns={{xs: 5}} alignItems="center">
                            <Grid xs={1}>
                                <Typography level="title-sm"
                                            startDecorator={<DatasetLinkedRoundedIcon/>}>路径</Typography>
                            </Grid>
                            <Grid xs={4}>
                                <Input autoFocus required
                                       placeholder="文件路径/网址链接"
                                       value={path}
                                       sx={{
                                           '--Input-focusedInset': 'var(--any, )',
                                           '--Input-focusedThickness': '0.25rem',
                                           '--Input-focusedHighlight': 'rgba(13,110,253,.25)',
                                           '&::before': {
                                               transition: 'box-shadow .15s ease-in-out',
                                           },
                                           '&:focus-within': {
                                               borderColor: '#86b7fe',
                                           },
                                       }} endDecorator={path !== '' && <Button onClick={fetchUrlDetails}>解析</Button>}
                                       onChange={(event) => setPath(event.target.value)}/>

                            </Grid>
                        </Grid>
                    </FormControl>
                    <FormControl>
                        <Grid container columns={{xs: 5}} alignItems="center">
                            <Grid xs={1}>
                                <Typography level="title-sm"
                                            startDecorator={<AppShortcutRoundedIcon/>}>绑定</Typography>
                            </Grid>
                            <Grid xs={4}>
                                <Autocomplete
                                    id="tags-apps"
                                    placeholder="选择要绑定的应用"
                                    options={apps}
                                    defaultValue={appBind}
                                    onChange={onAppBindChange}
                                    getOptionLabel={(option) => option.name}
                                    renderOption={(props, option) => {
                                        if (option.type !== 'component') {
                                            return (<AutocompleteOption {...props}>
                                                <ListItemDecorator>
                                                    <FileIconAuto path={option.path} appType={option.type}
                                                                  img={option.icon}/>
                                                </ListItemDecorator>
                                                <ListItemContent sx={{fontSize: 'sm'}}>
                                                    {option.name}
                                                    <Typography level="body-xs" sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: '200px' // 设置最大宽度，可以根据您的需求调整
                                                    }}>
                                                        {option.path}
                                                    </Typography>
                                                </ListItemContent>
                                            </AutocompleteOption>)
                                        }

                                    }}
                                />
                            </Grid>

                        </Grid>

                    </FormControl>
                    <FormControl>
                        <Grid container columns={{xs: 5}} alignItems="center">
                            <Grid xs={1} alignItems='center'>
                                <Typography level="title-sm" startDecorator={<DiamondRoundedIcon/>}> 图标</Typography>
                            </Grid>
                            <Grid xs={4}>
                                <Input required
                                       placeholder="三方图片地址"
                                       value={thirdImg}
                                       sx={{
                                           '--Input-focusedInset': 'var(--any, )',
                                           '--Input-focusedThickness': '0.25rem',
                                           '--Input-focusedHighlight': 'rgba(13,110,253,.25)',
                                           '&::before': {
                                               transition: 'box-shadow .15s ease-in-out',
                                           },
                                           '&:focus-within': {
                                               borderColor: '#86b7fe',
                                           },
                                       }}
                                       onChange={(event) => setThirdImg(event.target.value)}/>

                            </Grid>
                            <Grid xs={1} alignItems='center'></Grid>
                            <Grid xs={2} style={{marginTop: ".5rem"}}>
                                <Button style={{width: "95%"}} loadingPosition="end" color="neutral" variant="outlined"
                                        onClick={() => setIconSelectorOpen(true)}><MenuOpenIcon/>&ensp;自定义</Button>
                            </Grid>
                            <Grid xs={2} style={{marginTop: ".5rem"}}>
                                <Button
                                    style={{width: "100%"}}
                                    component="label"
                                    role={undefined}
                                    tabIndex={-1}
                                    variant="outlined"
                                    color="neutral"
                                    startDecorator={
                                        <SvgIcon>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                                                />
                                            </svg>
                                        </SvgIcon>
                                    }
                                >
                                    上传
                                    <VisuallyHiddenInput onChange={handleFileChange} type="file"/>
                                </Button>
                            </Grid>
                        </Grid>

                        <Grid container spacing={1}
                              sx={{overflowY: "scroll", height: "8rem", marginTop: "1rem"}}>
                            {iconDefault !== null ? (
                                <Grid xs={1}>
                                    <div className='icon-selected' style={{background: iconDefault.background.style}}
                                         onClick={() => {
                                         }}>
                                        <SVGIcon svgJson={iconDefault.icon.path}
                                                 defaultColor={iconDefault.color.style}/>
                                    </div>
                                </Grid>
                            ) : (<React.Fragment>
                                {(appIcons.lenght > 0 ? appIcons : icons).map((iconSource, index) => (
                                    <Grid xs={2}>
                                        <Avatar onClick={() => setIconSelect(index)}
                                                className={iconSelect === index ? "avatars select" : "avatars"}
                                                src={host + iconSource}/>
                                    </Grid>
                                ))}
                            </React.Fragment>)}


                        </Grid>

                    </FormControl>
                    <Button loadingPosition="end" onClick={submitBtnClick} loading={submitBtn}>提交&ensp;
                        <SendRoundedIcon/></Button>
                </Stack>
            </form>
        </React.Fragment>
    );
}