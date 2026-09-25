# Sacred Spice — Guest App (Phase 1 MVP)

## Original problem statement
User has a multi-app restaurant platform SRS (Guest App, Staff App, KDS, Admin Console + System Architecture) for "Sacred Spice Restaurant" (US, multi-restaurant / multi-location). They want web + mobile handled; decided: **this project = Guest App (Expo mobile, also runs on web) + shared FastAPI backend**. Staff App, KDS and Admin Console are to be built later as separate projects sharing this backend. Source docs saved in `/app/memory/docs/`.

## User choices
- Guest App first; Guest & Staff apps must be separate applications
- MongoDB for Phase 1 (docs specify PostgreSQL/Redis — deferred)
- Email + password JWT auth with **simulated OTP (000000)**; real SMS later
- Simulated payment (PSP), mocked POS / delivery partner / maps adapters

## Architecture
- **Backend**: FastAPI modular monolith in `/app/backend/server.py` (auth, guest, outlets, menu, cart/pricing, orders + time-based fulfilment state machine, reservations/waitlist, loyalty/promotions, notifications, feedback/service-recovery). Seed data in `seed.py` (3 outlets, 7 categories, 20 items, rewards, tiers, promos). Argon2 (pwdlib) + PyJWT access/refresh rotation. All routes under `/api`.
- **Frontend**: Expo Router. `(auth)/login|register|otp`, `outlets` (modal, optional location permission w/ Settings fallback), `(tabs)/index` (Menu), `orders` (Orders | Reservations + waitlist card), `rewards`, `profile`; stacks `item/[id]`, `cart` (checkout), `address`, `order/[id]` (timeline tracking), `reserve`, `reservation/[id]`, `feedback/[orderId]`, `notifications`. NativeTabs on iOS 26+, JS Tabs elsewhere. Theme: Editorial Light (terracotta / ivory, Playfair Display + Geist via expo-font).
- Tests: `/app/backend/tests/test_sacred_spice_api.py` (37 pytest, all green).

## User personas
- Guest (registered) — orders pickup/delivery/dine-in, reserves, earns loyalty
- (Future) Staff, kitchen, admin — separate apps

## Core requirements (static, from SRS 5.1.x)
Auth & account · outlet selection & serviceability · menu discovery w/ dietary/spice/allergen data, modifiers, combos/thalis, specials · cart & ordering w/ itemized charges, promise time, scheduling, allergy flags · order tracking timeline · reservations & waitlist · loyalty, tiers, promotions · notifications · feedback & service recovery · profile, addresses, consents, deletion request.

## Implemented (2026-06)
- Everything listed above end-to-end (see test_credentials.md for accounts/codes)
- Mock adapters: PSP authorization, POS ref, courier at dispatch, OTP delivery
- Order lifecycle simulated on wall-clock (1 / 3 / 4.5 / 6.5 min) → points awarded + receipt/feedback notifications on completion

## Backlog
- P0: Staff App (separate project) consuming same backend; real OTP (Twilio/Resend); real PSP (Stripe)
- P1: WebSocket live updates instead of polling; real delivery partner + maps; photo upload in feedback (Object Storage); reservation reminders scheduler; push notifications (on user request only)
- P2: KDS + Admin Console web projects; multi-language menu; group ordering; family loyalty; PostgreSQL migration if required

## Next tasks
1. Confirm guest flows on device via Expo Go
2. Start Staff App project against this backend (needs staff roles/RBAC endpoints here)
3. Swap simulated OTP/payment for real providers when keys are available
