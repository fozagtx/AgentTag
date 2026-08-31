# 🌐 WebMCP: Universal 1-Script Tag AI Agent Platform
**Product Name:** WebMCP  
**Tagline:** *Turn Any Website, Documentation, or Landing Page into an AI-Agent-Ready MCP Server with 1 Script Tag.*  
**Version:** 1.0 (Unified Release)  
**Database:** Neon Serverless Postgres  
**Hosting:** Render (Next.js Studio Web Service + WebSocket/SSE Cloud Relay)  
**Auth Model:** Zero-Auth Frictionless (Persistent via Site UUID & Neon Postgres)

---

## 1. Executive Summary & Core Thesis

Today's web was built for human eyes and manual clicks. As AI agents (Claude Desktop, Cursor, Gemini, Copilot, Windsurf, autonomous buyer agents) become the primary interface for work, coding, and purchasing, websites must become **natively interactable for AI models**.

* **1998**: Developers added a `<meta>` tag for search engines.
* **2010**: Developers added a `<script>` tag for **Google Analytics** to monitor traffic.
* **2015**: Developers added a `<script>` tag for **Stripe Elements** to accept payments.
* **2021**: Developers added a `<script>` tag for **Intercom** to chat with human visitors.
* **2026**: Developers add a `<script>` tag for **WebMCP** so **AI Agents can read, search, code, book, and buy**.

```html
<!-- One line to make any website 100x agent-ready -->
<script src="https://cdn.webmcp.io/v1/client.js" data-site-id="site_live_8a19f4"></script>
```

---

## 2. One Unified Platform for Every Website

WebMCP intelligently inspects any URL and auto-configures the exact tool capabilities needed:

```
                                  ┌───────────────────────────────┐
                                  │      Paste Any URL in WebMCP  │
                                  └───────────────┬───────────────┘
                                                  │ Firecrawl + AI Analyzer
                                                  ▼
                        ┌───────────────────────────────────────────────────┐
                        │      Intelligent Auto-Detection Engine            │
                        └─┬───────────────────────┬───────────────────────┬─┘
                          │                       │                       │
                          ▼                       ▼                       ▼
               ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
               │ Developer Docs & API│ │ Digital Products    │ │ Agencies & Portflows│
               │ (Mintlify, Nextra,  │ │ (Templates, SaaS,   │ │ (Webflow, Framer,   │
               │  Docusaurus, etc.)  │ │  Gumroad, Shopify)  │ │  Designers, Cal)    │
               └──────────┬──────────┘ └──────────┬──────────┘ └──────────┬──────────┘
                          │                       │                       │
                          ▼                       ▼                       ▼
               ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
               │ 🔍 search_docs      │ │ 🏷️ get_pricing_tiers│ │ 📅 book_discovery   │
               │ 💻 get_code_example │ │ 💳 initiate_checkout│ │ 💼 get_case_studies │
               │ ⚡ get_api_reference│ │ ⭐ get_reviews      │ │ 📋 request_quote    │
               │ 🛠️ troubleshoot_err │ │ 📦 check_license    │ │ 🚀 get_skills_stack │
               └─────────────────────┴─┴─────────────────────┴─┴─────────────────────┘
```

---

## 3. End-to-End User Flow (Zero-Auth Onboarding)

1. **Enter Any URL**: Developer or creator pastes their documentation URL, SaaS landing page, portfolio, or store URL.
2. **Firecrawl + AI Page Synthesis**:
   * Scrapes structure, navigation hierarchy, code blocks, tables, forms, pricing, and CTAs.
   * Auto-detects whether the site is documentation, digital product, SaaS, agency, or portfolio.
3. **Interactive Studio (`/studio/[siteId]`)**:
   * Inspect and toggle generated tools across categories (Knowledge & Docs, Code & API, Actions & Commerce).
   * **Vibe Prompt Box**: Refine or add custom tools in plain English (*"Add a tool to check enterprise SLA"*).
   * **Live Agent Simulator**: Test tool calls interactively and view live responses.
4. **Instant 1-Click Embed**:
   * Copy the `<script>` tag into the website header.
   * Copy the generated `claude_desktop_config.json` block for Claude Desktop & Cursor.
5. **Live Agent Interactivity**:
   * AI agents connect over the WebMCP Relay to search docs, write verified code, book calls, or initiate purchases.

---

## 4. Unified Tool Suite & Capabilities

### Category A: Knowledge, Search & Documentation
* `search_docs(query, section)`: Live DOM search hook with Algolia/Pagefind binding.
* `get_code_example(feature, language)`: Verified, copy-pasteable code snippets.
* `get_api_reference(endpoint, method)`: Type signatures, parameters, and return payloads.
* `troubleshoot_error(error_message)`: Direct mapping of error strings to FAQ & guides.
* `get_quickstart(framework)`: Step-by-step installation commands and initial configuration.

### Category B: Commerce, Products & Pricing
* `get_pricing_tiers()`: Returns structured JSON of tiers, features, and license terms.
* `get_product_features(feature_name)`: Detailed breakdown of template, course, or SaaS features.
* `get_customer_reviews(min_rating)`: Verified testimonials and ratings.
* `initiate_checkout(tier_name, buyer_email)`: Direct Stripe / Lemon Squeezy / Gumroad trigger *(requires HITL approval)*.

### Category C: Agency, Leads & Booking
* `book_discovery_call(name, email, preferred_time)`: Direct bridge to Calendly / Cal.com *(requires HITL approval)*.
* `get_service_offerings(category)`: Service deliverables, timelines, and price ranges.
* `get_case_studies(industry)`: Client case studies and verified project metrics.
* `request_custom_quote(scope, budget)`: Direct project inquiry capture.
* `get_skills_and_stack()`: Portfolio skills, tech stack, and experience highlights.

---

## 5. Security & Human-in-the-Loop (HITL) Protocol

* **Read-Only Tools** (`search_docs`, `get_pricing_tiers`, `get_case_studies`): Execute instantly with zero friction.
* **Transactional & Mutation Tools** (`initiate_checkout`, `book_discovery_call`, `request_custom_quote`):
  * Trigger an interactive on-screen consent toast in the user's browser via `webmcp.js`:
    ```
    ┌─────────────────────────────────────────────────────────────┐
    │ 🤖 AI Agent Action Request                                  │
    │ Tool: initiate_checkout                                     │
    │ Item: Next.js Pro SaaS Boilerplate ($149.00)                │
    │                                   [ Reject ]  [ Approve ]   │
    └─────────────────────────────────────────────────────────────┘
    ```

---

## 6. Technical Architecture (Neon + Render)

```
                              ┌──────────────────────────────────┐
                              │       AI Agent Clients           │
                              │  (Claude Desktop, Cursor, etc.)  │
                              └─────────────────┬────────────────┘
                                                │ SSE / JSON-RPC 2.0
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Render Cloud Infrastructure                                                            │
│                                                                                        │
│  ┌────────────────────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │   Render Web Service: WebMCP Studio    │  │   Render Web Service: Cloud Relay    │  │
│  │   (Next.js 14 / React / Tailwind)      │  │   (Node.js / Bun WebSocket + SSE)   │  │
│  │                                        │  │                                      │  │
│  │  - Firecrawl URL Crawler & Parser      │  │  - JSON-RPC 2.0 SSE Transport        │  │
│  │  - Unified AI Tool Synthesizer         │  │  - Persistent WebSocket Tab Router   │  │
│  │  - Interactive Studio & Simulator      │  │  - Headless Offline Search Cache     │  │
│  │  - Embed Script CDN Server             │  │                                      │  │
│  └───────────────────┬────────────────────┘  └───────────────────┬──────────────────┘  │
│                      │                                           │                     │
└──────────────────────┼───────────────────────────────────────────┼─────────────────────┘
                       │                                           │
                       ▼                                           ▼
          ┌─────────────────────────────────────────────────────────────┐
          │             Neon Database (Serverless Postgres)             │
          │  - `site_configs` (UUID, url, title, detected_type, tools)  │
          │  - JSONB Tool Schemas & Custom Parameters                   │
          │  - Knowledge Snapshots for Offline Fallback                 │
          └─────────────────────────────────────────────────────────────┘
```

---

## 7. Master Marketing Copy

* **Hero Title:** Make Any Website 100x Agent-Ready with 1 Script Tag.
* **Sub-headline:** Stop letting AI agents struggle with messy scrapers, stale docs, and broken checkouts. Paste your URL, vibe with auto-generated Web MCP tools, and embed one line of JavaScript. Your website is now an interactive tool for Claude, Cursor, and autonomous buyer agents.
* **The Evolution Hook:**
  * 1998: Add a `<meta>` tag for Search Engines.
  * 2010: Add a `<script>` tag for Google Analytics.
  * 2015: Add a `<script>` tag for Stripe Payments.
  * 2021: Add a `<script>` tag for Intercom Live Chat.
  * 2026: Add a `<script>` tag for **WebMCP** so **AI Agents can read, search, code, book, and buy**.
