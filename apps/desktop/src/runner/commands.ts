// Splits `npx -y "some server" --stdio` into words, honoring quotes.
export function splitCommand(cmd: string): string[] {
  const words: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(cmd))) words.push(m[1] ?? m[2] ?? m[3]);
  return words;
}

// settings.studio_mcp is either a plain command or a JSON config pasted from the server's readme.
export function mcpConfig(studioMcp: string): object {
  const raw = studioMcp.trim();
  if (raw.startsWith("{")) {
    const parsed = JSON.parse(raw);
    return parsed.mcpServers ? parsed : { mcpServers: { roblox_studio: parsed } };
  }
  const [command, ...args] = splitCommand(raw);
  return { mcpServers: { roblox_studio: { command, args } } };
}

export interface ClaudeRun {
  prompt: string;
  system: string;
  model: string | null;
  resume?: string;
  mcpConfig?: string;
}

export function claudeArgs(r: ClaudeRun): string[] {
  const args = ["-p", r.prompt];
  if (r.resume) args.push("--resume", r.resume);
  args.push("--output-format", "stream-json", "--verbose", "--append-system-prompt", r.system, "--permission-mode", "acceptEdits");
  // -p can't ask for permission, so name what the crew may use. Bash covers Blender, tests and Open Cloud uploads.
  const tools = ["Bash", "Read", "Edit", "Write", "Glob", "Grep", "WebFetch", "WebSearch", "TodoWrite"];
  if (r.mcpConfig) tools.push("mcp__roblox_studio");
  args.push("--allowedTools", tools.join(","));
  if (r.model) args.push("--model", r.model);
  if (r.mcpConfig) args.push("--mcp-config", r.mcpConfig);
  return args;
}

// exec is read-only and refuses non-git folders by default, so let it write in the project folder.
export function codexArgs(prompt: string, model: string | null): string[] {
  const args = ["exec", "--json", "--full-auto", "--skip-git-repo-check"];
  if (model) args.push("--model", model);
  args.push(prompt);
  return args;
}
