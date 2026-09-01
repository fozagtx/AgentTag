# Cofound

## Inspiration

Hackathon ideation is usually a blank doc plus a sponsor PDF. We wanted a board you can actually mix on, and we wanted an agent to sit on that same board through Web MCP. That is Cofound: a Web MCP native ideation canvas.

## What it does

Three columns: Sponsors, Industries, Wild cards.

Industries already has health, education, finance, defense, and the rest. Sponsors and Wild cards start empty so you (or an agent) can add this weekend’s tools.

Type a name, drop a txt/md/html list, or let the agent add pieces. Click two chips to combine them. Download saves a markdown file.

https://cofound-wzks.onrender.com

## How we built it

Next.js in the browser. No database. The board lives in localStorage.

Web MCP is registered on the page. An agent can add a stack, ingest a doc, combine two pieces, run SCAMPER, and download. Download and reset ask before they run.

Sponsors is amber, Industries is teal, Wild cards is purple.

## Challenges we ran into

We preloaded a huge sponsor list and the UI looked packed. Then we stripped it and lost the three columns. Industries is back as a starter set. Sponsors wait for the real event.

PDF drop still fails in the browser. Use txt, md, or html.

## Accomplishments that we're proud of

It is live. You and an agent use the same canvas. You can download the ideas.

## What we learned

Make it agent native and human native in one. People click the board. Agents call Web MCP. Same canvas.

## What's next for Cofound

PDF drop. Better ingest for prize pages.
