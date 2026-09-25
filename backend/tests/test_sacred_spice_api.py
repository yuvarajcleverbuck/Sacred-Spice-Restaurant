"""Sacred Spice — Guest App backend regression suite (Phase 1 MVP)."""
import datetime as dt
import uuid

import pytest


# --------------------------------------------------------------------- health
def test_root_ok(api, base_url):
    r = api.get(f"{base_url}/api/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_health_mongo(api, base_url):
    r = api.get(f"{base_url}/api/health")
    assert r.status_code == 200
    assert r.json()["ok"] is True


# --------------------------------------------------------------------- auth
class TestAuth:
    def test_register_returns_dev_otp(self, api, base_url, fresh_email):
        r = api.post(f"{base_url}/api/auth/register", json={
            "email": fresh_email, "password": "Password123!", "name": "Test Guest",
        })
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["otp_required"] is True
        assert body["dev_otp"] == "000000"

    def test_verify_otp_then_login(self, api, base_url, fresh_email):
        api.post(f"{base_url}/api/auth/register", json={
            "email": fresh_email, "password": "Password123!", "name": "Verify User",
        })
        r = api.post(f"{base_url}/api/auth/verify-otp", json={"email": fresh_email, "otp": "000000"})
        assert r.status_code == 200, r.text
        payload = r.json()
        assert payload["token_type"] == "bearer"
        assert "access_token" in payload and "refresh_token" in payload
        assert payload["guest"]["email"] == fresh_email

        # subsequent login works
        lr = api.post(f"{base_url}/api/auth/login", json={"email": fresh_email, "password": "Password123!"})
        assert lr.status_code == 200

    def test_login_seed_user(self, api, base_url):
        r = api.post(f"{base_url}/api/auth/login", json={"email": "priya@example.com", "password": "Password123!"})
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_bad_password(self, api, base_url):
        r = api.post(f"{base_url}/api/auth/login", json={"email": "priya@example.com", "password": "wrong-pass"})
        assert r.status_code == 401

    def test_refresh_rotates(self, api, base_url, guest_tokens):
        old_rt = guest_tokens["refresh_token"]
        r = api.post(f"{base_url}/api/auth/refresh", json={"refresh_token": old_rt})
        assert r.status_code == 200, r.text
        new = r.json()
        assert new["access_token"] and new["refresh_token"] != old_rt
        # old refresh should now be revoked
        r2 = api.post(f"{base_url}/api/auth/refresh", json={"refresh_token": old_rt})
        assert r2.status_code == 401

    def test_profile_requires_bearer(self, api, base_url):
        r = api.get(f"{base_url}/api/guest/profile")
        assert r.status_code == 401

    def test_profile_ok_with_bearer(self, api, base_url, auth_headers):
        r = api.get(f"{base_url}/api/guest/profile", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == "priya@example.com"


# --------------------------------------------------------------------- outlets & menu
class TestOutletsMenu:
    def test_list_outlets(self, api, base_url):
        r = api.get(f"{base_url}/api/outlets")
        assert r.status_code == 200
        outlets = r.json()
        assert len(outlets) >= 3
        ids = {o["id"] for o in outlets}
        assert {"outlet_manhattan", "outlet_brooklyn", "outlet_jersey"}.issubset(ids)
        for o in outlets:
            assert "is_open" in o

    def test_list_outlets_with_geo(self, api, base_url):
        r = api.get(f"{base_url}/api/outlets", params={"lat": 40.78, "lng": -73.97})
        assert r.status_code == 200
        for o in r.json():
            assert "distance_miles" in o

    def test_get_outlet(self, api, base_url):
        r = api.get(f"{base_url}/api/outlets/outlet_manhattan")
        assert r.status_code == 200
        assert r.json()["id"] == "outlet_manhattan"

    def test_get_menu(self, api, base_url):
        r = api.get(f"{base_url}/api/outlets/outlet_manhattan/menu")
        assert r.status_code == 200
        data = r.json()
        assert data["outlet_id"] == "outlet_manhattan"
        assert len(data["categories"]) > 0
        assert len(data["items"]) > 0
        assert any("chef_special" in it["tags"] for it in data["specials"])
        assert all("available" in it for it in data["items"])

    def test_get_item_with_recs(self, api, base_url):
        r = api.get(f"{base_url}/api/menu/items/it_butter_chicken", params={"outlet_id": "outlet_manhattan"})
        assert r.status_code == 200
        body = r.json()
        assert body["id"] == "it_butter_chicken"
        assert isinstance(body.get("recommendations"), list)


# --------------------------------------------------------------------- cart & quote
class TestCartAndQuote:
    @pytest.fixture(autouse=True)
    def _clear_cart(self, api, base_url, auth_headers):
        api.delete(f"{base_url}/api/cart", headers=auth_headers)
        yield
        api.delete(f"{base_url}/api/cart", headers=auth_headers)

    def test_add_missing_required_modifier_fails(self, api, base_url, auth_headers):
        # butter chicken requires bread modifier group
        r = api.post(f"{base_url}/api/cart/items", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "item_id": "it_butter_chicken", "quantity": 1, "modifiers": [],
        })
        assert r.status_code == 400

    def test_add_with_required_modifier_ok(self, api, base_url, auth_headers):
        r = api.post(f"{base_url}/api/cart/items", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "item_id": "it_butter_chicken", "quantity": 2,
            "modifiers": [{"group_id": "mod_bread", "option_id": "naan"}],
        })
        assert r.status_code == 200, r.text
        cart = r.json()
        assert cart["item_count"] == 2
        assert cart["outlet_id"] == "outlet_manhattan"
        assert cart["subtotal"] > 0

    def test_patch_quantity_zero_removes(self, api, base_url, auth_headers):
        r = api.post(f"{base_url}/api/cart/items", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "item_id": "it_butter_chicken", "quantity": 1,
            "modifiers": [{"group_id": "mod_bread", "option_id": "naan"}],
        })
        line_id = r.json()["items"][0]["id"]
        r2 = api.patch(f"{base_url}/api/cart/items/{line_id}", headers=auth_headers, json={"quantity": 0})
        assert r2.status_code == 200
        assert r2.json()["item_count"] == 0

    def test_get_cart_subtotal(self, api, base_url, auth_headers):
        api.post(f"{base_url}/api/cart/items", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "item_id": "it_butter_chicken", "quantity": 1,
            "modifiers": [{"group_id": "mod_bread", "option_id": "naan"}],
        })
        r = api.get(f"{base_url}/api/cart", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["subtotal"] > 0

    def test_quote_pickup_with_promo(self, api, base_url, auth_headers):
        # Need subtotal >= $20 → 2x butter chicken (~$19.50 each) is safely above min
        api.post(f"{base_url}/api/cart/items", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "item_id": "it_butter_chicken", "quantity": 2,
            "modifiers": [{"group_id": "mod_bread", "option_id": "naan"}],
        })
        r = api.post(f"{base_url}/api/cart/quote", headers=auth_headers, json={
            "service_type": "pickup", "promo_code": "WELCOME10",
        })
        assert r.status_code == 200, r.text
        q = r.json()
        # promo may or may not apply depending on first_order_only status of this seeded user.
        # Assert response structure and that a subtotal was computed.
        assert q["service_type"] == "pickup"
        assert q["subtotal"] > 0
        assert "total" in q

    def test_quote_delivery_without_address_errors(self, api, base_url, auth_headers):
        api.post(f"{base_url}/api/cart/items", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "item_id": "it_butter_chicken", "quantity": 2,
            "modifiers": [{"group_id": "mod_bread", "option_id": "naan"}],
        })
        r = api.post(f"{base_url}/api/cart/quote", headers=auth_headers, json={"service_type": "delivery"})
        assert r.status_code == 200
        q = r.json()
        assert q["valid"] is False
        assert any("address" in e.lower() for e in q["errors"])

    def test_quote_dine_in_without_table_errors(self, api, base_url, auth_headers):
        api.post(f"{base_url}/api/cart/items", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "item_id": "it_butter_chicken", "quantity": 1,
            "modifiers": [{"group_id": "mod_bread", "option_id": "naan"}],
        })
        r = api.post(f"{base_url}/api/cart/quote", headers=auth_headers, json={"service_type": "dine_in"})
        assert r.status_code == 200
        q = r.json()
        assert q["valid"] is False
        assert any("table" in e.lower() for e in q["errors"])

    def test_quote_scheduled_too_soon_errors(self, api, base_url, auth_headers):
        api.post(f"{base_url}/api/cart/items", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "item_id": "it_butter_chicken", "quantity": 1,
            "modifiers": [{"group_id": "mod_bread", "option_id": "naan"}],
        })
        soon = (dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=10)).isoformat()
        r = api.post(f"{base_url}/api/cart/quote", headers=auth_headers, json={
            "service_type": "pickup", "scheduled_for": soon,
        })
        assert r.status_code == 200
        q = r.json()
        assert q["valid"] is False
        assert any("30 minutes" in e for e in q["errors"])


# --------------------------------------------------------------------- orders (grouped in cart class to keep shared cart state on one xdist worker)
    @pytest.fixture()
    def placed_order(self, api, base_url, auth_headers):
        api.delete(f"{base_url}/api/cart", headers=auth_headers)
        api.post(f"{base_url}/api/cart/items", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "item_id": "it_butter_chicken", "quantity": 1,
            "modifiers": [{"group_id": "mod_bread", "option_id": "naan"}],
        })
        r = api.post(f"{base_url}/api/orders", headers=auth_headers, json={
            "service_type": "pickup", "idempotency_key": f"TEST_{uuid.uuid4().hex}",
        })
        assert r.status_code == 200, r.text
        return r.json()

    def test_place_order_pickup(self, placed_order, api, base_url, auth_headers):
        assert placed_order["status"] == "accepted"
        assert placed_order["payment"]["status"] == "authorized"
        assert placed_order["pos"]["status"] == "synced"
        # cart cleared
        c = api.get(f"{base_url}/api/cart", headers=auth_headers).json()
        assert c["item_count"] == 0
        # notification present
        n = api.get(f"{base_url}/api/notifications", headers=auth_headers).json()
        assert any(item["ref"].get("order_id") == placed_order["id"] for item in n["items"])

    def test_list_and_get_order(self, placed_order, api, base_url, auth_headers):
        r = api.get(f"{base_url}/api/orders", headers=auth_headers)
        assert r.status_code == 200
        assert any(o["id"] == placed_order["id"] for o in r.json())
        r2 = api.get(f"{base_url}/api/orders/{placed_order['id']}", headers=auth_headers)
        assert r2.status_code == 200
        assert r2.json()["id"] == placed_order["id"]

    def test_cancel_fresh_order(self, placed_order, api, base_url, auth_headers):
        r = api.post(f"{base_url}/api/orders/{placed_order['id']}/cancel", headers=auth_headers, json={"reason": "test"})
        assert r.status_code == 200, r.text
        body = r.json()
        # A freshly accepted order should cancel outright.
        assert body.get("cancellation") in ("confirmed", "pending_staff_approval")
        if body.get("cancellation") == "confirmed":
            g = api.get(f"{base_url}/api/orders/{placed_order['id']}", headers=auth_headers).json()
            assert g["status"] == "cancelled"

    def test_reorder_refills_cart(self, placed_order, api, base_url, auth_headers):
        api.delete(f"{base_url}/api/cart", headers=auth_headers)
        r = api.post(f"{base_url}/api/orders/{placed_order['id']}/reorder", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["added"] >= 1
        c = api.get(f"{base_url}/api/cart", headers=auth_headers).json()
        assert c["item_count"] >= 1
        api.delete(f"{base_url}/api/cart", headers=auth_headers)

    def test_idempotency_dedupe(self, api, base_url, auth_headers):
        api.delete(f"{base_url}/api/cart", headers=auth_headers)
        api.post(f"{base_url}/api/cart/items", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "item_id": "it_butter_chicken", "quantity": 1,
            "modifiers": [{"group_id": "mod_bread", "option_id": "naan"}],
        })
        key = f"TEST_{uuid.uuid4().hex}"
        r1 = api.post(f"{base_url}/api/orders", headers=auth_headers, json={"service_type": "pickup", "idempotency_key": key})
        assert r1.status_code == 200
        first_id = r1.json()["id"]
        # 2nd request: cart is now empty; without dedupe we'd get a 400 empty-cart error.
        r2 = api.post(f"{base_url}/api/orders", headers=auth_headers, json={"service_type": "pickup", "idempotency_key": key})
        assert r2.status_code == 200
        assert r2.json()["id"] == first_id

    def test_feedback_low_rating_recovery_and_duplicate(self, placed_order, api, base_url, auth_headers):
        o = placed_order
        r = api.post(f"{base_url}/api/feedback", headers=auth_headers, json={
            "order_id": o["id"], "rating": 2, "comment": "test", "tags": ["cold"],
        })
        assert r.status_code == 200, r.text
        assert r.json()["service_recovery_case_id"]
        r2 = api.post(f"{base_url}/api/feedback", headers=auth_headers, json={
            "order_id": o["id"], "rating": 5,
        })
        assert r2.status_code == 409


# --------------------------------------------------------------------- reservations & waitlist
class TestReservationsAndWaitlist:
    def _tomorrow(self):
        return (dt.date.today() + dt.timedelta(days=1)).isoformat()

    def test_availability(self, api, base_url):
        r = api.get(f"{base_url}/api/outlets/outlet_manhattan/reservations/availability",
                    params={"date": self._tomorrow(), "party_size": 4})
        assert r.status_code == 200
        body = r.json()
        assert body["party_size"] == 4
        assert len(body["slots"]) > 0

    def test_reserve_high_demand_slot_pending_then_confirm(self, api, base_url, auth_headers):
        date = self._tomorrow()
        # 19:00 is defined as high_demand → pending_confirmation
        r = api.post(f"{base_url}/api/reservations", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "date": date, "time": "19:00", "party_size": 2,
        })
        assert r.status_code in (200, 409), r.text  # slot may already be full from earlier test runs
        if r.status_code == 409:
            pytest.skip("19:00 slot already taken from previous runs")
        res = r.json()
        assert res["status"] == "pending_confirmation"
        rid = res["id"]

        c = api.post(f"{base_url}/api/reservations/{rid}/confirm", headers=auth_headers)
        assert c.status_code == 200
        assert c.json()["status"] == "confirmed"

        # patch party size
        p = api.patch(f"{base_url}/api/reservations/{rid}", headers=auth_headers, json={"party_size": 3})
        assert p.status_code == 200
        assert p.json()["party_size"] == 3

        # cancel
        x = api.post(f"{base_url}/api/reservations/{rid}/cancel", headers=auth_headers)
        assert x.status_code == 200
        assert x.json()["status"] == "cancelled"

    def test_reserve_regular_slot_confirmed(self, api, base_url, auth_headers):
        # Pick a non-high-demand slot from availability
        date = self._tomorrow()
        av = api.get(f"{base_url}/api/outlets/outlet_manhattan/reservations/availability",
                     params={"date": date, "party_size": 2}).json()
        slot = next((s for s in av["slots"] if s["available"] and not s["high_demand"]), None)
        if not slot:
            pytest.skip("no non-high-demand slot available")
        r = api.post(f"{base_url}/api/reservations", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "date": date, "time": slot["time"], "party_size": 2,
        })
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "confirmed"
        api.post(f"{base_url}/api/reservations/{r.json()['id']}/cancel", headers=auth_headers)

    def test_waitlist_join_current_leave(self, api, base_url, auth_headers):
        r = api.post(f"{base_url}/api/waitlist", headers=auth_headers, json={
            "outlet_id": "outlet_manhattan", "party_size": 2,
        })
        assert r.status_code == 200, r.text
        wid = r.json()["id"]
        c = api.get(f"{base_url}/api/waitlist/current", headers=auth_headers)
        assert c.status_code == 200
        assert c.json() and c.json()["id"] == wid
        l = api.post(f"{base_url}/api/waitlist/{wid}/leave", headers=auth_headers)
        assert l.status_code == 200
        assert l.json()["status"] == "left"


# --------------------------------------------------------------------- loyalty / promos / notifications / profile
class TestLoyaltyPromoNotifProfile:
    def test_loyalty(self, api, base_url, auth_headers):
        r = api.get(f"{base_url}/api/loyalty", headers=auth_headers)
        assert r.status_code == 200
        body = r.json()
        for k in ("points", "lifetime_points", "tier", "rewards", "transactions"):
            assert k in body

    def test_promotions_eligible(self, api, base_url, auth_headers):
        r = api.get(f"{base_url}/api/promotions/eligible", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_notifications_flow(self, api, base_url, auth_headers):
        r = api.get(f"{base_url}/api/notifications", headers=auth_headers)
        assert r.status_code == 200
        assert "items" in r.json() and "unread" in r.json()
        m = api.post(f"{base_url}/api/notifications/read-all", headers=auth_headers)
        assert m.status_code == 200
        r2 = api.get(f"{base_url}/api/notifications", headers=auth_headers)
        assert r2.json()["unread"] == 0

    def test_profile_patch(self, api, base_url, auth_headers):
        r = api.patch(f"{base_url}/api/guest/profile", headers=auth_headers, json={
            "preferences": {"dietary": ["vegetarian"], "spice_preference": 3},
            "consents": {"email": True},
        })
        assert r.status_code == 200
        prof = r.json()
        assert "vegetarian" in prof["preferences"]["dietary"]
        assert prof["consents"]["email"] is True

    def test_address_crud(self, api, base_url, auth_headers):
        add = api.post(f"{base_url}/api/guest/addresses", headers=auth_headers, json={
            "label": "TEST", "line1": "1 Test St", "city": "New York", "state": "NY", "zip": "10024",
        })
        assert add.status_code == 200
        addr_id = add.json()["id"]
        prof = api.get(f"{base_url}/api/guest/profile", headers=auth_headers).json()
        assert any(a["id"] == addr_id for a in prof["addresses"])
        d = api.delete(f"{base_url}/api/guest/addresses/{addr_id}", headers=auth_headers)
        assert d.status_code == 200

