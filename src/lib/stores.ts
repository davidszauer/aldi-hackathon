import storesData from "./stores.json";

/**
 * The store catalog — the five ALDI stores the prototype can shop from. Kept as
 * local JSON (mirrors `GET /api/stores`) so the picker works offline and the
 * selected `id` is the one we pass to every store-scoped API call:
 * `/api/stores/{id}`, `/grid`, `/route-plan`.
 */
export type Store = {
  id: number;
  name: string;
  city: string;
  country: string;
  flag: string;
  address: string;
  lat: number;
  lng: number;
  grid_size: number;
};

export const STORES: Store[] = storesData.stores;

export const DEFAULT_STORE_ID: number = storesData.defaultStoreId;

export function getStore(id: number): Store {
  return STORES.find((s) => s.id === id) ?? STORES[0];
}
