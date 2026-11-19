// Leonida Ledger — local preview server.
//
// Serves the app/ directory over HTTP so the guide can be opened in a
// browser exactly as a reader (or the screenshot tooling) would see it.
// Node standard library only; no dependencies, nothing leaves the machine.
//
//   node serve.ts [--port 8080]
//
// Then open http://localhost:8080/ — add ?shot=list, ?shot=roadmap,
// ?shot=tracker or ?shot=detail&trophy=<id> for the fixed shot states.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = fileURLToPath(new URL('./app/', import.meta.url));

const MIME = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

function portFromArgs(argv) {
  const at = argv.indexOf('--port');
  const value = at >= 0 ? Number(argv[at + 1]) : NaN;
  return Number.isInteger(value) && value > 0 ? value : 8080;
}

// Map a request path to a file inside app/, refusing anything that climbs out.
function resolveInside(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^[/\\]+/, '');
  const full = join(APP_ROOT, clean);
  return full.startsWith(APP_ROOT) ? full : null;
}

const server = createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    let file = resolveInside(pathname === '/' ? '/index.html' : pathname);
    if (file === null) {
      res.writeHead(403).end('forbidden');
      return;
    }
    let info = await stat(file).catch(() => null);
    if (info?.isDirectory()) {
      file = join(file, 'index.html');
      info = await stat(file).catch(() => null);
    }
    if (!info?.isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('not found');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': MIME.get(extname(file).toLowerCase()) ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }).end(String(err));
  }
});

const port = portFromArgs(process.argv.slice(2));
server.listen(port, () => {
  console.log(`Leonida Ledger preview: http://localhost:${port}/`);
});
