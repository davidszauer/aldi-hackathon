import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

/**
 * The search field doubles as the entry point to the assistant — tapping it
 * opens the chatbot ("How can we help?" → "I fancy pasta").
 */
export function SearchBar() {
  return (
    <Link
      href="/chatbot"
      className="bg-app-field text-aldi-blue active:bg-app-hairline flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors"
      role="search"
      aria-label="Search or ask the assistant"
    >
      <MagnifyingGlass size={22} weight="bold" />
      <span className="text-[17px] font-medium">How can we help?</span>
    </Link>
  );
}
