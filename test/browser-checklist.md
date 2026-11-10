# Browser regression checklist

Run this manually against `http://localhost:3000` after starting the local server. These checks are local browser checks, not automated tests and do not call OpenAI.

1. At a desktop width, confirm request status, blockers, **Prepare hold note**, and **Record next step** are visible without introductory content.
2. Load **Missing information / hold**. Prepare the hold note, add it to a non-empty decision note, and confirm the existing note remains above the appended draft. Select the hold checkbox and record the session-only hold.
3. Load **Potential candidate**, review the populated manual fields, then run the capacity check. Confirm the result says “Potential candidates,” not an assignment or client commitment.
4. Load **Insufficient capacity**, run the check, and confirm it does not present a candidate.
5. Load **Ambiguous Friday**. Confirm the source preserves “Friday”; do not infer a calendar date.
6. At a narrow width, confirm the decision controls follow the unresolved items and no controls are clipped or require horizontal scrolling.
