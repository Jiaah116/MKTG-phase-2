const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('node:http');
const { validateDraft, createPayload } = require('../lib/interpretation.js');
const { createReviewState, copySelectedFacts } = require('../dist/ai-review.js');
const { createServer } = require('../server.js');

const source = 'Create three posters by Friday. Approved copy is attached.';
const baseDraft = { deliverables: [{ text: 'Create three posters', excerpt: 'Create three posters' }], quantities: [{ quantity: 'three', deliverable: 'posters', excerpt: 'three posters' }], deadlines: [{ text: 'Friday', excerpt: 'Friday', needs_clarification: true }], materials: [{ text: 'Approved copy', status: 'supplied', excerpt: 'Approved copy' }], missing_information: [], clarification_questions: ['Which Friday?'] };

test('validation marks exact supporting excerpts as supported', () => {
  assert.equal(validateDraft(baseDraft, source).deliverables[0].supported, true);
});
test('validation flags unsupported excerpts instead of confirming them', () => {
  const draft = { ...baseDraft, deliverables: [{ text: 'Create a video', excerpt: 'Create a video' }] };
  assert.equal(validateDraft(draft, source).deliverables[0].supported, false);
});
test('ellipsis excerpts are unsupported even when the surrounding wording appears in the source', () => {
  const request = 'Approved copy and existing brand guidelines are attached.';
  const draft = { ...baseDraft, materials: [{ text: 'Approved copy', status: 'supplied', excerpt: 'Approved copy ... are attached.' }] };
  assert.equal(validateDraft(draft, request).materials[0].supported, false);
  const complete = { ...baseDraft, materials: [{ text: 'Approved copy and existing brand guidelines', status: 'supplied', excerpt: request }] };
  assert.equal(validateDraft(complete, request).materials[0].supported, true);
});
test('ambiguous deadline preserves its wording and always receives an exact-date clarification question', () => {
  const draft = { ...baseDraft, clarification_questions: [] };
  const result = validateDraft(draft, source);
  assert.equal(result.deadlines[0].text, 'Friday');
  assert.equal(result.deadlines[0].needs_clarification, true);
  assert.deepEqual(result.clarification_questions, ['What is the exact calendar date for "Friday"?']);
});
test('displayed clarification questions merge missing information and deduplicate equivalent Friday questions', () => {
  const draft = {
    ...baseDraft,
    missing_information: [
      { item: 'image dimensions', question: 'What are the required image dimensions?' },
      { item: 'final approver', question: 'Who is the final approver?' }
    ],
    clarification_questions: ['Which Friday?', 'What image dimensions are required?', 'Who is the final approver?']
  };
  const result = validateDraft(draft, source);
  assert.deepEqual(result.clarification_questions, [
    'What are the required image dimensions?',
    'Who is the final approver?',
    'What is the exact calendar date for "Friday"?'
  ]);
  assert.equal(result.deadlines[0].text, 'Friday');
});
test('review approval is invalidated when source text changes', () => {
  const review = createReviewState(); review.setDraft(source);
  assert.equal(review.approve(source), true);
  assert.equal(review.isApproved(source), true);
  review.sourceChanged(`${source} Extra sentence.`);
  assert.equal(review.isApproved(source), false);
});
test('MOCKED draft: copying without review approval leaves the manual description unchanged', () => {
  const draft = { deliverables: [{ text: 'Create three additional Instagram graphics', supported: true }], deadlines: [] };
  const result = copySelectedFacts({ draft, selectedFacts: [{ kind: 'deliverables', index: 0 }], existingDescription: 'TEST — DO NOT REPLACE', allowReplace: true, approved: false });
  assert.equal(result.changed, false);
  assert.equal(result.description, 'TEST — DO NOT REPLACE');
  assert.match(result.message, /^Copy blocked:/);
});
test('MOCKED draft: approved replacement copies the selected supported deliverable', () => {
  const draft = { deliverables: [{ text: 'Create three additional Instagram graphics', supported: true }], deadlines: [] };
  const result = copySelectedFacts({ draft, selectedFacts: [{ kind: 'deliverables', index: 0 }], existingDescription: 'TEST — DO NOT REPLACE', allowReplace: true, approved: true });
  assert.equal(result.changed, true);
  assert.equal(result.description, 'Create three additional Instagram graphics');
  assert.match(result.message, /^Selected supported facts copied\./);
});
test('MOCKED draft: selected supported linked quantity is preserved with its selected deliverable', () => {
  const draft = {
    deliverables: [{ text: 'Instagram graphics', supported: true }],
    quantities: [{ quantity: 'three additional', deliverable: 'Instagram graphics', supported: true }],
    deadlines: []
  };
  const result = copySelectedFacts({ draft, selectedFacts: [{ kind: 'deliverables', index: 0 }, { kind: 'quantities', index: 0 }], existingDescription: 'TEST — DO NOT REPLACE', allowReplace: true, approved: true });
  assert.equal(result.changed, true);
  assert.equal(result.description, 'three additional Instagram graphics');
});
test('MOCKED draft: unselected linked quantity is not added to the selected deliverable', () => {
  const draft = {
    deliverables: [{ text: 'Instagram graphics', supported: true }],
    quantities: [{ quantity: 'three additional', deliverable: 'Instagram graphics', supported: true }],
    deadlines: []
  };
  const result = copySelectedFacts({ draft, selectedFacts: [{ kind: 'deliverables', index: 0 }], existingDescription: 'TEST — DO NOT REPLACE', allowReplace: true, approved: true });
  assert.equal(result.changed, true);
  assert.equal(result.description, 'Instagram graphics');
});
test('payload is private, structured, and contains only the supplied request text', () => {
  const payload = createPayload(source);
  assert.equal(payload.store, false); assert.equal(payload.input, source); assert.equal(payload.text.format.type, 'json_schema'); assert.equal(payload.max_output_tokens, 1200);
  assert.equal(JSON.stringify(payload).includes('Maya Chen'), false);
});
test('MOCKED API failure returns a sanitized error without retrying', async () => {
  const before = process.env.OPENAI_API_KEY; process.env.OPENAI_API_KEY = 'test-only-key'; let calls = 0;
  const server = createServer(async () => { calls += 1; return { ok: false, json: async () => ({ error: { message: 'do not expose' } }) }; });
  await new Promise((resolve) => server.listen(0, resolve)); const port = server.address().port;
  const result = await new Promise((resolve, reject) => { const req = http.request({ port, path: '/api/interpret-request', method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => { let body = ''; res.on('data', (chunk) => body += chunk); res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) })); }); req.on('error', reject); req.end(JSON.stringify({ requestText: source })); });
  await new Promise((resolve) => server.close(resolve)); if (before === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = before;
  assert.equal(calls, 1); assert.equal(result.status, 502); assert.equal(result.body.error.includes('do not expose'), false);
});
