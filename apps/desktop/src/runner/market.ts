import type { SupabaseClient } from "@supabase/supabase-js";
import { readMarket } from "@roslop/core";
import { fail } from "./db";

// Pulse ends a chart pull with a ```market block. Returns true if there was one.
export async function saveMarket(db: SupabaseClient, userId: string, text: string): Promise<boolean> {
  const market = readMarket(text);
  if (!market) return false;
  const { error } = await db.from("market_snapshots").insert({ user_id: userId, sort: market.sort, items: market.items });
  fail("Couldn't save the chart pull", error);
  return true;
}
