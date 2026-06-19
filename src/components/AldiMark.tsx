import Image from "next/image";

/**
 * ALDI brand logo — the official boxed ALDI SÜD mark (navy field, layered
 * colour border, stripe emblem + wordmark). Served as a static asset from
 * `public/brand/aldi-logo.svg`; intrinsic ratio is 82.4 × 98.9.
 */
export function AldiMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/brand/aldi-logo.svg"
      alt="ALDI"
      width={29}
      height={35}
      priority
      unoptimized
      className={`h-9 w-auto ${className}`}
    />
  );
}
