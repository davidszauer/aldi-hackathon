"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RoutePlan, StoreGrid as Grid } from "@/lib/api";
import { iconFor, deptFor } from "@/lib/routeIcons";
import { ALDI, Shelf, EntranceDoor, CheckoutTill, type ShelfState } from "./routeTiles";

const CELL = 66; // floor footprint per cell (px)
const PAD = 16;
const GAP = 9; // walkway between shelves
const FRONT = 18; // shelf height (front face)
const STEP_MS = 380; // cart speed per cell

// Cart/trail ride the walkway in front of each shelf (lower part of the cell).
const cx = (x: number) => PAD + x * CELL + CELL / 2;
const cyFloor = (y: number) => PAD + y * CELL + CELL * 0.66;

export function RouteMap({
  grid,
  route,
  fitWidth,
}: {
  grid: Grid;
  route: RoutePlan;
  fitWidth?: number; // if set, the board is scaled to fit this pixel width
}) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopByKey = useMemo(() => {
    const m = new Map<string, RoutePlan["stops"][number]>();
    for (const s of route.stops) m.set(`${s.x},${s.y}`, s);
    return m;
  }, [route]);

  const reached = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i <= step && i < route.path.length; i++) {
      const s = stopByKey.get(`${route.path[i].x},${route.path[i].y}`);
      if (s) set.add(s.order);
    }
    return set;
  }, [step, route, stopByKey]);

  const targetStop = useMemo(() => {
    return route.stops
      .filter((s) => s.category_id != null && !reached.has(s.order))
      .sort((a, b) => a.order - b.order)[0];
  }, [route, reached]);
  const targetOrder = targetStop?.order ?? -1;

  const done = step >= route.path.length - 1;

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s >= route.path.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, STEP_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, route.path.length]);

  function play() {
    if (done) setStep(0);
    setPlaying(true);
  }

  const avatar = route.path[Math.min(step, route.path.length - 1)];
  const traveled = route.path.slice(0, step + 1);
  const facing = step > 0 && route.path[step].x < route.path[step - 1].x ? -1 : 1; // flip cart on left moves
  const W = grid.width * CELL + PAD * 2;
  const H = grid.height * CELL + PAD * 2 + FRONT;
  const scale = fitWidth ? Math.min(1, fitWidth / W) : 1;
  const totalPickups = route.stops.filter((s) => s.category_id != null).length;
  const collectedCount = route.stops.filter(
    (s) => s.category_id != null && reached.has(s.order),
  ).length;

  // Paint back-to-front: smaller y (far) first so nearer rows overlap correctly.
  const cells = useMemo(() => [...grid.cells].sort((a, b) => a.y - b.y || a.x - b.x), [grid]);
  const topH = CELL - GAP;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="flex flex-col gap-3">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={playing ? () => setPlaying(false) : play}
            className="rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm"
            style={{ background: ALDI.blue }}
          >
            {playing ? "⏸ Pause" : done ? "↻ Replay" : "▶ Play route"}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Reset
          </button>
        </div>

        {/* Progress */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${(step / (route.path.length - 1)) * 100}%`, background: ALDI.blue }}
          />
        </div>

        {/* Store floor (scaled to fit a narrow container when fitWidth is set) */}
        <div style={{ width: W * scale, height: H * scale }}>
          <div
            className="relative overflow-hidden rounded-xl border shadow-inner"
            style={{
              width: W,
              height: H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              borderColor: ALDI.floorLine,
              background:
                `repeating-linear-gradient(0deg,${ALDI.floorLine},${ALDI.floorLine} 1px,${ALDI.floor} 1px,${ALDI.floor} ${CELL}px),` +
                `repeating-linear-gradient(90deg,${ALDI.floorLine},${ALDI.floorLine} 1px,${ALDI.floor} 1px,${ALDI.floor} ${CELL}px)`,
            }}
          >
            {/* Floor route guide (under everything) */}
            <svg width={W} height={H} className="pointer-events-none absolute inset-0 z-[1]">
              <polyline
                fill="none"
                stroke={ALDI.blue}
                strokeWidth={9}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.12}
                points={route.path.map((p) => `${cx(p.x)},${cyFloor(p.y)}`).join(" ")}
              />
              <polyline
                fill="none"
                stroke={ALDI.blue}
                strokeWidth={4}
                strokeDasharray="1 8"
                strokeLinecap="round"
                points={route.path.map((p) => `${cx(p.x)},${cyFloor(p.y)}`).join(" ")}
              />
              <polyline
                fill="none"
                stroke={ALDI.orange}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={traveled.map((p) => `${cx(p.x)},${cyFloor(p.y)}`).join(" ")}
              />
            </svg>

            {/* Soft spotlight on the active target shelf */}
            {targetStop && (
              <div
                className="route-spotlight pointer-events-none absolute z-[1] rounded-full"
                style={{
                  left: cx(targetStop.x),
                  top: PAD + targetStop.y * CELL + GAP / 2 + topH / 2,
                  width: CELL * 2.5,
                  height: CELL * 2.5,
                  background: `radial-gradient(circle, ${deptFor(targetStop.category_id).sign}66 0%, ${deptFor(targetStop.category_id).sign}22 35%, transparent 68%)`,
                }}
              />
            )}

            {/* Fixtures, painted back-to-front */}
            {cells.map((c) => {
              const stop = stopByKey.get(`${c.x},${c.y}`);
              const left = PAD + c.x * CELL + GAP / 2;
              const top = PAD + c.y * CELL + GAP / 2;
              const z = 2 + c.y; // nearer rows on top

              if (c.type === "entrance")
                return (
                  <div key="in" className="absolute" style={{ left, top, zIndex: z }}>
                    <EntranceDoor w={topH} topH={topH} front={FRONT} />
                  </div>
                );
              if (c.type === "checkout")
                return (
                  <div key="out" className="absolute" style={{ left, top, zIndex: z }}>
                    <CheckoutTill w={topH} topH={topH} front={FRONT} />
                  </div>
                );

              const isPickup = !!stop && stop.category_id != null;
              // Non-pickup shelves are greyed out by default so the route pops.
              const state: ShelfState = isPickup
                ? reached.has(stop!.order)
                  ? "done"
                  : stop!.order === targetOrder
                    ? "target"
                    : "idle"
                : "muted";
              return (
                <div
                  key={`${c.x},${c.y}`}
                  title={c.label}
                  className="absolute"
                  style={{ left, top, zIndex: z }}
                >
                  <Shelf
                    w={topH}
                    topH={topH}
                    front={FRONT}
                    categoryId={c.category_ids?.[0]}
                    stopNo={isPickup ? stop!.order : undefined}
                    state={state}
                  />
                </div>
              );
            })}

            {/* Cart with shadow, rides the floor */}
            <div
              className="absolute z-[60]"
              style={{
                left: cx(avatar.x),
                top: cyFloor(avatar.y),
                transform: "translate(-50%,-50%)",
                transition: `left ${STEP_MS}ms linear, top ${STEP_MS}ms linear`,
              }}
            >
              <div className="absolute top-[14px] left-1/2 h-2 w-7 -translate-x-1/2 rounded-full bg-black/25 blur-[2px]" />
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl shadow-lg"
                style={{ boxShadow: `0 0 0 2px ${ALDI.blue}`, transform: `scaleX(${facing})` }}
              >
                🛒
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <Legend color={ALDI.navy} label="Entrance" />
          <Legend color={ALDI.orange} label="Walked path" />
          <Legend color={ALDI.blue} label="Planned route" />
          <Legend color={ALDI.red} label="Checkout" />
        </div>
      </div>

      {/* Side: basket tray + stop list (hidden in compact/chat mode) */}
      {!fitWidth && (
        <div className="flex min-w-[230px] flex-1 flex-col gap-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-2 text-sm font-semibold text-slate-700">
              🧺 Basket ({collectedCount}/{totalPickups})
            </div>
            <div className="flex flex-wrap gap-2">
              {route.stops
                .filter((s) => s.category_id != null)
                .map((s) => {
                  const got = reached.has(s.order);
                  return (
                    <div
                      key={s.order}
                      title={s.category}
                      className={`flex h-11 w-11 items-center justify-center rounded-lg border text-xl transition-all duration-300 ${
                        got
                          ? "scale-100 border-emerald-300 bg-emerald-50 opacity-100"
                          : "scale-90 border-dashed border-slate-200 bg-slate-50 opacity-30"
                      }`}
                    >
                      {iconFor(s.category_id)}
                    </div>
                  );
                })}
            </div>
          </div>

          <ol className="flex flex-col gap-1 text-sm">
            {route.stops.map((s) => {
              const got = reached.has(s.order);
              return (
                <li
                  key={s.order}
                  className={`flex items-center gap-2 rounded px-2 py-1 transition-colors ${
                    got ? "bg-emerald-50 text-emerald-800" : "text-slate-400"
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      got ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {s.order}
                  </span>
                  <span className="w-5 text-center">
                    {s.category_id != null ? iconFor(s.category_id) : s.order === 0 ? "🚪" : "💳"}
                  </span>
                  <span className="flex-1">{s.label}</span>
                  {s.steps_from_previous > 0 && (
                    <span className="text-xs text-slate-400">+{s.steps_from_previous}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block h-3 w-3 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
