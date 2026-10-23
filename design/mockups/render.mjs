import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "out");
mkdirSync(out, { recursive: true });

const shots = process.argv.slice(2).length ? process.argv.slice(2) : ["pc-site", "mac-site", "mac-app", "windows-app", "mobile-site", "mac-app-market", "windows-app-settings"];
const browser = await chromium.launch();

for (const s of shots) {
  const page = await browser.newPage({ deviceScaleFactor: 1.5, viewport: { width: 1800, height: 1200 } });
  await page.goto(`file://${here}/shot.html?s=${s}`);
  await page.evaluate(() => document.fonts.ready);
  const { w, h } = await page.evaluate(() => window.SHOT);
  await page.setViewportSize({ width: w + 112, height: h + 112 });
  await page.screenshot({ path: path.join(out, `${s}.png`) });
  await page.close();
  console.log("saved", s);
}
await browser.close();
