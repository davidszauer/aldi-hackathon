import { SquaresFour } from "@phosphor-icons/react/dist/ssr";
import { CATEGORIES } from "@/lib/categories";

/** Horizontal filter rail above the product grid. "All" is the active filter. */
export function CategoryTabs() {
  return (
    <div className="no-scrollbar flex items-center gap-6 overflow-x-auto px-5">
      <button
        type="button"
        aria-current="true"
        className="border-aldi-blue text-aldi-blue flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-2.5"
      >
        <SquaresFour size={22} weight="fill" />
        <span className="text-[13px] font-semibold">All</span>
      </button>
      {CATEGORIES.slice(0, 6).map((category) => (
        <button
          key={category.id}
          type="button"
          className="text-aldi-blue/80 shrink-0 border-b-2 border-transparent pt-1 pb-2.5 text-[15px] font-medium whitespace-nowrap"
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
