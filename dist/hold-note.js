(function (root) {
  const questionFor = {
    'Add a request title.': 'What title should we use for this request?',
    'Confirm the work requested.': 'Please confirm the work requested and the expected deliverables.',
    'Confirm the client deadline.': 'What is the final client deadline?',
    'Confirm required materials or approvals.': 'Which materials and approvals will be supplied, and when?',
    'Confirm the required skill.': 'Which skill is required for this work?',
    'Confirm the effort estimate.': 'What effort estimate should we use for this request?',
    'Confirm the intended start date.': 'When can this work start?'
  };

  function createHoldDraft({ blockers = [], capacityAssessed = false }) {
    const clientQuestions = blockers.map((blocker) => questionFor[blocker] || blocker).filter(Boolean);
    const internalChecks = [
      capacityAssessed ? 'Review the current aggregate capacity result before changing the hold.' : 'Capacity has not been assessed.',
      'Update the confirmed request details before any capacity check.',
      'Do not assign work or commit to the client from this draft.'
    ];
    return { clientQuestions, internalChecks };
  }

  function formatHoldDraft({ clientQuestions = '', internalChecks = '' }) {
    const parts = [];
    if (String(clientQuestions).trim()) parts.push(`Client follow-up:\n${String(clientQuestions).trim()}`);
    if (String(internalChecks).trim()) parts.push(`Internal checks:\n${String(internalChecks).trim()}`);
    return parts.join('\n\n');
  }

  const api = { createHoldDraft, formatHoldDraft };
  if (typeof module !== 'undefined') module.exports = api;
  root.TeamFitHoldNote = api;
})(typeof window !== 'undefined' ? window : globalThis);
