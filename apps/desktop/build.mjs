import { build } from "esbuild";
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dev = process.argv.includes("--dev");
const out = join(here, "dist");
const web = join(here, "../web/dist");

rmSync(out, { recursive: true, force: true });

await build({
  absWorkingDir: here,
  entryPoints: ["src/main.ts", "src/preload.ts"],
  outdir: "dist",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  external: ["electron"],
  loader: { ".md": "text" },
  define: { __DEV_URL__: JSON.stringify(dev ? "http://localhost:5173" : "") },
  sourcemap: dev,
  logLevel: "info",
});

if (existsSync(web)) cpSync(web, join(out, "web"), { recursive: true });
else if (!dev) console.warn("No web build at apps/web/dist, the window will be empty.");
