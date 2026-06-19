"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CaretLeft, Check, MapPin, Storefront, Trophy } from "@phosphor-icons/react";
import { useStore } from "@/components/StoreProvider";

const EXIT_MS = 220;

type Step = "confirm" | "choose";

/**
 * Asks "are you at the store from the main screen?" before the user commits to a
 * basket. If they're somewhere else, the same sheet slides to a store list —
 * picking the store they're actually in doubles as the confirmation.
 */
export function LocationCheckSheet({
  open,
  premium,
  onClose,
  onConfirm,
}: {
  open: boolean;
  /** Which pricing the user just picked — purely for the sheet's framing copy. */
  premium: boolean;
  onClose: () => void;
  /** Fires with the store the user confirmed they're shopping at. */
  onConfirm: (storeId: number) => void;
}) {
  const { store, storeId, stores, setStoreId } = useStore();

  const [render, setRender] = useState(false);
  const [shown, setShown] = useState(false);
  const [step, setStep] = useState<Step>("confirm");
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal host only exists in the browser DOM
    setTarget(document.getElementById("phone-screen"));
  }, []);

  // Drive enter/exit animation off the controlled `open` prop — mount, then
  // transition in on the next frame; transition out before unmounting.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- syncing animation state with the controlled `open` prop */
    if (open) {
      setRender(true);
      setStep("confirm");
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const id = setTimeout(() => setRender(false), EXIT_MS);
    return () => clearTimeout(id);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open]);

  useEffect(() => {
    if (!render) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [render, onClose]);

  if (!render || !target) return null;

  function pick(id: number) {
    setStoreId(id);
    onConfirm(id);
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm your store"
      className="absolute inset-0 z-50"
    >
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`bg-aldi-navy/35 absolute inset-0 transition-opacity duration-200 ease-out ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sheet */}
      <div
        className={`bg-app-surface absolute inset-x-0 bottom-0 rounded-t-[1.75rem] pb-7 shadow-[0_-12px_40px_-12px_rgba(0,30,80,0.35)] transition-transform duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          shown ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <span className="bg-app-hairline h-1.5 w-10 rounded-full" />
        </div>

        {step === "confirm" ? (
          <div className="px-5 pt-2">
            <span className="bg-aldi-blue/10 mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
              <MapPin size={24} weight="fill" className="text-aldi-blue" />
            </span>
            <h2 className="text-aldi-navy text-[19px] font-extrabold tracking-tight">
              Are you shopping here?
            </h2>
            <p className="text-app-muted mt-1 flex items-center gap-1.5 text-[13px] font-medium">
              {premium ? (
                <>
                  <Trophy size={14} weight="fill" className="text-aldi-orange" />
                  Premium basket
                </>
              ) : (
                "Regular basket"
              )}{" "}
              · prices and the in-store route follow this store.
            </p>

            {/* Current store card */}
            <div className="border-app-hairline bg-app-field mt-4 flex items-center gap-3.5 rounded-2xl border px-3.5 py-3">
              <span className="bg-app-surface flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[20px]">
                {store.flag}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-aldi-navy block text-[15.5px] leading-tight font-bold">
                  {store.name}
                </span>
                <span className="text-app-muted block truncate text-[12.5px] leading-snug font-medium">
                  {store.city} · {store.address}
                </span>
              </span>
              <Storefront size={18} weight="fill" className="text-aldi-blue shrink-0" />
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={() => onConfirm(storeId)}
                className="bg-aldi-blue flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold text-white transition-opacity active:opacity-80"
              >
                <Check size={18} weight="bold" />
                Yes, I&apos;m here
              </button>
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="text-aldi-blue border-aldi-blue/25 w-full rounded-2xl border bg-white py-3.5 text-[15px] font-bold transition-colors active:bg-aldi-blue/5"
              >
                No, I&apos;m at another store
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-3 pt-1 pb-2">
              <button
                type="button"
                aria-label="Back"
                onClick={() => setStep("confirm")}
                className="text-aldi-navy active:bg-app-field flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <div className="min-w-0">
                <h2 className="text-aldi-navy text-[17px] font-extrabold tracking-tight">
                  Where are you shopping?
                </h2>
                <p className="text-app-muted text-[12.5px] font-medium">
                  Pick the store you&apos;re in.
                </p>
              </div>
            </div>

            <ul className="max-h-[46vh] overflow-y-auto px-2">
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
                      {active && (
                        <span className="bg-aldi-blue flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white">
                          <Check size={15} weight="bold" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>,
    target,
  );
}
