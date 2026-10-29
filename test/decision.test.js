const assert = require('node:assert/strict');
const test = require('node:test');
const { validateManagerDecision, createDecisionMessageState, createScheduleConfirmationState } = require('../dist/decision.js');

test('hold can be saved before capacity is assessed when description and note are present', () => {
  const result = validateManagerDecision({ hold: true, description: 'Awaiting client details', note: 'Hold until scope is confirmed.', candidateId: '', hasCurrentCapacityCheck: false });
  assert.equal(result.valid, true);
  assert.match(result.message, /Capacity not assessed/);
});
test('hold requires a task description and a decision note but not a candidate or capacity check', () => {
  assert.equal(validateManagerDecision({ hold: true, description: '', note: 'Hold.', candidateId: '', hasCurrentCapacityCheck: false }).valid, false);
  assert.equal(validateManagerDecision({ hold: true, description: 'Request', note: '', candidateId: '', hasCurrentCapacityCheck: false }).valid, false);
});
test('candidate selection requires a current capacity check', () => {
  const result = validateManagerDecision({ hold: false, description: 'Request', note: 'Proceed with candidate.', candidateId: '1', hasCurrentCapacityCheck: false });
  assert.equal(result.valid, false);
  assert.match(result.message, /current capacity check/);
});
test('a current capacity check with no candidate is distinct from capacity not assessed', () => {
  const result = validateManagerDecision({ hold: false, description: 'Request', note: 'No fit.', candidateId: '', hasCurrentCapacityCheck: true });
  assert.equal(result.valid, false);
  assert.match(result.message, /Select a potential candidate/);
});
test('candidate selection requires schedule and dependency confirmation, while a hold does not', () => {
  const missingConfirmation = validateManagerDecision({ hold: false, description: 'Request', note: 'Proceed.', candidateId: '1', hasCurrentCapacityCheck: true, scheduleConfirmed: false });
  assert.equal(missingConfirmation.valid, false);
  assert.match(missingConfirmation.message, /schedule and dependencies/);
  assert.equal(validateManagerDecision({ hold: false, description: 'Request', note: 'Proceed.', candidateId: '1', hasCurrentCapacityCheck: true, scheduleConfirmed: true }).valid, true);
  assert.equal(validateManagerDecision({ hold: true, description: 'Request', note: 'Hold.', candidateId: '', hasCurrentCapacityCheck: false, scheduleConfirmed: false }).valid, true);
});
test('schedule confirmation state resets when a candidate or capacity input changes', () => {
  const state = createScheduleConfirmationState();
  state.set(true);
  state.reset();
  assert.equal(state.isConfirmed(), false);
});
test('editing a decision input clears a previous success message without changing validation state', () => {
  const state = createDecisionMessageState();
  state.set('Request marked on hold. Capacity not assessed. No work was assigned.');
  state.clear();
  assert.deepEqual(state.snapshot(), { message: '', isError: false });
  assert.equal(validateManagerDecision({ hold: true, description: 'Request', note: 'Hold.', candidateId: '', hasCurrentCapacityCheck: false }).valid, true);
});
