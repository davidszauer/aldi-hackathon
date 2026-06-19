# ALDI Recipe-to-Cart Chatbot — agent guide

@AGENTS.md

## What this is

A **hackathon project**. We are building a working prototype of an ALDI shopping-assistant
chatbot: name a dish → get a recipe → resolve ingredients to ALDI products → follow the
shortest route through the store to checkout. Full brief and task breakdown live in
[`task.md`](./task.md).

## Mindset: ship a working prototype, fast

Speed and a working demo beat polish. This is **not** an enterprise codebase, and it does not
need to be.

- **Optimize for "it works in the demo," not for production hardening.** A feature that runs
  end-to-end beats a perfectly architected one that is half-built.
- **It's fine to cut corners** that don't affect the demo: skip exhaustive error handling,
  abstractions, and config that a real product would need. Hardcode sensible defaults, leave
  a `// TODO` and move on.
- **No premature abstraction.** Don't build a framework. Don't add a layer "for later."
  Write the direct version first; refactor only when it actually hurts.
- **Don't add infrastructure we didn't ask for** — no database, no auth, no CI, no Docker, no
  test suite, no state-management library — unless it's needed to make the demo work.
- **Prefer the boring, fast path.** Use what's already installed. Reach for a new dependency
  only when it clearly saves time.
- **When unsure, pick the option that demos sooner** and note the trade-off in one line.

What we still care about (cheap, keeps us moving):
- The app **builds and runs** (`pnpm build`, `pnpm dev` stay green).
- TypeScript and lint stay clean enough to not slow people down (`pnpm typecheck`, `pnpm lint`).
- Code is readable so teammates can pick up any workstream from `task.md`.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — brand tokens in `src/app/globals.css` (ALDI palette, light-mode locked)
- **OpenAI** (function/tool calling) for the chatbot — **server-side only**, never expose
  `OPENAI_API_KEY` to the client
- **No database** — all catalog data comes from the hosted ALDI Hackathon API
  (`ALDI_API_BASE_URL`, default `https://hackhaton.internal.zrcn.dev`)
- **pnpm** is the package manager — use `pnpm`, never `npm`/`yarn`

## Commands

```bash
pnpm dev         # dev server (Turbopack)
pnpm build       # production build
pnpm lint        # eslint
pnpm typecheck   # tsc --noEmit
pnpm format      # prettier --write .
```

## Conventions

- App code lives in `src/`: routes in `src/app`, shared UI in `src/components`, helpers and
  data in `src/lib`.
- The UI is a mobile-app mock framed by `PhoneFrame` (status bar + bottom nav). The bottom
  nav's **Chatbot** tab is our feature (it replaced the original ALDI app's "More" tab).
- All app copy is in **English**.
- Use **ALDI brand colors** via the Tailwind tokens (`aldi-navy`, `aldi-blue`, `aldi-pill`,
  etc.) rather than ad-hoc hex values.

## 4. Communication

- *Always use AskUserQuestion* when asking the user anything. Never ask questions in plain text. Always use the tool so the user can select from options rather than type free-form answers. Provide 2–4 concrete options; include "Other" implicitly (the tool adds it automatically). This applies to clarifications, design choices, ambiguities — everything.
