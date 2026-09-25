# SACRED SPICE RESTAURANT
## Software Requirement Specification (SRS)
### 5.2.1 Staff App → Staff Authentication & Access Control

**Source:** Sacred Spice Restaurant — Business Requirement Specification (BRS) v1.0  
**BRS Date:** 15 September 2026  
**SRS Module:** 5.2.1  
**Product Area:** Staff App  
**Status:** Draft for implementation and stakeholder review

---

## 1. Module Overview

The **Staff Authentication & Access Control** module controls secure access to the Staff App and ensures that staff actions are performed under an identified staff user with the permissions and outlet context assigned to that user.

The BRS does **not** define a dedicated Staff Authentication functional-requirement group or prescribe a login method. This SRS therefore maps the authentication/access-control requirements from the BRS areas that directly apply:

- **FR-AD-04:** Role-based access control governs every function, with least privilege by default and a full audit trail.
- **FR-ST-05:** Staff see guest tier, allergens, preferences and notes before service, subject to role permissions.
- **FR-ST-08:** All staff actions are attributed to a named user for accountability.
- **BRS Core Data Entity — Staff user:** role, permissions, outlet, action audit trail.
- Staff training and a nominated floor champion are identified in the BRS assumptions.

The exact authentication mechanism, session duration, MFA policy, device trust policy, password/OTP method, lockout thresholds, and final staff role catalogue are **not specified in the BRS** and remain TBD.

---

## 2. BRS Requirements Mapping

### 2.1 Directly Applicable BRS Requirements

| BRS ID / Reference | Priority | Requirement / Content |
|---|---|---|
| FR-AD-04 | M | Role-based access control governs every function, with least privilege by default and a full audit trail. |
| FR-ST-05 | M | Staff see guest tier, allergens, preferences and notes before service, subject to role permissions. |
| FR-ST-08 | M | All staff actions are attributed to a named user for accountability. |
| BRS §11.1 — Staff user | — | Staff user entity contains role, permissions, outlet and action audit trail. |
| BRS §12.1 — Staff readiness | — | Staff will be released for training before launch and a floor champion will be nominated per shift. |

### 2.2 Important Source Limitation

The BRS does **not** explicitly define:

- Staff login method.
- Staff registration process.
- Password vs OTP.
- MFA.
- Session timeout.
- Device binding.
- Account lockout values.
- Role names.
- Permission matrix.
- Password policy.
- SSO.
- Password reset flow.

These must be defined in the SRS/design phase and should not be treated as BRS-approved business rules until signed off.

---

## 3. Feature Scope

### 3.1 Staff Sign-In

Provide a secure mechanism for an authorised staff member to access the Staff App.

The exact mechanism is TBD.

### 3.2 Staff Identity

Every authenticated session must resolve to a named Staff user.

The Staff user context shall contain at least the BRS-defined:

- Role.
- Permissions.
- Outlet.
- Action audit trail.

### 3.3 Role-Based Access Control

Access to Staff App functions must be controlled through roles and permissions.

Least privilege is required by the BRS.

### 3.4 Outlet Context

A staff user must operate only within the outlet context allowed by their permissions.

The exact multi-outlet/multi-restaurant access model is an implementation/design decision and must align with the project's confirmed multi-restaurant architecture.

### 3.5 Audit Attribution

Staff actions must be attributable to the named user who performed them.

This requirement must continue across operational modules such as:

- Floor/table management.
- Waitlist.
- Order handling.
- Table-side ordering.
- Item availability.
- Delivery dispatch.

### 3.6 Permission-Controlled Guest Information

Guest information such as tier, allergens, preferences and notes must only be shown where the authenticated staff user's role permits access, as specified by FR-ST-05.

---

## 4. User Flows

### 4.1 Staff Login Flow

1. Staff member opens the Staff App.
2. Staff member enters the approved authentication credentials/method.
3. Backend validates the staff identity.
4. Backend resolves the active Staff user, role, permissions and outlet context.
5. A valid authenticated session/token is created.
6. Staff App opens the Staff App functions allowed by the user's permissions.
7. Staff activity is attributed to that named user.

### 4.2 Authorised Function Access

1. Staff user authenticates.
2. Staff App requests or receives current permissions.
3. Staff selects a function.
4. Backend verifies permission for the requested operation.
5. Operation is allowed only when the permission check succeeds.
6. The resulting action is recorded against the named user.

### 4.3 Unauthorised Function Access

1. Staff user authenticates.
2. Staff selects a restricted function.
3. Backend evaluates permission.
4. Permission is denied.
5. No business action is performed.
6. Denied access may be logged according to the security/audit design.

### 4.4 Logout / Session End

1. Staff selects logout or the authenticated session expires.
2. Session is invalidated according to the authentication design.
3. Protected Staff App functions are no longer accessible.
4. The user must authenticate again before continuing.

Exact session expiration and refresh behavior are TBD.

---

## 5. Functional Requirements

### 5.1 SRS-FS-01 — Staff Authentication

**Priority:** SRS Core

The system shall authenticate a Staff user before allowing access to protected Staff App functions.

**BRS basis:** FR-AD-04, Staff user entity.

The exact authentication method is TBD.

### 5.2 SRS-FS-02 — Named Staff Identity

**Priority:** SRS Core

Each active Staff App session shall resolve to one named Staff user.

The active user identity shall be available to downstream authorization and audit processing.

**BRS basis:** FR-ST-08, BRS §11.1.

### 5.3 SRS-FS-03 — Role and Permission Resolution

**Priority:** Must-aligned

The system shall resolve the user's assigned role and permissions after authentication.

Access shall follow least-privilege principles.

**BRS basis:** FR-AD-04.

### 5.4 SRS-FS-04 — Permission Check

**Priority:** Must-aligned

Every protected Staff App business operation shall be authorized against the current user's permissions.

Permission checks shall be enforced on the backend and not only in the mobile UI.

### 5.5 SRS-FS-05 — Outlet Context

**Priority:** Must-aligned

The authenticated Staff user shall operate within the outlet context permitted for that user.

The system shall prevent unauthorized cross-outlet operations.

The exact staff-to-outlet assignment model is TBD.

### 5.6 SRS-FS-06 — Action Attribution

**Priority:** Must

Every Staff App business action shall record the named Staff user responsible for the action.

**BRS basis:** FR-ST-08.

### 5.7 SRS-FS-07 — Permission-Controlled Guest Information

**Priority:** Must-aligned

Guest tier, allergens, preferences and notes shall be exposed to staff only when the authenticated user's role permits access.

**BRS basis:** FR-ST-05.

### 5.8 SRS-FS-08 — Session Protection

**Priority:** SRS Core

Protected Staff App functionality shall require a valid authenticated session.

Expired, revoked or invalid sessions shall not be allowed to execute protected operations.

Exact session lifetime and refresh policy are TBD.

### 5.9 SRS-FS-09 — Logout

**Priority:** SRS Core

The Staff App shall provide a logout mechanism that ends access to protected functions according to the authentication design.

### 5.10 SRS-FS-10 — Audit Context Propagation

**Priority:** Must-aligned

The authenticated Staff user context shall be propagated to service operations so that downstream audit records can attribute the action correctly.

**BRS basis:** FR-ST-08 and Staff user entity.

---

## 6. Role & Permission Model

The BRS requires role-based access control but does not define a final role list.

### Proposed SRS structure

A Staff user's effective access can be represented as:

`Staff User → Role → Permissions → Outlet Scope`

Example permission categories for design discussion:

- Floor/table management.
- Waitlist management.
- Order acceptance/modification/rejection.
- Table-side ordering.
- Guest information access.
- Delivery dispatch.
- Item availability management.

These categories are derived from the BRS Staff App capabilities. The exact role names and permission combinations are **TBD**.

### Least-Privilege Rule

A staff user should receive only the permissions required to perform their assigned duties.

Access should be denied by default when an explicit permission is absent.

---

## 7. Business Rules

### BR-SA-001 — Authentication Required
Protected Staff App operations require an authenticated Staff user.

### BR-SA-002 — Named User Required
Every protected action must be attributable to a named Staff user.

### BR-SA-003 — Least Privilege
Staff access must follow least-privilege principles.

**BRS basis:** FR-AD-04.

### BR-SA-004 — Backend Authorization
Authorization must be enforced on the backend for protected business operations.

### BR-SA-005 — Outlet Scope
A Staff user may perform actions only within the outlet scope permitted by their assigned access.

### BR-SA-006 — Guest Data Permission
Guest tier, allergens, preferences and notes may be viewed only subject to role permissions.

**BRS basis:** FR-ST-05.

### BR-SA-007 — Audit Attribution
Staff actions must retain the identity of the named user responsible.

**BRS basis:** FR-ST-08.

### BR-SA-008 — No Action on Denied Access
A denied authorization check must not execute the underlying business operation.

### BR-SA-009 — Session Validity
Expired or revoked sessions must not execute protected operations.

### BR-SA-010 — Permission Changes
Where role/permission assignments change, the implementation must ensure that subsequent authorization decisions use the current effective permissions.

Exact cache/session invalidation behavior is TBD.

### BR-SA-011 — Staff User Data
The Staff user record includes role, permissions, outlet and action audit trail as defined in the BRS.

---

## 8. Validations

### 8.1 Authentication

- Staff identifier/credential input must be present according to the selected authentication mechanism.
- Authentication credentials must be validated by the backend.
- Invalid authentication attempts must not create an authenticated session.
- Exact rate-limit and lockout values are TBD.

### 8.2 Authorization

- Authenticated Staff user must exist and be active.
- Requested permission must be explicitly allowed.
- Outlet scope must permit the requested operation.
- Role assignment must be valid.

### 8.3 Guest Information Access

- Guest data must be returned only after permission validation.
- Sensitive guest fields must not be exposed through an unauthorized endpoint or payload.

### 8.4 Audit Attribution

- Staff user identity must be present for every protected Staff action.
- Requests missing required user/audit context must fail safely.

---

## 9. API Requirements

The following are **SRS implementation proposals**, because the BRS does not define endpoint contracts.

### 9.1 Authentication

`POST /api/v1/staff/auth/login`

Authenticate a Staff user.

`POST /api/v1/staff/auth/logout`

End the current Staff session.

`POST /api/v1/staff/auth/refresh`

Refresh an authenticated session/token where the selected authentication architecture supports refresh tokens.

### 9.2 Current User

`GET /api/v1/staff/me`

Return:

- Staff user identity.
- Role.
- Effective permissions.
- Outlet context.

### 9.3 Authorization

The backend shall enforce authorization before protected operations.

Authorization may be implemented through permission claims, server-side role lookup, policy evaluation, or equivalent architecture.

Exact strategy is TBD.

### 9.4 Session / Device

Potential implementation APIs:

`GET /api/v1/staff/sessions`

`DELETE /api/v1/staff/sessions/{session_id}`

These are optional SRS proposals and require product/security approval.

---

## 10. Data Requirements

### 10.1 BRS Staff User Entity

The BRS defines the Staff user entity with:

- Role.
- Permissions.
- Outlet.
- Action audit trail.

### 10.2 SRS Authentication Data

The implementation may require:

- staff_user_id
- authentication identifier
- credential/identity-provider reference
- role assignment
- permission assignment
- outlet assignment
- session metadata
- device metadata where required
- last authentication time
- account status
- audit timestamps

Exact fields and storage strategy are TBD.

### 10.3 Audit Data

Protected Staff actions should include:

- audit event ID
- staff user ID
- action
- resource/entity
- resource ID where applicable
- outlet
- timestamp
- outcome
- request/correlation ID

The final audit schema is TBD.

---

## 11. Security Requirements

The module must support the BRS security requirements and least-privilege access model.

Relevant BRS requirements include:

- Data encrypted in transit and at rest.
- Authentication uses one-time passwords with rate limiting for the platform where applicable.
- Penetration testing precedes launch and recurs annually.
- Role-based access control with least privilege.
- Full audit trail.
- Staff actions attributed to named users.

Important source limitation:

The BRS explicitly describes OTP authentication under its general NFR-05 platform security requirement, but it does not state that the **Staff App specifically must use OTP**. Therefore, Staff App authentication method remains a design decision unless explicitly confirmed.

---

## 12. Error & Exception Handling

### 12.1 Invalid Authentication

- Deny access.
- Do not create a session.
- Return a generic authentication failure response.
- Log according to the security/audit policy.

### 12.2 Inactive Staff Account

- Deny login or protected operation.
- Do not issue an active session.
- Provide a clear operational message without exposing sensitive account details.

### 12.3 Permission Denied

- Return authorization failure.
- Do not execute the requested business action.
- Record the event when required by the audit/security policy.

### 12.4 Outlet Scope Violation

- Deny the operation.
- Do not execute data mutation.
- Log the attempted operation according to security policy.

### 12.5 Expired Session

- Reject protected operation.
- Require re-authentication or approved session refresh mechanism.

### 12.6 Authorization Service Failure

- Fail closed for protected mutations.
- Do not execute a business action when authorization cannot be verified.

### 12.7 Audit Failure

Because FR-ST-08 requires attribution, the system must not silently perform an action when required audit attribution cannot be established.

Exact transaction-vs-audit failure behavior is TBD and must be agreed during technical design.

---

## 13. Non-Functional Requirements

### NFR-SA-01 — Security
Authentication, authorization and audit data must follow the BRS security requirements.

### NFR-SA-02 — Reliability
Invalid or expired authentication must not allow protected business actions.

### NFR-SA-03 — Observability
Authentication and authorization failures should be observable through the platform's logging/monitoring model.

### NFR-SA-04 — Availability
Authentication should not become a single point of failure for unrelated system functions; exact resilience behavior is TBD.

### NFR-SA-05 — Performance
Authentication and authorization checks should support normal Staff App workflows without creating material delay. Exact target should align with the wider platform performance design.

---

## 14. Acceptance Criteria

### AC-SA-01
An unauthenticated user cannot access protected Staff App functions.

### AC-SA-02
A valid Staff user can authenticate successfully using the approved authentication mechanism.

### AC-SA-03
The authenticated session resolves to the correct named Staff user.

### AC-SA-04
The system resolves the Staff user's role, permissions and outlet context.

### AC-SA-05
A user without a required permission cannot execute the protected operation.

### AC-SA-06
A user with the required permission can execute the protected operation within the permitted outlet scope.

### AC-SA-07
Guest tier, allergens, preferences and notes are shown only when permitted by role permissions.

### AC-SA-08
Every protected Staff action records the responsible named Staff user.

### AC-SA-09
An expired/revoked session cannot execute protected operations.

### AC-SA-10
Logout removes access to protected Staff App functions according to the approved session model.

### AC-SA-11
A cross-outlet operation is blocked when the Staff user lacks the required outlet scope.

### AC-SA-12
Denied authorization does not execute the requested business action.

### AC-SA-13
Audit records contain sufficient Staff user context to identify the responsible user.

### AC-SA-14
Authentication and authorization failures are logged/observable according to the approved security/observability design.

---

## 15. Dependencies

- Staff user management.
- Role and permission management.
- Outlet management.
- Backend authentication/authorization service.
- Staff App.
- Audit logging.
- Guest profile/guest data permissions.
- All operational Staff App modules that require named-user attribution.
- Admin Console for staff/role/permission administration.

---

## 16. Open Decisions / TBD

1. Staff authentication method.
2. Whether Staff App uses OTP, password, SSO or another approved method.
3. MFA requirement.
4. Staff login identifier.
5. Session timeout.
6. Refresh-token strategy.
7. Device trust/binding.
8. Concurrent session policy.
9. Account lockout/rate-limit values.
10. Final Staff role catalogue.
11. Final role-permission matrix.
12. Staff-to-outlet assignment model.
13. Multi-outlet access rules for authorised staff.
14. Permission cache/invalidation strategy.
15. Audit-log retention duration.
16. Audit-failure transaction policy.
17. Logout behavior across multiple devices.
18. Password/credential reset policy if applicable.
19. Security notification/alert policy for suspicious staff access.
20. Exact authentication and authorization API contracts.

---

## 17. Implementation Notes

### Staff App

The mobile application should:

- Present the approved login flow.
- Store only the minimum session information needed by the client.
- Avoid using UI-only permission checks as the security boundary.
- Hide unavailable features for usability, while relying on backend authorization for actual enforcement.
- Maintain current authenticated-user context.

### FastAPI Backend

The backend should:

- Authenticate staff.
- Resolve roles/permissions/outlet context.
- Enforce authorization for every protected business operation.
- Propagate staff identity into business/audit operations.
- Provide session/token handling according to the approved security design.

### PostgreSQL

Recommended logical records:

- staff_users
- roles
- permissions
- role_permissions
- staff_user_roles
- staff_user_outlets
- sessions or refresh_tokens where applicable
- audit_events

These are implementation proposals, not direct BRS table definitions.

### Redis

Potential uses:

- Short-lived session/cache data.
- Authentication rate limiting.
- Permission cache.
- Temporary security controls.

Exact usage is TBD.

---

## 18. Module Completion Checklist

- [ ] Staff authentication method approved.
- [ ] Staff login implemented.
- [ ] Named Staff user context implemented.
- [ ] Role resolution implemented.
- [ ] Permission resolution implemented.
- [ ] Backend authorization enforced.
- [ ] Outlet scope enforced.
- [ ] Guest information permission checks enforced.
- [ ] Staff action attribution implemented.
- [ ] Session expiry/revocation implemented.
- [ ] Logout implemented.
- [ ] Authentication/authorization failure logging implemented.
- [ ] Audit trail implemented.
- [ ] Security tests completed.
- [ ] Cross-outlet authorization tests completed.
- [ ] TBD decisions resolved or formally approved.
-----------------------------------------------------
# SACRED SPICE RESTAURANT
## Software Requirement Specification (SRS)
### 5.2.2 Staff App → Floor Plan & Table Management

**Source:** Sacred Spice Restaurant — Business Requirement Specification (BRS) v1.0  
**BRS Date:** 15 September 2026  
**SRS Module:** 5.2.2  
**Product Area:** Staff App  
**Status:** Draft for implementation and stakeholder review

---

## 1. Module Overview

The **Floor Plan & Table Management** module provides Staff App users with a live operational view of restaurant tables and supports table seating and table-structure changes during service.

The BRS directly requires the Staff App to provide a live floor plan showing:

- Table status.
- Party size.
- Elapsed time.
- Course progress.

The BRS also requires staff to:

- Seat tables.
- Move tables.
- Merge tables.
- Split tables.
- Manage waitlist call-forward.

This module is closely connected with reservations, waitlist, guest profiles, ordering, KDS and table/floor-plan integration.

---

## 2. BRS Requirements Mapping

### 2.1 Direct Functional Requirements

| BRS ID | Priority | Requirement |
|---|---|---|
| FR-ST-01 | M | Staff view a live floor plan with table status, party size, elapsed time and course progress. |
| FR-ST-02 | M | Staff can seat, move, merge and split tables, and manage the waitlist call-forward. |

### 2.2 Related BRS Requirements

| BRS Reference | Relevance |
|---|---|
| FR-RS-01 | Guest books a table by outlet, date, time and party size. |
| FR-RS-02 | Availability is calculated from the live floor plan, service duration assumptions and configured capacity limits. |
| FR-RS-03 | Occasion, seating preference and special requests are shown to staff before seating. |
| FR-RS-07 | Guests can join virtual waitlist remotely/on site, see position and estimated wait, and be notified when the table is ready. |
| FR-RS-08 | Released capacity is automatically offered to waitlisted guests in order. |
| FR-RS-09 | Staff can overbook within configured tolerance and block tables for maintenance/private events. |
| FR-RS-10 | No-shows and late arrivals are recorded on the guest profile and can trigger policy consequences. |
| FR-ST-05 | Staff see guest tier, allergens, preferences and notes before service, subject to role permissions. |
| FR-ST-08 | All staff actions are attributed to a named user for accountability. |
| BRS Integration — Table management / floor plan | Live availability and seating status; two-way; high criticality. |

---

## 3. Scope

### In Scope

- Live floor-plan view.
- Table status visibility.
- Party-size visibility.
- Elapsed table/service time.
- Course-progress visibility.
- Seat a party.
- Move a party/table assignment.
- Merge tables.
- Split tables.
- Table availability state changes required by operations.
- Reservation-to-table assignment.
- Waitlist call-forward from the Staff App.
- Operational synchronization with the table/floor-plan data source.
- Named-user attribution for table actions.

### Related but Not Fully Defined Here

The following are connected to this module but have their own SRS modules:

- Reservation creation/modification/cancellation.
- Guest waitlist enrollment.
- Staff authentication and authorization.
- Staff guest-profile access.
- Table-side ordering.
- Order processing.
- Kitchen status and course preparation.

---

## 4. Floor Plan View

### 4.1 Live Table Information

The Staff App shall present a live floor plan with at least the BRS-required information:

- Table status.
- Party size.
- Elapsed time.
- Course progress.

### 4.2 Table Identity

Each table displayed on the floor plan should have a unique table identifier.

Exact table-numbering rules are not specified by the BRS and remain a configuration/design decision.

### 4.3 Table Status

The BRS requires table status but does not provide a final status catalogue.

A possible SRS status model for discussion is:

- Available
- Reserved
- Seated
- Ordering
- In Service
- Waiting for Food
- Ready to Close
- Cleaning
- Blocked

These are **SRS proposals only**. The final table status list must be agreed with Operations.

### 4.4 Real-Time Updates

Floor-plan changes must be reflected across relevant Staff App sessions and connected systems.

The BRS identifies table management/floor plan as a two-way, high-criticality integration for live availability and seating status.

The exact real-time mechanism is a technical design decision.

---

## 5. User Flows

### 5.1 Open Floor Plan

1. Staff member authenticates into the Staff App.
2. Staff selects the floor/table view.
3. System loads the permitted outlet floor plan.
4. Current table states are retrieved.
5. Party size, elapsed time and course progress are displayed where applicable.
6. Subsequent table changes are reflected in the live view.

### 5.2 Seat a Reserved Guest

1. Guest arrives for a reservation.
2. Staff opens the reservation.
3. Staff reviews relevant guest/service information available under permissions.
4. Staff selects an available table.
5. System validates that the table can accept the party.
6. Staff confirms seating.
7. Table status changes to the appropriate seated/in-service state.
8. Party size and seating time are recorded.
9. The action is attributed to the named Staff user.

### 5.3 Move a Guest/Table Assignment

1. Staff selects an occupied/reserved table.
2. Staff chooses the move action.
3. System displays permissible destination tables.
4. Staff selects the destination.
5. System validates the destination.
6. Staff confirms the move.
7. Table assignment is updated.
8. Related reservation/order/table context is updated as required.
9. The action is recorded against the Staff user.

### 5.4 Merge Tables

1. Staff selects the applicable tables.
2. Staff chooses merge.
3. System validates that the merge is permitted.
4. Staff confirms.
5. System creates the merged operational table/combination.
6. Party/table context is updated.
7. Floor plan reflects the new configuration.
8. Audit record identifies the Staff user.

### 5.5 Split Tables

1. Staff selects the merged/combined table.
2. Staff chooses split.
3. System displays the split configuration options.
4. Staff selects the resulting table arrangement.
5. System validates the split.
6. Staff confirms.
7. Floor plan returns to the appropriate individual table configuration.
8. Associated party/service context is updated as required.
9. Audit record identifies the Staff user.

### 5.6 Waitlist Call-Forward

1. Staff reviews the waitlist.
2. A table becomes available or is released.
3. System identifies eligible waitlist entries according to the reservation/waitlist rules.
4. Staff selects or confirms the next guest to call forward.
5. Guest is notified.
6. Staff records the call-forward action.
7. Table/waitlist state is updated.

The BRS separately states that released capacity is automatically offered to waitlisted guests in order. The exact staff confirmation behavior before notification is not specified and is therefore TBD.

---

## 6. Functional Requirements

### 6.1 FR-ST-01 — Live Floor Plan

**Priority:** Must

The Staff App shall display a live floor plan with:

- Table status.
- Party size.
- Elapsed time.
- Course progress.

Requirements:

- Floor data must correspond to the selected/authorized outlet.
- Status must reflect current operational data.
- Party size must reflect the active seating/booking context.
- Elapsed time must be calculated from the relevant service/seating event.
- Course progress should reflect available order/KDS state where applicable.
- Updates must be synchronized with connected operational systems.

### 6.2 FR-ST-02 — Seat Tables

**Priority:** Must

Staff shall be able to seat guests at an appropriate table.

Requirements:

- Staff must select a valid table.
- Table suitability must be validated using applicable table/capacity rules.
- Seating must update the live floor plan.
- Reservation/guest context must remain linked where applicable.
- The named Staff user must be recorded.

### 6.3 FR-ST-03 — Move Tables

**Priority:** Must

Staff shall be able to move a party/table assignment.

Requirements:

- Source and destination tables must be valid.
- Destination table availability must be checked.
- Any affected reservation/order/service context must remain consistent.
- The action must be attributed to the Staff user.

### 6.4 FR-ST-04 — Merge Tables

**Priority:** Must

Staff shall be able to merge tables where permitted.

Requirements:

- Selected tables must be valid for merge.
- Conflicting active assignments must be handled according to business rules.
- Resulting seating capacity must be calculated correctly.
- Floor plan must reflect the resulting configuration.
- The merge event must be auditable.

### 6.5 FR-ST-05 — Split Tables

**Priority:** Must

Staff shall be able to split a merged table configuration where permitted.

Requirements:

- Split configuration must be valid.
- Active seating/order/reservation context must not be lost.
- Resulting table assignments must be represented correctly.
- Floor plan must update.
- Split event must be auditable.

### 6.6 FR-ST-06 — Waitlist Call-Forward

**Priority:** Must

Staff shall be able to manage waitlist call-forward through the Staff App.

Requirements:

- Eligible waitlist entries must be visible.
- Staff must see sufficient guest/table context to execute call-forward.
- Call-forward must update the waitlist state.
- Guest notification must occur according to the notification module.
- Action must be attributed to the Staff user.

### 6.7 FR-ST-07 — Live State Synchronization

**Priority:** Must-aligned

Table state changes must be synchronized with the authoritative table/floor-plan data source and relevant connected modules.

Potential synchronized consumers include:

- Guest App reservation availability.
- Reservation engine.
- Staff App sessions.
- Admin Console.
- Ordering/table context.
- Waitlist.

The BRS requires live availability and seating status through the table management/floor-plan integration.

### 6.8 FR-ST-08 — Table Blocking

The BRS explicitly allows staff to block tables for maintenance or private events under FR-RS-09.

This behavior belongs primarily to reservation/table configuration but must be reflected correctly in the Staff App floor plan.

### 6.9 FR-ST-09 — Overbooking Visibility

The BRS allows staff to overbook within a configured tolerance.

The Staff App should display the relevant operational state when an overbooking condition exists.

The exact warning, permission requirement and workflow are TBD.

---

## 7. Business Rules

### BR-TM-001 — Live Floor Plan
The Staff App floor plan must reflect current table operational state.

### BR-TM-002 — Outlet Scope
Staff may view and modify tables only within the outlet scope permitted by their role.

### BR-TM-003 — Party Size
The active table/guest context must reflect the correct party size.

### BR-TM-004 — Elapsed Time
Elapsed time must be associated with the applicable seating/service event.

### BR-TM-005 — Course Progress
Course-progress information must reflect available operational/order data and must not be fabricated when no course data exists.

### BR-TM-006 — Valid Seating
A table must satisfy applicable availability and capacity rules before seating is confirmed.

### BR-TM-007 — Move Validation
A move must be validated against the destination table's current state and applicable capacity rules.

### BR-TM-008 — Merge Validation
Tables may be merged only when the configuration is valid and operational constraints permit the merge.

### BR-TM-009 — Split Validation
A merged configuration may be split only into valid table arrangements without losing active operational context.

### BR-TM-010 — Waitlist Order
Waitlist call-forward follows the configured waitlist ordering rules.

### BR-TM-011 — Released Capacity
Cancelled/released capacity is offered to waitlisted guests in order as required by the BRS.

### BR-TM-012 — Blocked Tables
Tables blocked for maintenance/private events cannot be treated as generally available.

### BR-TM-013 — Overbooking
Overbooking is permitted only within configured tolerance and according to authorised staff permissions.

### BR-TM-014 — Named User
Every table-management action is attributed to the named Staff user.

### BR-TM-015 — Cross-Module Consistency
A table state change must not create conflicting reservation, waitlist or operational state.

### BR-TM-016 — Integration Failure
A floor-plan integration failure must be handled without silently presenting stale information as current.

Exact stale-data UI behavior is TBD.

---

## 8. Validations

### 8.1 Seating

- Table exists.
- Table belongs to authorized outlet.
- Table is in an allowable state.
- Table capacity can support the party where capacity rules apply.
- No conflicting reservation/assignment exists.
- Staff user has required permission.

### 8.2 Move

- Source table exists.
- Destination table exists.
- Source and destination belong to appropriate outlet context.
- Destination is valid for move.
- Existing active reservation/order context is checked.

### 8.3 Merge

- All selected tables exist.
- Tables are in merge-compatible states.
- No unsupported conflicting reservations/order assignments exist.
- Resulting capacity is valid.
- Staff has merge permission.

### 8.4 Split

- Combined table configuration exists.
- Requested split is valid.
- Active guest/service context can be preserved.
- Staff has split permission.

### 8.5 Waitlist Call-Forward

- Waitlist entry exists.
- Entry is eligible for call-forward.
- Applicable table/capacity is available.
- Staff has required permission.
- Notification can be associated with the correct guest/waitlist entry.

---

## 9. API Requirements

The following endpoints are **SRS implementation proposals**. The BRS does not define exact API contracts.

### 9.1 Floor Plan

`GET /api/v1/staff/floor-plan`

Returns the authorized outlet floor plan and current table states.

Potential response data:

- outlet_id
- floor_id
- table_id
- table_number
- table_status
- capacity
- party_size
- seating_started_at
- elapsed_seconds
- course_progress
- reservation_reference
- active_service_reference

### 9.2 Table Details

`GET /api/v1/staff/tables/{table_id}`

Retrieve current table details and operational context.

### 9.3 Seat Table

`POST /api/v1/staff/tables/{table_id}/seat`

Seat a party/table assignment.

### 9.4 Move Table Assignment

`POST /api/v1/staff/tables/{table_id}/move`

Move an active party/table assignment to another table.

### 9.5 Merge Tables

`POST /api/v1/staff/tables/merge`

Merge selected tables.

### 9.6 Split Tables

`POST /api/v1/staff/tables/split`

Split a merged table configuration.

### 9.7 Waitlist

`GET /api/v1/staff/waitlist`

Retrieve operational waitlist entries.

`POST /api/v1/staff/waitlist/{entry_id}/call-forward`

Call forward an eligible waitlist entry.

### 9.8 Real-Time Updates

Potential WebSocket channel:

`/ws/staff/{outlet_id}/floor-plan`

Potential event types:

- `table.updated`
- `table.seated`
- `table.moved`
- `table.merged`
- `table.split`
- `waitlist.updated`
- `reservation.updated`
- `order.course.updated`

These are proposed implementation contracts.

---

## 10. Data Requirements

### 10.1 BRS Reservation Data

The BRS defines reservation data including:

- Outlet.
- Date/time.
- Party size.
- Status.
- Occasion.
- Notes.
- Deposit.
- No-show flag.

These fields support floor-plan/seating workflows.

### 10.2 BRS Staff User Data

Staff actions require:

- Role.
- Permissions.
- Outlet.
- Action audit trail.

### 10.3 SRS Table Data

The implementation will require a table/floor representation capable of storing or resolving:

- table_id
- outlet_id
- floor_id
- table_number/label
- capacity
- position/layout metadata
- status
- blocked reason where applicable
- current party/session reference
- current reservation reference
- seating timestamp
- course progress reference where applicable

The BRS does not define this table schema.

### 10.4 SRS Table Event Data

For reliable operational history, proposed event records include:

- event_id
- table_id
- event_type
- previous_state
- new_state
- staff_user_id
- timestamp
- correlation_id

These are SRS implementation proposals.

---

## 11. Integration Requirements

### 11.1 Table Management / Floor Plan

**Purpose:** Live availability and seating status  
**Direction:** Two-way  
**Criticality:** High

This is the primary integration for the module according to the BRS.

### 11.2 Reservation Engine

The floor plan contributes to availability calculation and table assignment.

### 11.3 Waitlist

Waitlist state and available capacity are connected to table release/call-forward.

### 11.4 Guest App

Relevant table/reservation availability must remain consistent with staff-side changes.

### 11.5 Ordering

For dine-in/table workflows, table assignment can later connect to running-table/order context.

### 11.6 KDS

Course progress shown in the Staff App may depend on KDS/order state.

The BRS does not define the detailed technical synchronization protocol between these systems.

---

## 12. Error & Exception Handling

### 12.1 Stale Floor Plan

If live table data cannot be refreshed:

- Do not silently present outdated data as current.
- Clearly indicate stale/offline state according to UX design.
- Prevent high-risk mutations where the current state cannot be verified.
- Retry synchronization.
- Log the integration failure.

Exact stale-data thresholds are TBD.

### 12.2 Concurrent Seating

If another staff member seats a table before the current user confirms:

- Revalidate the table.
- Reject the conflicting seating action.
- Refresh the floor plan.
- Ask the staff user to select another valid table.

### 12.3 Concurrent Move

If the destination table changes state before move confirmation:

- Revalidate.
- Reject the move if invalid.
- Refresh table data.

### 12.4 Merge Conflict

If tables selected for merge change state during processing:

- Revalidate all selected tables.
- Reject the merge when the current state is incompatible.
- Do not partially execute the merge.

### 12.5 Split Conflict

If the underlying combined-table context changes before split confirmation:

- Revalidate.
- Reject or require refreshed confirmation according to UX.
- Do not lose the active service context.

### 12.6 Waitlist Call-Forward Conflict

If the table is assigned to another party before call-forward:

- Revalidate available capacity.
- Prevent incorrect call-forward.
- Refresh waitlist/table state.

### 12.7 Integration Failure

A table/floor-plan partner outage must affect only the affected capability and not the entire application, consistent with the BRS integration principle.

---

## 13. Security & Access Control

The module depends on SRS 5.2.1.

Required controls:

- Authentication before protected Staff App actions.
- Role-based authorization.
- Least-privilege access.
- Outlet scope enforcement.
- Named-user attribution.
- Audit trail.
- Protection of guest/reservation information.
- Backend enforcement of authorization.

Staff should see reservation/guest details only according to the permissions assigned to their role.

---

## 14. Non-Functional Requirements

Relevant BRS requirements include:

### NFR-02 — Availability
The platform targets 99.9% monthly availability during trading hours.

### NFR-04 — Reliability
No accepted order may be lost; the wider platform uses idempotent/retry handling where required.

### NFR-11 — Offline Resilience
The Staff App and KDS continue to display and progress accepted orders during short network loss and reconcile on reconnection.

This module must therefore define appropriate behavior when floor-plan connectivity is temporarily lost.

### NFR-13 — Observability
Integration faults and other relevant errors must be logged, monitored and alerted with defined ownership.

---

## 15. Acceptance Criteria

### AC-TM-01
Staff can open the permitted outlet floor plan.

### AC-TM-02
The floor plan displays table status.

### AC-TM-03
The floor plan displays party size where a party is assigned.

### AC-TM-04
The floor plan displays elapsed time for active table service.

### AC-TM-05
The floor plan displays course progress where operational course data exists.

### AC-TM-06
Staff can seat a guest/party at a valid available table.

### AC-TM-07
Staff can move a valid active table assignment.

### AC-TM-08
Staff can merge permitted tables.

### AC-TM-09
Staff can split permitted merged tables.

### AC-TM-10
Staff can perform waitlist call-forward for an eligible waitlist entry.

### AC-TM-11
Released capacity is handled according to the BRS waitlist rule.

### AC-TM-12
Blocked tables are not represented as normally available.

### AC-TM-13
Overbooking is restricted according to configured tolerance and permissions.

### AC-TM-14
Every table-management action is attributed to the named Staff user.

### AC-TM-15
Concurrent table changes are revalidated before committing.

### AC-TM-16
Cross-outlet table operations are blocked without authorized scope.

### AC-TM-17
Floor-plan integration failures are observable and do not silently create incorrect table state.

### AC-TM-18
Relevant Guest App/reservation state remains consistent after staff seating/table changes.

---

## 16. Dependencies

- 5.2.1 Staff Authentication & Access Control.
- Reservation engine.
- Waitlist module.
- Table management/floor-plan data source.
- Outlet configuration.
- Guest reservation context.
- Staff permissions.
- Order/KDS context for course progress.
- Notification service for waitlist call-forward.
- Audit logging.
- Real-time synchronization layer.

---

## 17. Open Decisions / TBD

1. Final table status catalogue.
2. Table status transition matrix.
3. Floor-plan layout/configuration model.
4. Table capacity rules.
5. Table merge rules.
6. Table split rules.
7. Handling of active orders during merge/split.
8. Handling of reservations during merge/split.
9. Overbooking permission rules.
10. Exact overbooking tolerance configuration.
11. Waitlist call-forward confirmation workflow.
12. Automatic vs staff-confirmed call-forward.
13. Guest response timeout after call-forward.
14. Stale floor-plan threshold.
15. Offline table-management behavior.
16. Real-time synchronization mechanism.
17. WebSocket event contract.
18. Final table-management integration source of truth.
19. Exact elapsed-time definition.
20. Exact course-progress source.
21. Table blocking reason catalogue.
22. Final audit-event schema.
23. Final RBAC permissions for each table operation.
24. Multi-outlet table access rules.

---

## 18. Implementation Notes

### Staff App

The Staff App should provide:

- Floor-plan screen.
- Table details.
- Visual table state.
- Seat action.
- Move action.
- Merge action.
- Split action.
- Waitlist call-forward access.
- Real-time state updates.
- Conflict/error messaging.

### FastAPI Backend

The backend should:

- Authorize every table mutation.
- Validate current table state before mutation.
- Keep table/reservation/waitlist state consistent.
- Record named Staff user identity on each mutation.
- Publish table-state events where the real-time architecture supports them.
- Handle concurrent requests safely.

### PostgreSQL

Potential logical records:

- restaurants/outlets
- floors
- tables
- table_status_history
- table_assignments
- reservations
- waitlist_entries
- table_events
- staff_users
- audit_events

Exact schema is subject to database design.

### Redis

Potential uses:

- Short-lived floor-plan cache.
- Distributed locks for high-contention table operations.
- Real-time presence/state.
- Temporary conflict control.

Exact usage is TBD.

### WebSockets

WebSockets can be used to broadcast:

- Table status changes.
- Seating changes.
- Move/merge/split events.
- Waitlist changes.
- Relevant reservation changes.

The exact event contract is TBD.

---

## 19. Module Completion Checklist

- [ ] Live floor plan implemented.
- [ ] Table status displayed.
- [ ] Party size displayed.
- [ ] Elapsed time displayed.
- [ ] Course progress displayed.
- [ ] Seat operation implemented.
- [ ] Move operation implemented.
- [ ] Merge operation implemented.
- [ ] Split operation implemented.
- [ ] Waitlist call-forward implemented.
- [ ] Table availability synchronization implemented.
- [ ] Concurrent-operation validation implemented.
- [ ] Outlet scope enforced.
- [ ] RBAC enforced.
- [ ] Named-user audit attribution implemented.
- [ ] Offline/stale-state behavior defined.
- [ ] Real-time synchronization implemented.
- [ ] Integration error handling implemented.
- [ ] Acceptance tests completed.
- [ ] TBD decisions resolved or formally approved.
------------------------------------------------------

# SACRED SPICE RESTAURANT
## Software Requirement Specification (SRS)
# Staff App — Remaining Modules
### Modules 5.2.3 through 5.2.9

**Source:** Sacred Spice Restaurant — Business Requirement Specification (BRS) v1.0  
**BRS Date:** 15 September 2026  
**Product Area:** Staff App  
**Status:** Draft for implementation and stakeholder review

---

# 5.2.3 Waitlist & Table Assignment

## 5.2.3.1 Module Overview

The **Waitlist & Table Assignment** module manages the staff-side operational flow for waitlisted guests and connects available table capacity to guest seating.

The BRS requires the Staff App to manage waitlist call-forward as part of FR-ST-02. The related reservation requirements define remote/on-site waitlist joining, live position and estimated wait, guest notification, automatic offering of released capacity, and no-show/late-arrival handling.

The module therefore connects:

`Reservation → Available Capacity → Waitlist → Call-Forward → Table Assignment → Seating`

## 5.2.3.2 Direct BRS Requirements

| BRS ID | Priority | Requirement |
|---|---|---|
| FR-ST-02 | M | Staff can seat, move, merge and split tables, and manage the waitlist call-forward. |
| FR-RS-07 | M | Guests can join a virtual waitlist remotely or on site, see position and estimated wait, and be notified when the table is ready. |
| FR-RS-08 | S | Cancelled or released capacity is automatically offered to waitlisted guests in order. |
| FR-RS-09 | M | Staff can overbook within a configured tolerance and can block tables for maintenance or private events. |
| FR-RS-10 | S | No-shows and late arrivals are recorded on the guest profile and can trigger policy consequences. |
| FR-RS-02 | M | Availability is calculated from the live floor plan, service duration assumptions and configured capacity limits. |

## 5.2.3.3 Feature Scope

- Staff waitlist view.
- Waitlist position/status visibility.
- Available capacity matching.
- Call-forward.
- Guest notification trigger.
- Table assignment for waitlisted guests.
- No-show/late-arrival operational handling.
- Overbooking visibility according to configuration.
- Blocked-table awareness.
- Named-user attribution for staff actions.

## 5.2.3.4 User Flow — Call-Forward

1. Staff opens the waitlist.
2. System loads current eligible waitlist entries for the authorized outlet.
3. Available table capacity is evaluated.
4. Eligible guest/table combinations are identified.
5. Staff selects or confirms the applicable waitlist entry.
6. System reserves/assigns the available table according to approved rules.
7. Guest is notified that the table is ready.
8. Waitlist status changes to the appropriate operational state.
9. Staff action is recorded against the named user.

The BRS requires released capacity to be offered to waitlisted guests in order. It does not specify whether staff confirmation must occur before every call-forward, so that interaction remains TBD.

## 5.2.3.5 User Flow — Waitlist to Seating

1. Guest is called forward.
2. Guest arrives within the applicable policy window.
3. Staff verifies the waitlist entry.
4. Staff assigns the available table.
5. Table status becomes the applicable seated/in-service state.
6. Waitlist entry becomes completed/ seated according to the approved state model.
7. Seating timestamp is recorded.
8. Staff action is attributed to the named Staff user.

## 5.2.3.6 Functional Requirements

### FR-WT-01 — Waitlist Visibility

The Staff App shall display active waitlist entries relevant to the authorized outlet.

The view should expose enough information to support operational call-forward without exposing unauthorized guest data.

### FR-WT-02 — Waitlist Eligibility

The system shall identify which waitlist entries are eligible for available tables based on configured operational rules.

Exact matching rules for party size, seating preference and table characteristics are TBD where not defined by the BRS.

### FR-WT-03 — Call-Forward

Staff shall be able to call forward an eligible waitlist entry.

The action shall update the waitlist state and trigger guest notification according to the notification module.

### FR-WT-04 — Table Assignment

A waitlisted guest shall be assignable to a valid available table.

The assignment must respect current floor-plan state and configured capacity rules.

### FR-WT-05 — Released Capacity

Released/cancelled capacity shall be offered to waitlisted guests in order as required by FR-RS-08.

### FR-WT-06 — No-Show / Late Arrival Context

The staff workflow shall support the operational recording of no-shows and late arrivals.

The BRS states that these events are recorded against the guest profile and may trigger policy consequences.

### FR-WT-07 — Overbooking Awareness

The Staff App shall expose relevant overbooking conditions where overbooking is permitted within configured tolerance.

### FR-WT-08 — Blocked Table Awareness

Tables blocked for maintenance or private events shall not be presented as generally available.

### FR-WT-09 — Waitlist Action Attribution

Waitlist call-forward and table-assignment actions shall be attributable to the named Staff user.

## 5.2.3.7 Business Rules

- **BR-WT-001:** Waitlist call-forward operates within the authorized outlet context.
- **BR-WT-002:** Waitlist allocation must use current availability, not stale table state.
- **BR-WT-003:** Released capacity is offered in configured waitlist order.
- **BR-WT-004:** A guest must not be assigned to a blocked table.
- **BR-WT-005:** A table assignment must respect applicable capacity rules.
- **BR-WT-006:** Overbooking is allowed only within configured tolerance and permissions.
- **BR-WT-007:** Call-forward must trigger the appropriate guest notification.
- **BR-WT-008:** No-show/late-arrival activity must be linked to the correct guest/reservation context.
- **BR-WT-009:** Every staff waitlist mutation is attributable to the named Staff user.
- **BR-WT-010:** A concurrent assignment must be revalidated before commit.

## 5.2.3.8 Validations

- Waitlist entry exists.
- Waitlist entry is active/eligible.
- Outlet scope is valid.
- Party size is valid.
- Target table exists and is available.
- Target table is not blocked.
- Target capacity is sufficient under configured rules.
- Reservation conflict does not exist.
- Staff user has permission.

## 5.2.3.9 Proposed APIs

`GET /api/v1/staff/waitlist`

`GET /api/v1/staff/waitlist/{entry_id}`

`POST /api/v1/staff/waitlist/{entry_id}/call-forward`

`POST /api/v1/staff/waitlist/{entry_id}/assign-table`

`POST /api/v1/staff/waitlist/{entry_id}/no-show`

`POST /api/v1/staff/waitlist/{entry_id}/late-arrival`

These are SRS implementation proposals; the BRS does not define API names.

## 5.2.3.10 Data Requirements

Relevant data:

- Waitlist entry.
- Guest.
- Reservation context where applicable.
- Outlet.
- Party size.
- Seating preference where provided.
- Estimated wait.
- Position.
- Table assignment.
- Call-forward timestamp.
- Status history.
- Staff user/action audit.

The BRS directly defines reservation attributes and the Guest entity, but does not define a standalone waitlist schema.

## 5.2.3.11 Error & Exception Handling

### Concurrent table allocation
Revalidate table state before assignment. Reject conflicting assignment and refresh.

### Guest no-show
Record no-show against the correct guest/reservation and release capacity according to policy.

### Stale waitlist
Refresh waitlist state before call-forward.

### Notification failure
Do not silently mark notification as successful. Preserve waitlist state and allow operational retry according to notification handling.

### Floor-plan integration failure
Do not make a table assignment based on unverifiable stale state.

## 5.2.3.12 Acceptance Criteria

- Staff can view active waitlist entries.
- Eligible waitlist entry can be called forward.
- Guest receives the configured call-forward notification.
- Available table can be assigned to the correct waitlist entry.
- Released capacity follows configured waitlist ordering.
- Blocked tables are excluded from available assignment.
- Overbooking respects configured tolerance.
- No-show/late-arrival action is recorded against the correct guest/reservation.
- Staff actions are attributed to the named user.
- Concurrent table assignment conflicts are prevented.

## 5.2.3.13 Dependencies

- 5.2.1 Staff Authentication & Access Control.
- 5.2.2 Floor Plan & Table Management.
- Reservation engine.
- Guest App notifications.
- Guest profile.
- Outlet/capacity configuration.

## 5.2.3.14 Open Decisions / TBD

1. Final waitlist ordering algorithm.
2. Table/party matching rules.
3. Call-forward staff-confirmation requirement.
4. Guest response window.
5. Automatic expiry after call-forward.
6. No-show policy details.
7. Late-arrival grace period.
8. Overbooking warning behavior.
9. Waitlist state catalogue.
10. Automatic vs staff-controlled table assignment.

---

# 5.2.4 Order Management

## 5.2.4.1 Module Overview

The **Order Management** module provides Staff App functionality for receiving and operationally handling incoming orders.

The BRS directly requires staff to:

- Accept incoming orders.
- Modify incoming orders.
- Hold incoming orders.
- Reject incoming orders.
- Provide a mandatory reason when rejecting.

The module connects staff operations with the existing POS and KDS flow. The BRS also requires that app orders appear correctly in the POS and KDS and that the POS remains the financial system of record.

## 5.2.4.2 Direct BRS Requirement

| BRS ID | Priority | Requirement |
|---|---|---|
| FR-ST-03 | M | Staff can accept, modify, hold or reject incoming orders with a mandatory reason for rejection. |

## 5.2.4.3 Related BRS Requirements

| BRS Reference | Relevance |
|---|---|
| FR-OR-01 | Orders may be delivery, pickup or dine-in. |
| FR-OR-04 | Per-item/per-order instructions, including allergy notes, are flagged prominently to kitchen. |
| FR-OR-06 | Guests can amend/cancel before kitchen acceptance; thereafter cancellation requires staff approval. |
| FR-OR-07 | Dynamic promise time derives from live kitchen load and delivery travel time. |
| BRS §7.2 | Order is injected into POS and appears on KDS. |
| NFR-04 | No accepted order may be lost; order injection is idempotent and retried. |
| BRS Integration | POS and KDS are two-way critical integrations. |

## 5.2.4.4 Feature Scope

- Incoming-order queue.
- Order detail view.
- Accept.
- Modify.
- Hold.
- Reject.
- Mandatory rejection reason.
- Order state visibility.
- Guest/order instructions visibility.
- Promise-time visibility.
- POS/KDS synchronization.
- Staff attribution.

## 5.2.4.5 User Flow — Incoming Order

1. Incoming order enters the Staff App queue.
2. Staff opens order details.
3. Staff reviews channel, items, modifiers, instructions and applicable operational information.
4. Staff accepts, modifies, holds or rejects the order.
5. If rejected, reason is mandatory.
6. Accepted/modified order continues through the operational flow.
7. Order is synchronized with POS/KDS as applicable.
8. Staff action is recorded.

## 5.2.4.6 Functional Requirements

### FR-OM-01 — Incoming Order Queue

The Staff App shall display incoming orders relevant to the authorized outlet/user scope.

### FR-OM-02 — Order Details

Staff shall be able to view relevant order content, including:

- Channel.
- Items.
- Modifiers.
- Instructions.
- Allergy notes.
- Amounts.
- Status.
- Promise time where available.

### FR-OM-03 — Accept Order

Staff shall be able to accept an incoming order.

Acceptance shall move the order into the next operational state and preserve the correct order context.

### FR-OM-04 — Modify Order

Staff shall be able to modify an order where permitted.

The BRS does not define exactly which fields staff may modify, so the modification matrix is TBD.

### FR-OM-05 — Hold Order

Staff shall be able to place an incoming order on hold where permitted.

Hold reason and duration are not explicitly defined by the BRS and remain TBD.

### FR-OM-06 — Reject Order

Staff shall be able to reject an incoming order.

A rejection reason is mandatory.

### FR-OM-07 — Order State Consistency

Order state changes performed by staff must remain consistent with POS/KDS operational state.

### FR-OM-08 — Named User Attribution

Staff order actions shall be attributable to the named Staff user.

### FR-OM-09 — Post-Acceptance Guest Cancellation

When a guest attempts to cancel/amend after kitchen acceptance, the Staff App shall support the BRS rule that staff approval is required.

### FR-OM-10 — Promise-Time Visibility

The Staff App should show the current promise-time information relevant to order operations where supplied by the order/kitchen flow.

## 5.2.4.7 Business Rules

- **BR-OM-001:** Only authorized Staff users may change order state.
- **BR-OM-002:** Rejection requires a mandatory reason.
- **BR-OM-003:** Accepted order state must not be lost.
- **BR-OM-004:** Staff modifications must preserve order identity and transaction linkage.
- **BR-OM-005:** Once kitchen acceptance occurs, guest cancellation requires staff approval.
- **BR-OM-006:** POS remains the financial system of record.
- **BR-OM-007:** KDS must receive the operational order when required by the order flow.
- **BR-OM-008:** Staff actions are attributed to the named user.
- **BR-OM-009:** Concurrent order modifications require current-state validation.
- **BR-OM-010:** Partner/integration failures must not create duplicate business actions.

## 5.2.4.8 Validations

- Order exists.
- Order belongs to authorized outlet context.
- Current state permits requested action.
- Staff user has required permission.
- Rejection reason exists for reject action.
- Modification fields are valid.
- Order is not already completed/cancelled in another system.
- POS/KDS synchronization requirements can be satisfied or safely queued.

## 5.2.4.9 Proposed APIs

`GET /api/v1/staff/orders`

`GET /api/v1/staff/orders/{order_id}`

`POST /api/v1/staff/orders/{order_id}/accept`

`PATCH /api/v1/staff/orders/{order_id}`

`POST /api/v1/staff/orders/{order_id}/hold`

`POST /api/v1/staff/orders/{order_id}/reject`

`POST /api/v1/staff/orders/{order_id}/approve-cancellation`

## 5.2.4.10 Data Requirements

Relevant BRS Order attributes:

- Channel.
- Items.
- Modifiers.
- Amounts.
- Taxes.
- Status timeline.
- Fulfilment record.

Additional SRS operational data:

- Rejection reason.
- Hold reason.
- Staff action history.
- POS reference.
- KDS reference.
- Correlation/idempotency reference.

## 5.2.4.11 Error & Exception Handling

### POS unavailable
Queue/retry according to the platform's integration strategy and alert where required.

### KDS unavailable
Preserve the accepted order and surface operational state; exact fallback is TBD.

### Concurrent update
Reject stale mutation and refresh order.

### Reject without reason
Block submission.

### Order already accepted elsewhere
Refresh and prevent duplicate action.

### Payment/order injection exception
Follow BRS handling for queued retry, alert and no duplicate financial effect.

## 5.2.4.12 Acceptance Criteria

- Staff can view incoming orders.
- Staff can accept incoming orders.
- Staff can modify permitted order data.
- Staff can hold orders where configured.
- Staff can reject an order only with a reason.
- Staff order changes are reflected in the correct operational flow.
- Order remains consistent across Staff App/POS/KDS.
- Guest post-acceptance cancellation requires staff approval.
- Staff actions are attributed to the named user.
- Duplicate actions are prevented under concurrent updates.

## 5.2.4.13 Dependencies

- 5.2.1 Staff Authentication & Access Control.
- POS integration.
- KDS.
- Guest App ordering.
- Payment/order orchestration.
- Notification service.

## 5.2.4.14 Open Decisions / TBD

1. Staff-editable order fields.
2. Hold reason catalogue.
3. Hold timeout.
4. Order rejection reason catalogue.
5. Whether rejected orders require manager approval.
6. Exact order state machine.
7. POS/KDS conflict resolution.
8. Offline acceptance behavior.
9. Exact promise-time display behavior.
10. Staff cancellation approval matrix.

---

# 5.2.5 Table-Side Ordering

## 5.2.5.1 Module Overview

The **Table-Side Ordering** module allows Staff App users to take orders directly at a restaurant table.

The BRS states that staff can take table-side orders and that those orders flow to the same kitchen queue as app orders.

This module therefore provides a staff-facing ordering interface while preserving the common order and kitchen flow.

## 5.2.5.2 Direct BRS Requirement

| BRS ID | Priority | Requirement |
|---|---|---|
| FR-ST-04 | S | Staff can take table-side orders that flow to the same kitchen queue as app orders. |

## 5.2.5.3 Related BRS Requirements

| BRS Reference | Relevance |
|---|---|
| FR-OR-01 | Dine-in table ordering is supported. |
| FR-OR-03 | Cart shows itemized prices, modifiers, taxes, packaging, delivery and service charges as applicable. |
| FR-OR-04 | Staff can capture instructions including allergy notes flagged to kitchen. |
| FR-OR-08 | Dine-in table orders can be added to a running tab across multiple rounds and settled once. |
| FR-OR-09 | Group ordering allows several guests at one table to add to a shared cart. |
| BRS §7.2 | Operational orders flow to POS/KDS. |

## 5.2.5.4 Feature Scope

- Select active table.
- Browse available menu.
- Select items.
- Select modifiers.
- Capture spice-level/request information where supported by menu rules.
- Capture per-item/per-order instructions.
- Capture allergy notes.
- Submit order to common order flow.
- Add additional rounds to an active table order where supported.
- Preserve table association.
- Staff attribution.

## 5.2.5.5 User Flow

1. Staff selects a seated table.
2. System loads the table's active guest/order context.
3. Staff adds menu items.
4. Staff selects modifiers/options.
5. Staff captures special instructions.
6. Staff captures allergy notes where provided.
7. Staff reviews the order.
8. Staff submits the order.
9. Order flows through the common order processing path.
10. Order appears in the same kitchen queue as other applicable orders.
11. Staff action is recorded.

## 5.2.5.6 Functional Requirements

### FR-TS-01 — Table Context

The Staff App shall associate a table-side order with the correct active table context.

### FR-TS-02 — Item Selection

Staff shall be able to add available menu items to the table-side order.

### FR-TS-03 — Modifiers

Staff shall be able to select applicable modifiers and options according to menu configuration.

### FR-TS-04 — Special Instructions

Staff shall be able to capture per-item and per-order instructions.

### FR-TS-05 — Allergy Information

Allergy notes captured at table-side shall follow the same operational pathway that flags allergy information prominently to the kitchen.

### FR-TS-06 — Common Kitchen Queue

Table-side orders shall flow to the same kitchen queue as app orders.

### FR-TS-07 — Running Tab

Where the dine-in order model is active, staff shall be able to add another round to the table's running tab.

### FR-TS-08 — Order Review

Staff shall be able to review the entered order before submission.

### FR-TS-09 — Named User Attribution

Every table-side order action shall be attributable to the named Staff user.

## 5.2.5.7 Business Rules

- **BR-TS-001:** Table-side orders belong to a valid active table context.
- **BR-TS-002:** Only currently available menu items may be ordered.
- **BR-TS-003:** Required modifiers must be completed before submission.
- **BR-TS-004:** Allergy notes must not be silently dropped.
- **BR-TS-005:** Table-side orders use the common operational order flow.
- **BR-TS-006:** Table-side orders enter the same kitchen queue as app orders.
- **BR-TS-007:** Running-tab additions must use the correct table/order context.
- **BR-TS-008:** Staff action attribution is mandatory.
- **BR-TS-009:** Order duplication must be prevented on retry.

## 5.2.5.8 Validations

- Table exists.
- Table is within authorized outlet.
- Table is in a state that permits ordering.
- Menu item is currently available.
- Required modifiers are present.
- Instructions satisfy configured limits.
- Allergy notes are preserved.
- Staff user has table-side ordering permission.

## 5.2.5.9 Proposed APIs

`GET /api/v1/staff/tables/{table_id}/order-context`

`POST /api/v1/staff/tables/{table_id}/orders`

`POST /api/v1/staff/tables/{table_id}/orders/{order_id}/round`

`GET /api/v1/staff/tables/{table_id}/running-tab`

These are SRS proposals.

## 5.2.5.10 Data Requirements

Relevant records:

- Table.
- Active dining session/context.
- Order.
- Order items.
- Modifiers.
- Instructions.
- Allergy notes.
- Running-tab reference.
- Staff user/action.

The BRS defines the Order core entity but does not define a dedicated table-side order schema.

## 5.2.5.11 Error & Exception Handling

### Item becomes unavailable
Staff must be informed and prevented from submitting unavailable item unless an approved substitution workflow exists.

### Table no longer active
Refresh context and prevent order submission to invalid table.

### Network interruption
Use the platform's Staff App resilience strategy; exact offline order creation behavior is TBD.

### Duplicate submission
Use idempotent submission handling.

### Kitchen/POS failure
Preserve the order and follow the common integration retry/alert flow.

## 5.2.5.12 Acceptance Criteria

- Staff can open an active table order context.
- Staff can add menu items and modifiers.
- Staff can capture instructions and allergy notes.
- Staff can submit table-side order.
- Table-side order reaches the common order flow.
- Table-side order appears in the same kitchen queue as app orders.
- Additional rounds can be associated with the correct running tab where enabled.
- Staff action is attributed to the named user.
- Duplicate submissions are prevented.

## 5.2.5.13 Dependencies

- 5.2.2 Floor Plan & Table Management.
- 5.2.4 Order Management.
- Menu service.
- KDS.
- POS.
- Guest/table context.
- Staff permissions.

## 5.2.5.14 Open Decisions / TBD

1. Exact table-side menu view.
2. Order pricing display.
3. Running-tab rules.
4. Whether staff can edit previous rounds.
5. Payment timing in table-side flow.
6. Offline table-side ordering behavior.
7. Group-ordering interaction with staff-entered orders.
8. Exact instruction/allergy input validation.

---

# 5.2.6 Guest Profile & Service Notes

## 5.2.6.1 Module Overview

The **Guest Profile & Service Notes** module provides staff with relevant guest information needed for personalized service.

The BRS requires staff to see:

- Guest tier.
- Allergens.
- Preferences.
- Notes.

This access is explicitly subject to role permissions.

## 5.2.6.2 Direct BRS Requirement

| BRS ID | Priority | Requirement |
|---|---|---|
| FR-ST-05 | M | Staff see guest tier, allergens, preferences and notes before service, subject to role permissions. |

## 5.2.6.3 Related BRS Requirements

| BRS Reference | Relevance |
|---|---|
| FR-AC-03 | Guest profile contains dietary preferences, allergens, spice preference and important dates. |
| FR-AC-04 | Guest can view order/reservation history. |
| BRS §11.1 Guest | Guest entity includes identity, contacts, addresses, dietary/spice preferences, consents, tier and lifetime value. |
| BRS §11.1 Loyalty | Loyalty account includes points/tier history. |
| FR-ST-08 | Staff actions must be attributed to named user. |
| FR-AD-04 | RBAC with least privilege and full audit trail. |

## 5.2.6.4 Feature Scope

- View guest profile in service context.
- Display guest tier.
- Display allergies.
- Display dietary/preferences.
- Display service notes.
- Respect role permissions.
- Protect private/sensitive information.
- Record staff access/action where required.

## 5.2.6.5 User Flow

1. Staff opens reservation/table/order context.
2. System resolves the associated guest.
3. System evaluates staff permissions.
4. Permitted guest information is displayed.
5. Staff uses information for service.
6. Any staff-side note operation, if enabled, is recorded against the named user.

The BRS requires visibility of guest information but does not explicitly state that Staff App users can create or edit guest notes. Any such edit functionality is therefore TBD.

## 5.2.6.6 Functional Requirements

### FR-GP-01 — Guest Resolution

The Staff App shall resolve the guest associated with the active reservation/table/order context.

### FR-GP-02 — Tier Visibility

Guest tier shall be displayed to authorized staff.

### FR-GP-03 — Allergy Visibility

Guest allergy information shall be displayed to authorized staff before service.

### FR-GP-04 — Preference Visibility

Guest preferences shall be displayed to authorized staff before service.

### FR-GP-05 — Notes Visibility

Guest notes shall be displayed to authorized staff before service.

### FR-GP-06 — Permission Enforcement

Guest information access shall respect staff role permissions.

### FR-GP-07 — Data Minimization

Only guest information required for the authorized staff function should be returned/displayed.

### FR-GP-08 — Named User Context

Staff access/actions involving guest information shall be attributable to the named Staff user where audit logging is required.

## 5.2.6.7 Business Rules

- **BR-GP-001:** Staff may access guest information only within authorized permissions.
- **BR-GP-002:** Allergy information must be presented accurately and without silent truncation.
- **BR-GP-003:** Guest tier must come from the current loyalty/profile source.
- **BR-GP-004:** Guest preferences and notes are shown only to authorized staff.
- **BR-GP-005:** Guest data must be associated with the correct guest/service context.
- **BR-GP-006:** Unauthorized guest fields must not be exposed through APIs.
- **BR-GP-007:** Staff actions are attributable to the named user.
- **BR-GP-008:** Guest information must be handled under the platform's privacy/security requirements.

## 5.2.6.8 Validations

- Guest exists.
- Staff user is authenticated.
- Staff role permits requested guest data.
- Guest belongs to current service context.
- Data is current according to the source system.
- Sensitive data is filtered according to authorization.

## 5.2.6.9 Proposed APIs

`GET /api/v1/staff/guests/{guest_id}/service-profile`

Potential response sections:

- identity summary
- loyalty tier
- allergens
- dietary/preferences
- service notes
- relevant reservation/order context

`GET /api/v1/staff/orders/{order_id}/guest-profile`

`GET /api/v1/staff/reservations/{reservation_id}/guest-profile`

These are SRS proposals.

## 5.2.6.10 Data Requirements

Relevant BRS Guest attributes:

- Identity.
- Contacts.
- Addresses.
- Dietary preferences.
- Spice preferences.
- Consents.
- Tier.
- Lifetime value.

For staff service view, return only data permitted by role.

## 5.2.6.11 Error & Exception Handling

### Guest not found
Display an appropriate unavailable state; do not substitute another guest.

### Permission denied
Do not return restricted guest data.

### Stale guest data
Indicate unavailable/stale data according to UX design; do not misrepresent it as current.

### Multiple guest matches
Require deterministic guest resolution; do not guess.

### Profile service unavailable
Allow unrelated Staff App operation where possible while clearly indicating unavailable guest data.

## 5.2.6.12 Acceptance Criteria

- Staff can view the correct guest in a service context.
- Guest tier is shown to authorized staff.
- Allergens are shown to authorized staff.
- Preferences are shown to authorized staff.
- Notes are shown to authorized staff.
- Unauthorized staff cannot access restricted guest information.
- Guest data cannot be returned for the wrong guest.
- Staff access/action is attributable as required.
- Guest profile failure does not unnecessarily block unrelated Staff App operations.

## 5.2.6.13 Dependencies

- 5.2.1 Staff Authentication & Access Control.
- Guest Account/Profile.
- Loyalty service.
- Reservation/order context.
- Privacy/security controls.

## 5.2.6.14 Open Decisions / TBD

1. Exact staff-visible guest fields.
2. Which staff roles can view which fields.
3. Whether staff can create/edit service notes.
4. Note categories.
5. Note retention.
6. Note visibility across outlets.
7. Audit requirements for profile reads.
8. Guest-facing disclosure of staff-visible profile information.

---

# 5.2.7 Delivery Dispatch & Proof of Delivery

## 5.2.7.1 Module Overview

The **Delivery Dispatch & Proof of Delivery** module supports delivery staff operations.

The BRS requires delivery staff to receive:

- Assignments.
- Navigation handoff.
- Proof of delivery capture.

The BRS also defines the delivery logistics partner as a two-way, high-criticality integration for dispatch, courier assignment, tracking and proof of delivery.

The programme explicitly does **not** include operating an in-house courier fleet; delivery uses contracted logistics partners.

## 5.2.7.2 Direct BRS Requirement

| BRS ID | Priority | Requirement |
|---|---|---|
| FR-ST-06 | S | Delivery staff receive assignments, navigation handoff and capture proof of delivery. |

## 5.2.7.3 Related BRS Requirements

| BRS Reference | Relevance |
|---|---|
| FR-NT-02 | Delivery orders show courier identity, contact channel and live location where logistics partner supports it. |
| BRS §7.2 | Delivery is dispatched to a courier with tracking. |
| BRS §7.3 | Delivery failure or undeliverable address follows a defined refund/redelivery policy matrix. |
| BRS Integration | Delivery logistics partner: dispatch, courier assignment, tracking, proof of delivery; two-way/high. |
| BRS Scope | No in-house courier fleet; contracted logistics partners are used. |

## 5.2.7.4 Feature Scope

- Delivery assignment.
- Assignment acceptance/visibility.
- Delivery details.
- Navigation handoff.
- Courier/driver context where provided.
- Delivery status.
- Proof of delivery.
- Failed/undeliverable delivery handling.
- Partner synchronization.
- Staff attribution.

## 5.2.7.5 User Flow

1. Delivery assignment becomes available.
2. Delivery staff opens the assignment.
3. System displays relevant delivery/order details.
4. Staff accepts/acknowledges assignment according to configured partner workflow.
5. Navigation handoff is provided.
6. Delivery is completed.
7. Staff captures proof of delivery.
8. Completion is sent to the delivery logistics integration.
9. Order/delivery state is updated.
10. Named Staff user/action is recorded.

## 5.2.7.6 Functional Requirements

### FR-DL-01 — Assignment Visibility

Delivery staff shall see assigned delivery work relevant to their authorized context.

### FR-DL-02 — Delivery Details

The assignment shall contain the information needed for delivery execution, subject to role/privacy controls.

### FR-DL-03 — Navigation Handoff

The Staff App shall provide a navigation handoff to the configured mapping/navigation service.

### FR-DL-04 — Delivery Status

Delivery staff shall be able to progress delivery state according to the approved delivery workflow.

### FR-DL-05 — Proof of Delivery

Delivery staff shall be able to capture proof of delivery.

The BRS does not define the proof type, so exact media/signature/code requirements are TBD.

### FR-DL-06 — Partner Synchronization

Delivery status and proof-of-delivery information shall synchronize with the contracted logistics partner where required.

### FR-DL-07 — Delivery Failure

The Staff App shall support the operational recording of delivery failure/undeliverable-address information required by the BRS policy matrix.

### FR-DL-08 — Named User Attribution

Delivery actions shall be attributable to the named Staff user.

## 5.2.7.7 Business Rules

- **BR-DL-001:** Delivery uses contracted logistics partners rather than an in-house courier fleet.
- **BR-DL-002:** A delivery assignment must belong to the correct authorized outlet/service context.
- **BR-DL-003:** Navigation handoff must use the correct delivery destination.
- **BR-DL-004:** Proof of delivery must be associated with the correct delivery.
- **BR-DL-005:** Delivery failure must record the defined reason/evidence required by policy.
- **BR-DL-006:** Partner outage must not affect unrelated application capabilities.
- **BR-DL-007:** Delivery status changes must not duplicate state transitions.
- **BR-DL-008:** Staff actions must be attributable to the named user.

## 5.2.7.8 Validations

- Assignment exists.
- Assignment is active.
- Staff user is authorized.
- Destination details are valid.
- Proof-of-delivery input satisfies configured requirements.
- Delivery is in a state that permits the requested action.
- Partner reference is valid where required.

## 5.2.7.9 Proposed APIs

`GET /api/v1/staff/delivery/assignments`

`GET /api/v1/staff/delivery/assignments/{assignment_id}`

`POST /api/v1/staff/delivery/assignments/{assignment_id}/accept`

`POST /api/v1/staff/delivery/assignments/{assignment_id}/navigation`

`POST /api/v1/staff/delivery/assignments/{assignment_id}/proof-of-delivery`

`POST /api/v1/staff/delivery/assignments/{assignment_id}/failed`

These are SRS proposals.

## 5.2.7.10 Data Requirements

Potential data:

- Delivery assignment.
- Order reference.
- Destination/address reference.
- Courier/staff reference.
- Delivery status.
- Assignment timestamp.
- Navigation handoff reference.
- Proof-of-delivery type/reference.
- Failure reason.
- Evidence reference.
- Partner reference.
- Staff audit data.

The BRS does not provide a standalone delivery entity schema.

## 5.2.7.11 Error & Exception Handling

### Partner unavailable
Display assignment state where cached/available, queue safe updates where appropriate, and alert according to integration monitoring.

### Invalid destination
Prevent navigation handoff and flag the address problem.

### Delivery failure
Capture reason/evidence and route to the defined refund/redelivery policy flow.

### Proof upload failure
Do not mark proof as successfully captured when upload has failed.

### Duplicate completion
Use idempotent status processing.

## 5.2.7.12 Acceptance Criteria

- Delivery staff can view delivery assignments.
- Delivery staff can access correct delivery details.
- Navigation handoff opens the configured navigation mechanism.
- Delivery status can be progressed according to approved workflow.
- Proof of delivery can be captured.
- Proof is linked to the correct delivery.
- Failed delivery/undeliverable reason can be recorded.
- Delivery partner synchronization is handled.
- Named user attribution is preserved.
- Duplicate completion is prevented.

## 5.2.7.13 Dependencies

- 5.2.1 Staff Authentication & Access Control.
- Order Management.
- Delivery logistics partner.
- Mapping/navigation service.
- Notification service.
- Payment/refund workflow for delivery failure.

## 5.2.7.14 Open Decisions / TBD

1. Delivery assignment lifecycle.
2. Driver/courier role model.
3. Proof-of-delivery type.
4. Required evidence.
5. Photo/signature/OTP requirements.
6. Assignment acceptance requirement.
7. Navigation provider.
8. Offline delivery-proof capture behavior.
9. Delivery failure reason catalogue.
10. Partner status mapping.

---

# 5.2.8 Item Availability & Guest App Sync

## 5.2.8.1 Module Overview

The **Item Availability & Guest App Sync** module allows staff to mark menu items unavailable during operations and propagate the change immediately to the Guest App.

The BRS directly requires this capability under FR-ST-07.

The menu requirements also state that unavailable items must be visibly disabled rather than hidden without explanation.

## 5.2.8.2 Direct BRS Requirement

| BRS ID | Priority | Requirement |
|---|---|---|
| FR-ST-07 | M | Staff can mark items unavailable, which immediately updates the Guest App. |

## 5.2.8.3 Related BRS Requirements

| BRS Reference | Relevance |
|---|---|
| FR-MN-05 | Items can be marked unavailable in real time by staff, and unavailable items are visibly disabled rather than hidden without explanation. |
| FR-MN-01..09 | Menu structure, modifiers, combos, specials and scheduling. |
| FR-OR-03 | Cart shows itemized information. |
| BRS §7.3 | Item may become unavailable after an order is placed; substitution or partial refund flow applies. |

## 5.2.8.4 Feature Scope

- Search/select menu item.
- View current availability.
- Mark unavailable.
- Restore availability.
- Capture optional reason if configured.
- Outlet-specific availability.
- Immediate Guest App synchronization.
- Existing-cart handling.
- Operational audit.

## 5.2.8.5 User Flow

1. Staff opens item availability.
2. Staff selects an item.
3. Current availability is displayed.
4. Staff marks item unavailable.
5. System validates permission and outlet scope.
6. Availability state is persisted.
7. Guest App is updated immediately according to the real-time architecture.
8. The item remains visible but disabled where required by FR-MN-05.
9. Staff action is recorded.

## 5.2.8.6 Functional Requirements

### FR-IA-01 — Availability View

Staff shall be able to view current menu item availability within the authorized outlet.

### FR-IA-02 — Mark Unavailable

Authorized staff shall be able to mark a menu item unavailable.

### FR-IA-03 — Restore Availability

Authorized staff shall be able to restore an unavailable item when business rules permit.

### FR-IA-04 — Immediate Guest App Update

Availability changes shall propagate immediately to the Guest App as required by FR-ST-07.

### FR-IA-05 — Visible Disabled State

Unavailable items shall be visibly disabled rather than hidden without explanation, as required by FR-MN-05.

### FR-IA-06 — Existing Cart Handling

The system shall detect relevant existing guest-cart/order situations when an item becomes unavailable.

The BRS specifies substitution or partial refund after order placement; exact pre-checkout cart behavior is TBD.

### FR-IA-07 — Outlet Scope

Availability changes must apply only to the appropriate outlet context unless shared availability is explicitly configured.

### FR-IA-08 — Named User Attribution

Availability changes shall be attributable to the named Staff user.

## 5.2.8.7 Business Rules

- **BR-IA-001:** Only authorized staff may change availability.
- **BR-IA-002:** Availability changes are outlet-specific unless configuration says otherwise.
- **BR-IA-003:** Unavailable items remain visible but disabled where the Guest App menu requires this.
- **BR-IA-004:** Availability changes propagate to the Guest App immediately.
- **BR-IA-005:** Existing orders are not silently cancelled solely because availability changed.
- **BR-IA-006:** If an already placed item becomes unavailable, follow the BRS substitution/partial-refund process.
- **BR-IA-007:** Staff changes are attributable to the named user.
- **BR-IA-008:** Availability change processing must prevent duplicate or out-of-order updates.

## 5.2.8.8 Validations

- Menu item exists.
- Item belongs to authorized outlet/menu context.
- Staff has availability-management permission.
- Requested state is different/currently valid.
- No invalid menu configuration state is introduced.
- Existing active order impacts are detected.

## 5.2.8.9 Proposed APIs

`GET /api/v1/staff/menu/availability`

`GET /api/v1/staff/menu/items/{item_id}/availability`

`PUT /api/v1/staff/menu/items/{item_id}/availability`

Potential request:

```json
{
  "available": false,
  "reason": "out_of_stock"
}
```

The reason field is a proposal and is not defined by the BRS.

## 5.2.8.10 Data Requirements

Relevant BRS Menu item attributes:

- Category.
- Price.
- Modifiers.
- Allergens.
- Dietary tags.
- Spice grade.
- Availability.
- Prep time.

SRS operational data may include:

- availability state.
- effective time.
- expiry time where configured.
- reason.
- staff user.
- audit event.

## 5.2.8.11 Error & Exception Handling

### Guest App synchronization failure
Persist the authoritative availability state and retry synchronization.

### Concurrent availability update
Revalidate current state and avoid stale overwrite.

### Item already unavailable
Do not create unnecessary duplicate state transitions.

### Existing order affected
Do not silently cancel. Follow BRS substitution/partial-refund handling.

### Menu service unavailable
Show current known state with clear staleness handling; prevent unsafe updates if current state cannot be verified.

## 5.2.8.12 Acceptance Criteria

- Authorized staff can view item availability.
- Authorized staff can mark an item unavailable.
- Authorized staff can restore availability.
- Guest App reflects the change immediately.
- Unavailable item remains visible but disabled where required.
- Existing order handling follows the BRS substitution/partial-refund flow.
- Outlet-specific changes do not incorrectly affect other outlets.
- Staff action is attributable to the named user.
- Concurrent updates are handled safely.

## 5.2.8.13 Dependencies

- Menu service.
- Guest App menu.
- 5.2.1 authentication/RBAC.
- Order Management.
- Real-time synchronization layer.
- Audit logging.

## 5.2.8.14 Open Decisions / TBD

1. Availability reason catalogue.
2. Scheduled availability restoration.
3. Outlet vs multi-outlet propagation behavior.
4. Exact existing-cart behavior.
5. Exact real-time transport.
6. Availability conflict resolution.
7. Staff permission matrix.
8. Offline availability editing behavior.

---

# 5.2.9 Staff Activity Audit & Accountability

## 5.2.9.1 Module Overview

The **Staff Activity Audit & Accountability** module ensures that operational Staff App actions can be traced back to the named staff user who performed them.

This requirement is explicit in the BRS under FR-ST-08 and is reinforced by:

- FR-AD-04 role-based access control with full audit trail.
- The Staff user core entity containing role, permissions, outlet and action audit trail.

This module is cross-cutting and applies to all Staff App operational modules.

## 5.2.9.2 Direct BRS Requirement

| BRS ID | Priority | Requirement |
|---|---|---|
| FR-ST-08 | M | All staff actions are attributed to a named user for accountability. |

## 5.2.9.3 Related BRS Requirements

| BRS Reference | Relevance |
|---|---|
| FR-AD-04 | RBAC governs every function, least privilege by default and full audit trail. |
| BRS §11.1 — Staff user | Staff user includes role, permissions, outlet and action audit trail. |
| FR-ST-03 | Order accept/modify/hold/reject actions require accountability. |
| FR-ST-07 | Item availability changes require accountability. |
| FR-FB-03 | Manager response/goodwill actions require accountability where the cross-module audit model applies. |
| BRS §7.3 | Manager-routed disputes include an audit record. |

## 5.2.9.4 Feature Scope

- Named-user attribution.
- Audit event generation.
- Action timestamp.
- Resource/entity reference.
- Outlet context.
- Action outcome.
- Correlation/reference ID.
- Audit retrieval for authorized roles.
- Protection against unauthorized modification.

## 5.2.9.5 Audited Staff Actions

At minimum, the audit model should support actions such as:

- Seat table.
- Move table.
- Merge table.
- Split table.
- Waitlist call-forward.
- Accept order.
- Modify order.
- Hold order.
- Reject order.
- Table-side order creation.
- Delivery assignment/status/proof action.
- Item availability change.
- Guest-service actions where explicitly configured.

The exact complete audit event catalogue is a design item.

## 5.2.9.6 Functional Requirements

### FR-AU-01 — Named User Attribution

Every Staff action requiring audit shall record the named Staff user.

### FR-AU-02 — Timestamp

Audit records shall include the event timestamp.

### FR-AU-03 — Action Type

Audit records shall identify the business action performed.

### FR-AU-04 — Resource Reference

Where applicable, audit records shall identify the entity/resource affected.

### FR-AU-05 — Outlet Context

Audit records shall identify the relevant outlet context.

### FR-AU-06 — Outcome

Audit records should identify whether the action succeeded, failed or was denied where supported by the audit model.

### FR-AU-07 — Correlation

Audit events should support a correlation/request identifier for tracing distributed operations.

### FR-AU-08 — Audit Integrity

Audit history shall not be editable by ordinary Staff users.

### FR-AU-09 — Authorized Audit Access

Only authorized roles may view audit records.

### FR-AU-10 — Cross-Module Attribution

Audit context must propagate consistently across Staff App modules and backend services.

## 5.2.9.7 Business Rules

- **BR-AU-001:** No required Staff action may be unattributed to a named user.
- **BR-AU-002:** Audit records identify the business action.
- **BR-AU-003:** Audit records include relevant entity/resource context.
- **BR-AU-004:** Audit records include outlet context.
- **BR-AU-005:** Audit records are protected against unauthorized modification/deletion.
- **BR-AU-006:** Audit access is role-controlled.
- **BR-AU-007:** Staff users cannot impersonate another user for audit attribution.
- **BR-AU-008:** Authentication/session identity must be consistent with audit identity.
- **BR-AU-009:** Audit records must support operational investigation.
- **BR-AU-010:** Failed/denied actions may be logged according to the approved security model.
- **BR-AU-011:** Audit failures must not silently remove accountability from a required business action.

## 5.2.9.8 Validations

- Authenticated user exists.
- Staff user is active.
- User identity is available to business operation.
- Outlet context is available.
- Action type is defined.
- Resource ID is valid where required.
- Audit event can be associated with the operation.

## 5.2.9.9 Proposed APIs

`GET /api/v1/admin/audit/staff`

`GET /api/v1/admin/audit/staff/{event_id}`

The exact final location/permission model belongs to Admin Console SRS.

Internal audit event creation may be:

`POST /internal/audit/events`

This is an implementation proposal and should normally be generated by backend services rather than directly called by Staff devices.

## 5.2.9.10 Data Requirements

Proposed audit event:

- event_id
- staff_user_id
- action_type
- entity_type
- entity_id
- outlet_id
- timestamp
- outcome
- reason/reference
- correlation_id
- request_id
- source/application
- metadata as approved

The BRS explicitly requires the Staff user entity to contain an action audit trail, but it does not prescribe this full schema.

## 5.2.9.11 Error & Exception Handling

### Missing user identity
Reject protected action where accountability is mandatory.

### Missing outlet context
Reject action when audit context cannot be established safely.

### Audit store unavailable
The final behavior must be explicitly decided. For mandatory accountable actions, the system should not silently perform an action with no audit attribution.

### Unauthorized audit access
Return authorization failure and do not expose records.

### Tamper attempt
Deny modification and generate security logging as configured.

## 5.2.9.12 Acceptance Criteria

- Every required Staff action contains the correct named user.
- Audit record contains timestamp.
- Audit record identifies action type.
- Audit record identifies affected resource where applicable.
- Audit record contains outlet context.
- Unauthorized staff cannot modify audit records.
- Unauthorized users cannot retrieve restricted audit data.
- Cross-module actions preserve the same staff identity.
- Audit records support investigation of operational actions.
- Required business actions do not silently bypass attribution.

## 5.2.9.13 Dependencies

- 5.2.1 Staff Authentication & Access Control.
- All Staff App modules.
- Backend service layer.
- Database/audit store.
- Admin Console audit access.
- Observability/security monitoring.

## 5.2.9.14 Open Decisions / TBD

1. Final audit-event catalogue.
2. Audit storage technology.
3. Audit retention period.
4. Immutable storage requirements.
5. Audit access roles.
6. Failed/denied-action logging policy.
7. Audit-store failure policy.
8. Personal-data masking in audit records.
9. Cross-outlet audit visibility.
10. Export requirements.
11. Correlation ID standard.
12. Security alert rules for suspicious staff activity.

---

# 5.2 Staff App — Cross-Module Requirements

## 5.2.10 Common Security

All Staff App modules depend on:

- Authentication.
- Role-based authorization.
- Least privilege.
- Outlet scope.
- Named-user attribution.
- Auditability.
- Protection of guest information.

These requirements are grounded in FR-AD-04, FR-ST-05, FR-ST-08 and the Staff user entity in the BRS.

## 5.2.11 Common Real-Time Requirements

Relevant Staff App functions require current operational information, especially:

- Floor plan.
- Waitlist.
- Orders.
- Item availability.
- Kitchen-related states.
- Delivery states.

The BRS identifies several live/two-way integrations, but does not prescribe the transport. WebSockets are an implementation choice within the solution architecture, not a BRS requirement.

## 5.2.12 Common Integration Principles

The BRS requires:

- POS remains the financial system of record.
- Partner outages should affect only the affected capability rather than the whole application.
- Interfaces should be monitored.
- Financial flows require reconciliation reporting.

These principles apply across Staff App integrations.

## 5.2.13 Common Offline / Resilience Considerations

The BRS states that the Staff App and KDS continue to display and progress accepted orders during short network loss and reconcile on reconnection.

Exact offline behavior for:

- Table assignment.
- Waitlist mutations.
- Order acceptance.
- Table-side ordering.
- Item availability.
- Delivery proof.

must be defined individually before implementation.

## 5.2.14 Common Observability

Relevant staff workflows should produce:

- Error logs.
- Integration failure logs.
- Operational alerts where applicable.
- Correlation IDs.
- Action/audit information.

This aligns with NFR-13.

---

# 5.2 Staff App — Consolidated BRS Traceability

| SRS Module | Primary BRS Requirement(s) | Priority |
|---|---|---|
| 5.2.3 Waitlist & Table Assignment | FR-ST-02, FR-RS-07, FR-RS-08, FR-RS-09, FR-RS-10 | M/S |
| 5.2.4 Order Management | FR-ST-03 | M |
| 5.2.5 Table-Side Ordering | FR-ST-04 | S |
| 5.2.6 Guest Profile & Service Notes | FR-ST-05 | M |
| 5.2.7 Delivery Dispatch & Proof of Delivery | FR-ST-06 | S |
| 5.2.8 Item Availability & Guest App Sync | FR-ST-07, FR-MN-05 | M |
| 5.2.9 Staff Activity Audit & Accountability | FR-ST-08, FR-AD-04 | M |

---

# 5.2 Staff App — Cross-Module Acceptance

The Staff App implementation should ultimately demonstrate:

1. Authorized Staff user can access the correct outlet.
2. Staff can manage the waitlist and assign tables.
3. Staff can accept/modify/hold/reject orders, with mandatory rejection reason.
4. Staff can take table-side orders into the common kitchen queue.
5. Staff can view permitted guest tier, allergens, preferences and notes.
6. Delivery staff can receive assignments, use navigation handoff and capture proof of delivery.
7. Staff can mark menu items unavailable and Guest App updates immediately.
8. All required Staff actions are attributed to the named user.
9. Role permissions prevent unauthorized operations.
10. Operational state remains consistent across Staff App and connected systems.

---

# 5.2 Staff App — Final Open Decisions Register

The following items should be resolved before development of the corresponding modules is considered implementation-ready:

- Staff authentication method and session policy.
- Final Staff roles.
- Final permission matrix.
- Staff-to-outlet assignment rules.
- Waitlist ordering and matching rules.
- Table assignment behavior.
- No-show and late-arrival policies.
- Order modification matrix.
- Order hold/rejection reason catalogue.
- Order state machine.
- Table-side order/running-tab behavior.
- Staff-visible guest data matrix.
- Staff note creation/edit permission.
- Delivery proof-of-delivery method.
- Delivery partner status mapping.
- Item availability reason and propagation rules.
- Real-time synchronization contract.
- Offline behavior by operation.
- Final audit event catalogue.
- Audit retention and failure policy.

