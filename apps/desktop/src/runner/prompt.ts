import { blenderBrief, type Game, type Settings, type StudioLane, type Task } from "@roslop/core";
import { PROMPTS, SHARED } from "../prompts";
import { latestPull } from "./gamedata";
import { isVideo, refName, refPaths } from "./refs";
import { isVaultTask, notesFor } from "./vault";

export function systemPrompt(task: Task, game: Game | null, cwd: string, settings: Settings, keyNames: string[], lane: StudioLane | null = null): string {
  const lines = ["## This job", `Game: ${game?.name ?? "none yet"}`, `Project folder: ${cwd}`];

  if (lane) {
    const others = settings.studio.lanes.filter(l => l.name !== lane.name).map(l => `"${l.name}"${l.type ? ` (${l.type})` : ""}`);
    lines.push(
      "",
      `Your Studio is "${lane.name}"${lane.type ? `, set up for ${lane.type} games` : ""}. Work only in that one${others.length ? `; ${others.join(", ")} belong to other agents` : ""}.`,
    );
  }

  const refs = refPaths(task.brief);
  if (refs.length) lines.push("", "Reference files from the owner, look at these first:", ...refs.map(r => isVideo(r)
    ? `- .roslop/refs/${refName(r)} is a video. You can't watch it, so look at .roslop/refs/${refName(r)}.frames.jpg, 12 frames across it with the time on each. If ffmpeg is installed and you need more, pull frames yourself (ffmpeg -i <video> -vf fps=1 frame_%03d.png).`
    : `- .roslop/refs/${refName(r)}`));

  if (game) {
    const open = process.platform === "win32" ? `start "" /min "<place file>"` : `open -g "<place file>"`;
    lines.push(
      "",
      `Material about ${game.name} itself comes from the game, never from the web: other games' screenshots don't show it. Open the place in Roblox Studio and use the Studio connection to look around, run it and capture screenshots, or ask for a Playtest.`,
      `Keep Studio in the background: start it minimized (${open}${game.project_path ? `, the place is in ${game.project_path}` : ""}) and don't bring windows to the front. If you can't reach Studio, say so in your DONE line instead of using something else.`,
    );
  }

  const apps = settings.apps.filter(a => a.on && a.agents.includes(task.agent));
  if (apps.length) {
    lines.push("", "Apps you can use on this computer:");
    for (const a of apps) lines.push(`- ${a.name}: ${a.path} (${a.use})`);
  }

  const connectors = Object.entries(settings.connectors).filter(([, on]) => on).map(([id]) => id);
  if (connectors.length) lines.push("", `Connected: ${connectors.join(", ")}`);

  const blenderOn = settings.connectors.blender || settings.apps.some(a => a.on && /blender/i.test(a.name));
  const ownRules = /^Model rules \(this task only\):/m.test(task.brief);
  if ((blenderOn || ownRules) && ["librarian", "scenic", "splash", "builder"].includes(task.agent)) {
    lines.push("", ownRules ? "Default rules for models. The model rules in your brief are for this task and win where they differ:" : "Rules for anything you make in Blender:", blenderBrief(settings.blender));
  }

  if (keyNames.length) lines.push("", `Keys are in these env vars, never print them: ${keyNames.join(", ")}`);

  if (settings.vault_path) {
    lines.push(
      "",
      `Obsidian vault: ${settings.vault_path}`,
      "- Notes are plain .md files you write straight into it. Folders: Games (our own games only), Game Types, Design, References (VFX, Modeling, Building, SFX, Animation, UI, each with an img folder), Market, Lessons.",
      "- Start every note with frontmatter: `for: [agent ids that should read it]` and `tags: [...]`.",
      "- Link related notes with [[Note name]], and add each new note under its heading in Home.md.",
      "- References cover VFX, modeling and building most, then SFX, animation and UI, each in its own References/<topic> folder. Search the web, the Roblox creator store and dev forum, YouTube and ArtStation, keep what's actually useful, and download the images with curl into that folder's img and embed them with ![[file.png]]. One note per topic (slash VFX, low poly props, lobby layouts...) with the source links, what makes it work and how to do it in Roblox.",
      "- Short and specific beats long. Check what's there first and update a note instead of making a near copy.",
      "- Never write TBD, TODO, placeholders or made-up numbers. If you don't have a number, leave that line out.",
      isVaultTask(task)
        ? "- This job is vault work. The notes are the deliverable, so write the files, then list each path you made or changed in your DONE line."
        : "- Not vault work? Only add a note to Lessons when you learned something the crew should remember.",
    );
  }

  const pull = settings.vault_path && isVaultTask(task) ? latestPull(settings.vault_path) : null;
  if (pull) {
    lines.push(
      "",
      `Real game data: ${pull.count} Roblox games pulled ${pull.day}, in ${pull.csv} (and the .json next to it), one note per game type in "Game Types" (Tycoon, Tower Defense...) with stats for that type, an index at Game Types/Game Types.md, summary in Market/Charts ${pull.day}.md.`,
      "- Work from this data across many games: group them by genre, age, size and pattern, and back every claim with counts. Don't just study one big game.",
      "- Notes are about topics (Tycoon, Simulator, RPG, a mechanic, a UI habit), never about single games. Don't name games in notes at all: say what the pattern is and how many games do it, e.g. \"31 of 243 tycoons sell a 2x money pass\". Game names stay in the data file.",
      "- Each type note has a data block that refreshes daily; leave it alone and write under \"What works in this type\" (genres: \"What works in this genre\"). New notes for patterns, mechanics and so on link to the types they show up in.",
      "- Read the CSV with a script (Bash and python or node) instead of opening hundreds of notes one by one.",
    );
  }

  if (settings.savings.tagged_notes && settings.vault_path) {
    const notes = notesFor(settings.vault_path, task.agent);
    if (notes.length) {
      lines.push("", "Vault notes for you:");
      for (const n of notes.slice(0, 40)) lines.push(`- ${n}`);
    }
  }

  return [SHARED.trim(), PROMPTS[task.agent].trim(), lines.join("\n")].join("\n\n");
}

export function keyEnvName(id: string) {
  return `ROSLOP_${id.toUpperCase()}`;
}
