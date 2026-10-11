import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { del, list, put } from "@vercel/blob";

/**
 * Snapshot persistence for hosts without a database: the SQLite file is kept in
 * Vercel Blob (encrypted), restored on cold start and written back after every change.
 * Last writer wins if two instances write at the same moment, which is fine for a
 * pilot; a hosted libSQL database (TURSO_DATABASE_URL) replaces this entirely.
 */
export type SnapshotMeta = { id: string; uploadedAt: number };

export interface SnapshotStore {
  latest(): Promise<SnapshotMeta | null>;
  load(meta: SnapshotMeta): Promise<Buffer>;
  save(data: Buffer): Promise<SnapshotMeta>;
}

const PREFIX = "db/gigkitchens-";
const MAGIC = Buffer.from("GKDB1");

function key(): Buffer {
  const secret = process.env.DB_ENCRYPTION_KEY ?? process.env.SESSION_SECRET ?? "dev-only-gigkitchens-secret-change-me";
  return createHash("sha256").update(`gigkitchens-db:${secret}`).digest();
}

export function encrypt(plain: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), body]);
}

export function decrypt(buf: Buffer): Buffer {
  if (!buf.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error("Not a Gig Kitchens snapshot");
  const iv = buf.subarray(5, 17);
  const tag = buf.subarray(17, 33);
  const body = buf.subarray(33);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]);
}

class BlobSnapshotStore implements SnapshotStore {
  async latest(): Promise<SnapshotMeta | null> {
    const { blobs } = await list({ prefix: PREFIX, limit: 50 });
    if (!blobs.length) return null;
    const newest = blobs.reduce((a, b) => (new Date(b.uploadedAt).getTime() > new Date(a.uploadedAt).getTime() ? b : a));
    return { id: newest.url, uploadedAt: new Date(newest.uploadedAt).getTime() };
  }
  async load(meta: SnapshotMeta): Promise<Buffer> {
    const res = await fetch(meta.id, { cache: "no-store" });
    if (!res.ok) throw new Error(`Snapshot download failed: ${res.status}`);
    return decrypt(Buffer.from(await res.arrayBuffer()));
  }
  async save(data: Buffer): Promise<SnapshotMeta> {
    const blob = await put(`${PREFIX}${Date.now()}.bin`, encrypt(data), {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/octet-stream",
      cacheControlMaxAge: 0,
    });
    // Keep the three newest snapshots as a safety net; prune the rest.
    try {
      const { blobs } = await list({ prefix: PREFIX, limit: 100 });
      const sorted = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      const stale = sorted.slice(3).filter((b) => b.url !== blob.url);
      if (stale.length) await del(stale.map((b) => b.url));
    } catch (err) {
      console.warn("[gigkitchens] snapshot prune skipped", err);
    }
    const uploadedAt = Date.now();
    return { id: blob.url, uploadedAt };
  }
}

/** Local directory store used by the test suite to simulate several instances sharing one snapshot. */
class DirSnapshotStore implements SnapshotStore {
  constructor(private dir: string) {}
  async latest(): Promise<SnapshotMeta | null> {
    await fs.mkdir(this.dir, { recursive: true });
    const files = (await fs.readdir(this.dir)).filter((f) => f.startsWith("gigkitchens-") && f.endsWith(".bin"));
    if (!files.length) return null;
    const newest = files.sort().at(-1)!;
    const stat = await fs.stat(path.join(this.dir, newest));
    return { id: newest, uploadedAt: stat.mtimeMs };
  }
  async load(meta: SnapshotMeta): Promise<Buffer> {
    return decrypt(await fs.readFile(path.join(this.dir, meta.id)));
  }
  async save(data: Buffer): Promise<SnapshotMeta> {
    await fs.mkdir(this.dir, { recursive: true });
    const name = `gigkitchens-${String(Date.now()).padStart(15, "0")}-${randomBytes(3).toString("hex")}.bin`;
    const tmp = path.join(this.dir, `${name}.tmp`);
    await fs.writeFile(tmp, encrypt(data));
    await fs.rename(tmp, path.join(this.dir, name));
    const stat = await fs.stat(path.join(this.dir, name));
    return { id: name, uploadedAt: stat.mtimeMs };
  }
}

export function snapshotStore(): SnapshotStore | null {
  if (process.env.SNAPSHOT_DIR) return new DirSnapshotStore(process.env.SNAPSHOT_DIR);
  if (process.env.BLOB_READ_WRITE_TOKEN) return new BlobSnapshotStore();
  return null;
}
