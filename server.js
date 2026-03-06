const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// 设置服务器端口
const PORT = 8080;

// 网站根目录
const rootDir = path.join(__dirname);

// 处理文件保存的函数
function handleFileSave(req, res) {
    let body = '';
    
    // 接收POST数据
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            // 解析POST数据
            const contentType = req.headers['content-type'] || '';
            
            let parsedBody;
            if (contentType.startsWith('multipart/form-data')) {
                // 处理multipart/form-data格式
                parsedBody = parseMultipartFormData(body, contentType);
            } else {
                // 处理application/x-www-form-urlencoded格式
                parsedBody = querystring.parse(body);
            }
            
            // 获取文件名和内容
            const filename = parsedBody.filename || '';
            const content = parsedBody.content || '';
            
            if (!filename || !content) {
                throw new Error('缺少文件名或内容');
            }
            
            // 保存文件到网站根目录
            const filePath = path.join(rootDir, filename);
            fs.writeFileSync(filePath, content, 'utf8');
            
            // 返回成功响应
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify({
                success: true,
                message: `文件已保存到: ${filePath}`
            }));
            
        } catch (error) {
            // 返回错误响应
            res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify({
                success: false,
                message: `保存失败: ${error.message}`
            }));
        }
    });
}

// 解析multipart/form-data格式的辅助函数
function parseMultipartFormData(body, contentType) {
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) {
        throw new Error('无法找到boundary');
    }
    
    const boundary = `--${boundaryMatch[1]}`;
    const parts = body.split(boundary);
    const result = {};
    
    for (const part of parts) {
        if (part.trim() === '' || part.includes('--')) continue;
        
        const [headers, content] = part.split('\r\n\r\n');
        if (!headers || !content) continue;
        
        const nameMatch = headers.match(/name="([^"]+)"/);
        if (!nameMatch) continue;
        
        const name = nameMatch[1];
        const value = content.replace(/\r\n$/, '');
        
        result[name] = value;
    }
    
    return result;
}

// 处理静态文件请求
function handleStaticFile(req, res, filePath) {
    // 检查文件是否存在
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // 文件不存在，返回404
            res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end('404 - 文件未找到');
            return;
        }
        
        // 读取并返回文件
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end('500 - 服务器内部错误');
                return;
            }
            
            // 设置适当的Content-Type
            const extname = path.extname(filePath).toLowerCase();
            let contentType = 'text/plain';
            
            switch (extname) {
                case '.html':
                    contentType = 'text/html; charset=utf-8';
                    break;
                case '.css':
                    contentType = 'text/css; charset=utf-8';
                    break;
                case '.js':
                    contentType = 'application/javascript; charset=utf-8';
                    break;
                case '.json':
                    contentType = 'application/json; charset=utf-8';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                case '.jpeg':
                    contentType = 'image/jpeg';
                    break;
                case '.gif':
                    contentType = 'image/gif';
                    break;
                case '.txt':
                    contentType = 'text/plain; charset=utf-8';
                    break;
            }
            
            res.writeHead(200, {'Content-Type': contentType});
            res.end(data);
        });
    });
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 获取请求URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 处理文件保存请求
    if (req.method === 'POST' && pathname === '/save_entry') {
        handleFileSave(req, res);
        return;
    }
    
    // 处理静态文件请求
    if (req.method === 'GET') {
        // 构建文件路径，确保正确处理中文文件名
        let filePath;
        if (pathname === '/') {
            filePath = path.join(rootDir, 'index.html');
        } else {
            // 解码URL路径，处理中文文件名
            const decodedPathname = decodeURIComponent(pathname);
            filePath = path.join(rootDir, decodedPathname.replace(/^\//, ''));
        }
        handleStaticFile(req, res, filePath);
        return;
    }
    
    // 不支持的请求方法
    res.writeHead(501, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('501 - 不支持的请求方法');
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`服务器正在运行，访问地址: http://localhost:${PORT}`);
    console.log(`网站根目录: ${rootDir}`);
    console.log('按 Ctrl+C 停止服务器');
});

// 优雅关闭服务器
process.on('SIGINT', () => {
    console.log('\n服务器正在关闭...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});