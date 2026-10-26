import type { SupabaseClient } from "@supabase/supabase-js";
import { readMarket, readPitches } from "@roslop/core";
import { fail } from "./db";

// Pulse ends a chart pull with a ```market block. Returns true if there was one.
export async function saveMarket(db: SupabaseClient, userId: string, text: string): Promise<boolean> {
  const market = readMarket(text);
  if (!market) return false;
  const { error } = await db.from("market_snapshots").insert({ user_id: userId, sort: market.sort, items: market.items });
  fail("Couldn't save the chart pull", error);
  return true;
}

// Pitches come back in ```pitch blocks. Returns how many were saved.
export async function savePitches(db: SupabaseClient, userId: string, text: string): Promise<number> {
  const pitches = readPitches(text);
  if (!pitches.length) return 0;
  const rows = pitches.map(p => ({ ...p, user_id: userId, status: "waiting", source: "pulse" }));
  let { error } = await db.from("pitches").insert(rows);
  // Project not set up for the richer pitch yet: keep the basics rather than lose it.
  if (error && /details/.test(error.message)) ({ error } = await db.from("pitches").insert(rows.map(({ details, ...r }) => ({ ...r, why: [r.why, details?.valuation, details?.outreach].filter(Boolean).join("\n\n") }))));
  fail("Couldn't save the pitch", error);
  return pitches.length;
}
