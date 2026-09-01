# CoFound

An ideation canvas for first-time founders and hackathon teams.

Combine sponsor tools with a problem space the way [The Hackathon Playbook](https://thehackathonplaybook.dev/playbook/ideation) combines elements. Download the ideas when you are done.

No account. No database. State stays in the browser.

## Use it

```bash
npm install
npm run dev
```

1. Click pieces onto the canvas (Twilio, Health, a sponsor from this weekend).
2. Click two canvas pieces to combine them.
3. Download the markdown.

## Web MCP

The page is the MCP server. Agents can call:

- `list_palette`
- `add_element`
- `combine`
- `list_ideas`
- `scamper`
- `download_canvas`
- `reset_canvas`

via `window.WebMCP` or JSON-RPC `postMessage` (`tools/list`, `tools/call`).
