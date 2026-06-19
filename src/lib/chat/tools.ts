// OpenAI tool definitions + dispatcher that maps them to the ALDI API client.

import type OpenAI from "openai";
import {
  getRecipe,
  getRecipes,
  getRoutePlan,
  getStoreGrid,
  getStores,
  type ProductOption,
  type RecipeDetail,
} from "@/lib/api";
import type { ChatArtifacts } from "./types";

export const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_recipes",
      description:
        "Search ALDI recipes by dish name or ingredient (e.g. 'pasta', 'chicken'). Returns matching recipe options.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Dish or ingredient to search for." },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_recipe",
      description:
        "Get a recipe's full ingredient list resolved to ALDI products (sizes, prices, margins), scaled to the requested portions. Use after the customer picks a recipe.",
      parameters: {
        type: "object",
        properties: {
          recipe_id: { type: "integer", description: "The recipe id to resolve." },
          portions: {
            type: "integer",
            description: "How many portions to scale the recipe to. Defaults to the recipe base.",
          },
          exclude_pantry: {
            type: "boolean",
            description: "Skip pantry staples (salt, oil, pepper, ...) from the shopping list.",
          },
        },
        required: ["recipe_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_stores",
      description: "List the ALDI stores the customer can choose from.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "plan_route",
      description:
        "Plan the shortest route through a store that collects every ingredient for a recipe and ends at the checkout. Use after a recipe and a store are chosen.",
      parameters: {
        type: "object",
        properties: {
          store_id: { type: "integer", description: "The store id to shop at." },
          recipe_id: { type: "integer", description: "The recipe id to shop for." },
          exclude_pantry: {
            type: "boolean",
            description: "Skip pantry staples (keep this consistent with get_recipe).",
          },
        },
        required: ["store_id", "recipe_id"],
      },
    },
  },
];

/** Default basket = the max-profit option per ingredient that's on the shopping list. */
function recommendedOption(ingredient: RecipeDetail["ingredients"][number]): ProductOption | null {
  return (
    ingredient.product_options.find((o) => o.id === ingredient.max_profit_option_id) ??
    ingredient.product_options[0] ??
    null
  );
}

/** Compact summary of a resolved recipe for the model (UI gets the full object). */
function summarizeRecipe(detail: RecipeDetail) {
  let totalPrice = 0;
  let totalMargin = 0;
  const ingredients = detail.ingredients.map((ing) => {
    const opt = recommendedOption(ing);
    if (ing.include_in_shopping_list && opt) {
      totalPrice += opt.line_price;
      totalMargin += opt.line_margin;
    }
    return {
      name: ing.name,
      amount: ing.scaled_amount,
      unit: ing.unit,
      pantry_staple: ing.pantry_staple,
      in_shopping_list: ing.include_in_shopping_list,
      recommended_product: opt
        ? { name: opt.name, size: opt.size, price: opt.line_price }
        : null,
      option_count: ing.product_options.length,
    };
  });
  return {
    recipe: detail.recipe.name,
    portions: detail.portions,
    exclude_pantry: detail.exclude_pantry,
    ingredients,
    basket_total: Number(totalPrice.toFixed(2)),
    aldi_margin: Number(totalMargin.toFixed(2)),
  };
}

export interface ToolResult {
  content: string;
  artifacts: ChatArtifacts;
}

/** Execute a single tool call and return both a model-facing string and UI artifacts. */
export async function runTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  switch (name) {
    case "search_recipes": {
      const recipes = await getRecipes({ q: String(args.query ?? "") });
      const content = JSON.stringify({
        count: recipes.length,
        recipes: recipes.map((r) => ({
          id: r.id,
          name: r.name,
          cuisine: r.cuisine,
          prep_minutes: r.prep_minutes,
          base_portions: r.base_portions,
          tags: r.tags,
        })),
      });
      return { content, artifacts: { recipes } };
    }

    case "get_recipe": {
      const detail = await getRecipe(Number(args.recipe_id), {
        portions: args.portions != null ? Number(args.portions) : undefined,
        exclude_pantry: args.exclude_pantry === true,
      });
      return { content: JSON.stringify(summarizeRecipe(detail)), artifacts: { recipe: detail } };
    }

    case "list_stores": {
      const stores = await getStores();
      const content = JSON.stringify({
        stores: stores.map((s) => ({ id: s.id, name: s.name, city: s.city })),
      });
      return { content, artifacts: { stores } };
    }

    case "plan_route": {
      const storeId = Number(args.store_id);
      const [plan, grid] = await Promise.all([
        getRoutePlan(storeId, {
          recipe_id: Number(args.recipe_id),
          exclude_pantry: args.exclude_pantry === true,
        }),
        getStoreGrid(storeId),
      ]);
      const content = JSON.stringify({
        store: plan.store_name,
        total_steps: plan.total_steps,
        stops: plan.stops.map((s) => ({ order: s.order, label: s.label })),
        unavailable_category_ids: plan.unavailable_category_ids,
      });
      return { content, artifacts: { route: { plan, grid } } };
    }

    default:
      return { content: JSON.stringify({ error: `Unknown tool: ${name}` }), artifacts: {} };
  }
}
