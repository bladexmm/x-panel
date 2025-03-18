import os
import subprocess
import time
import psutil
import winreg


def is_registry_startup(params):
    # 定义要检查的注册表路径和键名
    registry_path = r'SOFTWARE\Microsoft\Windows\CurrentVersion\Run'
    key_name = 'XbladePanel'

    try:
        # 打开注册表项
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, registry_path) as key:
            try:
                # 尝试读取指定键名的值
                value = winreg.QueryValueEx(key, key_name)
                print(f"找到注册表项: {key_name}，值为: {value[0]}")
                return True
            except FileNotFoundError:
                # 如果键不存在
                print(f"未找到注册表项: {key_name}")
                return False
    except PermissionError:
        print("权限错误: 请以管理员身份运行此脚本")
        return False


def get_startup_registry():
    if is_registry_startup([]):
        # 定义要检查的注册表路径和键名
        registry_path = r'SOFTWARE\Microsoft\Windows\CurrentVersion\Run'
        key_name = 'XbladePanel'

        try:
            # 打开注册表项
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, registry_path) as key:
                try:
                    # 尝试读取指定键名的值
                    value = winreg.QueryValueEx(key, key_name)
                    print(f"找到注册表项: {key_name}，值为: {value[0]}")
                    return value[0]
                except BaseException as e:
                    # 如果键不存在
                    print(f"未找到注册表项: {e}")
                    return False
        except BaseException as e:
            print(f"Error reading registry value: {e}")
            return False
    return False


def launch_application():
    path = get_startup_registry()
    project_path = path.replace("client_launcher.exe", "")
    program_path = project_path + "XBLADE.exe"
    try:
        subprocess.Popen([program_path], shell = True, cwd = os.path.dirname(project_path))
        # 监控是否启动成功
        for a in range(10):
            # 检查所有进程
            for proc in psutil.process_iter(['pid', 'name']):
                # 如果找到XBLADE.exe进程，退出此脚本
                if proc.info['name'] == 'XBLADE.exe':
                    print("XBLADE.exe 启动成功，退出脚本")
                    time.sleep(5)
                    return
            # 暂停1秒钟，避免无限循环占用CPU
            time.sleep(3)

    except Exception as e:
        print(f"出现错误: {e}")
    return


launch_application()
