# CoFound

<img src="public/logo.png" alt="CoFound" width="72" height="72">

Web MCP native ideation canvas. Two pieces make one idea.

Live: [cofound-wzks.onrender.com](https://cofound-wzks.onrender.com)

Three fields: **Sponsors**, **Industries**, **Wild cards**. Click two chips to combine them. Download the board when you are done. An agent can run the same moves on the page.

Industries ships with Health, Education, Defense, Finance, Entertainment, Sports, Climate, Legal, Accessibility, Eldercare. Sponsors and Wild cards start empty. Add this weekend’s tools by typing, dropping a `.txt` / `.md` / `.html` list, or an agent calling `add_element` / `ingest_doc`.

## Features

- Two pieces make one idea
- Three colored fields (amber / teal / purple)
- Drop a hackathon or sponsor doc to register stacks named in that file
- SCAMPER on an idea
- Download `ideation-canvas.md`
- Web MCP on the page

## Prerequisites

- Node.js 20.9+

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) or the live app: [cofound-wzks.onrender.com](https://cofound-wzks.onrender.com).

## If you are new

You are looking at three columns.

1. **Sponsors** (amber) is empty. Type this weekend’s tools, drop a txt/md/html sponsor list, or ask an agent to add them.
2. **Industries** (teal) already has Health, Education, and the rest. Click one.
3. **Wild cards** (purple) is empty. Add a constraint. Example: Voice-only.
4. Click a chip in one column, then a chip in another. That is a combine. An idea appears under **Ideas**.
5. Click **Push with SCAMPER** on that idea.
6. Click **Download** for `ideation-canvas.md`.

Double-click a chip to remove it. **Clear** resets the board. Industries come back.

## If you are an agent

```
On Cofound. Map what I say onto the board. Sponsors=tools/APIs. Industries=who it's for. Wild=constraints. Combine a few. Show ideas. Don't invent stacks. Don't reset or download unless I ask.
```

## Web MCP

Agents call `window.WebMCP` or JSON-RPC `postMessage` (`tools/list`, `tools/call`):

| Tool | What it does |
|---|---|
| `list_palette` | List the three fields |
| `add_element` | Add a piece (`kind`: sponsor, industry, or wild) |
| `ingest_doc` | Register stacks named in pasted text |
| `combine` | Combine two pieces by name |
| `list_ideas` | List ideas |
| `scamper` | Run SCAMPER on an idea id |
| `download_canvas` | Download markdown (asks first) |
| `reset_canvas` | Clear the board (asks first) |

## Scripts

| Command | What it runs |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |

## Limits

- Combinations come from the two names you clicked.
- The board is `localStorage` on that browser.
- PDF drop is not supported. Use txt, md, or html.

Deploy notes: [DEPLOYMENT.md](DEPLOYMENT.md).
