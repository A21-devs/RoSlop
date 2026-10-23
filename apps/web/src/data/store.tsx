import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { windowElapsed, windowExpired, type TableName } from "@roslop/core";
import type { Change, Db, Snapshot, User } from "./db";
import { demoDb } from "./demo";
import { cloudDb } from "./supabase";

// Built-in config wins. Otherwise people paste their own project in on first run.
function cloudConfig(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (url && key) return { url, key };
  try {
    return JSON.parse(localStorage.getItem("roslop-cloud") ?? "null");
  } catch {
    return null;
  }
}

export function connectCloud(url: string, key: string | null) {
  if (key) localStorage.setItem("roslop-cloud", JSON.stringify({ url: url.trim().replace(/\/$/, ""), key: key.trim() }));
  else localStorage.removeItem("roslop-cloud");
  location.reload();
}

const cloud = cloudConfig();
export const db: Db = cloud ? cloudDb(cloud.url, cloud.key) : demoDb();

// Small notices at the bottom of the screen. Errors land here instead of vanishing.
type Toast = { id: number; text: string; bad: boolean };
const toastListeners = new Set<(t: Toast[]) => void>();
let toasts: Toast[] = [];

export function toast(text: string, bad = false) {
  const t = { id: Date.now() + Math.random(), text, bad };
  toasts = [...toasts.filter(x => x.text !== text), t].slice(-3);
  toastListeners.forEach(l => l(toasts));
  setTimeout(() => {
    toasts = toasts.filter(x => x.id !== t.id);
    toastListeners.forEach(l => l(toasts));
  }, bad ? 9000 : 3500);
}

export function useToasts() {
  const [list, setList] = useState(toasts);
  useEffect(() => {
    toastListeners.add(setList);
    return () => {
      toastListeners.delete(setList);
    };
  }, []);
  return list;
}

addEventListener("unhandledrejection", e => {
  const r = e.reason as { message?: string } | undefined;
  toast(r?.message ?? "Something went wrong", true);
});

interface Ctx {
  user: User | null | undefined;
  snap: Snapshot | null;
  problem: string | null;
  retry(): void;
  game: string;
  setGame(id: string): void;
}

const DataCtx = createContext<Ctx>({ user: undefined, snap: null, problem: null, retry() {}, game: "all", setGame() {} });

function apply(s: Snapshot, c: Change): Snapshot {
  if (c.table === "settings") return { ...s, settings: { ...s.settings, ...c.row } };
  const rows = s[c.table as TableName] as { id: string }[];
  if (c.gone) return { ...s, [c.table]: rows.filter(r => r.id !== c.row.id) };
  const i = rows.findIndex(r => r.id === c.row.id);
  const next = i < 0 ? [...rows, c.row] : rows.map((r, j) => (j === i ? c.row : r));
  return { ...s, [c.table]: next };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [game, setGame] = useState(() => localStorage.getItem("roslop-game") ?? "all");

  useEffect(() => db.onAuth(setUser), []);

  useEffect(() => {
    if (!user) {
      setSnap(null);
      return;
    }
    let off = () => {};
    let alive = true;
    db.load().then(s => {
      if (!alive) return;
      setProblem(null);
      setSnap(s);
      off = db.subscribe(c => setSnap(prev => (prev ? apply(prev, c) : prev)));
    }, e => alive && setProblem(e.message));

    // Catch anything realtime missed while the app was asleep or in the background.
    const resync = () => {
      if (document.visibilityState !== "visible" || db.mode === "demo") return;
      db.load().then(s => alive && setSnap(s), () => {});
    };
    const timer = setInterval(resync, 90000);
    document.addEventListener("visibilitychange", resync);
    return () => {
      alive = false;
      off();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", resync);
    };
  }, [user?.id, attempt]);

  const value = useMemo(() => ({
    user, snap, game, problem,
    retry: () => setAttempt(a => a + 1),
    setGame(id: string) {
      localStorage.setItem("roslop-game", id);
      setGame(id);
    },
  }), [user, snap, game, problem]);

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function useData() {
  return useContext(DataCtx);
}

// Only call inside screens that render after sign-in.
export function useSnap(): Snapshot {
  return useContext(DataCtx).snap!;
}

export function useGameFilter<T extends { game_id: string | null }>(rows: T[]): T[] {
  const { game } = useData();
  return game === "all" ? rows : rows.filter(r => r.game_id === game || r.game_id === null);
}

export function useUsage() {
  const s = useSnap();
  const win = [...s.usage_windows].sort((a, b) => b.started_at.localeCompare(a.started_at))[0];
  const fresh = !win || windowExpired(win.started_at);
  return {
    used: fresh ? 0 : win.used,
    elapsed: fresh ? 0 : windowElapsed(win.started_at),
    startedAt: fresh ? null : win.started_at,
    cap: s.settings.cap,
  };
}
