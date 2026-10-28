import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./site/', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
};

export function createOfficeServer() {
  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-cache');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('Method not allowed');
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(part => part.startsWith('.'))) {
        throw new Error('Invalid path');
      }
    } catch {
      response.writeHead(400);
      response.end('Invalid path');
      return;
    }
    if (pathname === '/api/lab' || pathname.startsWith('/api/lab/')) {
      response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : JSON.stringify({ detail:
        'This office edition includes the learning website. The live agent lab needs the separate Node 22, Python and Java setup on the rich branch. See office/README.md.' }));
      return;
    }
    const path = resolve(root, '.' + pathname);
    if (path !== resolve(root) && !path.startsWith(root.endsWith(sep) ? root : root + sep)) {
      response.writeHead(400);
      response.end('Invalid path');
      return;
    }
    const download = /^\/junior-path\/labs\/([a-z0-9-]+)$/.exec(pathname);
    const candidates = pathname === '/' ? [resolve(root, 'index.html')]
      : [path, path + '.html', resolve(path, 'index.html')];
    try {
      let found;
      for (const candidate of candidates) {
        try {
          if ((await stat(candidate)).isFile()) { found = candidate; break; }
        } catch (error) {
          if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error;
        }
      }
      if (!found) {
        response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(request.method === 'HEAD' ? undefined : await readFile(resolve(root, '404.html')));
        return;
      }
      response.setHeader('Content-Type', download ? 'text/x-python; charset=utf-8' : types[extname(found)] ?? 'application/octet-stream');
      if (download) response.setHeader('Content-Disposition', `attachment; filename="${download[1]}.py"`);
      response.writeHead(200);
      response.end(request.method === 'HEAD' ? undefined : await readFile(found));
    } catch {
      if (!response.headersSent) response.writeHead(500);
      response.end('Unable to read the office bundle. Download the complete office folder again.');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const portFlag = args.indexOf('--port');
  const port = Number(portFlag < 0 ? process.env.PORT ?? 3000 : args[portFlag + 1]);
  if (!Number.isInteger(port) || port < 1 || port > 65535 || !(args.length === 0 || (args.length === 2 && portFlag === 0))) {
    console.error('Usage: npm start -- --port 3000 (port must be 1–65535)');
    process.exit(1);
  }
  const host = process.env.HOST ?? '127.0.0.1';
  const server = createOfficeServer();
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, host, () => console.log(`AI Learning Academy: http://${host}:${port} (${process.version}, no npm downloads)`));
}
