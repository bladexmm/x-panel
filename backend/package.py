# 打包编译后的文件
import os
# 删除system_apps
import shutil
import sqlite3
import subprocess

from libs.utils.settings import SOFTWARE_VERSION
from libs.utils.tools import delete_folder, copy, copy_dir, zipFolder

dist_folder = "./releases/build/main.dist"
venv_path = './venv'  # 假设你的虚拟环境在当前目录下的 venv 文件夹
python_executable = os.path.join(venv_path, 'Scripts', 'python.exe')  # Windows

import os
import shutil


def move_tools_to_destination(source_file, destination_folder):
    # 确保目标文件夹存在
    os.makedirs(destination_folder, exist_ok = True)

    # 构造目标文件路径
    destination_file = os.path.join(destination_folder, os.path.basename(source_file))

    # 如果目标文件已存在，先删除它
    if os.path.exists(destination_file):
        os.remove(destination_file)

    # 移动文件
    shutil.move(source_file, destination_file)  # move 会将文件移动到目标位置
    print(f"文件 {source_file} 已移动到 {destination_file}")


def clear_apps():
    # 数据库文件路径
    db_file_path = dist_folder + '/data/database.db'
    conn = sqlite3.connect(db_file_path)
    cursor = conn.cursor()
    sql_command = """
    DROP TABLE IF EXISTS system_apps;
    """
    cursor.execute(sql_command)
    conn.commit()
    cursor.close()
    conn.close()
    print("Table 'system_apps' has been dropped if it existed.")


def get_subfolders(directory):
    subfolders = [f.path for f in os.scandir(directory) if f.is_dir()]
    return subfolders


def delete_folder(directory):
    if os.path.exists(directory) and os.path.isdir(directory):
        shutil.rmtree(directory)
        print(f"The folder '{directory}' has been deleted.")
    else:
        print(f"The folder '{directory}' does not exist or is not a directory.")


def clear_tiny_pack():
    """
    精简版打包清理数据

    执行清理任务，包括删除特定文件和目录。
    这个函数首先定义了一个需要删除的文件列表，并检查每个文件是否存在，如果存在则删除。
    随后，它处理一个指定的目录，获取该目录下的所有子目录，并删除这些子目录。
    """
    # 定义需要删除的文件列表
    delete_files = [
        dist_folder + '/data/database.db'
    ]

    # 遍历文件列表，如果文件存在则删除
    for file in delete_files:
        if os.path.exists(file):
            os.remove(file)

    # 定义需要处理的目录
    directory = dist_folder + '/react_app/assets/wallpapers'
    # 获取并遍历该目录下的所有子目录，执行删除操作
    subfolders = get_subfolders(directory)
    for folder in subfolders:
        delete_folder(folder)
    print("壁纸已经删除")


def clear_full_pack():
    """
    执行完整打包 清理数据操作。
    这个函数会清理并重置指定的目录和文件，然后将默认资源复制到相应位置，
    以确保应用程序的数据和资源被正确地重置和更新。
    """
    # 确保备份目录存在
    if not os.path.exists(dist_folder + '/react_app/backup'):
        os.mkdir(dist_folder + '/react_app/backup')
    # 删除旧数据
    delete_folder(dist_folder + '/react_app/backup')
    delete_folder(dist_folder + '/react_app/img')
    delete_folder(dist_folder + '/react_app/assets/web')
    delete_folder(dist_folder + '/data/app')
    # 删除全局变量文件，如果存在
    if os.path.exists(dist_folder + '/data/globalVars.json'):
        os.remove(dist_folder + "/data/globalVars.json")

    # 复制数据库文件到指定位置，覆盖原有文件
    copy('default/data/database.db', dist_folder + '/data/database.db', True)
    # 清理应用程序数据
    clear_apps()
    # 复制资源文件夹到指定位置
    copy_dir('./default/assets', dist_folder + '/react_app/assets')
    copy_dir('./default/img', dist_folder + '/react_app/img')

    # 确保日志目录存在
    if not os.path.exists(dist_folder + '/logs'):
        os.mkdir(dist_folder + '/logs')
    print("清理完成")


def build_package(command, filename):
    """
    执行 Nuitka 打包命令
    """
    onefile = True if '--onefile' in command else False

    command = ' '.join(command)

    try:
        command += '& timeout /t 5 & exit'
        print(command)

        # 使用 start 命令打开新的命令提示符窗口并执行命令
        subprocess.run(['cmd', '/c', 'start', '/wait', 'cmd', '/c', command], shell = True)
        print("打包完成")

        releases_dir = './releases/build'
        if not os.path.exists(releases_dir):
            os.makedirs(releases_dir)

        # 移动 main.build 和 main.dist
        build_folder = f'{filename}.build'
        dist_folder = f'{filename}.dist'
        onefile_folder = f'{filename}.onefile-build'

        if os.path.exists(build_folder):
            destination = os.path.join(releases_dir, build_folder)
            if os.path.exists(destination):
                shutil.rmtree(destination)  # 删除整个目录及其内容

            shutil.move(build_folder, releases_dir)
            print(f"Moved {build_folder} to {releases_dir}")

        if os.path.exists(dist_folder):
            destination = os.path.join(releases_dir, dist_folder)
            if os.path.exists(destination):
                shutil.rmtree(destination)  # 删除整个目录及其内容

            shutil.move(dist_folder, releases_dir)
            print(f"Moved {dist_folder} to {releases_dir}")

        if not onefile:
            return

        if os.path.exists(onefile_folder):
            destination = os.path.join(releases_dir, onefile_folder)
            if os.path.exists(destination):
                shutil.rmtree(destination)  # 删除整个目录及其内容

            shutil.move(onefile_folder, os.path.join(releases_dir, onefile_folder))
            print(f"Moved {onefile_folder} to {releases_dir}")
    except subprocess.CalledProcessError as e:
        print(f"打包失败: {e}")


def build_tools_pack():
    command = [
        'nuitka', '--onefile',
        '--windows-company-name=bladexmm',
        '--windows-file-version=' + SOFTWARE_VERSION,
        '--windows-product-name=XBLADE-PANEL',
        '--windows-icon-from-ico=data/tools.ico',
        '--nofollow-imports',
        '--windows-console-mode=disable',
        '--jobs=4',
        '-o', 'tools',
        'tools.py'
    ]
    build_package(command, 'tools')
    # 使用示例
    source_file = "./tools.exe"  # 替换为实际的源文件路径
    destination_folder = "releases/build/main.dist"

    move_tools_to_destination(source_file, destination_folder)


def build_launcher_pack():
    command = [
        "nuitka", "--onefile",
        '--windows-icon-from-ico=data/blade.ico',
        "--windows-console-mode=disable",
        "client_launcher.py"
    ]
    build_package(command, 'client_launcher')
    # 使用示例
    source_file = "./client_launcher.exe"  # 替换为实际的源文件路径
    destination_folder = "releases/build/main.dist"

    move_tools_to_destination(source_file, destination_folder)


def build_main_package():
    command = [
        'nuitka', '--standalone',
        '--no-debug','--mingw64',
        '--windows-company-name=bladexmm',
        '--windows-file-version=' + SOFTWARE_VERSION,
        '--windows-product-name=XBLADE-PANEL',
        '--include-data-dir=data=data',
        '--include-data-dir=react_app=react_app',
        '--windows-icon-from-ico=data/blade.ico',
        '--windows-uac-admin',
        '--follow-imports',
        '--windows-console-mode=disable',
        '--plugin-enable=upx',
        '--include-package=flask',
        '--include-module=win32com',
        '-o', 'XBLADE',
        'main.py'
    ]
    build_package(command, 'main')
    build_tools_pack()
    build_launcher_pack()


def nsis_pack(filename):
    command = [
        'makensis', f"/DSoftwareVersion=V{SOFTWARE_VERSION}", './default/nsis/xblade.nsi'
    ]

    command = ' '.join(command)

    try:
        command += ' & timeout /t 5 & exit'
        print(command)
        # 使用 start 命令打开新的命令提示符窗口并执行命令
        subprocess.run(['cmd', '/c', 'start', '/wait', 'cmd', '/c', command], shell = True)
        print("打包完成")
        source_file = 'default/nsis/Setup.exe'
        target_dir = f'./releases/v{SOFTWARE_VERSION.replace(".", "_")}'
        target_file = os.path.join(target_dir, f'{filename}.exe')
        if os.path.exists(source_file):
            # 创建目标目录（如果不存在）
            os.makedirs(target_dir, exist_ok = True)

            # 移动并重命名文件，如果目标文件已存在则覆盖
            shutil.move(source_file, target_file)
            print(f"文件已移动并重命名为: {target_file}")

    except subprocess.CalledProcessError as e:
        print(f"打包失败: {e}")


def main():
    while True:
        options = ['nuitka package xblade', 'nsis setup pack', 'nsis update pack']
        for i in range(1, len(options) + 1):
            print(f"{i}. {options[i - 1]}")

        print("0 - Exit")

        choice = input("Enter the number of the function you want to execute: ")

        if choice == '0':
            print("Exiting...")
            exit()

        elif choice == '1':
            print("开始打包软件")
            build_main_package()
            print("主程序打包完成")

        elif choice == '2':
            print("开始清理数据")
            clear_full_pack()
            nsis_pack('setup')
            target_zip = f'./releases/v{SOFTWARE_VERSION.replace(".", "_")}/setup.zip'
            zipFolder(r'releases\build\main.dist',target_zip)
            print("安装包打包完成")

        elif choice == '3':
            print("开始清理数据")
            clear_tiny_pack()
            nsis_pack('update')
            target_zip = f'./releases/v{SOFTWARE_VERSION.replace(".", "_")}/update.zip'
            zipFolder(r'releases\build\main.dist',target_zip)
            print("更新包打包完成")


if __name__ == "__main__":
    main()
    # build_launcher_pack()