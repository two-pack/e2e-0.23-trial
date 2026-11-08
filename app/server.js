// Serves app/index.html. No dependencies.
// Usage: node app/server.js [port]   (default: PORT env or 3000)
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.argv[2] ?? process.env.PORT ?? 3000);
const page = fs.readFileSync(path.join(__dirname, 'index.html'));

http
  .createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(page);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Todo app listening on http://127.0.0.1:${port}`);
  });
