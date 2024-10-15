# 打包编译后的文件
import os
# 删除system_apps
import shutil
import sqlite3
from libs.utils.tools import delete_folder, copy, copy_dir
import argparse


def clear_apps():
    # 数据库文件路径
    db_file_path = 'main.dist/data/database.db'
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
        'main.dist/data/database.db'
    ]

    # 遍历文件列表，如果文件存在则删除
    for file in delete_files:
        if os.path.exists(file):
            os.remove(file)

    # 定义需要处理的目录
    directory = 'main.dist/react_app/assets/wallpapers'
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
    if not os.path.exists('./main.dist/react_app/backup'):
        os.mkdir('./main.dist/react_app/backup')
    # 删除旧数据
    delete_folder('./main.dist/react_app/backup')
    delete_folder('./main.dist/react_app/img')
    delete_folder('./main.dist/react_app/assets/web')
    delete_folder('./main.dist/data/app')
    # 删除全局变量文件，如果存在
    if os.path.exists('./main.dist/data/globalVars.json'):
        os.remove("./main.dist/data/globalVars.json")

    # 复制数据库文件到指定位置，覆盖原有文件
    copy('default/data/database.db', './main.dist/data/database.db', True)
    # 清理应用程序数据
    clear_apps()
    # 复制资源文件夹到指定位置
    copy_dir('./default/assets', './main.dist/react_app/assets')
    copy_dir('./default/img', './main.dist/react_app/img')

    # 确保日志目录存在
    if not os.path.exists('./main.dist/logs'):
        os.mkdir('./main.dist/logs')
    print("清理完成")


def main():
    while True:
        # print("Enter the number of the function you want to execute:\n")
        options = ['clear data to full pack', 'clear data to tiny pack']
        for i in range(1, len(options) + 1):
            print(f"{i}. {options[i-1]}")

        print("0 - Exit")

        choice = input("Enter the number of the function you want to execute: ")

        if choice == '0':
            print("Exiting...")
            exit()
        elif choice == '1':
            print('开始清理完整打包数据')
            clear_full_pack()
        elif choice == '2':
            print('开始清理精简打包数据')
            clear_tiny_pack()


if __name__ == "__main__":
    main()