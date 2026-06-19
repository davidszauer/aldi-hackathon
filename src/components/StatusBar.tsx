import { BatteryFull, CellSignalFull, WifiHigh } from "@phosphor-icons/react/dist/ssr";

/** Faux iOS status bar — device chrome to sell the app-mock framing. */
export function StatusBar() {
  return (
    <div className="text-aldi-navy flex items-center justify-between px-6 pt-3 pb-1">
      <span className="text-[15px] font-semibold tracking-tight tabular-nums">9:41</span>
      <div className="flex items-center gap-1.5">
        <CellSignalFull size={17} weight="fill" />
        <span className="text-[11px] font-semibold">5G</span>
        <WifiHigh size={17} weight="fill" />
        <BatteryFull size={22} weight="fill" />
      </div>
    </div>
  );
}
