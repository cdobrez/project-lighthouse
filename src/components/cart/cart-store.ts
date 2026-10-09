import type { CartLine } from "./cart-provider";

const KEY = "gigkitchens.cart.v1";
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) lines = JSON.parse(raw) as CartLine[];
  } catch {
    lines = EMPTY;
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* storage unavailable (private mode, quota); keep in-memory state */
  }
}

function emit() {
  for (const l of listeners) l();
}

export const cartStore = {
  subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        loaded = false;
        load();
        emit();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot(): CartLine[] {
    load();
    return lines;
  },
  getServerSnapshot(): CartLine[] {
    return EMPTY;
  },
  set(next: CartLine[]) {
    lines = next;
    persist();
    emit();
  },
};
