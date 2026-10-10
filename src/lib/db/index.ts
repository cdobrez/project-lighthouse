import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { MIGRATIONS } from "./migrations";
import { seedIfEmpty } from "./seed";

export type Db = LibSQLDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

declare global {
  var __gigkitchensDb: Promise<Db> | undefined;
}

/**
 * Database connection, in order of preference:
 *  1. TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN): hosted libSQL, what production uses.
 *  2. DATABASE_URL (+ DATABASE_AUTH_TOKEN): any libsql:// , file: or :memory: URL.
 *  3. A local SQLite file at ./data/gigkitchens.db when the disk is writable.
 *  4. An in-memory database (read-only hosts with no database configured; reseeds on every cold start).
 */
function resolveConnection(): { url: string; authToken?: string; mode: string } {
  if (process.env.TURSO_DATABASE_URL) {
    return { url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN, mode: "turso" };
  }
  if (process.env.DATABASE_URL) {
    return { url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN, mode: "url" };
  }
  const dir = path.join(process.cwd(), "data");
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return { url: `file:${path.join(dir, "gigkitchens.db")}`, mode: "file" };
  } catch {
    return { url: ":memory:", mode: "memory" };
  }
}

async function runMigrations(client: Client) {
  await client.execute("CREATE TABLE IF NOT EXISTS _gk_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))");
  const applied = new Set((await client.execute("SELECT name FROM _gk_migrations")).rows.map((r) => String(r.name)));
  for (const m of MIGRATIONS) {
    if (applied.has(m.name)) continue;
    for (const stmt of m.statements) await client.execute(stmt);
    await client.execute({ sql: "INSERT OR IGNORE INTO _gk_migrations (name) VALUES (?)", args: [m.name] });
  }
}

async function open(): Promise<Db> {
  const conn = resolveConnection();
  const client = createClient({ url: conn.url, authToken: conn.authToken });
  const db = drizzle(client, { schema });
  await runMigrations(client);
  await seedIfEmpty(db);
  if (conn.mode === "memory") {
    console.warn("[gigkitchens] No database configured and the disk is read-only: using an in-memory database. Set TURSO_DATABASE_URL for persistence.");
  }
  return db;
}

export function getDb(): Promise<Db> {
  if (!globalThis.__gigkitchensDb) {
    globalThis.__gigkitchensDb = open().catch((err) => {
      globalThis.__gigkitchensDb = undefined;
      throw err;
    });
  }
  return globalThis.__gigkitchensDb;
}

export function isPersistent(): boolean {
  return resolveConnection().mode !== "memory";
}

export { schema };
