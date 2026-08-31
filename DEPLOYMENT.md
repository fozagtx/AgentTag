# 🚀 AgentTag: Neon Postgres + Render Deployment Guide

Follow this guide to connect your **Neon Serverless Postgres** database and deploy **AgentTag** to **Render** in under 3 minutes.

---

## 🐘 Step 1: Get Your Neon Database Connection String

1. Go to your [Neon Console](https://console.neon.tech).
2. Select your project (or click **New Project**).
3. Under **Dashboard / Connection Details**, copy the **Pooled Connection String**:
   ```
   postgres://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## 🛠️ Step 2: Initialize Database Tables (Optional / Pre-flight)

You can run the built-in migration script to verify your Neon connection and initialize the tables:

```bash
DATABASE_URL="postgres://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require" npm run db:init
```

> **Note:** The application will also automatically create the `site_configs` table on its first query if it doesn't already exist.

---

## 🌐 Step 3: Deploy to Render

### Option A: Deploy via Render Blueprint (`render.yaml`) — Recommended

1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "feat: AgentTag platform ready for Render"
   git push origin main
   ```
2. Go to the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and configure both services:
   * **`agenttag-web`**: Next.js App, Dashboard & API.
   * **`agenttag-relay`**: WebSocket + SSE Cloud Relay for Claude & Cursor.
6. When prompted, paste your **`DATABASE_URL`** from Neon into the Environment Variables.
7. Click **Apply**! 🚀

---

### Option B: Deploy as a Standard Render Web Service

If creating a manual Web Service on Render:

1. Click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository.
3. Set the following settings:
   * **Name**: `agenttag-web`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm run start`
4. Add the following **Environment Variables**:
   * `NODE_ENV`: `production`
   * `DATABASE_URL`: `postgres://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`
   * `FIRECRAWL_API_KEY`: *(Optional)* Your Firecrawl API key.
5. Click **Create Web Service**.

---

## 🧪 Step 4: Verify Deployment

Once Render finishes deploying:
1. Open your Render live URL (e.g. `https://agenttag-web.onrender.com`).
2. Open `/dashboard` and click **[+ Launch New Site]**.
3. Paste any URL (e.g. `https://docs.prisma.io` or `https://cal.com`).
4. Your site will be crawled, its MCP tools synthesized, and saved permanently in your **Neon Postgres database**!

---

## 📄 Key Environment Variables Reference

| Variable | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | Neon Postgres pooled connection string | `postgres://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `FIRECRAWL_API_KEY` | Optional | Firecrawl API key for enhanced crawling | `fc-your-key-here` |
| `NODE_ENV` | **Yes** | Production environment flag | `production` |
| `PORT` | Auto | Render automatically assigns port | `10000` |
