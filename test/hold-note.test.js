const assert = require('node:assert/strict');
const test = require('node:test');
const { createHoldDraft, formatHoldDraft } = require('../dist/hold-note.js');

test('hold draft turns unresolved deadline and materials into client questions without inventing values', () => {
  const draft = createHoldDraft({ blockers: ['Confirm the client deadline.', 'Confirm required materials or approvals.', 'Confirm the effort estimate.'], capacityAssessed: false });
  assert.deepEqual(draft.clientQuestions, [
    'What is the final client deadline?',
    'Which materials and approvals will be supplied, and when?',
    'What effort estimate should we use for this request?'
  ]);
  assert.match(draft.internalChecks[0], /Capacity has not been assessed/);
});

test('hold draft format keeps client questions and internal checks separate for manager review', () => {
  const note = formatHoldDraft({ clientQuestions: 'What is the final client deadline?', internalChecks: 'Capacity has not been assessed.' });
  assert.match(note, /^Client follow-up:/);
  assert.match(note, /Internal checks:/);
});
