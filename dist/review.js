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

  const api = { deriveReviewState };
  if (typeof module !== 'undefined') module.exports = api;
  root.TeamFitReviewState = api;
})(typeof window !== 'undefined' ? window : globalThis);
