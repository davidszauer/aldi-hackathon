import Link from "next/link";
import { ArrowRight, ForkKnife } from "@phosphor-icons/react/dist/ssr";
import { AldiMark } from "@/components/AldiMark";
import { CategoryGrid } from "@/components/CategoryGrid";
import { CategoryTabs } from "@/components/CategoryTabs";
import { PhoneFrame } from "@/components/PhoneFrame";
import { SearchBar } from "@/components/SearchBar";
import { StoreSwitcher } from "@/components/StoreSwitcher";

export default function Home() {
  return (
    <PhoneFrame>
      <header className="flex items-center justify-between px-5 pt-2 pb-3">
        <AldiMark />
        <StoreSwitcher />
      </header>

      <div className="px-5">
        <SearchBar />
      </div>

      {/* Feature highlight: entry point to the recipe assistant (the product). */}
      <div className="px-5 pt-4 pb-1">
        <Link
          href="/chatbot"
          className="bg-aldi-navy flex items-center gap-4 rounded-2xl px-4 py-4 text-white transition-transform active:scale-[0.98]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
            <ForkKnife size={24} weight="fill" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] leading-snug font-bold">What is for dinner?</span>
            <span className="block text-[13px] leading-snug text-white/75">
              Tell the assistant a dish. We fill your cart and map the route.
            </span>
          </span>
          <ArrowRight size={20} weight="bold" className="shrink-0" />
        </Link>
      </div>

      <div className="border-app-hairline mt-4 border-b">
        <CategoryTabs />
      </div>

      <section className="px-5 pt-7 pb-2 text-center">
        <h1 className="text-aldi-navy text-[34px] font-extrabold tracking-tight">Products</h1>
        <p className="text-app-muted mt-1 text-[15px] font-medium">High quality at low prices</p>
      </section>

      <CategoryGrid />
    </PhoneFrame>
  );
}
