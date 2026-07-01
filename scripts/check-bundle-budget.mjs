import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const manifest = JSON.parse(readFileSync(".next/app-build-manifest.json", "utf8"));
const budgets = {
  "/dashboard/page": 300,
  "/page": 250,
  "/auth/page": 200,
};

let failed = false;
for (const [route, budgetKb] of Object.entries(budgets)) {
  const files = [...new Set(manifest.pages?.[route] || [])];
  if (!files.length) throw new Error(`Bundle manifest does not contain ${route}`);
  const gzipKb = files.reduce((total, file) => total + gzipSync(readFileSync(`.next/${file}`)).length, 0) / 1024;
  const rounded = Math.round(gzipKb * 10) / 10;
  console.log(`${route}: ${rounded} KB gzip / ${budgetKb} KB budget`);
  if (gzipKb > budgetKb) failed = true;
}

if (failed) process.exitCode = 1;
