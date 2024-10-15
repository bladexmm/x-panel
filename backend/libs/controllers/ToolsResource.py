import json
import os
import time

from flask_restful import Resource, reqparse

from libs.model.Apps import Apps
from libs.model.Layouts import Layouts
from libs.model.models import db
from libs.service import generate_video, getWallpapers, uploadFile
from libs.utils import system
from libs.utils.LiteGraph import LiteGraph
from libs.utils.installedApps import init_windows_apps, windows_apps_all
from libs.utils.log import Logger
from libs.utils.settings import STATUS_PATH
from libs.utils.system import clearStatus
from libs.utils.tools import read_json, result, copy, zipFolder, format_date, delete_folder, unzip_file, copy_dir, \
    copy_app_images, list_to_dict, generate_random_filename
from flask import Response, request

from libs.utils.website import md5
from glob import glob


class ToolsResource(Resource):
    def post(self):
        pass


class CMDResource(Resource):
    def get(self):
        rows = read_json('./data/commands.json')
        return result(1, {'commands': rows}, 'success')

    def post(self):
        cmd = request.form.get('cmd', '{}')
        cmd = json.loads(cmd)
        app = {
            'id'  : 'debug',
            'name': '调试脚本',
            'path': cmd
        }
        dg = LiteGraph(app, None, {"type": "CMDStart", "slot": "out"})
        data = dg.getStatus()
        if data == False:
            return result(0, '正在执行中', 'opened')
        # logs = dg.execute()
        logs = []
        try:
            logs = dg.execute()
        except BaseException as e:
            Logger.info(f"Node Error:{e}")
        dg.initStatus('执行完成', 'exit')
        return result(1, logs, 'success')


class StreamResource(Resource):
    def get(self):
        region = request.args.get('region')
        if region is None:
            region = [0, 0, 0, 0]
        else:
            region = region.split(',')
            region = [int(row) for row in region]
        return Response(generate_video(region), mimetype = 'multipart/x-mixed-replace; boundary=frame')


class WallpaperResource(Resource):
    def get(self):
        return getWallpapers()

    def post(self):
        absolute_path = os.path.abspath('./react_app/assets/wallpapers/')
        os.system(f"start {absolute_path}")
        # script_dir = os.path.dirname(os.path.abspath(__file__))
        # absolute_path = os.path.join(script_dir, 'react_app/assets/wallpapers/')
        # os.system(f'start {absolute_path}')
        return result(1, '', '打开文件夹成功')


class UploadResource(Resource):

    def post(self):
        return uploadFile()


class ScriptResource(Resource):
    def post(self):
        return uploadFile("img/")


class BackupResource(Resource):
    def get(self):
        """
        执行数据库备份和应用程序图片复制，并创建一个压缩存档文件。

        此函数完成以下任务：
        1. 从数据库中查询所有应用（Apps）并将其转换为字典形式。
        2. 复制所有应用的图片文件。
        3. 复制数据库文件以确保备份数据的完整性。
        4. 将指定文件夹下的内容压缩为ZIP文件，以方便存储或传输。
        5. 删除临时文件夹以清理空间并保持环境整洁。
        """
        # 创建一个数据库会话
        db_session = db.session
        
        # 查询所有Apps实体
        apps = db_session.query(Apps).all()
        
        # 将查询到的Apps实体转换为字典形式的列表
        apps = [app.to_dict() for app in apps]
        
        # 复制图片
        copy_app_images(apps)
        
        # 复制数据库文件到备份位置
        copy('./data/database.db', './temp/database.db')
        
        # 定义备份文件的路径和名称
        zipFile = f"/backup/backup_{format_date()}.zip"
        
        # 压缩指定文件夹下的内容到ZIP文件
        zipFolder('./temp/', f'./react_app{zipFile}')
        
        # 删除临时文件夹及其内容
        delete_folder('./temp')
        
        # 返回备份结果信息
        return result(data = zipFile, msg = '备份成功')

    def delete(self):
        """
        删除备份文件夹中的所有内容，并返回删除结果的信息。
        
        该方法用于清空特定备份文件夹中的所有数据，主要用于数据清理或准备阶段，
        确保备份目录是空的，以便进行新的备份或初始化环境。
        
        :return: 返回一个包含结果信息的字典，data键为空字符串，msg键为清空完成的信息。
        """
        delete_folder('./react_app/backup')  # 调用delete_folder函数来删除'react_app/backup'文件夹中的所有内容
        return result(data = "", msg = '清空完成')  # 返回结果，表示清空操作已经完成

    def put(self):
        zip_file = uploadFile('backup/', 'other')
        unzip_file(zip_file, './temp')
        copy('./temp/database.db', './data/database.db', True)  # 复制文件
        files = copy_dir('./temp/images', './react_app')
        delete_folder('./temp')
        return result(data = files, msg = "恢复成功")


class TestResource(Resource):
    def get(self):
        """
        获取当前时间并返回一个结果对象

        返回:
            result对象: 包含当前时间的数据和一个表示成功的消息
        """
        return result(data = time.time(), msg = "success")


class ImportAppsResource(Resource):

    """
    导入系统已经安装的应用
    """
    def get(self):
        init_windows_apps()
        clearStatus()
        windows_apps = windows_apps_all()
        return result(data = windows_apps, msg = "success")


class ImportResource(Resource):
    def put(self):
        layout_open = request.form.get('layout', 'pane')
        zip_file = uploadFile('backup/', 'other')
        unzip_file(zip_file, './temp')
        files = copy_dir('./temp/images', './react_app')
        apps = read_json('./temp/apps.json')
        first_app_id = apps[0]['id']
        apps_dict = list_to_dict(apps, 'id')
        apps_add = []
        for app in apps:
            current_timestamp = time.time()
            app_id = app['id']
            apps_dict[app['id']]['id'] = md5(f"{generate_random_filename(12)}|{current_timestamp}")
            pid = None
            if app['pid'] is not None:
                pid = apps_dict[app['pid']]['id'] if app['pid'] in apps_dict else None
            app_new = Apps(
                id = apps_dict[app_id]['id'],
                pid = pid,
                name = app['name'],
                icon = app['icon'],
                pinyin = app['pinyin'],
                path = app['path'],
                type = app['type'],
            )
            apps_add.append(app_new)
        db.session.add_all(apps_add)
        layouts = read_json('./temp/layouts.json')
        layouts_add = []
        layouts_ids = []
        for layout in layouts:
            app_id = apps_dict[layout['i']]['id']
            layout_name = layout['name']
            if len(layout['name']) >= 30:
                layout_name = apps_dict[layout['name']]['id'] if layout['name'] in apps_dict else 'pane'

            if first_app_id == layout['i']:
                layout_name = layout_open
            if md5(f"{layout_name}|{app_id}") in layouts_ids:
                continue
            layouts_ids.append(md5(f"{layout_name}|{app_id}"))
            layout_new = Layouts(
                id = md5(f"{layout_name}|{app_id}"),
                name = layout_name,
                i = app_id,
                x = layout['x'],
                y = layout['y'],
                w = layout['w'],
                h = layout['h'],
            )
            layouts_add.append(layout_new)
        db.session.add_all(layouts_add)
        db.session.commit()
        delete_folder('./temp')
        return result(data = files, msg = "导入成功")


class ControlCenterResource(Resource):
    def get(self):
        def generate():
            while True:
                data = {
                    "apps"  : [],
                    "system": {
                        "volume": system.volume()
                    }
                }
                files = glob(f'{STATUS_PATH}*')
                running = []
                apps = []
                for file in files:
                    app = read_json(file)
                    if app['status'] == 'running':
                        running.append(app)
                    else:
                        apps.append(app)

                data['apps'] = running + apps
                yield f"data: {json.dumps(data, ensure_ascii = False)} \n\n"
                time.sleep(1)

        return Response(generate(), mimetype = "text/event-stream")
