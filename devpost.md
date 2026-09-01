# Cofound

## Inspiration

First-time founders and hackathon teams still brainstorm in a Google doc or a group chat. Sponsor lists live in a PDF. The board in their head never matches what an agent can actually do.

Cofound started as a Web MCP native ideation canvas. A person and an agent should share one board: add stacks, combine two pieces, download the result. The MCP is on the page. The canvas is the product.

## What it does

Cofound is a Web MCP native ideation canvas in the browser.

The board has three fields. **Sponsors** is for this event’s tools and APIs. It starts empty. An agent can fill it with `add_element` or `ingest_doc`, or you drop a `.txt`, `.md`, or `.html` sponsor list. **Industries** starts with problem spaces: Health, Education, Defense, Finance, Entertainment, Sports, Climate, Legal, Accessibility, Eldercare. **Wild cards** is for a constraint or angle. It also starts empty.

Click one piece, then another, to combine them. The idea is built from those two names. Optional SCAMPER expands the idea in seven directions. Download writes a markdown file of the canvas.

There is no account and no database. State stays in `localStorage`.

Live: https://cofound-wzks.onrender.com

## How we built it

Next.js 16 and React 19, client only. Pieces and ideas sit in a small store persisted to `localStorage`. Combinations are structured from the two pieces you picked.

Web MCP is registered on the page. Agents use `window.WebMCP` or JSON-RPC `postMessage` (`tools/list`, `tools/call`):

- `list_palette` lists what is in the three fields
- `add_element` puts a named stack into Sponsors, Industries, or Wild cards
- `ingest_doc` reads hackathon or sponsor text and registers stacks that actually appear in that text
- `combine` mixes two pieces by name
- `list_ideas` returns the board
- `scamper` runs SCAMPER on an idea
- `download_canvas` downloads markdown (asks in the browser first)
- `reset_canvas` clears the board (asks first)

The UI is light. The three fields have different colors so you can tell them apart: amber for Sponsors, teal for Industries, purple for Wild cards.

## Challenges we ran into

Prefilling every popular sponsor made the board look like a catalog for a hackathon that was not happening. Clearing those chips then hid the three fields. The split that works: Industries as a starter set, Sponsors and Wild cards filled from this event.

PDF drop does not parse in the browser. Ingest is text, markdown, and HTML. A prize PDF has to be saved as one of those first.

Hydration also bit us. The board reads `localStorage`, so the first paint has to match the server. The empty snapshot for that first paint is cached so React does not loop.

## Accomplishments that we're proud of

A live Web MCP native ideation canvas with no server behind it. Eight tools on the page that match the board a human clicks. Download is a real markdown file. Combine is the same click path the agent calls.

## What we learned

The tools and the UI share one store. `add_element` writes the same pieces the plus button writes.

Industries ships with the problem spaces. Sponsors and Wild cards stay empty until this event’s stacks are added.

## What's next for Cofound

Read sponsor PDFs in the browser. Make `ingest_doc` better at prize pages and Devpost copy.
