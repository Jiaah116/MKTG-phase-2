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

- Editable, synthetic five-person team table with skills, daily capacity, committed hours, and availability confirmation dates.
- Manual request form with manager-entered and confirmed effort estimates.
- Rule-based availability matching and a per-person calculation breakdown:

  `daily capacity x weekdays - committed work within selected dates = available hours`

- Required recommitment review when request dates change; unfinished committed work is subtracted once.
- Human manager decision step that selects a candidate or puts a request on hold. It never assigns work automatically.
- Optional AI-assisted request interpretation using the OpenAI Responses API and Structured Outputs. It extracts stated deliverables, linked quantities, deadlines, materials, missing information, and questions with verbatim evidence excerpts.
- AI drafts remain editable and require manager approval before selected supported facts can be copied into the manual form. Effort estimates and required skills are never copied from AI output.
- Ambiguous dates such as `Friday` remain unchanged and require an exact-calendar-date question. No date is inferred.

## AI data flow and safety

Clicking **Interpret request** sends only the pasted client request together with fixed extraction instructions and a JSON schema to OpenAI. It does not send team members, skills, availability, committed work, or capacity results.

The configured model is `gpt-6-luna`. Requests use `store: false`, a 12,000-character input limit, a 1,200-token output limit, a 20-second timeout, and no automatic retries. Request text is not logged by the server and is kept only in page memory by the browser.

Facts are shown as supported only when their supplied excerpt is an exact, continuous substring of the original request. Unsupported facts are flagged and cannot be copied. Changing the pasted source invalidates earlier review approval.

## Limitations and costs

OpenAI requests may incur token charges. Check current OpenAI pricing and your organisation's data-handling requirements before sending real client material.

TeamFit does not verify that an extracted statement is true beyond its excerpt, inspect attachments, infer dates, infer approvals, create effort estimates, alter staff skills or availability, allocate work, assign people, or send messages. It is a review aid, not an assignment system.

## Tests

Run the offline test suite:

```powershell
node --test test\logic.test.js test\ai.test.js
```

The tests cover normal, insufficient-capacity, missing-information, and date-boundary capacity cases; evidence validation; ambiguous-deadline questions; selected AI-copy behavior; source approval invalidation; and a clearly labeled mocked API failure path. They do not call OpenAI.

## Repository safety

`.env`, `.env.*`, dependency folders, coverage output, and common local log files are ignored. `.env.example` is intentionally tracked and contains only an empty `OPENAI_API_KEY=` placeholder.
