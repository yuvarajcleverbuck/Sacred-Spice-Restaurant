import { useQuery } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { api } from "@/src/api";
import { storage } from "@/src/utils/storage";

export type Outlet = {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
  image: string;
  services: string[];
  hours: Record<string, { open: string; close: string }>;
  delivery_zips: string[];
  min_delivery_order: number;
  delivery_fee: number;
  free_delivery_over: number;
  is_open: boolean;
  kitchen_load: string;
  distance_miles?: number;
};

const KEY = "ss.outlet_id";

type OutletState = {
  outletId: string | null;
  outlet: Outlet | null;
  ready: boolean;
  selectOutlet: (id: string) => Promise<void>;
};

const OutletContext = createContext<OutletState | null>(null);

export function OutletProvider({ children }: { children: React.ReactNode }) {
  const [outletId, setOutletId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    storage.getItem<string | null>(KEY, null).then((v) => {
      setOutletId(v);
      setReady(true);
    });
  }, []);

  const { data: outlet } = useQuery({
    queryKey: ["outlet", outletId],
    queryFn: () => api<Outlet>(`/outlets/${outletId}`),
    enabled: !!outletId,
    staleTime: 60_000,
  });

  const selectOutlet = useCallback(async (id: string) => {
    setOutletId(id);
    await storage.setItem(KEY, id);
  }, []);

  const value = useMemo(
    () => ({ outletId, outlet: outlet ?? null, ready, selectOutlet }),
    [outletId, outlet, ready, selectOutlet],
  );
  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
}

export function useOutlet() {
  const ctx = useContext(OutletContext);
  if (!ctx) throw new Error("useOutlet outside OutletProvider");
  return ctx;
}
