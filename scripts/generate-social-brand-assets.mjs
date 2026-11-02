import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "public");
const sourcePath = path.join(publicDir, "logo-dark.png");
const socialDir = path.join(publicDir, "social");
const iconDir = path.join(publicDir, "icons");
const background = { r: 27, g: 38, b: 50, alpha: 1 };

await mkdir(socialDir, { recursive: true });
await mkdir(iconDir, { recursive: true });

const source = sharp(sourcePath).ensureAlpha();
const metadata = await source.metadata();
if (metadata.width !== 2256 || metadata.height !== 630) {
  throw new Error(`Unexpected logo-dark.png dimensions: ${metadata.width}x${metadata.height}`);
}

const shareWordmark = await source
  .clone()
  .resize({ width: 860, withoutEnlargement: true })
  .png()
  .toBuffer();

await sharp({ create: { width: 1200, height: 630, channels: 4, background } })
  .composite([{ input: shareWordmark, gravity: "center" }])
  .flatten({ background })
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .toFile(path.join(socialDir, "obaol-share-v2.png"));

// Compact O/pin construction for small icons. Rebuilding the emblem avoids
// carrying the full wordmark underline and fine shadow pixels into 16px art.
const trimmedEmblem = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <circle cx="256" cy="220" r="184" fill="#eee9df"/>
  <circle cx="256" cy="220" r="94" fill="#1b2632"/>
  <circle cx="256" cy="220" r="66" fill="#ffb162"/>
  <circle cx="256" cy="220" r="34" fill="#1b2632"/>
  <rect x="239" y="257" width="34" height="210" rx="17" fill="#ffb162"/>
</svg>`);

async function renderIcon(size, filename, safeScale = 0.66) {
  const markSize = Math.max(8, Math.round(size * safeScale));
  const mark = await sharp(trimmedEmblem)
    .resize(markSize, markSize, { fit: "contain", kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
  const output = await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, gravity: "center" }])
    .flatten({ background })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(path.join(iconDir, filename), output);
  return output;
}

const sizes = [16, 32, 48, 180, 192, 512];
const iconBuffers = new Map();
for (const size of sizes) {
  iconBuffers.set(size, await renderIcon(size, `obaol-icon-v2-${size}.png`));
}
await renderIcon(192, "obaol-icon-maskable-v2-192.png", 0.54);
await renderIcon(512, "obaol-icon-maskable-v2-512.png", 0.54);

function buildIco(entries) {
  const headerSize = 6 + entries.length * 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let offset = headerSize;
  entries.forEach(({ size, data }, index) => {
    const entry = 6 + index * 16;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...entries.map(({ data }) => data)]);
}

await writeFile(path.join(publicDir, "favicon.ico"), buildIco([16, 32, 48].map((size) => ({ size, data: iconBuffers.get(size) }))));
await writeFile(path.join(publicDir, "apple-touch-icon.png"), iconBuffers.get(180));
await writeFile(path.join(publicDir, "pwa", "icon-192.png"), iconBuffers.get(192));
await writeFile(path.join(publicDir, "pwa", "icon-512.png"), iconBuffers.get(512));
await writeFile(path.join(publicDir, "pwa", "icon-maskable-192.png"), await sharp(path.join(iconDir, "obaol-icon-maskable-v2-192.png")).toBuffer());
await writeFile(path.join(publicDir, "pwa", "icon-maskable-512.png"), await sharp(path.join(iconDir, "obaol-icon-maskable-v2-512.png")).toBuffer());

console.log("Generated opaque OBAOL social preview and favicon/PWA icon family.");
