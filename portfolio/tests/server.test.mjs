import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

test('HTTP boundary: serves only public files, rejects bad requests, and limits chat traffic', async (t) => {
  const port = 19000 + Math.floor(Math.random() * 10000);
  const child = spawn(process.execPath, ['server.mjs'], { cwd: new URL('../', import.meta.url), env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', AI_PROVIDER: 'openai', OPENAI_API_KEY: '', VERCEL: '' }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  t.after(() => child.kill());
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server did not start')), 10000);
    child.once('error', (error) => { clearTimeout(timeout); reject(error); });
    child.stdout.once('data', () => { clearTimeout(timeout); resolve(); });
    child.once('exit', (code) => { clearTimeout(timeout); reject(new Error(`Server exited: ${code}`)); });
  });
  const base = `http://127.0.0.1:${port}`;
  assert.equal((await fetch(base)).status, 200);
  const resume = await fetch(base + '/resume.pdf');
  assert.equal(resume.status, 200);
  assert.equal(resume.headers.get('Content-Type'), 'application/pdf');
  const pdf = Buffer.from(await resume.arrayBuffer());
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.equal((await fetch(base + '/.env')).status, 404);
  assert.equal((await fetch(base + '/server.mjs')).status, 404);
  assert.equal((await fetch(base + '/%2e%2e/agent.mjs')).status, 404);
  assert.equal((await fetch(base + '/api/agent')).status, 405);
  assert.equal((await fetch(base + '/api/agent', { method: 'POST', body: '{}' })).status, 415);
  const post = (body, headers = {}) => fetch(base + '/api/agent', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  assert.equal((await post({ message: 'Hi' }, { Origin: 'https://unrelated.example' })).status, 403);
  assert.equal((await post({ message: '' })).status, 400);
  assert.equal((await post({ message: 'x'.repeat(100001) })).status, 413);
  const result = await post({ message: 'Walk me through agent-preflight.' });
  assert.equal(result.status, 200);
  assert.equal((await result.json()).mode, 'preview');
  let last;
  for (let i = 0; i < 16; i++) last = await post({ message: 'Hello' });
  assert.equal(last.status, 429);
  assert.ok(Number(last.headers.get('Retry-After')) > 0);
});
