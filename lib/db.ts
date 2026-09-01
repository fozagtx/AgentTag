import { Pool } from "@neondatabase/serverless";
import { SiteConfig, TelemetryEvent } from "./types";

export type { TelemetryEvent };

// In-memory fallback map for zero-setup local dev / testing
const memoryStore = new Map<string, SiteConfig>();
const telemetryStore: TelemetryEvent[] = [];

let pool: Pool | null = null;

function getPool(): Pool | null {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl });
  }
  return pool;
}

// Initialize tables if connected to Neon
async function ensureTables() {
  const p = getPool();
  if (!p) return;

  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS site_configs (
        site_id VARCHAR(64) PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        site_type VARCHAR(32) NOT NULL,
        framework VARCHAR(64),
        tools JSONB NOT NULL,
        markdown_snapshot TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS telemetry_events (
        id VARCHAR(64) PRIMARY KEY,
        site_id VARCHAR(64) NOT NULL,
        site_title TEXT NOT NULL,
        tool_name VARCHAR(128) NOT NULL,
        args JSONB NOT NULL,
        client_type VARCHAR(64) NOT NULL DEFAULT 'unknown',
        status VARCHAR(32) NOT NULL DEFAULT 'success',
        duration_ms INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error("Neon table initialization error:", err);
  }
}

export async function saveSiteConfig(config: SiteConfig): Promise<SiteConfig> {
  memoryStore.set(config.site_id, config);

  const p = getPool();
  if (p) {
    try {
      await ensureTables();
      await p.query(
        `
        INSERT INTO site_configs (
          site_id, url, title, description, site_type, framework, tools, markdown_snapshot, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (site_id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          site_type = EXCLUDED.site_type,
          framework = EXCLUDED.framework,
          tools = EXCLUDED.tools,
          markdown_snapshot = EXCLUDED.markdown_snapshot,
          updated_at = NOW();
      `,
        [
          config.site_id,
          config.url,
          config.title,
          config.description || "",
          config.site_type,
          config.framework || "Custom",
          JSON.stringify(config.tools),
          config.markdown_snapshot || "",
        ]
      );
    } catch (err) {
      console.error("Error saving to Neon DB, using memory fallback:", err);
    }
  }

  return config;
}

export async function getSiteConfig(siteId: string): Promise<SiteConfig | null> {
  const p = getPool();
  if (p) {
    try {
      await ensureTables();
      const res = await p.query(
        `SELECT site_id, url, title, description, site_type, framework, tools, markdown_snapshot, created_at, updated_at FROM site_configs WHERE site_id = $1`,
        [siteId]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const config: SiteConfig = {
          site_id: row.site_id,
          url: row.url,
          title: row.title,
          description: row.description,
          site_type: row.site_type,
          framework: row.framework,
          tools: typeof row.tools === "string" ? JSON.parse(row.tools) : row.tools,
          markdown_snapshot: row.markdown_snapshot,
          created_at: row.created_at?.toString() || new Date().toISOString(),
          updated_at: row.updated_at?.toString() || new Date().toISOString(),
        };
        memoryStore.set(siteId, config);
        return config;
      }
    } catch (err) {
      console.error("Error fetching from Neon DB, trying memory fallback:", err);
    }
  }

  return memoryStore.get(siteId) || null;
}

export async function getAllSiteConfigs(): Promise<SiteConfig[]> {
  const p = getPool();
  if (p) {
    try {
      await ensureTables();
      const res = await p.query(
        `SELECT site_id, url, title, description, site_type, framework, tools, markdown_snapshot, created_at, updated_at FROM site_configs ORDER BY created_at DESC`
      );
      if (res.rows.length > 0) {
        return res.rows.map((row) => ({
          site_id: row.site_id,
          url: row.url,
          title: row.title,
          description: row.description,
          site_type: row.site_type,
          framework: row.framework,
          tools: typeof row.tools === "string" ? JSON.parse(row.tools) : row.tools,
          markdown_snapshot: row.markdown_snapshot,
          created_at: row.created_at?.toString() || new Date().toISOString(),
          updated_at: row.updated_at?.toString() || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error("Error querying Neon DB for all sites:", err);
    }
  }

  return Array.from(memoryStore.values());
}

export async function deleteSiteConfig(siteId: string): Promise<boolean> {
  memoryStore.delete(siteId);

  const p = getPool();
  if (p) {
    try {
      await ensureTables();
      await p.query(`DELETE FROM site_configs WHERE site_id = $1`, [siteId]);
      return true;
    } catch (err) {
      console.error("Error deleting from Neon DB:", err);
    }
  }

  return true;
}

export async function recordTelemetryEvent(event: Omit<TelemetryEvent, "id" | "created_at">): Promise<TelemetryEvent> {
  const fullEvent: TelemetryEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  telemetryStore.unshift(fullEvent);
  if (telemetryStore.length > 100) telemetryStore.pop();

  const p = getPool();
  if (p) {
    try {
      await ensureTables();
      await p.query(
        `INSERT INTO telemetry_events (id, site_id, site_title, tool_name, args, client_type, status, duration_ms, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          fullEvent.id,
          fullEvent.site_id,
          fullEvent.site_title,
          fullEvent.tool_name,
          JSON.stringify(fullEvent.args),
          fullEvent.client_type,
          fullEvent.status,
          fullEvent.duration_ms,
        ]
      );
    } catch (err) {
      console.error("Error logging telemetry event to Neon DB:", err);
    }
  }

  return fullEvent;
}

export async function getTelemetryEvents(limit = 20): Promise<TelemetryEvent[]> {
  const p = getPool();
  if (p) {
    try {
      await ensureTables();
      const res = await p.query(
        `SELECT id, site_id, site_title, tool_name, args, client_type, status, duration_ms, created_at
         FROM telemetry_events ORDER BY created_at DESC LIMIT $1`,
        [limit]
      );
      if (res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: row.id,
          site_id: row.site_id,
          site_title: row.site_title,
          tool_name: row.tool_name,
          args: typeof row.args === "string" ? JSON.parse(row.args) : row.args,
          client_type: row.client_type,
          status: row.status,
          duration_ms: row.duration_ms,
          created_at: row.created_at?.toString() || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error("Error fetching telemetry from Neon DB:", err);
    }
  }

  return telemetryStore.slice(0, limit);
}
