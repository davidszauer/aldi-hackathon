"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_STORE_ID, getStore, STORES, type Store } from "@/lib/stores";

const STORAGE_KEY = "aldi.storeId";

type StoreContextValue = {
  /** The active store — drives every `/api/stores/{id}` call. */
  store: Store;
  storeId: number;
  stores: Store[];
  setStoreId: (id: number) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [storeId, setStoreIdState] = useState<number>(DEFAULT_STORE_ID);

  // Rehydrate the last-picked store after mount (server can't read localStorage).
  useEffect(() => {
    const saved = Number(window.localStorage.getItem(STORAGE_KEY));
    if (saved && STORES.some((s) => s.id === saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, which is unavailable during SSR
      setStoreIdState(saved);
    }
  }, []);

  const setStoreId = useCallback((id: number) => {
    setStoreIdState(id);
    window.localStorage.setItem(STORAGE_KEY, String(id));
  }, []);

  return (
    <StoreContext.Provider
      value={{ store: getStore(storeId), storeId, stores: STORES, setStoreId }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
