import { BottomNav } from "./BottomNav";
import { StatusBar } from "./StatusBar";

/**
 * Phone-shaped shell: full-bleed on mobile, a framed device on larger screens.
 * Provides the persistent status bar (top) and bottom nav (bottom); the routed
 * screen renders in the scrollable area between them.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-app-surface sm:border-aldi-navy relative flex h-[100dvh] w-full flex-col overflow-hidden sm:h-[860px] sm:max-h-[92vh] sm:w-[402px] sm:rounded-[2.75rem] sm:border-[11px] sm:shadow-[0_30px_80px_-20px_rgba(0,30,80,0.45)]">
      <StatusBar />
      <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
