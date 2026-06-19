/**
 * Compact ALDI brand mark — a simple geometric emblem (ascending bars in the
 * ALDI stripe colors) next to the wordmark. An approximation of the brand for
 * this hackathon mock, not the trademarked logo.
 */
export function AldiMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="26" height="26" rx="7" fill="var(--color-aldi-navy)" />
        <rect x="6" y="14" width="3.2" height="6" rx="1" fill="var(--color-aldi-sky)" />
        <rect x="11.4" y="10" width="3.2" height="10" rx="1" fill="var(--color-aldi-orange)" />
        <rect x="16.8" y="6" width="3.2" height="14" rx="1" fill="var(--color-aldi-red)" />
      </svg>
      <span className="text-aldi-navy text-[19px] font-extrabold tracking-tight">ALDI</span>
    </span>
  );
}
