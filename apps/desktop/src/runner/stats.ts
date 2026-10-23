import type { SupabaseClient } from "@supabase/supabase-js";
import type { Game } from "@roslop/core";

const CHUNK = 50;

interface Info {
  id: number;
  playing?: number;
  visits?: number;
  favoritedCount?: number;
}

interface Votes {
  id: number;
  upVotes?: number;
  downVotes?: number;
}

async function get<T>(url: string): Promise<T[]> {
  const res = await fetch(url);
  if (!res.ok) return [];
  const body = (await res.json()) as { data?: T[] };
  return body.data ?? [];
}

export async function recordStats(db: SupabaseClient, userId: string) {
  const { data } = await db.from("games").select("id, universe_id").not("universe_id", "is", null);
  const games = (data ?? []) as Pick<Game, "id" | "universe_id">[];

  for (let i = 0; i < games.length; i += CHUNK) {
    const chunk = games.slice(i, i + CHUNK);
    const ids = chunk.map(g => g.universe_id).join(",");
    const [info, votes] = await Promise.all([
      get<Info>(`https://games.roblox.com/v1/games?universeIds=${ids}`),
      get<Votes>(`https://games.roblox.com/v1/games/votes?universeIds=${ids}`),
    ]);
    const rows = chunk.flatMap(g => {
      const i = info.find(x => x.id === Number(g.universe_id));
      if (!i) return [];
      const v = votes.find(x => x.id === Number(g.universe_id));
      return [{
        user_id: userId,
        game_id: g.id,
        playing: i.playing ?? 0,
        visits: i.visits ?? 0,
        favorites: i.favoritedCount ?? 0,
        up_votes: v?.upVotes ?? 0,
        down_votes: v?.downVotes ?? 0,
      }];
    });
    if (rows.length) await db.from("game_stats").insert(rows);
  }
}
