import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://spice-guest-app.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def guest_tokens(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": "priya@example.com", "password": "Password123!"})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    return data


@pytest.fixture(scope="session")
def auth_headers(guest_tokens):
    return {"Authorization": f"Bearer {guest_tokens['access_token']}", "Content-Type": "application/json"}


@pytest.fixture()
def fresh_email():
    return f"test_{uuid.uuid4().hex[:8]}@example.com"
