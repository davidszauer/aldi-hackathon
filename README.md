# ALDI Recipe-to-Cart Chatbot

A shopping-assistant chatbot for the ALDI Hackathon. Name a dish, get a recipe, resolve every
ingredient to real ALDI products, and follow the shortest route through the store to checkout.

See [`task.md`](./task.md) for the full delegated task breakdown and the challenge brief.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **OpenAI** (function/tool calling) for the chatbot — server-side only
- **No database** — data comes from the hosted ALDI Hackathon REST API
- **pnpm** as the package manager

## Getting started

Requires Node 20+ and pnpm.

```bash
pnpm install
cp .env.example .env.local   # then add your OPENAI_API_KEY
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | OpenAI key for the chatbot. Server-side only — never exposed to the client. |
| `ALDI_API_BASE_URL` | Base URL of the ALDI Hackathon API (default `https://hackhaton.internal.zrcn.dev`). |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server (Turbopack). |
| `pnpm build` | Production build. |
| `pnpm start` | Run the production build. |
| `pnpm lint` | ESLint. |
| `pnpm typecheck` | `tsc --noEmit`. |
| `pnpm format` | Format with Prettier. |
| `pnpm format:check` | Check formatting. |

## Data source

All catalog data (categories, products, recipes, stores, grids, route plans) comes from the
hosted API at `ALDI_API_BASE_URL`. See `task.md` for the endpoint reference and data model.
