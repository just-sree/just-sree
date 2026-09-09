import test from 'node:test';
import assert from 'node:assert/strict';
import { generateReply, projects } from '../agent.mjs';
import { containsExcludedTopic } from '../scope.mjs';

// Encoded fixture labels keep owner-excluded names out of repository copy.
const fixture = Buffer.from('6167656e742d707265666c69676874', 'hex').toString();
const other = Buffer.from('626f646869746174747661', 'hex').toString();
const response = (answer, project = null) => ({ ok: true, json: async () => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ answer, project, contact: false }) }] }] }) });

test('excluded questions and brief requests never reach the provider', async () => {
  for (const label of [fixture, fixture.toUpperCase(), fixture.replace('-', ' '), other]) {
    assert.equal(containsExcludedTopic(label), true);
    for (const question of [`Explain ${label}`, `Draft a brief about ${label}`]) {
      const result = await generateReply(question, [], { apiKey: 'test', fetcher: () => { throw new Error('Must not call provider'); } });
      assert.equal(result.project, null);
      assert.equal(result.brief, undefined);
      assert.equal(containsExcludedTopic(result.answer), false);
    }
  }
});

test('old excluded history is removed and excluded provider output is suppressed', async () => {
  const result = await generateReply('Tell me more', [{ role: 'assistant', content: `Old notes about ${fixture}` }], {
    apiKey: 'test', fetcher: async (_url, options) => {
      assert.equal(containsExcludedTopic(options.body), false);
      return response(`An unapproved answer about ${other}`);
    },
  });
  assert.equal(result.project, null);
  assert.equal(containsExcludedTopic(result.answer), false);
});

test('all approved project names route correctly and are allowed live UI actions', async () => {
  assert.equal(Object.keys(projects).length, 15);
  assert.equal(containsExcludedTopic(JSON.stringify(projects)), false);
  for (const [id, project] of Object.entries(projects)) {
    assert.equal((await generateReply(`Explain ${project.name}`, [])).project, id);
  }
  await generateReply('Explain the vision project', [], {
    apiKey: 'test', fetcher: async (_url, options) => {
      assert.deepEqual(JSON.parse(options.body).text.format.schema.properties.project.enum, [...Object.keys(projects), null]);
      return response('Object detection and scene narration.', 'vision');
    },
  });
});
