# SRS — 5.1 Guest App
## 5.1.1 Authentication & Guest Account

This section converts the BRS requirements into **developer-ready requirements**. I am keeping the BRS priorities and terminology unchanged rather than adding unsupported behavior. fileciteturn0file0L1-L12

---

## 5.1.1.1 Module Overview

The Guest Account module provides identity and profile management for customers using the Sacred Spice Guest App.

The module must support:

- Registered guests
- Guest checkout
- Guest profile
- Order history
- Reservation history
- Reordering
- Marketing consent management
- Account deletion request

---

## 5.1.1.2 BRS Requirements Mapping

| SRS ID | BRS ID | Requirement | Priority |
|---|---|---|---|
| GA-AUTH-001 | FR-AC-01 | Registration/login using mobile + OTP or email; optional social identity linking | M |
| GA-AUTH-002 | FR-AC-02 | Guest checkout and later order claiming | M |
| GA-AUTH-003 | FR-ACT-001 | Guest profile management | M |
| GA-AUTH-004 | FR-AC-04 | Order/reservation history and reorder | M |
| GA-AUTH-005 | FR-AC-05 | Independent marketing consent management | M |
| GA-AUTH-006 | FR-AC-06 | Account/data deletion request | M |
| GA-AUTH-007 | FR-AC-07 | Family/household shared loyalty balance | C |

The source BRS includes FR-AC-07 as a **Could** requirement, while the others above are marked **Must** for MVP. fileciteturn0file0L1-L12

---

# 5.1.1.3 User Flows

### Registered Guest

```text
Open App
   ↓
Login / Register
   ↓
Mobile + OTP OR Email
   ↓
Authenticated
   ↓
Guest Profile / App
```

### Guest Checkout

```text
Guest
 ↓
Browse Menu
 ↓
Add Items
 ↓
Checkout
 ↓
Purchase
 ↓
Order Stored
 ↓
Later Create Account
 ↓
Claim Eligible Order
```

The BRS explicitly requires guests to be able to purchase without registration and later claim the order into a new account. fileciteturn0file0L1-L12

### Account Deletion

```text
Guest
 ↓
Account Settings
 ↓
Request Deletion
 ↓
System Processes Request
 ↓
Personal Data Deletion
```

The BRS specifies that deletion is subject to statutory retention of transaction records. fileciteturn0file0L1-L12

---

# 5.1.1.4 Functional Requirements

### GA-AUTH-001 — Registration and Login

The system shall allow guests to register/login using:

- Mobile number + one-time password
- Email

The system may support social identity linking because the BRS identifies it as optional within this requirement.

**Priority:** Must

---

### GA-AUTH-002 — Guest Checkout

The system shall allow an unregistered guest to complete an eligible purchase without creating an account.

The system shall retain sufficient order information to support a later account-claim process.

**Priority:** Must

---

### GA-AUTH-003 — Guest Profile

The guest shall be able to maintain:

```text
Name
Contact Details
Saved Addresses
Dietary Preferences
Allergens
Spice Preference
Important Dates
```

**Priority:** Must

These profile fields are explicitly listed in the BRS. fileciteturn0file0L1-L12

---

### GA-AUTH-004 — Order and Reservation History

The guest shall be able to:

- View completed/past orders
- View reservation history
- Reorder a previous order

**Priority:** Must

---

### GA-AUTH-005 — Marketing Consent

The guest shall be able to manage consent independently for:

```text
Email
SMS
Push Notifications
```

The guest must also be able to withdraw consent.

**Priority:** Must

---

### GA-AUTH-006 — Account Deletion

The guest shall be able to submit a request to delete their account and personal data.

Transaction records that must be retained for statutory reasons shall remain subject to the applicable retention requirement.

**Priority:** Must

---

### GA-AUTH-007 — Family / Household Loyalty

The system may allow family members or a household to share a loyalty balance.

**Priority:** Could

This should therefore **not be treated as a Phase 1 implementation blocker**. fileciteturn0file0L1-L12

---

# 5.1.1.5 Business Rules

### BR-GA-001
A guest may place an eligible order without creating an account.

### BR-GA-002
Only valid authentication credentials/OTP verification may create an authenticated guest session.

### BR-GA-003
Marketing consent must be maintained separately for email, SMS and push.

### BR-GA-004
Withdrawing marketing consent must not prevent the guest from continuing to use transactional services.

### BR-GA-005
Account deletion must not remove transaction records that are required to be retained.

### BR-GA-006
Order history and reservation history must be associated with the authenticated guest account.

These rules translate the behavior stated in the BRS; detailed technical retention periods and identity-matching rules are still to be defined.

---

# 5.1.1.6 Validation Requirements

The system shall validate:

### Registration

```text
Mobile number / Email
        ↓
Required
        ↓
Valid format
        ↓
OTP / authentication verification
```

### Profile

Required validation should be applied to the fields that the business defines as mandatory.

### Consent

The system shall record the guest's consent state separately for:

- Email
- SMS
- Push

### Deletion

The system shall verify that the request belongs to the authenticated guest.

---

# 5.1.1.7 API Requirements

These are **proposed SRS API contracts**, not APIs stated in the BRS. We are defining them now for development.

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/refresh

GET    /api/v1/guest/profile
PATCH  /api/v1/guest/profile

GET    /api/v1/guest/orders
GET    /api/v1/guest/reservations

POST   /api/v1/guest/orders/{order_id}/claim

GET    /api/v1/guest/consents
PATCH  /api/v1/guest/consents

POST   /api/v1/guest/account/deletion-request
```

We should label these as **SRS design decisions**, not BRS requirements.

---

# 5.1.1.8 Data Requirements

The module will require at least:

```text
Guest
├── guest_id
├── name
├── email
├── mobile
├── account_status
├── created_at
└── updated_at

Guest Address
├── address_id
├── guest_id
├── address_data
└── status

Guest Preference
├── guest_id
├── dietary_preferences
├── allergens
├── spice_preference
└── important_dates

Guest Consent
├── guest_id
├── email_consent
├── sms_consent
├── push_consent
└── updated_at
```

The BRS specifically identifies guest identity, contacts, addresses, dietary and spice preferences, consents and tier as core guest data. fileciteturn0file0L705-L713

---

# 5.1.1.9 Error / Exception Handling

The software should define behavior for at least:

```text
Invalid OTP
Expired OTP
Incorrect email/mobile
Duplicate account
Authentication failure
Session expiration
Invalid deletion request
Guest order claim failure
Order already claimed
```

The **exact user-facing messages and retry limits are TBD** and should be finalized during technical design.

---

# 5.1.1.10 Security Requirements

Because this is a customer identity module:

- Authentication must be protected against abuse.
- OTP requests must be rate-limited.
- Guest data must only be accessible to the authenticated/authorized guest.
- Sensitive personal information must not be exposed in client logs.
- Authentication and account actions should be auditable.

The BRS explicitly requires OTP authentication with rate limiting, encrypted data, privacy controls, and account deletion/export support. fileciteturn0file0L622-L653

---

# 5.1.1.11 Acceptance Criteria

The module is acceptable when:

```text
✓ Guest can register with mobile + OTP
✓ Guest can authenticate with email
✓ Guest can complete eligible guest checkout
✓ Guest can later claim an eligible order
✓ Guest can update profile information
✓ Guest can view order history
✓ Guest can view reservation history
✓ Guest can reorder a previous order
✓ Guest can independently control email/SMS/push marketing consent
✓ Guest can withdraw consent
✓ Guest can request account/data deletion
✓ Required transaction records remain retained where legally required
```

The BRS's overall Phase 1 acceptance requires all **Must** requirements to be implemented, tested and signed off. fileciteturn3file4L1-L12

---

# 5.1.1.12 Dependencies

```text
Authentication / Identity Service
Customer Service
Order Service
Reservation Service
Notification Service
Database
Privacy / Legal Policy
```

---

# 5.1.1.13 Open / TBD Decisions

We should **not invent these yet**:

```text
TBD-01 — OTP provider
TBD-02 — Email authentication provider, if external
TBD-03 — Social identity providers
TBD-04 — Exact guest-order claiming rules
TBD-05 — Account deletion processing SLA
TBD-06 — Required profile fields
TBD-07 — U.S.-specific privacy/legal wording
```

---

## Module Status

```text
Guest App
└── Authentication & Guest Account
    ├── Requirements: Defined
    ├── User flows: Defined
    ├── API contract: Initial
    ├── Data model: Initial
    ├── Acceptance criteria: Defined
    └── External dependencies: TBD
```

### Next SRS module

We should continue with:

**5.1.2 Guest App → Restaurant & Location Selection**

because that naturally follows authentication:

```text
Login
 ↓
Select Restaurant
 ↓
Select Location
 ↓
View Location-specific Experience
```

This also lets us properly connect your **multi-restaurant / multi-location requirement** to the Guest App before moving into Menu.

--------------------------------------------------------------
5.1.2 Restaurant & Location Selection

5.1.2.1 Module Overview

The Restaurant & Location Selection module allows guests to identify and select the
restaurant/outlet they want to interact with before continuing with reservation, menu,
pickup, delivery, or other outlet-specific journeys.

The selected outlet acts as the operating context for subsequent Guest App flows.

The module shall support:
- Restaurant / outlet discovery
- Manual outlet selection
- Location-based nearby outlet discovery, subject to location permission
- Outlet details
- Outlet operating status and operating hours
- Outlet-specific service availability
- Selection persistence during the guest session
- Passing the selected outlet context to reservation and ordering flows

BRS Alignment:
The BRS includes an outlet locator in the Guest App scope and requires guests to select
an outlet for reservations. The ordering flow also requires serviceability validation against
the selected outlet and its operating hours.


5.1.2.2 BRS Requirement Mapping

| SRS ID | BRS Reference | Requirement | Priority | Source |
|--------|---------------|-------------|----------|--------|
| SRS-GR-01 | BRS Scope 5.1.1 | Guest App provides an outlet locator | M | BRS |
| SRS-GR-02 | FR-RS-01 | Guest selects an outlet when making a reservation | M | BRS |
| SRS-GR-03 | FR-RS-02 | Reservation availability is calculated for the selected outlet | M | BRS |
| SRS-GR-04 | FR-OR-01 | Guest selects delivery, pickup, or dine-in context associated with an outlet | M | BRS |
| SRS-GR-05 | FR-OR-02 | Delivery serviceability is validated against the selected outlet and its operating hours | M | BRS |
| SRS-GR-06 | BRS 7.2 | Delivery or pickup selection validates serviceability by address or outlet | M | BRS |
| SRS-GR-07 | FR-AD-01 / FR-AD-02 | Outlet-specific menu, availability, operating hours and configuration are supported | M | BRS |

Note:
Restaurant discovery, nearby sorting, GPS permission handling, exact outlet-card fields,
and restaurant-selection UI behavior are not explicitly defined in the BRS and therefore
remain SRS-level design decisions / TBDs.


5.1.2.3 User Flow

Primary Flow – Manual Outlet Selection

1. Guest opens the Guest App.
2. Guest enters the Restaurant / Location Selection screen.
3. System displays available restaurants/outlets.
4. Guest searches or selects an outlet.
5. System displays outlet details.
6. Guest selects the required outlet.
7. System stores the selected outlet as the current outlet context.
8. Guest continues to menu, reservation, pickup, or delivery flow.
9. The selected outlet is used for subsequent outlet-specific operations.

Location-Based Flow

1. Guest opens the Restaurant / Location Selection screen.
2. App may request device location permission.
3. If permission is granted, the system obtains the guest's location.
4. System retrieves nearby available outlets.
5. Guest selects an outlet.
6. Selected outlet becomes the current outlet context.
7. Guest continues with the selected service.

Location Permission Denied

1. Guest denies location permission.
2. App shall not block the guest from using the outlet locator.
3. Guest can manually search or select an outlet.
4. Selected outlet becomes the current outlet context.

Reservation Flow

1. Guest selects outlet.
2. Guest selects date.
3. Guest selects time.
4. Guest selects party size.
5. System checks outlet-specific reservation availability.
6. Available slots or alternatives are displayed.
7. Guest continues with reservation.

Ordering Flow

1. Guest selects outlet.
2. Guest selects delivery or pickup.
3. System determines applicable outlet services.
4. For delivery, serviceability is validated.
5. Outlet operating hours are validated.
6. Available ordering options are displayed.
7. Guest continues to menu and cart.

Note:
The BRS explicitly requires reservation selection by outlet and ordering validation by
outlet/serviceability. The exact first-launch experience is not defined in the BRS.


5.1.2.4 Functional Requirements

SRS-GR-01 – Outlet Listing

The system shall retrieve and display available restaurants/outlets.

Each outlet record shall have a unique identifier.

Suggested outlet information:
- Restaurant / outlet name
- Address
- Operating hours
- Current operating status
- Available services

The exact required display fields are TBD and must be confirmed during UI/UX validation.


SRS-GR-02 – Outlet Search

The Guest App shall allow the guest to search available restaurants/outlets.

Search behavior, matching fields, and sorting rules are TBD.


SRS-GR-03 – Outlet Selection

The Guest App shall allow the guest to select one outlet.

The selected outlet shall be stored as the active outlet context for the current journey/session.


SRS-GR-04 – Outlet Details

The Guest App shall display outlet information sufficient for the guest to identify and
select the required location.

Exact outlet-detail fields are TBD.


SRS-GR-05 – Nearby Outlet Discovery

The system shall support location-based outlet discovery where location access is available.

Nearby ordering and distance calculation logic are TBD.


SRS-GR-06 – Manual Selection Without Location

The guest shall be able to select an outlet manually when device location is unavailable,
denied, disabled, or not used.


SRS-GR-07 – Outlet Operating Hours

The system shall provide outlet operating-hour information required for reservation and
ordering validation.

Ordering shall not offer services outside applicable outlet operating hours.


SRS-GR-08 – Outlet Service Availability

The system shall determine whether the selected outlet supports the requested service,
such as:
- Pickup
- Delivery
- Reservation
- Dine-in

Service availability shall be configurable by outlet.

Exact service configuration is an SRS technical/business decision and must be confirmed.


SRS-GR-09 – Reservation Outlet Context

The selected outlet shall be passed to the reservation process.

The reservation availability check shall use the selected outlet as part of the availability
calculation.


SRS-GR-10 – Ordering Outlet Context

The selected outlet shall be passed to the ordering flow.

For delivery ordering, the system shall validate serviceability against the selected outlet,
defined delivery zones, minimum order value, and outlet operating hours.


SRS-GR-11 – Outlet Context Persistence

The currently selected outlet shall remain available while the guest moves through related
screens in the same flow.

The system shall prevent accidental loss of outlet context.


SRS-GR-12 – Outlet Unavailable

If an outlet is unavailable for a requested service, the system shall clearly indicate that
the service cannot currently be used and shall provide the guest with an appropriate
alternative selection path.

Exact alternative behavior is TBD.


SRS-GR-13 – Outlet Change

The guest shall be able to change the selected outlet before completing a reservation
or order.

The system shall revalidate outlet-dependent information after an outlet change.


SRS-GR-14 – Outlet-Specific Data

Outlet-dependent information such as menu availability, reservation availability,
operating hours, and delivery serviceability shall be evaluated using the selected outlet.


5.1.2.5 Business Rules

BR-GR-01
A reservation cannot be evaluated without a selected outlet.

BR-GR-02
Reservation availability shall be calculated against the selected outlet's live floor plan,
service duration assumptions, and configured capacity limits.

BR-GR-03
Delivery serviceability shall be evaluated against the selected outlet.

BR-GR-04
Delivery eligibility shall consider defined delivery zones, minimum order value, and
outlet operating hours.

BR-GR-05
An outlet selection shall remain associated with the current reservation or order journey
until the guest changes it.

BR-GR-06
Changing the outlet shall trigger revalidation of outlet-dependent data.

BR-GR-07
The Guest App shall provide a manual outlet-selection path when location-based
discovery cannot be used.

BR-GR-08
Outlet-specific availability must reflect operational configuration maintained by the
administration system.

BR-GR-09
The platform must not assume that every outlet supports every service.

BR-GR-10
The selected outlet identifier must be included in relevant backend requests so that
reservation and ordering operations are associated with the correct outlet.


5.1.2.6 Validations

Validation 1 – Outlet Required

Condition:
Guest attempts to continue without selecting an outlet.

Expected:
System prevents continuation where outlet selection is required and displays a clear
validation message.

Validation 2 – Outlet No Longer Available

Condition:
Previously selected outlet becomes unavailable.

Expected:
System refreshes outlet status and requests the guest to select another available outlet
where applicable.

Validation 3 – Delivery Outside Service Area

Condition:
Guest address is outside the selected outlet's delivery zone.

Expected:
System prevents delivery checkout and informs the guest that delivery is not available
for the selected address.

Validation 4 – Delivery Outside Operating Hours

Condition:
Guest attempts delivery ordering outside the selected outlet's configured operating hours.

Expected:
System does not offer an invalid delivery slot.

Validation 5 – Reservation Slot Unavailable

Condition:
Requested reservation slot is unavailable.

Expected:
System displays available alternatives according to reservation rules.

Validation 6 – Outlet Changed During Flow

Condition:
Guest changes the outlet after viewing outlet-specific data.

Expected:
System refreshes all outlet-dependent data before continuing.


5.1.2.7 Proposed API Requirements

The following are proposed SRS-level API contracts for implementation.
They are not explicitly defined in the BRS and should be reviewed during API design.

GET /api/v1/restaurants

Purpose:
Retrieve available restaurants / outlets.

Response:
- restaurant_id
- outlet_id
- name
- address
- operating_hours
- services
- status

GET /api/v1/restaurants/{outlet_id}

Purpose:
Retrieve details for a specific outlet.

GET /api/v1/restaurants/nearby

Purpose:
Retrieve nearby outlets based on guest location.

Suggested query parameters:
- latitude
- longitude
- radius

GET /api/v1/restaurants/{outlet_id}/services

Purpose:
Retrieve services available for the selected outlet.

GET /api/v1/restaurants/{outlet_id}/hours

Purpose:
Retrieve operating hours and applicable service hours.

GET /api/v1/restaurants/{outlet_id}/availability

Purpose:
Return outlet-level availability required by reservation/order flows.

POST /api/v1/context/outlet

Purpose:
Set or update the current outlet context for an authenticated/session guest.

POST /api/v1/delivery/serviceability

Purpose:
Validate whether a guest address can be served by the selected outlet.

Important:
Final API naming, request/response schema, pagination, authentication requirements,
and versioning shall be finalized in the Backend/API Architecture section.


5.1.2.8 Data Requirements

Restaurant

Suggested fields:
- restaurant_id
- name
- status
- tenant_id

Outlet

Suggested fields:
- outlet_id
- restaurant_id
- name
- address
- latitude
- longitude
- phone
- operating_hours
- timezone
- service_configuration
- status

Outlet Service Configuration

Suggested fields:
- outlet_id
- delivery_enabled
- pickup_enabled
- reservation_enabled
- dine_in_enabled
- service_start_time
- service_end_time

Guest Outlet Context

Suggested fields:
- guest/session identifier
- selected restaurant_id
- selected outlet_id
- selection timestamp

BRS Data Alignment:
The BRS identifies Reservation and Staff User as containing outlet information and requires
outlet-specific operational configuration. The exact Restaurant and Outlet entity schema
is not defined in the BRS, so the above is proposed for the SRS/data-design stage.


5.1.2.9 Error / Exception Handling

E-GR-01 – Outlet List Unavailable

Scenario:
Restaurant/outlet service cannot be reached.

Expected:
- Show a non-blocking error message.
- Allow retry.
- Do not display stale data as current without clear indication.

E-GR-02 – Location Access Denied

Scenario:
Guest does not grant location permission.

Expected:
- Continue with manual outlet selection.
- Do not prevent access to the outlet locator.

E-GR-03 – Outlet Becomes Inactive

Scenario:
Selected outlet becomes inactive after selection.

Expected:
- Refresh outlet status.
- Inform guest.
- Require another outlet where necessary.

E-GR-04 – Service Not Supported

Scenario:
Selected outlet does not support the requested service.

Expected:
- Inform the guest.
- Do not allow continuation for that service.
- Provide available services where applicable.

E-GR-05 – Outlet Change Causes Invalid Cart/Reservation Context

Scenario:
Guest changes outlet after outlet-specific items or availability have been loaded.

Expected:
- Revalidate outlet-dependent information.
- Refresh or clear incompatible data.
- Require guest confirmation where data is affected.

Exact cart-clearing behavior is TBD and should be confirmed before implementation.


5.1.2.10 Acceptance Criteria

AC-GR-01
Guest can view available restaurants/outlets.

AC-GR-02
Guest can manually select an outlet.

AC-GR-03
Guest can use location-based outlet discovery when location access is available.

AC-GR-04
Guest can continue using manual selection when location access is unavailable.

AC-GR-05
Selected outlet is correctly passed to reservation flow.

AC-GR-06
Reservation availability is calculated using the selected outlet.

AC-GR-07
Selected outlet is correctly passed to ordering flow.

AC-GR-08
Delivery serviceability is validated against the selected outlet.

AC-GR-09
Outlet operating hours are respected for ordering.

AC-GR-10
Changing the outlet causes outlet-dependent data to be revalidated.

AC-GR-11
An unavailable outlet/service is clearly communicated to the guest.

AC-GR-12
No reservation or order is associated with the wrong outlet.

AC-GR-13
Outlet context is correctly maintained throughout the applicable guest journey.


5.1.2.11 Dependencies

- Restaurant / outlet master data
- Admin Console outlet configuration
- Reservation module
- Menu and availability module
- Ordering module
- Delivery serviceability logic
- Maps / geocoding service
- Backend outlet APIs
- Database restaurant/outlet model
- Authentication / guest session
- Timezone and operating-hours configuration


5.1.2.12 Security & Privacy Considerations

- Outlet data returned to the Guest App shall be limited to data intended for guest visibility.
- Backend APIs shall validate outlet identifiers rather than trusting client-supplied context.
- Access to internal outlet configuration shall not be exposed to guests.
- Location data shall only be used where required for location-based functionality.
- Exact location-retention behavior is TBD and requires privacy/legal confirmation.


5.1.2.13 TBD / Open Decisions

TBD-GR-01
What is the exact hierarchy:
Restaurant → Brand → Outlet
or
Restaurant → Outlet?

TBD-GR-02
Should the first screen show all outlets, nearby outlets, or a combination?

TBD-GR-03
What exact fields must appear on an outlet card?

TBD-GR-04
What exact distance/radius should be used for nearby outlet discovery?

TBD-GR-05
Should outlets be sorted by distance, availability, or business-defined ordering?

TBD-GR-06
What happens to an existing cart when the guest changes outlet?

TBD-GR-07
Should outlet selection be mandatory immediately on app launch, or only when the
guest starts an outlet-dependent journey?

TBD-GR-08
Which outlet services are available in Phase 1:
- Reservation
- Pickup
- Delivery
- Dine-in

TBD-GR-09
How should temporary outlet closure be represented?

TBD-GR-10
What mapping/geolocation provider will be used?

TBD-GR-11
How long, if at all, should the selected outlet be persisted?

TBD-GR-12
What timezone rules apply when restaurants operate in different locations?


5.1.2.14 Module Status

Status:
Draft – SRS Definition

BRS Coverage:
Partially explicit in BRS; detailed outlet-selection behavior requires SRS/design decisions.

Next Module:
5.1.3 Guest App → Menu & Discovery
-------------------------------------------------------------
5.1.3 Menu & Discovery

5.1.3.1 Module Overview

The Menu & Discovery module allows guests to browse and discover the restaurant menu
for the selected outlet.

The module shall provide clear and structured menu information, including categories,
items, photography, descriptions, prices, portion sizes, regional origin, spice grading,
allergen information, dietary suitability, modifiers, and item availability.

The module shall also support menu search, filtering, selected menu types such as combos,
thalis and tasting menus, scheduled specials, and recommendations.

The menu displayed to the guest shall reflect the selected restaurant/outlet context.

BRS Alignment:

The BRS directly defines FR-MN-01 through FR-MN-10 for the menu and discovery
capability.


5.1.3.2 BRS Requirement Mapping

| SRS ID | BRS ID | Requirement | Priority |
|--------|--------|-------------|----------|
| SRS-MN-001 | FR-MN-01 | Menu presents categories, items, photography, description, price, portion size and regional origin. | M |
| SRS-MN-002 | FR-MN-02 | Every item carries a spice grade and alternate spice level may be requested where permitted by the kitchen. | M |
| SRS-MN-003 | FR-MN-03 | Every item declares allergens and dietary suitability. | M |
| SRS-MN-004 | FR-MN-04 | Guests can search and filter by dietary tag, spice grade, course, price band and popularity. | M |
| SRS-MN-005 | FR-MN-05 | Items can be marked unavailable in real time by staff and are visibly disabled. | M |
| SRS-MN-006 | FR-MN-06 | System supports modifiers and option groups with price impact. | M |
| SRS-MN-007 | FR-MN-07 | System supports combos, thalis, tasting menus and time-bound menus. | M |
| SRS-MN-008 | FR-MN-08 | System recommends pairings and add-ons based on cart contents and guest history. | S |
| SRS-MN-009 | FR-MN-09 | Chef specials and seasonal menus can be scheduled to publish and expire automatically. | S |
| SRS-MN-010 | FR-MN-10 | Menu content supports multiple languages, with English mandatory at MVP. | C |


5.1.3.3 User Flow

Primary Menu Browsing Flow

1. Guest selects a restaurant/outlet.
2. Guest opens the Menu screen.
3. System retrieves the menu applicable to the selected outlet.
4. System displays menu categories.
5. Guest selects a category.
6. System displays available menu items.
7. Guest opens an item to view complete item information.
8. Guest may search or filter menu items.
9. Guest selects an item.
10. Guest views available modifiers and options.
11. Guest selects required options where applicable.
12. Guest adds the item to the cart.


Item Discovery Flow

1. Guest opens Menu.
2. Guest views categories.
3. Guest searches for an item or applies filters.
4. System returns matching menu items.
5. Guest selects an item.
6. System displays item details.


Spice & Dietary Discovery Flow

1. Guest opens Menu.
2. Guest applies a dietary filter, spice-grade filter, or both.
3. System returns matching menu items.
4. Guest opens the selected item.
5. System displays spice grade and dietary/allergen information.
6. Guest continues with item selection.


Unavailable Item Flow

1. Staff marks an item unavailable.
2. Backend updates the item's availability.
3. Guest App receives refreshed availability.
4. The item is visibly marked as unavailable/disabled.
5. Guest cannot treat the unavailable item as currently orderable.


Modifier Selection Flow

1. Guest selects a menu item.
2. System displays configured modifier groups.
3. Guest selects applicable modifiers/options.
4. System calculates applicable modifier price impacts.
5. Guest adds the configured item to cart.


Scheduled Menu Flow

1. Admin configures a time-bound menu or special.
2. System evaluates its configured effective period.
3. Active content is published to the Guest App.
4. Expired content is no longer presented as active menu content.


Recommendation Flow

1. Guest views a menu item or cart.
2. System evaluates applicable pairing/add-on recommendations.
3. System displays eligible recommendations.
4. Guest may select a recommended item.
5. Selected recommendation follows the normal item/modifier/cart flow.


5.1.3.4 Functional Requirements

SRS-MN-001 – Menu Categories

The Guest App shall display menu categories configured for the selected outlet.

Categories shall be displayed in a consistent and guest-friendly structure.

The exact category ordering is TBD.


SRS-MN-002 – Menu Item Display

Each menu item shall support display of:

- Item name
- Photography
- Description
- Price
- Portion size
- Regional origin
- Spice grade
- Allergen information
- Dietary suitability
- Availability status
- Applicable modifiers/options

The exact presentation order is a UI/UX decision.


SRS-MN-003 – Item Details

The Guest App shall provide an item-detail view containing the information applicable
to the selected menu item.


SRS-MN-004 – Spice Grade

Each menu item shall have a defined spice grade.

The Guest App shall display the configured spice grade clearly.

Where the kitchen permits an alternate spice level, the Guest App shall allow the guest
to request the permitted alternate level.


SRS-MN-005 – Allergen Information

The Guest App shall display allergen information associated with each menu item.

Allergen information shall be maintained as structured item data rather than only free-text
where possible.


SRS-MN-006 – Dietary Suitability

The Guest App shall support the dietary suitability information defined by the BRS,
including:

- Vegetarian
- Vegan
- Jain
- Halal
- Gluten-free
- Nut-free
- Dairy-free


SRS-MN-007 – Search

Guests shall be able to search menu items.

The exact searchable fields, matching logic, ranking and typo handling are TBD.


SRS-MN-008 – Menu Filtering

Guests shall be able to filter menu items by:

- Dietary tag
- Spice grade
- Course
- Price band
- Popularity


SRS-MN-009 – Real-Time Availability

The system shall support real-time menu item availability updates.

When staff marks an item unavailable, the Guest App shall reflect the updated status.


SRS-MN-010 – Unavailable Item Display

Unavailable items shall be visibly disabled rather than silently hidden.

The guest shall be clearly informed that the item is currently unavailable.


SRS-MN-011 – Modifiers

The system shall support configurable modifier groups and option groups.

Examples defined by the BRS include:

- Breads
- Rice
- Accompaniments
- Portion choices


SRS-MN-012 – Modifier Price Impact

The system shall calculate configured price adjustments associated with selected
modifiers/options.


SRS-MN-013 – Required / Optional Modifier Behaviour

The system shall support configuration of whether a modifier group is:

- Required
- Optional

Exact minimum/maximum selection rules are TBD unless provided by Admin configuration.


SRS-MN-014 – Combos

The menu shall support combo offerings.

Combo composition and pricing shall be determined by configured menu data.


SRS-MN-015 – Thalis

The menu shall support thali offerings.

The exact thali composition rules are configurable and remain TBD.


SRS-MN-016 – Tasting Menus

The menu shall support tasting-menu offerings.


SRS-MN-017 – Time-Bound Menus

The menu shall support time-bound menus such as weekday lunch menus.


SRS-MN-018 – Scheduled Chef Specials

Chef specials shall support scheduled publication and expiry.


SRS-MN-019 – Seasonal Menus

Seasonal menus shall support configured publication and expiry periods.


SRS-MN-020 – Recommendations

The system shall support recommendations for pairings and add-ons.

Recommendations may use:

- Current cart contents
- Guest history


SRS-MN-021 – Recommendation Availability

Recommendations presented to the guest shall respect current item availability.


SRS-MN-022 – Outlet-Specific Menu

The Guest App shall retrieve menu content according to the selected restaurant/outlet
context.

Outlet-specific availability shall be respected.


SRS-MN-023 – Language Support

The menu data model shall support multiple languages.

English menu content shall be available at MVP as specified by the BRS.

The exact additional languages and translation workflow are TBD.


SRS-MN-024 – Menu Refresh

The Guest App shall refresh menu information when relevant menu state changes occur,
including availability changes.

Exact refresh/polling/WebSocket strategy is an implementation decision.


5.1.3.5 Business Rules

BR-MN-001

Every published menu item shall contain the guest-visible information required by the
BRS.


BR-MN-002

Every item shall have a defined spice grade.


BR-MN-003

An alternate spice level may only be requested where the kitchen permits it.


BR-MN-004

Allergen and dietary suitability information shall correspond to the configured menu item.


BR-MN-005

Unavailable items shall not be presented as normally orderable.


BR-MN-006

Unavailable items shall be visibly disabled rather than silently removed without
explanation.


BR-MN-007

Modifier selections shall respect the configured modifier/option-group rules.


BR-MN-008

Modifier price impacts shall be included in the applicable item/cart price calculation.


BR-MN-009

Combos, thalis and tasting menus shall follow their configured composition and pricing.


BR-MN-010

Time-bound menus shall only be considered active within their configured availability
period.


BR-MN-011

Chef specials and seasonal menus shall follow their configured publication and expiry
periods.


BR-MN-012

Recommendations must respect current item availability.


BR-MN-013

The menu shown to the guest shall use the selected outlet context.


BR-MN-014

English menu content is mandatory at MVP.


BR-MN-015

Additional language support shall not require replacement of the underlying menu
business model.


5.1.3.6 Validations

Validation 1 – Required Menu Item Information

Condition:
A menu item is attempted to be published without required guest-visible data.

Expected:
System prevents publication or reports the missing information according to the
configured publishing workflow.

Exact mandatory-field validation is a proposed SRS rule and must be finalized in Admin.


Validation 2 – Alternate Spice Level

Condition:
Guest selects an alternate spice level not permitted by the kitchen.

Expected:
System prevents that selection.


Validation 3 – Unavailable Item

Condition:
Guest opens an item marked unavailable.

Expected:
Item displays unavailable status and cannot proceed as a normal orderable selection.


Validation 4 – Modifier Required

Condition:
Guest attempts to add an item without completing required modifier selections.

Expected:
System prevents completion and identifies the required selection.


Validation 5 – Invalid Modifier Selection

Condition:
Guest selects an option outside the configured allowed options.

Expected:
System rejects the invalid selection.


Validation 6 – Modifier Price

Condition:
Guest selects a modifier with an additional charge.

Expected:
Updated item price is displayed before adding to cart.


Validation 7 – Expired Special

Condition:
Chef special or seasonal menu has passed its configured expiry.

Expected:
It is no longer treated as active menu content.


Validation 8 – Scheduled Menu

Condition:
Current date/time is outside the configured publication window.

Expected:
The menu content is not treated as active.


Validation 9 – Search With No Results

Condition:
Search/filter returns no matching items.

Expected:
System displays a clear no-results state and allows the guest to modify/clear the
search/filter.


Validation 10 – Outlet Context

Condition:
Guest changes the selected outlet before continuing.

Expected:
Menu data is reloaded using the newly selected outlet context.


5.1.3.7 Proposed API Requirements

These APIs are SRS-level proposed contracts.
The BRS defines the business requirements but does not define API names or payloads.


GET /api/v1/outlets/{outlet_id}/menu

Purpose:
Retrieve the menu for the selected outlet.


GET /api/v1/outlets/{outlet_id}/menu/categories

Purpose:
Retrieve active menu categories.


GET /api/v1/outlets/{outlet_id}/menu/items

Purpose:
Retrieve menu items.

Suggested query parameters:

- category_id
- search
- dietary_tag
- spice_grade
- course
- min_price
- max_price
- popularity
- availability


GET /api/v1/menu/items/{item_id}

Purpose:
Retrieve complete menu-item details.


GET /api/v1/menu/items/{item_id}/modifiers

Purpose:
Retrieve modifier groups and options for a selected item.


GET /api/v1/outlets/{outlet_id}/menu/specials

Purpose:
Retrieve currently active chef specials, seasonal menus and other scheduled content.


GET /api/v1/outlets/{outlet_id}/menu/recommendations

Purpose:
Retrieve pairing/add-on recommendations.

Suggested inputs:

- guest_id/session_id
- cart_item_ids


GET /api/v1/outlets/{outlet_id}/menu/availability

Purpose:
Retrieve current item availability state.

Potential future implementation:
Availability updates may be delivered using WebSockets for real-time behaviour.


Important:

Final endpoint naming, pagination, filtering implementation, authentication requirements,
response schemas, caching, and versioning shall be finalized in the Backend/API Architecture.


5.1.3.8 Data Requirements

Menu Category

Suggested fields:

- category_id
- outlet_id
- name
- description
- display_order
- status
- effective_from
- effective_to


Menu Item

Suggested fields:

- item_id
- outlet_id
- category_id
- name
- description
- image_url
- price
- portion_size
- regional_origin
- spice_grade
- availability_status
- prep_time
- dietary_tags
- allergen_tags
- course
- popularity_score
- status
- effective_from
- effective_to


Modifier Group

Suggested fields:

- modifier_group_id
- item_id
- name
- selection_type
- min_selection
- max_selection
- required
- display_order


Modifier Option

Suggested fields:

- modifier_option_id
- modifier_group_id
- name
- price_delta
- status
- display_order


Menu Collection / Scheduled Menu

Suggested fields:

- menu_id
- outlet_id
- menu_type
- name
- effective_from
- effective_to
- status


Recommendation

Suggested fields:

- recommendation_id
- outlet_id
- source_item_id
- recommended_item_id
- recommendation_type
- priority
- status


Menu Availability

Suggested fields:

- item_id
- outlet_id
- available
- unavailable_reason
- updated_at
- updated_by


The BRS identifies Menu Item as a core data entity with category, price, modifiers,
allergens, dietary tags, spice grade, availability and prep time. The additional fields
above are proposed for SRS/database design and are not all explicitly defined by the BRS.
:contentReference[oaicite:1]{index=1}


5.1.3.9 Error / Exception Handling

E-MN-01 – Menu Loading Failure

Scenario:
Menu API cannot be reached.

Expected:
- Show a clear error state.
- Provide retry.
- Do not display incomplete menu data as current without appropriate indication.


E-MN-02 – Category Loading Failure

Scenario:
Menu category data fails to load.

Expected:
- Show an error state.
- Allow retry.


E-MN-03 – Item Details Failure

Scenario:
Item detail request fails.

Expected:
- Show an error message.
- Allow guest to return to the menu.


E-MN-04 – Item Becomes Unavailable

Scenario:
Item becomes unavailable while guest is viewing it.

Expected:
- Refresh item availability.
- Prevent the unavailable item from being treated as orderable.


E-MN-05 – Modifier Configuration Unavailable

Scenario:
Modifier data cannot be loaded.

Expected:
- Do not allow an incompletely configured item to be added where modifiers are
required.
- Allow retry.


E-MN-06 – Scheduled Menu Expired

Scenario:
Guest has previously viewed a menu that is now expired.

Expected:
- Refresh menu state.
- Remove expired menu from active content.


E-MN-07 – Recommendation Service Failure

Scenario:
Recommendation service is unavailable.

Expected:
- Menu browsing and normal ordering functions continue.
- Recommendation section may be unavailable without blocking the main menu journey.


E-MN-08 – Search Failure

Scenario:
Search API fails.

Expected:
- Preserve the currently loaded menu where possible.
- Display retry state for the search operation.


E-MN-09 – Outlet Context Mismatch

Scenario:
Menu request uses an invalid or inactive outlet.

Expected:
- Reject the request.
- Require the Guest App to establish a valid outlet context.


5.1.3.10 Security & Privacy Considerations

- Backend APIs shall validate outlet and item identifiers.
- Guests shall not be able to modify menu data through Guest App APIs.
- Only authorized Admin/Staff operations may modify menu availability or content.
- Guest history used for recommendations shall be accessed only according to applicable
  authorization/privacy rules.
- Internal menu configuration fields shall not be exposed to guests unless intended.
- Menu image URLs shall expose only guest-accessible content.
- API responses shall not expose unnecessary internal staff/configuration data.


5.1.3.11 Acceptance Criteria

AC-MN-001
Guest can view menu categories for the selected outlet.


AC-MN-002
Guest can view item name, photography, description, price, portion size and regional origin.


AC-MN-003
Guest can see the spice grade of each item.


AC-MN-004
Guest can see allergen information and dietary suitability.


AC-MN-005
Guest can search the menu.


AC-MN-006
Guest can filter by dietary tag, spice grade, course, price band and popularity.


AC-MN-007
Unavailable items are visibly disabled and are not treated as normally orderable.


AC-MN-008
Guest can select configured modifiers and options.


AC-MN-009
Modifier price impacts are correctly reflected.


AC-MN-010
Combos, thalis, tasting menus and time-bound menus can be displayed according to
their configured definitions.


AC-MN-011
Chef specials and seasonal menus publish and expire according to their configured
schedule.


AC-MN-012
Pairing and add-on recommendations can be displayed based on supported inputs.


AC-MN-013
Recommendations do not present unavailable items as orderable.


AC-MN-014
English menu content is available at MVP.


AC-MN-015
Menu content is associated with the correct selected outlet.


AC-MN-016
Menu availability changes are reflected in the Guest App.


AC-MN-017
Menu failure does not prevent the rest of the Guest App from functioning.


5.1.3.12 Dependencies

- Restaurant / Outlet Selection module
- Admin Console menu management
- Staff App availability update capability
- PostgreSQL menu data
- Backend Menu APIs
- Image/media storage
- Search/filter implementation
- Cart module
- Loyalty/guest history for recommendations
- WebSocket/real-time availability mechanism
- Authentication/session context
- Outlet configuration
- Localization framework


5.1.3.13 TBD / Open Decisions

TBD-MN-001
What is the exact menu category hierarchy?


TBD-MN-002
What is the exact spice-grade scale?

Example:
Mild → Medium → Hot → Extra Hot

This example is not defined in the BRS and must not be treated as the final scale.


TBD-MN-003
What exact allergen taxonomy and display wording will be used?


TBD-MN-004
How should dietary conflicts be handled?

Example:
An item may have multiple dietary tags.


TBD-MN-005
What fields are searchable?


TBD-MN-006
How should search ranking work?


TBD-MN-007
How should popularity be calculated?


TBD-MN-008
What image size/format/storage strategy will be used?


TBD-MN-009
Should menu data be cached locally in the Guest App?


TBD-MN-010
What is the exact real-time availability mechanism?

Possible implementation:
WebSocket / polling / push-based refresh.


TBD-MN-011
What are the modifier minimum/maximum selection rules?


TBD-MN-012
How are combos, thalis and tasting menus represented internally?


TBD-MN-013
How are menu schedules evaluated with outlet timezone?


TBD-MN-014
How are recommendations generated?

Possible approaches are configurable business rules or a recommendation service.
The BRS does not specify the algorithm.


TBD-MN-015
Which additional languages are planned after MVP?


TBD-MN-016
What happens to a guest's cart when the selected outlet changes?


TBD-MN-017
What menu data is sourced directly from the POS versus managed in the Admin Console?


TBD-MN-018
What is the final source of truth for menu availability?


5.1.3.14 BRS Priority Summary

M – Must Have

- FR-MN-01
- FR-MN-02
- FR-MN-03
- FR-MN-04
- FR-MN-05
- FR-MN-06
- FR-MN-07


S – Should Have

- FR-MN-08
- FR-MN-09


C – Could Have

- FR-MN-10


Therefore, the Phase 1 implementation should prioritize FR-MN-01 through FR-MN-07.
FR-MN-08 and FR-MN-09 are lower-priority additions, while FR-MN-10 is a Could
requirement. This priority classification follows the BRS. :contentReference[oaicite:2]{index=2}


5.1.3.15 Module Status

Status:
Draft – SRS Definition

BRS Coverage:
Direct mapping available: FR-MN-01 to FR-MN-10.

Implementation Note:
The BRS defines the business capabilities but does not define the exact UI layout,
API contracts, database schema, search algorithm, recommendation algorithm, caching
strategy, or real-time transport. These must be finalized during SRS technical design.

Next Module:
5.1.4 Guest App → Reservations & Waitlist
----------------------------------------------------------
5.1.3 Menu & Discovery

5.1.3.1 Module Overview

The Menu & Discovery module allows guests to browse and discover the restaurant menu
for the selected outlet.

The module shall provide clear and structured menu information, including categories,
items, photography, descriptions, prices, portion sizes, regional origin, spice grading,
allergen information, dietary suitability, modifiers, and item availability.

The module shall also support menu search, filtering, selected menu types such as combos,
thalis and tasting menus, scheduled specials, and recommendations.

The menu displayed to the guest shall reflect the selected restaurant/outlet context.

BRS Alignment:

The BRS directly defines FR-MN-01 through FR-MN-10 for the menu and discovery
capability.


5.1.3.2 BRS Requirement Mapping

| SRS ID | BRS ID | Requirement | Priority |
|--------|--------|-------------|----------|
| SRS-MN-001 | FR-MN-01 | Menu presents categories, items, photography, description, price, portion size and regional origin. | M |
| SRS-MN-002 | FR-MN-02 | Every item carries a spice grade and alternate spice level may be requested where permitted by the kitchen. | M |
| SRS-MN-003 | FR-MN-03 | Every item declares allergens and dietary suitability. | M |
| SRS-MN-004 | FR-MN-04 | Guests can search and filter by dietary tag, spice grade, course, price band and popularity. | M |
| SRS-MN-005 | FR-MN-05 | Items can be marked unavailable in real time by staff and are visibly disabled. | M |
| SRS-MN-006 | FR-MN-06 | System supports modifiers and option groups with price impact. | M |
| SRS-MN-007 | FR-MN-07 | System supports combos, thalis, tasting menus and time-bound menus. | M |
| SRS-MN-008 | FR-MN-08 | System recommends pairings and add-ons based on cart contents and guest history. | S |
| SRS-MN-009 | FR-MN-09 | Chef specials and seasonal menus can be scheduled to publish and expire automatically. | S |
| SRS-MN-010 | FR-MN-10 | Menu content supports multiple languages, with English mandatory at MVP. | C |


5.1.3.3 User Flow

Primary Menu Browsing Flow

1. Guest selects a restaurant/outlet.
2. Guest opens the Menu screen.
3. System retrieves the menu applicable to the selected outlet.
4. System displays menu categories.
5. Guest selects a category.
6. System displays available menu items.
7. Guest opens an item to view complete item information.
8. Guest may search or filter menu items.
9. Guest selects an item.
10. Guest views available modifiers and options.
11. Guest selects required options where applicable.
12. Guest adds the item to the cart.


Item Discovery Flow

1. Guest opens Menu.
2. Guest views categories.
3. Guest searches for an item or applies filters.
4. System returns matching menu items.
5. Guest selects an item.
6. System displays item details.


Spice & Dietary Discovery Flow

1. Guest opens Menu.
2. Guest applies a dietary filter, spice-grade filter, or both.
3. System returns matching menu items.
4. Guest opens the selected item.
5. System displays spice grade and dietary/allergen information.
6. Guest continues with item selection.


Unavailable Item Flow

1. Staff marks an item unavailable.
2. Backend updates the item's availability.
3. Guest App receives refreshed availability.
4. The item is visibly marked as unavailable/disabled.
5. Guest cannot treat the unavailable item as currently orderable.


Modifier Selection Flow

1. Guest selects a menu item.
2. System displays configured modifier groups.
3. Guest selects applicable modifiers/options.
4. System calculates applicable modifier price impacts.
5. Guest adds the configured item to cart.


Scheduled Menu Flow

1. Admin configures a time-bound menu or special.
2. System evaluates its configured effective period.
3. Active content is published to the Guest App.
4. Expired content is no longer presented as active menu content.


Recommendation Flow

1. Guest views a menu item or cart.
2. System evaluates applicable pairing/add-on recommendations.
3. System displays eligible recommendations.
4. Guest may select a recommended item.
5. Selected recommendation follows the normal item/modifier/cart flow.


5.1.3.4 Functional Requirements

SRS-MN-001 – Menu Categories

The Guest App shall display menu categories configured for the selected outlet.

Categories shall be displayed in a consistent and guest-friendly structure.

The exact category ordering is TBD.


SRS-MN-002 – Menu Item Display

Each menu item shall support display of:

- Item name
- Photography
- Description
- Price
- Portion size
- Regional origin
- Spice grade
- Allergen information
- Dietary suitability
- Availability status
- Applicable modifiers/options

The exact presentation order is a UI/UX decision.


SRS-MN-003 – Item Details

The Guest App shall provide an item-detail view containing the information applicable
to the selected menu item.


SRS-MN-004 – Spice Grade

Each menu item shall have a defined spice grade.

The Guest App shall display the configured spice grade clearly.

Where the kitchen permits an alternate spice level, the Guest App shall allow the guest
to request the permitted alternate level.


SRS-MN-005 – Allergen Information

The Guest App shall display allergen information associated with each menu item.

Allergen information shall be maintained as structured item data rather than only free-text
where possible.


SRS-MN-006 – Dietary Suitability

The Guest App shall support the dietary suitability information defined by the BRS,
including:

- Vegetarian
- Vegan
- Jain
- Halal
- Gluten-free
- Nut-free
- Dairy-free


SRS-MN-007 – Search

Guests shall be able to search menu items.

The exact searchable fields, matching logic, ranking and typo handling are TBD.


SRS-MN-008 – Menu Filtering

Guests shall be able to filter menu items by:

- Dietary tag
- Spice grade
- Course
- Price band
- Popularity


SRS-MN-009 – Real-Time Availability

The system shall support real-time menu item availability updates.

When staff marks an item unavailable, the Guest App shall reflect the updated status.


SRS-MN-010 – Unavailable Item Display

Unavailable items shall be visibly disabled rather than silently hidden.

The guest shall be clearly informed that the item is currently unavailable.


SRS-MN-011 – Modifiers

The system shall support configurable modifier groups and option groups.

Examples defined by the BRS include:

- Breads
- Rice
- Accompaniments
- Portion choices


SRS-MN-012 – Modifier Price Impact

The system shall calculate configured price adjustments associated with selected
modifiers/options.


SRS-MN-013 – Required / Optional Modifier Behaviour

The system shall support configuration of whether a modifier group is:

- Required
- Optional

Exact minimum/maximum selection rules are TBD unless provided by Admin configuration.


SRS-MN-014 – Combos

The menu shall support combo offerings.

Combo composition and pricing shall be determined by configured menu data.


SRS-MN-015 – Thalis

The menu shall support thali offerings.

The exact thali composition rules are configurable and remain TBD.


SRS-MN-016 – Tasting Menus

The menu shall support tasting-menu offerings.


SRS-MN-017 – Time-Bound Menus

The menu shall support time-bound menus such as weekday lunch menus.


SRS-MN-018 – Scheduled Chef Specials

Chef specials shall support scheduled publication and expiry.


SRS-MN-019 – Seasonal Menus

Seasonal menus shall support configured publication and expiry periods.


SRS-MN-020 – Recommendations

The system shall support recommendations for pairings and add-ons.

Recommendations may use:

- Current cart contents
- Guest history


SRS-MN-021 – Recommendation Availability

Recommendations presented to the guest shall respect current item availability.


SRS-MN-022 – Outlet-Specific Menu

The Guest App shall retrieve menu content according to the selected restaurant/outlet
context.

Outlet-specific availability shall be respected.


SRS-MN-023 – Language Support

The menu data model shall support multiple languages.

English menu content shall be available at MVP as specified by the BRS.

The exact additional languages and translation workflow are TBD.


SRS-MN-024 – Menu Refresh

The Guest App shall refresh menu information when relevant menu state changes occur,
including availability changes.

Exact refresh/polling/WebSocket strategy is an implementation decision.


5.1.3.5 Business Rules

BR-MN-001

Every published menu item shall contain the guest-visible information required by the
BRS.


BR-MN-002

Every item shall have a defined spice grade.


BR-MN-003

An alternate spice level may only be requested where the kitchen permits it.


BR-MN-004

Allergen and dietary suitability information shall correspond to the configured menu item.


BR-MN-005

Unavailable items shall not be presented as normally orderable.


BR-MN-006

Unavailable items shall be visibly disabled rather than silently removed without
explanation.


BR-MN-007

Modifier selections shall respect the configured modifier/option-group rules.


BR-MN-008

Modifier price impacts shall be included in the applicable item/cart price calculation.


BR-MN-009

Combos, thalis and tasting menus shall follow their configured composition and pricing.


BR-MN-010

Time-bound menus shall only be considered active within their configured availability
period.


BR-MN-011

Chef specials and seasonal menus shall follow their configured publication and expiry
periods.


BR-MN-012

Recommendations must respect current item availability.


BR-MN-013

The menu shown to the guest shall use the selected outlet context.


BR-MN-014

English menu content is mandatory at MVP.


BR-MN-015

Additional language support shall not require replacement of the underlying menu
business model.


5.1.3.6 Validations

Validation 1 – Required Menu Item Information

Condition:
A menu item is attempted to be published without required guest-visible data.

Expected:
System prevents publication or reports the missing information according to the
configured publishing workflow.

Exact mandatory-field validation is a proposed SRS rule and must be finalized in Admin.


Validation 2 – Alternate Spice Level

Condition:
Guest selects an alternate spice level not permitted by the kitchen.

Expected:
System prevents that selection.


Validation 3 – Unavailable Item

Condition:
Guest opens an item marked unavailable.

Expected:
Item displays unavailable status and cannot proceed as a normal orderable selection.


Validation 4 – Modifier Required

Condition:
Guest attempts to add an item without completing required modifier selections.

Expected:
System prevents completion and identifies the required selection.


Validation 5 – Invalid Modifier Selection

Condition:
Guest selects an option outside the configured allowed options.

Expected:
System rejects the invalid selection.


Validation 6 – Modifier Price

Condition:
Guest selects a modifier with an additional charge.

Expected:
Updated item price is displayed before adding to cart.


Validation 7 – Expired Special

Condition:
Chef special or seasonal menu has passed its configured expiry.

Expected:
It is no longer treated as active menu content.


Validation 8 – Scheduled Menu

Condition:
Current date/time is outside the configured publication window.

Expected:
The menu content is not treated as active.


Validation 9 – Search With No Results

Condition:
Search/filter returns no matching items.

Expected:
System displays a clear no-results state and allows the guest to modify/clear the
search/filter.


Validation 10 – Outlet Context

Condition:
Guest changes the selected outlet before continuing.

Expected:
Menu data is reloaded using the newly selected outlet context.


5.1.3.7 Proposed API Requirements

These APIs are SRS-level proposed contracts.
The BRS defines the business requirements but does not define API names or payloads.


GET /api/v1/outlets/{outlet_id}/menu

Purpose:
Retrieve the menu for the selected outlet.


GET /api/v1/outlets/{outlet_id}/menu/categories

Purpose:
Retrieve active menu categories.


GET /api/v1/outlets/{outlet_id}/menu/items

Purpose:
Retrieve menu items.

Suggested query parameters:

- category_id
- search
- dietary_tag
- spice_grade
- course
- min_price
- max_price
- popularity
- availability


GET /api/v1/menu/items/{item_id}

Purpose:
Retrieve complete menu-item details.


GET /api/v1/menu/items/{item_id}/modifiers

Purpose:
Retrieve modifier groups and options for a selected item.


GET /api/v1/outlets/{outlet_id}/menu/specials

Purpose:
Retrieve currently active chef specials, seasonal menus and other scheduled content.


GET /api/v1/outlets/{outlet_id}/menu/recommendations

Purpose:
Retrieve pairing/add-on recommendations.

Suggested inputs:

- guest_id/session_id
- cart_item_ids


GET /api/v1/outlets/{outlet_id}/menu/availability

Purpose:
Retrieve current item availability state.

Potential future implementation:
Availability updates may be delivered using WebSockets for real-time behaviour.


Important:

Final endpoint naming, pagination, filtering implementation, authentication requirements,
response schemas, caching, and versioning shall be finalized in the Backend/API Architecture.


5.1.3.8 Data Requirements

Menu Category

Suggested fields:

- category_id
- outlet_id
- name
- description
- display_order
- status
- effective_from
- effective_to


Menu Item

Suggested fields:

- item_id
- outlet_id
- category_id
- name
- description
- image_url
- price
- portion_size
- regional_origin
- spice_grade
- availability_status
- prep_time
- dietary_tags
- allergen_tags
- course
- popularity_score
- status
- effective_from
- effective_to


Modifier Group

Suggested fields:

- modifier_group_id
- item_id
- name
- selection_type
- min_selection
- max_selection
- required
- display_order


Modifier Option

Suggested fields:

- modifier_option_id
- modifier_group_id
- name
- price_delta
- status
- display_order


Menu Collection / Scheduled Menu

Suggested fields:

- menu_id
- outlet_id
- menu_type
- name
- effective_from
- effective_to
- status


Recommendation

Suggested fields:

- recommendation_id
- outlet_id
- source_item_id
- recommended_item_id
- recommendation_type
- priority
- status


Menu Availability

Suggested fields:

- item_id
- outlet_id
- available
- unavailable_reason
- updated_at
- updated_by


The BRS identifies Menu Item as a core data entity with category, price, modifiers,
allergens, dietary tags, spice grade, availability and prep time. The additional fields
above are proposed for SRS/database design and are not all explicitly defined by the BRS.
:contentReference[oaicite:1]{index=1}


5.1.3.9 Error / Exception Handling

E-MN-01 – Menu Loading Failure

Scenario:
Menu API cannot be reached.

Expected:
- Show a clear error state.
- Provide retry.
- Do not display incomplete menu data as current without appropriate indication.


E-MN-02 – Category Loading Failure

Scenario:
Menu category data fails to load.

Expected:
- Show an error state.
- Allow retry.


E-MN-03 – Item Details Failure

Scenario:
Item detail request fails.

Expected:
- Show an error message.
- Allow guest to return to the menu.


E-MN-04 – Item Becomes Unavailable

Scenario:
Item becomes unavailable while guest is viewing it.

Expected:
- Refresh item availability.
- Prevent the unavailable item from being treated as orderable.


E-MN-05 – Modifier Configuration Unavailable

Scenario:
Modifier data cannot be loaded.

Expected:
- Do not allow an incompletely configured item to be added where modifiers are
required.
- Allow retry.


E-MN-06 – Scheduled Menu Expired

Scenario:
Guest has previously viewed a menu that is now expired.

Expected:
- Refresh menu state.
- Remove expired menu from active content.


E-MN-07 – Recommendation Service Failure

Scenario:
Recommendation service is unavailable.

Expected:
- Menu browsing and normal ordering functions continue.
- Recommendation section may be unavailable without blocking the main menu journey.


E-MN-08 – Search Failure

Scenario:
Search API fails.

Expected:
- Preserve the currently loaded menu where possible.
- Display retry state for the search operation.


E-MN-09 – Outlet Context Mismatch

Scenario:
Menu request uses an invalid or inactive outlet.

Expected:
- Reject the request.
- Require the Guest App to establish a valid outlet context.


5.1.3.10 Security & Privacy Considerations

- Backend APIs shall validate outlet and item identifiers.
- Guests shall not be able to modify menu data through Guest App APIs.
- Only authorized Admin/Staff operations may modify menu availability or content.
- Guest history used for recommendations shall be accessed only according to applicable
  authorization/privacy rules.
- Internal menu configuration fields shall not be exposed to guests unless intended.
- Menu image URLs shall expose only guest-accessible content.
- API responses shall not expose unnecessary internal staff/configuration data.


5.1.3.11 Acceptance Criteria

AC-MN-001
Guest can view menu categories for the selected outlet.


AC-MN-002
Guest can view item name, photography, description, price, portion size and regional origin.


AC-MN-003
Guest can see the spice grade of each item.


AC-MN-004
Guest can see allergen information and dietary suitability.


AC-MN-005
Guest can search the menu.


AC-MN-006
Guest can filter by dietary tag, spice grade, course, price band and popularity.


AC-MN-007
Unavailable items are visibly disabled and are not treated as normally orderable.


AC-MN-008
Guest can select configured modifiers and options.


AC-MN-009
Modifier price impacts are correctly reflected.


AC-MN-010
Combos, thalis, tasting menus and time-bound menus can be displayed according to
their configured definitions.


AC-MN-011
Chef specials and seasonal menus publish and expire according to their configured
schedule.


AC-MN-012
Pairing and add-on recommendations can be displayed based on supported inputs.


AC-MN-013
Recommendations do not present unavailable items as orderable.


AC-MN-014
English menu content is available at MVP.


AC-MN-015
Menu content is associated with the correct selected outlet.


AC-MN-016
Menu availability changes are reflected in the Guest App.


AC-MN-017
Menu failure does not prevent the rest of the Guest App from functioning.


5.1.3.12 Dependencies

- Restaurant / Outlet Selection module
- Admin Console menu management
- Staff App availability update capability
- PostgreSQL menu data
- Backend Menu APIs
- Image/media storage
- Search/filter implementation
- Cart module
- Loyalty/guest history for recommendations
- WebSocket/real-time availability mechanism
- Authentication/session context
- Outlet configuration
- Localization framework


5.1.3.13 TBD / Open Decisions

TBD-MN-001
What is the exact menu category hierarchy?


TBD-MN-002
What is the exact spice-grade scale?

Example:
Mild → Medium → Hot → Extra Hot

This example is not defined in the BRS and must not be treated as the final scale.


TBD-MN-003
What exact allergen taxonomy and display wording will be used?


TBD-MN-004
How should dietary conflicts be handled?

Example:
An item may have multiple dietary tags.


TBD-MN-005
What fields are searchable?


TBD-MN-006
How should search ranking work?


TBD-MN-007
How should popularity be calculated?


TBD-MN-008
What image size/format/storage strategy will be used?


TBD-MN-009
Should menu data be cached locally in the Guest App?


TBD-MN-010
What is the exact real-time availability mechanism?

Possible implementation:
WebSocket / polling / push-based refresh.


TBD-MN-011
What are the modifier minimum/maximum selection rules?


TBD-MN-012
How are combos, thalis and tasting menus represented internally?


TBD-MN-013
How are menu schedules evaluated with outlet timezone?


TBD-MN-014
How are recommendations generated?

Possible approaches are configurable business rules or a recommendation service.
The BRS does not specify the algorithm.


TBD-MN-015
Which additional languages are planned after MVP?


TBD-MN-016
What happens to a guest's cart when the selected outlet changes?


TBD-MN-017
What menu data is sourced directly from the POS versus managed in the Admin Console?


TBD-MN-018
What is the final source of truth for menu availability?


5.1.3.14 BRS Priority Summary

M – Must Have

- FR-MN-01
- FR-MN-02
- FR-MN-03
- FR-MN-04
- FR-MN-05
- FR-MN-06
- FR-MN-07


S – Should Have

- FR-MN-08
- FR-MN-09


C – Could Have

- FR-MN-10


Therefore, the Phase 1 implementation should prioritize FR-MN-01 through FR-MN-07.
FR-MN-08 and FR-MN-09 are lower-priority additions, while FR-MN-10 is a Could
requirement. This priority classification follows the BRS. :contentReference[oaicite:2]{index=2}


5.1.3.15 Module Status

Status:
Draft – SRS Definition

BRS Coverage:
Direct mapping available: FR-MN-01 to FR-MN-10.

Implementation Note:
The BRS defines the business capabilities but does not define the exact UI layout,
API contracts, database schema, search algorithm, recommendation algorithm, caching
strategy, or real-time transport. These must be finalized during SRS technical design.

Next Module:
5.1.4 Guest App → Reservations & Waitlist
-------------------------------------------------
5.1.5 Ordering & Cart

5.1.5.1 Module Overview

The Ordering & Cart module allows guests to create and manage orders for the supported
restaurant services.

The module shall support:

- Delivery ordering
- Pickup ordering
- Dine-in ordering using table identifier or QR code
- Menu item selection
- Modifier and option selection
- Item-level instructions
- Order-level instructions
- Allergy instructions
- Cart management
- Quantity management
- Delivery serviceability validation
- Minimum order validation
- Operating-hours validation
- Itemized price calculation
- Taxes
- Packaging charges
- Delivery charges
- Service charges
- Future/scheduled ordering
- Order modification
- Order cancellation
- Dynamic promise time
- Running tab for supported dine-in ordering
- Group ordering as a future/could capability
- Order handoff to POS and KDS
- Order exception handling

The ordering flow shall use the selected restaurant/outlet context established by the
Restaurant & Location Selection module.

For delivery, serviceability must be validated before checkout.

The cart shall display the applicable charges before payment.

BRS Alignment:

The BRS directly defines FR-OR-01 through FR-OR-09 for Ordering and Cart.


5.1.5.2 BRS Requirement Mapping

| SRS ID | BRS ID | Requirement | Priority |
|--------|--------|-------------|----------|
| SRS-OR-001 | FR-OR-01 | Guests can order for delivery, pickup or dine-in at the table via a table identifier or QR code. | M |
| SRS-OR-002 | FR-OR-02 | Delivery serviceability is validated against defined zones, minimum order value and outlet operating hours before checkout. | M |
| SRS-OR-003 | FR-OR-03 | The cart shows itemized prices, modifiers, taxes, packaging, delivery and service charges before payment. | M |
| SRS-OR-004 | FR-OR-04 | Guests can add per-item and per-order instructions, including allergy notes that are flagged prominently to the kitchen. | M |
| SRS-OR-005 | FR-OR-05 | Guests can schedule an order for a future time within operating hours. | S |
| SRS-OR-006 | FR-OR-06 | Guests can amend or cancel an order only before kitchen acceptance; thereafter cancellation requires staff approval. | M |
| SRS-OR-007 | FR-OR-07 | The system displays a dynamic promise time derived from live kitchen load and, for delivery, travel time. | M |
| SRS-OR-008 | FR-OR-08 | Dine-in table orders can be added to a running tab across multiple rounds and settled once. | S |
| SRS-OR-009 | FR-OR-09 | Group ordering allows several guests at one table to add to a shared cart. | C |
| SRS-OR-010 | BRS 7.2 | Off-premise ordering validates delivery/pickup, builds the cart, collects instructions and applicable offer, then sends the order for fulfilment. | M |
| SRS-OR-011 | BRS 7.2 | Order is injected into the POS and appears on the KDS after order submission. | M |
| SRS-OR-012 | BRS 7.3 | If an item becomes unavailable after ordering, staff proposes substitution or partial refund and the guest approves before preparation continues. | M |
| SRS-OR-013 | BRS 7.3 | When kitchen capacity is reached, promise times extend automatically and ordering may pause when configured. | M |


5.1.5.3 User Flow

Primary Ordering Flow

1. Guest selects the restaurant/outlet.
2. Guest selects the required service:
   - Delivery
   - Pickup
   - Dine-in
3. System loads the applicable menu for the selected outlet.
4. Guest browses menu categories.
5. Guest selects a menu item.
6. Guest selects modifiers/options where applicable.
7. Guest adds item-level instructions where required.
8. Guest adds the item to the cart.
9. Guest continues adding items or opens the cart.
10. Guest reviews cart contents.
11. System calculates item prices and applicable charges.
12. Guest reviews taxes, packaging, delivery and service charges.
13. Delivery serviceability is validated where applicable.
14. Guest selects immediate or future ordering where supported.
15. System calculates/display the applicable promise time.
16. Guest continues to checkout/payment.


Delivery Ordering Flow

1. Guest selects Delivery.
2. Guest provides/selects delivery address.
3. System identifies the applicable outlet.
4. System validates delivery serviceability.
5. System validates minimum order value.
6. System validates outlet operating hours.
7. Guest builds the cart.
8. System calculates applicable charges.
9. System displays dynamic promise time.
10. Guest continues to checkout.


Pickup Ordering Flow

1. Guest selects Pickup.
2. Guest selects/uses the applicable outlet.
3. System checks pickup availability and operating hours.
4. Guest builds the cart.
5. System calculates applicable charges.
6. System displays pickup promise time.
7. Guest proceeds to checkout.


Dine-In Ordering Flow

1. Guest scans table QR code or provides the table identifier.
2. System validates the table context.
3. Guest views the menu.
4. Guest adds items to the table order.
5. Guest selects modifiers and options.
6. Guest adds instructions/allergy notes.
7. Order is associated with the table/running tab.
8. Additional rounds may be added where the capability is enabled.
9. The tab remains associated with the table until settlement.


Future Order Flow

1. Guest selects future ordering.
2. Guest chooses a future date/time.
3. System validates the selected time.
4. The requested time must be within applicable operating hours.
5. System calculates the applicable promise/ready time.
6. Guest continues to checkout.


Cart Modification Flow

1. Guest opens the cart.
2. Guest changes item quantity, modifiers or instructions.
3. System recalculates the affected item and cart totals.
4. Updated totals are displayed.
5. Guest continues to checkout.


Order Cancellation Flow

1. Guest opens the active order.
2. Guest selects Cancel.
3. System checks whether the order has been accepted by the kitchen.
4. If the kitchen has not accepted the order, cancellation may proceed according to policy.
5. If the kitchen has already accepted the order, staff approval is required.


Item Unavailable Flow

1. Guest has placed an order.
2. Item becomes unavailable.
3. Staff identifies the affected item.
4. Staff proposes a substitution or partial refund.
5. Guest reviews the proposed resolution.
6. Guest approves the resolution.
7. Preparation continues according to the approved resolution.


Kitchen Capacity Flow

1. Kitchen capacity approaches or reaches configured limits.
2. KDS/backend publishes capacity state.
3. Promise times are extended where applicable.
4. If ordering pause is configured, new ordering is paused.
5. Guest sees the updated availability/promise-time state.


POS/KDS Handoff Flow

1. Guest completes applicable ordering/payment step.
2. System creates the order.
3. Order is sent to the POS.
4. Order appears on the KDS.
5. KDS routes the order according to kitchen configuration.
6. Order progresses through fulfilment.


5.1.5.4 Functional Requirements

SRS-OR-001 – Service Type Selection

The Guest App shall allow the guest to select the applicable ordering service:

- Delivery
- Pickup
- Dine-in

The service shall only be offered where enabled for the selected outlet.


SRS-OR-002 – Delivery Ordering

The Guest App shall allow guests to create delivery orders.


SRS-OR-003 – Pickup Ordering

The Guest App shall allow guests to create pickup orders.


SRS-OR-004 – Dine-In Ordering

The system shall support dine-in ordering using a table identifier or QR code where
the capability is enabled.


SRS-OR-005 – Outlet Context

Every order shall be associated with the selected restaurant/outlet context.


SRS-OR-006 – Cart Item Addition

The guest shall be able to add valid menu items to the cart.


SRS-OR-007 – Quantity Management

The guest shall be able to increase, decrease or remove item quantities in the cart.


SRS-OR-008 – Modifier Selection

The guest shall be able to select configured modifiers and option groups for an item.


SRS-OR-009 – Item Instructions

The guest shall be able to provide instructions for individual items.


SRS-OR-010 – Order Instructions

The guest shall be able to provide instructions applying to the overall order.


SRS-OR-011 – Allergy Instructions

The guest shall be able to provide allergy-related instructions.

These instructions shall be prominently flagged for the kitchen.


SRS-OR-012 – Delivery Serviceability

Before delivery checkout, the system shall validate:

- Delivery zone
- Minimum order value
- Outlet operating hours


SRS-OR-013 – Delivery Address Validation

The delivery order shall use a valid delivery address that can be evaluated against
the selected outlet's delivery service area.


SRS-OR-014 – Minimum Order Validation

The system shall prevent delivery checkout when the configured minimum order
value has not been satisfied.


SRS-OR-015 – Operating Hours Validation

The system shall prevent invalid ordering times outside the applicable outlet/service
operating hours.


SRS-OR-016 – Itemized Pricing

The cart shall display itemized pricing.


SRS-OR-017 – Modifier Charges

The cart shall reflect applicable modifier price changes.


SRS-OR-018 – Tax Display

The cart shall display applicable taxes before payment.


SRS-OR-019 – Packaging Charges

Applicable packaging charges shall be displayed before payment.


SRS-OR-020 – Delivery Charges

Applicable delivery charges shall be displayed before payment.


SRS-OR-021 – Service Charges

Applicable service charges shall be displayed before payment.


SRS-OR-022 – Complete Cart Total

The system shall present the guest with the complete applicable charge breakdown
before payment authorisation.


SRS-OR-023 – Future Ordering

The system shall support future/scheduled ordering.


SRS-OR-024 – Future Order Validation

A scheduled order shall only be accepted for a valid future time within applicable
operating rules.


SRS-OR-025 – Order Promise Time

The system shall display a dynamic promise time.


SRS-OR-026 – Kitchen-Based Promise Time

Promise time shall reflect current kitchen load where applicable.


SRS-OR-027 – Delivery Travel Time

For delivery orders, promise time shall also consider applicable travel time.


SRS-OR-028 – Order Modification

Guests shall be able to amend an order before kitchen acceptance, subject to the
configured business rules.


SRS-OR-029 – Order Cancellation

Guests shall be able to cancel an order before kitchen acceptance, subject to the
configured business rules.


SRS-OR-030 – Post-Acceptance Cancellation

After kitchen acceptance, cancellation shall require staff approval.


SRS-OR-031 – Running Tab

The system shall support adding multiple dine-in rounds to a running tab where
enabled.


SRS-OR-032 – Group Ordering

The system may support several guests adding items to a shared table cart.


SRS-OR-033 – Table Context

Dine-in order items shall be associated with the correct table/running-tab context.


SRS-OR-034 – Order Submission

The system shall create an order after successful validation and applicable checkout
completion.


SRS-OR-035 – POS Handoff

The system shall send the accepted order to the existing POS integration.


SRS-OR-036 – KDS Handoff

The order shall appear on the KDS for kitchen fulfilment.


SRS-OR-037 – Order State

The system shall maintain the order lifecycle state from creation through fulfilment.


SRS-OR-038 – Item Unavailable Resolution

When an ordered item becomes unavailable, the system shall support the staff
substitution or partial-refund resolution flow.


SRS-OR-039 – Guest Resolution Approval

Where required by the unavailable-item policy, preparation shall not continue until
the guest approves the proposed resolution.


SRS-OR-040 – Capacity Throttling

The ordering system shall respond to kitchen capacity controls.


SRS-OR-041 – Dynamic Capacity Promise

When capacity is constrained, promise times shall be extended where configured.


SRS-OR-042 – Ordering Pause

The system shall support pausing new ordering when the kitchen capacity policy
requires it.


5.1.5.5 Business Rules

BR-OR-001

Every order must have a valid restaurant/outlet context.


BR-OR-002

Every order must have a valid service type.


BR-OR-003

Delivery orders must pass delivery-zone validation before checkout.


BR-OR-004

Delivery orders must satisfy the configured minimum order value.


BR-OR-005

Delivery orders must be placed within applicable outlet operating hours.


BR-OR-006

The guest must see applicable item, modifier, tax, packaging, delivery and service
charges before payment.


BR-OR-007

Item-level instructions must remain associated with the correct order item.


BR-OR-008

Order-level instructions must remain associated with the correct order.


BR-OR-009

Allergy instructions must be prominently available to the kitchen.


BR-OR-010

Future orders must comply with configured operating-hour rules.


BR-OR-011

Guest modification/cancellation is permitted only before kitchen acceptance unless
staff approval is required by policy.


BR-OR-012

After kitchen acceptance, cancellation requires staff approval.


BR-OR-013

Promise time must use current kitchen load where applicable.


BR-OR-014

Delivery promise time must consider travel time where delivery data is available.


BR-OR-015

Running-tab orders must remain associated with the correct table/tab.


BR-OR-016

Group-order access must be restricted to the appropriate table/group context.


BR-OR-017

Orders must be associated with the correct outlet before POS/KDS submission.


BR-OR-018

Unavailable-item resolution must follow the configured substitution/partial-refund
process.


BR-OR-019

Guest approval is required before preparation continues where the unavailable-item
resolution policy requires it.


BR-OR-020

Kitchen capacity controls take precedence over accepting orders that cannot be
fulfilled within configured operating limits.


BR-OR-021

When configured, capacity controls may extend promise times.


BR-OR-022

When configured, the system may pause new orders when kitchen capacity is reached.


BR-OR-023

An order must not be represented as successfully handed off to POS/KDS unless
the applicable integration confirms successful processing or an explicit exception
state is recorded.


5.1.5.6 Validations

Validation 1 – Service Type

Condition:
Guest attempts to continue without selecting a supported service.

Expected:
System requires a valid service type.


Validation 2 – Outlet Context

Condition:
Order does not contain a valid outlet.

Expected:
System prevents order creation.


Validation 3 – Delivery Zone

Condition:
Delivery address is outside the selected outlet's configured delivery zone.

Expected:
Delivery checkout is prevented.


Validation 4 – Minimum Order

Condition:
Delivery cart total is below the configured minimum order value.

Expected:
System prevents delivery checkout and displays the required minimum.


Validation 5 – Operating Hours

Condition:
Guest selects an ordering time outside applicable outlet/service hours.

Expected:
System prevents the invalid order time.


Validation 6 – Empty Cart

Condition:
Guest attempts to proceed with an empty cart.

Expected:
System prevents checkout/order submission.


Validation 7 – Modifier Validation

Condition:
Required modifier selection is incomplete or invalid.

Expected:
System prevents the item from being completed until valid selections are provided.


Validation 8 – Item Unavailable

Condition:
Item becomes unavailable before order submission.

Expected:
System identifies the unavailable item and prevents it from being ordered normally.


Validation 9 – Future Order Time

Condition:
Selected future time is outside applicable operating rules.

Expected:
System prevents the invalid scheduled order.


Validation 10 – Order Modification

Condition:
Guest attempts modification after kitchen acceptance.

Expected:
System prevents guest modification and follows staff-approval workflow.


Validation 11 – Order Cancellation

Condition:
Guest attempts cancellation after kitchen acceptance.

Expected:
System prevents direct guest cancellation and follows staff-approval workflow.


Validation 12 – Dynamic Promise Time

Condition:
Kitchen load changes before order confirmation.

Expected:
System refreshes/recalculates applicable promise time.


Validation 13 – Dine-In Table

Condition:
QR/table identifier is invalid or inactive.

Expected:
System prevents the dine-in order from being associated with the invalid table.


Validation 14 – Group Order

Condition:
Guest attempts access to another table's group order.

Expected:
System prevents unauthorized access.


Validation 15 – Kitchen Capacity

Condition:
Kitchen has reached a configured capacity threshold.

Expected:
System extends promise time or pauses ordering according to configured rules.


Validation 16 – POS Handoff

Condition:
POS order injection fails.

Expected:
System keeps the order in an explicit pending/exception state, retries according
to integration rules and alerts the responsible staff/system process.


5.1.5.7 Proposed API Requirements

These API contracts are proposed SRS technical design items.
The BRS defines the business behavior but does not specify API names.


POST /api/v1/orders

Purpose:
Create an order.


GET /api/v1/orders/{order_id}

Purpose:
Retrieve order details and current state.


PATCH /api/v1/orders/{order_id}

Purpose:
Modify eligible order information before kitchen acceptance.


POST /api/v1/orders/{order_id}/cancel

Purpose:
Request cancellation of an eligible order.


POST /api/v1/cart/items

Purpose:
Add an item to the cart.


PATCH /api/v1/cart/items/{cart_item_id}

Purpose:
Update quantity/modifiers/instructions.


DELETE /api/v1/cart/items/{cart_item_id}

Purpose:
Remove an item from the cart.


GET /api/v1/cart

Purpose:
Retrieve the current cart.


POST /api/v1/cart/validate

Purpose:
Validate cart data before checkout.


POST /api/v1/orders/validate-delivery

Purpose:
Validate delivery serviceability.


POST /api/v1/orders/promise-time

Purpose:
Calculate/retrieve the current promise time.


POST /api/v1/orders/{order_id}/submit

Purpose:
Submit the order for fulfilment.


GET /api/v1/orders/{order_id}/status

Purpose:
Retrieve current order state.


POST /api/v1/orders/{order_id}/item-resolution

Purpose:
Create a substitution/partial-refund resolution for an unavailable item.


POST /api/v1/orders/{order_id}/item-resolution/{resolution_id}/approve

Purpose:
Record guest approval of an unavailable-item resolution.


GET /api/v1/outlets/{outlet_id}/capacity

Purpose:
Retrieve relevant kitchen/order-capacity status.


POST /api/v1/dine-in/tables/{table_id}/orders

Purpose:
Create/associate a dine-in order with a valid table context.


Important:

Final endpoint names, payload schemas, authentication, idempotency, cart persistence,
concurrency handling, database transactions, and POS/KDS integration contracts shall
be finalized in the Backend/API Architecture.


5.1.5.8 Data Requirements

Order

Core BRS fields:

- Order ID
- Guest ID where applicable
- Outlet
- Channel
- Items
- Modifiers
- Amounts
- Taxes
- Status timeline
- Fulfilment record

Proposed additional SRS fields:

- Service type
- Table ID
- Delivery address ID
- Scheduled time
- Promise time
- Delivery/travel estimate
- Packaging charge
- Delivery charge
- Service charge
- Order instructions
- Cancellation status
- Cancellation reason
- Kitchen acceptance time
- POS reference
- KDS reference
- Created at
- Updated at


Order Item

Suggested fields:

- Order item ID
- Order ID
- Menu item ID
- Quantity
- Unit price
- Total price
- Modifier selections
- Item instructions
- Allergy flag
- Item status


Cart

Suggested fields:

- Cart ID
- Guest/session ID
- Outlet ID
- Service type
- Table ID where applicable
- Cart items
- Subtotal
- Modifier total
- Tax
- Packaging
- Delivery charge
- Service charge
- Total
- Scheduled time
- Created at
- Updated at


Delivery Context

Suggested fields:

- Delivery address ID
- Outlet ID
- Serviceability status
- Delivery zone
- Minimum order result
- Estimated travel time
- Promise time


Dine-In Running Tab

Suggested fields:

- Tab ID
- Outlet ID
- Table ID
- Guest/session context
- Order IDs
- Tab status
- Opened at
- Settled at


Order State

Suggested states are proposed for SRS design:

- Cart
- Pending Validation
- Pending Submission
- Submitted
- Pending POS
- Accepted
- Preparing
- Ready
- Dispatched
- Completed
- Cancelled
- Exception

The final order state machine shall be finalized in the backend design.

BRS Alignment:

The BRS defines Order as a core entity containing channel, items, modifiers, amounts,
taxes, status timeline and fulfilment record. The additional fields above are proposed
SRS/data-design fields.


5.1.5.9 Error / Exception Handling

E-OR-01 – Cart Loading Failure

Scenario:
Cart cannot be retrieved.

Expected:
- Display a clear error.
- Provide retry.
- Do not create an order from incomplete cart data.


E-OR-02 – Menu Item Became Unavailable

Scenario:
Item becomes unavailable before order submission.

Expected:
- Identify the unavailable item.
- Prevent invalid order submission.
- Allow guest to remove/change the item.


E-OR-03 – Delivery Not Serviceable

Scenario:
Delivery address is outside the selected outlet's service area.

Expected:
- Prevent delivery checkout.
- Inform guest that delivery is unavailable for the address.


E-OR-04 – Minimum Order Not Met

Scenario:
Cart is below minimum order value.

Expected:
- Prevent delivery checkout.
- Show the remaining amount required where appropriate.


E-OR-05 – Operating Hours Violation

Scenario:
Guest selects an invalid ordering time.

Expected:
- Prevent submission.
- Display valid ordering availability.


E-OR-06 – Promise-Time Calculation Failure

Scenario:
Promise time cannot be calculated.

Expected:
- Do not show an unverified promise time as final.
- Provide retry or fallback behavior defined by backend policy.


E-OR-07 – Order Submission Failure

Scenario:
Order cannot be submitted.

Expected:
- Inform guest that the order was not successfully submitted.
- Preserve the cart/order attempt where possible.


E-OR-08 – POS Handoff Failure

Scenario:
Order cannot be injected into POS.

Expected:
- Keep the order in a durable pending/exception state.
- Retry according to integration policy.
- Alert responsible operational staff/system.


E-OR-09 – KDS Handoff Failure

Scenario:
Order does not appear on the KDS.

Expected:
- Record the failure.
- Trigger retry/alert workflow.
- Do not silently mark the order as fully handed off.


E-OR-10 – Item Unavailable After Order

Scenario:
Ordered item becomes unavailable.

Expected:
- Staff proposes substitution or partial refund.
- Guest approves the applicable resolution before preparation continues.


E-OR-11 – Kitchen Capacity Reached

Scenario:
Kitchen reaches configured capacity.

Expected:
- Extend promise time or pause ordering according to configured policy.


E-OR-12 – Invalid Dine-In Table

Scenario:
Table QR/table ID is invalid.

Expected:
- Prevent association with the table.
- Ask the guest to scan/use a valid table identifier.


E-OR-13 – Group Order Access Failure

Scenario:
Guest cannot be verified as a member of the shared table order.

Expected:
- Prevent access to the group cart/order.


5.1.5.10 Security & Privacy Considerations

- Order APIs shall validate guest/session authorization.
- Guests shall not be able to access another guest's order.
- Dine-in orders shall validate table context.
- Group-order access shall be restricted to the appropriate table/session.
- Client-supplied prices must not be treated as authoritative by the backend.
- Backend shall recalculate/validate applicable prices and charges.
- Outlet/service context must be validated server-side.
- Order instructions and allergy information must be protected as guest/order data.
- POS/KDS integration credentials shall never be exposed to the Guest App.
- Order state transitions shall be controlled server-side.
- Sensitive payment data shall not be stored in the ordering module.


5.1.5.11 Acceptance Criteria

AC-OR-001

Guest can select delivery, pickup or supported dine-in ordering.


AC-OR-002

Guest can add menu items to the cart.


AC-OR-003

Guest can update quantities and remove cart items.


AC-OR-004

Guest can select configured modifiers and options.


AC-OR-005

Guest can add item-level instructions.


AC-OR-006

Guest can add order-level instructions.


AC-OR-007

Allergy instructions are prominently represented for kitchen fulfilment.


AC-OR-008

Delivery serviceability is validated before delivery checkout.


AC-OR-009

Minimum delivery order value is validated.


AC-OR-010

Outlet operating hours are enforced.


AC-OR-011

Cart displays itemized prices and applicable charges before payment.


AC-OR-012

Future ordering works for valid configured operating times.


AC-OR-013

Guests can modify eligible orders before kitchen acceptance.


AC-OR-014

Guests can cancel eligible orders before kitchen acceptance.


AC-OR-015

Post-kitchen-acceptance cancellation follows staff approval workflow.


AC-OR-016

Dynamic promise time is displayed based on applicable kitchen/delivery data.


AC-OR-017

Dine-in order is associated with the correct table context where enabled.


AC-OR-018

Running-tab behavior works where enabled.


AC-OR-019

Group-order capability is isolated to the correct table/group context where enabled.


AC-OR-020

Order reaches the existing POS integration correctly.


AC-OR-021

Order reaches the KDS correctly.


AC-OR-022

Unavailable-item resolution follows the substitution/partial-refund process.


AC-OR-023

Kitchen capacity controls extend promise times or pause ordering according to
configuration.


AC-OR-024

Order exceptions are not silently lost.


AC-OR-025

The correct outlet, service type, items, modifiers and instructions are preserved
through the order lifecycle.


5.1.5.12 Dependencies

- 5.1.2 Restaurant & Location Selection
- 5.1.3 Menu & Discovery
- Guest Authentication & Guest Account
- Cart service
- Order management
- Delivery serviceability
- Outlet operating hours
- POS integration
- KDS integration
- Payment module
- Kitchen capacity signals
- Notification module
- Table/QR configuration
- PostgreSQL
- Redis where required for cart/session/realtime workloads
- Backend Ordering APIs


5.1.5.13 TBD / Open Decisions

TBD-OR-001

What are the exact order service types for Phase 1?


TBD-OR-002

How is delivery zone represented?

Possible approaches:
- ZIP code
- Radius
- Polygon
- Provider-defined service area


TBD-OR-003

What is the final source of truth for delivery serviceability?


TBD-OR-004

How is the minimum order value configured by outlet/service?


TBD-OR-005

How are taxes calculated and which system owns the authoritative tax calculation?


TBD-OR-006

How are packaging and service charges configured?


TBD-OR-007

How is the delivery charge calculated?


TBD-OR-008

What is the exact promise-time formula?


TBD-OR-009

How frequently is kitchen load refreshed?


TBD-OR-010

Should promise-time updates use WebSockets or request-based refresh?


TBD-OR-011

What exact order-state machine will be used?


TBD-OR-012

When exactly is an order considered "accepted"?


TBD-OR-013

What is the exact guest modification cut-off relative to kitchen acceptance?


TBD-OR-014

What is the exact cancellation policy after order submission?


TBD-OR-015

What are the staff approval rules for post-acceptance cancellation?


TBD-OR-016

How should unavailable-item substitution be presented to the guest?


TBD-OR-017

What partial-refund rules apply to unavailable items?


TBD-OR-018

How long should the guest have to approve a substitution/refund?


TBD-OR-019

What happens when the guest does not respond?


TBD-OR-020

What are the exact kitchen capacity thresholds?


TBD-OR-021

When should ordering automatically pause?


TBD-OR-022

What is the exact POS order injection contract?


TBD-OR-023

What is the exact KDS integration contract?


TBD-OR-024

What is the cart persistence strategy for authenticated and guest users?


TBD-OR-025

What happens to the cart when the guest changes outlet?


TBD-OR-026

Should group ordering be implemented in Phase 1?


TBD-OR-027

Should dine-in ordering be implemented in Phase 1?


TBD-OR-028

How should multiple rounds be represented in the running tab?


TBD-OR-029

What is the exact table QR/session lifecycle?


TBD-OR-030

What happens if the guest loses network connectivity during cart/order submission?


TBD-OR-031

What is the retry and idempotency strategy for order creation?


TBD-OR-032

What is the authoritative price source: Admin, POS, or another menu/pricing service?


TBD-OR-033

What happens when menu price changes while the guest has an existing cart?


5.1.5.14 BRS Priority Summary

M – Must Have

- FR-OR-01
- FR-OR-02
- FR-OR-03
- FR-OR-04
- FR-OR-06
- FR-OR-07

S – Should Have

- FR-OR-05
- FR-OR-08

C – Could Have

- FR-OR-09


The above priority classification follows the BRS.


5.1.5.15 BRS Scope Clarification / Open Decision

The BRS contains an important scope point that should not be silently resolved.

FR-OR-01 marks delivery, pickup and dine-in ordering as a Must requirement.

However, the BRS release phasing places dine-in table ordering/pay-at-table under
Phase 2, while Phase 1 explicitly describes pickup and delivery ordering.

Therefore:

Dine-in ordering should remain documented in the SRS because it exists in the BRS,
but the Phase 1 implementation status must be confirmed by the product/business
stakeholders before development scope is finalized.

This should be handled as a formal scope clarification rather than silently choosing
one interpretation.


5.1.5.16 Module Status

Status:
Draft – SRS Definition

BRS Coverage:
Direct mapping available for FR-OR-01 to FR-OR-09.

Additional BRS Mapping:
- BRS 7.2 Off-Premise Order to Fulfilment
- BRS 7.3 Item unavailable exception
- BRS 7.3 Kitchen capacity exception

Implementation Note:
The BRS defines the business requirements and major process behavior, but does not
define the final API contracts, database schema, order-state machine, promise-time
formula, cart persistence, concurrency strategy, tax implementation, delivery-zone
algorithm, or POS/KDS technical contracts.

These items remain SRS/design decisions.

Next Module:
5.1.6 Guest App → Payments, Billing & Refunds
-------------------------------------------------
5.1.4 Reservations & Waitlist

5.1.4.1 Module Overview

The Reservations & Waitlist module allows guests to reserve a table at a selected
restaurant outlet and join or manage a virtual waitlist when a table is not immediately
available.

The module shall support:

- Outlet selection
- Date and time selection
- Party size selection
- Configurable reservation slot intervals
- Reservation duration based on party size
- Live availability checking
- Occasion and seating preferences
- Special requests
- Reservation confirmation
- Reservation modification
- Reservation cancellation
- Configurable reminders
- One-tap confirmation for high-demand slots
- Optional deposit or card hold
- Virtual waitlist
- Waitlist position
- Estimated wait time
- Waitlist notification
- Released-capacity allocation
- Configured overbooking tolerance
- Table blocking
- No-show recording
- Late-arrival handling

The reservation availability shall use the selected outlet's live floor plan,
service duration assumptions, and configured capacity rules.


5.1.4.2 BRS Requirement Mapping

| SRS ID | BRS ID | Requirement | Priority |
|--------|--------|-------------|----------|
| SRS-RS-001 | FR-RS-01 | Guests can book a table by outlet, date, time and party size, with configurable slot intervals and duration by party size. | M |
| SRS-RS-002 | FR-RS-02 | Availability is calculated from the live floor plan, service duration assumptions and configured capacity limits. | M |
| SRS-RS-003 | FR-RS-03 | Guests can state occasion, seating preference and special requests, which are shown to staff before seating. | M |
| SRS-RS-004 | FR-RS-04 | Guests can modify or cancel a booking, subject to a configurable cut-off, and receive immediate confirmation. | M |
| SRS-RS-005 | FR-RS-05 | The system sends configurable reminders and requires a one-tap confirmation for high-demand slots. | M |
| SRS-RS-006 | FR-RS-06 | A deposit or card hold can be required for defined party sizes or peak periods, with a published cancellation policy. | S |
| SRS-RS-007 | FR-RS-07 | Guests can join a virtual waitlist remotely or on site, see position and estimated wait, and be notified when the table is ready. | M |
| SRS-RS-008 | FR-RS-08 | Cancelled or released capacity is automatically offered to waitlisted guests in order. | S |
| SRS-RS-009 | FR-RS-09 | Staff can overbook within a configured tolerance and can block tables for maintenance or private events. | M |
| SRS-RS-010 | FR-RS-10 | No-shows and late arrivals are recorded on the guest profile and can trigger policy consequences. | S |
| SRS-RS-011 | BRS 7.1 | Reservation flow includes outlet, date, time, party size, occasion/seating preference, availability check, confirmation, reminders, check-in and waitlist handling. | M |
| SRS-RS-012 | BRS 7.3 | Late arrival beyond the grace period can result in table release and the next available slot or waitlist being offered. | M |


5.1.4.3 User Flow

Primary Reservation Flow

1. Guest selects restaurant/outlet.
2. Guest selects reservation date.
3. Guest selects reservation time.
4. Guest selects party size.
5. Guest optionally provides occasion, seating preference and special request.
6. System checks live availability.
7. System displays available reservation slots.
8. Guest selects a slot.
9. System applies the applicable reservation policy.
10. If a deposit/card hold is required, the guest is informed and completes the
    applicable payment/hold process.
11. Guest confirms the reservation.
12. System creates the reservation.
13. Guest receives confirmation.
14. System schedules applicable reminders.
15. Guest arrives and checks in.
16. Staff sees the reservation and guest details before seating.


Unavailable Slot Flow

1. Guest selects a requested date/time.
2. System checks live capacity.
3. Requested slot is unavailable.
4. System displays available alternatives according to configured availability.
5. Guest selects an alternative or joins the waitlist where applicable.


Modification Flow

1. Guest opens an existing reservation.
2. Guest selects Modify.
3. System displays the current reservation.
4. Guest changes permitted information.
5. System rechecks availability and reservation policy.
6. System updates the reservation if valid.
7. Guest receives immediate confirmation.


Cancellation Flow

1. Guest opens an existing reservation.
2. Guest selects Cancel.
3. System checks the configured cancellation cut-off.
4. If cancellation is permitted, reservation is cancelled.
5. Applicable deposit/card-hold policy is processed.
6. Guest receives confirmation.


Waitlist Flow

1. Guest selects outlet/date/time/party size.
2. Requested table is unavailable.
3. Guest chooses Join Waitlist.
4. System creates a waitlist entry.
5. Guest receives current position and estimated wait.
6. Capacity becomes available.
7. System offers released capacity according to waitlist order.
8. Guest is notified when the table is ready.
9. Guest proceeds to seating according to the applicable process.


High-Demand Reservation Flow

1. Guest selects a high-demand slot.
2. System identifies the slot as requiring confirmation.
3. Guest receives the applicable confirmation request.
4. Guest confirms using the defined one-tap action.
5. Reservation remains confirmed according to the configured policy.


Late Arrival Flow

1. Guest has an active reservation.
2. Guest arrives later than the configured grace period.
3. System/staff records the late-arrival event.
4. Staff applies the configured late-arrival policy.
5. Table may be released according to policy.
6. Guest may be offered the next available slot or waitlist.


No-Show Flow

1. Guest does not arrive for the reservation.
2. Staff/system records the no-show.
3. No-show is associated with the guest profile.
4. Configured policy consequences may be applied.


5.1.4.4 Functional Requirements

SRS-RS-001 – Reservation Creation

The Guest App shall allow the guest to create a reservation by selecting:

- Outlet
- Date
- Time
- Party size


SRS-RS-002 – Configurable Slot Intervals

The reservation engine shall support configurable reservation slot intervals.


SRS-RS-003 – Reservation Duration

Reservation duration shall be configurable based on party size.


SRS-RS-004 – Live Availability

The system shall calculate reservation availability using:

- Live floor-plan status
- Service duration assumptions
- Configured capacity limits


SRS-RS-005 – Occasion

The guest shall be able to specify an occasion associated with the reservation.


SRS-RS-006 – Seating Preference

The guest shall be able to specify a seating preference.


SRS-RS-007 – Special Requests

The guest shall be able to provide special requests.

These details shall be available to staff before seating.


SRS-RS-008 – Reservation Confirmation

The system shall create the reservation after successful confirmation and provide the
guest with confirmation of the resulting reservation state.


SRS-RS-009 – Reservation Modification

The guest shall be able to modify an existing booking subject to the configured
modification policy and cut-off.


SRS-RS-010 – Reservation Cancellation

The guest shall be able to cancel a booking subject to the configured cancellation
cut-off and policy.


SRS-RS-011 – Immediate Confirmation

The system shall provide immediate confirmation after a successful reservation
modification or cancellation.


SRS-RS-012 – Reservation Reminders

The system shall send configurable reservation reminders.

The BRS reservation flow specifies reminders at:

- 24 hours before arrival
- 2 hours before arrival


SRS-RS-013 – High-Demand Confirmation

The system shall support one-tap confirmation for high-demand reservation slots.


SRS-RS-014 – Deposit / Card Hold

The reservation system shall support an optional deposit or card hold for configured
party sizes or peak periods.


SRS-RS-015 – Cancellation Policy

Where a deposit or card hold applies, the applicable cancellation policy shall be
published to the guest.


SRS-RS-016 – Virtual Waitlist

The system shall allow guests to join a virtual waitlist remotely or on site.


SRS-RS-017 – Waitlist Position

The guest shall be able to view the current waitlist position.


SRS-RS-018 – Estimated Wait

The system shall provide an estimated wait time for a waitlist entry.


SRS-RS-019 – Waitlist Notification

The guest shall be notified when the table is ready.


SRS-RS-020 – Released Capacity

Cancelled or released reservation capacity shall be eligible for allocation to waitlisted
guests according to configured waitlist ordering.


SRS-RS-021 – Overbooking Tolerance

The system shall allow authorized staff to overbook only within the configured tolerance.


SRS-RS-022 – Table Blocking

The system shall support blocking tables for:

- Maintenance
- Private events

Blocked tables shall be excluded from normal availability.


SRS-RS-023 – No-Show Recording

The system shall record no-show events against the guest profile.


SRS-RS-024 – Late-Arrival Recording

The system shall record late-arrival events against the guest profile.


SRS-RS-025 – Policy Consequences

The system shall support configured policy consequences for no-shows and late arrivals.


SRS-RS-026 – Reservation Outlet Context

Each reservation shall remain associated with the selected outlet throughout the
reservation lifecycle.


SRS-RS-027 – Check-In

The reservation process shall support guest check-in as part of the reservation-to-seating
flow.


SRS-RS-028 – Staff Visibility

Reservation occasion, seating preference and special requests shall be available to
authorized staff before seating.


5.1.4.5 Business Rules

BR-RS-001

Every reservation must be associated with a specific outlet.


BR-RS-002

A reservation slot may be offered only when the selected outlet has availability under
its configured capacity and floor-plan rules.


BR-RS-003

Reservation slot intervals must use the configured interval for the applicable outlet.


BR-RS-004

Reservation duration must use the configured duration applicable to the party size.


BR-RS-005

Occasion, seating preference and special requests must be stored with the reservation.


BR-RS-006

Reservation modification and cancellation must respect the configured cut-off.


BR-RS-007

High-demand reservations may require one-tap confirmation when the policy is enabled.


BR-RS-008

Deposits/card holds shall only be required when configured for applicable party sizes
or peak periods.


BR-RS-009

The applicable cancellation policy must be presented when a deposit/card hold applies.


BR-RS-010

Waitlist entries must have an ordered position.


BR-RS-011

Released capacity must be offered to waitlisted guests in waitlist order.


BR-RS-012

Overbooking must remain within the configured tolerance.


BR-RS-013

Blocked tables must not be allocated through normal reservation availability.


BR-RS-014

No-shows and late arrivals must be recorded against the guest profile.


BR-RS-015

Late-arrival handling must follow the configured grace period and policy.


BR-RS-016

Reservation state changes must be reflected consistently across the Guest App and
staff-facing reservation workflow.


5.1.4.6 Validations

Validation 1 – Outlet Required

Condition:
Guest attempts to start a reservation without selecting an outlet.

Expected:
System requires an outlet before availability can be evaluated.


Validation 2 – Party Size Required

Condition:
Guest attempts to search availability without party size.

Expected:
System requires a valid party size.


Validation 3 – Invalid Date/Time

Condition:
Guest selects an invalid or unavailable reservation date/time.

Expected:
System does not allow an invalid reservation slot.


Validation 4 – Slot Unavailable

Condition:
Requested slot has no available capacity.

Expected:
System does not create the reservation and displays available alternatives.


Validation 5 – Capacity Change

Condition:
Capacity changes after the guest initially sees an available slot.

Expected:
System revalidates availability before confirming the reservation.


Validation 6 – Modification Cut-Off

Condition:
Guest attempts to modify after the configured modification cut-off.

Expected:
System prevents the modification according to policy.


Validation 7 – Cancellation Cut-Off

Condition:
Guest attempts to cancel after the configured cancellation cut-off.

Expected:
System applies the configured cancellation policy.


Validation 8 – High-Demand Confirmation

Condition:
High-demand slot requires confirmation and guest does not complete confirmation.

Expected:
System applies the configured reservation policy.


Validation 9 – Deposit/Card Hold

Condition:
Selected reservation meets the configured deposit/card-hold criteria.

Expected:
System requires the applicable deposit/card hold before completing the reservation.


Validation 10 – Waitlist Entry

Condition:
Guest attempts to join waitlist without required reservation information.

Expected:
System requests the required outlet, date/time and party size information.


Validation 11 – Waitlist Capacity Release

Condition:
Capacity is released.

Expected:
System evaluates waitlist entries and offers released capacity according to waitlist order.


Validation 12 – Overbooking Limit

Condition:
Staff attempts to exceed configured overbooking tolerance.

Expected:
System prevents the overbooking action.


Validation 13 – Blocked Table

Condition:
A table is blocked for maintenance/private event.

Expected:
The table is excluded from normal reservation allocation.


Validation 14 – Late Arrival

Condition:
Guest arrives beyond configured grace period.

Expected:
System/staff follows the configured late-arrival policy.


Validation 15 – No-Show

Condition:
Guest does not arrive.

Expected:
Reservation is recorded as a no-show according to staff/system workflow and associated
with the guest profile.


5.1.4.7 Proposed API Requirements

These API contracts are proposed SRS design items.
The BRS defines the reservation business behavior but does not define API names.


GET /api/v1/outlets/{outlet_id}/reservations/availability

Purpose:
Retrieve available reservation slots.

Suggested parameters:

- date
- party_size


POST /api/v1/reservations

Purpose:
Create a reservation.


GET /api/v1/reservations/{reservation_id}

Purpose:
Retrieve reservation details.


PATCH /api/v1/reservations/{reservation_id}

Purpose:
Modify a reservation.


POST /api/v1/reservations/{reservation_id}/cancel

Purpose:
Cancel a reservation.


POST /api/v1/reservations/{reservation_id}/confirm

Purpose:
Confirm a high-demand reservation.


POST /api/v1/reservations/{reservation_id}/check-in

Purpose:
Record guest check-in.


GET /api/v1/outlets/{outlet_id}/waitlist

Purpose:
Retrieve applicable waitlist information.


POST /api/v1/waitlist

Purpose:
Join the virtual waitlist.


GET /api/v1/waitlist/{waitlist_id}

Purpose:
Retrieve waitlist position and estimated wait.


POST /api/v1/waitlist/{waitlist_id}/accept

Purpose:
Record guest acceptance of a released/ready table where applicable.


POST /api/v1/reservations/{reservation_id}/deposit

Purpose:
Handle reservation deposit/card-hold workflow where applicable.


Important:

Final endpoint naming, request/response schema, authentication, idempotency,
concurrency control and transaction handling shall be finalized in the Backend/API
Architecture.


5.1.4.8 Data Requirements

Reservation

The BRS identifies the following reservation data:

- Reservation ID
- Outlet
- Date
- Time
- Party size
- Status
- Occasion
- Notes
- Deposit
- No-show flag

Suggested additional SRS fields:

- Guest ID
- Seating preference
- Special request
- Reservation duration
- Created at
- Updated at
- Confirmation status
- Check-in time
- Cancellation time
- Cancellation reason
- Late-arrival flag

Waitlist Entry

Suggested fields:

- Waitlist ID
- Guest ID
- Outlet ID
- Requested date
- Requested time
- Party size
- Position
- Estimated wait
- Status
- Joined at
- Notified at
- Accepted at
- Expired at

Reservation Policy

Suggested fields:

- Outlet ID
- Slot interval
- Duration rules
- Cancellation cut-off
- Modification cut-off
- Grace period
- Deposit rules
- Card-hold rules
- High-demand confirmation rule
- Overbooking tolerance

Table Availability / Block

Suggested fields:

- Outlet ID
- Table ID
- Status
- Block type
- Block reason
- Start time
- End time

The above additional fields are proposed SRS/data-design fields. The BRS explicitly
defines the core Reservation attributes and staff/outlet operational relationship.


5.1.4.9 Error / Exception Handling

E-RS-01 – Availability Service Failure

Scenario:
Reservation availability cannot be retrieved.

Expected:
- Show a clear error state.
- Allow retry.
- Do not confirm a reservation without successful availability validation.


E-RS-02 – Slot Became Unavailable

Scenario:
Another reservation consumes the slot before guest confirmation.

Expected:
- Revalidate.
- Do not create the conflicting reservation.
- Show alternative availability.


E-RS-03 – Reservation Creation Failure

Scenario:
Reservation cannot be created.

Expected:
- Inform guest that the reservation was not completed.
- Do not show it as confirmed unless the backend confirms success.


E-RS-04 – Deposit/Card Hold Failure

Scenario:
Required deposit/card hold cannot be completed.

Expected:
- Do not confirm the reservation unless policy explicitly permits an alternative flow.


E-RS-05 – Modification Failure

Scenario:
Requested modification cannot be applied.

Expected:
- Keep the original reservation state unchanged where possible.
- Inform the guest that the requested change was not completed.


E-RS-06 – Cancellation Failure

Scenario:
Cancellation request fails.

Expected:
- Do not show the reservation as cancelled unless cancellation is confirmed.


E-RS-07 – Waitlist Failure

Scenario:
Waitlist service is unavailable.

Expected:
- Inform guest that waitlist joining could not be completed.
- Provide retry.


E-RS-08 – Released Capacity Conflict

Scenario:
Released capacity is no longer available when offered.

Expected:
- Revalidate before allocation.
- Continue according to waitlist rules.


E-RS-09 – Late Arrival

Scenario:
Guest arrives beyond configured grace period.

Expected:
- Follow configured policy.
- Table may be released.
- Guest may be offered the next available slot or waitlist.


E-RS-10 – No-Show

Scenario:
Guest does not arrive.

Expected:
- Record no-show.
- Apply configured policy consequence where applicable.


5.1.4.10 Security & Privacy Considerations

- Guest reservation APIs shall require appropriate guest/session authorization.
- A guest shall only be able to view or modify reservations they are authorized to access.
- Staff access to guest notes and reservation details shall follow role permissions.
- Deposit/card-hold information shall not expose sensitive payment credentials.
- Reservation and guest data shall be transmitted securely.
- Reservation actions shall be auditable where required.
- No-show and late-arrival information is part of guest history and shall be protected as
  guest data.


5.1.4.11 Acceptance Criteria

AC-RS-001

Guest can select an outlet, date, time and party size and search reservation availability.


AC-RS-002

Reservation availability reflects the selected outlet's live floor-plan/capacity rules.


AC-RS-003

Guest can provide occasion, seating preference and special requests.


AC-RS-004

Reservation details are available to authorized staff before seating.


AC-RS-005

Guest can successfully create an available reservation.


AC-RS-006

Guest can modify a reservation within the configured policy.


AC-RS-007

Guest can cancel a reservation within the configured policy.


AC-RS-008

Successful reservation changes provide immediate confirmation.


AC-RS-009

Configured reminders are generated for applicable reservations.


AC-RS-010

High-demand slots can require one-tap confirmation.


AC-RS-011

Configured reservations can require a deposit/card hold.


AC-RS-012

Guest can join a virtual waitlist remotely or on site.


AC-RS-013

Guest can view waitlist position and estimated wait.


AC-RS-014

Guest receives notification when the table is ready.


AC-RS-015

Released capacity is offered to waitlisted guests according to waitlist order.


AC-RS-016

Staff cannot exceed configured overbooking tolerance.


AC-RS-017

Blocked tables are excluded from normal reservation availability.


AC-RS-018

No-shows and late arrivals are recorded against the guest profile.


AC-RS-019

Late-arrival policy is applied according to the configured grace period.


AC-RS-020

Reservation data remains associated with the correct outlet and guest.


5.1.4.12 Dependencies

- 5.1.2 Restaurant & Location Selection
- Guest Authentication & Guest Account
- Restaurant/Outlet configuration
- Table/floor-plan data
- Reservation policy configuration
- Admin Console
- Staff App
- Notification service
- Payment provider for optional deposit/card hold
- Guest profile
- PostgreSQL reservation data
- Backend reservation APIs
- Real-time availability mechanism where required


5.1.4.13 TBD / Open Decisions

TBD-RS-001
What is the exact reservation slot interval?


TBD-RS-002
What are the exact reservation duration rules by party size?


TBD-RS-003
What is the maximum supported party size?


TBD-RS-004
What is the exact cancellation cut-off?


TBD-RS-005
What is the exact modification cut-off?


TBD-RS-006
What is the exact late-arrival grace period?


TBD-RS-007
What are the exact no-show consequences?


TBD-RS-008
Which party sizes require a deposit?


TBD-RS-009
Which peak periods require a deposit/card hold?


TBD-RS-010
What is the exact cancellation/refund policy for deposits?


TBD-RS-011
What defines a high-demand slot?


TBD-RS-012
How long does the guest have to confirm a high-demand slot?


TBD-RS-013
What is the exact waitlist ordering rule?


TBD-RS-014
How is estimated wait time calculated?


TBD-RS-015
How long does a released table offer remain valid?


TBD-RS-016
What happens when a waitlisted guest does not respond?


TBD-RS-017
What are the exact overbooking tolerance values?


TBD-RS-018
Who is authorized to overbook?


TBD-RS-019
What table-blocking statuses are required?


TBD-RS-020
How is table assignment performed after check-in?


TBD-RS-021
Which notification channels are used for reservation/waitlist messages?


TBD-RS-022
Should reservation availability updates use polling or WebSockets?


TBD-RS-023
What happens when the guest changes the outlet while an active reservation
selection is in progress?


5.1.4.14 BRS Priority Summary

M – Must Have

- FR-RS-01
- FR-RS-02
- FR-RS-03
- FR-RS-04
- FR-RS-05
- FR-RS-07
- FR-RS-09

S – Should Have

- FR-RS-06
- FR-RS-08
- FR-RS-10

This priority classification follows the BRS.


5.1.4.15 Module Status

Status:
Draft – SRS Definition

BRS Coverage:
Direct mapping available for FR-RS-01 to FR-RS-10.

Additional BRS Flow Mapping:
BRS 7.1 Reservation to Seating
BRS 7.3 Late Arrival Exception

Implementation Note:
The BRS defines the business requirements and main process behavior. Exact
availability algorithms, wait-time calculation, slot generation, table assignment,
notification implementation, payment-hold API, and database/API schemas remain
technical/design decisions.
-------------------------------------------------------------
# Sacred Spice Restaurant
## Software Requirements Specification (SRS)
### 5.1.7 Guest App → Loyalty, Offers & Referrals

**Document:** Sacred Spice Restaurant Mobile Application Suite  
**Module:** 5.1.7 Loyalty, Offers & Referrals  
**Source Baseline:** BRS v1.0 — 15 September 2026  
**Status:** Draft SRS module for implementation planning

---

## 5.1.7.1 Module Overview

The Loyalty, Offers & Referrals module provides the guest-facing loyalty experience and the rules required to award, redeem, audit and manage loyalty value. It also supports promotions, targeted offers and referrals where those capabilities are included in the applicable release phase.

The module must remain integrated with the restaurant's order, payment, guest profile and administration capabilities. Loyalty transactions must be traceable and auditable.

### BRS Phase Applicability

The BRS release phasing identifies:

- **Phase 1:** Basic loyalty.
- **Phase 2:** Tiered loyalty, referrals and personalised offers.
- **Phase 3:** Scale capabilities such as multi-outlet and advanced analytics.

The SRS should therefore distinguish the complete functional design from the features planned for the current delivery phase. Features must not be silently moved between phases without approved change control.

---

## 5.1.7.2 Scope

### In Scope for this Module

1. Loyalty account and points balance visibility.
2. Points earning for qualifying spend.
3. Configurable earning rules.
4. Rewards redemption.
5. Points expiry visibility and handling.
6. Loyalty transaction history.
7. Tier configuration and tier status where enabled by phase.
8. Promotion and discount evaluation.
9. Targeted offers where enabled by phase.
10. Referral tracking and reward eligibility where enabled by phase.
11. Birthday and anniversary reward handling.
12. Manual loyalty adjustment with manager authorisation.
13. Full audit trail for loyalty activity.
14. Admin-controlled promotion and loyalty rule configuration.

### Out of Scope / Deferred Unless Approved

The BRS explicitly places some capabilities into later release phases. The implementation must preserve these phase boundaries unless an approved scope change is issued.

---

# 5.1.7.3 Features

## 5.1.7.3.1 Loyalty Account

The Guest App shall provide a loyalty account linked to the guest profile.

The guest should be able to view:

- Current points balance.
- Points earned.
- Points redeemed.
- Available rewards.
- Points expiry information where applicable.
- Loyalty transaction history.
- Tier/status information where the feature is enabled.

## 5.1.7.3.2 Points Earning

Guests earn loyalty points on qualifying spend.

The earning rule is configurable by:

- Order channel.
- Day-part.
- Item category.

The loyalty engine must evaluate the applicable rule for the completed qualifying transaction and create an auditable points transaction.

## 5.1.7.3.3 Points Redemption

Guests can redeem accumulated points for defined rewards.

The guest-facing experience must clearly show:

- Current balance.
- Reward value.
- Points required.
- Expiry information where applicable.
- Redemption outcome.

The system must prevent redemption beyond the available eligible balance.

## 5.1.7.3.4 Tiers

Where enabled for the applicable phase, the programme supports loyalty tiers with:

- Qualification rules.
- Tier benefits.
- Downgrade rules.
- Tier history.

Tier changes must be based on the configured programme rules and must be auditable.

## 5.1.7.3.5 Promotions

The promotion engine supports the following discount types:

- Percentage discount.
- Fixed amount discount.
- Item-level discount.
- Bundle discount.
- Threshold-based discount.

Each promotion must support configured rules for:

- Eligibility.
- Start/end date and time.
- Usage limits.
- Stacking behaviour.
- Applicable channel/outlet conditions where configured.
- Approval status.

## 5.1.7.3.6 Targeted Offers

Where enabled for the applicable phase, offers can be targeted by:

- Guest segment.
- Visit recency.
- Spend band.
- Dietary preference.
- Location.

The targeting logic must use the available guest/profile data and must respect applicable consent and campaign rules.

## 5.1.7.3.7 Referrals

Where enabled for the applicable phase, guests can refer other guests.

A referral reward is eligible only after the referred order completes.

The system must prevent duplicate reward issuance for the same referral event.

## 5.1.7.3.8 Birthday and Anniversary Rewards

Birthday and anniversary rewards can be issued automatically from profile dates.

Eligibility and issue rules must be configurable and auditable.

## 5.1.7.3.9 Manual Adjustments

Manual points adjustments are allowed only through an authorised operational flow.

Every manual adjustment requires:

- Manager authorisation.
- Reason code.
- Audit record.
- User attribution.
- Before and after balance.

---

# 5.1.7.4 User Flow

## 5.1.7.4.1 View Loyalty Balance

1. Guest opens the Loyalty section.
2. System retrieves the guest's active loyalty account.
3. System displays current points balance.
4. System displays available rewards and applicable expiry information.
5. System displays recent loyalty activity.

## 5.1.7.4.2 Earn Points

1. Guest places and completes a qualifying order.
2. Order reaches the qualifying completion state.
3. Loyalty engine evaluates earning rules.
4. System determines eligible spend and applicable earning rate.
5. Points transaction is created.
6. Loyalty balance is updated.
7. Guest is shown the earned points through the applicable post-order experience.
8. Transaction is stored in the loyalty history and audit trail.

## 5.1.7.4.3 Redeem Reward

1. Guest views available rewards.
2. Guest selects a reward.
3. System verifies loyalty balance and reward eligibility.
4. System reserves/debits the required points according to the redemption flow.
5. Redemption transaction is created.
6. Guest receives confirmation.
7. Updated loyalty balance is shown.

## 5.1.7.4.4 Apply Promotion

1. Guest adds eligible item(s) to the cart.
2. Guest enters/selects a promotion when applicable.
3. System validates promotion eligibility.
4. System checks date/time, channel, usage cap and stacking rules.
5. System calculates the discount.
6. Discount is displayed before payment.
7. Promotion usage is recorded after successful completion according to the configured transaction state.

## 5.1.7.4.5 Referral Flow

1. Existing guest initiates a referral.
2. System creates a unique referral association.
3. New guest joins/uses the referral mechanism.
4. Referred guest completes the qualifying order.
5. System verifies referral eligibility.
6. System issues the configured reward to the eligible parties.
7. Referral and reward events are recorded in the audit trail.

## 5.1.7.4.6 Manual Adjustment Flow

1. Authorised staff/admin opens the guest loyalty account.
2. User selects manual adjustment.
3. User enters adjustment amount.
4. User selects/enters required reason code.
5. Manager authorisation is performed.
6. System applies the adjustment.
7. New balance is calculated.
8. Audit event is recorded with user, authoriser, reason and timestamps.

---

# 5.1.7.5 Functional Requirements

## Direct BRS Mapping

### FR-LY-01 — Points Earning

**Requirement:** Guests earn points on qualifying spend at configurable rates by channel, day-part and item category.  
**Priority:** M

**SRS interpretation:**

- The backend shall calculate loyalty points from qualifying completed transactions.
- Earning configuration shall support channel-level rules.
- Earning configuration shall support day-part rules.
- Earning configuration shall support item-category rules.
- The rule evaluation result shall be persisted with the loyalty transaction.
- The same qualifying transaction must not award points more than once.

### FR-LY-02 — Points Redemption

**Requirement:** Guests can redeem points for defined rewards, with clear balance, value and expiry.  
**Priority:** M

**SRS interpretation:**

- Rewards shall have configured redemption requirements.
- The guest shall see required points and reward value before redemption.
- The guest shall see the current eligible balance.
- Expiry information shall be visible where applicable.
- The system shall reject redemption when the available eligible balance is insufficient.
- Redemption shall create a traceable loyalty transaction.

### FR-LY-03 — Loyalty Tiers

**Requirement:** The programme supports tiers with defined qualification, benefits and downgrade rules.  
**Priority:** S

**SRS interpretation:**

- Tier qualification criteria shall be configurable.
- Tier benefits shall be configurable.
- Downgrade rules shall be configurable.
- Tier transitions shall be recorded in loyalty history.
- This capability is identified by the BRS as Phase 2.

### FR-LY-04 — Promotions

**Requirement:** Promotions support percentage, fixed amount, item-level, bundle and threshold discounts, with stacking rules and usage caps.  
**Priority:** M

**SRS interpretation:**

- Promotion type shall be one of the BRS-supported discount types.
- Promotion validity shall be evaluated at application time.
- Stacking rules shall be enforced.
- Usage caps shall be enforced.
- Promotion application and resulting discount shall be traceable.
- Finance-approved margin guardrails should be enforced through configuration where defined.

### FR-LY-05 — Targeted Offers

**Requirement:** Offers can be targeted by segment, visit recency, spend band, dietary preference or location.  
**Priority:** S

**SRS interpretation:**

- Targeting rules shall support all listed BRS attributes.
- A guest shall receive an offer only when eligibility criteria are satisfied.
- Applicable consent requirements shall be checked for marketing use.
- This capability is identified by the BRS as Phase 2 personalised offers.

### FR-LY-06 — Referrals

**Requirement:** Guests can refer others and both parties receive a reward once the referred order completes.  
**Priority:** S

**SRS interpretation:**

- The system shall create a referral relationship between referring and referred guests.
- Reward eligibility shall depend on completion of the qualifying referred order.
- The same referral event must not produce duplicate rewards.
- Reward issuance shall be auditable.
- This capability is identified by the BRS as Phase 2.

### FR-LY-07 — Birthday and Anniversary Rewards

**Requirement:** Birthday and anniversary rewards issue automatically from profile dates.  
**Priority:** S

**SRS interpretation:**

- Guest profile dates shall be available to the loyalty rules engine.
- The system shall evaluate configured birthday/anniversary eligibility.
- Eligible rewards shall be issued automatically according to configured programme rules.
- Reward issuance shall be auditable.

### FR-LY-08 — Loyalty Audit and Manual Adjustments

**Requirement:** All loyalty activity is auditable, and manual point adjustments require manager authorisation with a reason code.  
**Priority:** M

**SRS interpretation:**

- Every earn transaction shall be auditable.
- Every redemption transaction shall be auditable.
- Every expiry/adjustment event shall be auditable where applicable.
- Manual adjustment shall require manager authorisation.
- Manual adjustment shall require a reason code.
- User and timestamp information shall be recorded.

---

# 5.1.7.6 Business Rules

## Loyalty Rules

**BR-LY-001**  
Points are awarded only for qualifying spend defined by the configured loyalty rules.

**BR-LY-002**  
Points earning rates may vary by order channel, day-part and item category.

**BR-LY-003**  
A qualifying order must not generate duplicate loyalty earning transactions.

**BR-LY-004**  
A guest cannot redeem more points than the currently eligible balance.

**BR-LY-005**  
Redeemed points must produce an auditable transaction linked to the guest loyalty account.

**BR-LY-006**  
Expired points cannot be redeemed after the configured expiry condition is met.

**BR-LY-007**  
Tier changes must follow configured qualification and downgrade rules.

## Promotion Rules

**BR-LY-008**  
Only active promotions within their validity window can be applied.

**BR-LY-009**  
Promotion stacking must follow the configured stacking rule; unsupported combinations must be rejected or resolved according to the rule.

**BR-LY-010**  
Promotion usage caps must be enforced at the configured scope.

**BR-LY-011**  
Promotion discounts must be calculated consistently across Guest App, Staff workflows and backend pricing logic so that the same order does not produce conflicting discount results.

**BR-LY-012**  
Promotion configuration must support management approval workflow where configured in Admin.

**BR-LY-013**  
Promotion economics must respect the BRS risk control of margin guardrails, stacking limits and usage caps.

## Referral Rules

**BR-LY-014**  
A referral reward becomes eligible only after the qualifying referred order completes.

**BR-LY-015**  
The same qualifying referral event cannot issue the same reward multiple times.

## Manual Adjustment Rules

**BR-LY-016**  
Manual points adjustments require manager authorisation.

**BR-LY-017**  
A reason code is mandatory for every manual points adjustment.

**BR-LY-018**  
Every manual adjustment must record the initiating user, authorising manager, previous balance, adjustment amount, resulting balance and timestamps.

## Consent / Campaign Rules

**BR-LY-019**  
Marketing-related offers and campaigns must use the guest consent state provided by the Guest Account and notification preferences.

**BR-LY-020**  
Transactional loyalty events must remain distinguishable from consent-based marketing communications.

---

# 5.1.7.7 Validations

| Validation | Expected Behaviour |
|---|---|
| Loyalty account not found | Return a controlled error and do not create a new account silently during a transactional request. |
| Insufficient points | Redemption is rejected with a clear guest message. |
| Expired points | Expired points are excluded from eligible redemption balance. |
| Invalid reward | Redemption is rejected if the reward is inactive or otherwise ineligible. |
| Promotion expired | Promotion is rejected. |
| Promotion not yet active | Promotion is rejected. |
| Usage cap reached | Promotion is rejected. |
| Stacking conflict | Promotion is rejected or resolved according to configured stacking rules. |
| Referral not eligible | Reward is not issued. |
| Referral order incomplete | Reward remains pending/not eligible. |
| Duplicate referral reward | System must prevent duplicate issuance. |
| Birthday/anniversary date missing | Automatic reward cannot be issued until required profile data exists. |
| Manual adjustment without manager approval | Adjustment is rejected. |
| Manual adjustment without reason code | Adjustment is rejected. |

---

# 5.1.7.8 API Requirements

The following APIs are implementation-level SRS targets and should be finalised during API design. Exact endpoint naming remains an implementation decision.

## Loyalty APIs

```text
GET    /api/v1/guests/{guest_id}/loyalty
GET    /api/v1/guests/{guest_id}/loyalty/balance
GET    /api/v1/guests/{guest_id}/loyalty/transactions
GET    /api/v1/loyalty/rewards
POST   /api/v1/loyalty/redeem
GET    /api/v1/loyalty/tiers
```

## Promotion APIs

```text
GET    /api/v1/promotions/eligible
POST   /api/v1/promotions/validate
POST   /api/v1/promotions/apply
GET    /api/v1/promotions/{promotion_id}
```

## Referral APIs

```text
POST   /api/v1/referrals
GET    /api/v1/referrals/{referral_id}
GET    /api/v1/guests/{guest_id}/referrals
```

## Admin / Operational APIs

```text
POST   /api/v1/admin/loyalty/adjustments
GET    /api/v1/admin/loyalty/accounts/{guest_id}
GET    /api/v1/admin/loyalty/audit
POST   /api/v1/admin/promotions
PUT    /api/v1/admin/promotions/{promotion_id}
POST   /api/v1/admin/promotions/{promotion_id}/approve
```

### API Design Rules

- APIs must be authenticated according to the user role and operation.
- Financial/loyalty mutation APIs must be idempotent where retries are possible.
- Requests that change loyalty balances must produce auditable transaction records.
- Promotion validation must return enough detail for the client to explain why a promotion is accepted or rejected.
- Manual adjustment APIs must enforce authorisation on the server, not only in the UI.

---

# 5.1.7.9 Data Requirements

## Core Data Entities

### LoyaltyAccount

Suggested attributes:

- id
- guest_id
- points_balance
- lifetime_points_earned
- lifetime_points_redeemed
- current_tier_id (nullable where tiers are unavailable)
- created_at
- updated_at

### LoyaltyTransaction

Suggested attributes:

- id
- loyalty_account_id
- transaction_type
- points_delta
- source_type
- source_id
- balance_before
- balance_after
- expiry_date (where applicable)
- reason_code (for adjustments)
- initiated_by_user_id
- approved_by_user_id (for manual adjustment)
- created_at

### LoyaltyTier

Suggested attributes:

- id
- name
- qualification_rule
- benefits
- downgrade_rule
- active

### Promotion

Suggested attributes:

- id
- name
- promotion_type
- value
- eligibility_rule
- stacking_rule
- usage_cap
- start_at
- end_at
- approval_status
- active

### Referral

Suggested attributes:

- id
- referrer_guest_id
- referred_guest_id
- referral_code / token
- qualification_order_id
- status
- reward_issued_at
- created_at

### Reward

Suggested attributes:

- id
- name
- description
- required_points
- monetary_value / benefit_definition
- expiry_rule
- active

---

# 5.1.7.10 Integration Requirements

## Order / POS Integration

Loyalty earning is dependent on qualifying order completion and therefore must integrate with order lifecycle events.

The platform must not create a competing revenue source. The POS remains the financial system of record.

## Payment Integration

Where reward eligibility depends on successful payment/completion, loyalty issuance must align with the final qualifying transaction state.

Refund and cancellation flows must be considered so that the system does not leave an incorrect loyalty balance after a qualifying transaction is reversed, where the approved business rule requires an adjustment.

## Guest Account Integration

The module depends on guest identity and profile information, including dates used for birthday/anniversary rules.

## Notification Integration

Loyalty-related guest communications may use the notification service subject to applicable consent and notification rules.

## CRM / Marketing Integration

The BRS identifies CRM and marketing automation as a two-way medium-criticality integration for guest segments, campaign execution and attribution.

## Analytics Integration

The BRS identifies analytics as an outbound medium-criticality integration for product/funnel analytics and retention cohorts.

---

# 5.1.7.11 Error & Exception Handling

## Loyalty Transaction Failure

If loyalty posting fails after the qualifying business transaction:

- Do not silently discard the loyalty event.
- Record the failure.
- Make the event retryable where technically appropriate.
- Preserve an idempotency key or equivalent transaction reference.
- Prevent duplicate points when a retry succeeds.

## Duplicate Event

If the same order completion or loyalty event is received more than once:

- Detect the duplicate using a stable source/event identifier.
- Do not issue duplicate points.
- Record the duplicate handling outcome for audit/operations.

## Promotion Service Failure

If promotion validation is temporarily unavailable:

- The failure should affect the promotion capability without bringing down unrelated Guest App capabilities.
- The UI should show a controlled message.
- The system must not apply an unvalidated promotion by default.

## Referral Reward Failure

If the referred order qualifies but reward issuance fails:

- Preserve the qualifying event.
- Mark the reward issuance as pending/retryable where supported.
- Ensure retry cannot produce duplicate rewards.

## Manual Adjustment Failure

If approval is missing or invalid:

- Reject the adjustment.
- Do not alter the loyalty balance.
- Record the failed attempt according to audit/security requirements.

---

# 5.1.7.12 Acceptance Criteria

## Loyalty Account

- Guest can open the loyalty area and view the current balance.
- Loyalty activity is shown from the stored transaction history.
- Reward value and required points are clear before redemption.
- Expiry information is shown where applicable.

## Points Earning

- Qualifying completed spend awards points according to configured rules.
- Channel, day-part and item-category earning rules can be evaluated.
- The same qualifying transaction cannot award duplicate points.

## Redemption

- Guest cannot redeem when the eligible balance is insufficient.
- Successful redemption creates a loyalty transaction.
- Balance updates correctly after redemption.

## Promotions

- Supported promotion types can be configured and evaluated.
- Stacking rules are enforced.
- Usage caps are enforced.
- Expired/inactive promotions are rejected.

## Tiers

- Tier qualification and downgrade rules work as configured when the feature is enabled.
- Tier movement is auditable.

## Referrals

- Referral relationship can be created.
- Reward remains ineligible until the referred qualifying order completes.
- Reward is not issued more than once for the same event.

## Birthday / Anniversary

- Eligible profile dates can trigger configured rewards automatically.
- Issuance is auditable.

## Manual Adjustment

- Adjustment cannot be completed without manager authorisation.
- Reason code is mandatory.
- Audit trail records the complete adjustment context.

---

# 5.1.7.13 Security & Audit Requirements

1. Loyalty balance mutation must occur only through authenticated backend operations.
2. Client-side values must never be trusted as the authoritative points balance.
3. Manual adjustments must be role-controlled.
4. Manager approval must be enforced server-side.
5. All loyalty mutations must be attributable to a user or system actor.
6. Audit records must be protected from unauthorised modification.
7. Sensitive guest information must follow the platform privacy requirements.
8. Marketing targeting and communication must honour applicable consent state.

---

# 5.1.7.14 Non-Functional Requirements Relevant to this Module

### Performance

- Loyalty balance retrieval should be responsive enough for normal Guest App interaction.
- Promotion validation should not unnecessarily block unrelated cart operations.
- Checkout performance must remain within the BRS checkout target, excluding PSP latency.

### Reliability

- No accepted loyalty transaction should be silently lost.
- Retryable failures must be handled without duplicate point issuance.
- Integration failures should degrade only the affected capability where practical.

### Observability

Log and monitor:

- Loyalty posting failures.
- Duplicate event detection.
- Promotion validation failures.
- Referral reward failures.
- Manual adjustment attempts.
- Integration errors.

The BRS requires errors, payment failures and integration faults to be logged, monitored and alerted.

### Data Retention

The BRS requires transaction records to be retained per statutory requirements and behavioural analytics to be retained no longer than 24 months.

---

# 5.1.7.15 Admin Console Dependencies

The BRS Admin Console includes:

> **FR-AD-03:** Administrators create and schedule promotions, loyalty rules and campaigns with approval workflow.

Therefore, the Guest App loyalty module depends on Admin capabilities for configuration and governance.

Admin-controlled areas should include, as applicable:

- Loyalty earning rules.
- Rewards.
- Tier rules.
- Promotion definitions.
- Stacking rules.
- Usage caps.
- Targeting rules.
- Referral rewards.
- Birthday/anniversary rules.
- Approval workflow.

---

# 5.1.7.16 Reporting Requirements

The BRS identifies the following relevant reporting needs:

### Guest / Loyalty Report

The report includes:

- Enrollment.
- Repeat rate.
- Tier movement.
- Cohort retention.

### Promotion / Commercial Reporting

The reporting set includes promotion cost, and the BRS identifies monthly promotion profitability review as a mitigation for margin erosion risk.

### Reconciliation

Financially relevant order, discount and payment flows must reconcile against source systems and provider settlements according to the broader platform reconciliation process.

---

# 5.1.7.17 Dependencies

1. Guest account and profile module.
2. Order and order-completion lifecycle.
3. Payment and refund flow.
4. POS integration.
5. Admin Console promotion and loyalty configuration.
6. Notification service for applicable guest communications.
7. CRM/marketing integration where targeting/campaign execution is enabled.
8. Analytics platform where loyalty analytics are enabled.

---

# 5.1.7.18 Open Decisions / TBD

The following details are not fully specified in the BRS and must be approved before final implementation:

- Exact points-to-dollar value conversion.
- Whether points are earned on pre-tax, post-tax or otherwise defined qualifying spend.
- Treatment of tips, delivery fees, service charges and discounts when calculating qualifying spend.
- Exact point expiry duration and expiry precedence rules.
- Exact reward catalogue and reward fulfilment model.
- Exact tier thresholds and downgrade periods.
- Exact promotion precedence when multiple discounts qualify.
- Exact usage-cap scope: per guest, per order, per day, per campaign or other.
- Exact referral code/link mechanism.
- Referral qualification window.
- Whether self-referral and household/device restrictions are required.
- Exact birthday/anniversary reward eligibility window.
- Handling of loyalty reversals after order cancellation/refund.
- Detailed approval levels and authorisation limits for manual adjustments.
- Exact analytics event taxonomy.

These items should remain **TBD / Open Decision** until approved by the relevant business owners and documented through change control.

---

# 5.1.7.19 Traceability Summary

| SRS Area | BRS Reference |
|---|---|
| Points earning | FR-LY-01 |
| Points redemption | FR-LY-02 |
| Loyalty tiers | FR-LY-03 |
| Promotions | FR-LY-04 |
| Targeted offers | FR-LY-05 |
| Referrals | FR-LY-06 |
| Birthday / anniversary rewards | FR-LY-07 |
| Loyalty audit / manual adjustment | FR-LY-08 |
| Admin promotion / loyalty configuration | FR-AD-03 |
| Guest profile dependency | Guest Account requirements |
| Loyalty reporting | Data & Reporting requirements |
| Promotion profitability / margin controls | Risks & Mitigation |
| CRM / campaign integration | Integration Requirements |
| Analytics integration | Integration Requirements |

---

# 5.1.7.20 Module Status

**Documentation Status:** Ready for technical design review  
**BRS Traceability:** Covered through FR-LY-01 to FR-LY-08 and related cross-module requirements  
**Phase Note:** Basic loyalty is identified in BRS Phase 1; tiered loyalty, referrals and personalised offers are identified in BRS Phase 2.  
**Implementation Gate:** Final loyalty economics, promotion controls, referral rules and approval limits require business/finance sign-off before production use.

---

## BRS Source Note

This module is based on the Sacred Spice Restaurant **Business Requirement Specification (BRS) v1.0 dated 15 September 2026**. Where the BRS does not define an implementation-level detail, it is marked here as a **TBD / Open Decision** rather than being silently assumed.
---------------------------------------------------
# SACRED SPICE RESTAURANT
## Software Requirement Specification (SRS)
### 5.1.8 Guest App → Order Tracking & Notifications

**Source:** Sacred Spice Restaurant — Business Requirement Specification (BRS) v1.0  
**BRS Date:** 15 September 2026  
**SRS Module:** 5.1.8  
**Product Area:** Guest App  
**Status:** Draft for implementation and stakeholder review

---

## 1. Module Overview

The **Order Tracking & Notifications** module provides guests with live visibility of an order and the notifications required to keep them informed during reservation/waitlist and off-premise fulfilment journeys.

This module covers:

- Live order status visibility.
- Delivery courier identity, contact channel and live location where supported by the logistics partner.
- Transactional push notifications with SMS or email fallback when push is unavailable.
- Consented marketing notifications with quiet hours and frequency caps.
- Guest-controlled notification category preferences.
- Reservation/waitlist notification touchpoints that are part of the BRS flows.
- Completion-triggered receipt and feedback communication.
- Notification delivery monitoring and operational observability.

The module must integrate with order processing, delivery logistics, reservation/waitlist, guest consent, and notification services.

---

## 2. BRS Requirements Mapping

### 2.1 Direct Functional Requirements

| BRS ID | Priority | Requirement |
|---|---|---|
| FR-NT-01 | M | Guests see live order status through accepted, preparing, ready, dispatched and delivered. |
| FR-NT-02 | S | Delivery orders show courier identity, contact channel and live location where the logistics partner supports it. |
| FR-NT-03 | M | Transactional notifications are sent by push with SMS or email fallback when push is unavailable. |
| FR-NT-04 | M | Marketing notifications are sent only with consent, respect quiet hours, and are frequency-capped. |
| FR-NT-05 | M | Guests can configure which notification categories they receive. |

### 2.2 Related BRS Requirements / Flows

| BRS Reference | Relevance |
|---|---|
| FR-AC-05 | Guest can manage marketing consent for email, SMS and push independently, and withdraw consent at any time. |
| Section 7.1 | Reservation confirmation, 24-hour and 2-hour reminders, one-tap cancel/modify, and waitlist call-forward by notification. |
| Section 7.2 | Order status updates at accepted, preparing, ready and dispatched; delivery tracking; completion triggers loyalty posting, receipt and feedback prompt within one hour. |
| Section 7.3 | Delivery failure or undeliverable address follows a defined refund/redelivery policy and is therefore a notification/error communication dependency. |
| NFR-04 | No accepted order may be lost; order injection is idempotent and retried with alerting on failure. |
| NFR-07 | Personal data uses lawful basis, explicit marketing consent, minimum necessary retention, and deletion/export support. |
| NFR-13 | Errors, crashes, payment failures and integration faults are logged, monitored and alerted with defined ownership. |
| Integration Requirements | Notification services are outbound/high; delivery logistics are two-way/high; mapping/address is outbound/high; CRM/marketing automation is two-way/medium; analytics is outbound/medium. |

**Source note:** The BRS does not define a separate detailed notification entity/schema, provider configuration, default quiet-hour values, exact frequency-cap values, or a complete event-to-template matrix. Those items remain SRS/design decisions or TBDs below.

---

## 3. Feature Scope

### 3.1 Live Order Tracking

The Guest App shall display the current order status.

Required statuses defined by the BRS:

1. Accepted
2. Preparing
3. Ready
4. Dispatched
5. Delivered

The status history should be available as a timeline so the guest can understand the progression of the order.

The tracking view shall also expose the current fulfilment information relevant to the order channel.

### 3.2 Delivery Tracking

For delivery orders, the Guest App shall show:

- Courier identity, where available from the logistics partner.
- Courier contact channel, where available.
- Live courier location, where supported by the logistics partner.

The platform must not assume that every logistics partner provides every tracking attribute.

### 3.3 Transactional Notifications

Transactional notifications are operational notifications generated by a guest transaction or service flow.

Examples directly supported by the BRS flows include:

- Reservation confirmation.
- Reservation reminder at 24 hours before arrival.
- Reservation reminder at 2 hours before arrival.
- Waitlist call-forward.
- Order status updates.
- Delivery dispatch/tracking communication.
- Pickup collection communication.
- Completion-related receipt communication.
- Feedback prompt within one hour of order completion.

The BRS explicitly requires push as the primary transactional channel with SMS or email fallback when push is unavailable.

### 3.4 Marketing Notifications

Marketing notifications shall:

- Be sent only when the guest has consented.
- Respect configured quiet hours.
- Be frequency-capped.
- Respect the guest's selected notification categories.
- Allow consent withdrawal through the guest account/notification settings.

Marketing consent for email, SMS and push is independent according to FR-AC-05.

### 3.5 Notification Preferences

The Guest App shall provide notification controls by category.

At minimum, the implementation must support the BRS requirement that guests can configure which notification categories they receive.

The exact category list, default values, and channel-specific controls are TBD unless defined during UX/product sign-off.

---

## 4. User Flows

### 4.1 Off-Premise Order Tracking

1. Guest places a delivery or pickup order.
2. The order is injected into the POS and appears on the KDS.
3. When the order is accepted, the Guest App reflects the accepted status.
4. When kitchen preparation starts, the Guest App reflects preparing.
5. When the kitchen marks the order ready, the Guest App reflects ready.
6. For delivery, dispatch causes the order to reflect dispatched.
7. For delivery, courier tracking information is shown when supported by the logistics partner.
8. When the delivery is completed, the Guest App reflects delivered.
9. On completion, loyalty points post, a receipt is issued, and a feedback prompt follows within one hour.

### 4.2 Reservation Reminder / Check-In Flow

1. Guest confirms a reservation.
2. Confirmation is issued.
3. A reminder is sent 24 hours before arrival.
4. A reminder is sent 2 hours before arrival.
5. Reminder communication includes one-tap cancel or modify capability as specified in the BRS flow.
6. Guest arrives and checks in.
7. If the table is not ready, the guest joins the waitlist and receives a notification when called forward.

### 4.3 Transactional Notification Delivery

1. Application creates a notification event.
2. Backend resolves the notification category and intended recipient.
3. For transactional communication, push is attempted first.
4. If push is unavailable, SMS or email fallback is attempted.
5. Delivery result is recorded.
6. Failed delivery is logged and monitored.
7. Repeated integration failure raises an operational alert according to the platform's observability model.

### 4.4 Marketing Notification Delivery

1. Marketing campaign is created/scheduled through the Admin Console.
2. System evaluates guest eligibility/targeting configured for the campaign.
3. System checks marketing consent by channel.
4. System checks notification-category preference.
5. System checks quiet-hour rules.
6. System checks frequency-cap rules.
7. Eligible messages are sent.
8. Delivery/outcome events are recorded for campaign reporting and analytics.

---

## 5. Functional Requirements

### 5.1 FR-NT-01 — Live Order Status

**Priority:** Must

The system shall provide live order status through:

- accepted
- preparing
- ready
- dispatched
- delivered

Requirements:

- Status changes shall be reflected in the Guest App.
- Status history shall be retained as part of the order status timeline.
- Tracking shall remain linked to the correct guest and order.
- The current status shall be consistent with the order state received from the operational workflow.
- The UI shall clearly distinguish the current state from previous states.

### 5.2 FR-NT-02 — Delivery Courier Tracking

**Priority:** Should

For delivery orders, the system shall expose, where supported:

- Courier identity.
- Courier contact channel.
- Live courier location.

Requirements:

- Availability of each field depends on the logistics partner.
- Unsupported fields must not be represented as available data.
- Delivery tracking data must be associated with the correct order/delivery.
- Partner outages must not stop unrelated Guest App capabilities.

### 5.3 FR-NT-03 — Transactional Notification Channels

**Priority:** Must

Transactional notifications shall:

- Prefer push.
- Use SMS or email fallback when push is unavailable.
- Be tied to a transactional event.
- Record notification delivery state for observability and troubleshooting.

Transactional notification processing must not create duplicate business actions such as duplicate order state changes or duplicate order creation.

### 5.4 FR-NT-04 — Marketing Notification Controls

**Priority:** Must

Marketing notifications shall:

- Require explicit marketing consent.
- Respect independent consent for email, SMS and push.
- Respect quiet hours.
- Enforce configured frequency caps.
- Respect guest notification category preferences.
- Stop the relevant channel when consent is withdrawn.

### 5.5 FR-NT-05 — Guest Notification Preferences

**Priority:** Must

Guests shall be able to configure the notification categories they receive.

Requirements:

- Preference changes shall be persisted against the guest profile.
- Changes shall take effect for subsequent eligible notifications.
- Preferences must not override mandatory transactional communication where business/legal requirements require it; the exact category treatment is TBD.
- Marketing channel consent remains independently controlled.

---

## 6. Reservation and Waitlist Notification Requirements

The notification module also supports communication defined under the reservation process.

### 6.1 Reservation Confirmation

After successful reservation creation, the system shall issue confirmation.

### 6.2 Reservation Reminders

The BRS specifies reminders at:

- 24 hours before arrival.
- 2 hours before arrival.

The reminder includes one-tap cancel or modify capability.

### 6.3 Waitlist Call-Forward

When a table becomes available and the guest is called forward, the Guest App shall notify the guest.

The notification must relate to the relevant waitlist entry and outlet.

### 6.4 No-Show / Late-Arrival Related Communication

The BRS states that no-shows and late arrivals are recorded against the guest profile and can trigger policy consequences. The exact guest-facing notification content for those consequences is not defined in the BRS and is therefore TBD.

---

## 7. Order Completion Communication

The BRS off-premise flow requires the following completion sequence:

1. Order completion occurs.
2. Loyalty points post.
3. A receipt is issued.
4. A feedback prompt follows within one hour.

The notification/service orchestration layer shall support this sequence without losing the order completion event.

Exact receipt channel and exact feedback reminder timing inside the one-hour window remain implementation/UX decisions unless separately approved.

---

## 8. Notification Categories

The BRS requires guest-configurable categories but does not provide the final taxonomy.

### Proposed SRS categories for implementation discussion

| Category | Examples | Transactional / Marketing | BRS Basis |
|---|---|---|---|
| Order Updates | Accepted, preparing, ready, dispatched, delivered | Transactional | FR-NT-01, Section 7.2 |
| Delivery Tracking | Courier dispatch/tracking | Transactional | FR-NT-02, Section 7.2 |
| Reservation | Confirmation, reminders | Transactional | Section 7.1 |
| Waitlist | Call-forward | Transactional | Section 7.1 |
| Receipt / Completion | Receipt and post-completion communication | Transactional | Section 7.2 |
| Feedback | Feedback prompt after completion | Transactional/service | Section 7.2 |
| Promotions | Offers and campaigns | Marketing | FR-NT-04, FR-AC-05 |
| General Marketing | Consented campaign communication | Marketing | FR-NT-04, FR-AC-05 |

The final category names and user-facing labels require UX/product confirmation.

---

## 9. Business Rules

### BR-NT-001 — Order Status Sequence
The guest-facing order tracking lifecycle shall represent the BRS-defined status sequence: accepted → preparing → ready → dispatched → delivered.

### BR-NT-002 — Delivery Data Availability
Courier identity, contact channel and live location are displayed only when supported by the logistics partner.

### BR-NT-003 — Transactional Channel Priority
Transactional notifications use push first, with SMS or email fallback when push is unavailable.

### BR-NT-004 — Marketing Consent
Marketing notifications are sent only when the guest has valid consent for the relevant channel.

### BR-NT-005 — Independent Channel Consent
Email, SMS and push marketing consent are managed independently.

### BR-NT-006 — Quiet Hours
Marketing notification dispatch must respect configured quiet hours.

### BR-NT-007 — Frequency Capping
Marketing notification dispatch must enforce configured frequency caps.

### BR-NT-008 — Guest Category Preferences
Guest notification category preferences must be evaluated before sending eligible marketing communication.

### BR-NT-009 — Reservation Reminder Timing
Reservation reminders are sent at 24 hours and 2 hours before arrival as specified in the BRS flow.

### BR-NT-010 — Waitlist Call-Forward
When the waitlist process calls a guest forward, the guest must be notified.

### BR-NT-011 — Completion Sequence
After order completion, loyalty posting, receipt issuance and feedback prompt processing must be orchestrated as defined by the BRS flow.

### BR-NT-012 — Graceful Integration Failure
A notification or delivery partner outage must affect only the affected capability and not the whole application.

### BR-NT-013 — Observability
Notification failures and integration faults must be logged, monitored and alerted with defined ownership.

### BR-NT-014 — No Duplicate Business Effect
Retrying notification delivery must not duplicate the underlying order, payment, refund or status transition.

### BR-NT-015 — Preference Changes
Updated notification preferences apply to subsequent eligible notification decisions.

---

## 10. Validations

### 10.1 Order Tracking

- Order identifier must exist.
- Guest must be authorised to view the order.
- Order must belong to the expected restaurant/location context.
- Current order status must be a valid system status.
- Status timeline entries must be ordered chronologically.

### 10.2 Delivery Tracking

- Delivery tracking must reference a valid order/delivery.
- Courier data must only be shown when supplied by the logistics partner.
- Stale/unavailable location information must not be represented as current live location.

### 10.3 Transactional Notification

- Recipient must be resolvable.
- Push device token must be valid when push is attempted.
- Fallback contact details must be available for SMS/email fallback.
- Notification event must have a supported notification type.

### 10.4 Marketing Notification

- Marketing consent must exist for the sending channel.
- Notification category must be enabled.
- Quiet-hour rules must permit dispatch.
- Frequency-cap rules must permit dispatch.
- Guest must satisfy campaign targeting/eligibility rules where configured.

---

## 11. API Requirements

The following are **proposed SRS API contracts** for implementation. Exact endpoint naming may be adjusted during API design.

### 11.1 Order Tracking APIs

`GET /api/v1/orders/{order_id}/tracking`

Returns:

- order id
- fulfilment type
- current status
- status timeline
- relevant promise information
- delivery tracking summary where applicable

`GET /api/v1/orders/{order_id}/delivery-tracking`

Returns, where supported:

- courier identity
- courier contact channel
- live location
- tracking state
- last update time

### 11.2 Notification Preference APIs

`GET /api/v1/me/notification-preferences`

`PUT /api/v1/me/notification-preferences`

The contract shall support guest-configurable notification categories.

### 11.3 Device Registration

`POST /api/v1/me/notification-devices`

`DELETE /api/v1/me/notification-devices/{device_id}`

These are proposed implementation endpoints because the BRS requires push notification capability but does not specify device-token APIs.

### 11.4 Internal Notification Processing

Proposed internal event contracts:

- `order.status.changed`
- `delivery.tracking.updated`
- `reservation.confirmed`
- `reservation.reminder.due`
- `waitlist.call_forward`
- `order.completed`
- `feedback.prompt.due`
- `marketing.campaign.dispatch`

Exact event names and payload schemas are TBD during backend design.

---

## 12. Data Requirements

The BRS defines the following directly relevant data:

### Guest

The Guest entity includes:

- Identity.
- Contacts.
- Addresses.
- Dietary and spice preferences.
- Consents.
- Tier.
- Lifetime value.

### Order

The Order entity includes:

- Channel.
- Items.
- Modifiers.
- Amounts.
- Taxes.
- Status timeline.
- Fulfilment record.

### Additional implementation data required by this module

The following are required to operationalise FR-NT-03 through FR-NT-05 but are not explicitly defined as BRS core entities:

- Notification preference.
- Notification device/token registration.
- Notification delivery attempt/result.
- Notification template/version.
- Notification event or job record.
- Marketing frequency-cap tracking.
- Quiet-hour configuration.
- Delivery tracking snapshot/event data.

These are **SRS implementation requirements / design additions**, not direct BRS entities. Exact schema and retention values are TBD.

---

## 13. Integration Requirements

| Integration | Purpose | Direction | Criticality | Module Use |
|---|---|---|---|---|
| Notification Services | Transactional and consented marketing messages | Outbound | High | Push, SMS, email |
| Delivery Logistics Partner | Dispatch, courier assignment, tracking, proof of delivery | Two-way | High | Courier data/live tracking |
| Mapping & Address Service | Address validation, geocoding, travel-time estimation | Outbound | High | Delivery journey dependency |
| CRM / Marketing Automation | Guest segments, campaign execution and attribution | Two-way | Medium | Marketing targeting and campaign delivery |
| Analytics Platform | Product and funnel analytics, retention cohorts | Outbound | Medium | Notification/campaign analytics |

The BRS also requires graceful degradation so a partner outage affects only the affected capability.

---

## 14. Error and Exception Handling

### 14.1 Push Unavailable

- Attempt push.
- Detect unavailable/failed push delivery where provider feedback supports it.
- Apply SMS or email fallback.
- Record the result.
- Alert only when operational thresholds are crossed.

### 14.2 SMS/Email Fallback Unavailable

- Record failed delivery.
- Do not repeatedly create uncontrolled notification retries.
- Preserve the underlying order/service state.
- Log for operational support.

### 14.3 Delivery Partner Tracking Unavailable

- Continue order tracking without unsupported courier/location attributes.
- Show the latest valid status available from the platform.
- Do not block order completion solely because live tracking is unavailable.

### 14.4 Marketing Consent Missing

- Do not send the marketing message on that channel.
- Record the decision/outcome for auditability.

### 14.5 Quiet Hours Active

- Suppress or defer marketing communication according to configured policy.
- Exact defer behaviour is TBD.

### 14.6 Frequency Cap Reached

- Do not send the marketing notification once the configured cap is reached.
- Record the suppression decision.

### 14.7 Notification Provider Outage

- Queue where the transaction class permits safe retry.
- Do not modify the underlying order state because notification delivery failed.
- Alert according to observability ownership.

---

## 15. Security and Privacy Requirements

The module must follow the BRS requirements for privacy and security:

- Personal data must be collected on a lawful basis.
- Marketing consent must be explicit.
- Minimum necessary retention applies.
- Guests must have supported deletion/export rights.
- Data must be encrypted in transit and at rest.
- Notification delivery must not expose unnecessary guest information.
- Access to order tracking must be authorised to the relevant guest.
- Behavioural analytics must not be retained longer than 24 months.
- Errors and integration faults must be logged and monitored.

The BRS does not prescribe exact token storage, provider-specific security configuration, or notification payload encryption design; those remain technical design decisions.

---

## 16. Non-Functional Requirements

Relevant BRS NFRs:

### NFR-01 — Performance
Menu/home screens within 2 seconds on mid-range 4G; checkout within 3 seconds excluding payment provider latency.

### NFR-02 — Availability
Target 99.9% monthly availability during trading hours, with planned maintenance outside trading hours.

### NFR-04 — Reliability
No accepted order may be lost; order injection must be idempotent and retried with alerting on failure.

### NFR-07 — Privacy
Lawful basis, explicit marketing consent, minimum necessary retention, deletion and export support.

### NFR-13 — Observability
Errors, crashes, payment failures and integration faults logged, monitored and alerted with defined ownership.

### NFR-16 — Data Retention
Transaction records retained per statutory requirement; behavioural analytics retained no longer than 24 months.

---

## 17. Acceptance Criteria

### AC-NT-01
A guest can open an active order and see the current order status.

### AC-NT-02
The order tracking UI supports the BRS-defined statuses: accepted, preparing, ready, dispatched and delivered.

### AC-NT-03
A delivery order displays courier identity, contact channel and live location when the logistics partner supplies those capabilities.

### AC-NT-04
A transactional notification is sent by push when push is available.

### AC-NT-05
When push is unavailable, the configured SMS or email fallback path is attempted.

### AC-NT-06
Marketing notifications are blocked when the guest has not provided the required marketing consent.

### AC-NT-07
Marketing notification processing respects quiet-hour rules and frequency caps.

### AC-NT-08
A guest can modify notification-category preferences and the updated preference is respected for subsequent eligible messages.

### AC-NT-09
Reservation confirmation and the BRS-defined 24-hour and 2-hour reminders are generated correctly.

### AC-NT-10
A waitlisted guest receives a notification when called forward.

### AC-NT-11
After completed order processing, loyalty posting, receipt issuance and the feedback prompt workflow are triggered according to the BRS flow.

### AC-NT-12
A notification provider failure does not alter or duplicate the underlying business transaction.

### AC-NT-13
Delivery-partner outage affects only delivery-tracking capability and does not stop unrelated Guest App functionality.

### AC-NT-14
Notification and integration failures are logged and observable according to NFR-13.

### AC-NT-15
Notification and marketing processing respects applicable guest consent/privacy controls and retention rules.

---

## 18. Dependencies

- Guest identity/profile and consent management.
- Order service and order status state machine.
- POS integration.
- KDS status updates.
- Delivery logistics partner.
- Notification services for push, SMS and email.
- Reservation and waitlist service.
- Admin Console campaign/configuration capability.
- CRM/marketing integration where used.
- Analytics platform.
- Monitoring and alerting infrastructure.

---

## 19. Phase 1 Scope Clarification

The BRS release phasing states:

- Phase 1 includes pickup and delivery ordering, payments, **basic loyalty**, KDS, core admin and reporting.
- Phase 2 explicitly lists tiered loyalty, referrals, personalised offers, dine-in table ordering, pay-at-table, gift cards and split bills.

For this module, the BRS contains direct FR-NT requirements with M/S priorities under Section 8.7 and these requirements participate in the Phase 1 off-premise and reservation flows.

This SRS therefore maps the requirements exactly while leaving any release-specific notification template/content, category taxonomy, provider configuration, and other unspecified details as TBD rather than silently changing the BRS.

---

## 20. Open Decisions / TBD

1. Final notification category taxonomy and guest-facing labels.
2. Default notification preferences for newly registered guests.
3. Exact quiet-hour start/end values and timezone handling.
4. Exact marketing frequency-cap values by channel/category.
5. Push/SMS/email provider selection.
6. Fallback rule when multiple channels are unavailable.
7. Exact notification template library and template versions.
8. Whether transactional notifications can be disabled by category and which notifications are mandatory.
9. Pickup terminal status: whether `ready` is sufficient or a separate `collected/completed` state is required.
10. Exact live-location refresh interval from the delivery partner.
11. Exact handling of stale courier location data.
12. Notification retry policy and retry limits.
13. Exact event schema and idempotency keys.
14. Notification audit-log retention period.
15. Final API endpoint naming and response contracts.
16. Exact analytics events and campaign attribution definitions.

---

## 21. Implementation Notes

The module should be implemented as part of the existing application backend and integration architecture.

Recommended implementation responsibilities:

- **Guest App:** tracking screen, notification center, preference UI, deep links from notifications.
- **FastAPI Backend:** order tracking aggregation, notification orchestration, preference APIs, event processing, audit/observability.
- **PostgreSQL:** order timeline, guest preferences and notification records.
- **Redis:** short-lived notification state, rate/frequency checks, caching where appropriate.
- **WebSockets:** live order-status updates when enabled by the real-time architecture.
- **Notification Providers:** push with SMS/email fallback.
- **Delivery Integration:** courier/tracking data where supported.
- **Admin Console:** campaign and notification configuration where required.
- **Future event scaling:** internal event/outbox mechanisms can later support Kafka/event-driven extraction without changing the guest-facing contract.

These technical notes are implementation guidance for the SRS and are not stated as technical architecture requirements in the BRS.

---

## 22. Module Completion Checklist

- [ ] FR-NT-01 mapped and implemented.
- [ ] FR-NT-02 mapped and implemented.
- [ ] FR-NT-03 mapped and implemented.
- [ ] FR-NT-04 mapped and implemented.
- [ ] FR-NT-05 mapped and implemented.
- [ ] Reservation reminder flow integrated.
- [ ] Waitlist call-forward integrated.
- [ ] Delivery tracking integrated where partner supports it.
- [ ] Guest notification preferences implemented.
- [ ] Marketing consent checks implemented.
- [ ] Quiet-hour and frequency-cap logic implemented.
- [ ] Notification retry/idempotency implemented.
- [ ] Logging, monitoring and alerting implemented.
- [ ] Acceptance tests completed.
- [ ] Open TBDs resolved or formally approved.
-------------------------------------------------------------
# SACRED SPICE RESTAURANT
## Software Requirement Specification (SRS)
### 5.1.9 Guest App → Feedback & Service Recovery

**Source:** Sacred Spice Restaurant — Business Requirement Specification (BRS) v1.0  
**BRS Date:** 15 September 2026  
**SRS Module:** 5.1.9  
**Product Area:** Guest App  
**Status:** Draft for implementation and stakeholder review

---

## 1. Module Overview

The **Feedback & Service Recovery** module provides guests with a private mechanism to rate an order or visit, rate individual items, add comments and photographs, and raise service concerns.

The module also supports the operational recovery process by creating service-recovery cases for ratings below a configured threshold, assigning those cases to a manager with a response SLA, allowing managers to respond in-app and issue a goodwill gesture within defined authorisation limits, and making feedback available for reporting.

The BRS also requires that guests are invited to share positive feedback publicly only after submitting it privately.

---

## 2. BRS Requirements Mapping

### 2.1 Direct Functional Requirements

| BRS ID | Priority | Requirement |
|---|---|---|
| FR-FB-01 | M | Guests can rate an order or visit and rate individual items, with optional comments and photographs. |
| FR-FB-02 | M | Ratings below a configured threshold create a service-recovery case assigned to a manager with a response SLA. |
| FR-FB-03 | S | Managers can respond in-app and issue a goodwill gesture within defined authorisation limits. |
| FR-FB-04 | S | Guests are invited to share positive feedback publicly only after submitting it privately. |
| FR-FB-05 | M | Feedback is reportable by outlet, item, staff section, channel and day-part. |

### 2.2 Related BRS Content

| BRS Reference | Relevance |
|---|---|
| BRS §7.2 | After order completion, loyalty points post, a receipt is issued, and a feedback prompt follows within one hour. |
| BRS §7.3 | Item unavailability can lead to substitution or partial refund; delivery failure can lead to refund/redelivery; guest charge disputes create a manager-routed case and audit record. |
| BRS §5.1.1 | Guest App includes private feedback, ratings and complaint capture. |
| BRS §10 | Review platforms receive reputation monitoring after private feedback; Analytics supports product/funnel analytics and retention cohorts. |
| BRS §11.1 | Feedback core entity includes ratings, comments, case status, resolution and goodwill issued. |
| BRS §11.2 | Feedback-related reporting is part of reporting requirements; promotion and guest/loyalty reporting provide adjacent context. |
| NFR-07 | Personal data uses lawful basis, explicit marketing consent, minimum necessary retention, and supported deletion/export. |
| NFR-13 | Errors, crashes, payment failures and integration faults are logged, monitored and alerted with defined ownership. |

**Source note:** The BRS defines the feedback requirements and core Feedback entity, but does not define the exact rating scale, threshold value, response SLA duration, goodwill types/amount limits, public-review platform list, case workflow states, template content, or final reporting formulas. Those remain TBD unless separately approved.

---

## 3. Feature Scope

### 3.1 Guest Feedback Capture

The Guest App shall allow a guest to:

- Rate an order or visit.
- Rate individual items.
- Add optional comments.
- Add photographs.

The feedback must be associated with the relevant order or visit context and guest where applicable.

### 3.2 Service-Recovery Case Creation

When a submitted rating is below a configured threshold:

1. A service-recovery case is created.
2. The case is assigned to a manager.
3. A response SLA is associated with the case.
4. The case becomes available for operational follow-up.

The exact threshold and SLA duration are TBD because the BRS does not specify numeric values.

### 3.3 Manager Response and Goodwill

Managers shall be able to:

- Review the service-recovery case.
- Respond to the guest in-app.
- Issue a goodwill gesture within defined authorisation limits.

The BRS does not specify the exact goodwill catalogue, monetary/non-monetary values, approval escalation rules, or response templates. These are TBD.

### 3.4 Private-to-Public Feedback Flow

The BRS requires that positive feedback be submitted privately before the guest is invited to share that feedback publicly.

The public-review invitation must therefore not be presented as the first feedback step.

The exact public review provider(s), trigger condition for “positive,” invitation frequency, and deep-link behavior are TBD.

### 3.5 Reporting

Feedback shall be reportable by:

- Outlet.
- Item.
- Staff section.
- Channel.
- Day-part.

The exact dashboard layout, aggregation rules, date handling, export columns and permissions are TBD.

---

## 4. User Flows

### 4.1 Standard Feedback Flow

1. Guest completes an order or visit.
2. Feedback prompt is issued within one hour of completion as defined by the BRS flow.
3. Guest opens the private feedback experience.
4. Guest rates the order or visit.
5. Guest may rate individual items.
6. Guest may add comments.
7. Guest may add photographs.
8. Feedback is submitted privately.
9. The system evaluates the rating against the configured service-recovery threshold.
10. If the rating is below threshold, a service-recovery case is created and assigned to a manager.
11. If the feedback is positive, the guest may be invited to share it publicly.
12. Feedback and any recovery activity are retained for reporting and operational follow-up.

### 4.2 Low-Rating Service-Recovery Flow

1. Guest submits a rating below the configured threshold.
2. System creates a service-recovery case.
3. Manager is assigned.
4. Response SLA starts.
5. Manager reviews feedback, comments and photographs.
6. Manager responds in-app.
7. Manager may issue a goodwill gesture within authorisation limits.
8. Resolution is recorded.
9. Case status is updated.
10. Final outcome is available for reporting.

### 4.3 Positive Feedback Public-Review Flow

1. Guest submits private feedback.
2. System evaluates the configured positive-feedback condition.
3. If eligible, the guest is invited to share feedback publicly.
4. Guest chooses whether to proceed.
5. Public review link/platform handling occurs outside the private feedback record or through the configured integration.
6. Public-review invitation outcome may be captured for reporting if supported.

The exact definition of “positive feedback” is not specified in the BRS and remains TBD.

---

## 5. Functional Requirements

### 5.1 FR-FB-01 — Guest Ratings and Comments

**Priority:** Must

The system shall allow guests to:

- Rate an order.
- Rate a visit.
- Rate individual items.
- Add optional comments.
- Add photographs.

Requirements:

- Feedback must be linked to the relevant order or visit.
- Item ratings must identify the relevant menu item/order item.
- Comments are optional.
- Photographs are optional.
- Feedback should be submitted as a private record before any public-review invitation.
- The system must prevent unauthorised users from submitting feedback against another guest's transaction.

### 5.2 FR-FB-02 — Service-Recovery Case Creation

**Priority:** Must

A rating below a configured threshold shall create a service-recovery case.

Requirements:

- Threshold must be configurable.
- Case must reference the feedback record.
- Case must reference the relevant guest and transaction/visit context.
- Case must be assigned to a manager.
- A response SLA must be attached to the case.
- SLA status must be trackable.
- Case creation must not create duplicate cases for the same triggering feedback event.
- Case creation failures must be logged and visible for operational handling.

### 5.3 FR-FB-03 — Manager Response and Goodwill

**Priority:** Should

Managers shall be able to:

- Open the service-recovery case.
- Review submitted feedback.
- Respond to the guest in-app.
- Issue a goodwill gesture within defined authorisation limits.

Requirements:

- Manager identity must be recorded.
- Goodwill action must be auditable.
- Goodwill must respect the configured authorisation limit.
- Case response and resolution details must be stored.
- The BRS does not define the exact goodwill catalogue or escalation model; these are TBD.

### 5.4 FR-FB-04 — Public Sharing Invitation

**Priority:** Should

The system shall invite guests to share positive feedback publicly only after the guest has submitted feedback privately.

Requirements:

- Private feedback submission must occur first.
- Public invitation must use the configured provider/platform.
- The public invitation trigger must be based on a configured definition of positive feedback.
- The system should avoid repeatedly inviting the same guest for the same feedback event.
- Guest choice not to share publicly must not prevent the private feedback record from being stored.

### 5.5 FR-FB-05 — Feedback Reporting

**Priority:** Must

Feedback shall be reportable by:

- Outlet.
- Item.
- Staff section.
- Channel.
- Day-part.

Requirements:

- Reports must preserve the source context of the feedback.
- Feedback aggregation must support the required dimensions.
- Reporting access must follow role permissions.
- Exact metric definitions and report formulas are TBD where the BRS does not specify them.

---

## 6. Feedback Data Model

The BRS defines the following core Feedback attributes:

- Ratings.
- Comments.
- Case status.
- Resolution.
- Goodwill issued.

### 6.1 SRS-required contextual fields

To satisfy the BRS reporting requirements, the Feedback record should also carry or be able to resolve:

- Feedback ID.
- Guest ID.
- Order ID where feedback relates to an order.
- Visit/reservation context where feedback relates to a visit.
- Outlet ID.
- Order item/menu item ID for item-level ratings.
- Staff section where applicable.
- Channel.
- Day-part.
- Submission timestamp.
- Rating type.
- Rating value.
- Photograph references.
- Service-recovery case reference.
- Manager assignment.
- Response SLA due time.
- Manager response.
- Goodwill action and value/reference.
- Resolution timestamp.
- Public-review invitation status where used.

These contextual fields are SRS implementation requirements derived from FR-FB-05 and the BRS Feedback entity; the BRS does not list every field explicitly.

---

## 7. Rating Model

The BRS requires a rating and a configurable threshold but does not define the numeric scale.

### TBD

- Rating scale (for example, 1–5) — not defined by BRS.
- Whether order/visit rating and item rating use the same scale.
- Minimum/maximum permitted value.
- Whether “no rating” is permitted for individual items.
- Positive-feedback threshold definition.
- Low-rating threshold definition.
- Whether a comment is required below a certain rating.

Do not hard-code these values until product/operations sign-off.

---

## 8. Service-Recovery Case Model

### Suggested SRS case information

A service-recovery case should contain:

- Case ID.
- Feedback ID.
- Guest ID.
- Order/visit reference.
- Outlet.
- Trigger rating.
- Trigger threshold.
- Case status.
- Assigned manager.
- Created time.
- SLA due time.
- Manager response.
- Goodwill action.
- Authorisation reference.
- Resolution.
- Resolved time.
- Audit history.

### Case status

The BRS requires a case and resolution flow but does not specify the exact state model.

Suggested implementation states for approval:

`OPEN → ASSIGNED → IN_REVIEW → RESPONDED → RESOLVED`

Possible additional exception states:

`ESCALATED`, `CANCELLED`

These statuses are SRS proposals and must be confirmed before implementation.

---

## 9. Business Rules

### BR-FB-001 — Private Feedback First
Private feedback must be submitted before a positive-feedback public sharing invitation is presented.

### BR-FB-002 — Low Rating Threshold
A rating below the configured threshold creates a service-recovery case.

### BR-FB-003 — Manager Assignment
Every automatically created service-recovery case is assigned to a manager.

### BR-FB-004 — Response SLA
Every service-recovery case has a response SLA.

### BR-FB-005 — Goodwill Authorisation
Goodwill gestures may be issued only within configured manager authorisation limits.

### BR-FB-006 — Auditability
Manager responses, goodwill actions and case resolution must be auditable.

### BR-FB-007 — Feedback Context
Feedback must remain linked to its outlet and relevant transaction/visit context.

### BR-FB-008 — Item-Level Context
An individual item rating must reference the relevant item/order-item context.

### BR-FB-009 — Duplicate Case Prevention
One triggering low-rating feedback event must not create duplicate service-recovery cases.

### BR-FB-010 — Public Review Independence
A guest's decision not to share feedback publicly must not delete, suppress or invalidate private feedback.

### BR-FB-011 — Reporting Dimensions
Feedback reporting must support outlet, item, staff section, channel and day-part dimensions.

### BR-FB-012 — Access Control
Feedback and service-recovery data must be visible only to authorised roles.

### BR-FB-013 — Feedback Prompt Timing
The post-completion feedback prompt follows the BRS flow and occurs within one hour of order completion.

### BR-FB-014 — Recovery Does Not Alter Source Transaction
A service-recovery case is an operational recovery record and must not rewrite the original order/financial transaction history.

### BR-FB-015 — Failure Handling
Failure to create or update a service-recovery case must be logged and made visible for operational recovery.

---

## 10. Validations

### 10.1 Feedback Submission

- Guest/session must be authorised.
- Order or visit context must be valid.
- Rating value must conform to the approved rating scale.
- Item rating must reference an item associated with the relevant order/visit.
- Comment length limits must be enforced once defined.
- Photograph count/size/type limits must be enforced once defined.
- Feedback must not be submitted multiple times for the same event unless the product policy explicitly permits updates.

### 10.2 Service-Recovery Case

- Feedback must exist.
- Trigger rating must be available.
- Threshold must be configured.
- Assigned manager must be valid and active.
- SLA due time must be calculable from the configured policy.

### 10.3 Goodwill Gesture

- Manager must have the required permission.
- Gesture must be within configured authorisation limits.
- A reason/description should be stored.
- Monetary or benefit reference must be recorded where applicable.

The BRS defines authorisation limits but does not define the exact goodwill data fields.

### 10.4 Public Review Invitation

- Private feedback must already exist.
- Feedback must satisfy the configured positive-feedback condition.
- Guest must not have already received the same invitation for the same feedback event, subject to final policy.

---

## 11. API Requirements

The following are proposed SRS API contracts. Exact endpoint names and payloads are subject to API design review.

### 11.1 Feedback

`POST /api/v1/feedback`

Create private feedback.

Expected inputs:

- order_id or visit_id
- overall rating
- item ratings
- comments
- photograph references

`GET /api/v1/feedback/{feedback_id}`

Retrieve feedback and associated service-recovery state according to guest permissions.

### 11.2 Feedback Update

`PATCH /api/v1/feedback/{feedback_id}`

Use only if product policy permits editing after submission.

Editing policy is TBD.

### 11.3 Service Recovery

`GET /api/v1/service-recovery/{case_id}`

Retrieve service-recovery case information for authorised staff/manager roles.

`POST /api/v1/service-recovery/{case_id}/response`

Record manager response.

`POST /api/v1/service-recovery/{case_id}/goodwill`

Issue and record goodwill action.

`POST /api/v1/service-recovery/{case_id}/resolve`

Record resolution.

### 11.4 Reporting

Admin/reporting APIs should support filter dimensions:

- outlet
- item
- staff section
- channel
- day-part
- date range

Exact reporting endpoints are TBD.

---

## 12. Integration Requirements

| Integration | Purpose | Direction | Criticality | Module Use |
|---|---|---|---|---|
| Analytics Platform | Product/funnel analytics and retention cohorts | Outbound | Medium | Feedback/reporting analytics |
| Review Platforms | Reputation monitoring after private feedback | Inbound | Low | Public review ecosystem |
| Notification Services | Feedback prompt and manager/guest communication where applicable | Outbound | High | Prompt and service-recovery communication |
| Guest Account / Identity | Guest identity and permissions | Internal | Core dependency | Authenticated feedback |
| Order / POS | Order and completion context | Internal/integration | Critical dependency | Feedback eligibility and transaction context |
| Admin Console | Reporting, configuration and manager workflows | Internal | Core dependency | Thresholds, reporting, case handling |

The BRS integration principle requires partner outages to affect only the affected capability rather than the whole application.

---

## 13. Notifications and Communication

The Feedback module depends on the notification capability covered by SRS 5.1.8.

### Required communication

- Post-order feedback prompt within one hour of completion.
- Service-recovery response communication where manager response is delivered in-app.
- Public-review invitation after positive private feedback, when applicable.

The BRS does not specify every notification template or channel for feedback/service recovery. Those should follow the approved notification design.

---

## 14. Error and Exception Handling

### 14.1 Feedback Submission Failure

- Do not present the feedback as successfully submitted.
- Preserve valid entered data locally where supported by the app.
- Return a clear retry state.
- Log server-side failure.

### 14.2 Photograph Upload Failure

- Feedback submission should not be marked successful if required media handling has failed and the user expects it to be attached.
- Where product policy allows, permit retrying media upload before final submission.
- Do not silently lose user-selected photographs.

Exact offline/media retry behavior is TBD.

### 14.3 Duplicate Submission

- Prevent duplicate feedback creation for the same feedback event.
- Use idempotency where the client may retry the same submission.

### 14.4 Case Creation Failure

- Feedback should remain stored if the service-recovery case creation fails after feedback persistence.
- Queue/retry case creation where safe.
- Alert the operations owner if the failure persists.

### 14.5 Manager SLA Breach

- Mark the case as overdue/escalated according to configured policy.
- Notify the responsible operational owner where escalation is configured.

Exact escalation timing and recipient are TBD.

### 14.6 Public Review Integration Failure

- Private feedback must remain intact.
- Public-review invitation may be retried or suppressed according to policy.
- A public-review integration outage must not affect private feedback submission.

---

## 15. Security and Privacy Requirements

The module must follow relevant BRS privacy and security requirements:

- Feedback data must be protected in transit and at rest.
- Guest feedback must be accessible only to authorised parties.
- Personal information in comments and photographs must be handled under applicable privacy controls.
- Data collection must have a lawful basis.
- Minimum necessary retention applies.
- Deletion/export requirements must be supported for personal data, subject to statutory transaction retention.
- Manager actions must be attributed and auditable.
- Behavioural analytics must not be retained longer than 24 months.
- Errors and integration faults must be logged and monitored.

The BRS does not define image moderation, content scanning, exact access matrix, or detailed photograph retention policy; these remain TBD.

---

## 16. Reporting Requirements

Feedback reports shall be filterable/groupable by:

- Date range.
- Outlet.
- Item.
- Staff section.
- Channel.
- Day-part.

### Suggested metrics for implementation review

The BRS directly requires feedback reporting but does not define all metric formulas. Candidate metrics for approval include:

- Feedback count.
- Average rating.
- Low-rating count.
- Service-recovery case count.
- Open cases.
- Overdue cases.
- Average response time.
- Goodwill issued.
- Resolution rate.
- Public-review invitation count.
- Public-review click/response outcome where available.

These candidate metrics are not direct BRS requirements and must be approved before being treated as mandatory.

---

## 17. Acceptance Criteria

### AC-FB-01
Guest can submit a rating for an order.

### AC-FB-02
Guest can submit a rating for a visit.

### AC-FB-03
Guest can rate individual items.

### AC-FB-04
Guest can add optional comments.

### AC-FB-05
Guest can add optional photographs.

### AC-FB-06
A rating below the configured threshold creates a service-recovery case.

### AC-FB-07
The service-recovery case is assigned to a manager and receives a response SLA.

### AC-FB-08
Manager can review the submitted feedback.

### AC-FB-09
Manager can respond in-app.

### AC-FB-10
Manager can issue a goodwill gesture within defined authorisation limits.

### AC-FB-11
Manager response, goodwill action and resolution are recorded for audit.

### AC-FB-12
Guest is invited to share positive feedback publicly only after private feedback has been submitted.

### AC-FB-13
Feedback reports support outlet, item, staff section, channel and day-part dimensions.

### AC-FB-14
Feedback prompt is triggered within one hour of order completion as required by the BRS flow.

### AC-FB-15
Duplicate feedback/service-recovery records are prevented for the same triggering event.

### AC-FB-16
Public-review integration failure does not remove or invalidate private feedback.

### AC-FB-17
Service-recovery case creation/update failures are observable and recoverable.

### AC-FB-18
Feedback and service-recovery access follows authorised role permissions.

---

## 18. Dependencies

- Guest identity/account and authorisation.
- Order service / POS integration.
- Reservation/visit context.
- Notification service.
- Admin Console manager workflow.
- Reporting/analytics platform.
- Review-platform integration where used.
- Storage for feedback photographs.
- Configurable rating threshold.
- Configurable response SLA.
- Goodwill authorisation rules.

---

## 19. Phase 1 Scope Clarification

The BRS lists **private feedback, ratings and complaint capture** as part of the Guest App scope and defines FR-FB-01 through FR-FB-05 in the functional requirements.

The BRS acceptance criteria focus Phase 1 on successful reservation, waitlist, pickup, delivery and payment flows and on the broader requirement set marked Must. The detailed implementation/release treatment of the Should-level public-review invitation and manager goodwill features should therefore be tracked against their BRS priorities and the approved Phase 1 scope, rather than silently changing their priority.

---

## 20. Open Decisions / TBD

1. Rating scale and allowed values.
2. Low-rating threshold value.
3. Definition of “positive feedback.”
4. Response SLA duration.
5. Service-recovery escalation timing.
6. Manager roles allowed to respond.
7. Goodwill gesture types.
8. Goodwill monetary/benefit limits.
9. Goodwill escalation/approval workflow above manager limit.
10. Feedback editing policy after submission.
11. Duplicate-feedback policy.
12. Maximum comment length.
13. Photograph file types, size and count limits.
14. Photo retention duration.
15. Photo moderation/content policy.
16. Public review platform/provider list.
17. Public-review invitation frequency/cool-down.
18. Public-review deep-link and attribution behavior.
19. Final service-recovery case status model.
20. Exact reporting metrics and formulas.
21. Feedback dashboard layout and export columns.
22. Role-based access matrix for feedback/cases.
23. Notification templates and communication channels.
24. Offline feedback behavior.

---

## 21. Implementation Notes

### Guest App

- Feedback prompt entry point.
- Private rating form.
- Item-level rating interface.
- Comment and photograph attachment.
- Service-recovery response view.
- Public-review invitation screen/deep link where configured.

### FastAPI Backend

- Feedback creation and validation.
- Threshold evaluation.
- Service-recovery case orchestration.
- Manager response/goodwill APIs.
- Audit events.
- Reporting data access.
- Integration with notification/review/analytics services.

### PostgreSQL

Recommended logical records:

- feedback
- feedback_item_rating
- feedback_media
- service_recovery_case
- service_recovery_action
- feedback_audit_event
- public_review_invitation

Exact tables/relations are subject to database design.

### Redis

Potential uses:

- SLA timers/cache.
- Duplicate-submission protection.
- Short-lived workflow state.
- Rate limiting.

### Future Event Architecture

Feedback creation and service-recovery lifecycle events can later be emitted through the platform's internal outbox/event mechanism and scaled through Kafka if required. This is implementation guidance, not a BRS requirement.

---

## 22. Module Completion Checklist

- [ ] FR-FB-01 implemented.
- [ ] FR-FB-02 implemented.
- [ ] FR-FB-03 implemented according to approved scope.
- [ ] FR-FB-04 implemented according to approved scope.
- [ ] FR-FB-05 implemented.
- [ ] Private feedback flow tested.
- [ ] Order/visit context validation tested.
- [ ] Low-rating case creation tested.
- [ ] Manager assignment tested.
- [ ] SLA tracking tested.
- [ ] In-app manager response tested.
- [ ] Goodwill authorisation tested.
- [ ] Audit trail tested.
- [ ] Public-review invitation sequencing tested.
- [ ] Feedback reporting tested by outlet/item/staff section/channel/day-part.
- [ ] Feedback prompt timing tested.
- [ ] Duplicate prevention tested.
- [ ] Error/exception handling tested.
- [ ] Security/privacy tests completed.
- [ ] TBD decisions resolved or formally approved.
