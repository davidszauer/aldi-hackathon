import { CATEGORIES } from "@/lib/categories";

/**
 * Two-column product-category grid, separated by hairlines like the ALDI app.
 * Tiles fade in with a short staggered entrance (disabled under reduced motion
 * via the .tile-in media gate in globals.css).
 */
export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2">
      {CATEGORIES.map((category, index) => {
        const Glyph = category.icon;
        const inLeftColumn = index % 2 === 0;
        return (
          <button
            key={category.id}
            type="button"
            style={{ animationDelay: `${index * 35}ms` }}
            className={`tile-in border-app-hairline active:bg-app-field flex flex-col items-center gap-3 px-4 py-7 text-center transition-colors ${
              inLeftColumn ? "border-r" : ""
            } border-b`}
          >
            <span className="bg-aldi-blue/10 flex h-[68px] w-[68px] items-center justify-center rounded-2xl">
              <Glyph size={34} weight="duotone" className="text-aldi-blue" />
            </span>
            <span className="text-aldi-navy text-[15px] leading-tight font-bold">
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
