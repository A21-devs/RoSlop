import type { AgentId } from "@roslop/core";
import shared from "@roslop/core/agents/_shared.md";
import architect from "@roslop/core/agents/architect.md";
import balance from "@roslop/core/agents/balance.md";
import builder from "@roslop/core/agents/builder.md";
import frame from "@roslop/core/agents/frame.md";
import kid from "@roslop/core/agents/kid.md";
import lead from "@roslop/core/agents/lead.md";
import librarian from "@roslop/core/agents/librarian.md";
import liveops from "@roslop/core/agents/liveops.md";
import merchant from "@roslop/core/agents/merchant.md";
import playtest from "@roslop/core/agents/playtest.md";
import producer from "@roslop/core/agents/producer.md";
import pulse from "@roslop/core/agents/pulse.md";
import reviewer from "@roslop/core/agents/reviewer.md";
import scenic from "@roslop/core/agents/scenic.md";
import splash from "@roslop/core/agents/splash.md";

export const SHARED = shared;

export const PROMPTS: Record<AgentId, string> = {
  architect, balance, builder, frame, kid, lead, librarian, liveops,
  merchant, playtest, producer, pulse, reviewer, scenic, splash,
};
