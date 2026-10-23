import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "out");
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();

async function page0() {
  const p = await browser.newPage();
  await p.goto(`file://${here}/shot.html?s=pc-site-desk`);
  const keys = await p.evaluate(() => Object.keys(SHOTS));
  await p.close();
  return keys;
}

const shots = process.argv.slice(2).length ? process.argv.slice(2) : await page0();


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
