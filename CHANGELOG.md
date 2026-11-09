# Changelog

## 2026-11-09

### Request Review workspace

- Reworked the main screen around reviewing one client request at a time, responding to TA feedback that it should feel like a daily manager work tool rather than a presentation.
- Added a compact desktop two-column workspace: request summary and unresolved items on the left; manager decision controls on the right. Staffing results, manual request editing, and workload inputs now sit below the main decision area.
- Added a slim request/status header, compact summary rows, a visible hold action, and an expandable original-client-message section. At narrow widths, decision controls follow the unresolved items.

### Hold follow-up workflow

- Added **Prepare hold note**, which creates editable, separate drafts for client questions and internal checks from the current blockers.
- Adding the draft appends it to the decision note rather than replacing existing manager text.
- Preparing a draft does not record a hold. A manager must still select **Put this request on hold** and submit the decision; holds remain possible when effort, skill, or dates are unknown.

### Verification

- Added offline tests for request-review state and hold-note drafting/formatting.
- The offline suite does not call OpenAI. Browser layout checks are manual/local checks, not automated acceptance tests.
