"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChatCircleDots,
  House,
  ListChecks,
  Newspaper,
  Tag,
  type Icon,
} from "@phosphor-icons/react";

type NavItem = {
  label: string;
  icon: Icon;
  href?: string; // omitted = placeholder tab (not built yet)
  isNew?: boolean;
};

/**
 * Bottom tab bar. The original ALDI app's fifth tab is "Több" (More) — here it
 * is replaced by the Chatbot, the entry point to the recipe assistant.
 */
const ITEMS: NavItem[] = [
  { label: "Home", icon: House, href: "/" },
  { label: "Offers", icon: Tag },
  { label: "Shopping List", icon: ListChecks },
  { label: "Leaflet", icon: Newspaper },
  { label: "Chatbot", icon: ChatCircleDots, href: "/chatbot", isNew: true },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-app-hairline bg-app-surface border-t px-2 pt-2 pb-5">
      <ul className="flex items-stretch justify-between">
        {ITEMS.map((item) => {
          const active = item.href === pathname;
          const Glyph = item.icon;
          const content = (
            <>
              <span
                className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-aldi-pill" : "bg-transparent"
                }`}
              >
                <Glyph size={23} weight={active ? "fill" : "regular"} />
                {item.isNew && !active && (
                  <span className="bg-aldi-orange ring-app-surface absolute top-1 right-3 h-2 w-2 rounded-full ring-2" />
                )}
              </span>
              <span
                className={`text-[10.5px] leading-tight ${active ? "font-bold" : "font-medium"}`}
              >
                {item.label}
              </span>
            </>
          );

          const className = `flex w-full flex-col items-center gap-1 text-aldi-navy transition-transform active:scale-95 ${
            item.href ? "" : "opacity-100"
          }`;

          return (
            <li key={item.label} className="flex flex-1 justify-center">
              {item.href ? (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={className}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  aria-label={`${item.label} (coming soon)`}
                  className={className}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
