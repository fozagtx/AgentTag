# Cofound

## Inspiration

We kept watching teams open a blank Google doc at 8pm on Friday and argue about ideas until Saturday. The sponsor list was in a PDF nobody read. If you wanted an agent in the loop, you had to explain the whole board again in chat.

We built Cofound so the board is the thing. You mix stacks on it. An agent can mix them too, because the page speaks Web MCP.

## What it does

Cofound is a Web MCP native ideation canvas.

You get three columns: Sponsors, Industries, and Wild cards. Industries already has the usual problem spaces (health, education, finance, and so on). Sponsors and Wild cards start empty, because those should come from this weekend, not from a generic list we guessed.

Add a name, drop a text or markdown sponsor sheet, or let an agent add pieces. Click two chips to combine them. Hit Download when you have something you want to keep.

Live: https://cofound-wzks.onrender.com

## How we built it

It is a Next.js app that runs in the browser. No database. The board is saved in localStorage.

Web MCP is on the page, so an agent can list the columns, add a stack, ingest a doc, combine two pieces, run SCAMPER, and download. Download and reset ask you first, because wiping someone’s board without asking is rude.

The three columns are different colors on purpose: amber, teal, purple. You can see which pile a chip came from.

## Challenges we ran into

We stuffed the board with every sponsor we could think of. It looked busy and it was wrong for any real event. Then we deleted too much and the three columns disappeared. We put Industries back as a starter set and left Sponsors for the actual hackathon.

Dropping a PDF still does not work in the browser. You need a txt, md, or html export.

## Accomplishments that we're proud of

It is live. A person and an agent use the same board. You can leave with a markdown file.

## What we learned

Put the agent on the same board as the human. One store, one set of clicks.

## What's next for Cofound

PDF drop, and better ingest when someone pastes a prize page.
