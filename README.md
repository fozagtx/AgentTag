# 🌐 WebMCP / AgentTag: Universal 1-Script Tag AI Agent Platform

**Turn Any Website, Documentation, or Landing Page into an AI-Agent-Ready MCP Server with 1 Script Tag.**

WebMCP (also referred to as AgentTag) is a unified platform that makes modern websites natively interactable for AI models (like Claude Desktop, Cursor, Gemini, and autonomous buyer agents). Instead of struggling with messy HTML scrapers or stale docs, you can embed a single script tag and instantly provide AI agents with a suite of auto-generated MCP (Model Context Protocol) tools to read, search, code, book, and buy directly on your site.

```html
<!-- One line to make any website 100x agent-ready -->
<script src="https://cdn.webmcp.io/v1/client.js" data-site-id="site_live_8a19f4"></script>
```

## 🚀 Features & Architecture

WebMCP intelligently inspects any URL, detects the platform (e.g., Mintlify, Stripe, Webflow), and auto-configures the exact tool capabilities needed:

* **Knowledge, Search & Documentation:** `search_docs`, `get_code_example`, `get_api_reference`, `troubleshoot_error`
* **Commerce, Products & Pricing:** `get_pricing_tiers`, `initiate_checkout` *(with Human-in-the-Loop consent)*, `get_product_features`
* **Agency, Leads & Booking:** `book_discovery_call` *(with HITL)*, `get_service_offerings`, `get_case_studies`

**Technical Stack:**
* **Frontend:** Next.js 14, React, Tailwind CSS (Neobrutalism UI style)
* **Database:** Neon Serverless Postgres
* **Infrastructure:** Render (Next.js Studio Web Service + Node.js/Bun WebSocket/SSE Cloud Relay)
* **Ingestion:** Firecrawl Intelligent URL Crawler

## 🛠️ Local Development

To run the Next.js application and the relay server locally:

1.  **Install Dependencies:**
    `npm install`

2.  **Environment Variables:**
    Create a `.env` file (copy from `.env.example` if available) and add your database URL:
    `DATABASE_URL="postgres://username:password@your-neon-hostname/neondb?sslmode=require"`

3.  **Initialize Database (Optional):**
    `npm run db:init`

4.  **Start Development Server:**
    `npm run dev`
    The application will be available at `http://localhost:3000`.

## ☁️ Deployment

AgentTag is designed to be easily deployed to **Render** with a **Neon Serverless Postgres** database.

### Deploying via Render Blueprint

1. Ensure your repository has the included `render.yaml` file.
2. Push your repository to GitHub.
3. Go to the [Render Dashboard](https://dashboard.render.com).
4. Click **New +** -> **Blueprint**.
5. Connect your GitHub repository.
6. Render will automatically configure the `agenttag-web` (Next.js) and `agenttag-relay` (WebSocket/SSE) services.
7. Provide your `DATABASE_URL` from Neon when prompted for Environment Variables.

For manual deployment or more details, refer to the [DEPLOYMENT.md](DEPLOYMENT.md) guide.

## 🔒 Security & Human-in-the-Loop (HITL)

Read-only tools (like searching docs) execute instantly. However, transactional or mutation tools (like initiating a checkout or booking a call) trigger an interactive on-screen consent toast in the user's browser, ensuring human oversight for critical actions.
