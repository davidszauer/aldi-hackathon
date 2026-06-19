import type { Icon } from "@phosphor-icons/react";
import {
  BowlFood,
  Bread,
  Broom,
  Carrot,
  Cheese,
  Cherries,
  Coffee,
  Cookie,
  Cow,
  Drop,
  Egg,
  Fish,
  Jar,
  Package,
  Pepper,
  Snowflake,
} from "@phosphor-icons/react/dist/ssr";

export type Category = {
  id: number;
  name: string;
  icon: Icon;
};

/**
 * The 16 product categories served by the ALDI Hackathon API
 * (GET /api/categories), paired with a representative icon. Real product
 * photography would replace these icons in production.
 */
export const CATEGORIES: Category[] = [
  { id: 1, name: "Vegetables", icon: Carrot },
  { id: 2, name: "Fruits", icon: Cherries },
  { id: 3, name: "Dairy & Eggs", icon: Egg },
  { id: 4, name: "Meat & Poultry", icon: Cow },
  { id: 5, name: "Fish & Seafood", icon: Fish },
  { id: 6, name: "Bakery", icon: Bread },
  { id: 7, name: "Frozen", icon: Snowflake },
  { id: 8, name: "Pantry & Dry Goods", icon: Package },
  { id: 9, name: "Pasta & Rice", icon: BowlFood },
  { id: 10, name: "Canned & Jarred", icon: Jar },
  { id: 11, name: "Spices & Baking", icon: Pepper },
  { id: 12, name: "Snacks", icon: Cookie },
  { id: 13, name: "Beverages", icon: Coffee },
  { id: 14, name: "Condiments & Sauces", icon: Drop },
  { id: 15, name: "Cheese & Deli", icon: Cheese },
  { id: 16, name: "Household", icon: Broom },
];
