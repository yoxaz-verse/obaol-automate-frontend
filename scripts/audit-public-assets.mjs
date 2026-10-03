import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const publicRoot = "public";
const searchRoots = ["src", "tests", "next.config.mjs"];
const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx", ".css", ".md", ".mdx", ".mjs", ".json"]);

const walk = (path, files = []) => {
  const stat = statSync(path);
  if (stat.isFile()) return [...files, path];
  for (const entry of readdirSync(path)) files = walk(join(path, entry), files);
  return files;
};

const source = searchRoots.flatMap((path) => walk(path))
  .filter((path) => sourceExtensions.has(extname(path)))
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");

const assets = walk(publicRoot).map((path) => {
  const publicPath = `/${relative(publicRoot, path).split(sep).join("/")}`;
  return { path: publicPath, bytes: statSync(path).size, referenced: source.includes(publicPath) };
}).sort((a, b) => b.bytes - a.bytes);

const summary = {
  generatedAt: new Date().toISOString(),
  totalBytes: assets.reduce((sum, asset) => sum + asset.bytes, 0),
  referencedBytes: assets.filter((asset) => asset.referenced).reduce((sum, asset) => sum + asset.bytes, 0),
  unreferencedBytes: assets.filter((asset) => !asset.referenced).reduce((sum, asset) => sum + asset.bytes, 0),
  largestReferenced: assets.filter((asset) => asset.referenced).slice(0, 25),
  largestUnreferencedCandidates: assets.filter((asset) => !asset.referenced).slice(0, 50),
};

mkdirSync("reports/performance", { recursive: true });
writeFileSync("reports/performance/public-assets.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
