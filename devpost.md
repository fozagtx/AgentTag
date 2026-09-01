# Cofound

## Inspiration

A Web MCP native ideation canvas for hackathon teams.

## What it does

Three fields: Sponsors, Industries, Wild cards. Click two pieces to combine them. Agents run the same actions on the page. Download markdown when done.

Live: https://cofound-wzks.onrender.com

## How we built it

Next.js 16, React 19, client only. `localStorage` for the board. Web MCP tools on the page: `list_palette`, `add_element`, `ingest_doc`, `combine`, `list_ideas`, `scamper`, `download_canvas`, `reset_canvas`.

## Challenges we ran into

PDF drop does not parse in the browser. Ingest is `.txt`, `.md`, and `.html`.

## Accomplishments that we're proud of

The live canvas. Eight MCP tools in the page. No database.

## What we learned

The eight tools map to the three fields and the download button.

## What's next for Cofound

Read sponsor PDFs in the browser.
