import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./site/', import.meta.url));
const args = process.argv.slice(2);
const portFlag = args.findIndex((value) => value === '--port' || value === '-p');
const rawPort = portFlag >= 0 ? args[portFlag + 1] : process.env.PORT || '3000';
const port = Number.parseInt(rawPort, 10);
const host = process.env.HOST || '127.0.0.1';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid port: ${rawPort}`);
  process.exit(1);
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const requested = decodeURIComponent(requestUrl.pathname);
  const safePath = normalize(requested).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  let filePath = join(root, safePath || 'index.html');

  if (!filePath.startsWith(root)) filePath = join(root, 'index.html');
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) filePath = join(root, 'index.html');

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
    'Cache-Control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  createReadStream(filePath).pipe(response);
});

server.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`AI Learning Academy: http://${host === '127.0.0.1' ? 'localhost' : host}:${port}`);
  console.log('Zero dependencies · Node.js 18.18 · press Ctrl+C to stop');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
