const assert = require('node:assert/strict');
const test = require('node:test');
const { deriveReviewState } = require('../dist/review.js');

test('fictional request is held for unconfirmed deadline and materials without guessed effort', () => {
  const state = deriveReviewState({
    title: 'Spring launch graphics',
    description: 'Create campaign graphics for the spring launch.',
    skill: '',
    estimatedHours: '',
    confirmedHours: '',
    startDate: '',
    deadline: '',
    materials: '',
    hasCurrentCapacityCheck: false,
    qualifiedCount: 0
  });
  assert.equal(state.status, 'Needs clarification');
  assert.match(state.nextAction, /Put the request on hold/);
  assert.ok(state.blockers.includes('Confirm the client deadline.'));
  assert.ok(state.blockers.includes('Confirm required materials or approvals.'));
});

test('complete details without a check are ready for capacity review, not candidate selection', () => {
  const state = deriveReviewState({ title: 'Campaign graphics', description: 'Create graphics.', skill: 'Graphic design', estimatedHours: 8, confirmedHours: 8, startDate: '2026-11-10', deadline: '2026-11-14', materials: 'Approved copy and assets', hasCurrentCapacityCheck: false, qualifiedCount: 0 });
  assert.equal(state.status, 'Ready for capacity check');
});
