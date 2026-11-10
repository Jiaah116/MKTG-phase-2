# TeamFit

TeamFit is a local manager tool for reviewing whether a team can take on new work. The team records and request examples are clearly labeled **synthetic**. Capacity matching remains rule-based; the optional AI feature produces a manager-reviewed request draft only.

## Requirements and local setup

- Node.js 24 or later. No package installation is required.
- An OpenAI API key is needed only for **Interpret request**. Capacity checks work without one.

Each teammate must create and configure their own local `.env` file. Never share, commit, or paste API keys into chat.

1. Copy `.env.example` to `.env`.
2. Open `.env` in an editor and enter the key after `OPENAI_API_KEY=`.
3. In PowerShell, from this project folder, run:

   ```powershell
   node --env-file=.env server.js
   ```

4. Open `http://localhost:3000`.
5. Press `Ctrl+C` in the terminal to stop the server.

The server loads the key only into its Node.js process. The static server serves files only from `dist/`; it does not expose `.env` or files outside that directory.

## Current features

- **Request Review workspace:** TeamFit opens on one current request. A slim status bar shows the request name, its current review status, and the next action. On desktop, the request summary and unresolved items are on the left while the manager's decision controls are on the right; staffing and workload details are below. This responds to TA feedback that the prototype should feel like a manager's daily work tool rather than a presentation. On narrow screens, the decision controls follow unresolved items.
- **Clarify and hold workflow:** The summary identifies unconfirmed request details before staffing. **Prepare hold note** creates an editable draft with separate client questions and internal checks. Adding the draft appends it to the decision note, preserving any text already there. Preparing or adding a draft does not save anything: the manager must still explicitly select **Put this request on hold** and record the session-only decision.
- **Demonstration support:** Local synthetic scenarios cover missing information, a potential candidate, insufficient capacity, and an ambiguous Friday request. A copyable review summary helps a manager share the current status and follow-up without exposing the editable team table.
- Editable, synthetic five-person team table with skills, daily capacity, committed hours, and availability confirmation dates.
- Manual request form with manager-entered and confirmed effort estimates.
- Rule-based aggregate capacity matching and a per-person calculation breakdown:

  `daily capacity x weekdays - committed work within selected dates = estimated remaining capacity within selected dates`

- Required committed-hours review when request dates change; unfinished committed work is subtracted once. Availability information is considered current only when its last confirmation falls within the configured freshness window before the request start date.
- Human manager decision step that can record a hold before capacity is assessed, as long as the manager supplies a task description and decision note. Candidate selection requires a valid, current capacity check plus an unchecked-by-default manager confirmation that the candidate's schedule and dependencies allow completion before the deadline. It never assigns work automatically.
- Qualifying people are labelled **Potential candidates**, not confirmed availability. Clear separation between **Capacity not assessed** (no current check) and **No potential candidate meets aggregate criteria** (a completed check found no qualified person). Changing request, team, commitment, date, or selected-candidate inputs resets the schedule/dependency confirmation and invalidates an earlier capacity assessment where applicable; a hold remains available.
- Optional AI-assisted request interpretation using the OpenAI Responses API and Structured Outputs. It extracts stated deliverables, linked quantities, deadlines, materials, missing information, and questions with verbatim evidence excerpts.
- AI drafts remain editable and require manager approval before selected supported facts can be copied into the manual form. Effort estimates and required skills are never copied from AI output.
- Ambiguous dates such as `Friday` remain unchanged and require an exact-calendar-date question. No date is inferred.

## AI data flow and safety

Clicking **Interpret request** sends only the pasted client request together with fixed extraction instructions and a JSON schema to OpenAI. It does not send team members, skills, availability, committed work, or capacity results.

The configured model is `gpt-6-luna`. Requests use `store: false`, a 12,000-character input limit, a 1,200-token output limit, a 20-second timeout, and no automatic retries. Request text is not logged by the server and is kept only in page memory by the browser.

Facts are shown as supported only when their supplied excerpt is an exact, continuous substring of the original request. Unsupported facts are flagged and cannot be copied. Changing the pasted source invalidates earlier review approval.

## Limitations and costs

OpenAI requests may incur token charges. Check current OpenAI pricing and your organisation's data-handling requirements before sending real client material.

Capacity is an aggregate estimate for the selected dates. It does not check daily schedules, leave, holidays, time blocks, dependencies, or whether the estimated hours are actually usable before the deadline. Capacity alone does not establish that a client request should be accepted; a manager must manually check the selected potential candidate's schedule and dependencies before recording a candidate-selection decision.

TeamFit does not verify that an extracted statement is true beyond its excerpt, inspect attachments, infer dates, infer approvals, create effort estimates, alter staff skills or availability, allocate work, assign people, or send messages. It is a review aid, not an assignment system.

## Automated tests

Run the offline test suite:

```powershell
node --test test\logic.test.js test\ai.test.js test\decision.test.js test\review.test.js test\hold-note.test.js
```

The offline Node tests cover normal, insufficient-capacity, missing-information, and date-boundary capacity cases; committed-hours review; hold and candidate-decision validation including schedule/dependency confirmation; evidence validation; ambiguous-deadline questions; selected AI-copy behavior; source approval invalidation; and a clearly labeled mocked API failure path. They do not call OpenAI.

## Request Review workflow

1. Review the current request summary and the unresolved items.
2. Use **View original client message** to inspect the source text, or expand **Edit request details** to correct confirmed manual information.
3. When information is incomplete, use **Prepare hold note** to draft client questions and internal checks. Review or edit the draft, then add it to the decision note if useful.
4. To save a hold for the current browser session, select **Put this request on hold**, provide a non-empty decision note, and select **Record decision for this session**. Holds do not require an estimate, skill, dates, or a capacity check.
5. Only after the request inputs are confirmed should the manager review committed work and run the aggregate capacity check. Potential candidates are not assignments; a candidate decision additionally requires the manager's schedule/dependency confirmation.

## Verification status

- **Automated:** The test command above exercises the rule-based logic and isolated UI-state helpers. It does not make an OpenAI request.
- **Browser checks:** The app is intended to be opened locally at `http://localhost:3000` after starting the server. Browser interactions should be reviewed manually, including capacity-result invalidation, hold decisions, and the schedule/dependency confirmation before selecting a potential candidate.
- **Browser regression walkthrough:** [test/browser-checklist.md](test/browser-checklist.md) provides a repeatable local checklist for the hold, scenario, capacity, and narrow-layout flows.
- **Not yet verified:** No paid live OpenAI interpretation request is run by the automated suite. The project has not been independently user-tested or validated for business outcomes, time savings, real staff schedules, leave, holidays, or external scheduling integrations.

## Repository safety

`.env`, `.env.*`, dependency folders, coverage output, and common local log files are ignored. `.env.example` is intentionally tracked and contains only an empty `OPENAI_API_KEY=` placeholder.
