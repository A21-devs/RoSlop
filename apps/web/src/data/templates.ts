import { AGENT, STAGES, type Game, type Template as Saved } from "@roslop/core";
import { db, toast, useSnap } from "./store";
import type { Snapshot } from "./db";

export interface Template {
  group: string;
  title: string;
  body: (g: string) => string;
}

// Square brackets are the bits you fill in. {g} becomes the game you've got selected.
export const TEMPLATES: Template[] = [
  { group: "Fix", title: "Something's broken", body: g => `In ${g}, when I [what you did], [what happened]. I expected [what should happen]. It happens on [PC / phone / both], [every time / sometimes].` },
  { group: "Fix", title: "Players can cheat it", body: g => `People can [exploit] in ${g}. Close it on the server without slowing down normal players. Done when Reviewer can't reproduce it.` },
  { group: "Fix", title: "Laggy on phones", body: g => `${g} drops frames on phones around [place or moment]. Get it smooth on a mid-range phone without making it look worse. Leave the gameplay alone.` },
  { group: "Fix", title: "Saves go missing", body: g => `Some players in ${g} lose [what] when they [leave / rejoin / switch servers]. Make saving safe and tell me how many people it could have hit.` },

  { group: "First minutes", title: "First 5 minutes", body: g => `New players in ${g} [where they quit or get lost]. By minute 5 they should have [goal] and know what to chase next. No walls of text.` },
  { group: "First minutes", title: "Tutorial nobody reads", body: g => `Replace the ${g} tutorial with something people learn by doing. Clueless Tester should get through it without reading anything.` },
  { group: "First minutes", title: "Make the goal obvious", body: g => `New players in ${g} don't know what to do after [moment]. Make the next goal obvious with the world and UI, not popups.` },

  { group: "Gameplay", title: "A boss fight", body: g => `Add a boss to [zone] in ${g}. It's for [who]. Hard should come from [attacks you dodge, phases, adds], not a huge HP bar. Done when Playtest beats it in 3 to 6 tries with [squad].` },
  { group: "Gameplay", title: "A new zone", body: g => `Add a new zone to ${g} after [zone]. Theme: [theme]. It should take about [time] to clear and unlock [reward].` },
  { group: "Gameplay", title: "A new enemy", body: g => `Add an enemy to [zone] in ${g} that [what makes it different]. It should make players [change how they play].` },
  { group: "Gameplay", title: "A new mechanic", body: g => `Add [mechanic] to ${g}. It should make [part of the game] more interesting without making [other part] pointless.` },
  { group: "Gameplay", title: "A weekend event", body: g => `Plan a weekend event for ${g}: [theme], runs [days], with [reward] people can't get any other way. Nothing that breaks the economy after it ends.` },

  { group: "Feel", title: "Copy a feeling", body: g => `Make [thing] in ${g} feel like [game or clip]. What I like about it is [specific part]. Keep our style.` },
  { group: "Feel", title: "More juice", body: g => `[Action] in ${g} feels flat. Add hit stop, sound, shake or effects until it feels good, but keep it readable on a phone.` },
  { group: "Feel", title: "Too much going on", body: g => `[Effect or screen] in ${g} is too loud, you can't see [what]. Calm it down without losing the impact.` },
  { group: "Feel", title: "Sound pass", body: g => `${g} needs sounds for [actions]. Short, punchy, not annoying the hundredth time.` },

  { group: "Progression", title: "Too slow or too fast", body: g => `[Part of ${g}] feels too [slow / fast] around [level or minute]. It should take about [time]. Show me the numbers before and after.` },
  { group: "Progression", title: "Upgrades that matter", body: g => `Upgrades in ${g} feel samey. Each one should change how you play, not just add 10%. Keep the total power curve about where it is.` },
  { group: "Progression", title: "Rebirth or prestige", body: g => `Add a rebirth to ${g} that unlocks around [level or time]. People should want to do it, not feel punished.` },
  { group: "Progression", title: "Daily reason to come back", body: g => `Give people a reason to come back to ${g} tomorrow: [daily reward / streak / timed thing]. No fear-of-missing-out spam.` },

  { group: "Money", title: "A shop item", body: g => `Add [item] to the ${g} shop for [price]. It's for [who buys it]. It must not [what it can't break].` },
  { group: "Money", title: "A game pass", body: g => `Add a game pass to ${g}: [what it does] for [price]. Worth it for fans, never required to have fun.` },
  { group: "Money", title: "Starter pack", body: g => `Make a starter pack for new players in ${g}: [contents] for [price], offered once, after they've had fun for a few minutes.` },

  { group: "UI", title: "A new menu", body: g => `Add a [menu] to ${g} that shows [what]. It has to work with a thumb on a small phone.` },
  { group: "UI", title: "Clean up the HUD", body: g => `The ${g} HUD is crowded. Keep [what matters most], move or hide the rest. Check it on an iPhone SE and a PC.` },
  { group: "UI", title: "Phone layout", body: g => `[Screen] in ${g} doesn't fit on phones. Fix the layout so nothing hides behind chat or the Roblox buttons.` },

  { group: "Growth", title: "Thumbnail and icon", body: g => `New thumbnail and icon for ${g}. Show [the moment people love], readable at tiny sizes. Give me 3 options.` },
  { group: "Growth", title: "Next update from the numbers", body: g => `Look at how ${g} is doing and tell me the one update that would help most, with the evidence. Then plan it.` },
  { group: "Growth", title: "What's working elsewhere", body: g => `Look at what's climbing on the charts that's close to ${g}. What could we borrow that fits our game?` },

  { group: "Assets", title: "Models from Blender", body: g => `Make [models] for ${g} in Blender, following our Blender rules. Put them in the library with ids.` },
  { group: "Assets", title: "Clean up the library", body: g => `Go through the library for ${g}: name things properly, drop duplicates, and list anything we're missing for [next feature].` },
];

export interface Suggestion {
  title: string;
  why: string;
  body: string;
}

const NEXT: Partial<Record<Game["stage"], (g: string) => [string, string]>> = {
  pitched: g => ["Plan it", `Write the game plan for ${g}: the core loop, the first 5 minutes, what makes money, and who builds what. Keep it to what the first playable needs.`],
  designed: g => ["Build the first playable", `Build the first playable version of ${g} from the plan. Just the core loop, rough is fine. Done when Clueless Tester can play 5 minutes without getting stuck.`],
  assets: g => ["Start building", `Everything's ready for ${g}. Build the core loop with what's in the library.`],
  built: g => ["Balance pass", `Run a balance pass on ${g}. Simulate the first hour and tell me where people would stall or blow through things.`],
  balanced: g => ["Art and thumbnail", `${g} plays well. Get the thumbnail, icon and store art done so it's ready to publish.`],
  ready: g => ["Last checks", `Before ${g} goes live: Reviewer checks money, saves and exploits, Playtest does a full run on phone and PC.`],
  live: g => ["Next update", `${g} is live. Look at the player numbers and plan the next update around wherever people leave.`],
  graded: g => ["What did we learn", `${g} got graded. What should we do differently in the next game? Write it into the vault.`],
};

// Ideas built from what's actually going on with the game you've got selected.
export function suggestions(s: Snapshot, gameId: string): Suggestion[] {
  const game = s.games.find(g => g.id === gameId);
  const out: Suggestion[] = [];

  if (game) {
    const g = game.name;
    const next = NEXT[game.stage]?.(g);
    if (next) out.push({ title: next[0], why: `${g} is at "${STAGES.find(x => x.id === game.stage)?.name}"`, body: next[1] });

    const sentBack = s.proofs.filter(p => p.game_id === game.id && p.verdict === "changes").slice(-2);
    for (const p of sentBack) {
      out.push({ title: `Finish: ${p.title}`, why: "You sent it back", body: `Finish "${p.title}" in ${g}. What I said last time: ${p.feedback ?? "it wasn't right yet"}. Show me before and after.` });
    }

    const stats = s.game_stats.filter(x => x.game_id === game.id);
    const recent = stats.slice(-24).map(x => x.playing);
    const earlier = stats.slice(-48, -24).map(x => x.playing);
    const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
    if (earlier.length > 6 && avg(recent) < avg(earlier) * 0.85) {
      out.push({ title: "Players are dropping", why: `Down ${Math.round((1 - avg(recent) / avg(earlier)) * 100)}% on the day before`, body: `Fewer people are playing ${g} than yesterday. Find out where they leave and fix the biggest one. Show me the evidence first.` });
    }

    const done = s.tasks.filter(t => t.game_id === game.id && t.status === "done").sort((a, b) => (b.finished_at ?? "").localeCompare(a.finished_at ?? ""))[0];
    if (done) {
      out.push({ title: `After "${done.title}"`, why: `${AGENT[done.agent].name} finished it`, body: `${AGENT[done.agent].name} finished "${done.title}" in ${g}${done.result ? ` (${done.result})` : ""}. What's the obvious next step? Do it, and have Playtest check it after.` });
    }
  }

  const mine = s.messages.filter(m => m.author === "you" && (!game || m.game_id !== game.id)).slice(-1)[0];
  if (mine && game) {
    out.push({ title: "Same as last time", why: "Something you asked for on another game", body: `${mine.text}\n\nDo this for ${game.name}, adapted to how it plays.` });
  }

  return out.slice(0, 5);
}

// Your own templates live in settings so they sync. If the database hasn't got the column yet
// (setup not re-run), they stay on this device until it does.
export function useTemplates() {
  const s = useSnap();
  const local = (): Saved[] => {
    try {
      return JSON.parse(localStorage.getItem("roslop-templates") ?? "[]");
    } catch {
      return [];
    }
  };
  const list = [...(s.settings.templates ?? []), ...local().filter(t => !(s.settings.templates ?? []).some(x => x.id === t.id))];
  const write = async (next: Saved[]) => {
    try {
      await db.saveSettings({ templates: next });
      localStorage.removeItem("roslop-templates");
    } catch {
      localStorage.setItem("roslop-templates", JSON.stringify(next));
      toast("Saved on this device only. Run the Supabase setup again so templates sync.", true);
    }
  };
  return {
    list,
    save: (t: Saved) => write([t, ...list]),
    remove: (id: string) => write(list.filter(t => t.id !== id)),
  };
}
