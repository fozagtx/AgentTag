# 🌐 WebMCP: Unified Technical Architecture & System Blueprint

> **Unified Platform Specification**: In-browser client runtime (`webmcp.js`), Firecrawl intelligent crawler, automatic tool capability synthesizer, Human-in-the-Loop (HITL) approval toast, Neon Serverless Postgres persistence, and Render WebSocket/SSE Cloud Relay.

---

## 1. System Overview

WebMCP unifies documentation, developer APIs, digital products, SaaS landing pages, portfolios, and agency websites into a single protocol.

```
   ┌─────────────────────────────────────────────────────────────┐
   │                     1. AI Agent Clients                     │
   │       (Claude Desktop, Cursor, Gemini, Custom AGY Agent)    │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ Standard MCP (SSE / JSON-RPC 2.0)
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                2. WebMCP Cloud Relay Gateway                │
   │               (relay.webmcp.io / Session Hub)               │
   │  - Maintains persistent WebSocket tunnels to active tabs   │
   │  - Translates MCP JSON-RPC <──> Browser WebSocket frames    │
   │  - Origin verification, session pairing, & offline cache    │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ Bidirectional Secure WebSocket / WebRTC
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │             3. In-Browser Client Runtime (WebMCP.js)        │
   │                                                             │
   │  ┌───────────────────┐  ┌────────────────┐  ┌────────────┐  │
   │  │  DOM Search Hooks │  │ Action Trigger │  │ HITL UI    │  │
   │  │ (Algolia/Headers) │  │(Stripe/Cal.com)│  │ Approval   │  │
   │  └───────────────────┘  └────────────────┘  └────────────┘  │
   │  ┌───────────────────────────────────────────────────────┐  │
   │  │ Auto-Detector Engine (Schema.org, Forms, Search, ARIA)│  │
   │  └───────────────────────────────────────────────────────┘  │
   └─────────────────────────────────────────────────────────────┘
```

---

## 2. Ingestion & Multi-Capability Extraction Engine (Firecrawl)

When any URL is submitted:
1. **Content Crawling**:
   * Scrapes documentation hierarchy, code blocks, pricing tables, service descriptions, and booking embeds.
2. **Capability Detection**:
   * Detects documentation frameworks (Mintlify, Docusaurus, Nextra, GitBook, VitePress, Starlight).
   * Detects landing page builders (Webflow, Framer, WordPress, Carrd, Shopify).
   * Detects transactional hooks (Stripe, Lemon Squeezy, Gumroad, Calendly, Cal.com).
3. **Automated Tool Generation**:
   * Dynamically generates the appropriate blend of Knowledge tools, Coding tools, Action tools, and Commercial tools.

---

## 3. The Embeddable Runtime (`webmcp.js`)

```html
<script src="https://cdn.webmcp.io/v1/client.js" data-site-id="site_live_8a19f4"></script>
```

### In-Browser Responsibilities:
1. **DOM Search Indexing**: Scans semantic headers (`h1-h4`), paragraphs, and code blocks.
2. **Action Dispatch**: Automates clicks, form entries, or redirects (e.g. initiating Stripe checkout or opening Calendly).
3. **HITL Security Shield**: Shows an on-screen consent prompt for mutation/financial actions.
4. **Agent-Ready Badge**: Renders a sleek floating badge showing connected state and active tools.

---

## 4. MCP Protocol Endpoints

* **SSE Stream**: `GET /mcp/v1/:siteId/sse`
* **JSON-RPC Endpoint**: `POST /mcp/v1/:siteId/message`
* **WebSocket Tunnel**: `ws://relay.webmcp.io/ws?site_id=:siteId`

### Claude Desktop / Cursor Config (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "my-site": {
      "url": "https://relay.webmcp.io/mcp/v1/YOUR_SITE_ID"
    }
  }
}
```
