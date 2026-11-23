import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain' };
const port = Number(process.env.PORT || 3000);
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname.startsWith('/api/')) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Local preview has no email API. Use Vercel for sending or the email fallback.' }));
    return;
  }
  const pathname = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const file = resolve(root, '.' + pathname);
  if (!(file === root || file.startsWith(root + sep)) || /\/(?:api|scripts|\.git)\//.test(pathname) || pathname.startsWith('/.')) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  try {
    if (!(await stat(file)).isFile()) throw new Error('Not a file');
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(content);
  } catch {
    const fallback = await readFile(resolve(root, '404.html'));
    res.writeHead(404, { 'Content-Type': mime['.html'] }); res.end(fallback);
  }
});
server.listen(port, () => console.log(`EPIC Party Hire running at http://localhost:${port}\nUse Ctrl+C to stop.`));
