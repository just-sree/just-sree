import test from 'node:test';
import assert from 'node:assert/strict';
import { getAIConfig, getAIStatus } from '../ai-config.mjs';
import { generateReply } from '../agent.mjs';

const azure = {
  AI_PROVIDER: 'azure', AZURE_OPENAI_API_KEY: 'fake-azure-secret',
  AZURE_OPENAI_ENDPOINT: 'https://portfolio.openai.azure.com/',
  AZURE_OPENAI_DEPLOYMENT: 'sree-agent-deployment',
};

test('Foundry resource endpoints normalize to v1 Responses with the deployment name', () => {
  for (const host of ['portfolio.openai.azure.com', 'portfolio.services.ai.azure.com']) {
    for (const suffix of ['/', '/openai/v1', '/openai/v1/', '/openai/v1/responses', '/openai/v1/responses/']) {
      const config = getAIConfig({ ...azure, AZURE_OPENAI_ENDPOINT: 'https://' + host + suffix });
      assert.equal(config.endpoint, 'https://' + host + '/openai/v1/responses');
      assert.equal(config.model, azure.AZURE_OPENAI_DEPLOYMENT);
    }
  }
});

test('empty config previews, partial config fails, status never exposes credentials or endpoint', () => {
  assert.equal(getAIStatus({ AI_PROVIDER: 'azure' }).mode, 'preview');
  assert.throws(() => getAIConfig({ AI_PROVIDER: 'azure', AZURE_OPENAI_API_KEY: 'secret' }));
  assert.equal(getAIStatus({ AI_PROVIDER: 'azure', AZURE_OPENAI_API_KEY: 'secret' }).mode, 'unavailable');
  assert.deepEqual(getAIStatus(azure), { mode: 'live', provider: 'azure' });
  assert.deepEqual(getAIStatus({ AI_PROVIDER: 'unexpected' }), { mode: 'unavailable', provider: null });
});

test('rejects non-resource URLs and never falls back to a direct OpenAI key for Azure', () => {
  for (const endpoint of ['http://portfolio.openai.azure.com/', 'https://evil.example/', 'https://portfolio.services.ai.azure.com/api/projects/demo', 'https://portfolio.openai.azure.com/?key=secret', 'https://user:password@portfolio.openai.azure.com/', 'https://portfolio.openai.azure.com/openai/deployments/demo', 'https://portfolio.openai.azure.com.evil.example/']) {
    assert.throws(() => getAIConfig({ ...azure, AZURE_OPENAI_ENDPOINT: endpoint }));
  }
  assert.equal(getAIConfig({ AI_PROVIDER: 'azure', OPENAI_API_KEY: 'unused-key' }).apiKey, '');
});

test('Foundry requests use Azure key auth, deployment, structured schema and no redirects', async () => {
  const reply = await generateReply('Explain BogdAI', [], {
    ...getAIConfig(azure),
    fetcher: async (url, options) => {
      assert.equal(url, 'https://portfolio.openai.azure.com/openai/v1/responses');
      assert.equal(options.headers['api-key'], azure.AZURE_OPENAI_API_KEY);
      assert.equal(options.headers.Authorization, undefined);
      assert.equal(options.redirect, 'error');
      const body = JSON.parse(options.body);
      assert.equal(body.model, 'sree-agent-deployment');
      assert.equal(body.store, false);
      assert.equal(body.text.format.strict, true);
      assert.match(body.instructions, /bold, playful/);
      return { ok: true, json: async () => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ answer: 'An inspectable contract pipeline.', project: 'bogdai', contact: false }) }] }] }) };
    },
  });
  assert.equal(reply.mode, 'live');
  assert.ok(!JSON.stringify(reply).includes(azure.AZURE_OPENAI_API_KEY));
});
