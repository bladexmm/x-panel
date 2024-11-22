from libs.controllers.AppsResource import AppsResource, OpenResource, FetchResource, ShareResource, StopApp
from libs.controllers.IconResource import IconResource
from libs.controllers.LayoutsResource import LayoutsResource, SaveResource
from libs.controllers.SystemResource import WindowsResource
from libs.controllers.ToolsResource import CMDResource, ControlCenterResource, StreamResource, TestResource, \
    WallpaperResource, UploadResource, \
    ScriptResource, BackupResource, ImportResource, ImportAppsResource
from libs.utils.system import clearApps, setVolume

resources = (
    (CMDResource, '/api/tools/commands'),
    (StreamResource, '/api/tools/stream'),
    (WallpaperResource, '/api/tools/wallpaper'),
    (BackupResource, '/api/tools/backup'),
    (ImportResource, '/api/tools/import'),
    (TestResource, '/api/tools/test'),
    (ControlCenterResource, '/api/tools/control'),
    (ImportAppsResource, '/api/tools/apps'),

    (WindowsResource, '/api/system/windows'),

    (UploadResource, '/api/upload/image'),
    (ScriptResource, '/api/upload/script'),

    (LayoutsResource, '/api/layouts'),
    (SaveResource, '/api/layouts/save'),

    (AppsResource, '/api/apps'),
    (OpenResource, '/api/apps/open'),
    (FetchResource, '/api/apps/fetch'),
    (ShareResource, '/api/apps/share'),
    (StopApp, '/api/apps/stop'),
    (IconResource, '/api/icon')

)

event_handlers = [
    ('setVolume',setVolume),
    ('clearApps',clearApps),
]
