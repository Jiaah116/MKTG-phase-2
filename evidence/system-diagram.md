# TeamFit System Diagram

```mermaid
flowchart TD
    A[Client request text or manager manual entry] --> B[Request Review workspace]
    B --> C{Interpret request?}
    C -- No --> D[Manager reviews manual request details]
    C -- Yes, optional --> E[POST /api/interpret-request to TeamFit server]
    E --> F[Server sends client request text plus fixed extraction instructions and schema]
    F --> G[OpenAI Responses API]
    G --> H[AI-generated draft with excerpts]
    H --> I[Validate each excerpt is an exact substring of the client request]
    I --> J[Manager reviews and explicitly approves selected supported facts]
    J --> D

    D --> K{Information complete?}
    K -- No --> L[Show unresolved items]
    L --> M[Prepare editable hold note]
    M --> N{Manager explicitly selects Put request on hold and records it?}
    N -- Yes --> O[Session-only hold decision]
    N -- No --> B

    K -- Yes --> P[Manager reviews committed work for selected dates]
    T[Local team data: skills, capacity, committed work, availability confirmation] --> Q[Rule-based capacity check]
    P --> Q
    Q --> R[Daily capacity × weekdays − committed work]
    R --> S[Potential candidates or no aggregate match]
    S --> U{Manager selects a candidate?}
    U -- No --> V[No candidate decision recorded]
    V --> N
    U -- Yes --> W[Required manager schedule and dependency review]
    W --> X{Manager confirms schedule and dependencies?}
    X -- Yes --> Y[Session-only candidate-selection decision]
    X -- No --> U
```

## What the manager must verify

TeamFit can identify potential candidates from rule-based aggregate capacity, but it does not assign work or establish that a client request can be accepted. Before recording a candidate-selection decision, the manager must verify the person's schedule, leave, time blocks, dependencies, and ability to complete the required work before the deadline. The manager must also confirm the request details and committed work for the selected date range.

## Data boundary

OpenAI interpretation is optional. When the manager chooses it, TeamFit sends only the pasted client request text plus fixed extraction instructions and a schema. The server keeps the API key server-side. Team data and capacity information remain local and are not sent to OpenAI.
