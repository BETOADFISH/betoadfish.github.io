// Local preview of the exact static export. Not a production backend.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist/client');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.rsc': 'text/x-component',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.pdb': 'text/plain',
  '.csv': 'text/csv; charset=utf-8',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const candidate = path.resolve(
      root,
      '.' + decodeURIComponent(url.pathname),
    );
    if (candidate !== root && !candidate.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    let file;
    for (const p of [
      candidate,
      path.join(candidate, 'index.html'),
      candidate + '.html',
    ]) {
      try {
        if ((await stat(p)).isFile()) {
          file = p;
          break;
        }
      } catch {}
    }
    if (!file) {
      file = path.join(root, '404.html');
      res.statusCode = 404;
    }
    res.setHeader(
      'Content-Type',
      types[path.extname(file)] ?? 'application/octet-stream',
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(await readFile(file));
  } catch {
    res.writeHead(500);
    res.end('Unable to serve page.');
  }
});
const port = Number(process.env.PORT || 5175);
server.listen(port, '127.0.0.1', () =>
  console.log(`Static portfolio: http://127.0.0.1:${port}/`),
);
