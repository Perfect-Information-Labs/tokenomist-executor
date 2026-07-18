import { Hono } from 'hono';
// @ts-ignore - text import via wrangler rule
import readmeContent from '../../README.md';

const app = new Hono();

app.get('/docs', (c) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>Tokenomist Executor — Docs</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js"></script>
  <style>
    body { max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, sans-serif; line-height: 1.6; }
    pre { background: #1e1e1e; color: #ddd; padding: 12px; border-radius: 6px; overflow-x: auto; }
    code { background: #eee; padding: 2px 5px; border-radius: 3px; }
    pre code { background: none; padding: 0; }
  </style>
</head>
<body>
  <div id="content"></div>
  <script>
    document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(readmeContent)});
  </script>
</body>
</html>`;
  return c.html(html);
});

export default app;