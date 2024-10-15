from libs.utils.installedApps import init_windows_apps
from libs.utils.system import clearStatus
import os
def init_app():
    init_windows_apps()
    clearStatus()

init_app()