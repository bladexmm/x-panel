# 默认html文件位置
HTML_PATH = "react_app"
SOFTWARE_VERSION = "2.3.0"
# 默认上传图片存放位置
IMAGE_PATH = f"{HTML_PATH}/img"

# 自动识别网页所用UA
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
# 下载图片时最大线程数
MAX_DOWNLOAD_IMG_WORK = 10
# 日志记录配置
LOG_LEVEL = {
    "DEBUG"   : True,
    "INFO"    : True,
    "WARNING" : True,
    "ERROR"   : True,
    "CRITICAL": True
}
# app 状态路径
STATUS_PATH = './data/status/'

# 允许压缩显示的文件格式
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4'}

# 最大允许的节点数量
MAX_NODE_RUN = 2000