# Sacred Spice Restaurant
## System Architecture

**Project:** Sacred Spice Restaurant Platform  
**Roadmap Item:** September 2026 — System Architecture  
**Architecture Scope:** Phase 1 MVP  
**Market:** U.S.  
**Platform Model:** Multi-Restaurant / Multi-Location  
**Status:** Architecture Baseline for Development Planning

---

# 1. Purpose

This document defines the high-level system architecture for the Sacred Spice Restaurant platform.

The architecture covers the four connected product components:

- Guest App
- Staff App
- Kitchen Display System (KDS)
- Admin Console

It also defines the relationship between the platform backend, database, cache, real-time communication and external integrations.

The architecture converts the business requirements into a technical structure while keeping detailed database schema, detailed API contracts and vendor-specific infrastructure decisions for their respective design stages.

---

# 2. Architecture Goals

The architecture shall support the following project goals:

- One connected platform across guest, staff, kitchen and administration.
- Multi-restaurant and multi-location capability from the foundation.
- Reliable order processing.
- POS integration without replacing the POS.
- Payment integration.
- Delivery integration.
- Real-time kitchen and order-status updates.
- Reservation and capacity management.
- Loyalty and guest management.
- Reporting and reconciliation.
- Strong security and RBAC.
- Graceful degradation when external services fail.
- Scalability without a major redesign.
- Clear path for future event-driven scaling.

---

# 3. BRS Architecture Drivers

The BRS requires four connected components: Guest App, Staff App, KDS and Admin Console.

The BRS also establishes the following important architectural drivers:

- POS remains the financial system of record.
- POS, PSP and KDS are critical integrations.
- Delivery, table/floor plan, notifications and mapping are high-criticality integrations.
- External partner failures should affect only the affected capability.
- Accepted orders must not be lost.
- Order injection must be idempotent and retried with alerting.
- Staff App and KDS must continue to display/progress accepted orders during short network loss and reconcile after reconnection.
- Business users must be able to change supported menu, pricing, policy and content without an application release.
- Integration faults require monitoring and reconciliation reporting.

---

# 4. High-Level Architecture

```text
                         SACRED SPICE PLATFORM
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
        ▼                       ▼                        ▼
   Guest App                Staff App                  KDS
 React Native             React Native             Web Application
 TypeScript               TypeScript               / KDS Client
        │                       │                        │
        └───────────────────────┼────────────────────────┘
                                │
                                ▼
                      ┌─────────────────────┐
                      │   API / Backend      │
                      │   FastAPI Platform   │
                      └──────────┬──────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
                 PostgreSQL     Redis      Real-Time
                    │                       WebSockets
                    │
                    ▼
              Integration Layer
                    │
       ┌────────────┼───────────────────────────┐
       │            │            │               │
       ▼            ▼            ▼               ▼
      POS          PSP       Delivery       Notifications
       │                         │
       └────────────┬────────────┘
                    │
              Other Services
                    │
       ┌────────────┼───────────────┐
       ▼            ▼               ▼
   Maps/Address  Accounting   CRM/Analytics
```

---

# 5. Architecture Style

## 5.1 Phase 1 Architecture

The Phase 1 architecture should use a **modular monolith** approach.

This means:

- one primary backend application;
- clearly separated internal business modules;
- shared platform infrastructure;
- explicit module boundaries;
- controlled dependencies between modules;
- common authentication, authorization, logging and configuration;
- integration adapters isolated from core business logic.

### Logical Structure

```text
FastAPI Backend
│
├── Identity & Access
├── Restaurant / Location
├── Guest
├── Menu
├── Reservation
├── Waitlist
├── Order
├── Payment
├── Loyalty
├── Notification
├── Feedback / Service Recovery
├── Staff Operations
├── KDS
├── Delivery
├── Reporting
├── Reconciliation
└── Audit
```

This gives Phase 1 a single deployable backend while maintaining boundaries so individual modules can be extracted later if justified.

## 5.2 Future Scaling Direction

The architecture should permit a future transition toward:

```text
Modular Monolith
      ↓
Internal Events / Outbox
      ↓
Event Broker
      ↓
Selected Services / Consumers
      ↓
Event-Driven Architecture
```

Kafka/event-driven architecture is a future scaling direction, not a Phase 1 prerequisite.

---

# 6. Client Applications

## 6.1 Guest App

### Technology Direction

- React Native
- TypeScript
- iOS
- Android

### Responsibilities

- Guest account.
- Restaurant/location selection.
- Menu discovery.
- Reservations.
- Waitlist.
- Cart.
- Pickup/delivery ordering.
- Payment initiation/status.
- Loyalty.
- Order tracking.
- Notifications.
- Feedback.
- Service recovery interaction.

The Guest App does not directly connect to the POS or payment provider for business orchestration unless an approved provider SDK/flow specifically requires a client-side component.

Primary business orchestration remains on the platform backend.

---

## 6.2 Staff App

### Technology Direction

- React Native
- TypeScript
- Tablet/phone.

### Responsibilities

- Staff authentication.
- Floor plan.
- Table management.
- Waitlist.
- Order management.
- Table-side ordering.
- Guest service information.
- Delivery dispatch operations.
- Item availability.
- Staff activity actions.

The Staff App communicates with the backend and does not directly own business rules.

---

## 6.3 KDS

### Technology Direction

- React
- TypeScript
- Web-based KDS client.

### Responsibilities

- Live kitchen queue.
- Ticket prioritization.
- Station routing.
- Course firing.
- Modifier/allergy/special instruction display.
- Prep timers.
- Escalation.
- Capacity signals.
- Prep-time recording.

The KDS requires real-time communication with the backend.

---

## 6.4 Admin Console

### Technology Direction

- React
- TypeScript.

### Responsibilities

- Menu configuration.
- Pricing.
- Availability.
- Reservations/capacity configuration.
- Promotions.
- Loyalty configuration.
- Staff roles/permissions.
- Reporting.
- Reconciliation.
- Audit.
- Content publishing.

---

# 7. Backend Architecture

## 7.1 API Layer

The API layer provides the primary interface between clients and backend business capabilities.

Responsibilities:

- request authentication;
- authorization;
- validation;
- routing;
- business-service invocation;
- response formatting;
- error handling;
- request tracing.

Detailed endpoint design will be defined under API Architecture Planning.

---

# 7.2 Core Business Modules

## Identity & Access

Handles:

- authentication;
- authorization;
- sessions/tokens;
- RBAC;
- outlet scope;
- security events.

## Restaurant / Location

Handles:

- restaurant;
- location/outlet;
- location configuration;
- outlet context.

## Guest

Handles:

- guest profile;
- saved addresses;
- preferences;
- consent;
- order/reservation history.

## Menu

Handles:

- categories;
- items;
- modifiers;
- combos;
- spice;
- allergens;
- dietary tags;
- availability;
- menu scheduling.

## Reservation / Waitlist

Handles:

- availability;
- reservations;
- table capacity;
- waitlist;
- seating-related state.

## Order

Handles:

- cart conversion;
- order creation;
- order state machine;
- order modification;
- cancellation;
- instructions;
- fulfillment context.

## Payment

Handles:

- payment intent/authorization orchestration;
- capture;
- refund;
- payment state;
- idempotency;
- payment-provider references.

## Loyalty

Handles:

- earning;
- redemption;
- points;
- rewards;
- tier rules where applicable;
- loyalty audit.

## Notification

Handles:

- notification events;
- push;
- SMS;
- email;
- consent checks;
- frequency limits.

## Staff Operations

Handles:

- staff actions;
- table operations;
- incoming orders;
- item availability;
- delivery workflow.

## KDS

Handles:

- kitchen tickets;
- station routing;
- courses;
- timers;
- kitchen status;
- capacity signals.

## Delivery

Handles:

- delivery dispatch;
- courier assignment state;
- tracking;
- proof of delivery;
- failure status.

## Feedback / Service Recovery

Handles:

- feedback;
- ratings;
- service-recovery cases;
- case status;
- goodwill actions.

## Reporting

Handles:

- report queries;
- aggregation;
- filters;
- export initiation;
- dashboard data.

## Reconciliation

Handles:

- app/POS comparison;
- PSP settlement comparison;
- exception tracking;
- resolution status.

## Audit

Handles:

- administrative audit;
- staff action audit;
- configuration change history;
- security events where applicable.

---

# 8. Database Architecture

## Primary Database

**PostgreSQL**

The database acts as the primary application persistence layer.

The detailed database design will be completed in the separate **Database Architecture Planning** task.

### Major Domain Areas

```text
Identity
Restaurant / Location
Guest
Menu
Reservation
Waitlist
Table / Floor
Order
Order Item
Payment
Loyalty
Notification
Delivery
Feedback
Staff
KDS
Reporting
Reconciliation
Audit
```

## Data Ownership Principle

The platform must distinguish between:

### Platform-Owned Operational Data

Examples:

- Guest profile.
- Reservation workflow.
- Waitlist.
- App order orchestration.
- Loyalty.
- Feedback.
- Staff actions.
- KDS operational state.

### External-System-Owned Data

Examples:

- POS financial source-of-record information.
- PSP provider transaction/settlement authority.
- Delivery provider operational records as applicable.

The platform stores references and operational data required to run the application and reconcile with external systems without creating a competing financial source of truth.

---

# 9. Cache Architecture

## Redis

Redis may be used for:

- caching;
- short-lived state;
- rate limiting;
- distributed coordination;
- temporary session/support state;
- real-time support structures;
- frequently accessed configuration.

Redis must not become the authoritative store for critical transactional records that require durable persistence.

The exact Redis usage model will be finalized during technical design.

---

# 10. Real-Time Architecture

## WebSockets

WebSockets are required for real-time operational functionality.

### Primary Use Cases

```text
KDS
  ↑
  │ Live tickets/status
  │
Backend
  │
  ├── Staff App
  │
  └── Guest App
       ↑
       │ Order status / live updates
```

Examples:

- New order appears on KDS.
- Kitchen status changes.
- Order status changes.
- Item availability changes.
- Waitlist status changes.
- Capacity/promise-time changes.
- Delivery tracking updates where supported.

---

# 11. Integration Architecture

All third-party integrations should be isolated behind an integration layer/adapters.

```text
Business Module
      ↓
Integration Interface
      ↓
Provider Adapter
      ↓
External API
```

This prevents provider-specific code from spreading throughout the business modules.

---

# 12. POS Integration

```text
Order Module
     ↓
POS Adapter
     ↓
Existing POS
```

### Rules

- POS remains financial system of record.
- Accepted orders must not be lost.
- Injection must be idempotent.
- Failed requests require controlled retry.
- Failures require alerting.
- POS references must be stored for reconciliation.

POS discovery is still dependent on the actual POS API documentation and POC.

---

# 13. Payment Integration

```text
Payment Module
       ↓
PSP Adapter
       ↓
Payment Provider
```

### Rules

- Use provider-managed payment handling.
- Do not store raw card data.
- Track provider references.
- Support authorization/capture/refund.
- Use safe retry/idempotency.
- Reconcile settlement data.

---

# 14. Delivery Integration

```text
Delivery Module
       ↓
Delivery Adapter
       ↓
Logistics Provider
```

### Rules

- Dispatch through contracted provider.
- Receive courier/tracking state.
- Receive proof of delivery.
- Capture failure state.
- Support provider outage handling.
- Keep delivery-specific provider logic inside the adapter layer.

---

# 15. Notification Integration

```text
Notification Module
        ↓
Provider Adapters
   ┌────┼────┐
   ↓    ↓    ↓
 Push  SMS  Email
```

Marketing communication must apply:

- consent;
- quiet hours;
- frequency caps.

Transactional communication should support the BRS-defined fallback behavior where applicable.

---

# 16. Maps / Location Integration

```text
Delivery / Location Module
           ↓
       Maps Adapter
           ↓
 Google Maps / Mapbox
```

Possible capabilities:

- map display;
- address search;
- address validation;
- geocoding;
- reverse geocoding;
- travel-time estimation.

Provider selection remains TBD.

---

# 17. Supporting Integrations

The architecture should provide adapter boundaries for:

```text
Accounting
CRM / Marketing Automation
Analytics
Review / Reputation
```

These should not be tightly coupled to the core order-processing path unless a confirmed business requirement requires synchronous behavior.

---

# 18. Order Processing Architecture

The order flow is one of the most critical platform paths.

```text
Guest / Staff
      ↓
Order API
      ↓
Order Validation
      ↓
Order State Machine
      ↓
Payment / Payment State
      ↓
POS Integration
      ↓
KDS
      ↓
Kitchen Processing
      ↓
Ready
      ↓
Pickup / Delivery
      ↓
Completion
      ↓
Loyalty + Receipt + Feedback
```

The exact payment/POS ordering of steps must follow the finalized integration contracts.

---

# 19. Order State Machine

The platform shall use an explicit order state model rather than relying on unstructured status fields.

Example conceptual flow:

```text
Created
   ↓
Pending Payment
   ↓
Paid / Authorized
   ↓
Accepted
   ↓
Preparing
   ↓
Ready
   ↓
Dispatched / Awaiting Pickup
   ↓
Completed
```

Possible exception states include:

```text
Failed
Cancelled
Rejected
On Hold
Payment Pending
POS Pending
Delivery Failed
Refund Pending
Refunded
```

The exact final state vocabulary will be defined during Backend/API design.

---

# 20. Reliability Architecture

## 20.1 No Lost Accepted Orders

For accepted orders:

```text
Order
 ↓
Persist
 ↓
Create Integration Task
 ↓
POS / KDS Processing
 ↓
Retry on Failure
 ↓
Alert on Persistent Failure
 ↓
Reconcile
```

The durable platform record must exist before relying on external system delivery.

## 20.2 Idempotency

Critical operations should use idempotency controls.

Examples:

- order submission;
- POS order injection;
- payment operations where supported;
- refunds;
- webhook/event processing.

Duplicate external requests must not create duplicate business transactions.

## 20.3 Retry

Retry policies shall distinguish:

- temporary network errors;
- timeout errors;
- rate-limit responses;
- permanent validation errors;
- authentication errors;
- business-rule rejection.

Exact retry counts and backoff settings are TBD.

---

# 21. Offline / Network Resilience

The BRS requires Staff App and KDS resilience during short network loss.

High-level approach:

```text
Connected
   ↓
Local Operational State
   ↓
Network Loss
   ↓
Continue Display / Progress
   ↓
Network Restored
   ↓
Synchronize
   ↓
Reconcile
```

The detailed offline storage and conflict-resolution design will be defined later.

The Guest App does not automatically receive the same offline behavior unless a separate requirement is established.

---

# 22. Multi-Restaurant / Multi-Location Architecture

The project is intended to support multiple restaurants and locations.

Logical hierarchy:

```text
Platform
   ↓
Restaurant
   ↓
Location / Outlet
   ├── Menu
   ├── Tables
   ├── Staff
   ├── Reservations
   ├── Orders
   ├── KDS
   └── Configuration
```

All relevant entities and requests should carry sufficient restaurant/location context.

### Access Rule

```text
User
 ↓
Role / Permission
 ↓
Restaurant Scope
 ↓
Location Scope
 ↓
Allowed Data + Operations
```

No request should rely solely on a client-supplied outlet ID for authorization.

---

# 23. Security Architecture

Security controls apply across all clients and backend services.

## Core Controls

- Secure authentication.
- RBAC.
- Least privilege.
- Outlet/location authorization.
- Encryption in transit.
- Encryption at rest.
- Rate limiting.
- Secret management.
- Audit logging.
- Secure API validation.
- Security monitoring.

## Sensitive Payment Data

Raw card information must remain with the PCI DSS compliant payment provider.

## Guest Privacy

Guest data must follow:

- lawful basis;
- minimum necessary collection;
- consent management;
- deletion requirements;
- export requirements;
- retention rules.

---

# 24. API Boundary

The client applications communicate through the backend API layer.

```text
Guest App ─────┐
Staff App ─────┤
KDS ───────────┼──→ API Layer → Business Modules
Admin Console ─┘
```

The architecture should prevent clients from directly accessing database tables.

---

# 25. Background Processing

Background processing is required for operations that should not block synchronous user requests.

Expected categories:

- notification delivery;
- retry processing;
- external webhook processing;
- reconciliation jobs;
- report generation;
- scheduled menu operations;
- loyalty posting where asynchronous;
- cleanup/retention tasks;
- integration recovery.

The detailed job infrastructure is TBD and belongs to backend/technology design.

---

# 26. Observability Architecture

The platform should provide centralized observability across:

```text
Applications
     ↓
Backend
     ↓
Integrations
     ↓
Database / Cache
```

Monitor:

- errors;
- API latency;
- order failures;
- POS failures;
- payment failures;
- delivery failures;
- notification failures;
- WebSocket failures;
- background job failures;
- database health;
- cache health;
- reconciliation exceptions.

Each operational event should be traceable through a request/correlation identifier where practical.

---

# 27. Availability & Failure Isolation

The architecture must isolate external-service failures.

Example:

```text
Payment Provider Down
        ↓
Payment Capability Affected
        ↓
Menu Still Available
Reservation Still Available
Guest Profile Still Available
Admin Still Accessible
```

Likewise:

```text
Delivery Provider Down
        ↓
Delivery Capability Affected
        ↓
Pickup / Reservation / Menu
Remain Available
```

The exact fallback behavior must follow the business policy for each capability.

---

# 28. Scalability Architecture

The BRS requires the platform to support at least ten times launch peak concurrent order volume without redesign.

The Phase 1 architecture should therefore allow:

- horizontal API scaling;
- stateless application instances where possible;
- shared PostgreSQL;
- shared Redis;
- asynchronous background processing;
- isolated external integration adapters;
- efficient WebSocket scaling;
- independent reporting workloads where needed.

Future high-volume event processing can introduce an event broker without rewriting the business modules.

---

# 29. Deployment Architecture

## Target

**Docker + AWS**

Conceptual deployment:

```text
                    AWS
                     │
              ┌──────┴──────┐
              │ Load / Entry │
              └──────┬──────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     Backend Instances     Real-Time Layer
          │                     │
          └──────────┬──────────┘
                     │
            ┌────────┴────────┐
            ▼                 ▼
       PostgreSQL           Redis
            │
            ▼
    Integration Workers
            │
     ┌──────┼──────────┐
     ▼      ▼          ▼
    POS     PSP    Delivery
```

Exact AWS services will be finalized under **Technology Stack Finalization + Cost Estimation**.

---

# 30. Environment Strategy

The project should separate:

```text
Development
     ↓
Staging / QA
     ↓
Production
```

External providers should use sandbox/test credentials in non-production environments whenever supported.

Production credentials must be isolated from development and staging.

---

# 31. Configuration Management

Business configuration and technical configuration should be separated.

### Business Configuration

Managed through Admin Console:

- menu;
- pricing;
- availability;
- reservation policy;
- capacity;
- promotions;
- loyalty rules;
- content.

### Technical Configuration

Managed through deployment/configuration infrastructure:

- API credentials;
- database settings;
- provider endpoints;
- feature flags;
- environment settings;
- infrastructure settings.

---

# 32. Architecture Decision Summary

| Area | Phase 1 Direction |
|---|---|
| Architecture Style | Modular Monolith |
| Backend | Python FastAPI |
| Guest/Staff Mobile | React Native + TypeScript |
| KDS/Admin Web | React + TypeScript |
| API | REST |
| Real-Time | WebSockets |
| Database | PostgreSQL |
| Cache | Redis |
| Containerization | Docker |
| Cloud Target | AWS |
| External Integration | Adapter / Integration Layer |
| POS | Existing POS remains financial system of record |
| Future Scaling | Event-driven / Kafka path |
| Multi-Restaurant | Supported from foundation |
| Multi-Location | Supported from foundation |

---

# 33. Architecture Boundaries

## In Scope

- Guest App.
- Staff App.
- KDS.
- Admin Console.
- Core backend.
- Database.
- Cache.
- Real-time communication.
- POS integration.
- PSP integration.
- Delivery integration.
- Notification integration.
- Maps/address integration.
- Supporting business integrations.
- Reporting.
- Reconciliation.
- Audit.

## Explicitly Not Replacing

- POS.
- Accounting system.
- External payment provider.
- External delivery fleet/provider.

---

# 34. Key Architecture Risks

| Risk | Architectural Response |
|---|---|
| POS integration limitations | Adapter layer + POC before full implementation |
| Payment failures | PSP abstraction + idempotency + retry + reconciliation |
| Delivery provider outage | Provider isolation + capability-level degradation |
| Kitchen overload | KDS capacity signals + dynamic promise-time integration |
| Duplicate transactions | Idempotency and durable business records |
| Multi-location data leakage | Server-side scope enforcement |
| Real-time connection failure | Reconnect + state reconciliation |
| Reporting load affecting transactions | Separate/asynchronous reporting workload where necessary |
| Future scale pressure | Modular boundaries + future event architecture |
| Scope expansion | Explicit module boundaries and change control |

---

# 35. Architecture Decisions Still Pending

The following should be finalized in subsequent roadmap activities:

- Exact AWS services.
- Exact POS integration protocol.
- Exact PSP provider.
- Exact delivery provider.
- Exact maps provider.
- Database schema.
- API endpoint contracts.
- Authentication/RBAC implementation details.
- Background-job technology.
- WebSocket scaling strategy.
- Monitoring/observability platform.
- CI/CD tooling.
- Infrastructure-as-code tool.
- Backup/disaster-recovery details.
- Event-broker adoption point.
- Exact offline synchronization design.

---

# 36. System Architecture Completion Checklist

- [x] Four application components defined.
- [x] Core backend boundary defined.
- [x] Modular monolith direction defined.
- [x] External integration layer defined.
- [x] POS system-of-record boundary defined.
- [x] PostgreSQL role defined.
- [x] Redis role defined.
- [x] WebSocket role defined.
- [x] Multi-restaurant/location boundary defined.
- [x] Reliability principles defined.
- [x] Security boundary defined.
- [x] Offline/resilience direction defined.
- [x] Deployment direction defined.
- [x] Future scaling path defined.
- [ ] Detailed database architecture.
- [ ] Detailed API architecture.
- [ ] Detailed authentication/RBAC architecture.
- [ ] Technology/cost finalization.
- [ ] Infrastructure architecture.

---

# 37. Roadmap Relationship

This document completes the **System Architecture** planning item in the September 2026 foundation phase.

Next architecture-related roadmap activities:

```text
System Architecture
        ↓
Technology Stack Finalization + Cost Estimation
        ↓
Multi-Restaurant & Multi-Location Architecture
        ↓
Database Architecture Planning
        ↓
API Architecture Planning
        ↓
Authentication & RBAC Planning
        ↓
Development Environment Setup
```

The detailed design documents should refine this architecture without changing the approved business requirements unless a formal change request is raised.

---

# 38. Source Reference

Primary business source:

**Sacred Spice Restaurant — Business Requirement Specification (BRS) v1.0, dated 15 September 2026.**

Relevant areas:

- §5 Scope
- §7 Business Process Flows
- §8 Functional Requirements
- §9 Non-Functional Requirements
- §10 Integration Requirements
- §11 Data and Reporting Requirements
- §12 Assumptions, Dependencies and Constraints
- §13 Risks and Mitigation
- §14 Acceptance Criteria

The BRS explicitly states that it does not prescribe technical architecture, framework choices or screen designs. This document therefore represents the project's architecture direction and design baseline, while provider-specific and detailed implementation choices remain subject to the subsequent roadmap activities.
