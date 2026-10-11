"use client";

import { useRef, useState } from "react";
import { MEAL_PHOTO_KEYS } from "@/lib/images";

type Props = {
  name: string;
  initial?: string;
  kind: "meal" | "cook";
  label?: string;
  allowLibrary?: boolean;
};

function previewFor(value: string): string | null {
  if (!value || value === "meal-default" || value === "cook-default") return null;
  if (value.startsWith("http") || value.startsWith("/")) return value;
  return `/images/${value}.jpg`;
}

/** Uploads a photo to /api/upload and stores the resulting URL in a hidden form field. */
export function PhotoUploader({ name, initial = "", kind, label = "Photo", allowLibrary = true }: Props) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const preview = previewFor(value);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed.");
      setValue(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="label">{label}</p>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-start gap-4">
        <div className={`relative h-28 w-36 shrink-0 overflow-hidden rounded-xl bg-cream-deep ring-1 ring-line ${kind === "cook" ? "w-28" : ""}`}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl" aria-hidden>
              {kind === "cook" ? "👩‍🍳" : "🍽️"}
            </span>
          )}
          {busy && <span className="absolute inset-0 flex items-center justify-center bg-paper/70 text-xs font-bold">Uploading…</span>}
        </div>
        <div className="flex-1 space-y-2">
          <label className="btn-secondary cursor-pointer">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onFile} disabled={busy} />
            {preview ? "Replace photo" : "Upload a photo"}
          </label>
          {allowLibrary && (
            <select className="input" value={value.startsWith("meal-") ? value : ""} onChange={(e) => setValue(e.target.value)} aria-label="Or pick a library photo">
              <option value="">Or pick a library photo…</option>
              {MEAL_PHOTO_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k.replace("meal-", "").replace(/-/g, " ")}
                </option>
              ))}
            </select>
          )}
          {preview && (
            <button type="button" className="text-xs font-bold text-ink-muted hover:text-tomato" onClick={() => setValue("")}>
              Remove photo
            </button>
          )}
          <p className="text-xs text-ink-muted">JPEG, PNG or WebP, up to 6 MB. Natural light and a real plate beat a studio shot every time.</p>
          {error && <p className="text-xs font-semibold text-tomato-deep">{error}</p>}
        </div>
      </div>
    </div>
  );
}
