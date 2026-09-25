import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { api, clearTokens, loadTokens, saveTokens, setUnauthorizedHandler } from "@/src/api";

export type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  zip: string;
  instructions?: string | null;
};

export type Guest = {
  id: string;
  email: string;
  name: string;
  mobile?: string | null;
  addresses: Address[];
  preferences: { dietary: string[]; allergens: string[]; spice_preference: number; important_dates: string[] };
  consents: { email: boolean; sms: boolean; push: boolean };
  loyalty: { points: number; lifetime_points: number };
  account_status: string;
};

type AuthState = {
  guest: Guest | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: { email: string; password: string; name: string; mobile?: string }) => Promise<{ dev_otp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setGuest: (g: Guest) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [ready, setReady] = useState(false);
  const qc = useQueryClient();

  const refreshProfile = useCallback(async () => {
    const g = await api<Guest>("/guest/profile");
    setGuest(g);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setGuest(null);
      qc.clear();
    });
    (async () => {
      try {
        if (await loadTokens()) await refreshProfile();
      } catch {
        // token invalid → stay logged out
      } finally {
        setReady(true);
      }
    })();
  }, [refreshProfile, qc]);

  const value = useMemo<AuthState>(
    () => ({
      guest,
      ready,
      setGuest,
      refreshProfile,
      login: async (email, password) => {
        const r = await api("/auth/login", { method: "POST", body: { email, password }, auth: false });
        await saveTokens(r);
        setGuest(r.guest);
      },
      register: async (body) => api("/auth/register", { method: "POST", body, auth: false }),
      verifyOtp: async (email, otp) => {
        const r = await api("/auth/verify-otp", { method: "POST", body: { email, otp }, auth: false });
        await saveTokens(r);
        setGuest(r.guest);
      },
      logout: async () => {
        await clearTokens();
        setGuest(null);
        qc.clear();
      },
    }),
    [guest, ready, refreshProfile, qc],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
