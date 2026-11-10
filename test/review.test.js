const assert = require('node:assert/strict');
const test = require('node:test');
const { deriveReviewState, buildReviewSummary, getDemoScenario, fourWeekdayRange } = require('../dist/review.js');
const { checkAvailability } = require('../dist/logic.js');

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

test('copyable review summary preserves blockers and the manager note without team details', () => {
  const text = buildReviewSummary({ title: 'Launch graphics', status: 'Needs clarification', nextAction: 'Put the request on hold.', blockers: ['Confirm the client deadline.'], decisionNote: 'Follow up Tuesday.' });
  assert.match(text, /Confirm the client deadline/);
  assert.match(text, /Manager note: Follow up Tuesday/);
  assert.doesNotMatch(text, /Maya Chen/);
});

test('potential-candidate preset gives Maya exactly 10 aggregate hours for the request', () => {
  const dates = fourWeekdayRange('2026-11-10');
  assert.deepEqual(dates, { startDate: '2026-11-11', deadline: '2026-11-16' });
  const preset = getDemoScenario('candidate', dates.startDate, dates.deadline);
  assert.equal(preset.committedHoursByMember[1], 14);
  const maya = { id: 1, name: 'Maya Chen', skills: 'Graphic design, Layout', dailyCapacity: 6, committedHours: preset.committedHoursByMember[1], lastConfirmed: '2026-11-07' };
  const result = checkAvailability([maya], { requiredSkill: preset.request.skill, estimatedHours: Number(preset.request.hours), startDate: preset.request.startDate, deadline: preset.request.deadline, committedHoursConfirmed: true })[0];
  assert.equal(result.confirmedCapacity, 10);
  assert.equal(result.status, 'qualified');
});
