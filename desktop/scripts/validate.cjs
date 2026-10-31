const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const required = [
  "src/main.cjs",
  "src/preload.cjs",
  "src/offline.html",
  "build/icon.png",
  "build/icon.ico",
  "build/icon.icns",
  "build/tray.png",
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`Missing desktop assets:\n${missing.map((file) => `- ${file}`).join("\n")}`);
  process.exit(1);
}

const manifest = require(path.join(root, "package.json"));
if (manifest.build?.appId !== "com.obaol.desktop") {
  console.error("Unexpected desktop appId.");
  process.exit(1);
}

console.log(`Desktop package ${manifest.version} is structurally valid.`);
