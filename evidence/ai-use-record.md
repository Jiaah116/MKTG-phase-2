# TeamFit AI Use Record

## 1. Codex during development

Codex was used as a development assistant for implementation, debugging, documentation, and test support. Human team members remained responsible for reviewing code changes, running browser checks, deciding what evidence to record, and approving any submission claims.

| Development example | What Codex helped with | What a human reviewed or verified | Supporting evidence |
| --- | --- | --- | --- |
| Potential candidate preset correction | Diagnosed why the original preset did not qualify Maya Chen, changed the synthetic preset to use 14 committed hours, then corrected its generated date range to include four weekdays. Added an offline regression test for the Wednesday-start failure. | A human ran the final Chrome retest without changing inputs and confirmed that Maya appeared with 10 estimated remaining hours. | [Evaluation test log](evaluation-test-log.md#potential-candidate-preset-correction); [review test](../test/review.test.js); screenshot [02-potential-candidate-preset-fixed(updated).png](<02-potential-candidate-preset-fixed(updated).png>) |
| Hold-note workflow | Helped implement an editable hold-note draft that separates client questions from internal checks and appends the draft without replacing an existing manager note. Added focused offline coverage. | A human documented the browser hold/note-preservation result. The browser log states the existing note remained above the appended draft. | [Evaluation test log](evaluation-test-log.md#manual-browser-checks); [hold-note tests](../test/hold-note.test.js); [hold-note module](../dist/hold-note.js) |
| Request Review redesign and test documentation | Helped reorganize the local prototype around one request, blockers, hold action, and manager decision controls. Helped create the browser regression checklist and update local setup/test documentation. | Human browser layout review is documented for desktop and mobile. Independent usability validation with real managers is **Not verified**. | [Browser checklist](../test/browser-checklist.md); [evaluation test log](evaluation-test-log.md#manual-browser-checks); [README](../README.md) |

The exact amount of developer time saved, all individual prompts, and any external use of Codex outside the repository/session evidence are **Not verified**.

## 2. Optional OpenAI interpretation inside TeamFit

TeamFit includes an optional request-interpretation feature. When a manager chooses **Interpret message**, the local TeamFit server sends the pasted client request text together with fixed extraction instructions and a JSON schema to the OpenAI Responses API. It requests stated deliverables, linked quantities, deadlines as written, supplied or missing materials, missing information, and clarification questions.

The feature does not send the team table, employee skills, availability confirmations, committed work, or capacity results. TeamFit sets `store: false` on the OpenAI request. OpenAI-side retention and access policies were not verified for this prototype.

The returned draft is not treated as confirmed information automatically. TeamFit checks whether every evidence excerpt is an exact continuous substring of the submitted request. Unsupported items are flagged and cannot be copied. The manager must review the draft and explicitly approve selected supported facts before copying them into the manual request form. Effort estimates and required skills remain manager-entered and confirmed.

The documented manual browser checks used synthetic scenarios and did **not** run the OpenAI interpretation feature. Live OpenAI interpretation behavior, external retention, cost, latency, and performance on real client requests are **Not verified** for this prototype.
