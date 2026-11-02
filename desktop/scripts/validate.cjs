const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const required = [
  "src/main.cjs",
  "src/preload.cjs",
  "src/loading.html",
  "src/offline.html",
  "build/icon.png",
  "build/icon.ico",
  "build/icon.icns",
  "build/tray.png",
  "build/splash-logo.webp",
  "build/opening-chime.wav",
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

const mainSource = fs.readFileSync(path.join(root, "src/main.cjs"), "utf8");
const preloadSource = fs.readFileSync(path.join(root, "src/preload.cjs"), "utf8");
if (!mainSource.includes('"desktop:open-public-page"') || !preloadSource.includes('"desktop:open-public-page"')) {
  console.error("Desktop public-page bridge is incomplete.");
  process.exit(1);
}

if (!mainSource.includes("SPLASH_MINIMUM_MS") || !mainSource.includes("createSplashWindow")) {
  console.error("Desktop cinematic splash flow is incomplete.");
  process.exit(1);
}

if (manifest.version !== "0.1.7" || !manifest.dependencies?.["electron-updater"]) {
  console.error("Desktop updater package or version is incomplete.");
  process.exit(1);
}

for (const channel of ["desktop:update-check", "desktop:update-download", "desktop:update-install", "desktop:update-status"]) {
  if (!mainSource.includes(channel) || !preloadSource.includes(channel)) {
    console.error(`Desktop updater bridge is missing ${channel}.`);
    process.exit(1);
  }
}

const loadingSource = fs.readFileSync(path.join(root, "src/loading.html"), "utf8");
if (!loadingSource.includes("splash-logo.webp") || !loadingSource.includes("opening-chime.wav") || !loadingSource.includes("prefers-reduced-motion")) {
  console.error("Desktop cinematic splash asset or reduced-motion treatment is incomplete.");
  process.exit(1);
}

if (!loadingSource.includes('class="sunburst"') || !loadingSource.includes("const rayCount = 48") || !loadingSource.includes('setAttribute("x1", "0")') || !loadingSource.includes('setAttribute("y1", "0")')) {
  console.error("The desktop splash does not contain the centered 48-ray sunburst.");
  process.exit(1);
}

if (/\.logo-stage\s*\{[^}]*\bbackground\s*:/s.test(loadingSource) || /\.logo-stage\s*\{[^}]*\bpadding\s*:/s.test(loadingSource)) {
  console.error("The splash logo stage must not add a background panel or excess padding.");
  process.exit(1);
}

if (/wave-shell|class="wave"|class="contours"|<ellipse\b/.test(loadingSource)) {
  console.error("The retired waveform or oval contours are still present.");
  process.exit(1);
}

if (loadingSource.includes("statue") || manifest.build.files.some((file) => file.includes("statue"))) {
  console.error("The retired statue splash is still referenced.");
  process.exit(1);
}

sharp(path.join(root, "build/splash-logo.webp")).metadata()
  .then((metadata) => {
    if (!metadata.hasAlpha || metadata.channels !== 4) {
      console.error("The packaged splash logo must contain a real alpha channel.");
      process.exit(1);
    }
    console.log(`Desktop package ${manifest.version} is structurally valid.`);
  })
  .catch((error) => {
    console.error(`Could not inspect the splash logo: ${error.message}`);
    process.exit(1);
  });
