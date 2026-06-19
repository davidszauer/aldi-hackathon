// Emoji icon per ALDI category id (1–16). Used to decorate aisle cells,
// stop markers, and the basket tray on the in-store route map.
export const CATEGORY_ICON: Record<number, string> = {
  1: "🥦", // Vegetables
  2: "🍎", // Fruits
  3: "🥚", // Dairy & Eggs
  4: "🍗", // Meat & Poultry
  5: "🐟", // Fish & Seafood
  6: "🥖", // Bakery
  7: "🧊", // Frozen
  8: "🫙", // Pantry & Dry Goods
  9: "🍝", // Pasta & Rice
  10: "🥫", // Canned & Jarred
  11: "🧂", // Spices & Baking
  12: "🍿", // Snacks
  13: "🥤", // Beverages
  14: "🍯", // Condiments & Sauces
  15: "🧀", // Cheese & Deli
  16: "🧻", // Household
};

export function iconFor(categoryId?: number | null): string {
  if (categoryId == null) return "📦";
  return CATEGORY_ICON[categoryId] ?? "📦";
}

// Department color (shelf face + sign) per category — grouped into believable
// store sections rather than 16 arbitrary hues.
export const DEPARTMENT: Record<number, { face: string; sign: string }> = {
  1: { face: "#bbf7d0", sign: "#16a34a" }, // Vegetables – green
  2: { face: "#d9f99d", sign: "#65a30d" }, // Fruits – lime
  3: { face: "#fef9c3", sign: "#ca8a04" }, // Dairy & Eggs – yellow
  4: { face: "#fecdd3", sign: "#e11d48" }, // Meat & Poultry – red
  5: { face: "#cffafe", sign: "#0891b2" }, // Fish & Seafood – cyan
  6: { face: "#fde9c8", sign: "#b45309" }, // Bakery – amber
  7: { face: "#dbeafe", sign: "#2563eb" }, // Frozen – ice blue
  8: { face: "#f5e8d0", sign: "#a16207" }, // Pantry – tan
  9: { face: "#fed7aa", sign: "#ea580c" }, // Pasta & Rice – orange
  10: { face: "#e2e8f0", sign: "#475569" }, // Canned – slate
  11: { face: "#ffedd5", sign: "#c2410c" }, // Spices & Baking – burnt orange
  12: { face: "#f3e8ff", sign: "#9333ea" }, // Snacks – purple
  13: { face: "#cce0ff", sign: "#1d4ed8" }, // Beverages – blue
  14: { face: "#ffe4e6", sign: "#be123c" }, // Condiments – rose
  15: { face: "#fef3c7", sign: "#b45309" }, // Cheese & Deli – gold
  16: { face: "#e5e7eb", sign: "#6b7280" }, // Household – gray
};

export function deptFor(categoryId?: number | null) {
  if (categoryId == null) return { face: "#e5e7eb", sign: "#6b7280" };
  return DEPARTMENT[categoryId] ?? { face: "#e5e7eb", sign: "#6b7280" };
}
