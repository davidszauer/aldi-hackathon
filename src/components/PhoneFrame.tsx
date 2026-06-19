import { BottomNav } from "./BottomNav";
import { StatusBar } from "./StatusBar";

/**
 * iPhone-style device shell. Full-bleed on phones; on larger screens it becomes
 * a framed "blue titanium" iPhone — a nod to the ALDI navy — with a Dynamic
 * Island, machined side buttons, concentric screen corners, and a home
 * indicator. The chrome is purely cosmetic and only paints in at `sm:`.
 *
 * Layer order (outer → inner):
 *   titanium rail → black bezel → screen (rounded, clips the app).
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-[100dvh] w-full justify-center sm:h-auto">
      {/* Titanium rail — only the outer 3px of metal shows around the bezel. */}
      <div className="device-rail relative flex h-[100dvh] w-full flex-col sm:h-[860px] sm:max-h-[94vh] sm:w-[398px] sm:rounded-[3.6rem] sm:p-[3px]">
        {/* Machined side buttons — silent the OS draws them; we draw the metal. */}
        <span className="device-button hidden sm:block sm:absolute sm:-left-[2px] sm:top-[112px] sm:h-[30px] sm:w-[3px] sm:rounded-l-[2px]" />
        <span className="device-button hidden sm:block sm:absolute sm:-left-[2px] sm:top-[176px] sm:h-[56px] sm:w-[3px] sm:rounded-l-[2px]" />
        <span className="device-button hidden sm:block sm:absolute sm:-left-[2px] sm:top-[246px] sm:h-[56px] sm:w-[3px] sm:rounded-l-[2px]" />
        <span className="device-button hidden sm:block sm:absolute sm:-right-[2px] sm:top-[208px] sm:h-[82px] sm:w-[3px] sm:rounded-r-[2px]" />

        {/* Black bezel. */}
        <div className="relative flex h-full w-full flex-col sm:rounded-[3.45rem] sm:bg-black sm:p-[11px]">
          {/* Screen — clips the running app to the rounded glass. Also the portal
              host for in-app overlays (e.g. the store picker sheet). */}
          <div
            id="phone-screen"
            className="bg-app-surface relative flex h-full w-full flex-col overflow-hidden sm:rounded-[2.75rem]"
          >
            <StatusBar />
            <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
            <BottomNav />

            {/* Home indicator. */}
            <span className="pointer-events-none absolute bottom-[7px] left-1/2 hidden h-[5px] w-[128px] -translate-x-1/2 rounded-full bg-aldi-navy/35 sm:block" />

            {/* Dynamic Island — sits over the status bar's center gap. */}
            <div className="pointer-events-none absolute left-1/2 top-[11px] hidden h-[33px] w-[118px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[9px] sm:flex">
              {/* Front camera lens with a faint blue catch-light. */}
              <span className="relative h-[11px] w-[11px] rounded-full bg-[#05080f]">
                <span className="absolute right-[1.5px] top-[1.5px] h-[4px] w-[4px] rounded-full bg-aldi-sky/40" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
