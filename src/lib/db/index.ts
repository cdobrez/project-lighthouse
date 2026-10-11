import { createClient, type Client, type InStatement, type ResultSet, type TransactionMode } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as schema from "./schema";
import { MIGRATIONS } from "./migrations";
import { seedIfEmpty } from "./seed";
import { snapshotStore, type SnapshotMeta, type SnapshotStore } from "./snapshot";

export type Db = LibSQLDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

type Handle = { db: Db; client: Client; mode: string; file?: string };

declare global {
  var __gigkitchensHandle: Promise<Handle> | undefined;
  var __gigkitchensSnapshot: SnapshotState | undefined;
}

type SnapshotState = {
  store: SnapshotStore;
  knownAt: number; // uploadedAt of the snapshot this instance last loaded or saved
  dirty: boolean;
  saving: Promise<void> | null;
  lastCheck: number;
};

/**
 * Database connection, in order of preference:
 *  1. TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN): hosted libSQL, the recommended production setup.
 *  2. DATABASE_URL (+ DATABASE_AUTH_TOKEN): any libsql://, file: or :memory: URL.
 *  3. Snapshot mode: a SQLite file in a temp dir, restored from and written back to
 *     Vercel Blob (BLOB_READ_WRITE_TOKEN) or SNAPSHOT_DIR. Used on hosts with no database.
 *  4. A local SQLite file at ./data/gigkitchens.db when the disk is writable.
 *  5. An in-memory database (reseeds on every cold start).
 */
function diskWritable(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function resolveConnection(): { url: string; authToken?: string; mode: string; file?: string } {
  if (process.env.TURSO_DATABASE_URL) {
    return { url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN, mode: "turso" };
  }
  if (process.env.DATABASE_URL) {
    return { url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN, mode: "url" };
  }
  const dataDir = path.join(process.cwd(), "data");
  const useSnapshot = snapshotStore() !== null && (process.env.SNAPSHOT_DIR || process.env.VERCEL || !diskWritable(dataDir));
  if (useSnapshot) {
    const file = path.join(os.tmpdir(), `gigkitchens-${process.pid}-${Date.now()}.db`);
    return { url: `file:${file}`, mode: "snapshot", file };
  }
  if (diskWritable(dataDir)) {
    return { url: `file:${path.join(dataDir, "gigkitchens.db")}`, mode: "file" };
  }
  return { url: ":memory:", mode: "memory" };
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

const READ_ONLY = /^\s*(select|pragma|explain|begin|end|release)\b/i;
function isWrite(stmt: InStatement): boolean {
  const sql = typeof stmt === "string" ? stmt : stmt.sql;
  return !READ_ONLY.test(sql);
}

/** Wraps a libsql client so every write schedules a snapshot upload. */
function tracked(client: Client, onWrite: () => void): Client {
  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === "execute") {
        return async (stmt: InStatement): Promise<ResultSet> => {
          const result = await target.execute(stmt);
          if (isWrite(stmt)) onWrite();
          return result;
        };
      }
      if (prop === "batch") {
        return async (stmts: InStatement[], mode?: TransactionMode) => {
          const result = await target.batch(stmts, mode);
          if (stmts.some(isWrite)) onWrite();
          return result;
        };
      }
      if (prop === "transaction") {
        return async (mode?: TransactionMode) => {
          const tx = await target.transaction(mode);
          return new Proxy(tx, {
            get(t, p, r) {
              if (p === "commit") {
                return async () => {
                  await t.commit();
                  if (mode !== "read") onWrite();
                };
              }
              const v = Reflect.get(t, p, r);
              return typeof v === "function" ? v.bind(t) : v;
            },
          });
        };
      }
      const v = Reflect.get(target, prop, receiver);
      return typeof v === "function" ? v.bind(target) : v;
    },
  });
}

async function keepAlive(promise: Promise<unknown>) {
  try {
    const { waitUntil } = await import("@vercel/functions");
    waitUntil(promise);
  } catch {
    /* not on Vercel: the promise simply runs */
  }
}

async function snapshotBytes(client: Client, file: string): Promise<Buffer> {
  const copy = `${file}.snap`;
  await client.execute(`VACUUM INTO '${copy}'`);
  const data = await fs.promises.readFile(copy);
  await fs.promises.unlink(copy).catch(() => {});
  return data;
}

function scheduleSave(state: SnapshotState, client: Client, file: string) {
  state.dirty = true;
  if (state.saving) return;
  state.saving = (async () => {
    // Coalesce bursts of writes (a transaction's statements, a seed) into one upload.
    await new Promise((r) => setTimeout(r, 40));
    while (state.dirty) {
      state.dirty = false;
      try {
        const data = await snapshotBytes(client, file);
        const meta = await state.store.save(data);
        state.knownAt = Math.max(state.knownAt, meta.uploadedAt);
      } catch (err) {
        console.error("[gigkitchens] snapshot save failed", err);
        state.dirty = true;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    state.saving = null;
  })();
  void keepAlive(state.saving);
}

async function openSnapshotFile(store: SnapshotStore, file: string): Promise<SnapshotMeta | null> {
  const meta = await store.latest();
  if (meta) {
    await fs.promises.writeFile(file, await store.load(meta));
    console.info(`[gigkitchens] restored database snapshot from ${new Date(meta.uploadedAt).toISOString()}`);
  }
  return meta;
}

async function open(): Promise<Handle> {
  const conn = resolveConnection();
  let raw: Client;
  if (conn.mode === "snapshot") {
    const store = snapshotStore()!;
    const meta = await openSnapshotFile(store, conn.file!);
    const state: SnapshotState = globalThis.__gigkitchensSnapshot ?? { store, knownAt: 0, dirty: false, saving: null, lastCheck: 0 };
    state.knownAt = meta?.uploadedAt ?? 0;
    state.lastCheck = Date.now();
    globalThis.__gigkitchensSnapshot = state;
    const base = createClient({ url: conn.url });
    await base.execute("PRAGMA journal_mode = DELETE");
    raw = tracked(base, () => scheduleSave(state, base, conn.file!));
  } else {
    raw = createClient({ url: conn.url, authToken: conn.authToken });
  }
  const db = drizzle(raw, { schema });
  await runMigrations(raw);
  await seedIfEmpty(db);
  if (conn.mode === "memory") {
    console.warn("[gigkitchens] No database configured and the disk is read-only: using an in-memory database. Set TURSO_DATABASE_URL for persistence.");
  }
  return { db, client: raw, mode: conn.mode, file: conn.file };
}

/** In snapshot mode, pick up a newer snapshot written by another instance (checked at most every few seconds). */
async function refreshIfStale(handle: Handle): Promise<Handle> {
  const state = globalThis.__gigkitchensSnapshot;
  if (handle.mode !== "snapshot" || !state) return handle;
  if (Date.now() - state.lastCheck < 3000 || state.dirty || state.saving) return handle;
  state.lastCheck = Date.now();
  try {
    const latest = await state.store.latest();
    if (latest && latest.uploadedAt > state.knownAt) {
      const fresh = open();
      globalThis.__gigkitchensHandle = fresh;
      const next = await fresh;
      handle.client.close();
      if (handle.file) fs.promises.unlink(handle.file).catch(() => {});
      return next;
    }
  } catch (err) {
    console.warn("[gigkitchens] snapshot freshness check failed", err);
  }
  return handle;
}

export async function getDb(): Promise<Db> {
  if (!globalThis.__gigkitchensHandle) {
    globalThis.__gigkitchensHandle = open().catch((err) => {
      globalThis.__gigkitchensHandle = undefined;
      throw err;
    });
  }
  const handle = await refreshIfStale(await globalThis.__gigkitchensHandle);
  return handle.db;
}

export function isPersistent(): boolean {
  return resolveConnection().mode !== "memory";
}

export { schema };
