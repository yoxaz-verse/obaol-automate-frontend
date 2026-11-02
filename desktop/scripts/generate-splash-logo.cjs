const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const desktopRoot = path.resolve(__dirname, "..");
const sourcePath = path.resolve(desktopRoot, "../public/logo-dark.png");
const outputPath = path.join(desktopRoot, "build/splash-logo.webp");

async function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing official transparent OBAOL wordmark: ${sourcePath}`);
  }

  await sharp(sourcePath)
    .ensureAlpha()
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ lossless: true, alphaQuality: 100 })
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();
  if (!metadata.hasAlpha || metadata.channels !== 4) {
    throw new Error("Generated splash logo does not preserve transparency.");
  }

  console.log(`Generated transparent splash logo: ${metadata.width}x${metadata.height}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
