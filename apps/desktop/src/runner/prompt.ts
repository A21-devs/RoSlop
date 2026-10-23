import type { Game, Settings, Task } from "@roslop/core";
import { PROMPTS, SHARED } from "../prompts";
import { notesFor } from "./vault";

export function systemPrompt(task: Task, game: Game | null, cwd: string, settings: Settings, keyNames: string[]): string {
  const lines = ["## This job", `Game: ${game?.name ?? "none yet"}`, `Project folder: ${cwd}`];

  const apps = settings.apps.filter(a => a.on && a.agents.includes(task.agent));
  if (apps.length) {
    lines.push("", "Apps you can use on this computer:");
    for (const a of apps) lines.push(`- ${a.name}: ${a.path} (${a.use})`);
  }

  const connectors = Object.entries(settings.connectors).filter(([, on]) => on).map(([id]) => id);
  if (connectors.length) lines.push("", `Connected: ${connectors.join(", ")}`);

  if (keyNames.length) lines.push("", `Keys are in these env vars, never print them: ${keyNames.join(", ")}`);

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
