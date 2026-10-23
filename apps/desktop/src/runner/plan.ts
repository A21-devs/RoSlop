import type { SupabaseClient } from "@supabase/supabase-js";
import { AGENT, estimate, readPlan, stripPlan, type Task } from "@roslop/core";
import { randomUUID } from "node:crypto";
import { fail } from "./db";
import { briefVault, isVaultTask } from "./vault";

type History = Pick<Task, "agent" | "used" | "status">[];

// Turns the Lead's ```tasks block into real tasks, plus a message for the owner.
export async function savePlan(db: SupabaseClient, userId: string, lead: Task, text: string, history: History) {
  const planned = readPlan(text);
  const ids = planned.map(() => randomUUID());
  const named = briefVault(lead.brief);
  const vaultLine = named ? `Vault folder: ${named}` : null;

  if (planned.length) {
    const rows = planned.map((p, i) => {
      const parent = p.after?.find(n => n >= 0 && n < ids.length && n !== i);
      return {
        id: ids[i],
        user_id: userId,
        game_id: lead.game_id,
        agent: p.agent,
        // Keep vault work recognisable, so it runs inside the vault folder.
        title: isVaultTask(lead) && !isVaultTask(p) ? `Vault: ${p.title}` : p.title,
        brief: vaultLine && !briefVault(p.brief) ? `${p.brief}\n\n${vaultLine}` : p.brief,
        priority: p.priority,
        status: "queued",
        requested_by: "lead",
        parent_id: parent === undefined ? null : ids[parent],
        needs_studio: AGENT[p.agent].studio,
        estimate: estimate(p.agent, history),
      };
    });
    // One insert, so a child never exists without its parent.
    const { error } = await db.from("tasks").insert(rows);
    fail("Couldn't add the Lead's tasks", error);
  }

  const said = stripPlan(text);
  if (said || ids.length) {
    const { error } = await db.from("messages").insert({ user_id: userId, game_id: lead.game_id, author: "lead", text: said, task_ids: ids });
    fail("Couldn't post the Lead's reply", error);
  }
}
