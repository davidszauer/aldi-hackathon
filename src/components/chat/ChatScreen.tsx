"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkle } from "@phosphor-icons/react";
import type { Recipe } from "@/lib/api";
import type { ChatMessage, ChatResponse } from "@/lib/chat/types";
import { StoreSwitcher } from "@/components/StoreSwitcher";
import { RecipeOptions } from "./RecipeOptions";
import { ShopCard, type ShopSeed } from "./ShopCard";

type UiMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  recipes?: Recipe[];
  shop?: ShopSeed;
};

const SUGGESTIONS = ["I fancy a salad", "Something with chicken", "Quick pasta dinner"];

const GREETING: UiMessage = {
  id: 0,
  role: "assistant",
  content:
    "Hi! Tell me a dish you fancy and I'll find ALDI recipes, fill the basket, and keep it cheap (or boost ALDI's margin if you like 🏆).",
};

let nextId = 1;

export function ChatScreen() {
  const [messages, setMessages] = useState<UiMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeRecipeId, setActiveRecipeId] = useState<number>();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the latest turn in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMsg: UiMessage = { id: nextId++, role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setSending(true);

    // Only text turns go to the model; cards are UI-side.
    const payload: ChatMessage[] = history
      .filter((m) => m.content)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      const data = (await res.json()) as ChatResponse & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Request failed");

      const { message } = data;
      const reply: UiMessage = {
        id: nextId++,
        role: "assistant",
        content: message.content,
        recipes: message.artifacts?.recipes,
      };
      const recipe = message.artifacts?.recipe;
      if (recipe) {
        reply.shop = {
          recipeId: recipe.recipe.id,
          name: recipe.recipe.name,
          basePortions: recipe.recipe.base_portions,
          portions: recipe.portions,
          excludePantry: recipe.exclude_pantry,
        };
        setActiveRecipeId(recipe.recipe.id);
      }
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId++,
          role: "assistant",
          content: "Sorry, I lost that one. Mind trying again?",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function pickRecipe(recipe: Recipe) {
    setActiveRecipeId(recipe.id);
    setMessages((prev) => [
      ...prev,
      {
        id: nextId++,
        role: "assistant",
        content: `Here's your ALDI basket for ${recipe.name}. Tweak the portions, skip the staples, or flip on ALDI's profit-optimised picks.`,
        shop: { recipeId: recipe.id, name: recipe.name, basePortions: recipe.base_portions },
      },
    ]);
  }

  const showSuggestions = messages.length === 1;

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="border-app-hairline flex items-center gap-3 border-b px-5 py-3.5">
        <span className="bg-aldi-blue/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <Sparkle size={22} weight="fill" className="text-aldi-blue" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-aldi-navy block text-[16px] font-bold">Recipe Assistant</span>
          <span className="text-app-muted block text-[12px] font-medium">
            Dish to basket, the ALDI way
          </span>
        </span>
        <StoreSwitcher />
      </div>

      {/* Conversation */}
      <div ref={scrollerRef} className="flex-1 space-y-4 px-4 py-5">
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="bg-aldi-blue max-w-[82%] rounded-2xl rounded-tr-md px-4 py-2.5 text-[15px] leading-relaxed text-white">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id}>
              {m.content && (
                <div className="bg-app-field text-aldi-navy max-w-[88%] rounded-2xl rounded-tl-md px-4 py-3 text-[15px] leading-relaxed">
                  {m.content}
                </div>
              )}
              {m.recipes && (
                <RecipeOptions recipes={m.recipes} activeId={activeRecipeId} onPick={pickRecipe} />
              )}
              {m.shop && <ShopCard seed={m.shop} />}
            </div>
          ),
        )}

        {showSuggestions && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => send(text)}
                className="border-aldi-blue/30 text-aldi-blue active:bg-aldi-blue/5 rounded-full border bg-white px-3.5 py-2 text-[14px] font-semibold transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        {sending && (
          <div className="bg-app-field flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-md px-4 py-3.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="bg-aldi-blue/50 h-2 w-2 animate-bounce rounded-full"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="border-app-hairline border-t px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="bg-app-field flex items-center gap-2 rounded-2xl px-4 py-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me a dish you fancy…"
            className="text-aldi-navy placeholder:text-app-muted min-w-0 flex-1 bg-transparent text-[15px] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            aria-label="Send"
            className="bg-aldi-blue flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
          >
            <ArrowUp size={18} weight="bold" />
          </button>
        </form>
      </div>
    </div>
  );
}
