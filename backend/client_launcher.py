import subprocess
import time
import psutil


def launch_application():
    try:
        # 启动XBLADE.exe，并使用runas以管理员权限运行
        process = subprocess.Popen(['runas', '/user:Administrator', 'XBLADE.exe'], shell = True)
        print("启动 XBLADE.exe ...")

        # 监控是否启动成功
        while True:
            # 检查所有进程
            for proc in psutil.process_iter(['pid', 'name']):
                # 如果找到XBLADE.exe进程，退出此脚本
                if proc.info['name'] == 'XBLADE.exe':
                    print("XBLADE.exe 启动成功，退出脚本")
                    return

            # 暂停1秒钟，避免无限循环占用CPU
            time.sleep(1)

    except Exception as e:
        print(f"出现错误: {e}")


if __name__ == '__main__':
    launch_application()
