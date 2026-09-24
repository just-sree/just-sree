import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { generateReply, projects } from '../agent.mjs';
import { containsExcludedTopic } from '../scope.mjs';

test('anonymized case study has no source link, retains claim review labels, and discloses illustrative evidence', async () => {
  const project = projects['governed-ai'];
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  const section = html.match(/<li id="project-governed-ai"[\s\S]*?<\/li>/)?.[0];
  assert.ok(section);
  assert.equal(project.url, undefined);
  assert.equal(containsExcludedTopic(JSON.stringify(project) + section), false);
  assert.doesNotMatch(JSON.stringify(project) + section, /https?:\/\/|mailto:|www\./i);
  assert.equal(project.contributions.length, 4);
  for (const claim of project.contributions) {
    assert.match(claim, /^Review required — proposed personal contribution:/);
    assert.ok(section.includes(claim.split(': ')[1]));
  }
  assert.equal((section.match(/Review required — proposed personal contribution:/g) || []).length, 4);
  assert.match(project.investigation, /synthetic/);
  assert.match(project.evidence, /not published incident records/);
  assert.match(project.outcome, /No measured reliability improvement/);
  assert.ok(section.includes('id="governed-ai"'));
  assert.ok(section.includes('data-project="governed-ai"'));
});

test('reliability topics and followups route to the anonymized draft with review status', async () => {
  for (const question of ['Explain Governed AI Reliability', 'Explain policy constraints', 'How does escalation work?', 'Explain reproducible defect investigation', 'Explain durable workflow design']) {
    const result = await generateReply(question, []);
    assert.equal(result.project, 'governed-ai');
    assert.match(result.answer, /owner review/i);
    assert.equal((result.answer.match(/Review required/g) || []).length, 4);
  }
  const followup = await generateReply('Tell me more', [{ role: 'user', content: 'Explain governed AI reliability' }]);
  assert.equal(followup.project, 'governed-ai');
  assert.match(followup.answer, /Review required/);
});

test('live context preserves anonymization and personal contribution review instructions', async () => {
  await generateReply('Explain governed AI reliability', [], {
    apiKey: 'test-only',
    fetcher: async (_url, options) => {
      const payload = JSON.parse(options.body);
      assert.match(payload.instructions, /label every personal-contribution statement as Review required/);
      assert.match(payload.instructions, /Never infer or connect this case study/);
      assert.match(payload.instructions, /not published incident records/);
      return { ok: true, json: async () => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ answer: 'An anonymized draft requiring owner review.', project: 'governed-ai', contact: false }) }] }] }) };
    },
  });
});
