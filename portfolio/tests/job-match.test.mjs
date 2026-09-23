import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInput } from '../agent.mjs';
import { matchJob } from '../job-match.mjs';

const posting = 'Applied ML Engineer. Requirements: Python, time-series forecasting, LLM agents, Docker, Kafka.';
const reply = (body) => ({ ok: true, json: async () => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(body) }] }] }) });

test('job postings get a longer limit, and only the job-match task is accepted', () => {
  assert.deepEqual(validateInput({ message: 'x'.repeat(8000), task: 'job-match' }), { message: 'x'.repeat(8000), history: [], task: 'job-match' });
  assert.throws(() => validateInput({ message: 'x'.repeat(8001), task: 'job-match' }));
  assert.throws(() => validateInput({ message: 'x'.repeat(2001) }));
  assert.throws(() => validateInput({ message: 'hello', task: 'run-shell' }));
});

test('preview match rates skills from approved facts and reports gaps without calling a provider', async () => {
  const result = await matchJob(posting, { fetcher: () => { throw new Error('Network must not be called'); } });
  assert.equal(result.mode, 'preview');
  assert.equal(result.contact, true);
  const byName = Object.fromEntries(result.match.items.map((item) => [item.requirement, item]));
  assert.equal(byName.Python.strength, 'strong');
  assert.equal(byName['Time-series forecasting'].source, 'ircc');
  assert.equal(byName.Docker.strength, 'partial');
  assert.deepEqual(byName.Kafka, { requirement: 'Kafka', strength: 'none', evidence: 'Not in the portfolio notes. Ask Sree directly.', source: null });
  assert.equal(result.match.items.at(-1).strength, 'none');
  const empty = await matchJob('Great team, free snacks.', {});
  assert.equal(empty.match.items.length, 0);
  assert.equal(empty.contact, false);
});

test('live match treats the posting as untrusted input, opts out of storage, and normalises gaps', async () => {
  let sent;
  const result = await matchJob(posting, {
    apiKey: 'test-only-key', model: 'test-model',
    fetcher: async (url, options) => {
      sent = JSON.parse(options.body);
      return reply({ role: 'Applied ML Engineer', summary: 'Strong on forecasting and agents. No Kubernetes evidence.', items: [
        { requirement: 'Kubernetes', strength: 'none', evidence: 'Probably fine', source: 'ircc' },
        { requirement: 'Forecasting', strength: 'strong', evidence: 'IRCC capstone compared Prophet, ARIMA and exponential smoothing.', source: 'ircc' },
      ] });
    },
  });
  assert.equal(sent.store, false);
  assert.equal(sent.model, 'test-model');
  assert.equal(sent.text.format.name, 'job_match');
  assert.equal(sent.text.format.strict, true);
  assert.deepEqual(sent.input, [{ role: 'user', content: posting }]);
  assert.match(sent.instructions, /untrusted/);
  assert.equal(result.mode, 'live');
  assert.equal(result.match.role, 'Applied ML Engineer');
  assert.equal(result.match.items[0].requirement, 'Forecasting');
  assert.deepEqual(result.match.items[1], { requirement: 'Kubernetes', strength: 'none', evidence: 'Not in the portfolio notes. Ask Sree directly.', source: null });
  assert.ok(!JSON.stringify(result).includes('test-only-key'));
});

test('live match rejects invented sources, unknown ratings and empty results', async () => {
  const item = { requirement: 'Python', strength: 'strong', evidence: 'IRCC ETL.', source: 'ircc' };
  for (const items of [[{ ...item, source: 'secret-project' }], [{ ...item, strength: 'expert' }], []]) {
    await assert.rejects(matchJob(posting, { apiKey: 'test-only-key', fetcher: async () => reply({ role: '', summary: 'Fit.', items }) }));
  }
  await assert.rejects(matchJob(posting, { apiKey: 'test-only-key', fetcher: async () => ({ ok: false }) }));
});
