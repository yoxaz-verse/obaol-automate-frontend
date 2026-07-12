import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const manifest = JSON.parse(readFileSync(".next/app-build-manifest.json", "utf8"));
const budgets = {
  "/dashboard/page": 300,
  "/page": 250,
  "/auth/page": 200,
  "/product/[slug]/page": 210,
  "/trade-directory/[slug]/page": 210,
  "/procurement/page": 220,
  "/dashboard/inventory/page": 550,
  "/dashboard/rates/page": 220,
  "/dashboard/users/page": 210,
  "/dashboard/essentials/page": 230,
  "/dashboard/payments/page": 210,
  "/dashboard/calculations/page": 240,
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
