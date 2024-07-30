import io
import os
import time

from flask_restful import Api
from flask_cors import CORS
from flask_socketio import SocketIO, emit,send
from flask import Flask, request, send_from_directory

import pystray
import threading
import webbrowser
from PIL import Image
from pystray import MenuItem, Menu

from libs import router
from libs.model.models import db
from libs.service import systemInfo
from libs.utils.installedApps import init_windows_apps
from libs.utils.system import clearStatus
from libs.utils.tools import allowed_file, get_local_ip, default_port, resize_image

app = Flask(__name__, static_folder = 'react_app/')
api = Api(app)
data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(data_dir, "database.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
db.init_app(app)
current_file = os.path.abspath(__file__)
current_dir = os.path.dirname(current_file)
cors = CORS(app, resources = {r"/api/*": {"origins": "*"}})
socket = SocketIO(app, cors_allowed_origins = "*")


@socket.on('connect')
def test_connect():
    emit('test-msg',
         {'data': 'Print this out via data.data in your client'})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        # 检查文件扩展名
        if allowed_file(path):
            file_path = os.path.join(app.static_folder, path)
            # 检查URL是否有size参数
            size = request.args.get('size')
            if size:
                width, height = map(int, size.split('x'))
                # 图片处理
                if path.endswith(('png', 'jpg', 'jpeg', 'gif')):
                    with open(file_path, 'rb') as f:
                        image_data = f.read()
                    resized_image = resize_image(image_data, (width, height))
                    return resized_image, 200, {'Content-Type': 'image/jpeg'}
                
                # MP4处理（这里可以添加视频缩放/转换逻辑）
                elif path.endswith('mp4'):
                    pass  # 这里需要一个视频处理函数
                    
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/system/<info>', methods = ['GET', 'POST'])
def system_config(info):
    return systemInfo(info)


for resource, route in router.resources:
    api.add_resource(resource, route)

for event, handler in router.event_handlers:
    socket.on_event(event, handler)

with app.app_context():
    db.create_all()
    # init_windows_apps()


def init_app():
    with app.app_context():
        init_windows_apps()
        clearStatus()

def windows():
    host = get_local_ip()
    port = default_port()

    def quit_window(shortIcon: pystray.Icon):
        shortIcon.stop()
        flask_App.join(timeout = 1)

    def open_panel():
        webbrowser.open(f'http://{host}:{port}')

    def run_flask():
        try:
            # 确保Flask应用能够独立于Tkinter运行
            socket.run(app = app, host = "0.0.0.0", port = port, allow_unsafe_werkzeug = True)
        except Exception as e:
            print(f"Flask app failed to start: {e}")

    menu = (
        MenuItem('打开面板', open_panel, default = True),
        Menu.SEPARATOR,
        MenuItem('退出软件', quit_window),
    )
    # 继续使用系统托盘图标
    image = Image.open("data/blade.png")
    icon = pystray.Icon("data/blade.ico", image, "XBlade", menu)
    icon.menu = menu
    flask_App = threading.Thread(target = run_flask, daemon = True)
    threading.Thread(target = init_app, daemon = True).start()
    flask_App.start()
    open_panel()
    icon.run()


if __name__ == "__main__":
    windows()
    # clearStatus()
    # socket.run(app = app, host = "0.0.0.0", port = default_port(), debug = True, allow_unsafe_werkzeug = True)
    # socket.run(app = app, host = "0.0.0.0", port = default_port(), allow_unsafe_werkzeug = True)
