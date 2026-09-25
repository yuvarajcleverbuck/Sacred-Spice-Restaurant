"""Seed data for Sacred Spice — outlets, menu, rewards, promotions. Idempotent."""
from datetime import datetime, timezone

IMG = {
    "curry": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    "thali": "https://images.pexels.com/photos/17223836/pexels-photo-17223836.jpeg?auto=compress&cs=tinysrgb&w=800",
    "biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
    "naan": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
    "samosa": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800&q=80",
    "paneer": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
    "dal": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    "dessert": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    "chai": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80",
    "tandoor": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80",
    "dosa": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80",
    "hero1": "https://images.pexels.com/photos/29962487/pexels-photo-29962487.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "hero2": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    "hero3": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80",
}

HOURS = {d: {"open": "11:00", "close": "22:30"} for d in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]}
# Phase-1 demo: flagship outlets run an all-day kitchen so ordering can be exercised at any hour.
ALL_DAY = {d: {"open": "00:00", "close": "23:59"} for d in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]}

OUTLETS = [
    {
        "_id": "outlet_manhattan",
        "name": "Sacred Spice Manhattan",
        "tagline": "Flagship · Upper West Side",
        "address": "412 Columbus Ave, New York, NY 10024",
        "city": "New York",
        "phone": "+1 (212) 555-0148",
        "lat": 40.7831, "lng": -73.9773,
        "image": IMG["hero1"],
        "services": ["pickup", "delivery", "dine_in", "reservation"],
        "hours": ALL_DAY,
        "delivery_zips": ["10023", "10024", "10025", "10069", "10026"],
        "min_delivery_order": 20.0,
        "delivery_fee": 4.99,
        "free_delivery_over": 60.0,
        "packaging_fee": 1.50,
        "tax_rate": 0.08875,
        "service_charge_rate_dine_in": 0.10,
        "slot_interval_min": 30,
        "capacity_per_slot": 8,
        "status": "open",
        "kitchen_load": "normal",
    },
    {
        "_id": "outlet_brooklyn",
        "name": "Sacred Spice Brooklyn",
        "tagline": "Williamsburg waterfront",
        "address": "88 Kent Ave, Brooklyn, NY 11249",
        "city": "Brooklyn",
        "phone": "+1 (718) 555-0192",
        "lat": 40.7215, "lng": -73.9615,
        "image": IMG["hero2"],
        "services": ["pickup", "delivery", "reservation"],
        "hours": ALL_DAY,
        "delivery_zips": ["11249", "11211", "11206", "11222"],
        "min_delivery_order": 25.0,
        "delivery_fee": 3.99,
        "free_delivery_over": 50.0,
        "packaging_fee": 1.25,
        "tax_rate": 0.08875,
        "service_charge_rate_dine_in": 0.10,
        "slot_interval_min": 30,
        "capacity_per_slot": 6,
        "status": "open",
        "kitchen_load": "busy",
    },
    {
        "_id": "outlet_jersey",
        "name": "Sacred Spice Jersey City",
        "tagline": "Newport · Pickup & dine-in",
        "address": "30 Mall Dr W, Jersey City, NJ 07310",
        "city": "Jersey City",
        "phone": "+1 (201) 555-0117",
        "lat": 40.7282, "lng": -74.0342,
        "image": IMG["hero3"],
        "services": ["pickup", "dine_in", "reservation"],
        "hours": HOURS,
        "delivery_zips": [],
        "min_delivery_order": 0.0,
        "delivery_fee": 0.0,
        "free_delivery_over": 0.0,
        "packaging_fee": 1.00,
        "tax_rate": 0.06625,
        "service_charge_rate_dine_in": 0.10,
        "slot_interval_min": 30,
        "capacity_per_slot": 5,
        "status": "open",
        "kitchen_load": "normal",
    },
]

CATEGORIES = [
    {"_id": "cat_specials", "name": "Chef's Specials", "sort": 0},
    {"_id": "cat_starters", "name": "Starters", "sort": 1},
    {"_id": "cat_tandoor", "name": "Tandoor", "sort": 2},
    {"_id": "cat_mains", "name": "Mains", "sort": 3},
    {"_id": "cat_thali", "name": "Thalis & Combos", "sort": 4},
    {"_id": "cat_breads", "name": "Breads & Rice", "sort": 5},
    {"_id": "cat_desserts", "name": "Desserts & Drinks", "sort": 6},
]

MOD_BREAD = {
    "id": "mod_bread", "name": "Choice of bread", "required": True, "min": 1, "max": 1,
    "options": [
        {"id": "naan", "name": "Butter Naan", "price": 0},
        {"id": "garlic_naan", "name": "Garlic Naan", "price": 1.0},
        {"id": "roti", "name": "Tandoori Roti", "price": 0},
        {"id": "none", "name": "No bread", "price": -1.5},
    ],
}
MOD_RICE = {
    "id": "mod_rice", "name": "Rice", "required": False, "min": 0, "max": 1,
    "options": [
        {"id": "basmati", "name": "Steamed Basmati", "price": 0},
        {"id": "jeera", "name": "Jeera Rice", "price": 1.5},
        {"id": "saffron", "name": "Saffron Pulao", "price": 2.5},
    ],
}
MOD_PORTION = {
    "id": "mod_portion", "name": "Portion", "required": True, "min": 1, "max": 1,
    "options": [
        {"id": "regular", "name": "Regular", "price": 0},
        {"id": "large", "name": "Large (serves 2)", "price": 7.0},
    ],
}
MOD_SIDES = {
    "id": "mod_sides", "name": "Accompaniments", "required": False, "min": 0, "max": 3,
    "options": [
        {"id": "raita", "name": "Cucumber Raita", "price": 2.0},
        {"id": "pickle", "name": "House Pickle", "price": 1.0},
        {"id": "papad", "name": "Roasted Papad", "price": 1.5},
    ],
}


def item(_id, name, cat, price, desc, img, spice, origin, portion, diet, allergens,
         mods=None, popularity=50, course="main", alt_spice=True, kind="item", tags=None, includes=None):
    return {
        "_id": _id, "name": name, "category_id": cat, "price": price, "description": desc,
        "image": img, "spice_grade": spice, "allow_alt_spice": alt_spice, "regional_origin": origin,
        "portion_size": portion, "dietary_tags": diet, "allergens": allergens,
        "modifier_groups": mods or [], "popularity": popularity, "course": course,
        "kind": kind, "tags": tags or [], "includes": includes or [],
        "unavailable_at": [], "active": True,
    }


ITEMS = [
    item("it_lamb_rogan", "Kashmiri Lamb Rogan Josh", "cat_specials", 26.0,
         "Slow-braised lamb shoulder in a Kashmiri chilli and fennel gravy, finished with saffron yoghurt.",
         IMG["curry"], 3, "Kashmir", "350g", ["halal"], ["dairy"], [MOD_BREAD, MOD_RICE], 92, "main",
         tags=["chef_special"]),
    item("it_tasting", "Monsoon Tasting Menu", "cat_specials", 68.0,
         "Seven courses across the subcontinent — chef's seasonal progression, changes weekly.",
         IMG["thali"], 2, "Pan-India", "7 courses", ["gluten_free"], ["dairy", "nuts"], [], 70, "tasting",
         alt_spice=False, kind="tasting", tags=["chef_special", "seasonal"],
         includes=["Amuse-bouche", "Chaat course", "Coastal fish", "Tandoor course", "Dal & bread", "Rice course", "Dessert duo"]),
    item("it_samosa", "Punjabi Samosa Chaat", "cat_starters", 11.0,
         "Crisp samosas broken over chickpea curry, tamarind, mint and pomegranate.",
         IMG["samosa"], 2, "Punjab", "2 pcs", ["vegetarian", "vegan"], ["gluten"], [], 88, "starter"),
    item("it_paneer_tikka", "Tandoori Paneer Tikka", "cat_starters", 14.0,
         "Char-grilled paneer with capsicum in a smoked ajwain marinade.",
         IMG["paneer"], 2, "Punjab", "6 pcs", ["vegetarian", "gluten_free"], ["dairy"], [], 81, "starter"),
    item("it_dosa", "Mysore Masala Dosa", "cat_starters", 13.0,
         "Crisp fermented crepe with red chutney, potato masala, sambar and coconut chutney.",
         IMG["dosa"], 2, "Karnataka", "1 dosa", ["vegetarian", "vegan", "gluten_free", "nut_free"], [], [], 76, "starter"),
    item("it_chicken_tikka", "Chicken Tikka", "cat_tandoor", 17.0,
         "Yoghurt-and-kashmiri-chilli marinated thigh, tandoor-roasted, with mint chutney.",
         IMG["tandoor"], 2, "Punjab", "8 pcs", ["halal", "gluten_free"], ["dairy"], [MOD_SIDES], 90, "starter"),
    item("it_seekh", "Lamb Seekh Kebab", "cat_tandoor", 18.0,
         "Hand-minced lamb with green chilli, ginger and coriander, char-grilled on skewers.",
         IMG["tandoor"], 3, "Awadh", "4 skewers", ["halal", "dairy_free", "gluten_free"], [], [MOD_SIDES], 72, "starter"),
    item("it_butter_chicken", "Old Delhi Butter Chicken", "cat_mains", 22.0,
         "Tandoori chicken in a velvet tomato-butter gravy with kasuri methi.",
         IMG["curry"], 1, "Delhi", "320g", ["halal", "gluten_free"], ["dairy"], [MOD_BREAD, MOD_RICE], 98, "main"),
    item("it_dal_makhani", "Dal Makhani", "cat_mains", 16.0,
         "Black lentils simmered overnight with butter and cream.",
         IMG["dal"], 1, "Punjab", "300g", ["vegetarian", "gluten_free"], ["dairy"], [MOD_BREAD, MOD_RICE], 85, "main"),
    item("it_chana", "Chana Masala", "cat_mains", 15.0,
         "Chickpeas in a tangy onion-tomato masala with amchur and ginger.",
         IMG["dal"], 3, "Punjab", "300g", ["vegetarian", "vegan", "jain", "gluten_free", "nut_free", "dairy_free"], [],
         [MOD_BREAD, MOD_RICE], 66, "main"),
    item("it_goan_fish", "Goan Fish Curry", "cat_mains", 24.0,
         "Day-boat fish in coconut, kokum and toasted coriander seed curry.",
         IMG["curry"], 3, "Goa", "300g", ["gluten_free", "dairy_free"], ["fish"], [MOD_RICE], 74, "main"),
    item("it_biryani", "Hyderabadi Dum Biryani", "cat_mains", 23.0,
         "Slow-sealed saffron rice layered with marinated chicken, mint and fried onion.",
         IMG["biryani"], 3, "Hyderabad", "450g", ["halal"], ["dairy", "nuts"], [MOD_PORTION, MOD_SIDES], 94, "main"),
    item("it_veg_thali", "Royal Vegetarian Thali", "cat_thali", 28.0,
         "Dal makhani, paneer, seasonal sabzi, raita, rice, two breads, papad and gulab jamun.",
         IMG["thali"], 2, "Pan-India", "Full thali", ["vegetarian"], ["dairy", "gluten", "nuts"], [], 80, "main",
         kind="thali", includes=["Dal Makhani", "Paneer Butter Masala", "Seasonal Sabzi", "Raita", "Basmati", "Naan & Roti", "Papad", "Gulab Jamun"]),
    item("it_lunch_combo", "Weekday Lunch Combo", "cat_thali", 18.0,
         "One curry, rice, one bread and a soft drink. Weekdays 11:00–15:00.",
         IMG["curry"], 2, "Pan-India", "Combo", ["halal"], ["dairy", "gluten"], [MOD_BREAD], 60, "main",
         kind="combo", tags=["time_bound"], includes=["Curry of the day", "Basmati", "Bread", "Soft drink"]),
    item("it_garlic_naan", "Garlic Naan", "cat_breads", 4.5,
         "Tandoor-blistered naan with garlic butter and coriander.",
         IMG["naan"], 0, "Punjab", "1 pc", ["vegetarian"], ["gluten", "dairy"], [], 89, "side"),
    item("it_roti", "Tandoori Roti", "cat_breads", 3.5,
         "Whole-wheat roti from the tandoor.",
         IMG["naan"], 0, "Punjab", "1 pc", ["vegetarian", "vegan", "dairy_free"], ["gluten"], [], 60, "side"),
    item("it_pulao", "Saffron Pulao", "cat_breads", 7.0,
         "Aged basmati with saffron, whole spices and crisp shallots.",
         IMG["biryani"], 0, "Awadh", "250g", ["vegetarian", "vegan", "gluten_free"], [], [], 55, "side"),
    item("it_gulab", "Gulab Jamun", "cat_desserts", 8.0,
         "Warm milk dumplings in rose-cardamom syrup with pistachio.",
         IMG["dessert"], 0, "North India", "3 pcs", ["vegetarian"], ["dairy", "gluten", "nuts"], [], 77, "dessert", alt_spice=False),
    item("it_kulfi", "Mango Kulfi", "cat_desserts", 7.5,
         "Alphonso mango kulfi on a stick.",
         IMG["dessert"], 0, "Delhi", "1 pc", ["vegetarian", "gluten_free"], ["dairy"], [], 69, "dessert", alt_spice=False),
    item("it_chai", "Masala Chai", "cat_desserts", 4.0,
         "Assam tea simmered with ginger, cardamom and milk.",
         IMG["chai"], 0, "Assam", "250ml", ["vegetarian"], ["dairy"], [], 83, "drink", alt_spice=False),
]

REWARDS = [
    {"_id": "rw_chai", "name": "Complimentary Masala Chai", "points": 300, "value": 4.0, "description": "A warm cup on us."},
    {"_id": "rw_5off", "name": "$5 off your order", "points": 500, "value": 5.0, "description": "Applied at checkout."},
    {"_id": "rw_dessert", "name": "Free dessert", "points": 750, "value": 8.0, "description": "Any dessert, any visit."},
    {"_id": "rw_15off", "name": "$15 off your order", "points": 1400, "value": 15.0, "description": "Minimum spend $40."},
]

TIERS = [
    {"name": "Cardamom", "min_points": 0, "perks": ["Earn 10 pts per $1"]},
    {"name": "Saffron", "min_points": 2000, "perks": ["Earn 12 pts per $1", "Priority waitlist"]},
    {"name": "Royal", "min_points": 6000, "perks": ["Earn 15 pts per $1", "Birthday tasting for two", "Priority reservations"]},
]

PROMOTIONS = [
    {"_id": "promo_welcome", "code": "WELCOME10", "type": "percent", "value": 10, "min_order": 20,
     "description": "10% off your first order", "channels": ["pickup", "delivery", "dine_in"], "active": True, "first_order_only": True},
    {"_id": "promo_pickup5", "code": "PICKUP5", "type": "fixed", "value": 5, "min_order": 30,
     "description": "$5 off pickup orders over $30", "channels": ["pickup"], "active": True, "first_order_only": False},
]


async def seed(db):
    for o in OUTLETS:
        await db.outlets.update_one({"_id": o["_id"]}, {"$setOnInsert": o}, upsert=True)
    for c in CATEGORIES:
        await db.categories.update_one({"_id": c["_id"]}, {"$setOnInsert": c}, upsert=True)
    for i in ITEMS:
        await db.menu_items.update_one({"_id": i["_id"]}, {"$setOnInsert": i}, upsert=True)
    for r in REWARDS:
        await db.rewards.update_one({"_id": r["_id"]}, {"$setOnInsert": r}, upsert=True)
    for p in PROMOTIONS:
        await db.promotions.update_one({"_id": p["_id"]}, {"$setOnInsert": p}, upsert=True)
    await db.meta.update_one({"_id": "seed"}, {"$set": {"seeded_at": datetime.now(timezone.utc).isoformat()}}, upsert=True)
