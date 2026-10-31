const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const sharp = require("sharp");
const { convertIcon } = require("app-builder-lib/out/util/iconConverter.js");

const desktopRoot = path.resolve(__dirname, "..");
const iconPath = path.join(desktopRoot, "build", "icon.png");

async function writeIco(pngPath, icoPath) {
  const sizes = [16, 32, 48, 64, 128, 256];
  const images = await Promise.all(
    sizes.map((size) => sharp(pngPath).resize(size, size, { fit: "fill" }).png().toBuffer()),
  );
  const headerSize = 6 + sizes.length * 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);

  let imageOffset = headerSize;
  images.forEach((image, index) => {
    const size = sizes[index];
    const entry = 6 + index * 16;
    header.writeUInt8(size === 256 ? 0 : size, entry);
    header.writeUInt8(size === 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(imageOffset, entry + 12);
    imageOffset += image.length;
  });

  fs.writeFileSync(icoPath, Buffer.concat([header, ...images]));
}

async function writeIcns(pngPath, icnsPath) {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "obaol-icon-"));

  try {
    const result = await convertIcon({
      sources: [pngPath],
      fallbackSources: [],
      roots: [path.dirname(pngPath)],
      format: "icns",
      outDir,
    });
    if (!result.icons.length) {
      throw new Error("Electron Builder did not produce an ICNS file.");
    }
    fs.copyFileSync(result.icons[0].file, icnsPath);
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
}

async function main() {
  const source = sharp(iconPath).ensureAlpha();
  const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
  const panel = { left: info.width, top: info.height, right: -1, bottom: -1 };

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      const [red, green, blue, alpha] = data.subarray(offset, offset + 4);
      if (alpha > 0 && Math.max(red, green, blue) <= 12) {
        panel.left = Math.min(panel.left, x);
        panel.top = Math.min(panel.top, y);
        panel.right = Math.max(panel.right, x);
        panel.bottom = Math.max(panel.bottom, y);
      }
    }
  }

  if (panel.right < panel.left || panel.bottom < panel.top) {
    throw new Error("Could not locate the black icon panel in the source icon.");
  }

  const bounds = { left: info.width, top: info.height, right: -1, bottom: -1 };
  for (let y = panel.top; y <= panel.bottom; y += 1) {
    for (let x = panel.left; x <= panel.right; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      const [red, green, blue, alpha] = data.subarray(offset, offset + 4);
      if (alpha > 0 && Math.max(red, green, blue) > 12) {
        bounds.left = Math.min(bounds.left, x);
        bounds.top = Math.min(bounds.top, y);
        bounds.right = Math.max(bounds.right, x);
        bounds.bottom = Math.max(bounds.bottom, y);
      }
    }
  }

  if (bounds.right < bounds.left || bounds.bottom < bounds.top) {
    throw new Error("Could not locate the OBAOL wordmark in the black icon panel.");
  }

  const wordmarkCenterX = (bounds.left + bounds.right) / 2;
  const wordmarkCenterY = (bounds.top + bounds.bottom) / 2;
  const canvasCenterX = (info.width - 1) / 2;
  const canvasCenterY = (info.height - 1) / 2;
  const shiftX = Math.round(canvasCenterX - wordmarkCenterX);
  const shiftY = Math.round(canvasCenterY - wordmarkCenterY);

  const original = await sharp(iconPath)
    .extract({
      left: panel.left,
      top: panel.top,
      width: panel.right - panel.left + 1,
      height: panel.bottom - panel.top + 1,
    })
    .png()
    .toBuffer();
  const rebuilt = await sharp({
    create: {
      width: info.width,
      height: info.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: original, left: panel.left + shiftX, top: panel.top + shiftY }])
    .png()
    .toBuffer();

  fs.writeFileSync(iconPath, rebuilt);
  await writeIco(iconPath, path.join(desktopRoot, "build", "icon.ico"));
  await writeIcns(iconPath, path.join(desktopRoot, "build", "icon.icns"));
  console.log(JSON.stringify({ width: info.width, height: info.height, panel, bounds, shiftX, shiftY }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
