# ALDI Hackathon — Recipe-to-Cart Chatbot

> **What we're building:** A chatbot where the user names a dish ("I fancy pasta"),
> the bot suggests recipes, resolves every ingredient to real ALDI products (with
> size & price options), and plots the **shortest route** through a 9×9 store grid to
> collect every ingredient and reach the checkout.
>
> **Bonus points 🏆:** maximize ALDI's margin, and ask smart questions (portions,
> skip pantry staples).

---

## Decisions (locked)

- **Stack:** Next.js 16 (App Router) + TypeScript, **pnpm** as the package manager.
  **No database** — we consume the hackathon REST API directly. _(Original "Postgres webapp" idea dropped per team call.)_
- **Chatbot brain:** OpenAI API with **function/tool calling**. The model's tools map
  1:1 to our typed API client (recipes, products, stores, grid, route-plan).
- **Data source / Base URL:** `https://hackhaton.internal.zrcn.dev` — JSON, CORS open,
  no auth. OpenAPI doc at `/api/openapi`.
- **Secrets:** `OPENAI_API_KEY` in `.env.local` (server-side only — never ship to client).

> If any decision above is wrong, fix it here first — the tasks below assume it.

---

## How to use this file

Every line item is a checkable todo. Pick a workstream, put your name on it, check
boxes as you go. Workstreams 1–2 unblock everything else, so grab those first.

---

## 0. Coordination

- [ ] Create the GitHub repo / confirm everyone has push access _(owner: )_
- [ ] Agree branch strategy (e.g. short-lived branches → PR into `main`) _(owner: )_
- [ ] Share one `OPENAI_API_KEY` for the team (or one per dev) _(owner: )_
- [ ] Pick demo recipe(s) + store to rehearse with (e.g. recipe 1 "Spaghetti Bolognese" @ store 1) _(owner: )_
- [ ] Assign workstream owners (1 Setup, 2 API layer, 3 Chatbot, 4 UI, 5 Bonus) _(owner: )_

---

## 1. Project setup & infrastructure ✅ DONE

- [x] Scaffold Next.js 16 app with pnpm (App Router, TypeScript, ESLint, Turbopack) — Next 16.2.9 + React 19.2.4
- [x] Pin the package manager: `"packageManager": "pnpm@11.5.1"` in `package.json`; `pnpm-lock.yaml` present; native builds allowlisted in `pnpm-workspace.yaml` (`sharp`, `unrs-resolver`)
- [x] Add Tailwind CSS v4 + base layout/theme — ALDI brand tokens in `src/app/globals.css`, light-mode locked
- [x] Add Prettier + lint scripts; agree on formatting — `.prettierrc.json` (+ tailwind plugin), `.prettierignore`
- [x] Create `.env.local` + `.env.example` with `OPENAI_API_KEY` and `ALDI_API_BASE_URL`
- [x] Add `README.md` (run instructions, env vars, scripts — all using pnpm)
- [x] Install deps: `openai`, `zod`, `@phosphor-icons/react`
- [x] Confirm `pnpm dev` boots cleanly — verified (HTTP 200, no console errors, screenshots taken)
- [ ] (Optional) Set up deploy target (Vercel / container) for the live demo _(owner: )_

### App-mock screen (built this round, from `app-mock.jpeg`)

- [x] Home screen recreated in English with ALDI brand colors (`/`)
- [x] Bottom nav with **Chatbot** replacing the "Több" (More) tab
- [x] `/chatbot` stub screen (chat shell — OpenAI wiring is workstream 3)
- Components: `PhoneFrame`, `StatusBar`, `BottomNav`, `AldiMark`, `SearchBar`, `CategoryTabs`, `CategoryGrid`; category data in `src/lib/categories.ts`

---

## 2. API client & types layer (unblocks 3, 4, 5) # Andras

> Wrap the hackathon API in one typed module. Everything else imports from here.

- [x] Define TypeScript types for all responses: `Category`, `Product`, `Recipe`, `RecipeDetail`, `Ingredient`, `ProductOption`, `Store`, `Grid`, `Cell`, `RoutePlan`, `RouteStop` _(owner: Andras)_ — `src/lib/api/types.ts`
- [x] Build a typed `fetch` wrapper (base URL from env, error handling, JSON parse) _(owner: Andras)_ — `apiGet` in `src/lib/api/client.ts` (`AldiApiError` on non-2xx)
- [x] `getCategories()` → `GET /api/categories` _(owner: Andras)_
- [x] `getProducts({ category_id?, sort?, q?, ... })` → `GET /api/products` (supports `sort=margin`, `sort=price`) _(owner: Andras)_
- [x] `getRecipes({ q?, tag? })` → `GET /api/recipes` (search by dish/ingredient) _(owner: Andras)_
- [x] `getRecipe(id, { portions?, exclude_pantry? })` → `GET /api/recipes/{id}` (returns scaled amounts + `product_options` + `cheapest_option_id` + `max_profit_option_id` per ingredient) _(owner: Andras)_
- [x] `getStores()` → `GET /api/stores` _(owner: Andras)_
- [x] `getStore(id)` + `getStoreGrid(id)` → `GET /api/stores/{id}` and `/grid` _(owner: Andras)_
- [x] `getRoutePlan(storeId, { recipe_id, exclude_pantry? })` → `GET /api/stores/{id}/route-plan` (returns `stops[]`, `path[]`, `total_steps`) _(owner: Andras)_
- [x] (Optional) Cache catalog responses in-memory to cut latency during the demo _(owner: Andras)_ — `cache: "force-cache"` on every GET

---

## 3. Chatbot (OpenAI function calling) ✅ DONE (food → recipe → shop)

> Conversation flow: **say what you like → pick a recipe → resolve products into a basket**.
> Route step deferred (out of scope per demo decision — see task 4).

- [x] Create server route handler `POST /api/chat` (returns assistant turns + artifacts; keeps `OPENAI_API_KEY` server-side) — `src/app/api/chat/route.ts`
- [x] Write the system prompt (ALDI shopping assistant; intent → pick → interactive basket; cards do the heavy lifting) — `src/lib/chat/systemPrompt.ts`
- [x] Define OpenAI **tools** mapping to the API client — `src/lib/chat/tools.ts`
  - [x] `search_recipes(query)` → `getRecipes`
  - [x] `get_recipe(recipe_id, portions, exclude_pantry)` → `getRecipe`
  - [ ] `list_stores()` / `plan_route()` — dropped from chat (route out of scope; store is global app context)
- [x] Implement the tool-dispatch loop (model requests tool → API client → feed result back → continue)
- [x] **Step 1 — intent:** user names a dish/ingredient → bot returns matching recipe options (rendered as cards)
- [x] **Step 2 — recipe pick:** tapping a card opens the interactive basket (ingredients → ALDI products)
- [x] **Smart question — portions:** basket has a live portions stepper (`portions` rescales amounts/packs)
- [x] **Smart question — pantry:** "Skip pantry staples" toggle (`exclude_pantry=true`), on by default
- [x] Handle no-match gracefully (prompt says so; empty search returns a friendly nudge)
- [x] Conversation state: text history sent to the model each turn; selected recipe tracked UI-side

---

## 4. Frontend UI ✅ DONE (food → recipe → shop; route deferred)

> Built as a chatbot, not a static wizard. Cards render inline in the conversation;
> basket controls re-fetch the ALDI API directly (CORS-open) for instant tweaks, no LLM lag.
> Components in `src/components/chat/`: `ChatScreen`, `RecipeOptions`, `ShopCard`.

- [x] Chat interface: message list, input box, typing indicator — `ChatScreen.tsx`
- [x] Render **recipe option cards** (name, cuisine, prep time, tags, portions) — `RecipeOptions.tsx`
- [x] Render **basket**: ingredient → ALDI product, size/options count, `line_price`; global **cheapest ↔ max-profit** toggle — `ShopCard.tsx`
- [x] **Store** shown as shopping context (global `StoreSwitcher` in the chat header)
- [ ] **Store grid / route overlay** — out of scope for this pass (demo stops at the basket)
- [x] **Basket summary**: line items + **Cheapest basket** total and **Profit-optimised** total with **ALDI margin €X**
- [ ] Checkout summary screen — deferred with the route
- [x] Responsive layout (mobile-first inside `PhoneFrame`; framed device on ≥640px)
- [x] Loading (skeleton rows) + error states in the basket card

---

## 5. Bonus features 🏆

> Worth extra points. The recipe endpoint already does the heavy lifting.

- [x] **Maximize ALDI margin:** profit-optimised mode uses each ingredient's `max_profit_option_id`; basket surfaces total `line_margin` ("ALDI margin €X")
- [x] Let user toggle **cheapest vs. max-profit** basket — both totals shown side by side, tappable to switch the line items
- [x] **Portion scaling** wired end-to-end (live stepper → `?portions=N` changes `scaled_amount` & `packs_needed`)
- [x] **Skip pantry staples** toggle (`exclude_pantry=true`) reflected in the basket (on by default)
- [ ] (Stretch) "Highest-margin products" insight panel using `GET /api/products?sort=margin` _(owner: )_

---

## 6. Testing & QA

- [ ] Type-check passes (`pnpm exec tsc --noEmit`) and lint is clean (`pnpm lint`) _(owner: )_
- [ ] Manual run of the full happy path: dish → recipe → products → store → route _(owner: )_
- [ ] Verify route `stops[]` match the recipe's required categories; `path` starts at entrance, ends at checkout _(owner: )_
- [ ] Verify portions scaling and pantry exclusion change the basket correctly _(owner: )_
- [ ] Test edge cases: unknown dish, recipe with unavailable category, empty basket _(owner: )_
- [ ] Confirm `OPENAI_API_KEY` is never exposed to the browser (server-only) _(owner: )_
- [ ] Cross-browser / projector resolution check before the demo _(owner: )_

---

## 7. Demo & deployment

- [ ] Deploy to a public URL (Vercel/container) with env vars set _(owner: )_
- [ ] Write a 2–3 minute demo script hitting all 3 flow steps + both bonuses _(owner: )_
- [ ] Pre-load / rehearse the demo recipe + store so it's snappy live _(owner: )_
- [ ] Prepare a one-slide architecture diagram (Next.js → OpenAI tools → ALDI API) _(owner: )_
- [ ] Backup plan: screen recording of the working flow in case of network issues _(owner: )_

---

## Acceptance criteria (Definition of Done)

- [ ] User can type a dish in plain language and get recipe suggestions
- [ ] Selecting a recipe shows every ingredient resolved to ALDI products with sizes & prices
- [ ] Selecting a store renders the 9×9 grid with the shortest route drawn, ending at checkout
- [ ] Bot asks about portions and offers to skip pantry staples
- [ ] Basket can be optimized for ALDI margin, with the number shown
- [ ] App runs from a clean checkout with just `OPENAI_API_KEY` set

---

## Reference — API endpoints

Base URL: `https://hackhaton.internal.zrcn.dev`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/categories` | All 16 product categories |
| GET | `/api/products` | Products; filter by `category_id`, `q`, price; `sort=price` / `sort=margin` |
| GET | `/api/recipes` | Recipes; search `?q=`, filter by tag |
| GET | `/api/recipes/{id}` | Recipe + product options; `?portions=N`, `?exclude_pantry=true`; gives `cheapest_option_id` & `max_profit_option_id` per ingredient |
| GET | `/api/stores` | All 5 stores |
| GET | `/api/stores/{id}` | A single store |
| GET | `/api/stores/{id}/grid` | 9×9 grid: cells `{x,y,categories[]}`, entrance, checkout |
| GET | `/api/stores/{id}/route-plan` | Shortest route: `?recipe_id=N&exclude_pantry=true` → `stops[]`, `path[]`, `total_steps` |
| GET | `/api/openapi` | OpenAPI 3.0 document |

**Handy examples**
```
GET /api/recipes?q=pasta
GET /api/recipes/1?portions=6&exclude_pantry=true
GET /api/products?category_id=4&sort=price
GET /api/products?sort=margin
GET /api/stores/2/grid
GET /api/stores/2/route-plan?recipe_id=3&exclude_pantry=true
```

## Reference — data model

```
Recipe
 └─ ingredient (amount, unit, category_id, pantry_staple?)
     └─ Products (≥2 size/price options per ingredient)
         └─ price, wholesale_price  → margin = price − wholesale_price

Store ─ 9×9 Grid ─ Cell { x, y, categories[] }
 └─ exactly one entrance + one checkout
 └─ route-plan visits ingredient category cells → ends at checkout
```

**Guarantees**
- Every store grid contains all 16 categories.
- Exactly one cell is the checkout; one is the entrance.
- Every ingredient has multiple ALDI products in different sizes & prices.
- Every product carries a `wholesale_price` for profit logic.
