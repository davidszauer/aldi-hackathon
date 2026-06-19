"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Check, MapPin } from "@phosphor-icons/react";
import { useStore } from "@/components/StoreProvider";

const EXIT_MS = 220;

export function StoreSwitcher() {
  const { store, storeId, stores, setStoreId } = useStore();

  // `render` = overlay mounted; `shown` = transitioned in. Splitting the two lets
  // the sheet animate both on enter (rAF after mount) and exit (before unmount).
  const [render, setRender] = useState(false);
  const [shown, setShown] = useState(false);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  // Resolve the portal host after mount — it only exists in the browser DOM.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from the DOM, which is unavailable during SSR
    setTarget(document.getElementById("phone-screen"));
  }, []);

  function open() {
    setRender(true);
    requestAnimationFrame(() => setShown(true));
  }

  function close() {
    setShown(false);
    setTimeout(() => setRender(false), EXIT_MS);
  }

  function pick(id: number) {
    setStoreId(id);
    close();
  }

  // Close on Escape while the sheet is open.
  useEffect(() => {
    if (!render) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [render]);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-expanded={render}
        className="text-aldi-navy flex items-center gap-1 rounded-full text-[14px] font-semibold transition-opacity active:opacity-60"
      >
        <MapPin size={17} weight="fill" className="text-aldi-blue" />
        {store.city}
        <CaretDown size={13} weight="bold" />
      </button>

      {render &&
        target &&
        createPortal(
          <div role="dialog" aria-modal="true" aria-label="Choose your store" className="absolute inset-0 z-50">
            {/* Scrim */}
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className={`absolute inset-0 bg-aldi-navy/35 transition-opacity duration-200 ease-out ${
                shown ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Sheet */}
            <div
              className={`bg-app-surface absolute inset-x-0 bottom-0 rounded-t-[1.75rem] pb-7 shadow-[0_-12px_40px_-12px_rgba(0,30,80,0.35)] transition-transform duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                shown ? "translate-y-0" : "translate-y-full"
              }`}
            >
              {/* Grabber */}
              <div className="flex justify-center pt-3 pb-1">
                <span className="bg-app-hairline h-1.5 w-10 rounded-full" />
              </div>

              <div className="px-5 pt-2 pb-3">
                <h2 className="text-aldi-navy text-[19px] font-extrabold tracking-tight">
                  Choose your store
                </h2>
                <p className="text-app-muted mt-0.5 text-[13px] font-medium">
                  Recipes, prices, and store routes follow the store you pick.
                </p>
              </div>

              <ul className="px-2">
                {stores.map((s) => {
                  const active = s.id === storeId;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => pick(s.id)}
                        aria-current={active ? "true" : undefined}
                        className={`flex w-full items-center gap-3.5 rounded-2xl px-3 py-3 text-left transition-colors ${
                          active ? "bg-aldi-blue/8" : "active:bg-app-field"
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[20px] transition-colors ${
                            active ? "bg-aldi-blue/15" : "bg-app-field"
                          }`}
                          aria-hidden
                        >
                          {s.flag}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-[15.5px] leading-tight font-bold ${
                              active ? "text-aldi-blue" : "text-aldi-navy"
                            }`}
                          >
                            {s.name}
                          </span>
                          <span className="text-app-muted block truncate text-[12.5px] leading-snug font-medium">
                            {s.city} · {s.address}
                          </span>
                        </span>
                        {active ? (
                          <span className="bg-aldi-blue flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white">
                            <Check size={15} weight="bold" />
                          </span>
                        ) : (
                          <span className="border-app-hairline h-6 w-6 shrink-0 rounded-full border" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>,
          target,
        )}
    </>
  );
}
