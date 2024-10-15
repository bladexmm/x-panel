import argparse
import webbrowser
import urllib.parse

def main():
    parser = argparse.ArgumentParser(description="工具描述")
    parser.add_argument('--add', type=str, help="传入的文件路径")
    
    args = parser.parse_args()
    
    if args.add:
        """添加应用"""
        # 拼接 URL
        encoded_path = urllib.parse.quote(args.add)
        # 拼接 URL
        url = f"http://localhost:58433/?addAppOpen=1&path={encoded_path}"        # 打开浏览器并跳转到指定 URL
        webbrowser.open(url)
        print(f"浏览器已跳转到: {url}")
    exit()

if __name__ == "__main__":
    main()
