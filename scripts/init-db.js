/**
 * Neon Postgres Database Initializer & Migration Script
 * Usage: DATABASE_URL="your-neon-url" node scripts/init-db.js
 */

const { Pool } = require("@neondatabase/serverless");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  console.log("=========================================");
  console.log("  🚀 AgentTag: Neon DB Initialization    ");
  console.log("=========================================");

  if (!databaseUrl) {
    console.log("⚠️  DATABASE_URL environment variable is not set.");
    console.log("ℹ️  The app will use high-speed in-memory persistence for local development.");
    console.log("👉 To connect Neon, set DATABASE_URL='postgres://user:pass@ep-xyz.neon.tech/neondb?sslmode=require'");
    return;
  }

  console.log("📡 Connecting to Neon Postgres database...");
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const client = await pool.connect();
    console.log("✅ Successfully connected to Neon!");

    console.log("🛠️  Creating table `site_configs` if not exists...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_configs (
        site_id VARCHAR(64) PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        site_type VARCHAR(32) NOT NULL DEFAULT 'documentation',
        framework VARCHAR(64),
        tools JSONB NOT NULL,
        markdown_snapshot TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log("⚡ Creating indexes for performance...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_site_configs_url ON site_configs(url);
      CREATE INDEX IF NOT EXISTS idx_site_configs_type ON site_configs(site_type);
      CREATE INDEX IF NOT EXISTS idx_site_configs_created ON site_configs(created_at DESC);
    `);

    // Verify row count
    const res = await client.query("SELECT COUNT(*) FROM site_configs;");
    console.log(`📊 Current registered sites in database: ${res.rows[0].count}`);

    client.release();
    console.log("🎉 Neon Database is 100% ready for AgentTag deployment!");
  } catch (err) {
    console.error("❌ Failed to initialize Neon database:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
