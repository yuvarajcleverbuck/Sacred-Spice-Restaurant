# SACRED SPICE RESTAURANT
# Software Requirement Specification (SRS)
## Section 5.4 — Admin Console

**Document:** Sacred_Spice_SRS_5.4_Admin_Console  
**Version:** 1.0  
**Source baseline:** Sacred Spice Restaurant BRS v1.0  
**BRS date:** 15 September 2026  
**Status:** SRS Draft for implementation and stakeholder review  
**Classification:** Confidential

---

# 5.4 Admin Console

## 5.4.0 Admin Console Overview

The Admin Console is the web-based operational and business management interface for Sacred Spice.

The BRS defines the Admin Console as the place to manage menus, pricing, availability, modifiers and combos with scheduling; reservation policy, floor plans, capacity and blackout configuration; promotions, loyalty rules and campaigns; staff roles, permissions and audit trail; and operational and commercial reporting with export. [BRS §5.1.4]

The Admin Console must support the connected Guest App, Staff App and KDS while the existing POS and accounting systems remain systems of record.

### BRS Direct Requirement Group

| BRS ID | Requirement | Priority |
|---|---|---:|
| FR-AD-01 | Administrators manage menus, prices, modifiers, combos, availability and scheduling per outlet. | M |
| FR-AD-02 | Administrators configure reservation policy, floor plans, capacity, operating hours and blackout dates. | M |
| FR-AD-03 | Administrators create and schedule promotions, loyalty rules and campaigns with approval workflow. | M |
| FR-AD-04 | Role-based access control governs every function, with least privilege by default and a full audit trail. | M |
| FR-AD-05 | Dashboards report revenue, orders, AOV, channel mix, cancellation and refund rates, and promotion cost. | M |
| FR-AD-06 | Dashboards report table utilisation, average turn time, no-show rate, waitlist conversion and peak load. | M |
| FR-AD-07 | Dashboards report kitchen performance, including prep time by item and station and SLA breach rate. | S |
| FR-AD-08 | Dashboards report guest metrics, including new versus repeat, retention cohorts, tier distribution and lifetime value. | S |
| FR-AD-09 | All reports can be filtered by date range, outlet and channel and exported to spreadsheet or PDF. | M |
| FR-AD-10 | Content publishing supports banners, chef stories, event listings and push campaign content. | S |

**BRS mapping:** FR-AD-01 through FR-AD-10 are defined under BRS §8.11 Admin Console and Reporting.

---

# 5.4.1 Admin Authentication & Access Control

## 5.4.1.1 Module Overview

This module controls secure access to the Admin Console and ensures that administrative capabilities are available only to authorized users.

**BRS mapping:** Direct FR-AD-04; related Staff User/audit requirements and NFR-05/NFR-13.

## 5.4.1.2 Scope

- Admin sign-in and authenticated sessions.
- Role-based authorization.
- Permission checks on protected operations.
- Outlet/location access restrictions.
- Auditability of administrative actions.

The BRS does not define the exact Admin authentication method, role names, MFA design, session lifetime, or device trust policy. These remain TBD/design decisions.

## 5.4.1.3 User Flow

1. User opens Admin Console.
2. User authenticates using the approved mechanism.
3. System validates identity and account status.
4. System resolves role, permissions and authorized outlet scope.
5. System creates an authenticated session.
6. User sees only authorized functionality.
7. Every protected operation performs authorization and generates the required audit context.

## 5.4.1.4 Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---:|---|
| SRS-AD-AUTH-01 | Admin users shall be authenticated before protected console access. | M | FR-AD-04 |
| SRS-AD-AUTH-02 | Every protected Admin Console operation shall perform an authorization check. | M | FR-AD-04 |
| SRS-AD-AUTH-03 | Permissions shall follow least-privilege principles. | M | FR-AD-04 |
| SRS-AD-AUTH-04 | Administrative access shall be constrained to the outlet/location scope assigned to the user where applicable. | M | FR-AD-04 |
| SRS-AD-AUTH-05 | Administrative changes shall record the responsible user in the audit trail. | M | FR-AD-04 |
| SRS-AD-AUTH-06 | Session expiration and re-authentication shall follow the approved security policy. | M | NFR-05 |
| SRS-AD-AUTH-07 | Repeated authentication attempts shall be rate-limited where applicable. | M | NFR-05 |
| SRS-AD-AUTH-08 | Authentication/authorization failures shall be observable without logging secrets. | M | NFR-13 |

## 5.4.1.5 Business Rules

- **BR-AD-AUTH-001:** No unauthenticated user may access protected admin functionality.
- **BR-AD-AUTH-002:** Users may perform only actions granted by their effective permission set.
- **BR-AD-AUTH-003:** Least privilege is the default access model.
- **BR-AD-AUTH-004:** Outlet-restricted users must not read or change data outside their authorized scope.
- **BR-AD-AUTH-005:** Privileged actions must remain attributable to a named user.
- **BR-AD-AUTH-006:** Access-control changes must themselves be auditable.
- **BR-AD-AUTH-007:** Exact role/permission catalogue is TBD.

## 5.4.1.6 Validations

- Active, valid session.
- Active user account.
- Required permission exists.
- Outlet is in scope.
- Required audit context exists.

## 5.4.1.7 Proposed APIs

```text
POST /api/v1/admin/auth/login
POST /api/v1/admin/auth/logout
POST /api/v1/admin/auth/refresh
GET  /api/v1/admin/me
GET  /api/v1/admin/me/permissions
GET  /api/v1/admin/me/outlets
```

## 5.4.1.8 Data Requirements

- User ID and status.
- Role ID.
- Permission set.
- Outlet/location scope.
- Session metadata.
- Authentication event metadata.
- Audit reference.

## 5.4.1.9 Error / Exception Handling

- Invalid authentication → reject and record security event.
- Expired session → require re-authentication.
- Insufficient permission → deny operation.
- Out-of-scope outlet → deny operation and record security event.
- Security-service failure → fail closed for protected operations unless an approved emergency process exists.

## 5.4.1.10 Acceptance Criteria

- Unauthorized users cannot reach protected admin functions.
- Users can access only permitted modules and authorized outlet scope.
- Tested admin changes identify the named user in the audit trail.
- Permission-denied attempts are handled consistently.
- Security controls are covered by pre-launch security testing.

## 5.4.1.11 TBD

- Authentication method.
- MFA requirement.
- Exact roles and permissions.
- Session duration.
- Break-glass access.
- Concurrent-session policy.

---

# 5.4.2 Menu, Pricing & Availability Management

## 5.4.2.1 Module Overview

This module manages menu data and outlet-specific menu behavior.

**BRS mapping:** Direct FR-AD-01; related FR-MN-01 through FR-MN-10 and FR-ST-07.

## 5.4.2.2 Features

- Categories and items.
- Prices.
- Modifiers and option groups.
- Combos.
- Availability.
- Scheduling.
- Outlet-specific configuration.
- Publish/update without mobile application release.

## 5.4.2.3 User Flow

1. Admin selects outlet.
2. Admin opens menu management.
3. Admin creates/edits category, item, modifier or combo.
4. System validates required fields and dependencies.
5. Admin saves and publishes according to approved workflow.
6. Published changes become available to connected consumers.

## 5.4.2.4 Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---:|---|
| SRS-AD-MN-01 | Administrators shall create and manage menu categories per outlet. | M | FR-AD-01 |
| SRS-AD-MN-02 | Administrators shall create and maintain menu items. | M | FR-AD-01 / FR-MN-01 |
| SRS-AD-MN-03 | Administrators shall manage prices per outlet. | M | FR-AD-01 |
| SRS-AD-MN-04 | Administrators shall manage modifiers and option groups with price impact. | M | FR-AD-01 / FR-MN-06 |
| SRS-AD-MN-05 | Administrators shall manage supported combos, thalis and related menu groupings. | M | FR-AD-01 / FR-MN-07 |
| SRS-AD-MN-06 | Administrators shall manage item availability. | M | FR-AD-01 / FR-MN-05 |
| SRS-AD-MN-07 | Administrators shall schedule menu content/time-bound availability. | M | FR-AD-01 / FR-MN-09 |
| SRS-AD-MN-08 | Published menu changes shall propagate to connected Guest and Staff consumers. | M | FR-AD-01 |
| SRS-AD-MN-09 | Menu and pricing updates shall be audit logged. | M | FR-AD-04 |
| SRS-AD-MN-10 | Supported menu/pricing changes shall not require a mobile application release. | M | NFR-14 |

## 5.4.2.5 Business Rules

- Menu content is outlet-scoped.
- An unavailable item must not be accepted as a new orderable item.
- Scheduled menu data becomes active only within its effective period.
- Published item data must remain consistent across dependent clients.
- Pricing/modifier changes must be auditable.
- Draft/publish and versioning behavior are TBD.

## 5.4.2.6 Validations

- Required category/item data is present.
- Price is valid and non-negative.
- Modifier dependencies are valid.
- Schedule start/end is valid.
- Outlet is active and authorized.
- Conflicting schedules are detected.

## 5.4.2.7 Proposed APIs

```text
GET   /api/v1/admin/outlets/{outlet_id}/menu
POST  /api/v1/admin/outlets/{outlet_id}/menu/categories
PATCH /api/v1/admin/menu/categories/{category_id}
POST  /api/v1/admin/outlets/{outlet_id}/menu/items
PATCH /api/v1/admin/menu/items/{item_id}
POST  /api/v1/admin/menu/items/{item_id}/availability
POST  /api/v1/admin/menu/items/{item_id}/publish
POST  /api/v1/admin/menu/modifier-groups
POST  /api/v1/admin/menu/combos
```

## 5.4.2.8 Data Requirements

- Outlet, Menu, Category, Menu Item, Price.
- Modifier Group and Modifier Option.
- Combo.
- Availability Rule and Schedule.
- Audit Event.

Relevant item data may include spice grade, allergens, dietary suitability and regional/origin information as defined in the BRS.

## 5.4.2.9 Error / Exception Handling

- Invalid dependency → reject save/publish.
- Schedule conflict → require correction.
- Unauthorized outlet → reject.
- Concurrent edit → require refresh/review.
- Publication failure → retain prior published version and alert.

## 5.4.2.10 Acceptance Criteria

- Authorized admin can manage menu data for an outlet.
- Prices, modifiers and combos are configurable.
- Availability changes propagate to consuming applications.
- Scheduling works for effective periods.
- Tested changes create audit records.

## 5.4.2.11 TBD

- Draft/publish model.
- Menu versioning and rollback.
- Exact combo data model.
- Media management.
- Concurrent-edit conflict resolution.

---

# 5.4.3 Reservation, Floor Plan & Capacity Configuration

## 5.4.3.1 Module Overview

This module manages reservation behavior and restaurant seating capacity.

**BRS mapping:** Direct FR-AD-02; related FR-RS-01 through FR-RS-10 and Staff FR-ST-01/FR-ST-02.

The BRS requires availability to use the live floor plan, service-duration assumptions and configured capacity limits. It also requires reservation policy, floor plans, capacity, operating hours and blackout dates to be configurable.

## 5.4.3.2 Features

- Reservation policy.
- Slot interval and service-duration assumptions.
- Floor plan and tables.
- Capacity limits.
- Operating hours.
- Blackout dates.
- Overbooking tolerance.
- Table blocking for maintenance/private events.

## 5.4.3.3 User Flow

1. Admin selects outlet.
2. Admin edits reservation or floor-plan configuration.
3. System validates table/capacity relationships.
4. Admin saves/publishes configuration.
5. Reservation and Staff systems use the effective configuration.

## 5.4.3.4 Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---:|---|
| SRS-AD-RS-01 | Configure reservation policy per outlet. | M | FR-AD-02 |
| SRS-AD-RS-02 | Configure floor plans and table data. | M | FR-AD-02 |
| SRS-AD-RS-03 | Configure capacity limits. | M | FR-AD-02 |
| SRS-AD-RS-04 | Configure operating hours. | M | FR-AD-02 |
| SRS-AD-RS-05 | Configure blackout dates and blocked capacity. | M | FR-AD-02 |
| SRS-AD-RS-06 | Configure slot intervals and service-duration assumptions where supported. | M | FR-RS-01 / FR-RS-02 |
| SRS-AD-RS-07 | Configure overbooking tolerance where permitted. | M | FR-RS-09 |
| SRS-AD-RS-08 | Restrict configuration to authorized outlets. | M | FR-AD-04 |
| SRS-AD-RS-09 | Audit configuration changes. | M | FR-AD-04 |

## 5.4.3.5 Business Rules

- Availability must respect configured capacity.
- Blacked-out periods must not be offered for normal reservation.
- Blocked tables/capacity must be excluded from available capacity.
- Overbooking must not exceed configured tolerance.
- Operating-hour rules apply to reservation availability.

## 5.4.3.6 Validations

- Table identifiers are unique within outlet.
- Capacity values are valid.
- Operating hours do not conflict.
- Blackout periods are valid.
- Reservation rules do not create impossible configurations.
- Outlet scope is enforced.

## 5.4.3.7 Proposed APIs

```text
GET  /api/v1/admin/outlets/{outlet_id}/reservation-config
PATCH /api/v1/admin/outlets/{outlet_id}/reservation-config
GET  /api/v1/admin/outlets/{outlet_id}/floor-plan
PUT  /api/v1/admin/outlets/{outlet_id}/floor-plan
POST /api/v1/admin/outlets/{outlet_id}/tables
PATCH /api/v1/admin/tables/{table_id}
POST /api/v1/admin/outlets/{outlet_id}/blackouts
POST /api/v1/admin/outlets/{outlet_id}/capacity-rules
```

## 5.4.3.8 Data Requirements

- Outlet.
- Floor Plan and Table.
- Table capacity.
- Reservation Policy.
- Service Duration Rule.
- Capacity Rule.
- Operating Hours.
- Blackout Period.
- Overbooking Tolerance.
- Audit Event.

## 5.4.3.9 Errors / Exceptions

- Conflicting table configuration → reject.
- Invalid capacity → reject or require review.
- Blackout overlaps active booking period → require business handling before publish.
- Concurrent floor-plan edit → use approved concurrency handling.

## 5.4.3.10 Acceptance Criteria

- Admin can configure reservation policy.
- Admin can configure floor plan and tables.
- Admin can configure capacity, operating hours and blackout periods.
- Guest availability uses effective configuration.
- Changes are auditable.

## 5.4.3.11 TBD

- Exact floor-plan editor.
- Table metadata/shape detail.
- Section/zone configuration.
- Configuration inheritance across outlets.

---

# 5.4.4 Promotions & Campaign Management

## 5.4.4.1 Module Overview

This module manages promotions and campaigns.

**BRS mapping:** Direct FR-AD-03; related FR-LY-04/05 and FR-NT-04.

The BRS requires percentage, fixed amount, item-level, bundle and threshold discounts with stacking rules and usage caps. It also identifies margin guardrails and monthly promotion profitability review as mitigation for promotion margin erosion.

## 5.4.4.2 Features

- Promotion creation.
- Eligibility conditions.
- Targeting.
- Stacking rules.
- Usage caps.
- Scheduling.
- Campaign management.
- Approval workflow.
- Outlet scope.

## 5.4.4.3 Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---:|---|
| SRS-AD-PR-01 | Create supported promotion types. | M | FR-AD-03 / FR-LY-04 |
| SRS-AD-PR-02 | Configure eligibility criteria. | M | FR-LY-04 |
| SRS-AD-PR-03 | Configure stacking rules and usage limits. | M | FR-LY-04 |
| SRS-AD-PR-04 | Schedule promotions for effective periods. | M | FR-AD-03 |
| SRS-AD-PR-05 | Target supported guest segments where enabled. | S | FR-LY-05 |
| SRS-AD-PR-06 | Create/schedule campaigns with approval workflow. | M | FR-AD-03 |
| SRS-AD-PR-07 | Promotion changes shall be attributable to named admin users. | M | FR-AD-04 |
| SRS-AD-PR-08 | Promotion cost shall be available for commercial reporting. | M | FR-AD-05 |

## 5.4.4.4 Business Rules

- Promotions must have clear validity periods.
- Stacking restrictions must be evaluated before application.
- Usage caps must be enforced.
- Margin guardrails apply where approved policy defines them.
- Unapproved promotions must not become active where approval is required.
- Exact approval stages and approver roles are TBD.

## 5.4.4.5 Validations

- Discount value/type is valid.
- Schedule is valid.
- Usage cap is valid.
- Eligibility rules are consistent.
- Outlet scope exists.
- Stacking configuration is valid.
- Approval status permits publication.

## 5.4.4.6 Proposed APIs

```text
GET   /api/v1/admin/promotions
POST  /api/v1/admin/promotions
PATCH /api/v1/admin/promotions/{promotion_id}
POST  /api/v1/admin/promotions/{promotion_id}/submit
POST  /api/v1/admin/promotions/{promotion_id}/approve
POST  /api/v1/admin/promotions/{promotion_id}/publish
GET   /api/v1/admin/campaigns
POST  /api/v1/admin/campaigns
```

## 5.4.4.7 Data Requirements

- Promotion.
- Promotion Type.
- Eligibility Rule.
- Target Segment.
- Stacking Rule.
- Usage Cap.
- Schedule.
- Campaign.
- Approval Status and events.
- Outlet Scope.
- Audit Event.

## 5.4.4.8 Errors / Exceptions

- Invalid stacking → reject.
- Cap reached → prevent further application.
- Expired promotion → inactive.
- Unapproved promotion → cannot publish.
- Conflicting rules → validation error.

## 5.4.4.9 Acceptance Criteria

- Admin can create a promotion.
- Promotion cannot activate before required approval.
- Stacking and usage limits are enforced.
- Promotion cost is available for reporting.
- Changes are audited.

## 5.4.4.10 TBD

- Detailed approval workflow.
- Margin calculation/source.
- Segment-definition UI.
- Campaign analytics.

---

# 5.4.5 Loyalty Configuration

## 5.4.5.1 Module Overview

This module provides business configuration for loyalty earning, redemption and related rules.

**BRS mapping:** Direct FR-AD-03; related FR-LY-01 through FR-LY-08.

The BRS requires configurable earning rates by channel, day-part and item category, reward redemption with value and expiry, tiers where applicable, and auditable loyalty activity. Manual point adjustments require manager authorization with a reason code.

## 5.4.5.2 Features

- Earning rules.
- Redemption rules.
- Rewards.
- Expiry.
- Tiers.
- Qualification/downgrade rules where enabled.
- Manual adjustments.
- Reason codes.
- Audit trail.

## 5.4.5.3 Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---:|---|
| SRS-AD-LY-01 | Configure points earning rules. | M | FR-LY-01 |
| SRS-AD-LY-02 | Configure redemption rewards and values. | M | FR-LY-02 |
| SRS-AD-LY-03 | Configure reward expiry. | M | FR-LY-02 |
| SRS-AD-LY-04 | Configure tier qualification and related rules where enabled. | S | FR-LY-03 |
| SRS-AD-LY-05 | Manual point adjustments require authorized action and reason code. | M | FR-LY-08 |
| SRS-AD-LY-06 | Loyalty configuration changes shall be auditable. | M | FR-LY-08 / FR-AD-04 |
| SRS-AD-LY-07 | Loyalty rules shall support approved outlet/channel scope. | M | FR-LY-01 |
| SRS-AD-LY-08 | Historical transactions shall not be silently rewritten by configuration changes. | M | FR-LY-08 |

## 5.4.5.4 Business Rules

- Earning uses approved qualifying-spend rules.
- Redemption respects configured value and expiry.
- Manual point changes require authorization and reason.
- Loyalty history remains auditable.
- Exact effective-date and historical recalculation behavior is TBD.

## 5.4.5.5 Validations

- Earning rate is valid.
- Reward value/points cost is valid.
- Expiry is valid.
- Tier thresholds do not create invalid ranges.
- Adjustment amount is valid.
- Reason code is mandatory for manual adjustments.
- User is authorized for the adjustment.

## 5.4.5.6 Proposed APIs

```text
GET  /api/v1/admin/loyalty/rules
POST /api/v1/admin/loyalty/rules
PATCH /api/v1/admin/loyalty/rules/{rule_id}
GET  /api/v1/admin/loyalty/rewards
POST /api/v1/admin/loyalty/rewards
GET  /api/v1/admin/loyalty/tiers
POST /api/v1/admin/loyalty/adjustments
GET  /api/v1/admin/loyalty/adjustments
```

## 5.4.5.7 Data Requirements

- Loyalty Program.
- Earning Rule.
- Redemption Rule.
- Reward.
- Tier.
- Qualification Rule.
- Expiry Rule.
- Manual Adjustment.
- Reason Code.
- Approval/Audit Event.

## 5.4.5.8 Errors / Exceptions

- Invalid rule → reject.
- Unauthorized adjustment → reject.
- Missing reason → reject.
- Conflicting effective periods → require correction.
- Historical impact → require explicit business handling.

## 5.4.5.9 Acceptance Criteria

- Admin can configure earning and redemption rules.
- Rewards respect value and expiry.
- Manual adjustments require authorization and reason code.
- Configuration changes are auditable.
- Loyalty reports reflect configured rules.

## 5.4.5.10 TBD

- Exact tier model for Phase 1.
- Effective-date behavior.
- Rule priority.
- Adjustment authorization limits.

---

# 5.4.6 Staff Roles, Permissions & Audit

## 5.4.6.1 Module Overview

This module manages staff/admin authorization and accountability.

**BRS mapping:** Direct FR-AD-04; related FR-ST-08 and Staff User data entity.

## 5.4.6.2 Features

- Staff users.
- Roles.
- Permissions.
- Outlet assignment.
- Activation/deactivation.
- Audit review.

## 5.4.6.3 Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---:|---|
| SRS-AD-STAFF-01 | Administrators shall create and manage authorized staff users. | M | FR-AD-04 |
| SRS-AD-STAFF-02 | Administrators shall assign roles/permissions according to the approved access model. | M | FR-AD-04 |
| SRS-AD-STAFF-03 | Staff access shall be constrained by assigned outlet/location where applicable. | M | FR-AD-04 |
| SRS-AD-STAFF-04 | User activation/deactivation shall be supported. | M | FR-AD-04 |
| SRS-AD-STAFF-05 | Permission changes shall be auditable. | M | FR-AD-04 |
| SRS-AD-STAFF-06 | Staff actions shall remain attributable to a named user. | M | FR-ST-08 |

## 5.4.6.4 Business Rules

- Inactive users cannot perform new protected operations.
- Users receive only approved permissions.
- Outlet scope is enforced.
- Permission changes are audited.
- Exact role catalogue is TBD.

## 5.4.6.5 Validations

- User identity is unique.
- Role exists.
- Permission exists.
- Outlet assignment is valid.
- Deactivation does not remove historical audit records.

## 5.4.6.6 Proposed APIs

```text
GET  /api/v1/admin/users
POST /api/v1/admin/users
PATCH /api/v1/admin/users/{user_id}
POST /api/v1/admin/users/{user_id}/activate
POST /api/v1/admin/users/{user_id}/deactivate
GET  /api/v1/admin/roles
POST /api/v1/admin/roles
PATCH /api/v1/admin/roles/{role_id}
GET  /api/v1/admin/permissions
POST /api/v1/admin/users/{user_id}/outlets
```

## 5.4.6.7 Data Requirements

- Staff/Admin User.
- Role.
- Permission.
- User-role mapping.
- User-outlet mapping.
- User status.
- Audit Event.

## 5.4.6.8 Acceptance Criteria

- Admin can manage staff users.
- Roles and permissions can be assigned.
- Outlet scope is enforced.
- Deactivated users cannot perform new protected operations.
- Historical actions remain attributable.

## 5.4.6.9 TBD

- Exact role catalogue.
- Permission granularity.
- Delegated administration.
- Approval requirements for permission changes.

---

# 5.4.7 Operational & Commercial Reporting

## 5.4.7.1 Module Overview

This module provides management dashboards for commercial, operational and kitchen performance.

**BRS mapping:** Direct FR-AD-05, FR-AD-06 and FR-AD-07.

## 5.4.7.2 Required Reports

### Commercial Dashboard — FR-AD-05

- Revenue.
- Orders.
- Average Order Value (AOV).
- Channel mix.
- Cancellation rate.
- Refund rate.
- Promotion cost.

### Operational Dashboard — FR-AD-06

- Table utilisation.
- Average turn time.
- No-show rate.
- Waitlist conversion.
- Peak load.

### Kitchen Dashboard — FR-AD-07

- Prep time by item.
- Prep time by station.
- SLA breach rate.

## 5.4.7.3 Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---:|---|
| SRS-AD-RPT-01 | Report required commercial measures. | M | FR-AD-05 |
| SRS-AD-RPT-02 | Report required table/floor operational measures. | M | FR-AD-06 |
| SRS-AD-RPT-03 | Report kitchen prep-time and SLA metrics. | S | FR-AD-07 |
| SRS-AD-RPT-04 | Reports shall identify reporting period. | M | FR-AD-09 |
| SRS-AD-RPT-05 | Report results shall use governed source data and documented definitions. | M | FR-AD-05..07 |

## 5.4.7.4 Business Rules

- POS remains the financial system of record for financial reporting.
- Financial reporting must be consistent with reconciliation data.
- Kitchen prep metrics derive from recorded kitchen activity.
- Table metrics derive from reservation/floor/table activity.
- Exact calculation formulas must be agreed before UAT.

## 5.4.7.5 Validations

- Valid date range.
- Authorized outlet scope.
- Valid channel filters.
- Required source data available.
- Report aggregation job completes successfully.

## 5.4.7.6 Proposed APIs

```text
GET /api/v1/admin/reports/commercial
GET /api/v1/admin/reports/operations
GET /api/v1/admin/reports/kitchen
GET /api/v1/admin/reports/definitions
```

## 5.4.7.7 Data Requirements

- Order.
- Payment and Refund.
- Promotion usage.
- Reservation and Waitlist Entry.
- Table Event.
- Kitchen Ticket and timing.
- Outlet and Channel.

## 5.4.7.8 Error / Exception Handling

- Missing source data → indicate incomplete data rather than silently substituting values.
- Integration discrepancy → raise reconciliation/reporting exception.
- Aggregation failure → alert and retry according to operations design.
- Unsupported metric combination → validation error.

## 5.4.7.9 Acceptance Criteria

- Required dashboards are available.
- Values trace to defined source data.
- Test data produces expected calculations.
- Reconciliation-sensitive measures agree with source systems where applicable.

## 5.4.7.10 TBD

- AOV formula.
- Revenue recognition definition.
- Peak-load definition.
- Waitlist conversion formula.
- SLA breach calculation.
- Refresh frequency.

---

# 5.4.8 Guest & Loyalty Reporting

## 5.4.8.1 Module Overview

This module provides guest behavior and loyalty performance reporting.

**BRS mapping:** Direct FR-AD-08; related FR-AC and FR-LY requirements.

## 5.4.8.2 Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---:|---|
| SRS-AD-GR-01 | Report new versus repeat guests. | S | FR-AD-08 |
| SRS-AD-GR-02 | Report retention cohorts. | S | FR-AD-08 |
| SRS-AD-GR-03 | Report loyalty tier distribution. | S | FR-AD-08 |
| SRS-AD-GR-04 | Report lifetime value according to an approved calculation. | S | FR-AD-08 |
| SRS-AD-GR-05 | Respect privacy, access control and retention rules. | M | NFR-07 / NFR-16 |

## 5.4.8.3 Business Rules

- Guest reporting must use authorized data only.
- PII exposure must follow approved role/privacy rules.
- Behavioral analytics retention must not exceed 24 months under NFR-16.
- Exact LTV calculation is TBD.

## 5.4.8.4 Proposed APIs

```text
GET /api/v1/admin/reports/guests
GET /api/v1/admin/reports/loyalty
GET /api/v1/admin/reports/retention
GET /api/v1/admin/reports/guest-value
```

## 5.4.8.5 Data Requirements

- Guest.
- Order.
- Reservation.
- Loyalty Account.
- Loyalty Transaction.
- Loyalty Tier.
- Outlet and Channel.

## 5.4.8.6 Error / Exception Handling

- Incomplete guest identity → apply approved anonymous/guest treatment.
- Deleted personal data → follow approved reporting/anonymization policy.
- Missing loyalty source data → report exception, not fabricated values.

## 5.4.8.7 Acceptance Criteria

- Required guest metrics are visible to authorized users.
- Retention uses the approved cohort definition.
- Loyalty tier distribution matches source loyalty data.
- Privacy and retention controls are enforced.

## 5.4.8.8 TBD

- LTV formula.
- Cohort period.
- Anonymous order treatment.
- PII masking by role.

---

# 5.4.9 Reconciliation & Financial Reporting

## 5.4.9.1 Module Overview

This module supports reconciliation across app, POS and payment-provider settlement flows.

**BRS mapping:** Related FR-AD-05 and FR-AD-09; related payments and POS integration requirements.

The BRS requires reconciliation of app orders versus POS versus settlements on a daily and monthly basis and states that POS remains the financial system of record.

## 5.4.9.2 Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---:|---|
| SRS-AD-REC-01 | Report reconciliation status between app orders and POS records. | M | BRS reporting/integration |
| SRS-AD-REC-02 | Report reconciliation status against payment-provider settlement data. | M | BRS reporting/integration |
| SRS-AD-REC-03 | Surface financial discrepancies for investigation. | M | Integration principles |
| SRS-AD-REC-04 | Support report filters defined by the reporting framework. | M | FR-AD-09 |
| SRS-AD-REC-05 | Support spreadsheet/PDF export through the report framework. | M | FR-AD-09 |
| SRS-AD-REC-06 | Audit reconciliation and manual resolution actions. | M | FR-AD-04 |

## 5.4.9.3 Business Rules

- POS is the financial system of record.
- The application must not create a competing revenue source of truth.
- Discrepancies remain identifiable until resolved.
- Manual resolution must not silently overwrite source values.
- Reconciliation processing should be idempotent.

## 5.4.9.4 Required Reconciliation Views

- App accepted orders vs POS orders.
- Order totals vs POS totals where applicable.
- Payment authorization/capture status.
- Refund status.
- Provider settlement status.
- Tax and tip values where supported.
- Exception records.

## 5.4.9.5 Proposed APIs

```text
GET /api/v1/admin/reconciliation/orders
GET /api/v1/admin/reconciliation/payments
GET /api/v1/admin/reconciliation/refunds
GET /api/v1/admin/reconciliation/exceptions
POST /api/v1/admin/reconciliation/{reconciliation_id}/resolve
```

## 5.4.9.6 Data Requirements

- Order.
- POS Reference.
- Payment.
- Refund.
- Settlement Record.
- Reconciliation Run.
- Reconciliation Exception.
- Resolution Event.
- Audit Event.

## 5.4.9.7 Error / Exception Handling

- Missing POS record → discrepancy.
- Missing settlement record → discrepancy.
- Amount mismatch → discrepancy.
- Duplicate record → duplicate exception.
- External system unavailable → mark run incomplete and retry.
- Manual resolution → require named user and reason.

## 5.4.9.8 Acceptance Criteria

- Known test mismatches are identified correctly.
- Source values remain traceable.
- Daily/monthly reconciliation can be reviewed.
- Financial exceptions are auditable.
- Reconciliation reports export successfully.

## 5.4.9.9 TBD

- Exact matching keys.
- Rounding tolerances.
- Settlement file/API format.
- Resolution workflow.
- Finance approval rules.

---

# 5.4.10 Content Publishing & Communication

## 5.4.10.1 Module Overview

This module manages business-facing content publishing and push-campaign content.

**BRS mapping:** Direct FR-AD-10; related FR-NT-04 and FR-NT-05.

The BRS names banners, chef stories, event listings and push campaign content. Marketing notifications must respect consent, quiet hours and frequency caps.

## 5.4.10.2 Functional Requirements

| ID | Requirement | Priority | Source |
|---|---|---:|---|
| SRS-AD-CONT-01 | Create and manage banners. | S | FR-AD-10 |
| SRS-AD-CONT-02 | Create and manage chef stories. | S | FR-AD-10 |
| SRS-AD-CONT-03 | Create and manage event listings. | S | FR-AD-10 |
| SRS-AD-CONT-04 | Manage push campaign content. | S | FR-AD-10 |
| SRS-AD-CONT-05 | Send marketing push campaigns only where consent permits. | M | FR-NT-04 |
| SRS-AD-CONT-06 | Respect marketing quiet hours and frequency caps. | M | FR-NT-04 |
| SRS-AD-CONT-07 | Attribute content changes to named users. | M | FR-AD-04 |
| SRS-AD-CONT-08 | Supported content changes shall not require a mobile application release. | M | NFR-14 |

## 5.4.10.3 Business Rules

- Marketing communication requires appropriate consent.
- Quiet hours must be honored.
- Frequency limits must be applied.
- Published content must use authorized outlet/channel scope.
- Exact content approval workflow is TBD.

## 5.4.10.4 Validations

- Required content exists.
- Schedule is valid where supported.
- Target audience is valid.
- Marketing audience is consent-eligible.
- Outlet/channel scope is authorized.
- Unsupported format is rejected.

## 5.4.10.5 Proposed APIs

```text
GET  /api/v1/admin/content
POST /api/v1/admin/content/banners
POST /api/v1/admin/content/chef-stories
POST /api/v1/admin/content/events
PATCH /api/v1/admin/content/{content_id}
POST /api/v1/admin/content/{content_id}/publish
GET  /api/v1/admin/campaigns/push
POST /api/v1/admin/campaigns/push
```

## 5.4.10.6 Data Requirements

- Content Item.
- Content Type.
- Banner.
- Chef Story.
- Event.
- Campaign.
- Audience/Segment.
- Schedule.
- Consent Reference.
- Publication Status.
- Audit Event.

## 5.4.10.7 Errors / Exceptions

- Invalid schedule → reject.
- Missing consent eligibility → do not send marketing message.
- Publication failure → retain previous published content and alert.
- Frequency-limit breach → prevent send.

## 5.4.10.8 Acceptance Criteria

- Admin can create each BRS-defined content type.
- Published content reaches the configured destination.
- Marketing campaigns respect consent, quiet hours and frequency caps.
- Content changes are audited.
- Business content updates do not require mobile release.

## 5.4.10.9 TBD

- Content approval stages.
- Media constraints.
- Rich-text capability.
- Push segmentation.
- Campaign analytics.

---

# 5.4.11 Admin Console Cross-Module Requirements

## 5.4.11.1 Common Security

All Admin Console modules shall apply authenticated access, RBAC, least privilege, outlet/location scope and auditability.

BRS NFR-05 requires encryption in transit and at rest, OTP authentication with rate limiting at the platform level, and penetration testing before launch and annually.

## 5.4.11.2 Common Auditability

Administrative changes should record, at minimum:

- actor/user ID;
- action;
- target entity and ID;
- outlet scope;
- timestamp;
- result;
- change summary where applicable;
- request/correlation ID where supported.

The exact audit schema is a technical design decision.

## 5.4.11.3 Common Outlet Scope

Configuration and reporting must be outlet-aware because the BRS specifies configuration per outlet and reporting by outlet.

The project direction includes multi-restaurant/multi-location support, but the exact tenant hierarchy and inheritance rules are not fully specified by the BRS and remain an SRS/open-design item.

## 5.4.11.4 Common Real-Time Behavior

Where an administrative or operational change must immediately affect connected applications, the backend shall propagate the change through the approved real-time mechanism.

BRS examples include Staff item-unavailable changes reaching the Guest App immediately and kitchen capacity/promise-time signals reaching the Guest App.

## 5.4.11.5 Business Availability

Business users must be able to change supported menu, pricing, policy and content without a software release, as required by NFR-14.

## 5.4.11.6 Observability

Admin services should provide structured logs, error metrics, failed-operation alerts, audit events and correlation IDs.

BRS NFR-13 requires errors, crashes, payment failures and integration faults to be logged, monitored and alerted with defined ownership.

---

# 5.4.12 Admin Console Integration Requirements

## 5.4.12.1 POS

**Purpose:** order data, financial system-of-record data and reconciliation.  
**Direction:** Two-way.  
**Criticality:** Critical.

The POS remains the financial system of record.

## 5.4.12.2 Payment Service Provider

**Purpose:** payment status, settlement and refunds.  
**Direction:** Two-way.  
**Criticality:** Critical.

Card data must not be stored by Sacred Spice; card handling is delegated to the certified provider.

## 5.4.12.3 KDS

**Purpose:** operational status, prep-time data and capacity signals.  
**Direction:** Two-way.  
**Criticality:** Critical.

## 5.4.12.4 Delivery Logistics

**Purpose:** dispatch and delivery operational reporting.  
**Direction:** Two-way.  
**Criticality:** High.

## 5.4.12.5 Table/Floor Management

**Purpose:** live availability, seating status and configuration.  
**Direction:** Two-way.  
**Criticality:** High.

## 5.4.12.6 Notification Services

**Purpose:** transactional and marketing communication.  
**Direction:** Outbound.  
**Criticality:** High.

## 5.4.12.7 Accounting

**Purpose:** daily sales, tax and settlement postings.  
**Direction:** Outbound.  
**Criticality:** Medium.

## 5.4.12.8 CRM / Marketing Automation

**Purpose:** guest segments, campaign execution and attribution.  
**Direction:** Two-way.  
**Criticality:** Medium.

## 5.4.12.9 Analytics Platform

**Purpose:** product/funnel analytics and retention cohorts.  
**Direction:** Outbound.  
**Criticality:** Medium.

---

# 5.4.13 Non-Functional Requirements for Admin Console

The Admin Console is subject to applicable platform NFRs from the BRS.

| NFR | Application to Admin Console |
|---|---|
| NFR-02 | Platform availability objective applies during the applicable operating window. |
| NFR-03 | Reporting/configuration workloads must not block order-processing workloads. |
| NFR-04 | Critical data changes must be durable and safe against accidental duplication. |
| NFR-05 | Authentication, encryption, rate limiting and security testing apply. |
| NFR-07 | Guest-related data must follow lawful-basis, minimization, deletion and export rules. |
| NFR-11 | Dependent operational capabilities should degrade gracefully during short network/integration failures. |
| NFR-13 | Errors and integration faults must be monitored and alerted. |
| NFR-14 | Business users must change supported menu/pricing/policy/content without release. |
| NFR-15 | Severity 1 incident response targets apply during trading hours. |
| NFR-16 | Transactional and behavioral data retention rules apply. |

---

# 5.4.14 Admin Console Data Model — Conceptual

```text
Outlet
 ├── Menu
 │    ├── Category
 │    ├── Menu Item
 │    ├── Modifier Group
 │    ├── Modifier Option
 │    └── Combo
 │
 ├── Reservation Configuration
 │    ├── Floor Plan
 │    ├── Table
 │    ├── Capacity Rule
 │    ├── Operating Hours
 │    └── Blackout Period
 │
 ├── Promotions
 │    ├── Promotion Rule
 │    ├── Usage Limit
 │    ├── Stacking Rule
 │    └── Campaign
 │
 ├── Loyalty
 │    ├── Earning Rule
 │    ├── Reward
 │    ├── Tier
 │    └── Adjustment
 │
 ├── Users
 │    ├── Role
 │    ├── Permission
 │    └── User Outlet Mapping
 │
 ├── Content
 │    ├── Banner
 │    ├── Chef Story
 │    ├── Event
 │    └── Push Campaign
 │
 └── Reporting / Reconciliation
      ├── Report Run
      ├── Reconciliation Run
      └── Reconciliation Exception
```

This is a conceptual SRS model, not the final database schema.

---

# 5.4.15 API Design Requirements

## API Principles

- REST-based and versioned.
- Authentication on protected endpoints.
- Authorization on every protected operation.
- Outlet scope on applicable resources.
- Idempotency for critical write operations where duplicate requests are possible.
- Consistent validation/error structure.
- Correlation IDs for traceability.
- Audit events for administrative mutations.

## Example Resource Groups

```text
/api/v1/admin/auth
/api/v1/admin/users
/api/v1/admin/roles
/api/v1/admin/outlets
/api/v1/admin/menu
/api/v1/admin/reservations
/api/v1/admin/floor-plan
/api/v1/admin/promotions
/api/v1/admin/loyalty
/api/v1/admin/reports
/api/v1/admin/reconciliation
/api/v1/admin/content
```

Exact API contracts will be defined in the API/OpenAPI design document.

---

# 5.4.16 Error Handling Standard

All Admin Console APIs should return structured errors containing, where applicable:

```text
code
message
details
field_errors
request_id
timestamp
```

Common categories:

- Authentication failure.
- Authorization failure.
- Validation failure.
- Resource not found.
- Conflict/concurrent update.
- External integration failure.
- Business-rule violation.
- Internal server error.

The UI should display business-friendly messages while logs retain technical diagnostics.

---

# 5.4.17 Audit Requirements

Administrative changes that should be auditable include:

- user/role/permission changes;
- menu changes;
- pricing changes;
- availability changes;
- reservation policy changes;
- floor-plan changes;
- capacity changes;
- promotion creation/update/approval/publication;
- loyalty rule changes;
- manual loyalty adjustments;
- content publication;
- reconciliation resolution;
- other privileged business configuration changes.

Normal entity deletion must not silently remove historical audit evidence unless an approved retention/legal policy requires archival or anonymization.

---

# 5.4.18 Reporting and Export Requirements

The BRS requires reports to be filterable by:

- date range;
- outlet;
- channel;

and exportable to:

- spreadsheet;
- PDF.

Exports should preserve the report filters and reporting period so results can be reproduced and reviewed.

Exact export implementation is TBD at technical-design stage.

---

# 5.4.19 Admin Console Acceptance Criteria

### AC-AD-01 — Access Control
Authorized users can access permitted Admin Console functions only.

### AC-AD-02 — Least Privilege
Unauthorized functions are denied according to the approved permission model.

### AC-AD-03 — Menu Administration
Authorized admin can manage menu, prices, modifiers, combos, availability and scheduling for an outlet.

### AC-AD-04 — Reservation Configuration
Authorized admin can configure reservation policy, floor plan, capacity, operating hours and blackout dates.

### AC-AD-05 — Promotions
Authorized admin can create/schedule approved promotions and campaigns with configured controls.

### AC-AD-06 — Loyalty
Authorized admin can configure agreed loyalty rules, and authorized manual adjustments require a reason and audit record.

### AC-AD-07 — Reporting
Required commercial and operational dashboards produce figures from defined source data.

### AC-AD-08 — Kitchen Reporting
Kitchen reporting can expose prep time by item/station and SLA breach rate when corresponding data is available.

### AC-AD-09 — Guest Reporting
Guest/loyalty metrics are visible according to approved access and privacy rules.

### AC-AD-10 — Reconciliation
App/POS/payment reconciliation exceptions can be identified and reviewed.

### AC-AD-11 — Export
Required reports can be filtered by date range, outlet and channel and exported to spreadsheet/PDF.

### AC-AD-12 — Content Publishing
Banners, chef stories, events and push campaign content can be managed as defined.

### AC-AD-13 — Audit
Administrative actions are traceable to named users.

### AC-AD-14 — Maintainability
Supported menu, pricing, policy and content changes can be performed without a mobile application release.

### AC-AD-15 — Phase 1 Acceptance
Admin-related M requirements are implemented, tested and signed off as part of overall Phase 1 acceptance. The BRS requires demonstration in a production-equivalent environment and validation during a two-week pilot at one outlet.

---

# 5.4.20 Admin Console Dependencies

- Backend API services.
- Authentication/authorization services.
- Persistent database.
- POS integration.
- Payment-provider integration.
- KDS integration.
- Table/floor-plan capability.
- Notification services.
- Analytics/reporting pipeline.
- Finalized menu content.
- Approved loyalty economics.
- Approved promotion economics.
- Legal/privacy policy.
- Staff roles and permission decisions.

The BRS also assumes sufficient tablet hardware/connectivity, staff training and a floor champion per shift before launch.

---

# 5.4.21 Admin Console Out-of-Scope Boundaries

The Admin Console does not expand Phase 1 into the following BRS out-of-scope domains:

- replacement of POS;
- replacement of accounting;
- full inventory/procurement;
- recipe costing;
- payroll;
- HR;
- in-house courier fleet management;
- full franchise onboarding;
- multi-brand tenancy;
- public marketing website;
- kiosk management;
- smartwatch/in-car applications.

Any change to these boundaries must follow formal change control.

---

# 5.4.22 Open Decisions / TBD Register

| ID | Decision | Owner / Stakeholder |
|---|---|---|
| TBD-AD-01 | Final Admin authentication method | IT / Security |
| TBD-AD-02 | Admin roles and permission matrix | Product / Operations |
| TBD-AD-03 | Outlet/multi-location hierarchy | Product / Architecture |
| TBD-AD-04 | Menu draft/publish workflow | Product / Operations |
| TBD-AD-05 | Menu versioning and rollback | Architecture / Product |
| TBD-AD-06 | Floor-plan editor behavior | Operations / UX |
| TBD-AD-07 | Promotion approval stages | Marketing / Finance |
| TBD-AD-08 | Promotion margin calculation | Finance |
| TBD-AD-09 | Loyalty tier design | Marketing / Finance |
| TBD-AD-10 | Loyalty effective-date behavior | Product / Finance |
| TBD-AD-11 | LTV calculation | Product / Finance |
| TBD-AD-12 | Reporting refresh frequency | Product / IT |
| TBD-AD-13 | Revenue/AOV definitions | Finance |
| TBD-AD-14 | Reconciliation matching keys/tolerances | Finance / IT |
| TBD-AD-15 | Content approval workflow | Marketing |
| TBD-AD-16 | Report export implementation | IT |
| TBD-AD-17 | Push segmentation model | Marketing / IT |
| TBD-AD-18 | Emergency privileged-access process | IT / Security |

---

# 5.4.23 Implementation Notes

1. The Admin Console is a business-configuration layer over the core platform, not a separate financial source of truth.
2. Configuration entities should be outlet-aware from the data-model level.
3. Critical writes should support auditability and, where appropriate, concurrency/version checks.
4. Reporting definitions should be agreed before UAT so business and engineering use identical formulas.
5. Reconciliation should preserve source-system references and must not silently overwrite source values.
6. Real-time changes should use the approved event/WebSocket mechanism where immediate propagation is required.
7. The BRS does not prescribe screen designs, database tables, API payloads, frontend libraries or exact workflow UX. These remain solution-design decisions.

---

# 5.4.24 BRS Traceability Summary

| Admin SRS Module | Direct BRS | Related BRS |
|---|---|---|
| 5.4.1 Admin Authentication & Access Control | FR-AD-04 | NFR-05, NFR-13 |
| 5.4.2 Menu, Pricing & Availability | FR-AD-01 | FR-MN-01..10, FR-ST-07 |
| 5.4.3 Reservation, Floor Plan & Capacity | FR-AD-02 | FR-RS-01..10, FR-ST-01..02 |
| 5.4.4 Promotions & Campaign Management | FR-AD-03 | FR-LY-04..05, FR-NT-04 |
| 5.4.5 Loyalty Configuration | FR-AD-03 | FR-LY-01..08 |
| 5.4.6 Staff Roles, Permissions & Audit | FR-AD-04 | FR-ST-08 |
| 5.4.7 Operational & Commercial Reporting | FR-AD-05..07 | BRS reporting/data requirements |
| 5.4.8 Guest & Loyalty Reporting | FR-AD-08 | FR-AC, FR-LY |
| 5.4.9 Reconciliation & Financial Reporting | Related FR-AD-05/09 | POS/PSP/payment requirements |
| 5.4.10 Content Publishing & Communication | FR-AD-10 | FR-NT-04..05 |

---

# 5.4.25 Completion Checklist

## Functional

- [ ] Admin authentication implemented.
- [ ] RBAC implemented.
- [ ] Outlet scope implemented.
- [ ] Menu administration implemented.
- [ ] Pricing administration implemented.
- [ ] Modifier administration implemented.
- [ ] Combo management implemented.
- [ ] Availability/scheduling implemented.
- [ ] Reservation/floor/capacity configuration implemented.
- [ ] Promotion/campaign configuration implemented.
- [ ] Loyalty configuration implemented.
- [ ] Staff roles/permissions implemented.
- [ ] Commercial reporting implemented.
- [ ] Operational reporting implemented.
- [ ] Kitchen reporting implemented where required data is available.
- [ ] Guest/loyalty reporting implemented.
- [ ] Reconciliation reporting implemented.
- [ ] Spreadsheet/PDF export implemented.
- [ ] Content publishing implemented.
- [ ] Audit trail implemented.

## Security

- [ ] Authentication tested.
- [ ] Authorization tested.
- [ ] Least-privilege checks tested.
- [ ] Outlet-scope checks tested.
- [ ] Privileged actions audited.
- [ ] Sensitive authentication data excluded from logs.
- [ ] Security testing completed.

## Integration

- [ ] POS reporting/reconciliation validated.
- [ ] PSP settlement/reconciliation validated.
- [ ] KDS operational metrics validated.
- [ ] Table/floor integration validated.
- [ ] Notification/campaign integration validated.
- [ ] Analytics/reporting flow validated.

## Acceptance

- [ ] Applicable M requirements tested.
- [ ] Required stakeholder sign-off obtained.
- [ ] Reports match source data.
- [ ] Export tested.
- [ ] Audit trail tested.
- [ ] Production-equivalent environment validated.
- [ ] Two-week pilot observations incorporated.
- [ ] No unresolved high-severity findings for Phase 1 acceptance.

---

# 5.4.26 Source Reference

Primary source:

**Sacred Spice Restaurant — Business Requirement Specification (BRS) v1.0, dated 15 September 2026.**

Relevant BRS areas used:

- §5.1.4 Admin Console scope
- §7 Business Process Flows
- §8.11 Admin Console and Reporting
- §9 Non-Functional Requirements
- §10 Integration Requirements
- §11 Data and Reporting Requirements
- §12 Assumptions, Dependencies and Constraints
- §13 Risks and Mitigation
- §14 Acceptance Criteria
- §15 Change Control and Governance

**Source fidelity rule:** Where the BRS does not define an exact implementation detail, this SRS marks the item as **TBD**, **proposed**, or a technical/design decision rather than presenting it as an established BRS requirement.
