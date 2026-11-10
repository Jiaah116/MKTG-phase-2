# TeamFit Evaluation Test Log

| Input | Expected result | Observed result | Baseline result | Business consequence | Revision |
| --- | --- | --- | --- | --- | --- |
| **HOLD-01 — Spring launch graphics.** Synthetic request with an unconfirmed deadline and unconfirmed availability of approved copy and product photos. | Flag the deadline and materials as unconfirmed. Keep candidate selection unavailable and allow the manager to record a hold with a follow-up note. | TeamFit marked the deadline and materials as unconfirmed. The hold draft asked about both. Candidate selection remained unavailable. After the manager added the draft and recorded the hold, TeamFit confirmed the hold for the current session. | Pending. Manual review has not yet been run. | Treating the deadline or materials as confirmed could lead to an assignment or a client commitment before the team knows whether it can deliver. | No code changes were made during this test. |


## Initial Manual Browser Checks

These checks used synthetic scenarios in Chrome. The OpenAI interpretation feature was not run.

| Check | Result | Observation | Screenshot evidence |
| --- | --- | --- | --- |
| Desktop layout | Pass | The request status, unresolved items, Prepare hold note button, and Record next step panel were visible together. | |
| Hold and note preservation | Pass | The existing decision note remained above the appended draft. TeamFit confirmed that the hold was recorded for the open session. | [01-hold-missing-information.png](01-hold-missing-information.png) |
| Potential candidate — pre-fix observation | Preset failed; manual adjustment passed | The original preset showed no eligible candidate. Maya had 6 hours available with 18 hours of committed work, below the 10-hour requirement. After changing her synthetic committed work to 14 hours, TeamFit showed her as a potential candidate with 10 hours available. See the chronological final retest record below. | [Original preset: no match](02-potential-candidate-preset-no-match.png)<br>[Manual retest: candidate shown](02-potential-candidate-manual-retest.png) |
| Insufficient capacity | Pass | TeamFit displayed “No potential candidate meets aggregate criteria.” | [03-insufficient-capacity.png](03-insufficient-capacity.png) |
| Ambiguous Friday | Pass | The original message retained “by Friday,” and the request dates stayed unconfirmed. | [04-ambiguous-friday.png](04-ambiguous-friday.png) |
| Mobile layout at 400 px | Partial | The decision controls appeared below the unresolved items and fit within the viewport. The workload table required horizontal scrolling within the table to reach the rightmost columns. | [05-mobile-400px-decision-controls.png](05-mobile-400px-decision-controls.png)<br>[06-mobile-400px-workload-scroll.png](06-mobile-400px-workload-scroll.png) |

## Potential-candidate preset correction

The original failed preset result and manual adjustment above are preserved. The built-in **Potential candidate** scenario was corrected to set Maya Chen's synthetic committed work to 14 hours, which produces 10 estimated aggregate hours for the 10-hour request under the unchanged rule-based calculation. An offline regression test now covers this configuration.

### Candidate preset chronology

1. **Original preset — failed:** Maya had 18 committed hours, leaving 6 available hours for a 10-hour request. See [Original preset: no match](02-potential-candidate-preset-no-match.png).
2. **Manual adjustment — passed:** changing Maya's committed work to 14 hours showed 10 available hours. See [Manual retest: candidate shown](02-potential-candidate-manual-retest.png).
3. **First code fix — failed:** the corrected preset loaded 2026-11-11 through 2026-11-15, which contains only three weekdays; `6 × 3 − 14 = 4` available hours. The date-range generator was then corrected to always include four weekdays.
4. **Final four-weekday fix — passed:** without changing any inputs, the preset loaded 2026-11-11 through 2026-11-16, which contains four weekdays. Maya appeared as a potential candidate with 10 hours of estimated remaining capacity. See [02-potential-candidate-preset-fixed(updated).png](<02-potential-candidate-preset-fixed(updated).png>).

### Final browser recheck

The final recheck below preserves the earlier failed runs and screenshot evidence. The manual baseline remains pending because no baseline feedback was provided.

| Check | Result | Observation | Screenshot evidence |
| --- | --- | --- | --- |
| Potential candidate | Pass | The existing final retest remains valid: without any manual input changes, the built-in preset produced Maya Chen as a potential candidate with 10 hours of estimated remaining capacity. | [02-potential-candidate-preset-fixed(updated).png](<02-potential-candidate-preset-fixed(updated).png>) |
| Hold and note preservation | Pass | The existing note remained above the appended draft, and TeamFit confirmed the hold for the current session. | Earlier screenshot: [01-hold-missing-information.png](01-hold-missing-information.png) |
| Insufficient capacity | Pass | No potential candidate met the aggregate criteria. | Earlier screenshot: [03-insufficient-capacity.png](03-insufficient-capacity.png) |
| Ambiguous Friday | Pass | The original request retained “by Friday,” and Dates stayed “Not confirmed.” | Earlier screenshot: [04-ambiguous-friday.png](04-ambiguous-friday.png) |
| Mobile layout at 400 px | Partial | The decision controls fit below the unresolved items. Workload-table horizontal scrolling was observed earlier and was not rechecked in this final run. | Earlier screenshots: [05-mobile-400px-decision-controls.png](05-mobile-400px-decision-controls.png)<br>[06-mobile-400px-workload-scroll.png](06-mobile-400px-workload-scroll.png) |
