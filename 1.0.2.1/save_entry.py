#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import cgi
import json

def save_file(filename, content):
    """保存文件到当前目录"""
    try:
        # 获取当前脚本所在目录
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # 拼接完整文件路径
        file_path = os.path.join(script_dir, filename)
        
        # 写入文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True, f"文件已保存到: {file_path}"
    except Exception as e:
        return False, f"保存失败: {str(e)}"

# 设置响应头
print("Content-Type: application/json; charset=utf-8")
print()

# 获取POST数据
try:
    form = cgi.FieldStorage()
    
    # 获取文件名和内容
    filename = form.getvalue('filename', '')
    content = form.getvalue('content', '')
    
    if not filename or not content:
        print(json.dumps({"success": False, "message": "缺少文件名或内容"}))
        exit()
    
    # 保存文件
    success, message = save_file(filename, content)
    
    # 返回结果
    print(json.dumps({"success": success, "message": message}))
    
except Exception as e:
    print(json.dumps({"success": False, "message": f"处理请求失败: {str(e)}"}))
