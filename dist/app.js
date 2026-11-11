(() => {
  const { checkAvailability } = window.TeamFitLogic;
  const review = window.TeamFitReview.createReviewState();
  const { validateManagerDecision, createDecisionMessageState, createScheduleConfirmationState } = window.TeamFitDecision;
  const { deriveReviewState, buildReviewSummary, getDemoScenario, fourWeekdayRange } = window.TeamFitReviewState;
  const { createHoldDraft, formatHoldDraft } = window.TeamFitHoldNote;
  const today = new Date().toISOString().slice(0, 10);
  const plusDays = (days) => { const date = new Date(`${today}T00:00:00`); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };
  let team = [
    { id: 1, name: 'Maya Chen', skills: 'Graphic design, Layout', dailyCapacity: 6, committedHours: 18, lastConfirmed: plusDays(-3) },
    { id: 2, name: 'Jordan Lee', skills: 'Copywriting, Editing', dailyCapacity: 7, committedHours: 26, lastConfirmed: plusDays(-5) },
    { id: 3, name: 'Priya Shah', skills: 'Content planning, Research', dailyCapacity: 6, committedHours: 22, lastConfirmed: plusDays(-21) },
    { id: 4, name: 'Owen Martin', skills: 'Proofreading, Quality review', dailyCapacity: 5, committedHours: 12, lastConfirmed: '' },
    { id: 5, name: 'Sofia Alvarez', skills: 'Graphic design, Illustration', dailyCapacity: 6, committedHours: 30, lastConfirmed: plusDays(-2) }
  ];
  const baselineCommittedHours = Object.fromEntries(team.map((member) => [member.id, member.committedHours]));
  let latestResults = [], activeDraft = null, hasCurrentCapacityCheck = false;
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const teamBody = $('#team-body'), staffingResults = $('#staffing-results'), commitmentConfirmation = $('#confirm-commitments');
  const decisionMessageState = createDecisionMessageState(), scheduleConfirmationState = createScheduleConfirmationState();
  const rangeKey = () => `${$('#start-date').value}|${$('#deadline').value}`;

  function currentRequest() { return { description: $('#description').value.trim(), requiredSkill: $('#skill').value.trim(), estimatedHours: Number($('#hours').value), confirmedHours: Number($('#confirm-hours').value), startDate: $('#start-date').value, deadline: $('#deadline').value, committedHoursConfirmed: commitmentConfirmation.checked }; }
  function currentReview() { const request = currentRequest(); return { title: $('#request-title').value.trim(), description: request.description, skill: request.requiredSkill, estimatedHours: $('#hours').value, confirmedHours: $('#confirm-hours').value, startDate: request.startDate, deadline: request.deadline, materials: $('#materials').value.trim(), hasCurrentCapacityCheck, qualifiedCount: latestResults.filter((item) => item.status === 'qualified').length }; }
  function updateRangeLabels() { const label = `${$('#start-date').value || 'start date'} to ${$('#deadline').value || 'deadline'}`; $('#selected-range').textContent = label; $('#review-range').textContent = label; }
  function setInterpretStatus(message, isError = false) { const status = $('#interpret-status'); status.textContent = message; status.classList.toggle('error-message', isError); }
  function renderDecisionMessage() { const state = decisionMessageState.snapshot(), message = $('#decision-message'); message.textContent = state.message; message.classList.toggle('error-message', state.isError); }
  function setDecisionMessage(message, isError = false) { decisionMessageState.set(message, isError); renderDecisionMessage(); }
  function clearDecisionMessage() { decisionMessageState.clear(); renderDecisionMessage(); }
  function resetScheduleConfirmation() { scheduleConfirmationState.reset(); $('#confirm-schedule').checked = false; }
  function updateScheduleConfirmation() { const confirmation = $('#confirm-schedule'); confirmation.disabled = !hasCurrentCapacityCheck || !$('#candidate').value || $('#hold').checked; if (confirmation.disabled) resetScheduleConfirmation(); }

  function refreshRequestSummary() {
    const request = currentReview();
    const matchingEffort = request.estimatedHours && request.confirmedHours && Number(request.estimatedHours) === Number(request.confirmedHours);
    $('#summary-description').textContent = request.description || 'No work description confirmed.';
    $('#summary-skill').textContent = request.skill || 'Not confirmed';
    $('#summary-effort').textContent = matchingEffort ? `${request.estimatedHours} hours confirmed` : 'Not confirmed';
    $('#summary-dates').textContent = request.startDate && request.deadline ? `${request.startDate} to ${request.deadline}` : 'Not confirmed';
    $('#summary-materials').textContent = request.materials || 'Not confirmed';
  }

  function refreshWorkspace() {
    const state = deriveReviewState(currentReview());
    $('#request-title-display').textContent = currentReview().title || 'Untitled client request';
    $('#request-status').textContent = state.status;
    $('#request-status').className = `status ${state.status === 'Needs clarification' ? 'status-warning' : state.status === 'Ready for capacity check' ? 'status-ready' : state.status === 'Potential candidates found' ? 'status-candidate' : 'status-muted'}`;
    $('#next-action').textContent = state.nextAction;
    const list = $('#blocker-list'); list.innerHTML = state.blockers.map((blocker) => `<li>${esc(blocker)}</li>`).join('');
    $('#blocker-empty').hidden = Boolean(state.blockers.length);
    refreshRequestSummary();
  }

  function prepareHoldNote() {
    const state = deriveReviewState(currentReview());
    const draft = createHoldDraft({ blockers: state.blockers, capacityAssessed: hasCurrentCapacityCheck });
    $('#hold-client-questions').value = draft.clientQuestions.map((question) => `- ${question}`).join('\n');
    $('#hold-internal-checks').value = draft.internalChecks.map((check) => `- ${check}`).join('\n');
    $('#hold-note-draft').hidden = false;
    $('#hold-draft-status').textContent = 'Draft prepared. Review and edit it before adding it to the decision note.';
    $('#hold-client-questions').focus();
  }

  function addHoldDraftToNote() {
    const addition = formatHoldDraft({ clientQuestions: $('#hold-client-questions').value, internalChecks: $('#hold-internal-checks').value });
    if (!addition) { $('#hold-draft-status').textContent = 'Add a client question or internal check before copying this draft.'; return; }
    const note = $('#decision-note');
    note.value = note.value.trim() ? `${note.value.trim()}\n\n${addition}` : addition;
    clearDecisionMessage();
    $('#hold-draft-status').textContent = 'Draft added to the decision note. Select “Put this request on hold” and record the decision when ready.';
    note.focus();
  }

  function copyReviewSummary() {
    const state = deriveReviewState(currentReview());
    const capacityState = hasCurrentCapacityCheck ? `${latestResults.filter((item) => item.status === 'qualified').length} potential candidate(s) under the aggregate rules.` : 'Capacity has not been assessed.';
    const text = buildReviewSummary({ title: currentReview().title, status: state.status, nextAction: state.nextAction, blockers: state.blockers, decisionNote: $('#decision-note').value, capacityState });
    const status = $('#copy-review-status'), done = () => { status.textContent = 'Review summary copied. It contains no team-table data.'; };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(() => { status.textContent = 'Could not copy automatically. Select and copy the manager note instead.'; });
    else status.textContent = 'Automatic copy is unavailable in this browser.';
  }

  function loadDemoScenario() {
    const scenario = $('#demo-scenario').value;
    if (!scenario) return;
    const dates = scenario === 'candidate' ? fourWeekdayRange(today) : { startDate: plusDays(1), deadline: plusDays(5) };
    const preset = getDemoScenario(scenario, dates.startDate, dates.deadline), values = preset.request;
    team.forEach((member) => { member.committedHours = baselineCommittedHours[member.id]; });
    Object.entries(preset.committedHoursByMember || {}).forEach(([id, hours]) => { const member = team.find((person) => person.id === Number(id)); if (member) member.committedHours = hours; });
    renderTeam(); $('#description').value = values.description; $('#skill').value = values.skill; $('#hours').value = values.hours; $('#confirm-hours').value = values.hours; $('#start-date').value = values.startDate; $('#deadline').value = values.deadline; $('#materials').value = values.materials; $('#client-request').value = values.source; $('#decision-note').value = ''; $('#hold').checked = false; commitmentConfirmation.checked = false; updateRangeLabels(); invalidateCapacityAssessment('Synthetic scenario loaded. Review the displayed inputs before checking capacity or recording a hold.');
    if (scenario === 'candidate' || scenario === 'insufficient') { commitmentConfirmation.checked = true; confirmedRangeKey = rangeKey(); }
    $('#request-editor').open = true;
  }

  function renderDecisionState() {
    const candidate = $('#candidate'), guidance = $('#candidate-guidance'), qualified = latestResults.filter((item) => item.status === 'qualified');
    resetScheduleConfirmation();
    if (!hasCurrentCapacityCheck) { candidate.disabled = true; candidate.innerHTML = '<option value="">Capacity not assessed</option>'; guidance.textContent = 'Run the capacity check before choosing a potential candidate. You can still record a hold.'; updateScheduleConfirmation(); return; }
    candidate.disabled = !qualified.length;
    candidate.innerHTML = qualified.length ? `<option value="">Choose a potential candidate</option>${qualified.map((item) => `<option value="${item.id}">${esc(item.name)} - ${item.confirmedCapacity} estimated hours</option>`).join('')}` : '<option value="">No potential candidate meets aggregate criteria</option>';
    guidance.textContent = qualified.length ? 'Selecting a candidate records manager follow-up only. Confirm schedule and dependencies before saving.' : 'No potential candidate met the aggregate criteria. You can revise details or record a hold.';
    updateScheduleConfirmation();
  }
  function renderStaffingPending(message = 'Potential candidates appear here only after the manager confirms request inputs and runs the aggregate capacity check.') { staffingResults.innerHTML = `<h2>Capacity has not been assessed</h2><p>${esc(message)}</p>`; }
  function invalidateCapacityAssessment(message = 'Request details changed. Confirm the current inputs before checking capacity again.') { hasCurrentCapacityCheck = false; latestResults = []; resetScheduleConfirmation(); clearDecisionMessage(); renderStaffingPending(message); renderDecisionState(); refreshWorkspace(); }
  function requireCommitmentReview() { commitmentConfirmation.checked = false; updateRangeLabels(); invalidateCapacityAssessment('The selected dates changed. Review committed work again before checking capacity.'); }

  function renderTeam() { teamBody.innerHTML = team.map((member) => `<tr data-id="${member.id}"><td><input aria-label="Name" data-key="name" value="${esc(member.name)}"></td><td><input aria-label="Skills" data-key="skills" value="${esc(member.skills)}"></td><td><input aria-label="Daily capacity" type="number" min="0" data-key="dailyCapacity" value="${member.dailyCapacity}"></td><td><input aria-label="Committed work within selected dates" type="number" min="0" data-key="committedHours" value="${member.committedHours}"></td><td><input aria-label="Last availability confirmation" type="date" data-key="lastConfirmed" value="${member.lastConfirmed}"></td></tr>`).join(''); }
  teamBody.addEventListener('input', (event) => { const input = event.target, member = team.find((person) => person.id === Number(input.closest('tr').dataset.id)); member[input.dataset.key] = ['dailyCapacity', 'committedHours'].includes(input.dataset.key) ? Number(input.value) : input.value; if (input.dataset.key === 'committedHours') commitmentConfirmation.checked = false; invalidateCapacityAssessment('Team capacity inputs changed. Review the request again before checking capacity.'); });

  function capacityReason(item) { return `Skill match; ${item.confirmedCapacity} estimated remaining hours within selected dates.`; }
  function renderResults() {
    const qualified = latestResults.filter((item) => item.status === 'qualified');
    const notes = latestResults.filter((item) => item.status !== 'qualified');
    if (!qualified.length) {
      staffingResults.innerHTML = `<h2>No potential candidate meets aggregate criteria</h2><p>Review blockers and team workload inputs, or record a hold. This does not mean the request was declined.</p>${notes.length ? `<p class="results-note">${notes.length} team member${notes.length === 1 ? '' : 's'} need a different skill, more aggregate capacity, commitment review, or newer availability information.</p>` : ''}`;
    } else {
      staffingResults.innerHTML = `<h2>Potential candidates</h2><p>These people meet the rule-based aggregate check. They are not assigned and this is not a commitment to the client.</p><table class="candidate-table"><thead><tr><th>Person</th><th>Why they are a potential candidate</th><th>Estimated remaining capacity</th></tr></thead><tbody>${qualified.map((item) => `<tr><td><strong>${esc(item.name)}</strong><small>${esc(item.skills)}</small></td><td>${esc(capacityReason(item))}<small>Availability information and committed work were reviewed for this calculation.</small></td><td><strong>${item.confirmedCapacity} hrs</strong><small>${item.dailyCapacity} hrs/day x ${item.workdays} weekdays - ${item.committedTaskHours} committed hrs</small></td></tr>`).join('')}</tbody></table>${notes.length ? `<p class="results-note">${notes.length} other team member${notes.length === 1 ? '' : 's'} did not meet this aggregate check.</p>` : ''}`;
    }
    staffingResults.insertAdjacentHTML('beforeend', '<p class="results-note">Aggregate capacity does not check daily schedules, leave, time blocks, holidays, or dependencies. A manager must confirm these before selecting a candidate.</p>');
    renderDecisionState(); refreshWorkspace();
  }

  function checkCapacity() {
    const request = currentRequest();
    if (request.estimatedHours !== request.confirmedHours) return setDecisionMessage('Enter the same effort estimate in both fields before checking capacity.', true);
    if (!request.requiredSkill || !request.startDate || !request.deadline || !request.estimatedHours) return setDecisionMessage('Confirm the required skill, estimate, start date, and deadline before checking capacity.', true);
    if (request.deadline < request.startDate) return setDecisionMessage('The deadline must be on or after the start date.', true);
    latestResults = checkAvailability(team, request); hasCurrentCapacityCheck = true; clearDecisionMessage(); renderResults();
  }

  $('#check-capacity').addEventListener('click', checkCapacity);
  $('#review-form').addEventListener('submit', (event) => { event.preventDefault(); const hold = $('#hold').checked, candidate = $('#candidate').selectedOptions[0]?.textContent, decision = validateManagerDecision({ hold, description: $('#description').value, note: $('#decision-note').value, candidateId: $('#candidate').value, hasCurrentCapacityCheck, scheduleConfirmed: scheduleConfirmationState.isConfirmed() }); if (!decision.valid) return setDecisionMessage(decision.message, true); setDecisionMessage(hold ? 'Hold noted for this open review. It is not saved after refresh.' : `${decision.message} Potential candidate: ${candidate}. This is not an assignment or client commitment.`); });

  function factSection(title, key, items, formatter, field = 'text') { return `<section class="ai-facts"><h4>${title}</h4>${items.length ? items.map((item, index) => { const invalid = item.supported === false; return `<label class="ai-fact ${invalid ? 'unsupported' : ''}"><input type="checkbox" data-kind="${key}" data-index="${index}" ${invalid ? 'disabled' : 'checked'}><span><input class="ai-fact-edit" data-kind="${key}" data-index="${index}" data-field="${field}" value="${esc(item[field])}" ${invalid ? 'disabled' : ''}>${formatter(item)}${item.excerpt ? `<small>Evidence: "${esc(item.excerpt)}"</small>` : ''}${invalid ? '<small>Unsupported: excerpt was not found in the original request.</small>' : ''}</span></label>`; }).join('') : '<p class="empty">None stated</p>'}</section>`; }
  function renderDraft(draft, source) { activeDraft = draft; review.setDraft(source); $('#original-request').textContent = source; $('#approve-ai-draft').checked = false; $('#copy-ai-draft').disabled = true; $('#copy-status').textContent = ''; $('#draft-facts').innerHTML = `${factSection('Deliverables', 'deliverables', draft.deliverables, () => '', 'text')}${factSection('Quantities', 'quantities', draft.quantities, (item) => `<small>Linked deliverable: ${esc(item.deliverable)}</small>`, 'quantity')}${factSection('Deadlines', 'deadlines', draft.deadlines, (item) => item.needs_clarification ? '<small>Clarification needed</small>' : '', 'text')}${factSection('Materials', 'materials', draft.materials, (item) => `<small>Status: ${esc(item.status)}</small>`, 'text')}<section class="ai-facts"><h4>Missing information</h4>${draft.missing_information.length ? `<ul>${draft.missing_information.map((item) => `<li>${esc(item.item)}: ${esc(item.question)}</li>`).join('')}</ul>` : '<p class="empty">None identified</p>'}</section><section class="ai-facts"><h4>Clarification questions</h4>${draft.clarification_questions.length ? `<ul>${draft.clarification_questions.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : '<p class="empty">None identified</p>'}</section>`; $('#ai-draft').hidden = false; }
  $('#draft-facts').addEventListener('input', (event) => { const input = event.target; if (!input.classList.contains('ai-fact-edit') || !activeDraft) return; activeDraft[input.dataset.kind][Number(input.dataset.index)][input.dataset.field] = input.value; $('#approve-ai-draft').checked = false; $('#copy-ai-draft').disabled = true; $('#copy-status').textContent = 'Draft changed. Review and approve it again before copying.'; });
  $('#interpret-button').addEventListener('click', async () => { const text = $('#client-request').value.trim(), button = $('#interpret-button'); if (text.length < 10) return setInterpretStatus('Enter at least 10 characters of request text.', true); button.disabled = true; setInterpretStatus('Interpreting request...'); $('#ai-draft').hidden = true; try { const response = await fetch('/api/interpret-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestText: text }) }); const contentType = response.headers.get('content-type') || ''; if (!contentType.includes('application/json')) throw new Error(`The local server returned a non-JSON response (HTTP ${response.status}). Restart TeamFit and try again.`); const data = await response.json(); if (!response.ok) throw new Error(data.error || `Interpretation failed (HTTP ${response.status}).`); renderDraft(data.draft, text); setInterpretStatus(`Draft received from ${data.model}. Review before copying anything.`); } catch (error) { activeDraft = null; setInterpretStatus(error.message || 'Interpretation failed. Nothing was applied.', true); } finally { button.disabled = false; } });
  $('#client-request').addEventListener('input', () => { if (activeDraft && review.sourceChanged($('#client-request').value.trim())) { activeDraft = null; $('#ai-draft').hidden = true; $('#approve-ai-draft').checked = false; $('#copy-ai-draft').disabled = true; setInterpretStatus('Source text changed. The prior AI draft approval was invalidated.', true); } });
  $('#approve-ai-draft').addEventListener('change', (event) => { const valid = event.target.checked && activeDraft && review.approve($('#client-request').value.trim()); $('#copy-ai-draft').disabled = !valid; if (!valid) event.target.checked = false; });
  $('#copy-ai-draft').addEventListener('click', () => { const result = TeamFitReview.copySelectedFacts({ draft: activeDraft || {}, selectedFacts: [...$('#draft-facts').querySelectorAll('input[type="checkbox"][data-kind]:checked')].map((input) => ({ kind: input.dataset.kind, index: Number(input.dataset.index) })), existingDescription: $('#description').value, allowReplace: $('#replace-description').checked, approved: Boolean(activeDraft && review.isApproved($('#client-request').value.trim())) }); $('#copy-status').textContent = result.message; $('#copy-status').classList.toggle('error-message', !result.changed); if (!result.changed) return; $('#description').value = result.description; invalidateCapacityAssessment(); if (result.deadline) { $('#deadline').value = result.deadline; $('#deadline').dispatchEvent(new Event('change')); } });

  $('#prepare-hold-note').addEventListener('click', prepareHoldNote); $('#add-hold-draft').addEventListener('click', addHoldDraftToNote); $('#copy-review-summary').addEventListener('click', copyReviewSummary); $('#load-demo-scenario').addEventListener('click', loadDemoScenario);
  $('#open-source-message').addEventListener('click', (event) => { event.preventDefault(); const source = $('#original-message'); source.open = true; source.scrollIntoView({ behavior: 'smooth', block: 'start' }); requestAnimationFrame(() => source.querySelector('summary').focus({ preventScroll: true })); });
  $('#decision-note').addEventListener('input', clearDecisionMessage); $('#hold').addEventListener('change', () => { resetScheduleConfirmation(); updateScheduleConfirmation(); clearDecisionMessage(); }); $('#candidate').addEventListener('change', () => { resetScheduleConfirmation(); updateScheduleConfirmation(); clearDecisionMessage(); }); $('#confirm-schedule').addEventListener('change', () => { scheduleConfirmationState.set($('#confirm-schedule').checked); clearDecisionMessage(); });
  [$('#request-title'), $('#description'), $('#skill'), $('#hours'), $('#confirm-hours'), $('#materials')].forEach((field) => field.addEventListener('input', () => invalidateCapacityAssessment()));
  let confirmedRangeKey = ''; commitmentConfirmation.addEventListener('change', () => { if (commitmentConfirmation.checked) confirmedRangeKey = rangeKey(); invalidateCapacityAssessment('Committed-work confirmation changed. Review the request before checking capacity again.'); }); [$('#start-date'), $('#deadline')].forEach((field) => field.addEventListener('change', () => { if (rangeKey() !== confirmedRangeKey) requireCommitmentReview(); }));
  updateRangeLabels(); renderTeam(); renderDecisionState(); refreshWorkspace();
})();
