// Shared chat types used by both the /api/chat route and the UI.

import type { Recipe, RecipeDetail } from "@/lib/api";

/** A single turn shown in the UI. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** Structured data the assistant produced this turn, for rich rendering. */
  artifacts?: ChatArtifacts;
}

/** Rich data extracted from tool calls, rendered as cards beneath a reply. */
export interface ChatArtifacts {
  recipes?: Recipe[];
  recipe?: RecipeDetail;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  message: ChatMessage;
}
