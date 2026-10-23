import { blenderBrief, type Game, type Settings, type Task } from "@roslop/core";
import { PROMPTS, SHARED } from "../prompts";
import { isVaultTask, notesFor } from "./vault";

export function systemPrompt(task: Task, game: Game | null, cwd: string, settings: Settings, keyNames: string[]): string {
  const lines = ["## This job", `Game: ${game?.name ?? "none yet"}`, `Project folder: ${cwd}`];

  const apps = settings.apps.filter(a => a.on && a.agents.includes(task.agent));
  if (apps.length) {
    lines.push("", "Apps you can use on this computer:");
    for (const a of apps) lines.push(`- ${a.name}: ${a.path} (${a.use})`);
  }

  const connectors = Object.entries(settings.connectors).filter(([, on]) => on).map(([id]) => id);
  if (connectors.length) lines.push("", `Connected: ${connectors.join(", ")}`);

  const blenderOn = settings.connectors.blender || settings.apps.some(a => a.on && /blender/i.test(a.name));
  if (blenderOn && ["librarian", "scenic", "splash", "builder"].includes(task.agent)) {
    lines.push("", "Rules for anything you make in Blender:", blenderBrief(settings.blender));
  }

  if (keyNames.length) lines.push("", `Keys are in these env vars, never print them: ${keyNames.join(", ")}`);

  if (settings.vault_path) {
    lines.push(
      "",
      `Obsidian vault: ${settings.vault_path}`,
      "- Notes are plain .md files you write straight into it. Folders: Games, Design, References (images in References/img), Market, Lessons.",
      "- Start every note with frontmatter: `for: [agent ids that should read it]` and `tags: [...]`.",
      "- Link related notes with [[Note name]], and add each new note under its heading in Home.md.",
      "- References: search the web, keep the ones that are actually useful. One note each with the source link, what it shows and what we take from it. Download images with curl into References/img and embed them with ![[file.png]].",
      "- Short and specific beats long. Check what's there first and update a note instead of making a near copy.",
      isVaultTask(task)
        ? "- This job is vault work. The notes are the deliverable, so write the files, then list each path you made or changed in your DONE line."
        : "- Not vault work? Only add a note to Lessons when you learned something the crew should remember.",
    );
  }

  if (settings.savings.tagged_notes && settings.vault_path) {
    const notes = notesFor(settings.vault_path, task.agent);
    if (notes.length) {
      lines.push("", "Vault notes for you:");
      for (const n of notes) lines.push(`- ${n}`);
    }
  }

  return [SHARED.trim(), PROMPTS[task.agent].trim(), lines.join("\n")].join("\n\n");
}

export function keyEnvName(id: string) {
  return `ROSLOP_${id.toUpperCase()}`;
}
