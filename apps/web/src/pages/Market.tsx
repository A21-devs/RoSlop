import { useMemo, useState } from "react";
import { ago, type MarketItem } from "@roslop/core";
import { messageAgent } from "../data/actions";
import { db, toast, useSnap } from "../data/store";
import { Empty, Icon } from "../ui/bits";

type View = "charts" | "corpus" | "benchmarks" | "breakouts";
type Row = MarketItem & { change: number | null };

const short = (n?: number) => (n === undefined ? "–" : n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : String(n));
const typeOf = (i: MarketItem) => i.subgenre || i.genre || "Other";
const median = (ns: number[]) => (ns.length ? [...ns].sort((a, b) => a - b)[Math.floor(ns.length / 2)] : 0);
const AGES: [string, string, (d: number) => boolean][] = [["any", "Any age", () => true], ["30", "Under a month", d => d <= 30], ["120", "Under 4 months", d => d <= 120], ["365", "Under a year", d => d <= 365], ["old", "Over a year", d => d > 365]];
const SIZES: [string, string, (n: number) => boolean][] = [["any", "Any size", () => true], ["10k", "10k+ playing", n => n >= 10000], ["1k", "1k to 10k", n => n >= 1000 && n < 10000], ["100", "100 to 1k", n => n >= 100 && n < 1000], ["small", "Under 100", n => n < 100]];

function GameRows({ rows, pitch, limit = 100 }: { rows: Row[]; pitch(name: string): void; limit?: number }) {
  const [more, setMore] = useState(limit);
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="row mono dim" style={{ padding: "9px 16px", gap: 12, background: "var(--raise)" }}>
        <span style={{ width: 28 }}>#</span><span className="grow">GAME</span>
        <span style={{ width: 72, textAlign: "right" }}>PLAYING</span>
        <span className="hide-m" style={{ width: 70, textAlign: "right" }}>VISITS</span>
        <span className="hide-m" style={{ width: 52, textAlign: "right" }}>LIKES</span>
        <span className="hide-m" style={{ width: 52, textAlign: "right" }}>AGE</span>
        <span style={{ width: 62, textAlign: "right" }}>CHANGE</span>
        <span className="hide-m" style={{ width: 84 }} />
      </div>
      <div className="list">
        {rows.slice(0, more).map((r, i) => (
          <div key={`${r.universe_id ?? r.name}`} className="row" style={{ padding: "8px 16px", gap: 12 }}>
            <span className="mono dim" style={{ width: 28 }}>{i + 1}</span>
            {r.icon ? <img src={r.icon} alt="" style={{ width: 30, height: 30, borderRadius: 6, flex: "none" }} /> : <span style={{ width: 30, height: 30, borderRadius: 6, background: "var(--raise)", flex: "none" }} />}
            <div className="grow" style={{ minWidth: 0 }}>
              <a className="trunc" style={{ fontWeight: 500, display: "block" }} href={r.place_id ? `https://www.roblox.com/games/${r.place_id}` : undefined} target="_blank" rel="noreferrer">{r.name}</a>
              <div className="muted small trunc">{typeOf(r)}{r.genre && r.subgenre ? ` · ${r.genre}` : ""}{r.quick ? " · quick game signs" : ""}</div>
            </div>
            <span className="mono" style={{ width: 72, textAlign: "right" }}>{short(r.playing)}</span>
            <span className="mono dim hide-m" style={{ width: 70, textAlign: "right" }}>{short(r.visits)}</span>
            <span className="mono dim hide-m" style={{ width: 52, textAlign: "right" }}>{r.likes !== null && r.likes !== undefined ? `${Math.round(r.likes)}%` : "–"}</span>
            <span className="mono dim hide-m" style={{ width: 52, textAlign: "right" }}>{r.age_days !== undefined ? `${r.age_days}d` : "–"}</span>
            <span className="mono" style={{ width: 62, textAlign: "right", color: r.change === null ? "var(--dim)" : r.change < 0 ? "var(--bad)" : "var(--ok)" }}>{r.change === null ? "new" : `${r.change > 0 ? "+" : ""}${Math.round(r.change * 100)}%`}</span>
            <button className="btn sm ghost hide-m" style={{ width: 84 }} onClick={() => pitch(r.name)}><Icon name="pitches" size={13} />Pitch</button>
          </div>
        ))}
      </div>
      {rows.length > more && <button className="btn ghost" style={{ width: "100%", borderRadius: 0 }} onClick={() => setMore(m => m + 200)}>Show more ({(rows.length - more).toLocaleString()} left)</button>}
    </div>
  );
}

export function Market() {
  const s = useSnap();
  const snaps = [...s.market_snapshots].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const now = snaps[0];
  const before = snaps.find(x => x !== now && x.items.length > 20);
  const [view, setView] = useState<View>("charts");
  const [list, setList] = useState<string>("");
  const [genre, setGenre] = useState("all");
  const [type, setType] = useState("all");
  const [age, setAge] = useState("any");
  const [size, setSize] = useState("any");
  const [quick, setQuick] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"playing" | "visits" | "likes" | "newest" | "change">("playing");
  const [pulling, setPulling] = useState(false);

  const rows: Row[] = useMemo(() => {
    const old = new Map((before?.items ?? []).map(i => [i.universe_id ?? i.name, i.playing]));
    return (now?.items ?? []).map(i => {
      const was = old.get(i.universe_id ?? i.name);
      return { ...i, change: was ? (i.playing - was) / was : null };
    });
  }, [now, before]);

  const lists = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) for (const l of r.lists ?? []) if (!l.startsWith("Search")) counts.set(l, (counts.get(l) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]);
  }, [rows]);
  const chart = list || lists[0]?.[0] || "";
  const genres = [...new Set(rows.map(r => r.genre).filter(Boolean))].sort();
  const types = [...new Set(rows.filter(r => genre === "all" || r.genre === genre).map(typeOf))].sort();

  const sorted = (rs: Row[]) => [...rs].sort((a, b) =>
    sort === "visits" ? (b.visits ?? 0) - (a.visits ?? 0)
      : sort === "likes" ? (b.likes ?? 0) - (a.likes ?? 0)
      : sort === "newest" ? (a.age_days ?? 1e9) - (b.age_days ?? 1e9)
      : sort === "change" ? (b.change ?? -1) - (a.change ?? -1)
      : b.playing - a.playing);

  const corpus = sorted(rows.filter(r =>
    (genre === "all" || r.genre === genre) && (type === "all" || typeOf(r) === type)
    && AGES.find(a => a[0] === age)![2](r.age_days ?? 0) && SIZES.find(x => x[0] === size)![2](r.playing)
    && (!quick || r.quick) && (!q || r.name.toLowerCase().includes(q.toLowerCase()))));

  const bench = useMemo(() => {
    const by = new Map<string, Row[]>();
    for (const r of rows) by.set(typeOf(r), [...(by.get(typeOf(r)) ?? []), r]);
    return [...by].filter(([, rs]) => rs.length >= 3).map(([t, rs]) => {
      const total = rs.reduce((a, r) => a + r.playing, 0);
      const top3 = [...rs].sort((a, b) => b.playing - a.playing).slice(0, 3).reduce((a, r) => a + r.playing, 0);
      const fresh = rs.filter(r => (r.age_days ?? 999) <= 120);
      const rated = rs.filter(r => r.likes !== null && r.likes !== undefined);
      return {
        t, genre: rs[0].genre, n: rs.length, total, med: median(rs.map(r => r.playing)),
        top3: total ? top3 / total : 0, fresh: rs.length ? fresh.length / rs.length : 0,
        freshShare: total ? fresh.reduce((a, r) => a + r.playing, 0) / total : 0,
        likes: rated.length ? rated.reduce((a, r) => a + (r.likes ?? 0), 0) / rated.length : null,
        quick: rs.filter(r => r.quick).length / rs.length,
      };
    }).sort((a, b) => b.total - a.total);
  }, [rows]);

  const pull = async () => {
    if (window.roslop) {
      setPulling(true);
      try {
        const r = await window.roslop.pullGames(s.settings.vault_path);
        if (!s.settings.vault_path) await db.saveSettings({ vault_path: r.vault });
        toast(`Pulled ${r.count.toLocaleString()} games`);
      } catch (e) {
        toast(e instanceof Error ? e.message : String(e), true);
      } finally {
        setPulling(false);
      }
    } else {
      await messageAgent(s, "pulse", "Pull the charts", "Pull the charts: what's rising, top played and new this week. No pitches this time, just the market block.", null);
      toast("Asked Pulse. The desktop app pulls 1,000+ games straight from Roblox for free.");
    }
  };
  const pitch = (name: string) => messageAgent(s, "pulse", `Pitch something off ${name}`, `${name} is doing well. Is there a game in this for us? Pitch it if there is, say no if there isn't.`, null).then(() => toast("Sent to Pulse"));
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <div className="content">
      <div className="head">
        <div className="grow"><h1 className="page">Market</h1><p className="lede">Every chart on Roblox plus searches, pulled straight from Roblox. Real numbers, refreshed daily before vault work or whenever you hit pull.</p></div>
        <span className="muted small">{now ? `${now.items.length.toLocaleString()} games, pulled ${ago(now.created_at)} ago` : "Never pulled"}</span>
        <button className="btn" disabled={pulling} onClick={pull}>{pulling ? "Pulling…" : "Pull now"}</button>
      </div>
      {!now ? <Empty>No chart data yet. Hit Pull now. On the desktop app it takes a couple of minutes and uses none of your Claude usage.</Empty> : (
        <>
          <div className="row wrap" style={{ gap: 8, marginBottom: 14 }}>
            {(["charts", "corpus", "benchmarks", "breakouts"] as View[]).map((v, i) => (
              <button key={v} className={`btn ${view === v ? "" : "ghost"}`} style={view === v ? { borderColor: "var(--line-2)", background: "var(--raise)" } : {}} onClick={() => setView(v)}>{i + 1} · {v}</button>
            ))}
          </div>

          {view === "charts" && (
            <>
              <div className="row wrap" style={{ gap: 8, marginBottom: 14 }}>
                {lists.map(([l, n]) => (
                  <button key={l} className={`pill ${chart === l ? "on" : ""}`} style={{ height: 30, padding: "0 12px" }} onClick={() => setList(l)}>{l.toLowerCase()} <span className="mono dim" style={{ marginLeft: 6 }}>{n}</span></button>
                ))}
                {!lists.length && <span className="muted small">This pull came from Pulse, so it has one list. Pull from the desktop app to get every chart.</span>}
              </div>
              <GameRows rows={lists.length ? sorted(rows.filter(r => r.lists?.includes(chart))) : sorted(rows)} pitch={pitch} />
            </>
          )}

          {view === "corpus" && (
            <>
              <div className="row wrap" style={{ gap: 8, marginBottom: 14 }}>
                <select className="input" style={{ width: 170 }} value={genre} onChange={e => { setGenre(e.target.value); setType("all"); }}><option value="all">All genres</option>{genres.map(g => <option key={g}>{g}</option>)}</select>
                <select className="input" style={{ width: 190 }} value={type} onChange={e => setType(e.target.value)}><option value="all">All types</option>{types.map(t => <option key={t}>{t}</option>)}</select>
                <select className="input" style={{ width: 150 }} value={age} onChange={e => setAge(e.target.value)}>{AGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                <select className="input" style={{ width: 140 }} value={size} onChange={e => setSize(e.target.value)}>{SIZES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                <select className="input" style={{ width: 150 }} value={sort} onChange={e => setSort(e.target.value as typeof sort)}>
                  <option value="playing">Most playing</option><option value="visits">Most visits</option><option value="likes">Best liked</option><option value="newest">Newest</option><option value="change">Biggest climb</option>
                </select>
                <button className={`pill ${quick ? "on" : ""}`} style={{ height: 32, padding: "0 12px" }} onClick={() => setQuick(!quick)}>Quick game signs only</button>
                <input className="input grow" style={{ minWidth: 160 }} placeholder="Search names" value={q} onChange={e => setQ(e.target.value)} />
              </div>
              <div className="muted small" style={{ marginBottom: 8 }}>{corpus.length.toLocaleString()} games, {short(corpus.reduce((a, r) => a + r.playing, 0))} playing, median {short(median(corpus.map(r => r.playing)))} per game</div>
              <GameRows rows={corpus} pitch={pitch} />
            </>
          )}

          {view === "benchmarks" && (
            <div className="card" style={{ overflowX: "auto" }}>
              <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr className="mono dim">{["Type", "Games", "Playing", "Median", "Top 3 hold", "New games", "Players in new", "Avg likes", "Quick signs"].map(h => <th key={h} style={{ textAlign: h === "Type" ? "left" : "right", padding: "9px 12px", background: "var(--raise)", fontWeight: 500 }}>{h}</th>)}</tr></thead>
                <tbody>
                  {bench.map(b => (
                    <tr key={b.t} style={{ borderTop: "1px solid var(--line)" }}>
                      <td style={{ padding: "8px 12px" }}><b>{b.t}</b><div className="muted small">{b.genre}</div></td>
                      {[b.n, short(b.total), short(b.med), pct(b.top3), pct(b.fresh), pct(b.freshShare), b.likes === null ? "–" : `${Math.round(b.likes)}%`, pct(b.quick)].map((v, i) => <td key={i} className="mono" style={{ textAlign: "right", padding: "8px 12px" }}>{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === "breakouts" && (
            <div className="col" style={{ gap: 18 }}>
              <div><div className="sec-h"><h3>New and already big</h3><span className="r">made in the last 4 months</span></div><GameRows rows={[...rows].filter(r => (r.age_days ?? 999) <= 120).sort((a, b) => b.playing - a.playing)} pitch={pitch} limit={30} /></div>
              {before && <div><div className="sec-h"><h3>Biggest climbs since the last pull</h3><span className="r">{ago(before.created_at)} ago</span></div><GameRows rows={[...rows].filter(r => r.change !== null && r.playing >= 200).sort((a, b) => (b.change ?? 0) - (a.change ?? 0))} pitch={pitch} limit={30} /></div>}
              <div><div className="sec-h"><h3>Quick games pulling players</h3><span className="r">new, low effort builds doing numbers</span></div><GameRows rows={[...rows].filter(r => r.quick).sort((a, b) => b.playing - a.playing)} pitch={pitch} limit={30} /></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
