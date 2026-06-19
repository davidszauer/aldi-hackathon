import { BatteryFull, CellSignalFull, WifiHigh } from "@phosphor-icons/react/dist/ssr";

/** Faux iOS status bar — device chrome to sell the app-mock framing. */
export function StatusBar() {
  return (
    <div className="text-aldi-navy flex items-center justify-between px-7 pt-3 pb-1 sm:pt-[15px]">
      <span className="w-[54px] text-[15px] font-semibold tracking-tight tabular-nums sm:text-center">
        9:41
      </span>
      <div className="flex items-center gap-1.5">
        <CellSignalFull size={17} weight="fill" />
        <span className="text-[11px] font-semibold">5G</span>
        <WifiHigh size={17} weight="fill" />
        <BatteryFull size={22} weight="fill" />
      </div>
    </div>
  );
}
