# TeamFit Phase 2 Submission Checklist

**Submission rule:** Submit one package per team. The written brief and demo deck are team deliverables; this checklist tracks the materials needed to support them.

## Final package

| Item | Requirement | TeamFit status | Owner / action before submission |
| --- | --- | --- | --- |
| Updated brief | One PDF, 5–7 main pages, organized under the six required headings | Not yet created | Team: write and export the final PDF. Link to detailed evidence instead of repeating it. |
| Working prototype | Accessible link or clear run instructions | Ready locally | Share the repository and use the local setup in `README.md`; test the instructions on another teammate’s computer. |
| Repository | Code, dependencies, setup, data status, known limitations | Ready | Keep `.env` and API keys out of the submission. |
| Evidence folder | Diagram, data/decision table, tests, stakeholder findings, AI Use Record, contributions | Partly ready | Complete the missing stakeholder, baseline, AI-use, and contribution records below. |
| Demonstration deck | Concise deck for in-class demonstration and defense | Not yet created | Team: make slides that match the prototype and final findings. |

## Required evidence

| Evidence | Status | File / next action |
| --- | --- | --- |
| Readable system diagram | Ready | `evidence/system-diagram.md` |
| Data and decision table | Ready | `evidence/data-and-decision-table.md` |
| Repeatable functional and failure tests | Ready | `evidence/evaluation-test-log.md` records hold, capacity, insufficient-capacity, ambiguous-date, and mobile checks. |
| Fair manual baseline comparison | Partly complete | Three exploratory manual-versus-TeamFit comparisons are recorded in `evidence/evaluation-test-log.md`. For a stronger final result, document the exact request, workload sheet, method order, and a pre-set detail checklist in the next run. |
| Stakeholder findings and one resulting change | Revision and follow-up feedback complete | Real feedback is recorded in `evidence/stakeholder-findings.md`. The HR manager who raised the workflow-clarity concern viewed the final version, liked the first-review guide, and clearly explained the hold, capacity-check, and manager-approved potential-candidate distinctions. |
| AI Use Record | Needs completion | `evidence/ai-use-record.md` currently contains browser-recheck notes, not an AI-use record. Replace or move those notes and record how Codex/AI contributed, what was human-reviewed, and relevant prompts/outputs or dated documentation. |
| Team contributions | Missing | Add a dated contribution record naming every member, their hands-on build/test task, review of another member’s work, and one business implication they can explain. |

## Written brief: six required headings

- [ ] Revised opportunity: customer, buyer, problem, segment, positioning, and Phase 1 changes with evidence.
- [ ] System and AI necessity: workflow, AI role, architecture, dependencies, simpler alternative, and diagram link.
- [ ] Data and responsible operation: table link, harmful-error scenario, safeguard, approvals, and human owner.
- [ ] Evaluation and findings: baseline, criteria set before testing, actual results, failures, revisions, and limits.
- [ ] Customer usefulness and adoption: consulted user, task, objections, design changes, buyer/sponsor, alternatives, and barriers.
- [ ] Business implications and next decision: preliminary economics, unresolved assumption, next test, and Pilot / Modify / Limit / Stop recommendation.
- [ ] Explain which AI Marketing Canvas ideas changed the team’s decisions.

## Demo and slide checklist

- [ ] Demonstrate the **spring launch graphics** request: original message, missing details, editable hold note, and recorded hold.
- [ ] Distinguish client questions (approved assets/date) from agency checks (estimated staff time/capacity).
- [ ] Demonstrate a complete request and capacity check; call the result a **potential candidate**, not an assignment.
- [ ] Explain the manager’s schedule/dependency check before any candidate decision.
- [ ] If the optional AI feature is shown, use synthetic text and show extraction evidence plus manager acceptance/correction.
- [ ] Clearly label synthetic data, simulated outcomes, mock integrations, and unimplemented capabilities.
- [ ] Every member can explain one result, one business implication, and their own hands-on contribution.

## Final pre-submit checks

- [ ] Verify every link, prototype instruction, and repository permission.
- [ ] Have a teammate run the prototype from the README without help.
- [ ] Ensure the brief, deck, evidence, and demo tell the same story and use only measured claims.
- [ ] Preserve a dated snapshot of the code and representative AI documentation.
- [ ] Do not expose credentials or sensitive/real client data.
