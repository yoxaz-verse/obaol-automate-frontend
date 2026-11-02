import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = fileURLToPath(new URL("../src", import.meta.url));
const sourceExtensions = new Set([".css", ".js", ".jsx", ".ts", ".tsx"]);

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return sourceExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

const exactNeutralExceptions = new Map([
  ["app/globals.css", [/--functional-black:\s*#000000/]],
  ["app/dashboard/documentation-templates/page.tsx", [/color:\s*"#000000"/, /\|\|\s*"#000000"/, /placeholder="\\#000000"/]],
  ["components/dashboard/Documents/TemplateCanvasRenderer.tsx", [/return isValidHexColor\(color\) \? color : "#000000"/, /rgba\(0,0,0,0\.12\)/]],
  ["components/home/CinematicIntro.tsx", [/mask-image:radial-gradient\([^\n]*#000_10%/]],
  ["components/home/ServiceShowcase.tsx", [/maskImage:.*rgba\(0,0,0,0\.9\)/i, /data-service-overlay-.*rgba\(0,0,0,0\.(?:75|8)\)/]],
  ["components/Warehouse/WarehouseLocationPicker.tsx", [/box-shadow:.*rgba\(0, 0, 0, 0\.35\)/]],
  ["components/Warehouse/WarehouseRentMap.tsx", [/box-shadow:.*rgba\(0,0,0,0\.45\)/]],
]);

const forbiddenUtility = /(?:text|bg|border|from|via|to)-(?:slate|gray|zinc|neutral|stone)-(?:900|950)\b/g;
const forbiddenLiteral = /#(?:000000|000)(?![0-9a-f])|rgba?\(\s*0\s*,\s*0\s*,\s*0/gi;
const forbiddenNearBlack = /#(?:020617|0f172a|111827|171717|18181b|1c1917)\b/gi;

function isAllowed(rel, line) {
  return (exactNeutralExceptions.get(rel) || []).some((pattern) => pattern.test(line));
}

test("application UI does not bypass the OBAOL ink palette", () => {
  const violations = [];
  for (const file of sourceFiles(sourceRoot)) {
    const rel = relative(sourceRoot, file).replaceAll("\\", "/");
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      forbiddenUtility.lastIndex = 0;
      forbiddenNearBlack.lastIndex = 0;
      forbiddenLiteral.lastIndex = 0;
      const paletteBypass = forbiddenUtility.test(line) || forbiddenNearBlack.test(line) || forbiddenLiteral.test(line);
      if (paletteBypass && !isAllowed(rel, line)) violations.push(`${rel}:${index + 1}: ${line.trim()}`);
    });
  }
  assert.deepEqual(violations, [], `Unapproved near-black UI colors:\n${violations.join("\n")}`);
});
