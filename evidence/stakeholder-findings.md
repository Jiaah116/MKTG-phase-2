# TeamFit Stakeholder Findings

## Purpose and method

Three managers completed an exploratory comparison between a manual request review and TeamFit. Participants are described only by role and approximate team size where provided. The team recorded elapsed time and participant feedback. The test did not record a standardized request, method order, or a pre-defined scoring checklist, so the findings are directional only.

## Findings

| Participant | Reported feedback | What it means for TeamFit |
| --- | --- | --- |
| Project manager, 10-20-person group | Liked that AI could support detail review while a person still authorizes the outcome. Said the manual process took longer than expected. Wanted TeamFit available within Microsoft Teams or Slack. | Preserve explicit manager approval and investigate where a messaging-platform integration could fit the real workflow. |
| HR manager, 15-person group | Missed one item during manual review and valued AI assistance. Needed some time to understand how TeamFit worked. | Improve first-use guidance and test whether the interface makes the review workflow understandable without help. |
| IT manager | Liked the availability visualization but questioned how workload would be calculated in real operations. | The largest unresolved product assumption is whether reliable workload data can be obtained and kept current enough for capacity results to be useful. |

## Measured comparison results

The participants reported manual/TeamFit times of 216/75 seconds, 197/88 seconds, and 230/83 seconds. These are recorded in `evaluation-test-log.md`. They are not sufficient evidence of a general time-saving claim because the sample is small and the comparison conditions were not standardized.

## Resulting product and business decisions

1. **Keep human authorization.** Feedback supported TeamFit's current design: AI can organize request details, but a manager verifies information and owns the action.
2. **Prioritize workflow clarity.** Implemented the feedback-led update described below. Retest it with a participant using the product without help.
3. **Test integrations before promising adoption.** Microsoft Teams/Slack fit and real workload-data access are adoption hypotheses, not implemented features. A bounded pilot should test whether a manager can keep workload inputs current and whether the tool fits an existing communication workflow.

## Feedback-led update implemented

**Feedback that led to the update:** The HR manager said that they needed some time to understand how TeamFit worked. The project manager and IT manager responded positively to the manager-reviewed workflow, so the revision preserves human approval rather than adding automation.

**What changed in TeamFit:**

- Added a visible, optional **“New to TeamFit?” first-review guide** at the top of the workspace.
- The guide explains the first three decisions in plain language: review confirmed information; prepare a hold note when information is missing or check aggregate capacity when it is confirmed; then keep the manager responsible for the final action.
- Added **“Try the missing-information example”**. It loads the synthetic spring-launch request and takes the user toward the hold workflow.
- Added **“Hide guide”** and **“Show first-review guide”** controls, so experienced users are not forced through onboarding.

**Why this update fits the feedback:** It gives a first-time user a short path to the product's main value: deciding whether to hold an unclear request or assess a complete request. It does not claim that the tool can assign staff or approve client work automatically.

**Retest result:** Stakeholder 2 (the HR manager who initially needed time to understand the workflow) viewed the final version with the first-review guide and reported that they liked it. They said they clearly understood:

- when to put a request on hold;
- when to check capacity; and
- that a **potential candidate** is only a possible staffing option, while the manager makes the final assignment decision.

The retest date and task-completion time were not recorded. This is positive usability feedback, but it does not establish that all first-time users will understand the workflow without help.

**Next stronger test:** Give the updated prototype to one participant without explaining the workflow. Record whether they can state the difference between a hold and a potential candidate, select an appropriate next step, and say whether the guide was helpful.

## Evidence limitations

- The test dates were recorded as November 10 for the IT manager and November 11 for the other two participants; no year was provided.
- Participant names, exact requests, workload data, task order, and a pre-set detail checklist were not recorded.
- The participants' positive reactions do not establish buyer approval, budget ownership, procurement fit, or real-world effectiveness.
