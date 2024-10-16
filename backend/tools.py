import argparse
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
    exe = "./XBLADE.exe"
    if args.run:
        """运行应用"""
        print(f"run：{args.run}")
        if is_admin():
            print("当前是管理员权限，直接运行你的 .exe 文件")
            # 如果已经是管理员权限，运行你的 .exe 文件
            os.system(exe)
        else:
            print("当前不是管理员权限，重新启动以获取管理员权限")
            # 如果不是管理员权限，则重新启动并以管理员权限运行
            ctypes.windll.shell32.ShellExecuteW(None, "runas", exe, None, None, 1)
    exit()


if __name__ == "__main__":
    main()

    print('test')



