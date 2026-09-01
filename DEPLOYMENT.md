# Deploy AgentTag

Web (`agenttag-web`) and relay (`agenttag-relay`) share one Postgres and one Firecrawl key. Those values belong in a single Render Environment Group, not copied onto each service.

Crawl code is also one module: `lib/firecrawl.ts`. The web app calls it when you add a site. The relay calls it when an agent runs a tool with no live browser tab. Same function, two call sites.

## 1. Postgres

You need a pooled `DATABASE_URL` (Neon or any Postgres that speaks the same URL).

Optional local check:

```bash
DATABASE_URL="postgres://user:pass@host/db?sslmode=require" npm run db:init
```

Tables are also created on first query.

## 2. Render Environment Group

1. Open [Render](https://dashboard.render.com) → **Environment Groups** → **New Environment Group**.
2. Name it exactly `agenttag`.
3. Add these keys once:

| Key | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Pooled Postgres connection string |
| `FIRECRAWL_API_KEY` | For JS-rendered pages | Firecrawl scrape key |

Do not add `NODE_ENV`, `PORT`, `NEXT_PUBLIC_RELAY_URL`, or `NEXT_PUBLIC_CDN_URL` here. Those stay per-service in `render.yaml`.

If this Blueprint is already live and each service still has its own `DATABASE_URL` / `FIRECRAWL_API_KEY`, delete those **service-level** copies after the group is linked. A service-level value overrides the group.

## 3. Blueprint deploy

1. Push this repo to GitHub.
2. Render Dashboard → **New +** → **Blueprint**.
3. Connect the repo. Render reads `render.yaml` and creates:
   - `agenttag-web` (Next.js dashboard and API)
   - `agenttag-relay` (WebSocket / SSE for Claude Desktop and Cursor)
4. Both services use `fromGroup: agenttag`. Create that group before or right after the first apply.

## 4. Manual web service (no Blueprint)

Only if you skip the Blueprint. Prefer the group, then link it to the service:

- Name: `agenttag-web`
- Runtime: Node
- Build: `npm install && npm run build`
- Start: `npm run start`
- Link group `agenttag`
- Service env: `NODE_ENV=production`

Repeat for `agenttag-relay` with start `npm run relay` and `PORT=10000`.

## 5. Check it

1. Open the web service URL.
2. Go to `/dashboard` and add a real site URL.
3. The crawl result and tools should match that page. Empty dashboard is correct until you add a site.

## Local

```bash
cp .env.example .env.local
# set DATABASE_URL
# set FIRECRAWL_API_KEY if you need JS-rendered pages
npm run dev          # web
npm run relay        # optional, for live agent connections
```

`.env.local` is the local equivalent of the `agenttag` group: one file, both processes.
