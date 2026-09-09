import { readFile } from 'node:fs/promises';
import { generateReply, validateInput } from './agent.mjs';
import { getAIConfig, getAIStatus } from './ai-config.mjs';

const port = Number(process.env.PORT || 4173);
const publicFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/narrative.css', ['narrative.css', 'text/css; charset=utf-8']],
  ['/narrative.js', ['narrative.js', 'text/javascript; charset=utf-8']],
  ['/scroll.css', ['scroll.css', 'text/css; charset=utf-8']],
  ['/logo.png', ['logo.png', 'image/png']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/bamboo.js', ['bamboo.js', 'text/javascript; charset=utf-8']],
  ['/bamboo-logo.png', ['bamboo-logo.png', 'image/png']],
  ['/resume.pdf', ['resume.pdf', 'application/pdf']],
  ['/projects.json', ['projects.json', 'application/json; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
]);
const limits = new Map();
const windowMs = 60000;
setInterval(() => { for (const [key, value] of limits) if (Date.now() > value.reset) limits.delete(key); }, windowMs).unref();
function sendJson(response, status, data) { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(data)); }
export default async function handleRequest(request, response) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  const path = new URL(request.url, `http://localhost:${port}`).pathname;
  if (path === '/api/status' && request.method === 'GET') return sendJson(response, 200, getAIStatus());
  if (path === '/api/agent') {
    if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return sendJson(response, 405, { error: 'Use POST.' }); }
    if (request.headers.origin) {
      try { if (new URL(request.headers.origin).host !== request.headers.host) return sendJson(response, 403, { error: 'Cross-origin requests are not allowed.' }); }
      catch { return sendJson(response, 403, { error: 'Invalid origin.' }); }
    }
    if (!request.headers['content-type']?.startsWith('application/json')) return sendJson(response, 415, { error: 'Send JSON content.' });
    // Vercel overwrites x-forwarded-for; local callers cannot choose a rate-limit key.
    const key = process.env.VERCEL === '1' ? String(request.headers['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown').split(',')[0].trim() : request.socket?.remoteAddress || 'unknown';
    let limit = limits.get(key);
    if (!limit || Date.now() > limit.reset) { limit = { count: 0, reset: Date.now() + windowMs }; limits.set(key, limit); }
    if (++limit.count > 15) { response.setHeader('Retry-After', Math.ceil((limit.reset - Date.now()) / 1000)); return sendJson(response, 429, { error: 'Please wait a minute before sending more messages.' }); }
    let body;
    try {
      if (request.body !== undefined) {
        // Vercel may pre-parse the body; local Node requests are read as a stream.
        const raw = typeof request.body === 'string' || Buffer.isBuffer(request.body) ? request.body.toString() : JSON.stringify(request.body);
        if (Buffer.byteLength(raw) > 100000) return sendJson(response, 413, { error: 'Message body is too large.' });
        body = validateInput(JSON.parse(raw));
      } else {
        const chunks = [];
        let length = 0;
        for await (const chunk of request) {
          length += chunk.length;
          if (length > 100000) { sendJson(response, 413, { error: 'Message body is too large.' }); return; }
          chunks.push(chunk);
        }
        body = validateInput(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      }
    } catch (error) { return sendJson(response, 400, { error: error instanceof SyntaxError ? 'Invalid JSON.' : error.message }); }
    let config;
    try { config = getAIConfig(); }
    catch { return sendJson(response, 503, { error: 'The AI connection is not configured correctly. Please use the project notes or contact Sree.' }); }
    try { return sendJson(response, 200, await generateReply(body.message, body.history, config)); }
    catch (error) { return sendJson(response, 502, { error: error.name === 'TimeoutError' ? 'The AI connection timed out. Please try again.' : 'The AI connection is temporarily unavailable. Please try again shortly.' }); }
  }
  if (!['GET', 'HEAD'].includes(request.method)) { response.setHeader('Allow', 'GET, HEAD'); return sendJson(response, 405, { error: 'Method not allowed.' }); }
  const file = publicFiles.get(path);
  if (!file) return sendJson(response, 404, { error: 'Not found.' });
  try {
    const content = await readFile(new URL(`./public/${file[0]}`, import.meta.url));
    if (path === '/resume.pdf') response.setHeader('Content-Disposition', 'inline; filename="Sree-Chackoth-Resume.pdf"');
    response.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-cache' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch { sendJson(response, 500, { error: 'Unable to load this page.' }); }
}
