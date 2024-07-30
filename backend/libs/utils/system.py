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
