// 下载日志
function downloadLogs() {
    try {
        // 定义logs变量，从localStorage获取登录日志
        const logs = JSON.parse(localStorage.getItem('loginLogs')) || [];
        let logText = '登录日志\n';
        logText += '='.repeat(50) + '\n';
        
        if (logs.length === 0) {
            logText += '暂无登录记录\n';
        } else {
            logs.forEach(log => {
                const date = new Date(log.timestamp);
                logText += `时间: ${date.toLocaleString()}\n`;
                logText += `用户名: ${log.username}\n`;
                logText += `类型: ${log.type === 'admin' ? '管理员' : '普通用户'}\n`;
                logText += `IP: ${log.ip}\n`;
                logText += '-' .repeat(50) + '\n';
            });
        }
        
        // 创建Blob对象
        const blob = new Blob([logText], { type: 'text/plain' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '123.txt';
        a.style.display = 'none';
        document.body.appendChild(a);
        
        // 模拟点击下载
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log('日志下载成功');
    } catch (error) {
        console.error('下载日志时出错:', error);
        alert('下载日志时出错，请检查控制台');
    }
}
