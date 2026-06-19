import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/chat/systemPrompt";
import { runTool, TOOLS } from "@/lib/chat/tools";
import type { ChatArtifacts, ChatMessage, ChatRequest, ChatResponse } from "@/lib/chat/types";

// This route talks to OpenAI; never prerender it.
export const dynamic = "force-dynamic";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";
const MAX_TOOL_ROUNDS = 6;

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not set. Add it to .env.local to enable the assistant." },
      { status: 500 },
    );
  }

  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!Array.isArray(body.messages)) {
    return Response.json({ error: "Body must include a `messages` array." }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  // Build the OpenAI message list from the UI history (text only; artifacts are UI-side).
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...body.messages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
  ];

  // Accumulate artifacts produced across all tool calls this turn.
  const artifacts: ChatArtifacts = {};

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages,
        tools: TOOLS,
        temperature: 0.4,
      });

      const choice = completion.choices[0].message;
      messages.push(choice);

      const toolCalls = choice.tool_calls ?? [];
      if (toolCalls.length === 0) {
        const reply: ChatMessage = {
          role: "assistant",
          content: choice.content ?? "",
          artifacts: Object.keys(artifacts).length ? artifacts : undefined,
        };
        return Response.json({ message: reply } satisfies ChatResponse);
      }

      // Execute each requested tool and feed results back to the model.
      for (const call of toolCalls) {
        if (call.type !== "function") continue;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          // Leave args empty; the tool will surface a useful error.
        }
        let result;
        try {
          result = await runTool(call.function.name, args);
        } catch (err) {
          result = {
            content: JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
            artifacts: {},
          };
        }
        Object.assign(artifacts, result.artifacts);
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: result.content,
        });
      }
    }

    // Ran out of tool rounds — return a graceful fallback.
    return Response.json({
      message: {
        role: "assistant",
        content:
          "I'm having trouble finishing that request. Could you rephrase or try one step at a time?",
        artifacts: Object.keys(artifacts).length ? artifacts : undefined,
      },
    } satisfies ChatResponse);
  } catch (err) {
    console.error("[/api/chat] error", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unexpected error talking to the assistant." },
      { status: 500 },
    );
  }
}
