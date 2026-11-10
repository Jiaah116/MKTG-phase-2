# TeamFit Evaluation Test Log

| Input | Expected result | Observed result | Baseline result | Business consequence | Revision |
| --- | --- | --- | --- | --- | --- |
| **HOLD-01 — Spring launch graphics.** Synthetic request with an unconfirmed deadline and unconfirmed availability of approved copy and product photos. | Flag the deadline and materials as unconfirmed. Keep candidate selection unavailable and allow the manager to record a hold with a follow-up note. | TeamFit marked the deadline and materials as unconfirmed. The hold draft asked about both. Candidate selection remained unavailable. After the manager added the draft and recorded the hold, TeamFit confirmed the hold for the current session. | Pending. Manual review has not yet been run. | Treating the deadline or materials as confirmed could lead to an assignment or a client commitment before the team knows whether it can deliver. | No code changes were made during this test. |


## Manual Browser Checks

These checks used synthetic scenarios in Chrome. The OpenAI interpretation feature was not run.

| Check | Result | Observation |
| --- | --- | --- |
| Desktop layout | Pass | The request status, unresolved items, Prepare hold note button, and Record next step panel were visible together. |
| Hold and note preservation | Pass | The existing decision note remained above the appended draft. TeamFit confirmed that the hold was recorded for the open session. |
| Potential candidate | Preset failed; manual retest passed | The preset showed no eligible candidate. Maya had 6 hours available with 18 hours of committed work, below the 10-hour requirement. After changing her synthetic committed work to 14 hours, TeamFit showed her as a potential candidate with 10 hours available. The preset still needs correction and retesting. |
| Insufficient capacity | Pass | TeamFit displayed “No potential candidate meets aggregate criteria.” |
| Ambiguous Friday | Pass | The original message retained “by Friday,” and the request dates stayed unconfirmed. |
| Mobile layout at 400 px | Partial | The decision controls appeared below the unresolved items and fit within the viewport. The workload table required horizontal scrolling within the table to reach the rightmost columns. |
