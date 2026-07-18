import { Hono } from 'hono';
import { marked } from 'marked';
// @ts-ignore - text import via wrangler rule
import readmeContent from '../../README.md';

const app = new Hono();

app.get('/docs', (c) => {
  const acceptHeader = c.req.header('Accept') ?? '';

  if (acceptHeader.includes('text/markdown')) {
    return c.text(readmeContent, 200, { 'Content-Type': 'text/markdown' });
  }

  const renderedHtml = marked.parse(readmeContent) as string;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>Tokenomist Executor — Docs</title>
  <style>
    body { max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, sans-serif; line-height: 1.6; }
    pre { background: #1e1e1e; color: #ddd; padding: 12px; border-radius: 6px; overflow-x: auto; }
    code { background: #eee; padding: 2px 5px; border-radius: 3px; }
    pre code { background: none; padding: 0; }
  </style>
</head>
<body>
  ${renderedHtml}
</body>
</html>`;
  return c.html(html);
});

export default app;