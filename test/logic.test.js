const assert = require('node:assert/strict');
const test = require('node:test');
const { checkAvailability, businessDaysInclusive } = require('../dist/logic.js');

const member = (overrides = {}) => ({ id: 1, name: 'Alex', skills: 'Frontend, QA', dailyCapacity: 6, committedHours: 2, lastConfirmed: '2026-10-01', ...overrides });
const request = (overrides = {}) => ({ requiredSkill: 'Frontend', estimatedHours: 14, startDate: '2026-10-05', deadline: '2026-10-07', ...overrides });

test('normal case: matching skill and confirmed capacity qualifies', () => {
  assert.equal(checkAvailability([member()], request())[0].status, 'qualified');
});
test('insufficient capacity: confirmed capacity below estimate is rejected', () => {
  assert.equal(checkAvailability([member({ committedHours: 15 })], request({ estimatedHours: 10 }))[0].status, 'insufficient-capacity');
});
test('missing information: absent confirmation is never confirmed capacity', () => {
  assert.equal(checkAvailability([member({ lastConfirmed: '' })], request())[0].status, 'needs-confirmation');
});
test('boundary case: 14-day-old confirmation counts and weekends are excluded', () => {
  const result = checkAvailability([member({ lastConfirmed: '2026-09-21', committedHours: 0 })], request({ startDate: '2026-10-05', deadline: '2026-10-11', estimatedHours: 30 }))[0];
  assert.equal(businessDaysInclusive('2026-10-05', '2026-10-11'), 5);
  assert.equal(result.status, 'qualified');
});
test('October 24 through November 2, 2026 counts six weekdays across daylight saving time', () => {
  assert.equal(businessDaysInclusive('2026-10-24', '2026-11-02'), 6);
  const result = checkAvailability([member({ dailyCapacity: 6, committedHours: 8 })], request({ startDate: '2026-10-24', deadline: '2026-11-02', estimatedHours: 28 }))[0];
  assert.equal(result.workdays, 6);
  assert.equal(result.totalPeriodCapacity, 36);
  assert.equal(result.netCapacity, 28);
});
test('same-day weekday request counts the requested Monday inclusively', () => {
  const result = checkAvailability([member({ dailyCapacity: 6, committedHours: 2, lastConfirmed: '2026-10-20' })], request({ startDate: '2026-10-26', deadline: '2026-10-26', estimatedHours: 4 }))[0];
  assert.equal(result.workdays, 1);
  assert.equal(result.netCapacity, 4);
  assert.equal(result.status, 'qualified');
});
test('unreconfirmed committed work prevents a confirmed candidate for a changed date range', () => {
  const result = checkAvailability([member()], request({ committedHoursConfirmed: false }))[0];
  assert.equal(result.status, 'needs-commitment-review');
  assert.equal(result.netCapacity, 16);
  assert.equal(result.confirmedCapacity, 0);
});
