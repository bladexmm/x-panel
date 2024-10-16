import argparse
import subprocess
import webbrowser
import urllib.parse
import ctypes
import os


def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False


def main():
    parser = argparse.ArgumentParser(description = "工具描述")
    parser.add_argument('--add', type = str, help = "传入的文件路径")
    parser.add_argument('--run', type = str, help = "传入的文件路径")

    args = parser.parse_args()

    if args.add:
        """添加应用"""
        # 拼接 URL
        encoded_path = urllib.parse.quote(args.add)
        # 拼接 URL
        url = f"http://localhost:58433/?addAppOpen=1&path={encoded_path}"  # 打开浏览器并跳转到指定 URL
        webbrowser.open(url)
        print(f"浏览器已跳转到: {url}")

    if args.run:
        """运行应用"""
        # 使用 subprocess.Popen 来启动进程，并立即退出脚本
        subprocess.Popen(["XBLADE.exe"], shell = True)
    exit()


if __name__ == "__main__":
    main()

    print('test')



