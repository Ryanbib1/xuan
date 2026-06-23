// 本地联调用：零依赖 Node 静态 + /api/zhengyuan 服务器
// 运行：ANTHROPIC_API_KEY=sk-ant-... node dev-server.js   然后浏览器开 http://localhost:8787
const http = require('http');
const fs = require('fs');
const path = require('path');
const handler = require('./api/zhengyuan.js');

const PORT = process.env.PORT || 8787;
const ROOT = __dirname;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/api/zhengyuan') {
    // 给原生 res 套上 Vercel 风格的 status()/json()，让 api/*.js 不必改动
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader('content-type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); return res; };
    return handler(req, res);
  }

  // 静态文件：把要测的 xuan2.html 复制进本目录即可访问 /xuan2.html
  let f = path.join(ROOT, url === '/' ? 'index.html' : decodeURIComponent(url));
  if (!f.startsWith(ROOT)) { res.statusCode = 403; return res.end('forbidden'); }
  fs.readFile(f, (err, buf) => {
    if (err) { res.statusCode = 404; return res.end('not found'); }
    res.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream');
    res.end(buf);
  });
}).listen(PORT, () => console.log(`玄 dev server → http://localhost:${PORT}  (api: /api/zhengyuan)`));
