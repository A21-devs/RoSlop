import type { Settings, TableName, Tables } from "@roslop/core";
import type { Change, Db, Snapshot, User } from "./db";
import { seed } from "./seed";

const KEY = "roslop-demo";
const USER: User = { id: "demo", email: "sam@demo" };

// Everything lives in this browser. Nothing runs, but every button works.
export function demoDb(): Db {
  let snap: Snapshot = read() ?? seed();
  let signedIn = localStorage.getItem(KEY + "-in") === "1";
  const listeners = new Set<(c: Change) => void>();
  const authListeners = new Set<(u: User | null) => void>();

  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(snap));
    } catch {
      // storage full or blocked, demo keeps working in memory
    }
  };
  const emit = (c: Change) => {
    save();
    listeners.forEach(l => l(c));
  };
  const setIn = (v: boolean) => {
    signedIn = v;
    localStorage.setItem(KEY + "-in", v ? "1" : "0");
    authListeners.forEach(l => l(v ? USER : null));
  };

  return {
    mode: "demo",
    user: () => (signedIn ? USER : null),
    onAuth(cb) {
      authListeners.add(cb);
      cb(signedIn ? USER : null);
      return () => authListeners.delete(cb);
    },
    async signIn() {
      setIn(true);
      return null;
    },
    async signUp() {
      setIn(true);
      return null;
    },
    async providers() {
      return [];
    },
    async signInWith() {
      setIn(true);
      return null;
    },
    async signOut() {
      setIn(false);
    },
    async load() {
      return snap;
    },
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async insert<T extends TableName>(table: T, row: Partial<Tables[T]>) {
      const full = { id: crypto.randomUUID(), user_id: USER.id, created_at: new Date().toISOString(), ...row } as Tables[T];
      snap = { ...snap, [table]: [...snap[table], full] };
      emit({ table, row: full } as Change);
      return full;
    },
    async update<T extends TableName>(table: T, id: string, patch: Partial<Tables[T]>) {
      const rows = snap[table] as Tables[T][];
      const next = rows.map(r => (r.id === id ? { ...r, ...patch } : r));
      snap = { ...snap, [table]: next };
      const row = next.find(r => r.id === id);
      if (row) emit({ table, row } as Change);
    },
    async remove(table, id) {
      snap = { ...snap, [table]: (snap[table] as { id: string }[]).filter(r => r.id !== id) };
      emit({ table, row: { id }, gone: true });
    },
    async clearAssets(which) {
      const gone = snap.assets.filter(a => (which === "references") === (a.kind === "reference"));
      snap = { ...snap, assets: snap.assets.filter(a => !gone.includes(a)) };
      for (const a of gone) emit({ table: "assets", row: { id: a.id }, gone: true });
      return gone.length;
    },
    async saveSettings(patch: Partial<Settings>) {
      snap = { ...snap, settings: { ...snap.settings, ...patch } };
      emit({ table: "settings", row: snap.settings });
    },
    async upload(file) {
      return await new Promise<string>(res => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.readAsDataURL(file);
      });
    },
    async fileUrl(path) {
      return path;
    },
    async session() {
      return null;
    },
  };
}

function read(): Snapshot | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function resetDemo() {
  localStorage.removeItem(KEY);
  location.reload();
}
