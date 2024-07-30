import io
import json
import base64
import hashlib
import shutil
import time
import os
import socket
import zipfile

import win32gui
import random
import string
import win32ui
import win32con
import pyautogui
import win32api
from PIL import Image
import subprocess
import platform
from datetime import datetime
from flask import jsonify

from libs.utils.settings import ALLOWED_EXTENSIONS


def read_json(file_path, encoding = 'utf-8'):
    if not os.path.exists(file_path):
        return None
    with open(file_path, 'r', encoding = encoding) as file:
        data = json.load(file)
    return data


def read_reg():
    pass


def read_txt(file_path, encoding = 'utf-8'):
    if not os.path.exists(file_path):
        return ''
    with open(file_path, 'r', encoding = encoding) as file:
        content = file.read()
        return content


def write_json(file, content, mode = 'w', encoding = 'utf-8'):
    dir_name = os.path.dirname(file)  # 获取目录名
    if not os.path.isdir(dir_name):
        os.makedirs(dir_name)
    with open(file, mode, encoding = encoding) as file:
        json.dump(content, file)


def list_to_dict(rows, key):
    new_arr = {}
    for row in rows:
        new_arr[row[key]] = row
    return new_arr


def image2base64(fileName, fileType = "png"):
    image = Image.open(fileName)  # 打开 PNG 文件
    data = image.tobytes()  # 转换为字节串
    encoded = base64.b64encode(data)  # 转换为 base64 编码的字节串
    encoded = encoded.decode()  # 转换为字符串
    return f"data:image/{fileType};base64,{encoded}"  # 返回 data URI


def generate_random_md5_with_timestamp():
    random_bytes = os.urandom(16)
    timestamp = str(time.time()).encode('utf-8')
    data_with_timestamp = random_bytes + timestamp
    md5_hash = hashlib.md5(data_with_timestamp)
    return md5_hash.hexdigest()


def generate_random_filename(length = 2):
    # 定义允许的字符集合
    characters = string.ascii_lowercase + string.digits
    # 生成随机字符串
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string


def generate_date_path():
    # 获取当前日期
    current_date = datetime.now()
    # 格式化日期为年/月/日
    formatted_date = current_date.strftime("%Y/%m/")
    return formatted_date


def extract_icon_from_exe(icon_in_path, icon_name, icon_out_path, out_width = 56, out_height = 56):
    """Given an icon path (exe file) extract it and output at the desired width/height as a png image.

    Args                      : 
    icon_in_path (string)     : path to the exe to extract the icon from
    icon_name (string)        : name of the icon so we can save it out with the correct name
    icon_out_path (string)    : final destination (FOLDER) - Gets combined with icon_name for full icon_path
    out_width (int, optional) : desired icon width
    out_height (int, optional): desired icon height

    Returns: 
    string : path to the final icon
    """

    ico_x = win32api.GetSystemMetrics(win32con.SM_CXICON)
    ico_y = win32api.GetSystemMetrics(win32con.SM_CYICON)

    large, small = win32gui.ExtractIconEx(icon_in_path, 0)
    win32gui.DestroyIcon(small[0])

    hdc = win32ui.CreateDCFromHandle(win32gui.GetDC(0))
    hbmp = win32ui.CreateBitmap()
    hbmp.CreateCompatibleBitmap(hdc, ico_x, ico_x)
    hdc = hdc.CreateCompatibleDC()

    hdc.SelectObject(hbmp)
    hdc.DrawIcon((0, 0), large[0])

    bmpstr = hbmp.GetBitmapBits(True)
    icon = Image.frombuffer(
        'RGBA',
        (32, 32),
        bmpstr, 'raw', 'BGRA', 0, 1
    )

    full_outpath = os.path.join(icon_out_path, "{}.png".format(icon_name))
    icon.resize((out_width, out_height))
    icon.save(full_outpath)
    return full_outpath


def check_file_or_directory(path):
    if os.path.exists(path):  # 先确认路径存在
        if os.path.isfile(path):
            return 'file'
        elif os.path.isdir(path):
            return "dir"
    else:
        return "no"


def open_with_default_program(file_path):
    system = platform.system()
    file_type = check_file_or_directory(file_path)
    try:
        if system == "Windows":
            if file_type == "file":
                subprocess.Popen([file_path], shell = True)
            elif file_type == "dir":
                os.system(f"start {file_path}")
            else:
                subprocess.Popen([file_path], shell = True)
        elif system == "Darwin":  # macOS
            os.system(f'open {file_path}')
        elif system == "Linux":
            os.system(f'xdg-open {file_path}')
        else:
            print("unsupport system")
    except Exception as e:
        print("open file error:", e)


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception as e:
        return None


def default_port():
    return 58433


def exe_name():
    return "XBLADE"


def result(code = 1, data = None, msg = "success"):
    return jsonify({"code": code, "data": data, "msg": msg})


def copy(source, dest, cover = False):
    if not os.path.exists(source):
        return
    dir_name = os.path.dirname(dest)  # 获取目录名
    if not os.path.isdir(dir_name):
        os.makedirs(dir_name)
    if cover:
        shutil.copy2(source, dest)
    else:
        shutil.copy(source, dest)


def copy_dir(source, dest):
    files = [file_name for file_name in get_files_in_directory(source)]
    for file in files:
        dist = file.replace(source, dest)
        copy(file, dist, cover = True)
    return files


def zipFolder(folder_path, zip_name):
    dir_name = os.path.dirname(zip_name)
    if not os.path.isdir(dir_name):
        os.makedirs(dir_name)
    with zipfile.ZipFile(zip_name, 'w') as zipf:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                zipf.write(file_path, os.path.relpath(file_path, folder_path))


def delete_folder(temp_folder):
    for filename in os.listdir(temp_folder):
        file_path = os.path.join(temp_folder, filename)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f"can not delete: {file_path}: {e}")


def format_date(format = "%Y-%m-%d_%H-%M-%S"):
    now = datetime.now()
    return now.strftime(format)


def unzip_file(zip_file_path, extract_to_path):
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to_path)


def get_files_in_directory(directory):
    # 遍历指定目录及其子目录
    for root, dirs, files in os.walk(directory):
        # 我们只对文件感兴趣，所以忽略dirs
        for file in files:
            # os.walk返回的是相对路径，我们可以直接获取文件名
            yield os.path.join(root, file)


def copy_app_images(apps):
    for app in apps:
        if (app['icon'] is not None and not app['icon'].startswith('{') and '?region=' not in app['icon'] and
                not app['icon'].startswith('http') and not app['icon'].startswith('//')):
            copy("./react_app" + app['icon'], "./temp/images" + app['icon'])
        if app['type'] == 'command' and app['path'] is not None:
            nodes = json.loads(app['path'])
            for node in nodes['nodes']:
                if 'image' in node['properties']:
                    copy("./react_app" + node['properties']['image'], "./temp/images" + node['properties']['image'])


def sanitize_filename(filename):
    # 定义非法字符集
    illegal_chars = set(string.punctuation + '\t\n\r\v\f')
    # 对于Windows，额外去除以下字符
    windows_illegal_chars = {'\\', '/', ':', '*', '?', '"', '<', '>', '|'}
    illegal_chars.update(windows_illegal_chars)

    # 替换非法字符为空格
    filename = ''.join(char if char not in illegal_chars else ' ' for char in filename)

    # 移除开头的点号（.）
    filename = filename.lstrip('.')

    # 返回清理过的文件名
    return filename


def has_intersection(list1, list2):
    # 将列表转换为集合
    set1 = set(list1)
    set2 = set(list2)

    # 使用集合的交集方法 '&' 来找出两个集合中的公共元素
    intersection = set1 & set2

    # 如果交集不为空，说明两个列表有交集
    return bool(intersection)


def prt(line, sign):
    signLine = ""
    for a in range(20):
        signLine += sign
    print(signLine)
    print(line)
    print(signLine)


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def resize_image(image, size):
    img = Image.open(io.BytesIO(image))
    img = img.resize(size)

    new_img = io.BytesIO()
    img.save(new_img, format = 'JPEG')  # Use the detected format
    new_img.seek(0)
    return new_img.read()
