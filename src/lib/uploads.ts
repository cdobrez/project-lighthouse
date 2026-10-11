import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { newId } from "@/lib/ids";

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function uploadsDir(): string {
  return path.join(process.cwd(), "data", "uploads");
}

async function localDiskWritable(): Promise<boolean> {
  try {
    await fs.mkdir(uploadsDir(), { recursive: true });
    await fs.access(uploadsDir(), (await import("node:fs")).constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export async function uploadsAvailable(): Promise<boolean> {
  return isBlobConfigured() || (await localDiskWritable());
}

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/** Stores an image and returns a URL the site can render. Vercel Blob when configured, otherwise the local data/uploads folder. */
export async function storeImage(file: File, folder: string): Promise<UploadResult> {
  const ext = TYPES[file.type];
  if (!ext) return { ok: false, error: "Use a JPEG, PNG or WebP photo." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Photos need to be under 6 MB." };
  const name = `${folder}/${newId("img")}.${ext}`;
  if (isBlobConfigured()) {
    const blob = await put(name, file, { access: "public", addRandomSuffix: false, contentType: file.type });
    return { ok: true, url: blob.url };
  }
  if (await localDiskWritable()) {
    const safe = name.replace(/\//g, "__");
    await fs.writeFile(path.join(uploadsDir(), safe), Buffer.from(await file.arrayBuffer()));
    return { ok: true, url: `/api/uploads/${safe}` };
  }
  return { ok: false, error: "Photo uploads aren't set up on this server yet. Pick a library photo for now." };
}
