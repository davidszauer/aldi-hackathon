// TypeScript types for the ALDI Hackathon REST API.
// Shapes verified against the live API (https://hackhaton.internal.zrcn.dev).

export interface Category {
  id: number;
  name: string;
  slug: string;
}

/** A purchasable product / size option. */
export interface Product {
  id: number;
  category_id: number;
  category: string;
  name: string;
  price: number;
  wholesale_price: number;
  size: string;
  unit: string;
  unit_amount: number;
  ingredient_key: string | null;
}

/** A product option attached to a recipe ingredient (Product + per-line maths). */
export interface ProductOption extends Product {
  packs_needed: number;
  line_price: number;
  line_wholesale: number;
  line_margin: number;
}

/** Ingredient as listed on a recipe summary (no product options resolved). */
export interface RecipeIngredient {
  ingredient_key: string;
  name: string;
  amount: number;
  unit: string;
  category_id: number;
  category: string;
  pantry_staple: boolean;
}

/** Ingredient on a recipe detail — scaled and resolved to product options. */
export interface ResolvedIngredient extends RecipeIngredient {
  scaled_amount: number;
  include_in_shopping_list: boolean;
  product_options: ProductOption[];
  cheapest_option_id: number;
  max_profit_option_id: number;
}

/** Recipe summary (from /api/recipes). */
export interface Recipe {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  base_portions: number;
  prep_minutes: number;
  tags: string[];
  ingredients: RecipeIngredient[];
}

/** Recipe detail (from /api/recipes/{id}) — scaled, with product options. */
export interface RecipeDetail {
  recipe: Omit<Recipe, "ingredients">;
  portions: number;
  scale: number;
  exclude_pantry: boolean;
  ingredients: ResolvedIngredient[];
}

export interface Store {
  id: number;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  grid_size: number;
}

export interface GridPoint {
  x: number;
  y: number;
}

export interface GridCell extends GridPoint {
  type: string; // "aisle" | others
  category_ids: number[];
  categories: string[];
  label: string;
}

export interface StoreGrid {
  store_id: number;
  store_name: string;
  width: number;
  height: number;
  entrance: GridPoint;
  checkout: GridPoint;
  cells: GridCell[];
}

export interface RouteStop {
  order: number;
  x: number;
  y: number;
  category_id: number | null;
  category: string; // "Entrance" | "Checkout" | category name
  label: string;
  steps_from_previous: number;
}

export interface RoutePlan {
  store_id: number;
  store_name: string;
  required_category_ids: number[];
  unavailable_category_ids: number[];
  stops: RouteStop[];
  total_steps: number;
  path: GridPoint[];
}

// --- List envelopes returned by the API ---

export interface CategoriesResponse {
  count: number;
  categories: Category[];
}

export interface ProductsResponse {
  count: number;
  products: Product[];
}

export interface RecipesResponse {
  count: number;
  recipes: Recipe[];
}

export interface StoresResponse {
  count: number;
  stores: Store[];
}
