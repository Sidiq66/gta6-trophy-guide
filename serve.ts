// Leonida Ledger — preview server for local use and screenshots.
//
//   node serve.ts            serves app/ at http://localhost:8080
//   node serve.ts --port N   same, on another port
//
// Nothing but the Node standard library: it maps each request path to a
// file under app/, refuses paths that climb out of it, and answers with a
// small table of content types. It exists so the guide can be opened
// exactly as a reader (or the screenshot tooling) would see it; the app
// itself needs no server beyond any static file host.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'app');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function wantedPort(argv) {
  const flag = argv.indexOf('--port');
  const n = flag >= 0 ? Number.parseInt(argv[flag + 1], 10) : NaN;
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : 8080;
}

async function handle(req, res) {
  const url = new URL(req.url || '/', 'http://localhost');
  const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
  const file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root + path.sep) && file !== root) {
    res.writeHead(403, { 'content-type': 'text/plain' }).end('outside the app root');
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store',
    }).end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
  }
}

const port = wantedPort(process.argv.slice(2));
createServer((req, res) => {
  handle(req, res).catch(() => {
    res.writeHead(500, { 'content-type': 'text/plain' }).end('server error');
  });
}).listen(port, () => {
  console.log(`Leonida Ledger is being served at http://localhost:${port}/`);
});
