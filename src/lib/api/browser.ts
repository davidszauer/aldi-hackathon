// Browser-callable ALDI API helpers.
// The hackathon API is CORS-open and unauthenticated, so the client can hit it
// directly. We use this for instant basket tweaks (portions / pantry toggle)
// without a round-trip through the OpenAI chat route.

import type { Recipe, RecipeDetail } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_ALDI_API_BASE_URL ?? "https://hackhaton.internal.zrcn.dev";

export async function fetchRecipes(q: string): Promise<Recipe[]> {
  const res = await fetch(`${BASE_URL}/api/recipes?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(`Recipe search failed (${res.status})`);
  const data = (await res.json()) as { recipes: Recipe[] };
  return data.recipes;
}

export async function fetchRecipe(
  id: number,
  opts: { portions?: number; excludePantry?: boolean } = {},
): Promise<RecipeDetail> {
  const params = new URLSearchParams();
  if (opts.portions != null) params.set("portions", String(opts.portions));
  if (opts.excludePantry) params.set("exclude_pantry", "true");
  const res = await fetch(`${BASE_URL}/api/recipes/${id}?${params.toString()}`);
  if (!res.ok) throw new Error(`Could not load that recipe (${res.status})`);
  return (await res.json()) as RecipeDetail;
}
