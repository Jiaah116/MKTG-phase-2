# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is a project or creative manager at a small agency. They review one incoming client request at a time before committing to the client.

## Product Purpose

TeamFit helps a manager identify what needs clarification, assess rule-based aggregate capacity when enough information is available, and record the next step for the current review.

## Positioning

TeamFit keeps the decision process explicit: it separates stated request facts, unresolved details, aggregate capacity signals, and the manager's final follow-up decision. It does not turn a capacity signal into an assignment or client commitment.

## Operating Context

The manager works through one client request at a time. They may enter request details manually or optionally interpret pasted client text with source excerpts. They review unresolved questions before staffing, use aggregate capacity only after key inputs are confirmed, and may record a hold without guessing a deadline or effort estimate.

## Capabilities and Constraints

- This phase is a local prototype with synthetic data and no saved request history.
- Session-only decision status must be clearly identified as not persisted.
- Preserve manual request entry, optional AI interpretation with source excerpts, rule-based capacity checks, and manager confirmation.
- Potential candidates are for manager follow-up only. They are not automatic assignments or approval to accept a client request.
- Candidate selection requires a current capacity check and manager schedule/dependency confirmation.
- Holds remain possible without a confirmed deadline or effort estimate.
- Capacity is an aggregate planning signal, not a daily schedule or availability guarantee.

## Evidence on Hand

- The local app includes synthetic team and request examples.
- The optional interpretation flow provides source excerpts and flags unsupported excerpts.
- There is no saved request history, external scheduling integration, or assignment workflow in this phase.

## Product Principles

1. Clarify before committing: unknown scope, deadline, materials, or effort must remain visible rather than be guessed.
2. Keep a manager in control: automate neither assignments nor client acceptance decisions.
3. Show one request's next decision clearly before detailed staffing inputs.
4. Treat capacity as a transparent, limited planning signal.

## Accessibility & Inclusion

The web interface should use clear labels, keyboard-operable controls, visible status text, and explanations that do not rely only on color.
