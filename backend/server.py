"""Sacred Spice — Guest App platform backend (Phase 1 MVP, modular monolith)."""
import hashlib
import logging
import math
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorClient
from pwdlib import PasswordHash
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

from seed import TIERS, seed

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_REFRESH_SECRET = os.environ["JWT_REFRESH_SECRET"]
DEV_OTP = os.environ["DEV_OTP"]
ACCESS_MINUTES = 60 * 12
REFRESH_DAYS = 30
POINTS_PER_DOLLAR = 10

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("sacred_spice")

app = FastAPI(title="Sacred Spice Platform API")
api = APIRouter(prefix="/api")
ph = PasswordHash.recommended()


# ----------------------------------------------------------------------------- helpers
def now() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.isoformat()


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def pub(doc: Optional[dict]) -> Optional[dict]:
    """Public projection: _id -> id, strip secrets."""
    if not doc:
        return None
    d = {k: v for k, v in doc.items() if k not in ("_id", "password_hash", "otp_hash")}
    d["id"] = doc["_id"]
    return d


def digest(v: str) -> str:
    return hashlib.sha256(v.encode()).hexdigest()


def money(v: float) -> float:
    return round(v + 1e-9, 2)


def haversine_miles(lat1, lng1, lat2, lng2) -> float:
    r = 3958.8
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = p2 - p1
    dl = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return r * 2 * math.asin(math.sqrt(a))


def outlet_open_now(outlet: dict, at: Optional[datetime] = None) -> bool:
    at = at or now()
    local = at - timedelta(hours=4)  # US Eastern (EDT) approximation for Phase 1
    day = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][local.weekday()]
    h = outlet["hours"].get(day)
    if not h:
        return False
    return h["open"] <= local.strftime("%H:%M") <= h["close"]


async def notify(guest_id: str, category: str, title: str, body: str, ref: Optional[dict] = None):
    await db.notifications.insert_one({
        "_id": new_id("ntf"), "guest_id": guest_id, "category": category, "title": title,
        "body": body, "ref": ref or {}, "read": False, "created_at": iso(now()),
    })


# ----------------------------------------------------------------------------- auth
class RegisterBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=80)
    mobile: Optional[str] = None


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class OTPBody(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class RefreshBody(BaseModel):
    refresh_token: str


def make_jwt(sub: str, secret: str, lifetime: timedelta, kind: str, jti: str) -> str:
    issued = now()
    return jwt.encode({"sub": sub, "jti": jti, "type": kind, "iat": issued, "exp": issued + lifetime}, secret, algorithm="HS256")


async def issue_pair(user_id: str) -> dict:
    access = make_jwt(user_id, JWT_SECRET, timedelta(minutes=ACCESS_MINUTES), "access", secrets.token_hex(16))
    jti = secrets.token_hex(32)
    refresh = make_jwt(user_id, JWT_REFRESH_SECRET, timedelta(days=REFRESH_DAYS), "refresh", jti)
    await db.refresh_tokens.insert_one({
        "_id": jti, "user_id": user_id, "token_hash": digest(refresh),
        "expires_at": iso(now() + timedelta(days=REFRESH_DAYS)), "revoked": False,
    })
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}


def auth_error():
    return HTTPException(status_code=401, detail="Invalid or expired credentials")


async def current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise auth_error()
    try:
        claims = jwt.decode(authorization[7:], JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise auth_error()
    if claims.get("type") != "access":
        raise auth_error()
    user = await db.guests.find_one({"_id": claims["sub"]})
    if not user or user.get("account_status") == "deleted":
        raise auth_error()
    return user


def guest_public(u: dict) -> dict:
    d = pub(u)
    d.pop("otp_expires_at", None)
    return d


@api.post("/auth/register")
async def register(body: RegisterBody):
    email = body.email.lower()
    existing = await db.guests.find_one({"email": email})
    if existing and existing.get("verified"):
        raise HTTPException(409, "Email already registered")
    doc = {
        "_id": existing["_id"] if existing else new_id("gst"),
        "email": email, "name": body.name.strip(), "mobile": body.mobile,
        "password_hash": ph.hash(body.password), "verified": False,
        "otp_hash": ph.hash(DEV_OTP), "otp_expires_at": iso(now() + timedelta(minutes=10)),
        "account_status": "pending", "created_at": iso(now()), "updated_at": iso(now()),
        "addresses": [], "preferences": {"dietary": [], "allergens": [], "spice_preference": 2, "important_dates": []},
        "consents": {"email": False, "sms": False, "push": True},
        "loyalty": {"points": 0, "lifetime_points": 0},
    }
    await db.guests.replace_one({"_id": doc["_id"]}, doc, upsert=True)
    # Simulated OTP: returned only because the platform runs in dev mode.
    return {"otp_required": True, "dev_otp": DEV_OTP, "message": "Verification code sent"}


@api.post("/auth/verify-otp")
async def verify_otp(body: OTPBody):
    user = await db.guests.find_one({"email": body.email.lower()})
    if not user or user.get("verified") or "otp_hash" not in user:
        raise HTTPException(400, "Invalid or expired code")
    if datetime.fromisoformat(user["otp_expires_at"]) < now() or not ph.verify(body.otp, user["otp_hash"]):
        raise HTTPException(400, "Invalid or expired code")
    await db.guests.update_one({"_id": user["_id"]}, {
        "$set": {"verified": True, "account_status": "active", "updated_at": iso(now())},
        "$unset": {"otp_hash": "", "otp_expires_at": ""},
    })
    await notify(user["_id"], "general", "Welcome to Sacred Spice", "Your account is ready. Earn 10 points on every dollar.")
    user = await db.guests.find_one({"_id": user["_id"]})
    return {**(await issue_pair(user["_id"])), "guest": guest_public(user)}


@api.post("/auth/login")
async def login(body: LoginBody):
    user = await db.guests.find_one({"email": body.email.lower()})
    if not user:
        ph.verify(body.password, ph.hash("dummy-password"))
        raise auth_error()
    if not ph.verify(body.password, user["password_hash"]):
        raise auth_error()
    if not user.get("verified"):
        raise HTTPException(403, "OTP verification required")
    return {**(await issue_pair(user["_id"])), "guest": guest_public(user)}


@api.post("/auth/refresh")
async def refresh(body: RefreshBody):
    try:
        claims = jwt.decode(body.refresh_token, JWT_REFRESH_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise auth_error()
    if claims.get("type") != "refresh":
        raise auth_error()
    old = await db.refresh_tokens.find_one({"_id": claims.get("jti"), "revoked": False})
    if not old or old["token_hash"] != digest(body.refresh_token) or datetime.fromisoformat(old["expires_at"]) < now():
        raise auth_error()
    await db.refresh_tokens.update_one({"_id": old["_id"]}, {"$set": {"revoked": True}})
    return await issue_pair(claims["sub"])


# ----------------------------------------------------------------------------- guest profile
class ProfilePatch(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    consents: Optional[Dict[str, bool]] = None


class AddressBody(BaseModel):
    label: str = "Home"
    line1: str
    line2: Optional[str] = None
    city: str
    state: str
    zip: str
    instructions: Optional[str] = None


@api.get("/guest/profile")
async def get_profile(user=Depends(current_user)):
    return guest_public(user)


@api.patch("/guest/profile")
async def patch_profile(body: ProfilePatch, user=Depends(current_user)):
    upd: Dict[str, Any] = {"updated_at": iso(now())}
    if body.name is not None:
        upd["name"] = body.name.strip()
    if body.mobile is not None:
        upd["mobile"] = body.mobile
    if body.preferences is not None:
        upd["preferences"] = {**user.get("preferences", {}), **body.preferences}
    if body.consents is not None:
        upd["consents"] = {**user.get("consents", {}), **body.consents}
    await db.guests.update_one({"_id": user["_id"]}, {"$set": upd})
    return guest_public(await db.guests.find_one({"_id": user["_id"]}))


@api.post("/guest/addresses")
async def add_address(body: AddressBody, user=Depends(current_user)):
    addr = {"id": new_id("adr"), **body.model_dump(), "status": "active"}
    await db.guests.update_one({"_id": user["_id"]}, {"$push": {"addresses": addr}})
    return addr


@api.delete("/guest/addresses/{address_id}")
async def delete_address(address_id: str, user=Depends(current_user)):
    await db.guests.update_one({"_id": user["_id"]}, {"$pull": {"addresses": {"id": address_id}}})
    return {"ok": True}


@api.post("/guest/account/deletion-request")
async def deletion_request(user=Depends(current_user)):
    await db.guests.update_one({"_id": user["_id"]}, {"$set": {"account_status": "deletion_requested", "deletion_requested_at": iso(now())}})
    return {"ok": True, "message": "Deletion request recorded. Statutory transaction records are retained."}


# ----------------------------------------------------------------------------- outlets
@api.get("/outlets")
async def list_outlets(lat: Optional[float] = None, lng: Optional[float] = None):
    outlets = [pub(o) for o in await db.outlets.find().to_list(100)]
    for o in outlets:
        o["is_open"] = outlet_open_now(o)
        if lat is not None and lng is not None:
            o["distance_miles"] = round(haversine_miles(lat, lng, o["lat"], o["lng"]), 1)
    if lat is not None:
        outlets.sort(key=lambda o: o["distance_miles"])
    return outlets


@api.get("/outlets/{outlet_id}")
async def get_outlet(outlet_id: str):
    o = await db.outlets.find_one({"_id": outlet_id})
    if not o:
        raise HTTPException(404, "Outlet not found")
    d = pub(o)
    d["is_open"] = outlet_open_now(o)
    return d


class ServiceabilityBody(BaseModel):
    outlet_id: str
    zip: str
    subtotal: float = 0


@api.post("/delivery/serviceability")
async def serviceability(body: ServiceabilityBody):
    o = await db.outlets.find_one({"_id": body.outlet_id})
    if not o:
        raise HTTPException(404, "Outlet not found")
    reasons = []
    if "delivery" not in o["services"]:
        reasons.append("This outlet does not offer delivery.")
    elif body.zip.strip() not in o["delivery_zips"]:
        reasons.append("Delivery is not available for this address.")
    if body.subtotal and body.subtotal < o["min_delivery_order"]:
        reasons.append(f"Minimum delivery order is ${o['min_delivery_order']:.2f}.")
    if not outlet_open_now(o):
        reasons.append("Outlet is currently closed for delivery.")
    return {"serviceable": not reasons, "reasons": reasons, "min_order": o["min_delivery_order"], "delivery_fee": o["delivery_fee"]}


# ----------------------------------------------------------------------------- menu
def item_view(i: dict, outlet_id: str) -> dict:
    d = pub(i)
    d["available"] = outlet_id not in i.get("unavailable_at", []) and i.get("active", True)
    d.pop("unavailable_at", None)
    return d


@api.get("/outlets/{outlet_id}/menu")
async def get_menu(outlet_id: str):
    if not await db.outlets.find_one({"_id": outlet_id}):
        raise HTTPException(404, "Outlet not found")
    cats = [pub(c) for c in await db.categories.find().sort("sort", 1).to_list(50)]
    items = [item_view(i, outlet_id) for i in await db.menu_items.find({"active": True}).to_list(500)]
    items.sort(key=lambda x: -x["popularity"])
    specials = [i for i in items if "chef_special" in i["tags"]]
    return {"outlet_id": outlet_id, "categories": cats, "items": items, "specials": specials}


@api.get("/menu/items/{item_id}")
async def get_item(item_id: str, outlet_id: str = Query(...)):
    i = await db.menu_items.find_one({"_id": item_id})
    if not i:
        raise HTTPException(404, "Item not found")
    view = item_view(i, outlet_id)
    pairs = await db.menu_items.find({"_id": {"$ne": item_id}, "category_id": {"$in": ["cat_breads", "cat_desserts"]}}).sort("popularity", -1).limit(4).to_list(4)
    view["recommendations"] = [item_view(p, outlet_id) for p in pairs if outlet_id not in p.get("unavailable_at", [])]
    return view


# ----------------------------------------------------------------------------- cart
class CartItemBody(BaseModel):
    outlet_id: str
    item_id: str
    quantity: int = Field(ge=1, le=20)
    modifiers: List[Dict[str, str]] = []  # [{group_id, option_id}]
    spice_level: Optional[int] = None
    instructions: Optional[str] = None


class CartItemPatch(BaseModel):
    quantity: int = Field(ge=0, le=20)


def price_cart_line(item: dict, body_mods: List[Dict[str, str]]) -> tuple[float, list]:
    unit = item["price"]
    chosen = []
    groups = {g["id"]: g for g in item.get("modifier_groups", [])}
    counts: Dict[str, int] = {}
    for m in body_mods:
        g = groups.get(m.get("group_id"))
        if not g:
            continue
        opt = next((o for o in g["options"] if o["id"] == m.get("option_id")), None)
        if not opt:
            continue
        counts[g["id"]] = counts.get(g["id"], 0) + 1
        unit += opt["price"]
        chosen.append({"group_id": g["id"], "group_name": g["name"], "option_id": opt["id"], "option_name": opt["name"], "price": opt["price"]})
    for g in groups.values():
        c = counts.get(g["id"], 0)
        if g["required"] and c < g["min"]:
            raise HTTPException(400, f"Please choose {g['name'].lower()}")
        if c > g["max"]:
            raise HTTPException(400, f"Too many selections for {g['name'].lower()}")
    return money(unit), chosen


async def get_cart_doc(guest_id: str) -> dict:
    cart = await db.carts.find_one({"_id": guest_id})
    if not cart:
        cart = {"_id": guest_id, "outlet_id": None, "items": [], "updated_at": iso(now())}
        await db.carts.insert_one(cart)
    return cart


def cart_view(cart: dict) -> dict:
    subtotal = money(sum(l["unit_price"] * l["quantity"] for l in cart["items"]))
    return {"outlet_id": cart["outlet_id"], "items": cart["items"], "subtotal": subtotal,
            "item_count": sum(l["quantity"] for l in cart["items"])}


@api.get("/cart")
async def get_cart(user=Depends(current_user)):
    return cart_view(await get_cart_doc(user["_id"]))


@api.post("/cart/items")
async def add_cart_item(body: CartItemBody, user=Depends(current_user)):
    item = await db.menu_items.find_one({"_id": body.item_id})
    if not item:
        raise HTTPException(404, "Item not found")
    if body.outlet_id in item.get("unavailable_at", []):
        raise HTTPException(409, "This item is currently unavailable")
    if body.spice_level is not None and body.spice_level != item["spice_grade"] and not item.get("allow_alt_spice", True):
        raise HTTPException(400, "The kitchen does not offer an alternate spice level for this dish")
    unit, chosen = price_cart_line(item, body.modifiers)
    cart = await get_cart_doc(user["_id"])
    if cart["outlet_id"] and cart["outlet_id"] != body.outlet_id:
        cart["items"] = []  # outlet changed → revalidate (BR-GR-06)
    line = {"id": new_id("cl"), "item_id": item["_id"], "name": item["name"], "image": item["image"],
            "quantity": body.quantity, "unit_price": unit, "base_price": item["price"], "modifiers": chosen,
            "spice_level": body.spice_level if body.spice_level is not None else item["spice_grade"],
            "instructions": body.instructions, "allergens": item["allergens"]}
    cart["items"].append(line)
    cart["outlet_id"] = body.outlet_id
    await db.carts.replace_one({"_id": user["_id"]}, {**cart, "updated_at": iso(now())})
    return cart_view(cart)


@api.patch("/cart/items/{line_id}")
async def patch_cart_item(line_id: str, body: CartItemPatch, user=Depends(current_user)):
    cart = await get_cart_doc(user["_id"])
    if body.quantity == 0:
        cart["items"] = [l for l in cart["items"] if l["id"] != line_id]
    else:
        for l in cart["items"]:
            if l["id"] == line_id:
                l["quantity"] = body.quantity
    if not cart["items"]:
        cart["outlet_id"] = None
    await db.carts.replace_one({"_id": user["_id"]}, {**cart, "updated_at": iso(now())})
    return cart_view(cart)


@api.delete("/cart")
async def clear_cart(user=Depends(current_user)):
    await db.carts.replace_one({"_id": user["_id"]}, {"_id": user["_id"], "outlet_id": None, "items": [], "updated_at": iso(now())}, upsert=True)
    return {"ok": True}


# ----------------------------------------------------------------------------- pricing / promotions
class QuoteBody(BaseModel):
    service_type: str  # pickup | delivery | dine_in
    address_id: Optional[str] = None
    promo_code: Optional[str] = None
    redeem_reward_id: Optional[str] = None
    scheduled_for: Optional[str] = None
    table_code: Optional[str] = None
    tip: float = 0


async def compute_quote(user: dict, cart: dict, body: QuoteBody, strict: bool) -> dict:
    if not cart["items"]:
        raise HTTPException(400, "Your cart is empty")
    outlet = await db.outlets.find_one({"_id": cart["outlet_id"]})
    if not outlet:
        raise HTTPException(404, "Outlet not found")
    errors: List[str] = []
    if body.service_type not in outlet["services"]:
        errors.append(f"{outlet['name']} does not offer {body.service_type.replace('_', '-')}.")
    subtotal = money(sum(l["unit_price"] * l["quantity"] for l in cart["items"]))

    # availability revalidation
    for l in cart["items"]:
        it = await db.menu_items.find_one({"_id": l["item_id"]})
        if not it or cart["outlet_id"] in it.get("unavailable_at", []):
            errors.append(f"{l['name']} is no longer available.")

    delivery_fee = 0.0
    address = None
    if body.service_type == "delivery":
        address = next((a for a in user.get("addresses", []) if a["id"] == body.address_id), None)
        if not address:
            errors.append("Please choose a delivery address.")
        elif address["zip"] not in outlet["delivery_zips"]:
            errors.append("Delivery is not available for this address.")
        if subtotal < outlet["min_delivery_order"]:
            errors.append(f"Minimum delivery order is ${outlet['min_delivery_order']:.2f}.")
        delivery_fee = 0.0 if subtotal >= outlet["free_delivery_over"] else outlet["delivery_fee"]
    if body.service_type == "dine_in" and not body.table_code:
        errors.append("Scan or enter your table code for dine-in ordering.")

    scheduled_at = None
    if body.scheduled_for:
        try:
            scheduled_at = datetime.fromisoformat(body.scheduled_for.replace("Z", "+00:00"))
        except ValueError:
            errors.append("Invalid scheduled time.")
        if scheduled_at and scheduled_at < now() + timedelta(minutes=30):
            errors.append("Scheduled orders need at least 30 minutes notice.")
        if scheduled_at and not outlet_open_now(outlet, scheduled_at):
            errors.append("The outlet is closed at the scheduled time.")
    elif not outlet_open_now(outlet):
        errors.append("The outlet is currently closed. Try scheduling for later.")

    packaging = outlet["packaging_fee"] if body.service_type in ("pickup", "delivery") else 0.0
    service_charge = money(subtotal * outlet["service_charge_rate_dine_in"]) if body.service_type == "dine_in" else 0.0

    # promotions
    discount = 0.0
    promo = None
    if body.promo_code:
        promo = await db.promotions.find_one({"code": body.promo_code.upper(), "active": True})
        if not promo:
            errors.append("Promo code not recognised.")
        else:
            prior = await db.orders.count_documents({"guest_id": user["_id"], "status": {"$nin": ["cancelled", "failed"]}})
            if body.service_type not in promo["channels"]:
                errors.append("This promotion does not apply to the selected service.")
            elif subtotal < promo["min_order"]:
                errors.append(f"{promo['code']} needs a minimum order of ${promo['min_order']:.2f}.")
            elif promo.get("first_order_only") and prior > 0:
                errors.append(f"{promo['code']} is valid on your first order only.")
            else:
                discount = money(subtotal * promo["value"] / 100) if promo["type"] == "percent" else float(promo["value"])

    # loyalty reward
    reward = None
    reward_value = 0.0
    if body.redeem_reward_id:
        reward = await db.rewards.find_one({"_id": body.redeem_reward_id})
        if not reward:
            errors.append("Reward not found.")
        elif user["loyalty"]["points"] < reward["points"]:
            errors.append("Not enough points for this reward.")
        else:
            reward_value = min(reward["value"], subtotal - discount)

    discounted = max(subtotal - discount - reward_value, 0)
    tax = money((discounted + packaging + service_charge) * outlet["tax_rate"])
    tip = money(max(body.tip, 0))
    total = money(discounted + packaging + delivery_fee + service_charge + tax + tip)

    base_min = {"normal": 20, "busy": 30, "paused": 45}.get(outlet.get("kitchen_load", "normal"), 20)
    if body.service_type == "delivery":
        base_min += 15
    if body.service_type == "dine_in":
        base_min = 18
    promise_at = (scheduled_at or now()) + timedelta(minutes=base_min)

    if strict and errors:
        raise HTTPException(400, errors[0])
    return {
        "outlet": pub(outlet), "service_type": body.service_type, "address": address, "table_code": body.table_code,
        "subtotal": subtotal, "discount": discount, "promo": pub(promo) if promo and discount else None,
        "reward": pub(reward) if reward and reward_value else None, "reward_value": reward_value,
        "packaging_fee": packaging, "delivery_fee": delivery_fee, "service_charge": service_charge,
        "tax": tax, "tip": tip, "total": total, "promise_minutes": base_min, "promise_at": iso(promise_at),
        "scheduled_for": iso(scheduled_at) if scheduled_at else None, "errors": errors, "valid": not errors,
        "kitchen_load": outlet.get("kitchen_load", "normal"),
    }


@api.post("/cart/quote")
async def quote(body: QuoteBody, user=Depends(current_user)):
    cart = await get_cart_doc(user["_id"])
    return await compute_quote(user, cart, body, strict=False)


@api.get("/promotions/eligible")
async def eligible_promotions(user=Depends(current_user)):
    prior = await db.orders.count_documents({"guest_id": user["_id"], "status": {"$nin": ["cancelled", "failed"]}})
    promos = [pub(p) for p in await db.promotions.find({"active": True}).to_list(50)]
    return [p for p in promos if not (p.get("first_order_only") and prior > 0)]


# ----------------------------------------------------------------------------- orders
class PlaceOrderBody(QuoteBody):
    order_instructions: Optional[str] = None
    allergy_instructions: Optional[str] = None
    payment_method: str = "card_simulated"
    idempotency_key: Optional[str] = None


# Time-based Phase-1 fulfilment simulation (minutes since acceptance).
STAGE_MINUTES = [("accepted", 0), ("preparing", 1.0), ("ready", 3.0), ("dispatched", 4.5), ("completed", 6.5)]
STAGE_LABEL = {
    "accepted": "Order accepted", "preparing": "Kitchen is preparing", "ready": "Ready",
    "dispatched": "Out for delivery", "awaiting_pickup": "Ready for pickup", "completed": "Completed",
    "cancelled": "Cancelled", "served": "Served to table",
}


def stage_for(order: dict, at: datetime) -> str:
    start = datetime.fromisoformat(order["accepted_at"])
    if order.get("scheduled_for"):
        start = max(start, datetime.fromisoformat(order["scheduled_for"]) - timedelta(minutes=order["promise_minutes"]))
    elapsed = (at - start).total_seconds() / 60
    stage = "accepted"
    for name, mins in STAGE_MINUTES:
        if elapsed >= mins:
            stage = name
    if stage == "dispatched":
        stage = {"pickup": "awaiting_pickup", "dine_in": "served"}.get(order["service_type"], "dispatched")
    return stage


ORDER_FLOW = {
    "delivery": ["accepted", "preparing", "ready", "dispatched", "completed"],
    "pickup": ["accepted", "preparing", "ready", "awaiting_pickup", "completed"],
    "dine_in": ["accepted", "preparing", "ready", "served", "completed"],
}


async def award_points(order: dict):
    if order.get("points_awarded"):
        return
    guest = await db.guests.find_one({"_id": order["guest_id"]})
    tier = tier_for(guest["loyalty"]["lifetime_points"])
    rate = {"Cardamom": 10, "Saffron": 12, "Royal": 15}[tier["name"]]
    pts = int(order["totals"]["subtotal"] * rate)
    await db.loyalty_txns.insert_one({"_id": new_id("ltx"), "guest_id": order["guest_id"], "type": "earn", "points": pts,
                                      "ref": {"order_id": order["_id"]}, "description": f"Order {order['number']}", "created_at": iso(now())})
    await db.guests.update_one({"_id": order["guest_id"]}, {"$inc": {"loyalty.points": pts, "loyalty.lifetime_points": pts}})
    await db.orders.update_one({"_id": order["_id"]}, {"$set": {"points_awarded": pts}})
    await notify(order["guest_id"], "receipt", f"Order {order['number']} complete", f"You earned {pts} points. Thank you for dining with us.", {"order_id": order["_id"]})
    await notify(order["guest_id"], "feedback", "How was everything?", "Take a moment to rate your order.", {"order_id": order["_id"], "action": "feedback"})


async def sync_order(order: dict) -> dict:
    """Advance the simulated fulfilment state and persist newly-crossed timeline steps."""
    if order["status"] in ("cancelled", "completed", "failed"):
        return order
    target = stage_for(order, now())
    flow = ORDER_FLOW[order["service_type"]]
    if flow.index(target) <= flow.index(order["status"]):
        return order
    timeline = order["timeline"]
    for s in flow[flow.index(order["status"]) + 1: flow.index(target) + 1]:
        timeline.append({"status": s, "label": STAGE_LABEL[s], "at": iso(now())})
        await notify(order["guest_id"], "order", f"Order {order['number']}: {STAGE_LABEL[s]}",
                     "Tap to view your live order.", {"order_id": order["_id"]})
    upd: Dict[str, Any] = {"status": target, "timeline": timeline}
    if order["service_type"] == "delivery" and target in ("dispatched", "completed") and not order.get("courier"):
        upd["courier"] = {"name": "Marcus D.", "phone": "+1 (917) 555-0133", "vehicle": "Bike", "partner": "MockDash"}
    await db.orders.update_one({"_id": order["_id"]}, {"$set": upd})
    order = {**order, **upd}
    if target == "completed":
        await award_points(order)
    return order


async def next_order_number() -> str:
    c = await db.orders.count_documents({})
    return f"SS-{1001 + c}"


@api.post("/orders")
async def place_order(body: PlaceOrderBody, user=Depends(current_user)):
    if body.idempotency_key:
        dup = await db.orders.find_one({"idempotency_key": body.idempotency_key, "guest_id": user["_id"]})
        if dup:
            return pub(dup)
    cart = await get_cart_doc(user["_id"])
    q = await compute_quote(user, cart, body, strict=True)
    outlet = q["outlet"]
    if outlet.get("kitchen_load") == "paused":
        raise HTTPException(409, "The kitchen has paused new orders. Please try again shortly.")

    # Simulated PSP authorisation
    payment = {"provider": "simulated", "method": body.payment_method, "status": "authorized",
               "amount": q["total"], "auth_ref": f"psp_{secrets.token_hex(6)}", "at": iso(now())}
    order_id = new_id("ord")
    number = await next_order_number()
    t = now()
    order = {
        "_id": order_id, "number": number, "guest_id": user["_id"], "outlet_id": outlet["id"], "outlet_name": outlet["name"],
        "service_type": q["service_type"], "items": cart["items"], "address": q["address"], "table_code": q["table_code"],
        "order_instructions": body.order_instructions, "allergy_instructions": body.allergy_instructions,
        "totals": {k: q[k] for k in ("subtotal", "discount", "reward_value", "packaging_fee", "delivery_fee", "service_charge", "tax", "tip", "total")},
        "promo_code": q["promo"]["code"] if q["promo"] else None, "reward_id": q["reward"]["id"] if q["reward"] else None,
        "payment": payment, "status": "accepted", "accepted_at": iso(t), "created_at": iso(t),
        "scheduled_for": q["scheduled_for"], "promise_minutes": q["promise_minutes"], "promise_at": q["promise_at"],
        "timeline": [{"status": "created", "label": "Order placed", "at": iso(t)},
                     {"status": "paid", "label": "Payment authorised", "at": iso(t)},
                     {"status": "accepted", "label": STAGE_LABEL["accepted"], "at": iso(t)}],
        "pos": {"status": "synced", "ref": f"POS-{secrets.token_hex(4).upper()}", "attempts": 1},
        "kds": {"status": "queued", "station": "hot_line"},
        "idempotency_key": body.idempotency_key, "points_awarded": None, "courier": None, "feedback_id": None,
    }
    await db.orders.insert_one(order)

    if q["reward"]:
        await db.loyalty_txns.insert_one({"_id": new_id("ltx"), "guest_id": user["_id"], "type": "redeem", "points": -q["reward"]["points"],
                                          "ref": {"order_id": order_id, "reward_id": q["reward"]["id"]}, "description": q["reward"]["name"], "created_at": iso(t)})
        await db.guests.update_one({"_id": user["_id"]}, {"$inc": {"loyalty.points": -q["reward"]["points"]}})
    await db.carts.replace_one({"_id": user["_id"]}, {"_id": user["_id"], "outlet_id": None, "items": [], "updated_at": iso(t)})
    await notify(user["_id"], "order", f"Order {number} accepted", f"{outlet['name']} has your order. Promise time ~{q['promise_minutes']} min.", {"order_id": order_id})
    logger.info("Order %s accepted → POS %s, KDS queued", number, order["pos"]["ref"])
    return pub(order)


@api.get("/orders")
async def list_orders(user=Depends(current_user)):
    docs = await db.orders.find({"guest_id": user["_id"]}).sort("created_at", -1).to_list(200)
    out = []
    for d in docs:
        out.append(pub(await sync_order(d)))
    return out


@api.get("/orders/{order_id}")
async def get_order(order_id: str, user=Depends(current_user)):
    d = await db.orders.find_one({"_id": order_id, "guest_id": user["_id"]})
    if not d:
        raise HTTPException(404, "Order not found")
    return pub(await sync_order(d))


class CancelBody(BaseModel):
    reason: Optional[str] = None


@api.post("/orders/{order_id}/cancel")
async def cancel_order(order_id: str, body: CancelBody, user=Depends(current_user)):
    d = await db.orders.find_one({"_id": order_id, "guest_id": user["_id"]})
    if not d:
        raise HTTPException(404, "Order not found")
    d = await sync_order(d)
    if d["status"] in ("cancelled", "completed"):
        raise HTTPException(409, "This order can no longer be cancelled")
    if d["status"] != "accepted":
        # SRS-OR-030: post kitchen acceptance requires staff approval
        await db.orders.update_one({"_id": order_id}, {"$set": {"cancellation_request": {"reason": body.reason, "status": "pending_staff", "at": iso(now())}}})
        return {"status": d["status"], "cancellation": "pending_staff_approval", "message": "The kitchen has started your order. A team member will review your request."}
    upd = {"status": "cancelled", "payment.status": "voided", "timeline": d["timeline"] + [{"status": "cancelled", "label": "Cancelled by guest", "at": iso(now())}]}
    await db.orders.update_one({"_id": order_id}, {"$set": upd})
    if d.get("reward_id"):
        rw = await db.rewards.find_one({"_id": d["reward_id"]})
        if rw:
            await db.guests.update_one({"_id": user["_id"]}, {"$inc": {"loyalty.points": rw["points"]}})
            await db.loyalty_txns.insert_one({"_id": new_id("ltx"), "guest_id": user["_id"], "type": "refund", "points": rw["points"],
                                              "ref": {"order_id": order_id}, "description": "Reward returned (order cancelled)", "created_at": iso(now())})
    await notify(user["_id"], "order", f"Order {d['number']} cancelled", "Your payment authorisation has been released.", {"order_id": order_id})
    return {"status": "cancelled", "cancellation": "confirmed"}


@api.post("/orders/{order_id}/reorder")
async def reorder(order_id: str, user=Depends(current_user)):
    d = await db.orders.find_one({"_id": order_id, "guest_id": user["_id"]})
    if not d:
        raise HTTPException(404, "Order not found")
    lines = []
    for l in d["items"]:
        it = await db.menu_items.find_one({"_id": l["item_id"]})
        if it and d["outlet_id"] not in it.get("unavailable_at", []):
            lines.append({**l, "id": new_id("cl")})
    await db.carts.replace_one({"_id": user["_id"]}, {"_id": user["_id"], "outlet_id": d["outlet_id"], "items": lines, "updated_at": iso(now())}, upsert=True)
    return {"added": len(lines), "skipped": len(d["items"]) - len(lines), "outlet_id": d["outlet_id"]}


# ----------------------------------------------------------------------------- reservations & waitlist
class ReservationBody(BaseModel):
    outlet_id: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    party_size: int = Field(ge=1, le=20)
    occasion: Optional[str] = None
    seating_preference: Optional[str] = None
    special_requests: Optional[str] = None


class ReservationPatch(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    party_size: Optional[int] = Field(default=None, ge=1, le=20)
    occasion: Optional[str] = None
    seating_preference: Optional[str] = None
    special_requests: Optional[str] = None


def duration_for(party: int) -> int:
    return 90 if party <= 2 else 120 if party <= 6 else 150


@api.get("/outlets/{outlet_id}/reservations/availability")
async def reservation_availability(outlet_id: str, date: str, party_size: int = 2):
    o = await db.outlets.find_one({"_id": outlet_id})
    if not o:
        raise HTTPException(404, "Outlet not found")
    if "reservation" not in o["services"]:
        return {"slots": [], "message": "This outlet does not take reservations."}
    try:
        day = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(400, "Invalid date")
    hours = o["hours"][["mon", "tue", "wed", "thu", "fri", "sat", "sun"][day.weekday()]]
    booked = await db.reservations.find({"outlet_id": outlet_id, "date": date, "status": {"$in": ["confirmed", "pending_confirmation"]}}).to_list(500)
    load: Dict[str, int] = {}
    for b in booked:
        load[b["time"]] = load.get(b["time"], 0) + 1
    slots = []
    t = datetime.strptime(hours["open"], "%H:%M")
    end = datetime.strptime(hours["close"], "%H:%M") - timedelta(minutes=duration_for(party_size))
    today_local = (now() - timedelta(hours=4)).strftime("%Y-%m-%d")
    now_local = (now() - timedelta(hours=4)).strftime("%H:%M")
    while t <= end:
        hhmm = t.strftime("%H:%M")
        cap = o["capacity_per_slot"] - (2 if party_size > 6 else 0)
        used = load.get(hhmm, 0)
        past = date == today_local and hhmm <= now_local
        high_demand = hhmm in ("19:00", "19:30", "20:00")
        slots.append({"time": hhmm, "available": used < cap and not past, "high_demand": high_demand,
                      "duration_minutes": duration_for(party_size)})
        t += timedelta(minutes=o["slot_interval_min"])
    return {"slots": slots, "date": date, "party_size": party_size, "deposit_required": party_size >= 8}


@api.post("/reservations")
async def create_reservation(body: ReservationBody, user=Depends(current_user)):
    avail = await reservation_availability(body.outlet_id, body.date, body.party_size)
    slot = next((s for s in avail["slots"] if s["time"] == body.time), None)
    if not slot or not slot["available"]:
        raise HTTPException(409, "That slot is no longer available. Please choose another time.")
    o = await db.outlets.find_one({"_id": body.outlet_id})
    t = now()
    res = {
        "_id": new_id("rsv"), "guest_id": user["_id"], "outlet_id": body.outlet_id, "outlet_name": o["name"],
        "date": body.date, "time": body.time, "party_size": body.party_size, "duration_minutes": slot["duration_minutes"],
        "occasion": body.occasion, "seating_preference": body.seating_preference, "special_requests": body.special_requests,
        "status": "pending_confirmation" if slot["high_demand"] else "confirmed", "high_demand": slot["high_demand"],
        "deposit": {"required": avail["deposit_required"], "amount": 25.0 * body.party_size if avail["deposit_required"] else 0, "status": "held_simulated" if avail["deposit_required"] else "none"},
        "cancellation_cutoff_hours": 2, "created_at": iso(t), "updated_at": iso(t), "checked_in_at": None,
    }
    await db.reservations.insert_one(res)
    if res["status"] == "confirmed":
        await notify(user["_id"], "reservation", "Reservation confirmed", f"{o['name']} · {body.date} at {body.time} · party of {body.party_size}", {"reservation_id": res["_id"]})
    else:
        await notify(user["_id"], "reservation", "One tap to confirm", "High-demand slot held for 10 minutes. Confirm to keep it.", {"reservation_id": res["_id"]})
    return pub(res)


@api.get("/reservations")
async def list_reservations(user=Depends(current_user)):
    return [pub(r) for r in await db.reservations.find({"guest_id": user["_id"]}).sort([("date", -1), ("time", -1)]).to_list(200)]


@api.get("/reservations/{reservation_id}")
async def get_reservation(reservation_id: str, user=Depends(current_user)):
    r = await db.reservations.find_one({"_id": reservation_id, "guest_id": user["_id"]})
    if not r:
        raise HTTPException(404, "Reservation not found")
    return pub(r)


@api.post("/reservations/{reservation_id}/confirm")
async def confirm_reservation(reservation_id: str, user=Depends(current_user)):
    r = await db.reservations.find_one({"_id": reservation_id, "guest_id": user["_id"]})
    if not r or r["status"] != "pending_confirmation":
        raise HTTPException(409, "Nothing to confirm")
    await db.reservations.update_one({"_id": reservation_id}, {"$set": {"status": "confirmed", "updated_at": iso(now())}})
    await notify(user["_id"], "reservation", "Reservation confirmed", f"{r['outlet_name']} · {r['date']} at {r['time']}", {"reservation_id": reservation_id})
    return pub(await db.reservations.find_one({"_id": reservation_id}))


@api.patch("/reservations/{reservation_id}")
async def modify_reservation(reservation_id: str, body: ReservationPatch, user=Depends(current_user)):
    r = await db.reservations.find_one({"_id": reservation_id, "guest_id": user["_id"]})
    if not r or r["status"] not in ("confirmed", "pending_confirmation"):
        raise HTTPException(409, "This reservation cannot be modified")
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    if any(k in upd for k in ("date", "time", "party_size")):
        avail = await reservation_availability(r["outlet_id"], upd.get("date", r["date"]), upd.get("party_size", r["party_size"]))
        slot = next((s for s in avail["slots"] if s["time"] == upd.get("time", r["time"])), None)
        if not slot or (not slot["available"] and (upd.get("time", r["time"]) != r["time"] or upd.get("date", r["date"]) != r["date"])):
            raise HTTPException(409, "That slot is not available")
    upd["updated_at"] = iso(now())
    await db.reservations.update_one({"_id": reservation_id}, {"$set": upd})
    await notify(user["_id"], "reservation", "Reservation updated", "Your changes are confirmed.", {"reservation_id": reservation_id})
    return pub(await db.reservations.find_one({"_id": reservation_id}))


@api.post("/reservations/{reservation_id}/cancel")
async def cancel_reservation(reservation_id: str, user=Depends(current_user)):
    r = await db.reservations.find_one({"_id": reservation_id, "guest_id": user["_id"]})
    if not r or r["status"] not in ("confirmed", "pending_confirmation"):
        raise HTTPException(409, "This reservation cannot be cancelled")
    start = datetime.strptime(f"{r['date']} {r['time']}", "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc) + timedelta(hours=4)
    late = start - now() < timedelta(hours=r["cancellation_cutoff_hours"])
    deposit_status = "forfeited_simulated" if late and r["deposit"]["required"] else ("released_simulated" if r["deposit"]["required"] else "none")
    await db.reservations.update_one({"_id": reservation_id}, {"$set": {"status": "cancelled", "late_cancellation": late, "deposit.status": deposit_status, "updated_at": iso(now())}})
    # Released capacity → allocate to waitlist (SRS-RS-020)
    await db.waitlist.update_one({"outlet_id": r["outlet_id"], "status": "waiting"}, {"$set": {"status": "table_ready", "updated_at": iso(now())}})
    await notify(user["_id"], "reservation", "Reservation cancelled", f"{r['outlet_name']} · {r['date']} at {r['time']}", {"reservation_id": reservation_id})
    return pub(await db.reservations.find_one({"_id": reservation_id}))


@api.post("/reservations/{reservation_id}/check-in")
async def check_in(reservation_id: str, user=Depends(current_user)):
    r = await db.reservations.find_one({"_id": reservation_id, "guest_id": user["_id"]})
    if not r or r["status"] != "confirmed":
        raise HTTPException(409, "Cannot check in")
    await db.reservations.update_one({"_id": reservation_id}, {"$set": {"status": "checked_in", "checked_in_at": iso(now())}})
    return pub(await db.reservations.find_one({"_id": reservation_id}))


class WaitlistBody(BaseModel):
    outlet_id: str
    party_size: int = Field(ge=1, le=12)
    seating_preference: Optional[str] = None


@api.post("/waitlist")
async def join_waitlist(body: WaitlistBody, user=Depends(current_user)):
    o = await db.outlets.find_one({"_id": body.outlet_id})
    if not o:
        raise HTTPException(404, "Outlet not found")
    existing = await db.waitlist.find_one({"guest_id": user["_id"], "status": {"$in": ["waiting", "table_ready"]}})
    if existing:
        return await waitlist_view(existing)
    ahead = await db.waitlist.count_documents({"outlet_id": body.outlet_id, "status": "waiting"})
    w = {"_id": new_id("wl"), "guest_id": user["_id"], "outlet_id": body.outlet_id, "outlet_name": o["name"],
         "party_size": body.party_size, "seating_preference": body.seating_preference, "status": "waiting",
         "joined_at": iso(now()), "updated_at": iso(now()), "initial_ahead": ahead}
    await db.waitlist.insert_one(w)
    await notify(user["_id"], "waitlist", "You're on the list", f"{o['name']} · party of {body.party_size}. We'll notify you when your table is ready.", {"waitlist_id": w["_id"]})
    return await waitlist_view(w)


async def waitlist_view(w: dict) -> dict:
    # Phase-1 simulation: one party seated every ~90s
    elapsed = (now() - datetime.fromisoformat(w["joined_at"])).total_seconds()
    ahead = max(w.get("initial_ahead", 0) - int(elapsed // 90), 0)
    if w["status"] == "waiting" and elapsed > 90 * (w.get("initial_ahead", 0) + 1):
        w["status"] = "table_ready"
        await db.waitlist.update_one({"_id": w["_id"]}, {"$set": {"status": "table_ready", "updated_at": iso(now())}})
        await notify(w["guest_id"], "waitlist", "Your table is ready", f"Please make your way to the host at {w['outlet_name']}.", {"waitlist_id": w["_id"]})
    d = pub(w)
    d["position"] = ahead + 1 if w["status"] == "waiting" else 0
    d["estimated_wait_minutes"] = (ahead + 1) * 8 if w["status"] == "waiting" else 0
    return d


@api.get("/waitlist/current")
async def current_waitlist(user=Depends(current_user)):
    w = await db.waitlist.find_one({"guest_id": user["_id"], "status": {"$in": ["waiting", "table_ready"]}})
    return await waitlist_view(w) if w else None


@api.post("/waitlist/{waitlist_id}/accept")
async def accept_waitlist(waitlist_id: str, user=Depends(current_user)):
    w = await db.waitlist.find_one({"_id": waitlist_id, "guest_id": user["_id"]})
    if not w or w["status"] != "table_ready":
        raise HTTPException(409, "Table is not ready yet")
    await db.waitlist.update_one({"_id": waitlist_id}, {"$set": {"status": "seated", "updated_at": iso(now())}})
    return {"status": "seated"}


@api.post("/waitlist/{waitlist_id}/leave")
async def leave_waitlist(waitlist_id: str, user=Depends(current_user)):
    await db.waitlist.update_one({"_id": waitlist_id, "guest_id": user["_id"]}, {"$set": {"status": "left", "updated_at": iso(now())}})
    return {"status": "left"}


# ----------------------------------------------------------------------------- loyalty
def tier_for(lifetime: int) -> dict:
    t = TIERS[0]
    for tier in TIERS:
        if lifetime >= tier["min_points"]:
            t = tier
    return t


@api.get("/loyalty")
async def get_loyalty(user=Depends(current_user)):
    u = await db.guests.find_one({"_id": user["_id"]})
    tier = tier_for(u["loyalty"]["lifetime_points"])
    nxt = next((t for t in TIERS if t["min_points"] > u["loyalty"]["lifetime_points"]), None)
    txns = [pub(t) for t in await db.loyalty_txns.find({"guest_id": user["_id"]}).sort("created_at", -1).limit(50).to_list(50)]
    rewards = [pub(r) for r in await db.rewards.find().sort("points", 1).to_list(50)]
    for r in rewards:
        r["redeemable"] = u["loyalty"]["points"] >= r["points"]
    return {"points": u["loyalty"]["points"], "lifetime_points": u["loyalty"]["lifetime_points"], "tier": tier,
            "next_tier": nxt, "points_to_next": (nxt["min_points"] - u["loyalty"]["lifetime_points"]) if nxt else 0,
            "tiers": TIERS, "rewards": rewards, "transactions": txns, "earn_rate": {"Cardamom": 10, "Saffron": 12, "Royal": 15}[tier["name"]]}


# ----------------------------------------------------------------------------- notifications
@api.get("/notifications")
async def list_notifications(user=Depends(current_user)):
    docs = await db.notifications.find({"guest_id": user["_id"]}).sort("created_at", -1).limit(100).to_list(100)
    return {"items": [pub(d) for d in docs], "unread": sum(1 for d in docs if not d["read"])}


@api.post("/notifications/read-all")
async def read_all(user=Depends(current_user)):
    await db.notifications.update_many({"guest_id": user["_id"], "read": False}, {"$set": {"read": True}})
    return {"ok": True}


@api.patch("/notifications/{notification_id}/read")
async def read_one(notification_id: str, user=Depends(current_user)):
    await db.notifications.update_one({"_id": notification_id, "guest_id": user["_id"]}, {"$set": {"read": True}})
    return {"ok": True}


# ----------------------------------------------------------------------------- feedback & service recovery
class FeedbackBody(BaseModel):
    order_id: str
    rating: int = Field(ge=1, le=5)
    item_ratings: Dict[str, int] = {}
    comment: Optional[str] = None
    tags: List[str] = []


@api.post("/feedback")
async def submit_feedback(body: FeedbackBody, user=Depends(current_user)):
    order = await db.orders.find_one({"_id": body.order_id, "guest_id": user["_id"]})
    if not order:
        raise HTTPException(404, "Order not found")
    if order.get("feedback_id"):
        raise HTTPException(409, "Feedback already submitted for this order")
    fb = {"_id": new_id("fb"), "guest_id": user["_id"], "order_id": body.order_id, "outlet_id": order["outlet_id"],
          "rating": body.rating, "item_ratings": body.item_ratings, "comment": body.comment, "tags": body.tags,
          "created_at": iso(now()), "service_recovery_case_id": None}
    if body.rating <= 3:
        case = {"_id": new_id("src"), "feedback_id": fb["_id"], "guest_id": user["_id"], "outlet_id": order["outlet_id"],
                "order_id": body.order_id, "status": "open", "assigned_to": "outlet_manager", "sla_hours": 24,
                "created_at": iso(now()), "responses": []}
        await db.service_recovery.insert_one(case)
        fb["service_recovery_case_id"] = case["_id"]
        await notify(user["_id"], "feedback", "We're sorry", "A manager has been assigned and will respond within 24 hours.", {"order_id": body.order_id})
    await db.feedback.insert_one(fb)
    await db.orders.update_one({"_id": body.order_id}, {"$set": {"feedback_id": fb["_id"]}})
    return {**pub(fb), "invite_public_review": body.rating >= 4}


@api.get("/feedback/{order_id}")
async def get_feedback(order_id: str, user=Depends(current_user)):
    fb = await db.feedback.find_one({"order_id": order_id, "guest_id": user["_id"]})
    return pub(fb) if fb else None


# ----------------------------------------------------------------------------- misc
@api.get("/")
async def root():
    return {"service": "Sacred Spice Platform API", "status": "ok"}


@api.get("/health")
async def health():
    await db.command("ping")
    return {"ok": True}


app.include_router(api)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
async def startup():
    await db.guests.create_index("email", unique=True)
    await db.orders.create_index([("guest_id", 1), ("created_at", -1)])
    await db.notifications.create_index([("guest_id", 1), ("created_at", -1)])
    await db.reservations.create_index([("outlet_id", 1), ("date", 1)])
    await seed(db)
    logger.info("Sacred Spice API ready")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
