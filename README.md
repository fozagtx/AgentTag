# CoFound

<img src="public/logo.png" alt="CoFound" width="72" height="72">

Ideation canvas for first-time founders and hackathon teams. Combine sponsor tools with a problem space, then download what you made.

Live: [cofound-wzks.onrender.com](https://cofound-wzks.onrender.com)

The method is [Little Alchemy ideation](https://thehackathonplaybook.dev/playbook/ideation) from The Hackathon Playbook. No account. No database. State stays in the browser.

## Features

- Empty canvas on purpose. An agent fills stacks with `add_element`, or you drop a sponsor / hackathon doc
- Type a stack in the header if you want to add one by hand
- Click two pieces on the canvas to combine them into an idea
- SCAMPER on an idea when you want to push it
- Download a markdown file of the canvas
- In-page Web MCP so an agent can run the same actions

## Prerequisites

- Node.js 20.9+
- `npm install`

## Getting started

```bash
npm install
npm run dev
```

Open the URL Next prints (often [http://localhost:3000](http://localhost:3000)).

## Usage

1. An agent calls `add_element` / `ingest_doc`, or drop a `.txt` / `.md` / `.html` sponsor list, or type a name.
2. Click two canvas pieces to combine them.
3. Optional: **Push with SCAMPER** on an idea.
4. **Download** to save `ideation-canvas.md`.

Double-click a canvas piece to remove it. **Clear** empties the workspace.

## Web MCP

The page is the MCP server. Agents call `window.WebMCP` or JSON-RPC `postMessage` (`tools/list`, `tools/call`):

| Tool | What it does |
|---|---|
| `list_palette` | List palette and workspace pieces |
| `add_element` | Add a piece (use `kind: sponsor` for event APIs) |
| `ingest_doc` | Register only stacks named in pasted hackathon / sponsor text |
| `combine` | Combine two pieces by name |
| `list_ideas` | List ideas on the canvas |
| `scamper` | Run SCAMPER on an idea id |
| `download_canvas` | Download markdown (asks in the browser first) |
| `reset_canvas` | Clear workspace and ideas (asks first) |

## Scripts

| Command | What it runs |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |

## Limits

- Combinations are structured from the two pieces you picked. CoFound does not call an LLM and does not invent prize history.
- Ideas live in `localStorage` on that browser. Clearing site data clears the canvas.
- There is no backend, auth, or shared team room.

Deploy notes: [DEPLOYMENT.md](DEPLOYMENT.md).
