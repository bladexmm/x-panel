import subprocess
import time
import webbrowser
from string import Template

import pyautogui

from libs.utils.nodes.base import alias, nodeOutput, getInput


@alias("自动化/图片定位(LocateOnScreenNode)")
def LocateOnScreenNode(node):
    # 判断是否有外部图片输入
    if getInput(node['inputs'], 1):
        image_path = 'react_app' + node['inputs'][1]['value']
    else:
        image_path = 'react_app' + node['properties']['image']
    try:
        x, y = pyautogui.locateCenterOnScreen(
            image_path,
            minSearchTime = node['properties']['searchTime'],
            grayscale = node['properties']['grayscale'],
            confidence = round(node['properties']['confidence'], 2))
    except pyautogui.ImageNotFoundException:
        return nodeOutput(1, node, 'error', '')
    return nodeOutput(1, node, 'out', [[], [int(x), int(y)]])


@alias("自动化/查找图片(FindImage)")
def FindImage(node):
    start_time = time.time()
    search_time = int(node['properties']['searchTime'])
    while time.time() - start_time < search_time:
        idx = -1
        for node_input in node['inputs']:
            idx += 1
            if node_input.get('value', '') == '' or node_input['value'] is None:
                continue
            image_path = 'react_app' + node_input['value']
            try:
                x, y = pyautogui.locateCenterOnScreen(
                    image_path,
                    grayscale = node['properties']['grayscale'],
                    confidence = round(node['properties']['confidence'], 2))
                return nodeOutput(1, node, str(idx), ['',[int(x), int(y)]])
            except pyautogui.ImageNotFoundException:
                pass
    return nodeOutput(1, node, 'error', '')


@alias("自动化/运行软件(startApp)")
def StartApp(node):
    app = node['properties']['app']
    folder = node['properties']['folder']
    if node['parent'] is not None:
        templ = Template(app)
        app = templ.safe_substitute(**node['parent'])
    subprocess.Popen([app, folder])
    return nodeOutput(1, node, 'out', '')


@alias("自动化/打开链接(openLink)")
def openLink(node):
    link = getInput(node['inputs'], 1)
    if link is not None:
        webbrowser.open(link)
    return nodeOutput(1, node, 'out', [''])
