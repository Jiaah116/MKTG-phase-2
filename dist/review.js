(function (root) {
  function deriveReviewState({ title, description, skill, estimatedHours, confirmedHours, startDate, deadline, materials, hasCurrentCapacityCheck, qualifiedCount }) {
    const blockers = [];
    if (!String(title || '').trim()) blockers.push('Add a request title.');
    if (!String(description || '').trim()) blockers.push('Confirm the work requested.');
    if (!String(deadline || '').trim()) blockers.push('Confirm the client deadline.');
    if (!String(materials || '').trim()) blockers.push('Confirm required materials or approvals.');
    if (!String(skill || '').trim()) blockers.push('Confirm the required skill.');
    if (!estimatedHours || !confirmedHours || Number(estimatedHours) !== Number(confirmedHours)) blockers.push('Confirm the effort estimate.');
    if (!String(startDate || '').trim()) blockers.push('Confirm the intended start date.');

    if (blockers.length) return { status: 'Needs clarification', nextAction: 'Put the request on hold and follow up on the unresolved details.', blockers };
    if (!hasCurrentCapacityCheck) return { status: 'Ready for capacity check', nextAction: 'Review committed work for the selected dates, then check aggregate capacity.', blockers };
    if (qualifiedCount) return { status: 'Potential candidates found', nextAction: 'Review a candidate schedule and dependencies before recording a selection.', blockers };
    return { status: 'No potential candidate found', nextAction: 'Record a hold or revise the request details before checking again.', blockers };
  }

  function buildReviewSummary({ title, status, nextAction, blockers = [], decisionNote = '', capacityState = 'Capacity has not been assessed.' }) {
    const lines = [`TeamFit review: ${title || 'Untitled client request'}`, `Status: ${status}`, `Next action: ${nextAction}`, `Capacity: ${capacityState}`];
    if (blockers.length) lines.push(`Unresolved items: ${blockers.join(' | ')}`);
    if (String(decisionNote).trim()) lines.push(`Manager note: ${String(decisionNote).trim()}`);
    return lines.join('\n');
  }

  function getDemoScenario(name, startDate, deadline) {
    const scenarios = {
      missing: { request: { description: 'Create campaign graphics for the spring launch.', skill: '', hours: '', startDate: '', deadline: '', materials: '', source: 'Please create campaign graphics. The deadline and materials are still being confirmed.' } },
      candidate: { request: { description: 'Create two launch graphics using approved copy.', skill: 'Graphic design', hours: '10', startDate, deadline, materials: 'Approved copy and brand guidelines supplied.', source: 'Create two launch graphics using approved copy and brand guidelines.' }, committedHoursByMember: { 1: 14 } },
      insufficient: { request: { description: 'Create a large launch graphics package.', skill: 'Graphic design', hours: '60', startDate, deadline, materials: 'Approved copy and brand guidelines supplied.', source: 'Create a large launch graphics package with approved materials.' } },
      friday: { request: { description: 'Create campaign graphics.', skill: '', hours: '', startDate: '', deadline: '', materials: '', source: 'Please create campaign graphics by Friday. Image dimensions and final approval are not confirmed.' } }
    };
    return scenarios[name] || null;
  }

  function fourWeekdayRange(afterDate) {
    const start = new Date(`${afterDate}T12:00:00Z`);
    start.setUTCDate(start.getUTCDate() + 1);
    while ([0, 6].includes(start.getUTCDay())) start.setUTCDate(start.getUTCDate() + 1);
    const end = new Date(start);
    let weekdays = 0;
    while (weekdays < 4) {
      if (![0, 6].includes(end.getUTCDay())) weekdays += 1;
      if (weekdays < 4) end.setUTCDate(end.getUTCDate() + 1);
    }
    return { startDate: start.toISOString().slice(0, 10), deadline: end.toISOString().slice(0, 10) };
  }

  const api = { deriveReviewState, buildReviewSummary, getDemoScenario, fourWeekdayRange };
  if (typeof module !== 'undefined') module.exports = api;
  root.TeamFitReviewState = api;
})(typeof window !== 'undefined' ? window : globalThis);
