# Cofound

## Inspiration

Hackathon teams start from a blank doc and a sponsor PDF. We built a Web MCP native ideation canvas so a person and an agent can mix stacks on the same board.

## What it does

Cofound is a Web MCP native ideation canvas.

Three fields: Sponsors, Industries, Wild cards.

- Sponsors: event tools and APIs. Starts empty. Add by typing, dropping a txt/md/html list, or an agent calling `add_element` / `ingest_doc`.
- Industries: Health, Education, Defense, Finance, Entertainment, Sports, Climate, Legal, Accessibility, Eldercare.
- Wild cards: constraints. Starts empty.

Click two pieces to combine them. SCAMPER is optional. Download exports markdown.

Live: https://cofound-wzks.onrender.com

## How we built it

Next.js 16, React 19, client only. Board state in localStorage. No database.

Web MCP on the page (`window.WebMCP` and JSON-RPC `tools/list`, `tools/call`):

- list_palette
- add_element
- ingest_doc
- combine
- list_ideas
- scamper
- download_canvas (asks first)
- reset_canvas (asks first)

Colors: Sponsors amber, Industries teal, Wild cards purple.

## Challenges we ran into

Preloaded sponsor chips packed the UI. Removing them also hid the three fields. Fix: keep Industries filled, leave Sponsors and Wild cards empty.

PDF ingest is not supported in the browser. Use txt, md, or html.

## Accomplishments that we're proud of

Live canvas. Eight MCP tools. Same board for clicks and for the agent. Markdown download.

## What we learned

The agent tools have to write the same board the UI writes.

## What's next for Cofound

PDF drop. Better ingest for prize pages.
