from glob import glob
import os
import time
from flask_socketio import emit
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
from comtypes import CLSCTX_ALL
import comtypes
import ctypes

from libs.utils.settings import STATUS_PATH
from libs.utils.tools import read_json
import win32gui
import win32process
import psutil

import win32gui
import win32process
import psutil


def getProcesses(process_type: str = "frontend"):
    """
    获取进程列表，根据类型返回所有、前台或后台进程。

    :param process_type: 类型 (all, frontend, backend)
    :return: 满足条件的进程列表
    """
    if process_type not in {"all", "frontend", "backend"}:
        raise ValueError("Invalid type. Choose from 'all', 'frontend', 'backend'.")

    if process_type == "frontend":
        return _get_frontend_processes()


def _get_frontend_processes():
    """
    获取前台进程（可见窗口）。
    """
    windows_list = []
    win32gui.EnumWindows(_enum_windows_callback, windows_list)
    return windows_list


def _enum_windows_callback(hwnd, windows_info):
    """
    回调函数，用于枚举窗口信息。
    """
    if win32gui.IsWindowVisible(hwnd) and win32gui.GetWindowText(hwnd):
        pid = win32process.GetWindowThreadProcessId(hwnd)[1]  # 获取进程ID
        title = win32gui.GetWindowText(hwnd)  # 获取窗口标题
        try:
            process = psutil.Process(pid)
            exe_path = process.exe()  # 获取对应的可执行文件路径
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            exe_path = "Access Denied or Process Not Found"
        windows_info.append({"hwnd": hwnd, "pid": pid,"name":process.name(), "title": title, "path": exe_path})

def volume():
    # 初始化 COM
    comtypes.CoInitialize()
    try:
        devices = AudioUtilities.GetSpeakers()
        interface = devices.Activate(
            IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
        volume = interface.QueryInterface(IAudioEndpointVolume)

        # 获取音量
        current_volume = volume.GetMasterVolumeLevelScalar() * 100
        return int(current_volume)
    except BaseException as e:
        return 0
    finally:
        # 清理 COM
        comtypes.CoUninitialize()

def setVolume(data):
    # 初始化 COM
    comtypes.CoInitialize()
    try:
        devices = AudioUtilities.GetSpeakers()
        interface = devices.Activate(
            IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
        volume = ctypes.cast(interface, ctypes.POINTER(IAudioEndpointVolume))
        volume.SetMasterVolumeLevelScalar(data/100, None)
    except BaseException as e:
        pass
    finally:
        # 清理 COM
        comtypes.CoUninitialize()
    emit("setVolume", data, broadcast = True)

def clearStatus():
    files = glob(f'{STATUS_PATH}*')
    for file in files:
        os.remove(file)

def clearApps(ids=[]):
    if len(ids) == 0:
        files = glob(f'{STATUS_PATH}*')
        for file in files:
            app = read_json(file)
            if app['status'] not in ['running', 'stopping']:
                os.remove(file)
    else:
        for aid in ids:
            if os.path.exists(f'{STATUS_PATH}{aid}.json'):
                os.remove(f'{STATUS_PATH}{aid}.json')
    emit("clearApps", ids, broadcast = True)
