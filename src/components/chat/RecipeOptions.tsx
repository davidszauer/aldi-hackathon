"use client";

import { Clock, ForkKnife, Users } from "@phosphor-icons/react";
import type { Recipe } from "@/lib/api";

type Props = {
  recipes: Recipe[];
  /** id of the recipe whose basket is currently open, for the selected accent. */
  activeId?: number;
  onPick: (recipe: Recipe) => void;
};

export function RecipeOptions({ recipes, activeId, onPick }: Props) {
  if (recipes.length === 0) return null;

  return (
    <div className="mt-2.5 space-y-2.5">
      {recipes.map((recipe) => {
        const active = recipe.id === activeId;
        return (
          <button
            key={recipe.id}
            type="button"
            onClick={() => onPick(recipe)}
            aria-pressed={active}
            className={`group block w-full rounded-2xl border bg-white p-4 text-left transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.985] ${
              active
                ? "border-aldi-blue shadow-[0_0_0_1px_var(--color-aldi-blue),0_10px_24px_-16px_rgba(0,82,155,0.5)]"
                : "border-app-hairline hover:border-aldi-blue/40 hover:shadow-[0_8px_22px_-18px_rgba(0,30,80,0.5)]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-aldi-navy text-[17px] leading-tight font-extrabold tracking-tight">
                {recipe.name}
              </h3>
              <span
                className={`mt-0.5 flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 text-[12px] font-bold transition-colors ${
                  active ? "bg-aldi-blue text-white" : "bg-app-field text-aldi-blue"
                }`}
              >
                {active ? (
                  "In basket"
                ) : (
                  <>
                    <ForkKnife size={13} weight="bold" />
                    Cook this
                  </>
                )}
              </span>
            </div>

            <p className="text-app-muted mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-medium">
              <span className="text-aldi-navy/80">{recipe.cuisine}</span>
              <span aria-hidden className="text-app-hairline">
                ·
              </span>
              <Clock size={14} weight="bold" className="-mr-0.5" />
              {recipe.prep_minutes} min
              <span aria-hidden className="text-app-hairline">
                ·
              </span>
              <Users size={14} weight="bold" className="-mr-0.5" />
              serves {recipe.base_portions}
            </p>

            {recipe.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-aldi-blue/8 text-aldi-blue rounded-full px-2.5 py-1 text-[12px] font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
