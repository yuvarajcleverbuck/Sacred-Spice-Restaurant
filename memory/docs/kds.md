# Sacred Spice Restaurant
## Software Requirements Specification (SRS)
## 5.3 Kitchen Display System (KDS)

**Document Name:** `Sacred_Spice_SRS_5_3_Kitchen_Display_System.md`  
**Source Baseline:** Sacred Spice Restaurant — Business Requirement Specification (BRS) v1.0  
**BRS Document ID:** SSR-BRS-001  
**BRS Version:** 1.0  
**BRS Date:** 15 September 2026  
**Section:** 5.3 Kitchen Display System  
**Status:** SRS Working Draft / Implementation Specification  
**Confidentiality:** Internal and contracted vendors only

---

# 1. Purpose

This section defines the Software Requirement Specification for the **Kitchen Display System (KDS)** within the Sacred Spice Restaurant platform.

The KDS is the operational kitchen interface that receives accepted orders, displays the live kitchen queue, routes tickets by station and course, surfaces modifiers and allergy instructions, measures preparation progress, escalates delayed tickets, and provides kitchen-capacity signals back to the ordering flow.

The KDS requirements in this document are derived from the BRS. Where the BRS provides a direct requirement, the BRS ID is explicitly mapped. Where the BRS does not define a technical implementation detail, this document marks the item as **SRS Design Proposal**, **TBD**, or **Open Decision** rather than treating it as an approved business requirement.

---

# 2. BRS Traceability and Source Rules

## 2.1 Direct BRS Requirement Group

The BRS defines the following direct KDS requirements:

| BRS ID | Requirement | Priority |
|---|---|---|
| FR-KD-01 | Orders appear in the kitchen queue in priority order with target and elapsed time per ticket. | M |
| FR-KD-02 | Tickets route to the correct station — tandoor, curry, grill, dessert — and support course-by-course firing. | M |
| FR-KD-03 | Allergy and modifier information is displayed with unmistakable visual emphasis. | M |
| FR-KD-04 | Tickets breaching target time escalate visually and, if configured, alert the manager. | M |
| FR-KD-05 | The kitchen can throttle intake or extend promise times, which propagates to the Guest App. | S |
| FR-KD-06 | The system records prep time per item to inform future promise-time accuracy. | S |

## 2.2 Related BRS Requirements

The KDS also participates in the following BRS flows and requirements:

| BRS ID / Section | Relevance to KDS |
|---|---|
| FR-OR-04 | Per-item and per-order instructions, including allergy notes, must be flagged prominently to the kitchen. |
| FR-OR-06 | Guest amendment/cancellation is allowed before kitchen acceptance; after kitchen acceptance, cancellation requires staff approval. |
| FR-OR-07 | Dynamic promise time is derived from live kitchen load and, for delivery, travel time. |
| FR-MN-05 | Staff can mark items unavailable in real time; unavailable items are visibly disabled in the Guest App. |
| FR-NT-01 | Guest order status includes accepted, preparing, ready, dispatched and delivered. |
| BRS 7.2 | Orders are injected into POS and appear on KDS, routed by station and course; kitchen prepares and marks ready. |
| BRS 7.3 | When the kitchen is at capacity, promise times extend automatically and, if configured, ordering pauses. |
| NFR-04 | No accepted guest order may be lost; order injection is idempotent, retried and alerted on failure. |
| NFR-11 | Staff App and KDS continue to display and progress accepted orders during short network loss and reconcile on reconnection. |
| NFR-13 | Errors, crashes and integration faults are logged, monitored and alerted with defined ownership. |
| FR-AD-07 | Admin reporting includes prep time by item and station and SLA breach rate. |
| BRS Integration 10 | KDS is a two-way critical integration for ticket routing, prep status and capacity signals. |

## 2.3 Source-Fidelity Rule

The BRS does **not** prescribe:

- KDS screen layouts.
- Number of screens or devices per outlet.
- Exact station configuration schema.
- Exact ticket colour values.
- Exact SLA threshold values.
- Exact queue sorting algorithm beyond the requirement for priority order.
- Exact API paths or payloads.
- Exact database schema.
- Exact WebSocket protocol.
- Exact offline storage technology.
- Exact authentication mechanism for kitchen users.

Those items are therefore defined below as SRS design proposals or TBD/open decisions.

---

# 3. KDS Scope

## 3.1 In Scope

The KDS SRS covers:

1. KDS authentication and access context.
2. Live kitchen order queue.
3. Ticket priority, target time and elapsed time.
4. Station routing.
5. Course-by-course firing.
6. Modifiers, allergy flags and special instructions.
7. Preparation state and ticket progression.
8. Prep timers.
9. SLA-breach escalation.
10. Kitchen capacity controls.
11. Dynamic promise-time signalling to the Guest App.
12. Per-item preparation time recording.
13. Real-time synchronization.
14. Short-network-loss resilience and reconciliation.
15. Audit and observability requirements for KDS actions.
16. Admin/reporting data required from KDS activity.

## 3.2 Out of Scope

The BRS does not define the KDS as a replacement for:

- POS or accounting.
- Full inventory management.
- Procurement and supplier management.
- Recipe costing.
- Payroll, rostering or HR.
- An in-house delivery fleet.
- Public-facing guest interfaces.

The existing POS remains the financial system of record and is integrated with the platform rather than replaced.

---

# 4. KDS High-Level Operational Flow

```text
Guest / Staff Order
        |
        v
Order Validation + Payment / Order Acceptance
        |
        v
POS Order Injection
        |
        v
KDS Order Intake
        |
        +----------------------+
        |                      |
        v                      v
Ticket Creation        Kitchen Load Update
        |                      |
        v                      v
Priority Queue        Promise-Time Signal
        |
        v
Station Routing
        |
        +------------+------------+------------+------------+
        |            |            |            |
        v            v            v            v
   Tandoor       Curry        Grill       Dessert
        |            |            |            |
        +------------+------------+------------+------------+
                             |
                             v
                       Course Firing
                             |
                             v
                     Preparing / Ready
                             |
                             v
                 Guest Status / Staff Flow
                             |
                             v
                    Prep-Time Recording
```

**Implementation note:** The exact state machine and event model are SRS design details and should be finalized during API and architecture design.

---

# 5. KDS User Roles and Access Context

## 5.1 BRS Support

The BRS defines role-based access control for the overall system and states that staff actions are attributable to named users. The exact KDS role names and permission matrix are not specified in the BRS.

## 5.2 SRS Design Proposal

The KDS should operate within an authenticated outlet context and expose only the stations and functions the user is authorized to operate.

Possible permission concepts, subject to approval:

| Permission | Description | Status |
|---|---|---|
| `KDS_VIEW` | View kitchen tickets | Proposal |
| `KDS_PREP_UPDATE` | Start / update preparation state | Proposal |
| `KDS_FIRE_COURSE` | Fire or progress a course | Proposal |
| `KDS_CAPACITY_CONTROL` | Throttle intake / extend promise time | Proposal |
| `KDS_OVERRIDE` | Perform authorized operational override | Proposal |
| `KDS_MANAGER_ALERT_ACK` | Acknowledge manager alert | Proposal |
| `KDS_REPORT_VIEW` | View kitchen metrics | Proposal |

Exact roles, permission names and station restrictions remain **TBD**.

---

# 6. Module 5.3.1 — KDS Authentication & Access

## 6.1 Module Overview

5.3.1 defines access to the KDS before kitchen users can view or change kitchen operational data.

The BRS does not provide a KDS-specific authentication workflow. Therefore, the requirements below separate what the overall BRS requires from what the SRS proposes.

## 6.2 BRS Mapping

| BRS Reference | Relevance |
|---|---|
| FR-AD-04 | RBAC governs every function with least privilege and a full audit trail. |
| FR-ST-08 | Staff actions are attributed to a named user for accountability. |
| NFR-05 | Authentication uses one-time passwords with rate limiting; this is a platform-level NFR and is not explicitly scoped to a KDS-only login design. |

## 6.3 Functional Requirements

| ID | Requirement | Priority | Source Status |
|---|---|---|---|
| SRS-KDA-001 | KDS must require an authenticated user/session before protected operational functions are available. | M | SRS Design Proposal |
| SRS-KDA-002 | KDS access must be evaluated against the authenticated user's permitted outlet/station context. | M | SRS Design Proposal |
| SRS-KDA-003 | Unauthorized users must not be able to view or modify protected kitchen tickets. | M | SRS Design Proposal |
| SRS-KDA-004 | KDS actions that change operational state must retain the acting user identity. | M | BRS-aligned |
| SRS-KDA-005 | Session expiry and re-authentication behavior must be defined before production release. | M | TBD |
| SRS-KDA-006 | Exact KDS login method must follow the approved platform authentication design. | M | TBD |

## 6.4 Business Rules

- **BR-KDA-001:** A user without valid authentication cannot access the operational KDS interface.
- **BR-KDA-002:** A user must only access the outlet/station context assigned by authorization policy.
- **BR-KDA-003:** State-changing KDS actions must be attributable to a named user.
- **BR-KDA-004:** Permission checks must occur server-side and must not rely only on UI controls.
- **BR-KDA-005:** Authentication failures must be rate-limited according to the platform security design.

## 6.5 Validations

- Valid active session.
- Valid authorization.
- Valid outlet context.
- Valid station context where station restriction is enabled.
- Session not expired/revoked.

## 6.6 Error / Exception Handling

| Condition | Expected Behavior |
|---|---|
| Invalid credentials / session | Deny access and show generic authentication error. |
| Session expired | Require re-authentication. |
| Unauthorized station | Prevent access to restricted station data. |
| User deactivated | Revoke active access according to platform security policy. |
| Backend unavailable during login | Show retryable service-unavailable state. |

## 6.7 Acceptance Criteria

- An unauthorized user cannot access protected KDS data.
- An authorized user can reach the correct operational context.
- A state-changing action records the acting user identity.
- Server-side authorization prevents privilege bypass.

## 6.8 TBD / Open Decisions

- Login method.
- Device registration requirements.
- Session timeout.
- MFA requirement, if any.
- Role names.
- Station-level permission matrix.
- Shared-device behavior.

---

# 7. Module 5.3.2 — Kitchen Order Queue

## 7.1 Module Overview

The Kitchen Order Queue is the live operational queue for accepted orders entering the kitchen. It is responsible for presenting tickets in priority order and showing target and elapsed time per ticket.

This is a direct MVP requirement under FR-KD-01.

## 7.2 BRS Mapping

| BRS Reference | Requirement / Flow | Priority |
|---|---|---|
| FR-KD-01 | Orders appear in kitchen queue in priority order with target and elapsed time per ticket. | M |
| BRS 7.2 | Accepted order appears on KDS. | Direct process flow |
| FR-OR-06 | Kitchen acceptance affects cancellation behavior. | M |
| FR-NT-01 | Guest status progresses through accepted, preparing, ready, dispatched and delivered. | M |
| NFR-04 | No accepted order may be lost. | M |
| NFR-11 | KDS continues during short network loss and reconciles on reconnection. | M |

## 7.3 User Flow — Order Enters KDS

```text
1. Order becomes eligible for kitchen processing.
2. KDS receives / retrieves the order event.
3. System validates order identity and outlet context.
4. Ticket is created or updated idempotently.
5. Ticket is placed into the correct queue.
6. Target time is attached or calculated from the approved timing configuration.
7. Elapsed timer starts according to the approved operational start event.
8. Ticket becomes visible on the appropriate KDS view.
9. Queue updates are broadcast to connected KDS clients.
```

## 7.4 Functional Requirements

| ID | Requirement | Priority | Source Status |
|---|---|---|---|
| SRS-KDQ-001 | KDS must display accepted kitchen tickets in a live queue. | M | BRS-aligned |
| SRS-KDQ-002 | Queue ordering must respect the configured business priority. | M | BRS FR-KD-01 |
| SRS-KDQ-003 | Each ticket must display target preparation time. | M | BRS FR-KD-01 |
| SRS-KDQ-004 | Each ticket must display elapsed preparation time. | M | BRS FR-KD-01 |
| SRS-KDQ-005 | New ticket arrival must be reflected without requiring manual page refresh during normal connectivity. | M | SRS Design Proposal |
| SRS-KDQ-006 | Duplicate order delivery must not create duplicate kitchen tickets. | M | BRS NFR-04 aligned |
| SRS-KDQ-007 | Ticket status changes must propagate to connected authorized KDS clients. | M | SRS Design Proposal |
| SRS-KDQ-008 | KDS must visibly distinguish tickets that are newly received, in preparation and ready according to the approved status model. | M | SRS Design Proposal |
| SRS-KDQ-009 | A ticket must carry enough source context to trace it to the originating order. | M | SRS Design Proposal |
| SRS-KDQ-010 | KDS must recover and reconcile the queue after short network loss. | M | BRS NFR-11 |

## 7.5 Business Rules

- **BR-KDQ-001:** Every accepted kitchen order must have one operational ticket identity per intended KDS ticket.
- **BR-KDQ-002:** Duplicate inbound messages must be handled idempotently.
- **BR-KDQ-003:** Queue priority must be derived from approved business rules; the exact algorithm is TBD.
- **BR-KDQ-004:** A ticket must not disappear from the operational queue because of a temporary client refresh or reconnection.
- **BR-KDQ-005:** Ticket visibility must be limited to the correct outlet/station context.
- **BR-KDQ-006:** The timer start event must be consistent and auditable.

## 7.6 Proposed Ticket Status Model

The BRS only explicitly describes preparation/ready progression and guest-facing accepted/preparing/ready/dispatched/delivered states. The following internal KDS status model is therefore a proposal:

```text
RECEIVED
   |
   v
QUEUED
   |
   v
PREPARING
   |
   v
READY
   |
   v
COMPLETED / HANDOFF
```

Exact internal states and whether `RECEIVED` and `QUEUED` are separate states are **TBD**.

## 7.7 Validations

- Order identifier present.
- Ticket identifier present or safely generated.
- Outlet identifier matches KDS outlet.
- Ticket has at least one kitchen-relevant line item.
- Required item data is present.
- Target time is available or can be resolved through an approved rule.
- Duplicate message check performed.

## 7.8 Proposed APIs

> **Status:** SRS design proposal; exact contracts require API design approval.

```http
GET    /api/v1/kds/tickets
GET    /api/v1/kds/tickets/{ticket_id}
POST   /api/v1/kds/tickets/{ticket_id}/start
POST   /api/v1/kds/tickets/{ticket_id}/ready
POST   /api/v1/kds/tickets/{ticket_id}/acknowledge
GET    /api/v1/kds/queue/summary
```

### Proposed WebSocket

```text
WS /ws/v1/kds

Events:
- kds.ticket.created
- kds.ticket.updated
- kds.ticket.started
- kds.ticket.ready
- kds.ticket.delayed
- kds.capacity.updated
- kds.reconciliation.required
```

Event naming is proposed, not BRS-defined.

## 7.9 Data Requirements

Minimum proposed ticket fields:

| Field | Purpose | Status |
|---|---|---|
| ticket_id | Unique KDS ticket | Proposal |
| order_id | Link to order | Proposal |
| outlet_id | Outlet scope | Proposal |
| source_channel | Guest / Staff / other order channel | Proposal |
| priority | Queue ordering | Proposal |
| target_time | Expected completion time | BRS-aligned concept |
| started_at | Prep start | Proposal |
| elapsed_seconds | Derived timer | Proposal |
| status | KDS operational state | Proposal |
| station | Kitchen station | BRS-aligned concept |
| course | Course grouping | BRS-aligned concept |
| created_at | Audit / ordering | Proposal |
| updated_at | Sync / audit | Proposal |

## 7.10 Error / Exception Handling

### Duplicate Ticket

Do not create a second active ticket. Return the existing ticket identity or treat the inbound event as an idempotent replay.

### Missing Required Ticket Data

Place the ticket into an operational exception/review state according to implementation design and alert the responsible team. The exact fallback process is TBD.

### POS/KDS Integration Failure

The BRS requires resilient handling of accepted orders. Order injection is idempotent and retried with alerting. The implementation must prevent silent loss of an accepted order.

### KDS Client Disconnect

The client should reconnect, reload authoritative queue state and reconcile local display state with the server.

## 7.11 Acceptance Criteria

- Accepted orders appear on the KDS.
- Tickets are presented in the required priority order.
- Target and elapsed time are visible for each ticket.
- Duplicate inbound messages do not create duplicate active tickets.
- Short network loss does not permanently remove accepted tickets.
- Queue state is reconciled after reconnection.

---

# 8. Module 5.3.3 — Station Routing & Course Firing

## 8.1 Module Overview

Station Routing ensures that kitchen tickets are directed to the correct preparation station and that courses can be fired in sequence where the operational flow requires course-by-course preparation.

This is a direct MVP requirement under FR-KD-02.

## 8.2 BRS Mapping

| BRS Reference | Requirement / Flow | Priority |
|---|---|---|
| FR-KD-02 | Tickets route to the correct station — tandoor, curry, grill, dessert — and support course-by-course firing. | M |
| BRS 7.2 | Order appears on KDS, routed by station and course. | Direct process flow |
| FR-OR-04 | Guest instructions / allergy notes are attached to order lines and need to reach the kitchen. | M |

## 8.3 Functional Requirements

| ID | Requirement | Priority | Source Status |
|---|---|---|---|
| SRS-KSR-001 | Each applicable order line must be routed to the correct configured kitchen station. | M | BRS FR-KD-02 |
| SRS-KSR-002 | KDS must support course-level grouping/firing. | M | BRS FR-KD-02 |
| SRS-KSR-003 | A ticket may contain multiple station-specific preparations. | M | SRS Design Proposal based on FR-KD-02 |
| SRS-KSR-004 | Station routing must be based on approved menu/station configuration rather than hard-coded item names. | M | SRS Design Proposal |
| SRS-KSR-005 | A routing failure must be detectable and must not silently discard the affected ticket. | M | SRS Design Proposal / NFR-04 aligned |
| SRS-KSR-006 | Course firing actions must be auditable by user/time. | M | SRS Design Proposal / FR-ST-08 aligned |
| SRS-KSR-007 | Re-firing or duplicate firing must be prevented or explicitly handled according to approved rules. | M | TBD |

## 8.4 Routing Flow

```text
Order Ticket
   |
   v
Read Order Lines
   |
   v
Resolve Item -> Station Mapping
   |
   +-----------------------------+
   |             |               |
   v             v               v
Tandoor        Curry            Grill       ...
   |             |               |
   +-------------+---------------+
                 |
                 v
          Group by Course
                 |
                 v
          Course Firing
```

## 8.5 Business Rules

- **BR-KSR-001:** Station assignments must come from approved configuration.
- **BR-KSR-002:** An order line that cannot be routed must produce an operational exception rather than being silently omitted.
- **BR-KSR-003:** A course must only be fired when the required operational conditions are satisfied according to approved kitchen rules.
- **BR-KSR-004:** A user action that changes course firing state should be attributable to the user.
- **BR-KSR-005:** The same underlying order should remain traceable across all station tickets/views.

## 8.6 Configuration Requirements

The BRS confirms station examples but does not provide the configuration model. The SRS should support a configurable station mapping structure.

Proposed:

```text
Menu Item
   -> Station Mapping
      -> Station
      -> Preparation Order / Course
      -> Active From / To
      -> Outlet Scope
```

Exact fields and scheduling behavior are **TBD**.

## 8.7 Validations

- Station exists and is active.
- Item-to-station mapping exists.
- Outlet scope matches.
- Course value is valid.
- Firing state transition is valid.

## 8.8 Proposed APIs

```http
GET    /api/v1/kds/stations
GET    /api/v1/kds/stations/{station_id}/tickets
POST   /api/v1/kds/tickets/{ticket_id}/courses/{course_id}/fire
POST   /api/v1/kds/tickets/{ticket_id}/courses/{course_id}/complete
```

## 8.9 Error / Exception Handling

### Missing Station Mapping

The ticket must enter a visible exception path and be surfaced to the responsible authorized user. Exact fallback station behavior is TBD.

### Station Unavailable

Behavior is not specified in the BRS. The SRS must define this in the kitchen operations design before production.

### Duplicate Fire Request

The backend should use idempotency/state validation so an already-fired course is not fired again unintentionally.

## 8.10 Acceptance Criteria

- Ticket lines route to the correct configured station.
- The KDS shows station-specific work.
- Courses can be fired individually according to the approved course model.
- A missing/invalid routing configuration creates a visible operational exception.
- Course actions are auditable.

---

# 9. Module 5.3.4 — Modifiers, Allergies & Special Instructions

## 9.1 Module Overview

This module ensures that item-level modifiers, allergy information, spice-related instructions and guest special instructions remain visible to kitchen staff and are not lost or truncated.

Because the BRS specifically identifies allergy communication as a critical guest trust requirement, this module must be treated as an operationally sensitive workflow.

## 9.2 BRS Mapping

| BRS Reference | Requirement / Flow | Priority |
|---|---|---|
| FR-KD-03 | Allergy and modifier information is displayed with unmistakable visual emphasis. | M |
| FR-OR-04 | Per-item and per-order instructions, including allergy notes, are flagged prominently to the kitchen. | M |
| FR-MN-02 | Items have spice grading and guests may request a different grade where kitchen permits it. | M |
| FR-MN-03 | Items declare allergens and dietary suitability. | M |
| BRS Acceptance | Allergen and spice-level instructions must reach the kitchen ticket without loss or truncation in every tested case. | Phase 1 acceptance |

## 9.3 Functional Requirements

| ID | Requirement | Priority | Source Status |
|---|---|---|---|
| SRS-KMI-001 | Each applicable kitchen ticket must display item modifiers. | M | BRS FR-KD-03 |
| SRS-KMI-002 | Allergy information must have unmistakable visual emphasis. | M | BRS FR-KD-03 |
| SRS-KMI-003 | Special instructions must be displayed with their associated order/item context. | M | BRS FR-OR-04 |
| SRS-KMI-004 | Spice-level selections or requested changes relevant to preparation must reach the kitchen ticket. | M | BRS FR-MN-02 + acceptance alignment |
| SRS-KMI-005 | Kitchen-facing ticket content must preserve required instruction text without silent truncation. | M | BRS acceptance alignment |
| SRS-KMI-006 | Item-level instructions must remain associated with the correct item when an order contains multiple items. | M | SRS Design Proposal |
| SRS-KMI-007 | Per-order instructions must be distinguishable from item-level instructions. | M | SRS Design Proposal |
| SRS-KMI-008 | Allergy emphasis rules must not depend solely on colour; the exact visual treatment must be approved. | M | SRS Design Proposal |

## 9.4 Business Rules

- **BR-KMI-001:** Allergy information must not be visually indistinguishable from ordinary modifiers.
- **BR-KMI-002:** Item-level allergy or preparation instructions must remain attached to the correct order line.
- **BR-KMI-003:** Special instructions must not be silently dropped when an order crosses system boundaries.
- **BR-KMI-004:** If a message cannot be fully delivered to the KDS, the ticket must enter an exception path rather than appearing complete.
- **BR-KMI-005:** Exact allergy warning taxonomy and presentation rules require business and kitchen sign-off.

## 9.5 Proposed Kitchen Ticket Display Structure

```text
ORDER #12345
Table / Order Channel / Promise Time

[ALLERGY / IMPORTANT INSTRUCTION AREA]

Tandoor
- Chicken Tikka x 2
  Modifier: Mild
  Allergy: Peanuts
  Note: No garnish

Curry
- Paneer Dish x 1
  Modifier: Vegan variant (if permitted)
```

The exact design is a UI decision, not a BRS requirement.

## 9.6 Validations

- Instruction text is encoded and transferred safely.
- Item-line association is preserved.
- Supported modifier value is valid.
- Allergy indicator is represented in the canonical kitchen payload.
- Text length limits are handled without silent loss.
- Required instruction fields are not null when the source order includes them.

## 9.7 Error / Exception Handling

### Instruction Truncation Risk

The system must detect and prevent silent truncation. The technical maximum length is **TBD**.

### Invalid Modifier

Reject/flag the invalid modifier according to order validation rules; do not silently replace it.

### Missing Allergy Metadata

If the source order explicitly contains an allergy instruction but the KDS payload lacks it, the ticket should enter an exception path and be surfaced to an authorized user.

## 9.8 Acceptance Criteria

- Modifiers are visible on the correct ticket.
- Allergy information has unmistakable visual emphasis.
- Special instructions are visible and linked to the right item/order context.
- Tested allergen and spice-level instructions reach the kitchen without loss or truncation.
- The information remains available during the operational lifecycle of the ticket.

---

# 10. Module 5.3.5 — Prep Timers & SLA Escalation

## 10.1 Module Overview

This module measures preparation progress against target time and visually escalates tickets that breach the configured target. The BRS requires visual escalation and allows manager alerting when configured.

## 10.2 BRS Mapping

| BRS Reference | Requirement / Flow | Priority |
|---|---|---|
| FR-KD-01 | Target and elapsed time per ticket. | M |
| FR-KD-04 | Breached tickets escalate visually and may alert manager. | M |
| FR-AD-07 | Kitchen performance includes prep time and SLA breach rate. | S |
| NFR-13 | Operational faults and relevant events are logged, monitored and alerted. | M |

## 10.3 Functional Requirements

| ID | Requirement | Priority | Source Status |
|---|---|---|---|
| SRS-KPT-001 | KDS must display elapsed preparation time for active tickets. | M | BRS FR-KD-01 |
| SRS-KPT-002 | KDS must compare elapsed time with the applicable target. | M | BRS FR-KD-01 / FR-KD-04 |
| SRS-KPT-003 | Tickets that breach target time must receive the configured visual escalation. | M | BRS FR-KD-04 |
| SRS-KPT-004 | Manager alerting must be available when enabled in configuration. | M | BRS FR-KD-04 |
| SRS-KPT-005 | The timer must continue correctly while a client is temporarily disconnected, subject to server-authoritative timing. | M | BRS NFR-11 aligned |
| SRS-KPT-006 | SLA breach events must be recorded for reporting and analysis. | S | BRS FR-AD-07 aligned |
| SRS-KPT-007 | Exact time thresholds and escalation levels must be configurable. | S | SRS Design Proposal / TBD |

## 10.4 Timer Definition

The BRS requires target and elapsed time but does not define the exact start/stop event.

The following is a proposed model:

```text
Ticket Created / Accepted
        |
        v
Timer Start
        |
        v
Elapsed Time
        |
        +---- below target ----> Normal
        |
        +---- near threshold --> Warning (proposal)
        |
        +---- target exceeded -> Breach / Escalation
        |
        v
Ticket Ready
        |
        v
Timer Stop
```

Whether timer start occurs at ticket creation, kitchen acceptance, or another defined event is **TBD**.

## 10.5 Business Rules

- **BR-KPT-001:** One authoritative timing source must determine elapsed time.
- **BR-KPT-002:** A ticket must have a target time before SLA evaluation.
- **BR-KPT-003:** Once a ticket breaches its target, the breach must remain traceable even if the ticket later becomes ready.
- **BR-KPT-004:** Manager alerting is only sent when the relevant configuration enables it.
- **BR-KPT-005:** Exact escalation colours and thresholds require kitchen/operations approval.

## 10.6 Validations

- Target time is non-negative and valid.
- Timer timestamps are consistent.
- Ticket status permits timing.
- Duplicate breach notifications are prevented according to alerting policy.

## 10.7 Proposed APIs

```http
GET    /api/v1/kds/tickets/{ticket_id}/timer
GET    /api/v1/kds/tickets/{ticket_id}/sla
POST   /api/v1/kds/tickets/{ticket_id}/sla/acknowledge
GET    /api/v1/kds/sla/breaches
```

## 10.8 Error / Exception Handling

### Clock Difference

Use server-authoritative timestamps where possible.

### Missing Target Time

The system must resolve or flag the missing target rather than silently treating the ticket as compliant.

### Notification Failure

The visual KDS escalation must still operate even if an external manager notification fails.

## 10.9 Acceptance Criteria

- Active tickets show target and elapsed time.
- A ticket crossing the defined target receives visual escalation.
- Optional manager alerting works when configured.
- SLA breach events are retained for reporting.
- Timing remains correct across short network loss.

---

# 11. Module 5.3.6 — Kitchen Capacity & Dynamic Promise Time

## 11.1 Module Overview

This module converts current kitchen load into operational capacity signals. The BRS requires the kitchen to be able to throttle intake or extend promise times, with the effect propagated to the Guest App.

The BRS also states that when the kitchen is at capacity, promise times extend automatically and, if configured, ordering pauses rather than accepting orders the kitchen cannot honour.

## 11.2 BRS Mapping

| BRS Reference | Requirement / Flow | Priority |
|---|---|---|
| FR-KD-05 | Kitchen can throttle intake or extend promise times; signal propagates to Guest App. | S |
| FR-OR-07 | Dynamic promise time derived from live kitchen load and delivery travel time. | M |
| BRS 7.3 | At capacity, promise times extend automatically and, if configured, ordering can pause. | Business rule |
| NFR-03 | Supports 10x launch peak concurrent order volume without redesign. | M |

## 11.3 Functional Requirements

| ID | Requirement | Priority | Source Status |
|---|---|---|---|
| SRS-KCP-001 | KDS must expose the kitchen's current operational capacity state. | S | BRS-aligned |
| SRS-KCP-002 | Authorized kitchen users must be able to throttle intake when the configured policy permits it. | S | BRS FR-KD-05 |
| SRS-KCP-003 | Authorized kitchen users must be able to extend promise-time signalling according to configured rules. | S | BRS FR-KD-05 |
| SRS-KCP-004 | Capacity changes must propagate to the ordering/promise-time service and Guest App. | S | BRS FR-KD-05 |
| SRS-KCP-005 | System should support automatic promise-time extension based on live kitchen load. | M | BRS 7.3 + FR-OR-07 |
| SRS-KCP-006 | System should support configured order pause at capacity. | S | BRS 7.3 |
| SRS-KCP-007 | Capacity state changes must be auditable. | S | SRS Design Proposal / FR-ST-08 aligned |
| SRS-KCP-008 | Capacity signalling must fail safely so the platform does not claim capacity that is not known. | M | SRS Design Proposal |

## 11.4 Proposed Capacity States

The BRS does not define state names. A possible SRS model is:

```text
NORMAL
BUSY
EXTENDED_PROMISE
THROTTLED
PAUSED
```

These names are **proposal only**.

## 11.5 Proposed Calculation Inputs

The BRS explicitly identifies live kitchen load as an input to promise time. The exact formula is not defined.

Potential design inputs for approval may include:

- Active ticket count.
- Target preparation times.
- Current average preparation time.
- Station-specific load.
- Number of overdue tickets.
- Current configured capacity thresholds.
- Delivery travel time for delivery orders.

The final algorithm must be approved during solution design; these inputs are not direct BRS requirements.

## 11.6 Business Rules

- **BR-KCP-001:** Kitchen throughput is a physical limit and digital demand must be managed within it.
- **BR-KCP-002:** Capacity controls must not silently discard orders already accepted.
- **BR-KCP-003:** An authorized manual throttle must take effect according to the configured policy.
- **BR-KCP-004:** Promise-time changes must be reflected in the customer ordering flow as required by the BRS.
- **BR-KCP-005:** If ordering is configured to pause at capacity, the Guest App must stop accepting affected orders rather than showing a promise time that cannot be honoured.
- **BR-KCP-006:** Exact thresholds and formula are TBD.

## 11.7 Validations

- User is authorized to change capacity state.
- Requested capacity mode is valid.
- Promise-time override is within approved bounds.
- Outlet context is valid.
- Capacity update contains timestamp and actor identity.

## 11.8 Proposed APIs

```http
GET    /api/v1/kds/capacity
POST   /api/v1/kds/capacity/throttle
POST   /api/v1/kds/capacity/extend-promise
POST   /api/v1/kds/capacity/pause
POST   /api/v1/kds/capacity/resume
GET    /api/v1/kds/capacity/history
```

## 11.9 Real-Time Propagation

Proposed flow:

```text
KDS / Kitchen User
       |
       v
Capacity Service
       |
       +----> Order Promise-Time Service
       |
       +----> Guest App
       |
       +----> Staff App / Admin where applicable
```

## 11.10 Error / Exception Handling

### Guest App Does Not Receive Capacity Update

The server remains the authoritative source. New checkout/promise-time validation should re-evaluate the current capacity state rather than trusting stale client data.

### Capacity Service Unavailable

The fallback behavior must be explicitly defined before production. At minimum, the system must avoid silently representing an unavailable capacity state as confirmed capacity.

### Manual Override Conflicts with Automatic Calculation

Precedence rules are **TBD** and require operations approval.

## 11.11 Acceptance Criteria

- Authorized kitchen user can activate an approved capacity control.
- Promise-time extension reaches the customer ordering flow.
- Configured order pause prevents affected new orders when capacity is full.
- Existing accepted orders remain intact.
- Capacity changes are auditable.
- Current capacity state is visible to the KDS user.

---

# 12. Module 5.3.7 — Prep-Time Recording & Kitchen Analytics

## 12.1 Module Overview

This module records preparation time per item and preserves the data needed to improve future promise-time accuracy and produce the kitchen performance reporting defined in the BRS.

## 12.2 BRS Mapping

| BRS Reference | Requirement / Flow | Priority |
|---|---|---|
| FR-KD-06 | System records prep time per item to inform future promise-time accuracy. | S |
| FR-AD-07 | Dashboards report kitchen performance, including prep time by item and station and SLA breach rate. | S |
| Section 11.2 | Kitchen daily reporting and reconciliation/reporting requirements. | Relevant reporting context |
| NFR-16 | Transaction records retained per statutory requirement; behavioral analytics no longer than 24 months. | M |

## 12.3 Functional Requirements

| ID | Requirement | Priority | Source Status |
|---|---|---|---|
| SRS-KPA-001 | System must record preparation time for each applicable kitchen item. | S | BRS FR-KD-06 |
| SRS-KPA-002 | Prep-time records must retain item and station context where available. | S | BRS FR-AD-07 aligned |
| SRS-KPA-003 | System must preserve actual preparation timestamps needed to derive prep duration. | S | SRS Design Proposal |
| SRS-KPA-004 | Prep-time data must be available to the promise-time optimization logic. | S | BRS FR-KD-06 |
| SRS-KPA-005 | Kitchen reporting must be able to summarize prep time by item and station. | S | BRS FR-AD-07 |
| SRS-KPA-006 | SLA breach information must be available for kitchen reporting. | S | BRS FR-AD-07 |
| SRS-KPA-007 | Retention must follow the platform's approved data-retention policy. | M | BRS NFR-16 |

## 12.4 Proposed Measurement Model

```text
Item Ticket Created
        |
        v
Prep Start
        |
        v
Prep Complete / Item Ready
        |
        v
Prep Duration = Completion Timestamp - Start Timestamp
```

Exact measurement boundaries are **TBD**.

## 12.5 Business Rules

- **BR-KPA-001:** Prep-time measurements must use consistent timestamp definitions.
- **BR-KPA-002:** An item should not generate multiple final prep-time records unless the data model explicitly supports revisions/rework.
- **BR-KPA-003:** Station context should be preserved for reporting where the BRS requires reporting by station.
- **BR-KPA-004:** Prep-time analytics must not overwrite the original operational event history.
- **BR-KPA-005:** Retention must comply with the BRS and approved data governance rules.

## 12.6 Proposed Data Fields

| Field | Purpose | Status |
|---|---|---|
| prep_record_id | Unique record | Proposal |
| order_id | Source order | Proposal |
| ticket_id | Source kitchen ticket | Proposal |
| item_id | Menu item | BRS entity alignment |
| station_id | Preparation station | Proposal |
| started_at | Prep start | Proposal |
| completed_at | Prep completion | Proposal |
| duration_seconds | Derived/recorded duration | Proposal |
| target_seconds | Applicable target | Proposal |
| sla_breached | Breach indicator | Proposal |
| user_id | Action actor where relevant | Proposal / audit alignment |

## 12.7 Reporting Outputs

The BRS requires kitchen performance reporting including:

- Prep time by item.
- Prep time by station.
- SLA breach rate.

The detailed dashboard layout, filters, aggregation windows and visualization are **Admin Console SRS** concerns and should be cross-referenced rather than duplicated here.

## 12.8 Proposed APIs

```http
GET    /api/v1/kds/analytics/prep-times
GET    /api/v1/kds/analytics/sla-breaches
GET    /api/v1/kds/items/{item_id}/prep-times
GET    /api/v1/kds/stations/{station_id}/prep-times
```

## 12.9 Error / Exception Handling

### Missing Completion Timestamp

Do not create a misleading completed prep record. Mark the record incomplete until the operational state is resolved.

### Negative Duration

Reject invalid timestamp combinations and alert on data inconsistency.

### Duplicate Completion Event

Handle idempotently so a duplicate network/event delivery does not double-count the item.

## 12.10 Acceptance Criteria

- Prep time is recorded per applicable item.
- Item and station context are retained where required.
- Data is available for future promise-time accuracy improvements.
- Reporting can aggregate prep time by item and station.
- SLA breach data is reportable.

---

# 13. 5.3 KDS Cross-Module Requirements

This section consolidates requirements that apply across all KDS modules.

## 13.1 Real-Time Updates

The BRS describes the KDS as a live order queue and requires KDS participation in ticket routing, prep status and capacity signalling.

### Requirements

| ID | Requirement | Status |
|---|---|---|
| SRS-KDX-001 | KDS must receive new ticket updates in near real time during normal connectivity. | SRS Design Proposal |
| SRS-KDX-002 | KDS must receive status updates without requiring manual refresh during normal operation. | SRS Design Proposal |
| SRS-KDX-003 | Capacity changes must propagate through the backend to affected ordering flows. | BRS-aligned |
| SRS-KDX-004 | Client reconnection must trigger authoritative state reconciliation. | BRS NFR-11 aligned |
| SRS-KDX-005 | Server-side state remains authoritative over stale client state. | SRS Design Proposal |

## 13.2 WebSocket Strategy

The BRS does not name WebSockets. If the approved system architecture uses WebSockets, the KDS can use them for live operational updates.

Proposed event categories:

```text
Ticket events
- created
- updated
- started
- course_fired
- item_ready
- ticket_ready
- delayed

Capacity events
- capacity_updated
- throttle_enabled
- promise_time_extended
- ordering_paused
- ordering_resumed

System events
- reconnect_required
- reconciliation_required
- integration_error
```

All event contracts require implementation approval.

---

# 14. Offline / Short Network Loss Requirements

The BRS explicitly requires the Staff App and KDS to continue to display and progress accepted orders during a short network loss and reconcile on reconnection.

## 14.1 Functional Expectations

1. Existing accepted tickets already available on the KDS remain visible.
2. Timer progression should remain correct using the authoritative timing model.
3. Operational progress made during the short disconnect should be captured according to the client resilience design.
4. On reconnection, the KDS must reconcile local state against server-authoritative state.
5. Conflicts must be detected rather than silently overwriting server data.

## 14.2 SRS Design Proposal

Possible implementation approach:

```text
Server State
   |
   v
KDS Local Operational Cache
   |
   +---- short disconnect ----+
   |                           |
   v                           v
Continue Display        Queue Local Actions
                               |
                               v
                         Reconnect
                               |
                               v
                       Reconciliation
                               |
                               v
                     Server Authoritative State
```

Exact local persistence mechanism and conflict policy are **TBD**.

---

# 15. Order Reliability and Idempotency

The BRS explicitly requires that no accepted guest order is lost and that order injection is idempotent, retried and alerted on failure.

## 15.1 KDS Requirements

- Each source order must be uniquely identifiable.
- Duplicate inbound delivery must not produce duplicate active tickets.
- KDS ticket creation/update must support idempotent processing.
- Integration failures must be visible and actionable.
- A failed event must not silently disappear.
- Reconciliation must be supported for any integration gap.

## 15.2 Proposed Idempotency Key

```text
idempotency_key = source_system + source_order_id + event_type + event_version
```

This is a design proposal only; exact event identity strategy is **TBD**.

---

# 16. KDS Integration Requirements

## 16.1 POS Integration

The BRS defines POS as a **two-way critical integration** for order injection and settlement, while KDS uses POS-originated/managed order data as part of the order flow.

KDS-related expectations:

- Accepted order reaches POS according to the platform order flow.
- The corresponding kitchen ticket becomes available on KDS.
- Failures are retried and alerted.
- Financial truth remains with POS.

## 16.2 KDS Integration Boundary

The BRS itself lists KDS as a two-way critical integration for:

- Ticket routing.
- Prep status.
- Capacity signals.

Therefore, the integration contract must support both operational state movement and capacity feedback.

## 16.3 Guest App Integration

KDS capacity changes must influence promise-time presentation and/or ordering availability.

Guest-facing status flow described by the BRS includes:

```text
Accepted -> Preparing -> Ready -> Dispatched -> Delivered
```

The KDS is responsible for the kitchen preparation portion of this flow; delivery progression is handled downstream.

## 16.4 Staff App Integration

Relevant staff-facing interactions may include:

- Order acceptance and operational changes.
- Table-side orders entering the same kitchen queue as app orders.
- Guest notes/allergy/preferences visibility.
- Item availability changes.

The BRS directly states that staff table-side orders flow to the same kitchen queue as app orders.

## 16.5 Admin Console Integration

Admin reporting requires:

- Prep time by item.
- Prep time by station.
- SLA breach rate.

Admin configuration may also influence menu, availability and other operational policies. Exact KDS administration screens belong in the Admin Console SRS.

---

# 17. Data Requirements

## 17.1 Core Entities Relevant to KDS

The BRS identifies the following core entities relevant to the KDS workflow:

- Order.
- Menu Item.
- Staff User.

Additional technical entities such as KDS Ticket, Station, Course, Prep Record and Capacity State are SRS-level implementation entities proposed to support the BRS requirements.

## 17.2 Proposed KDS Ticket Entity

```text
KdsTicket
- id
- order_id
- outlet_id
- source_channel
- priority
- target_time
- status
- received_at
- started_at
- ready_at
- created_at
- updated_at
```

## 17.3 Proposed KDS Ticket Line Entity

```text
KdsTicketLine
- id
- ticket_id
- order_item_id
- menu_item_id
- station_id
- course_id
- quantity
- modifiers
- allergy_flags
- special_instructions
- spice_instruction
- status
- started_at
- ready_at
```

## 17.4 Proposed Station Entity

```text
KitchenStation
- id
- outlet_id
- name
- station_type
- status
- display_order
- configuration
```

The BRS gives examples of tandoor, curry, grill and dessert stations. Exact schema and station types are TBD.

## 17.5 Proposed Prep Record Entity

```text
PrepTimeRecord
- id
- ticket_id
- ticket_line_id
- menu_item_id
- station_id
- started_at
- completed_at
- duration_seconds
- target_seconds
- sla_breached
- created_at
```

## 17.6 Proposed Capacity State Entity

```text
KitchenCapacityState
- id
- outlet_id
- mode
- promise_time_adjustment
- ordering_paused
- reason
- effective_from
- effective_to
- changed_by
- created_at
```

Exact structure is TBD.

---

# 18. Business Rules Consolidated Register

| Rule ID | Rule |
|---|---|
| BR-KD-001 | Every accepted kitchen order must be represented operationally without silent loss. |
| BR-KD-002 | KDS ticket processing must be idempotent for duplicate inbound events. |
| BR-KD-003 | Queue ordering must follow approved kitchen priority rules. |
| BR-KD-004 | Target and elapsed time must be visible for active tickets. |
| BR-KD-005 | Tickets must route to the correct configured station. |
| BR-KD-006 | Course-by-course firing must be supported. |
| BR-KD-007 | Allergy and modifier information must be unmistakably emphasized. |
| BR-KD-008 | Guest-provided kitchen instructions must not be silently lost or truncated. |
| BR-KD-009 | Tickets that breach target time must receive the configured visual escalation. |
| BR-KD-010 | Manager alerting occurs when configured. |
| BR-KD-011 | Kitchen capacity controls must protect the physical throughput limit. |
| BR-KD-012 | Capacity changes must affect promise-time/order availability according to approved policy. |
| BR-KD-013 | Prep time must be recorded per applicable item. |
| BR-KD-014 | Prep-time information must remain available for future promise-time accuracy. |
| BR-KD-015 | Short network loss must not permanently remove accepted orders from KDS visibility. |
| BR-KD-016 | Reconnection must reconcile to server-authoritative state. |
| BR-KD-017 | State-changing operational actions must be attributable to a named user. |
| BR-KD-018 | Exact authentication, station mappings, queue algorithms, thresholds and UI treatments are not treated as BRS facts unless explicitly defined there. |

---

# 19. Validation Rules Register

## 19.1 Ticket Validation

- Valid order ID.
- Valid outlet.
- Valid ticket identity.
- At least one kitchen-relevant line.
- Valid station mapping where required.
- Valid course information where used.
- Valid target time.

## 19.2 Modifier / Instruction Validation

- Modifier belongs to the relevant menu item or approved order configuration.
- Allergy instruction remains linked to the correct item.
- Special instruction remains associated with the source order/item.
- Payload transfer does not silently truncate required instruction content.

## 19.3 State Transition Validation

- State changes must follow the approved KDS state model.
- Duplicate state requests must be handled safely.
- Closed/ready tickets must not be restarted without approved override behavior.

## 19.4 Capacity Validation

- Capacity changes require authorization.
- Promise-time adjustments must be within approved boundaries.
- Pause/resume operations must be valid for the outlet context.

---

# 20. Error and Exception Handling

| Exception | Required Handling |
|---|---|
| Order not received by KDS | Detect through monitoring/reconciliation and retry according to integration strategy. |
| Duplicate order event | Process idempotently; do not create duplicate ticket. |
| Station mapping missing | Show operational exception; do not silently omit item. |
| Ticket target time missing | Resolve through approved logic or surface as exception. |
| Allergy instruction missing | Do not silently present an incomplete kitchen ticket; trigger exception handling. |
| Ticket exceeds target | Visual escalation; manager alert when configured. |
| Kitchen capacity reached | Extend promise times and/or pause ordering according to configuration. |
| Capacity propagation failure | Surface integration fault and avoid misleading downstream capacity state. |
| KDS network loss | Continue with accepted local state and reconcile on reconnection. |
| WebSocket disconnected | Reconnect and perform authoritative state refresh/reconciliation. |
| Invalid state transition | Reject and log the attempted action. |
| Duplicate action | Make action idempotent or block based on current state. |
| Authentication/session failure | Deny protected access and require valid session. |

---

# 21. Security Requirements

The following security requirements derive from platform-level BRS expectations and KDS operational needs.

## 21.1 Authentication

- Protected KDS functions require authenticated access.
- Authentication must follow the platform-approved authentication mechanism.
- BRS NFR-05 requires one-time-password authentication with rate limiting at platform level; KDS-specific login details remain subject to architecture/security design.

## 21.2 Authorization

- Apply RBAC.
- Enforce least privilege.
- Enforce server-side permissions.
- Restrict outlet/station access as configured.

## 21.3 Auditability

The KDS should record state-changing actions with:

- User.
- Timestamp.
- Action.
- Ticket/order reference.
- Previous state where relevant.
- New state where relevant.
- Source device/session where approved by the security design.

Exact audit schema belongs to the platform audit model.

## 21.4 Data Security

The BRS requires encryption in transit and at rest.

Sensitive data should be minimized on KDS screens. Exact guest information visible in KDS must be limited to what kitchen operations require.

---

# 22. Non-Functional Requirements Relevant to KDS

| BRS NFR | KDS Implication |
|---|---|
| NFR-02 Availability | KDS should support the platform's 99.9% monthly availability target during trading hours. |
| NFR-03 Scalability | KDS and related order processing must handle at least 10x launch peak concurrent order volume without redesign. |
| NFR-04 Reliability | Accepted orders must not be lost; idempotent processing/retry/alerting required. |
| NFR-05 Security | Encryption in transit/at rest, OTP authentication, rate limiting and penetration testing. |
| NFR-11 Resilience | KDS must continue to display/progress accepted orders during short network loss and reconcile on reconnection. |
| NFR-12 Localisation readiness | Currency/tax/date/address/language handling are configurable at platform level; KDS language at MVP is not separately specified. |
| NFR-13 Observability | KDS faults and integration failures must be logged, monitored and alerted with ownership. |
| NFR-15 Support | Severity 1 incidents acknowledged within 15 minutes and mitigated within 2 hours during trading hours. |
| NFR-16 Data retention | Retain operational records according to statutory requirements; behavioural analytics no longer than 24 months. |

---

# 23. Observability Requirements

## 23.1 Logs

At minimum, logs should support investigation of:

- Ticket creation.
- Ticket update failures.
- Routing failures.
- State transition failures.
- Capacity-control changes.
- Reconnection/reconciliation failures.
- Integration faults.
- Alert delivery failures.

## 23.2 Metrics

Proposed KDS metrics:

- Active tickets.
- Tickets per station.
- Average prep time.
- Median prep time.
- SLA breach count.
- SLA breach rate.
- Capacity state duration.
- Order ingestion latency.
- Reconciliation count.
- KDS client connection health.

These metrics support the BRS reporting requirements, but exact metric names and monitoring tooling are implementation decisions.

## 23.3 Alerts

Alerting should cover at least:

- Critical integration failures.
- Order-to-KDS mismatch.
- Persistent queue processing failure.
- SLA breach escalation when configured.
- Capacity-control propagation failure.
- Reconciliation failure.

---

# 24. API Requirements — Proposed Contract Areas

The BRS does not prescribe API contracts. The following groups are implementation planning areas.

## 24.1 Ticket APIs

```text
GET  /kds/tickets
GET  /kds/tickets/{id}
POST /kds/tickets/{id}/start
POST /kds/tickets/{id}/ready
```

## 24.2 Station APIs

```text
GET /kds/stations
GET /kds/stations/{id}/tickets
```

## 24.3 Course APIs

```text
POST /kds/tickets/{id}/courses/{course_id}/fire
POST /kds/tickets/{id}/courses/{course_id}/complete
```

## 24.4 Capacity APIs

```text
GET  /kds/capacity
POST /kds/capacity/throttle
POST /kds/capacity/extend-promise
POST /kds/capacity/pause
POST /kds/capacity/resume
```

## 24.5 Analytics APIs

```text
GET /kds/analytics/prep-times
GET /kds/analytics/sla-breaches
```

Exact naming, versioning, authentication, request/response schema, pagination, error codes and idempotency rules are part of the API design phase.

---

# 25. Proposed Database Relationships

```text
Order
  |
  +---- OrderItem
          |
          +---- MenuItem
          |
          +---- ModifierSelection
          |
          +---- SpecialInstruction
          |
          +---- AllergyInstruction

Order
  |
  v
KdsTicket
  |
  +---- KdsTicketLine
  |         |
  |         +---- KitchenStation
  |         +---- Course
  |         +---- PrepTimeRecord
  |
  +---- TicketEvent / Audit Event

KitchenStation
  |
  +---- Capacity / Operational State
```

This is a proposed logical model, not a BRS-defined physical schema.

---

# 26. KDS UI / UX Requirements

The BRS defines operational outcomes rather than screen design. The following are therefore implementation design requirements to validate with kitchen staff.

## 26.1 Ticket Visibility

The primary KDS view should make the following information quickly visible:

- Ticket/order reference.
- Queue priority.
- Target time.
- Elapsed time.
- Station.
- Course.
- Item quantity.
- Modifiers.
- Allergy information.
- Special instructions.
- Preparation state.

## 26.2 Escalation Visibility

The BRS requires unmistakable visual escalation. Final treatment should be designed with the kitchen to avoid ambiguity and should not rely on colour alone.

## 26.3 Operational Touch Targets

Button sizes, touch behavior, timeout behavior and screen wake behavior must be validated on the selected kitchen hardware. The BRS does not specify hardware or UI dimensions.

---

# 27. Kitchen Hardware and Environment Dependencies

The BRS assumes sufficient tablet hardware and reliable in-restaurant connectivity will be provided at each outlet.

The SRS should therefore record, before deployment:

- KDS device model(s).
- Screen size/orientation.
- Mounting position.
- Network type.
- Network fallback.
- Power/charging arrangement.
- Kitchen temperature/environment constraints.
- Device replacement procedure.
- Device identification and outlet/station assignment.

Exact hardware specifications are **TBD**.

---

# 28. Testing Requirements

## 28.1 Functional Testing

Test at minimum:

- Ticket creation.
- Queue ordering.
- Timer behavior.
- Station routing.
- Course firing.
- Modifier display.
- Allergy emphasis.
- Special instructions.
- SLA escalation.
- Capacity throttling.
- Promise-time propagation.
- Prep-time recording.
- Reconnection/reconciliation.
- Permission checks.
- Audit logging.

## 28.2 Integration Testing

Test:

- Order source -> POS -> KDS.
- Staff table-side order -> KDS.
- KDS -> prep status -> Guest App/Staff flow.
- KDS capacity -> promise-time service -> Guest App.
- KDS -> analytics/reporting.

## 28.3 Reliability Testing

- Duplicate event delivery.
- Message replay.
- Delayed event arrival.
- Temporary POS outage.
- Temporary network outage.
- WebSocket disconnect.
- Backend restart.
- Device restart.
- Reconciliation after reconnect.

## 28.4 Data Integrity Testing

Specifically test:

- Allergy instruction preservation.
- Spice-level instruction preservation.
- Modifier preservation.
- Correct station mapping.
- Correct item association.
- Correct prep-time calculation.
- No duplicate ticket creation.

## 28.5 Performance Testing

Validate against the platform scalability target and production-like kitchen order bursts, including festival/surge scenarios referenced by the BRS scalability requirement.

## 28.6 Security Testing

- Authentication bypass tests.
- Authorization tests.
- Session handling.
- Rate limiting.
- Transport encryption.
- Data-at-rest protection.
- Injection/input validation.
- Penetration testing before launch as required by the BRS.

---

# 29. Acceptance Criteria for KDS

## 29.1 Direct KDS Acceptance

The KDS implementation is functionally acceptable when:

1. Orders appear in priority order with target and elapsed time.
2. Tickets route to the correct configured stations.
3. Course-by-course firing is supported.
4. Allergy and modifier information is unmistakably emphasized.
5. Special instructions reach the kitchen ticket correctly.
6. SLA breaches create visual escalation and configured manager alerts.
7. Kitchen capacity can be throttled or promise times extended according to approved configuration.
8. Capacity signals propagate to the Guest App flow.
9. Prep time is recorded per applicable item.
10. Prep-time data is usable for future promise-time accuracy.

## 29.2 Phase 1 BRS Acceptance Relevance

The overall BRS Phase 1 acceptance requires:

- Every app order appears correctly in POS and KDS, with zero lost orders across the pilot.
- Allergen and spice-level instructions reach the kitchen ticket without loss or truncation in every tested case.
- All Section 9 non-functional targets are evidenced, including security, performance and accessibility testing with no open high-severity findings.
- A production-equivalent demonstration and two-week pilot at one outlet are used for acceptance.

The KDS must therefore be tested as part of the full end-to-end order flow rather than as an isolated application.

---

# 30. Dependencies

| Dependency | Importance |
|---|---|
| Existing POS interface | Critical for order flow and operational continuity. |
| Menu/item/station configuration | Critical for routing and kitchen preparation. |
| Reliable outlet connectivity | Critical operational dependency. |
| KDS hardware | Required for deployment. |
| Staff / kitchen training | Required for operational adoption. |
| Guest App ordering flow | Required for end-to-end order propagation. |
| Staff App ordering flow | Required for table-side orders and operational workflows. |
| Admin configuration/reporting | Required for policy, monitoring and analytics. |
| Notification capability | Required when manager alerting is configured. |

The BRS also states that staff will be released for training before launch and a floor champion will be nominated per shift.

---

# 31. Risks Specific to KDS

| Risk | Potential Effect | Mitigation Direction |
|---|---|---|
| Kitchen overload | Long preparation times and service disruption | Capacity throttling, dynamic promise times and pilot validation. |
| Missing / incorrect station mapping | Orders routed to wrong station | Configuration validation and operational exceptions. |
| Allergy instruction loss | High operational and guest-trust risk | End-to-end integrity testing and visible emphasis. |
| Duplicate ticket creation | Duplicate preparation / operational confusion | Idempotency and reconciliation. |
| Network loss | Stale or missing operational state | Local continuity + reconciliation. |
| POS/KDS integration failure | Orders may fail to reach kitchen | Retry, alerting, reconciliation and manual fallback planning where approved. |
| Incorrect prep-time data | Poor promise-time accuracy | Consistent timer definitions and data validation. |
| Ambiguous escalation display | Delayed response to overdue work | Kitchen-tested visual treatment and non-colour-only cues. |
| Capacity override conflict | Inconsistent customer promise | Explicit precedence policy and audit history. |

---

# 32. TBD / Open Decisions Register

This section intentionally records items not defined by the BRS.

| ID | Open Decision | Owner / Approver | Status |
|---|---|---|---|
| KDS-TBD-001 | Exact KDS authentication method | IT / Security | Open |
| KDS-TBD-002 | KDS role names and permission matrix | Operations / IT | Open |
| KDS-TBD-003 | Number of KDS devices and stations per outlet | Executive Chef / Operations | Open |
| KDS-TBD-004 | Station configuration data model | Executive Chef / IT | Open |
| KDS-TBD-005 | Exact queue priority algorithm | Executive Chef / Operations | Open |
| KDS-TBD-006 | Timer start event | Executive Chef / IT | Open |
| KDS-TBD-007 | Timer stop event | Executive Chef / IT | Open |
| KDS-TBD-008 | Exact SLA thresholds | Executive Chef / Operations | Open |
| KDS-TBD-009 | Escalation colours and visual treatment | Executive Chef / UX | Open |
| KDS-TBD-010 | Manager alert channels | Operations / IT | Open |
| KDS-TBD-011 | Manual vs automatic capacity override precedence | Operations / Product | Open |
| KDS-TBD-012 | Promise-time calculation formula | Product / Operations / IT | Open |
| KDS-TBD-013 | Order pause policy at capacity | Operations | Open |
| KDS-TBD-014 | Short-network-loss local action persistence model | IT | Open |
| KDS-TBD-015 | Reconciliation conflict policy | IT / Product | Open |
| KDS-TBD-016 | Exact WebSocket/event contract | Architecture / Backend | Open |
| KDS-TBD-017 | KDS device OS/hardware standard | IT / Operations | Open |
| KDS-TBD-018 | Guest data visible on KDS | Operations / Privacy | Open |
| KDS-TBD-019 | Prep-time measurement boundaries | Executive Chef / Product | Open |
| KDS-TBD-020 | Reporting aggregation and retention implementation | Finance / IT | Open |

---

# 33. Implementation Notes

## 33.1 Backend Boundary

The KDS should not become the source of truth for financial transactions. The platform must continue to respect the BRS principle that the POS remains the financial system of record.

## 33.2 Event Flow

A practical implementation should separate:

- Command requests.
- Authoritative persisted state.
- Real-time notification/events.
- Reconciliation logic.

This allows a KDS screen to recover from a disconnected or stale client without changing the underlying business state incorrectly.

## 33.3 Idempotency

Idempotency must be applied anywhere duplicate order/event delivery can produce duplicate kitchen work.

## 33.4 Configuration Over Hard-Coding

Where the BRS says configurable behavior or references operational configuration, the implementation should prefer persisted configuration over hard-coded values.

Examples:

- Station mappings.
- Capacity thresholds.
- Promise-time adjustments.
- Manager alerting enablement.
- Reservation/order policies that influence upstream load.

## 33.5 Cross-Module Consistency

The KDS must use the same underlying order identity, menu item identity, modifier data and guest instruction payload that originate in the platform's order flow.

---

# 34. KDS Cross-Module Traceability Matrix

| KDS Module | Direct BRS | Related BRS | Primary Output |
|---|---|---|---|
| 5.3.1 KDS Authentication & Access | FR-AD-04, FR-ST-08 related | NFR-05 | Authorized kitchen access |
| 5.3.2 Kitchen Order Queue | FR-KD-01 | NFR-04, NFR-11, FR-OR-06, FR-NT-01, BRS 7.2 | Live prioritized ticket queue |
| 5.3.3 Station Routing & Course Firing | FR-KD-02 | BRS 7.2, FR-OR-04 | Correct station/course work |
| 5.3.4 Modifiers, Allergies & Special Instructions | FR-KD-03 | FR-OR-04, FR-MN-02, FR-MN-03, Phase 1 acceptance | Safe, visible kitchen instructions |
| 5.3.5 Prep Timers & SLA Escalation | FR-KD-04 | FR-KD-01, FR-AD-07, NFR-13 | Time tracking and escalation |
| 5.3.6 Kitchen Capacity & Dynamic Promise Time | FR-KD-05 | FR-OR-07, BRS 7.3, NFR-03 | Capacity control and promise signalling |
| 5.3.7 Prep-Time Recording & Kitchen Analytics | FR-KD-06 | FR-AD-07, NFR-16 | Prep-time data for analytics and accuracy |

---

# 35. KDS End-to-End Test Scenarios

## Scenario 1 — Standard Pickup Order

```text
Guest places pickup order
        -> Order accepted
        -> POS injection succeeds
        -> KDS ticket created
        -> Ticket enters queue
        -> Correct station(s) displayed
        -> Kitchen starts preparation
        -> Ticket becomes ready
        -> Guest receives ready status
```

Expected: no duplicate ticket, correct timing, correct station and item information.

## Scenario 2 — Allergy Instruction

```text
Guest selects item
+ allergy instruction
        -> order created
        -> KDS ticket
        -> allergy warning shown prominently
        -> kitchen prepares correct item
```

Expected: instruction reaches KDS without loss or truncation.

## Scenario 3 — Modifier + Spice Instruction

```text
Order item
+ modifier
+ spice preference
        -> KDS line item
        -> modifier visible
        -> spice instruction visible
```

Expected: kitchen receives the exact operational information needed under the approved rules.

## Scenario 4 — Slow Kitchen Ticket

```text
Ticket active
        -> elapsed time reaches target
        -> visual SLA escalation
        -> manager alert when configured
```

Expected: breach event recorded for reporting.

## Scenario 5 — Capacity Event

```text
Kitchen load rises
        -> capacity threshold reached
        -> promise time extended / intake throttled
        -> Guest App reflects updated availability/promise
```

Expected: no new order is accepted beyond configured capacity policy.

## Scenario 6 — Network Interruption

```text
KDS connected
        -> active tickets visible
        -> network interruption
        -> existing tickets remain operational
        -> reconnect
        -> reconcile server state
```

Expected: accepted orders are not lost and final state is consistent.

## Scenario 7 — Duplicate Event

```text
Same order event delivered twice
        -> idempotency check
        -> one operational ticket
```

Expected: no duplicate kitchen preparation.

## Scenario 8 — Missing Station Mapping

```text
Order item without station mapping
        -> ticket exception
        -> item not silently omitted
        -> authorized user notified
```

Expected: operational issue remains visible until resolved.

---

# 36. KDS Delivery Checklist

## Requirements

- [ ] FR-KD-01 implemented and tested.
- [ ] FR-KD-02 implemented and tested.
- [ ] FR-KD-03 implemented and tested.
- [ ] FR-KD-04 implemented and tested.
- [ ] FR-KD-05 implemented and tested.
- [ ] FR-KD-06 implemented and tested.

## Order Reliability

- [ ] POS -> KDS order flow tested.
- [ ] Idempotency tested.
- [ ] Retry and failure alerting tested.
- [ ] Reconciliation tested.
- [ ] No accepted order lost in end-to-end tests.

## Kitchen Operations

- [ ] Stations configured.
- [ ] Station routing verified.
- [ ] Course firing verified.
- [ ] Modifier display verified.
- [ ] Allergy display verified.
- [ ] Special instructions verified.
- [ ] Prep timers verified.
- [ ] SLA escalation verified.
- [ ] Capacity controls verified.
- [ ] Promise-time propagation verified.

## Data / Reporting

- [ ] Prep time recorded per item.
- [ ] Station context captured.
- [ ] SLA breach events captured.
- [ ] Admin kitchen report data validated.

## Resilience / Security

- [ ] Authentication validated.
- [ ] RBAC validated.
- [ ] Audit trail validated.
- [ ] Network-loss behavior validated.
- [ ] Reconnection reconciliation validated.
- [ ] Security testing completed.
- [ ] Monitoring and alerting configured.

## Pilot / Production

- [ ] Production-equivalent environment tested.
- [ ] Two-week pilot scenarios covered.
- [ ] Kitchen staff training completed.
- [ ] Operational issues closed or formally accepted.

---

# 37. Final Requirements Summary

The Sacred Spice KDS must provide a dependable operational bridge between accepted customer/staff orders and kitchen execution.

The mandatory business outcomes are:

1. **Live prioritized kitchen queue with target and elapsed time.**
2. **Correct station routing and course-by-course firing.**
3. **Unmistakable visibility of allergy and modifier information.**
4. **Visual SLA escalation with optional manager alerts.**
5. **Kitchen capacity control and promise-time signalling back to the Guest App.**
6. **Per-item preparation-time recording for future promise-time accuracy.**
7. **Reliable order processing with no silent loss, supported by idempotency, retry and reconciliation.**
8. **Short-network-loss continuity and reconciliation.**
9. **Traceable, permission-controlled operational actions.**
10. **Data availability for kitchen analytics and reporting.**

Any technical choice not explicitly defined by the BRS must remain clearly identified as a design proposal or open decision until approved through the SRS/design process.

---

# 38. Source Reference

Primary source for this SRS section:

**Sacred Spice Restaurant — Business Requirement Specification (BRS) v1.0**  
**Document ID:** SSR-BRS-001  
**Date:** 15 September 2026  
**Relevant sections:**

- Section 5 — Scope / KDS scope.
- Section 7.2 — Off-Premise Order to Fulfilment.
- Section 7.3 — Exception Handling / Kitchen at Capacity.
- Section 8.4 — Ordering and Cart.
- Section 8.9 — Staff App.
- Section 8.10 — Kitchen Display System.
- Section 8.11 — Admin Console and Reporting.
- Section 9 — Non-Functional Requirements.
- Section 10 — Integration Requirements.
- Section 11 — Data and Reporting Requirements.
- Section 12 — Assumptions, Dependencies and Constraints.
- Section 14 — Acceptance Criteria.

---

**End of SRS — Section 5.3 Kitchen Display System**
