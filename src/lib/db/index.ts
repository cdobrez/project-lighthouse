import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

export type Db = BetterSQLite3Database<typeof schema>;

declare global {
  // eslint-disable-next-line no-var
  var __gigkitchensDb: Db | undefined;
}

function resolveDbPath(): string {
  const configured = process.env.DATABASE_PATH;
  if (configured) return configured;
  const dir = path.join(process.cwd(), "data");
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return path.join(dir, "gigkitchens.db");
  } catch {
    // Read-only filesystem (some serverless hosts): fall back to an in-memory DB.
    return ":memory:";
  }
}

function open(): Db {
  const file = resolveDbPath();
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  seedIfEmpty(db);
  return db;
}

export function getDb(): Db {
  if (!globalThis.__gigkitchensDb) {
    globalThis.__gigkitchensDb = open();
  }
  return globalThis.__gigkitchensDb;
}

export { schema };
