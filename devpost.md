# Cofound

## Inspiration

Hackathon ideation still starts with a blank doc. [The Hackathon Playbook](https://thehackathonplaybook.dev/playbook/ideation) already has the method: treat sponsor tools and problem spaces like Little Alchemy elements, combine them, then pick what you can ship in a weekend. We wanted that method as a board a first-time founder can use, and that an agent can drive through Web MCP, without a database or a fake prize story.

## What it does

Cofound is a client-only ideation canvas.

Three fields sit on the board: Sponsors, Industries, and Wild cards. Industries start with problem spaces (Health, Education, Defense, and the rest). Sponsors and Wild cards stay empty until this event’s stacks show up.

You add a stack by typing it, by dropping a `.txt` / `.md` / `.html` hackathon or sponsor list, or by letting an agent call `add_element` / `ingest_doc`. Click one piece, then another, to combine them into an idea. Optional SCAMPER pushes the idea. Download saves a markdown file of the canvas.

There is no account and no backend. State stays in the browser.

## How we built it

Next.js 16 and React 19, all on the client. A small store in `localStorage` holds pieces and ideas. Combinations are structured from the two pieces you picked. They are not LLM-generated.

Web MCP lives on the page. Agents use `window.WebMCP` or JSON-RPC `postMessage` (`tools/list`, `tools/call`):

- `list_palette`
- `add_element`
- `ingest_doc`
- `combine`
- `list_ideas`
- `scamper`
- `download_canvas`
- `reset_canvas`

`download_canvas` and `reset_canvas` ask in the browser first.

Live: [https://cofound-wzks.onrender.com](https://cofound-wzks.onrender.com)

## Challenges we ran into

Keeping the board honest. Prefilling every common sponsor made the UI noisy and implied those tools were at this hackathon. Clearing the chips then accidentally hid the three fields. The split that held: Industries as a starter set, Sponsors filled by an agent or a dropped doc.

File drop has a hard limit: PDF is not parsed in the browser. The ingest path reads text, markdown, and HTML only.

## Accomplishments that we're proud of

A usable canvas with no server, no API keys, and no invented metrics. The same actions work for a person and for an agent. The live site is the product.

## What we learned

Empty is a feature when the alternative is a fake catalog. Structure (three fields, two clicks to combine) matters more than a long chip list. If an agent cannot do the same job as the UI, it is not agent-native.

## What's next for Cofound

Read sponsor PDFs in the browser. Let a dropped Devpost or prize page fill Sponsors more reliably. Keep the board local, keep combinations honest, keep MCP on the page.
