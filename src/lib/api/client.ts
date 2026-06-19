// Typed client for the ALDI Hackathon REST API.
// Everything that talks to the catalog goes through here.

import type {
  CategoriesResponse,
  Category,
  Product,
  ProductsResponse,
  Recipe,
  RecipeDetail,
  RecipesResponse,
  RoutePlan,
  Store,
  StoresResponse,
  StoreGrid,
} from "./types";

const BASE_URL = process.env.ALDI_API_BASE_URL ?? "https://hackhaton.internal.zrcn.dev";

class AldiApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = "AldiApiError";
  }
}

type QueryParams = Record<string, string | number | boolean | undefined>;

/** Build a URL with query params, dropping null/undefined values. */
function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function apiGet<T>(path: string, params?: QueryParams): Promise<T> {
  const url = buildUrl(path, params);
  // The catalog is static during the demo; cache aggressively to cut latency.
  const res = await fetch(url, { headers: { accept: "application/json" }, cache: "force-cache" });
  if (!res.ok) {
    throw new AldiApiError(`ALDI API ${res.status} for ${path}`, res.status, url);
  }
  return (await res.json()) as T;
}

// --- Categories ---

export async function getCategories(): Promise<Category[]> {
  const data = await apiGet<CategoriesResponse>("/api/categories");
  return data.categories;
}

// --- Products ---

export type GetProductsParams = {
  category_id?: number;
  q?: string;
  sort?: "price" | "margin";
}

export async function getProducts(params: GetProductsParams = {}): Promise<Product[]> {
  const data = await apiGet<ProductsResponse>("/api/products", params);
  return data.products;
}

// --- Recipes ---

export type GetRecipesParams = {
  q?: string;
  tag?: string;
}

export async function getRecipes(params: GetRecipesParams = {}): Promise<Recipe[]> {
  const data = await apiGet<RecipesResponse>("/api/recipes", params);
  return data.recipes;
}

export type GetRecipeParams = {
  portions?: number;
  exclude_pantry?: boolean;
}

export async function getRecipe(id: number, params: GetRecipeParams = {}): Promise<RecipeDetail> {
  return apiGet<RecipeDetail>(`/api/recipes/${id}`, params);
}

// --- Stores ---

export async function getStores(): Promise<Store[]> {
  const data = await apiGet<StoresResponse>("/api/stores");
  return data.stores;
}

export async function getStore(id: number): Promise<Store> {
  return apiGet<Store>(`/api/stores/${id}`);
}

export async function getStoreGrid(id: number): Promise<StoreGrid> {
  return apiGet<StoreGrid>(`/api/stores/${id}/grid`);
}

// --- Route plan ---

export type GetRoutePlanParams = {
  recipe_id: number;
  exclude_pantry?: boolean;
}

export async function getRoutePlan(storeId: number, params: GetRoutePlanParams): Promise<RoutePlan> {
  return apiGet<RoutePlan>(`/api/stores/${storeId}/route-plan`, params);
}

export { AldiApiError };
