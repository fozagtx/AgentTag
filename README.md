# AgentTag

<img src="public/logo.png" alt="AgentTag" width="72" height="72">

Portfolio tools so an agent can see your work and book a call.

Paste your portfolio URL. AgentTag reads the page and registers three tools:

- `search_work`
- `get_projects`
- `book_call`

Then you drop one script tag on the site.

## Getting started

```bash
npm install
cp .env.example .env.local
# set DATABASE_URL
# set FIRECRAWL_API_KEY if you need JS-rendered pages
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Dashboard: `/dashboard`.

`book_call` uses a scheduler already on the page (Calendly, Cal.com, and similar). It does not invent a booking.

## Scripts

| Command | What it runs |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run db:init` | Create tables against `DATABASE_URL` |
| `npm run relay` | WebSocket / SSE relay |

Deploy notes: [DEPLOYMENT.md](DEPLOYMENT.md).
