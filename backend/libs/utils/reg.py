import winreg
import os

from libs.utils.tools import default_port, exe_name


def get_project_path():
    return os.getcwd()


def registry_entries(path):
    try:
        # 打开注册表项
        key = winreg.OpenKey(winreg.HKEY_CLASSES_ROOT, path)
        entries = []
        # 获取子项
        for i in range(winreg.QueryInfoKey(key)[0]):
            entry_name = winreg.EnumKey(key, i)
            entries.append(entry_name)
        winreg.CloseKey(key)
        return entries
    except Exception as e:
        print("Error:", e)
        return []


def delete_registry(key_path, reg_key = winreg.HKEY_CLASSES_ROOT):
    try:
        # 打开注册表项
        key = winreg.OpenKey(reg_key, key_path, 0, winreg.KEY_ALL_ACCESS)
        # 递归删除子项和值
        winreg.DeleteKey(key, "")
        winreg.CloseKey(key)
        print(f"Deleted registry key: {key_path}")
    except Exception as e:
        print(f"Error deleting registry key {key_path}: {e}")


def delete_register_key(key_path, value_name, root_key = winreg.HKEY_CLASSES_ROOT):
    try:
        with winreg.ConnectRegistry(None, root_key) as hkey:
            with winreg.OpenKey(hkey, key_path, 0, winreg.KEY_ALL_ACCESS) as sub_key:
                i = 0
                while True:
                    try:
                        value_tuple = winreg.EnumValue(sub_key, i)
                        if value_tuple[0] == value_name:
                            winreg.DeleteValue(sub_key, value_name)
                            return
                        i += 1
                    except OSError:
                        # 没有更多的值时会引发OSError异常，此时退出循环
                        break
    except Exception as e:
        print(f'error: {e}')


def registry_values(key_path, reg_key = winreg.HKEY_CLASSES_ROOT):
    vReg = []
    try:
        # 打开注册表项
        key = winreg.OpenKey(reg_key, key_path, 0, winreg.KEY_READ)

        # 获取默认值
        default_value, _ = winreg.QueryValueEx(key, "")
        # 获取其他值
        num_values = winreg.QueryInfoKey(key)[1]
        for i in range(num_values):
            value_name = winreg.EnumValue(key, i)[0]
            value_data, _ = winreg.QueryValueEx(key, value_name)
            vReg.append({'name': value_name, 'data': value_data})
        winreg.CloseKey(key)
    except Exception as e:
        print(f"Error getting registry values for {key_path}: {e}")
    return vReg


def create_registry_key(key_path, key_name, value = None, value_data = None, reg_key = winreg.HKEY_CLASSES_ROOT):
    try:
        # 打开或创建父键
        parent_key = winreg.OpenKey(reg_key, key_path, 0, winreg.KEY_WRITE)
        # 创建子键
        new_key = winreg.CreateKeyEx(parent_key, key_name)
        if value is not None and value_data is not None:
            # 设置默认值
            winreg.SetValueEx(new_key, value, 0, winreg.REG_SZ, value_data)
        winreg.CloseKey(new_key)
        winreg.CloseKey(parent_key)
        print(f"Registry key {key_name} created successfully.")
    except Exception as e:
        print(f"Error creating registry key {key_name}: {e}")


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

def switch_startup_registry():
    if is_registry_startup([]):
        remove_auto_start_key()
    else:
        registry_auto_start_key()


def registry_auto_start_key():
    project_path = get_project_path()
    filename = exe_name()
    create_registry_key(r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run", "", value = "XbladePanel",
                        value_data = rf'{project_path}\client_launcher.exe', reg_key = winreg.HKEY_CURRENT_USER)


def remove_auto_start_key():
    delete_register_key(r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run", "XbladePanel", winreg.HKEY_CURRENT_USER)


def add_reg():
    project_path = get_project_path()
    filename = exe_name()
    port = default_port()
    # 新增到文件的右键菜单
    create_registry_key(r"*\shell", "Upload to xblade", value = "", value_data = "添加到X-BLADE面板")
    create_registry_key(r"*\shell\Upload to xblade", "", value = "Icon",
                        value_data = rf"{project_path}\{filename}.exe")
    create_registry_key(r"*\shell\Upload to xblade", "command", value = "",
                        value_data = rf'"{project_path}\tools.exe" --add "%1"')

    # 新增到文件夹的右键菜单
    create_registry_key(r"Directory\shell", "Upload to xblade", value = "", value_data = "添加到X-BLADE面板")
    create_registry_key(r"Directory\shell\Upload to xblade", "", value = "Icon",
                        value_data = rf"{project_path}\{filename}.exe")
    create_registry_key(r"Directory\shell\Upload to xblade", "command", value = "",
                        value_data = rf'"{project_path}\tools.exe" --add "%1"')

    # 新增到空白地方的右键菜单
    create_registry_key(r"Directory\Background\shell", "Upload to xblade", value = "",
                        value_data = "添加到X-BLADE面板")
    create_registry_key(r"Directory\Background\shell\Upload to xblade", "", value = "Icon",
                        value_data = rf"{project_path}\{filename}.exe")
    create_registry_key(r"Directory\Background\shell\Upload to xblade", "command", value = "",
                        value_data = rf'"{project_path}\tools.exe" --add "%1"')


def remove_reg():
    # 删除文件右键菜单项
    delete_registry(r"*\shell\Upload to xblade")
    # 删除文件夹右键菜单项
    delete_registry(r"Directory\shell\Upload to xblade")
    # 删除空白地方右键菜单项
    delete_registry(r"Directory\Background\shell\Upload to xblade")
