"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, ShoppingCartSimple, Storefront, Trophy } from "@phosphor-icons/react";
import type { ProductOption, RecipeDetail, ResolvedIngredient } from "@/lib/api";
import { fetchRecipe } from "@/lib/api/browser";
import { useStore } from "@/components/StoreProvider";

export type ShopSeed = {
  recipeId: number;
  name: string;
  basePortions: number;
  portions?: number;
  excludePantry?: boolean;
};

const euro = (n: number) => `€${n.toFixed(2)}`;

function optionById(ing: ResolvedIngredient, id: number): ProductOption {
  return ing.product_options.find((o) => o.id === id) ?? ing.product_options[0];
}

/** Trim trailing zeros so "1.0 pcs" reads as "1 pcs". */
function amount(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(n < 10 ? 1 : 0);
}

export function ShopCard({ seed }: { seed: ShopSeed }) {
  const { store } = useStore();
  const [portions, setPortions] = useState(seed.portions ?? seed.basePortions);
  const [excludePantry, setExcludePantry] = useState(seed.excludePantry ?? true);
  const [profitMode, setProfitMode] = useState(false);
  const [detail, setDetail] = useState<RecipeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);

  // Re-fetch whenever portions / pantry change. A request counter drops stale
  // responses so fast stepper taps can't render out of order.
  useEffect(() => {
    const id = ++reqId.current;
    /* eslint-disable react-hooks/set-state-in-effect -- kicking off a fetch; results land in async callbacks below */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    fetchRecipe(seed.recipeId, { portions, excludePantry })
      .then((d) => {
        if (id === reqId.current) setDetail(d);
      })
      .catch((e: unknown) => {
        if (id === reqId.current) setError(e instanceof Error ? e.message : "Something went wrong");
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [seed.recipeId, portions, excludePantry]);

  const items = detail?.ingredients.filter((i) => i.include_in_shopping_list) ?? [];
  let cheapestTotal = 0;
  let profitTotal = 0;
  let profitMargin = 0;
  for (const ing of items) {
    cheapestTotal += optionById(ing, ing.cheapest_option_id).line_price;
    const profitOpt = optionById(ing, ing.max_profit_option_id);
    profitTotal += profitOpt.line_price;
    profitMargin += profitOpt.line_margin;
  }

  return (
    <div className="border-app-hairline mt-2.5 overflow-hidden rounded-2xl border bg-white shadow-[0_12px_30px_-22px_rgba(0,30,80,0.55)]">
      {/* Header */}
      <div className="bg-aldi-navy px-4 py-3.5 text-white">
        <div className="flex items-center gap-2.5">
          <span className="bg-aldi-yellow text-aldi-navy flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            <ShoppingCartSimple size={18} weight="fill" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15.5px] leading-tight font-extrabold tracking-tight">
              {seed.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[12px] font-medium text-white/65">
              <Storefront size={13} weight="fill" />
              {store.city} · {portions} {portions === 1 ? "portion" : "portions"}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-app-hairline space-y-3 border-b px-4 py-3.5">
        <div className="flex items-center justify-between">
          <span className="text-aldi-navy text-[14px] font-bold">Portions</span>
          <div className="border-app-hairline flex items-center gap-1 rounded-full border p-0.5">
            <StepBtn
              label="Fewer portions"
              disabled={portions <= 1}
              onClick={() => setPortions((p) => Math.max(1, p - 1))}
            >
              <Minus size={15} weight="bold" />
            </StepBtn>
            <span className="text-aldi-navy w-7 text-center text-[15px] font-extrabold tabular-nums">
              {portions}
            </span>
            <StepBtn
              label="More portions"
              disabled={portions >= 12}
              onClick={() => setPortions((p) => Math.min(12, p + 1))}
            >
              <Plus size={15} weight="bold" />
            </StepBtn>
          </div>
        </div>

        <Toggle
          checked={excludePantry}
          onChange={setExcludePantry}
          label="Skip pantry staples"
          hint="salt, oil, pepper…"
        />
        <Toggle
          checked={profitMode}
          onChange={setProfitMode}
          label="ALDI profit-optimised picks"
          trophy
        />
      </div>

      {/* Basket */}
      {error ? (
        <p className="text-aldi-red px-4 py-6 text-center text-[13px] font-semibold">{error}</p>
      ) : loading && !detail ? (
        <BasketSkeleton />
      ) : (
        <ul className="divide-app-hairline divide-y px-4">
          {items.map((ing) => {
            const opt = optionById(ing, profitMode ? ing.max_profit_option_id : ing.cheapest_option_id);
            return (
              <li key={ing.ingredient_key} className="flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-aldi-navy text-[14.5px] leading-tight font-bold">{ing.name}</p>
                  <p className="text-app-muted mt-0.5 text-[12px] leading-snug font-medium">
                    {opt.name}
                    <span className="text-app-muted/70">
                      {" · "}
                      {opt.packs_needed}× {opt.size}
                      {ing.product_options.length > 1 && ` · ${ing.product_options.length} options`}
                    </span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-aldi-navy text-[14.5px] font-extrabold tabular-nums">
                    {euro(opt.line_price)}
                  </p>
                  <p className="text-app-muted text-[11.5px] font-medium tabular-nums">
                    {amount(ing.scaled_amount)} {ing.unit}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Totals */}
      <div className="space-y-2 px-4 pt-3 pb-4">
        <button
          type="button"
          onClick={() => setProfitMode(false)}
          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-colors ${
            profitMode ? "bg-app-field" : "bg-aldi-blue/8 ring-1 ring-aldi-blue/30 ring-inset"
          }`}
        >
          <span className="text-aldi-navy text-[13.5px] font-bold">Cheapest basket</span>
          <span className="text-aldi-navy text-[15px] font-extrabold tabular-nums">
            {euro(cheapestTotal)}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setProfitMode(true)}
          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-colors ${
            profitMode
              ? "bg-aldi-orange/10 ring-1 ring-aldi-orange/40 ring-inset"
              : "bg-app-field"
          }`}
        >
          <span className="text-aldi-navy flex items-center gap-1.5 text-[13.5px] font-bold">
            <Trophy size={15} weight="fill" className="text-aldi-orange" />
            Profit-optimised
          </span>
          <span className="flex items-baseline gap-2">
            <span className="text-aldi-orange text-[12px] font-bold tabular-nums">
              margin {euro(profitMargin)}
            </span>
            <span className="text-aldi-navy text-[15px] font-extrabold tabular-nums">
              {euro(profitTotal)}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

function StepBtn({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="text-aldi-blue flex h-8 w-8 items-center justify-center rounded-full transition-colors active:bg-aldi-blue/10 disabled:text-app-hairline"
    >
      {children}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
  trophy,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  trophy?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <span className="text-aldi-navy flex items-center gap-1.5 text-[14px] font-semibold">
        {trophy && <Trophy size={15} weight="fill" className="text-aldi-orange" />}
        {label}
        {hint && <span className="text-app-muted text-[12px] font-medium">{hint}</span>}
      </span>
      <span
        className={`relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-aldi-blue" : "bg-app-hairline"
        }`}
      >
        <span
          className={`absolute top-[3px] left-[3px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            checked ? "translate-x-[18px]" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function BasketSkeleton() {
  return (
    <ul className="divide-app-hairline divide-y px-4">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-center justify-between py-3.5">
          <div className="space-y-1.5">
            <div className="bg-app-field h-3.5 w-28 animate-pulse rounded-full" />
            <div className="bg-app-field h-2.5 w-40 animate-pulse rounded-full" />
          </div>
          <div className="bg-app-field h-3.5 w-10 animate-pulse rounded-full" />
        </li>
      ))}
    </ul>
  );
}
