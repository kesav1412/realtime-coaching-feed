import 'dotenv/config';
import { Pool } from 'pg';

const dbName = process.env.DB_NAME || 'syncup';

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
};

async function migrate() {
  // Step 1: connect to the default 'postgres' db and create our db if needed
  const adminPool = new Pool({ ...baseConfig, database: 'postgres' });
  try {
    const exists = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    if (exists.rowCount === 0) {
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`[Migrate] database "${dbName}" created`);
    } else {
      console.log(`[Migrate] database "${dbName}" already exists`);
    }
  } finally {
    await adminPool.end();
  }

  // Step 2: connect to our db and create the table
  const appPool = new Pool({ ...baseConfig, database: dbName });
  try {
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS feed_items (
        id          SERIAL PRIMARY KEY,
        title       TEXT        NOT NULL,
        content     TEXT        NOT NULL,
        author      TEXT        NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('[Migrate] feed_items table ready');
  } finally {
    await appPool.end();
  }
}

migrate().catch((err) => {
  console.error('[Migrate] error:', err);
  process.exit(1);
});
