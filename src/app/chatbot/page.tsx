import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { PhoneFrame } from "@/components/PhoneFrame";
import { StoreSwitcher } from "@/components/StoreSwitcher";

const SUGGESTIONS = ["I fancy pasta", "Something with chicken", "Quick dinner for 2"];

export default function ChatbotPage() {
  return (
    <PhoneFrame>
      <div className="flex min-h-full flex-col">
        {/* Assistant header */}
        <div className="border-app-hairline flex items-center gap-3 border-b px-5 py-3.5">
          <span className="bg-aldi-blue/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <Sparkle size={22} weight="fill" className="text-aldi-blue" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-aldi-navy block text-[16px] font-bold">Recipe Assistant</span>
            <span className="text-app-muted block text-[12px] font-medium">
              Find a recipe, fill the cart, map the route
            </span>
          </span>
          <StoreSwitcher />
        </div>

        {/* Conversation */}
        <div className="flex-1 space-y-4 px-5 py-5">
          <div className="bg-app-field max-w-[85%] rounded-2xl rounded-tl-md px-4 py-3">
            <p className="text-aldi-navy text-[15px] leading-relaxed">
              Hi! Tell me a dish you love. I will suggest recipes, pick the right ALDI products, and
              map the shortest route through the store to checkout.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((text) => (
              <button
                key={text}
                type="button"
                className="border-aldi-blue/30 text-aldi-blue active:bg-aldi-blue/5 rounded-full border bg-white px-3.5 py-2 text-[14px] font-semibold transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* Composer (wiring to OpenAI lands in workstream 3) */}
        <div className="border-app-hairline border-t px-4 py-3">
          <div className="bg-app-field flex items-center gap-2 rounded-2xl px-4 py-2.5">
            <input
              type="text"
              disabled
              placeholder="Tell me a dish you love..."
              className="text-aldi-navy placeholder:text-app-muted min-w-0 flex-1 bg-transparent text-[15px] focus:outline-none"
            />
            <span className="bg-aldi-blue/40 flex h-9 w-9 items-center justify-center rounded-full text-white">
              <ArrowRight size={18} weight="bold" />
            </span>
          </div>
          <p className="text-app-muted mt-2 text-center text-[12px] font-medium">
            Assistant coming soon
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
