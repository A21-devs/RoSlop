import { useEffect, useState } from "react";
import type { RunnerStatus } from "@roslop/core";
import { db, useSnap } from "../data/store";

// Says out loud why nothing is running, instead of leaving tasks sitting there.
export function CrewBar() {
  const s = useSnap();
  const [status, setStatus] = useState<RunnerStatus | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!window.roslop) return;
    window.roslop.status().then(setStatus);
    return window.roslop.onStatus(setStatus);
  }, []);

  const waiting = s.tasks.filter(t => t.status === "queued" || t.status === "held").length;
  const working = s.tasks.some(t => t.status === "working");
  if (!waiting || working) return null;

  let text: string;
  if (db.mode === "demo") {
    text = "This is the demo, so nothing actually runs. Connect your Supabase project from the sign-in screen to run the crew for real.";
  } else if (window.roslop) {
    if (!status) return null;
    text = status.last_error ? `The crew hit a problem: ${status.last_error}` : status.note ?? "";
    if (!text) return null;
  } else {
    const worker = s.machines.find(m => m.role === "worker");
    const online = worker && Date.now() - Date.parse(worker.last_seen) < 3 * 60000;
    if (online) return null;
    text = worker ? `${worker.name} is offline, so ${waiting} ${waiting === 1 ? "task is" : "tasks are"} waiting. They start as soon as it's back.` : "No computer is running the crew yet. Install the desktop app on your PC and sign in there.";
  }

  const recheck = async () => {
    setBusy(true);
    const session = await db.session();
    if (session && window.roslop) {
      await window.roslop.stopRunner();
      setStatus(await window.roslop.startRunner(session));
    }
    setBusy(false);
  };

  return (
    <div className="crewbar">
      <span className="dot warn" />
      <span className="grow">{text}</span>
      {window.roslop && db.mode === "cloud" && <button className="btn sm" disabled={busy} onClick={recheck}>{busy ? "Checking…" : "Check again"}</button>}
    </div>
  );
}
