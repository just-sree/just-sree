import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import handler from '../api/agent.js';
import statusHandler from '../api/status.js';

function invoke(url, body, method = 'POST') {
  const request = Readable.from([]);
  Object.assign(request, { url, method, body, headers: { host: 'portfolio.vercel.app', origin: 'https://portfolio.vercel.app', 'content-type': 'application/json' }, socket: { remoteAddress: 'test-vercel' } });
  const result = { headers: {}, status: null, body: null };
  const response = {
    setHeader(key, value) { result.headers[key] = value; },
    writeHead(code, headers) { result.status = code; Object.assign(result.headers, headers); },
    end(content) { result.body = content ? JSON.parse(content) : null; },
  };
  return handler(request, response).then(() => result);
}

test('Vercel exports work with pre-parsed bodies, protect config, and enforce byte limits', async () => {
  const saved = { provider: process.env.AI_PROVIDER, key: process.env.OPENAI_API_KEY };
  process.env.AI_PROVIDER = 'openai'; process.env.OPENAI_API_KEY = '';
  try {
    assert.equal(statusHandler, handler);
    const objectBody = await invoke('/api/agent', { message: 'Compare the projects' });
    assert.equal(objectBody.status, 200);
    assert.equal(objectBody.body.mode, 'preview');
    assert.equal((await invoke('/api/agent', JSON.stringify({ message: 'Hi' }))).status, 200);
    assert.equal((await invoke('/api/agent', Buffer.from('{"message":"Hi"}'))).status, 200);
    assert.equal((await invoke('/api/agent', { message: 'x'.repeat(100001) })).status, 413);
    assert.equal((await invoke('/api/agent', '{invalid')).status, 400);
    const status = await invoke('/api/status', undefined, 'GET');
    assert.deepEqual(status.body, { mode: 'preview', provider: 'openai' });
    assert.equal(status.headers['Cache-Control'], 'no-store');
    process.env.AI_PROVIDER = 'invalid';
    assert.equal((await invoke('/api/agent', { message: 'Hello' })).status, 503);
  } finally {
    for (const [name, value] of [['AI_PROVIDER', saved.provider], ['OPENAI_API_KEY', saved.key]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});
