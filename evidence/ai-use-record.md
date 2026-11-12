# TeamFit AI Use Record

## 1. Codex during development and documentation

Codex was used as a development assistant for implementation, debugging, documentation, and test support. Human team members remained responsible for reviewing code changes, running browser checks, supplying stakeholder findings, deciding what evidence to record, and approving all submission claims.

| Development example | What Codex helped with | What a human reviewed or verified | Supporting evidence |
| --- | --- | --- | --- |
| Potential-candidate preset correction | Diagnosed why the original preset did not qualify Maya Chen, updated the synthetic preset to use 14 committed hours, corrected its generated date range to include four weekdays, and added an offline regression test. | A human ran the final browser retest without changing inputs and confirmed that Maya appeared with 10 estimated remaining hours. | [Evaluation test log](evaluation-test-log.md#potential-candidate-preset-correction); [review test](../test/review.test.js); screenshot [02-potential-candidate-preset-fixed(updated).png](<02-potential-candidate-preset-fixed(updated).png>) |
| Hold-note workflow | Helped implement an editable hold-note draft that separates client questions from internal checks and appends the draft without replacing an existing manager note. Added focused offline coverage. | A human documented the browser hold/note-preservation result. The browser log states that the existing note remained above the appended draft. | [Evaluation test log](evaluation-test-log.md#initial-manual-browser-checks); [hold-note tests](../test/hold-note.test.js); [hold-note module](../dist/hold-note.js) |
| First-review guidance | Helped implement a dismissible first-review guide after an HR manager said the workflow initially took time to understand. The guide explains when to hold a request, when to check capacity, and that a potential candidate is not an assignment. | The HR manager who raised the concern viewed the final version, liked the guide, and said those three distinctions were clear. | [Stakeholder findings](stakeholder-findings.md#feedback-led-update-implemented); [evaluation test log](evaluation-test-log.md#feedback-led-revision) |
| Evaluation and submission documentation | Helped organize the comparison results, stakeholder feedback, checklist, and evidence links. | Human team members provided the participant roles, elapsed times, and feedback. The team must review the final brief and slides before submission. | [Evaluation test log](evaluation-test-log.md#manual-baseline-comparison-and-participant-findings); [stakeholder findings](stakeholder-findings.md); [submission checklist](phase-2-submission-checklist.md) |

The exact amount of developer time saved, all individual prompts, and any external use of Codex outside the repository/session evidence are **not recorded**.

## 2. Optional OpenAI interpretation inside TeamFit

TeamFit includes an optional request-interpretation feature. When a manager chooses **Interpret message**, the local TeamFit server sends the pasted client request text together with fixed extraction instructions and a JSON schema to the OpenAI Responses API. It requests stated deliverables, linked quantities, deadlines as written, supplied or missing materials, missing information, and clarification questions.

The feature does **not** send the team table, employee skills, availability confirmations, committed work, or capacity results. TeamFit sets `store: false` on the OpenAI request. OpenAI-side retention and access policies were not verified for this prototype.

The returned draft is not treated as confirmed information automatically. TeamFit checks whether every evidence excerpt is an exact continuous substring of the submitted request. Unsupported items are flagged and cannot be copied. The manager must review the draft and explicitly approve selected supported facts before copying them into the manual request form. Effort estimates and required skills remain manager-entered and confirmed.

## 3. Data and human approval boundaries

All prototype requests, team members, availability values, and workload data used in the documented demonstrations and tests are **synthetic**. No real client data was used in the recorded evaluation.

AI does not assign work, approve a client commitment, confirm a deadline, create an effort estimate, or make the final staffing decision. The manager reviews the request, verifies outputs, checks schedule and dependencies, and records the final hold or candidate-selection decision.

The documented manual browser checks used synthetic scenarios and did **not** run a paid live OpenAI interpretation request. Live interpretation performance, external retention, cost, latency, and performance on real client requests are **not verified** for this prototype.
