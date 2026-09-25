import { storage } from "@/src/utils/storage";

const BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;
const ACCESS_KEY = "ss.auth.access";
const REFRESH_KEY = "ss.auth.refresh";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export async function loadTokens() {
  accessToken = await storage.secureGet<string | null>(ACCESS_KEY, null);
  refreshToken = await storage.secureGet<string | null>(REFRESH_KEY, null);
  return !!accessToken;
}

export async function saveTokens(pair: { access_token: string; refresh_token: string }) {
  accessToken = pair.access_token;
  refreshToken = pair.refresh_token;
  await storage.secureSet(ACCESS_KEY, pair.access_token);
  await storage.secureSet(REFRESH_KEY, pair.refresh_token);
}

export async function clearTokens() {
  accessToken = null;
  refreshToken = null;
  await storage.secureRemove(ACCESS_KEY);
  await storage.secureRemove(REFRESH_KEY);
}

export function hasToken() {
  return !!accessToken;
}

type Options = { method?: string; body?: unknown; auth?: boolean };

async function rawFetch(path: string, opts: Options) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth !== false && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return fetch(`${BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false;
  const r = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!r.ok) return false;
  await saveTokens(await r.json());
  return true;
}

export async function api<T = any>(path: string, opts: Options = {}): Promise<T> {
  let res = await rawFetch(path, opts);
  if (res.status === 401 && opts.auth !== false && refreshToken) {
    if (await tryRefresh()) res = await rawFetch(path, opts);
  }
  if (res.status === 401 && opts.auth !== false) {
    await clearTokens();
    onUnauthorized?.();
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = data?.detail;
    const msg = Array.isArray(detail) ? detail[0]?.msg ?? "Request failed" : detail ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, msg);
  }
  return data as T;
}
