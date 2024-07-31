rm -rf /www/wwwroot/x-panel-master/backend/react_app/backup
rm -rf /www/wwwroot/x-panel-master/backend/react_app/img
rm -rf /www/wwwroot/x-panel-master/backend/react_app/assets/web
rm -rf /www/wwwroot/x-panel-master/backend/data/app



# 创建需要的目录结构
mkdir -p /www/wwwroot/x-panel-master/backend/react_app/backup
mkdir -p /www/wwwroot/x-panel-master/backend/react_app/img
mkdir -p /www/wwwroot/x-panel-master/backend/react_app/assets/web
mkdir -p /www/wwwroot/x-panel-master/backend/data/app


# 更改目录的所有者为 www
chown -R www:www /www/wwwroot/x-panel-master/backend/react_app/backup
chown -R www:www /www/wwwroot/x-panel-master/backend/react_app/img
chown -R www:www /www/wwwroot/x-panel-master/backend/react_app/assets/web
chown -R www:www /www/wwwroot/x-panel-master/backend/data/app


# 复制文件和目录
cp /www/wwwroot/x-panel-master/backend/default/data/database.db /www/wwwroot/x-panel-master/backend/data/database.db
cp -r /www/wwwroot/x-panel-master/backend/default/assets /www/wwwroot/x-panel-master/backend/react_app/assets
cp -r /www/wwwroot/x-panel-master/backend/default/img /www/wwwroot/x-panel-master/backend/react_app/img

echo "Files and directories have been deleted and copied successfully."