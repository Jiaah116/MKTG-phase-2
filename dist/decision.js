(function (root) {
  function validateManagerDecision({ hold, description, note, candidateId, hasCurrentCapacityCheck, scheduleConfirmed }) {
    if (!String(description || '').trim()) return { valid: false, message: 'Add a task description before saving a manager decision.' };
    if (!String(note || '').trim()) return { valid: false, message: 'Add a decision note for the manager record.' };
    if (hold) return { valid: true, message: hasCurrentCapacityCheck ? 'Request marked on hold after capacity assessment. No work was assigned.' : 'Request marked on hold. Capacity not assessed. No work was assigned.' };
    if (!hasCurrentCapacityCheck) return { valid: false, message: 'Run a current capacity check before selecting a candidate.' };
    if (!candidateId) return { valid: false, message: 'Select a potential candidate or put the request on hold.' };
    if (!scheduleConfirmed) return { valid: false, message: 'Confirm the candidate schedule and dependencies before saving a candidate-selection decision.' };
    return { valid: true, message: 'Candidate selected for manager follow-up. No work was assigned.' };
  }

  function createScheduleConfirmationState() {
    let confirmed = false;
    return {
      set(value) { confirmed = Boolean(value); },
      reset() { confirmed = false; },
      isConfirmed() { return confirmed; }
    };
  }

  function createDecisionMessageState() {
    let message = '';
    let isError = false;
    return {
      set(nextMessage, nextIsError = false) { message = nextMessage; isError = nextIsError; },
      clear() { message = ''; isError = false; },
      snapshot() { return { message, isError }; }
    };
  }

  const api = { validateManagerDecision, createDecisionMessageState, createScheduleConfirmationState };
  if (typeof module !== 'undefined') module.exports = api;
  root.TeamFitDecision = api;
})(typeof window !== 'undefined' ? window : globalThis);
