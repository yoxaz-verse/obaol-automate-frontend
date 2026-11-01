import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (relative) => readFileSync(path.join(root, relative), "utf8");

test("Tailwind and NextUI expose the approved site palette", () => {
  const config = read("tailwind.config.ts");
  for (const color of ["#EEE9DF", "#C9C1B1", "#2C3B4D", "#FFB162", "#A35139", "#1B2632"]) {
    assert.match(config, new RegExp(color, "i"), `missing palette color ${color}`);
  }
  assert.match(config, /background: brandPalette\.palladian/);
  assert.match(config, /background: brandPalette\.abyssal/);
});

test("shared chart palette follows the brand series order", () => {
  const theme = read("src/utils/chartTheme.ts");
  const order = ["chartPalette.flame", "chartPalette.truffle", "chartPalette.blue", "chartPalette.oatmeal", "chartPalette.warm"];
  let cursor = -1;
  for (const token of order) {
    const next = theme.indexOf(token, cursor + 1);
    assert.ok(next > cursor, `chart series is missing or out of order: ${token}`);
    cursor = next;
  }
});

test("core light and dark theme pairs meet WCAG AA contrast", () => {
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/../g).map((value) => parseInt(value, 16) / 255);
    const [red, green, blue] = channels.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const contrast = (left, right) => {
    const values = [luminance(left), luminance(right)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  const pairs = [
    ["#1B2632", "#EEE9DF", "light body text"],
    ["#1B2632", "#FFB162", "primary button"],
    ["#A35139", "#EEE9DF", "light accent text"],
    ["#EEE9DF", "#2C3B4D", "dark panel text"],
    ["#C9C1B1", "#1B2632", "dark muted text"],
  ];
  for (const [foreground, background, label] of pairs) {
    assert.ok(contrast(foreground, background) >= 4.5, `${label} must meet 4.5:1`);
  }
});

test("legacy gold hex values cannot return to frontend source", () => {
  const forbidden = /#(?:cf983c|b47c2d|ddb368|d6a24a)\b/i;
  const scan = (directory) => readdirSync(directory).flatMap((entry) => {
    const target = path.join(directory, entry);
    if (statSync(target).isDirectory()) return scan(target);
    return /\.(?:css|tsx?|jsx?)$/.test(entry) ? [target] : [];
  });
  const offenders = scan(path.join(root, "src")).filter((file) => forbidden.test(readFileSync(file, "utf8")));
  assert.deepEqual(offenders.map((file) => path.relative(root, file)), []);
});
