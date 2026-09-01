# AgentTag

<img src="public/logo.png" alt="AgentTag" width="72" height="72">

One script tag so agents can read, search, and act on a live website.

Paste a URL. AgentTag reads the page, registers only the MCP tools that page actually supports, and gives you an embed plus a Claude Desktop / Cursor config.

## What it does

- Crawls the submitted URL (Firecrawl when `FIRECRAWL_API_KEY` is set, otherwise a live HTTP fetch)
- Registers tools from that snapshot: `search_docs` always; code, API, pricing, checkout, or booking only if they appear on the page
- Dashboard to list sites, activity, and tools
- Studio to toggle tools, try a call against the snapshot, and copy the script tag

It does not invent tools, metrics, or page content.

## Stack

Next.js 16 (App Router), React 19, Postgres via `DATABASE_URL`, optional Firecrawl.

## Prerequisites

- Node.js 20.9+
- `npm install`

`DATABASE_URL` is required for persistence. Without it, the app falls back to in-memory storage (lost on restart).

## Getting started

```bash
npm install
cp .env.example .env.local
# set DATABASE_URL
# set FIRECRAWL_API_KEY if you need JS-rendered pages
npm run db:init   # optional; tables are also created on first query
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port Next prints). Dashboard: `/dashboard`.

## Usage

1. Open `/dashboard` and add a site URL.
2. Wait for the crawl. Tools on the card are the ones detected on that page.
3. Open the site in Studio to try a tool or copy the embed:

```html
<script src="https://cdn.agenttag.io/client.js" data-site-id="YOUR_SITE_ID"></script>
```

4. Point Claude Desktop or Cursor at the relay:

```json
{
  "mcpServers": {
    "my-website": {
      "url": "https://relay.agenttag.io/mcp/YOUR_SITE_ID"
    }
  }
}
```

Local relay (optional, for live agent connections):

```bash
npm run relay
```

## Scripts

| Command | What it runs |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run db:init` | Create tables against `DATABASE_URL` |
| `npm run relay` | WebSocket / SSE relay (`tsx relay/server.ts`) |

## Configuration

Copy from `.env.example`:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | For persistence | Pooled Postgres connection string |
| `FIRECRAWL_API_KEY` | No | JS-rendered pages. Local: `.env.local`. Render: env group `agenttag` (once) |
| `NEXT_PUBLIC_RELAY_URL` | No | Defaults in `.env.example` |
| `NEXT_PUBLIC_CDN_URL` | No | Defaults in `.env.example` |

Deploy notes: [DEPLOYMENT.md](DEPLOYMENT.md). Render blueprint: `render.yaml`.

## Limits

- Tools come from the crawled page, not a fixed catalog. A site with no code samples will not get `get_code_example`.
- Without Firecrawl, some JS-only docs will fail to read.
- In-memory fallback is for local runs without `DATABASE_URL`. Do not use it as production storage.
- Studio “Run” executes against the stored markdown snapshot, not a live browser session, unless the relay and embed are connected.
