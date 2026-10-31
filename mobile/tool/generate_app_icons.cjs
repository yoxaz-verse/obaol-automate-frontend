const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const mobileRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(mobileRoot, "..");
const sourceIcon = path.join(projectRoot, "desktop", "build", "icon.png");
const iosIconDir = path.join(
  mobileRoot,
  "ios",
  "Runner",
  "Assets.xcassets",
  "AppIcon.appiconset",
);
const androidResDir = path.join(mobileRoot, "android", "app", "src", "main", "res");

const iosIcons = {
  "Icon-App-20x20@1x.png": 20,
  "Icon-App-20x20@2x.png": 40,
  "Icon-App-20x20@3x.png": 60,
  "Icon-App-29x29@1x.png": 29,
  "Icon-App-29x29@2x.png": 58,
  "Icon-App-29x29@3x.png": 87,
  "Icon-App-40x40@1x.png": 40,
  "Icon-App-40x40@2x.png": 80,
  "Icon-App-40x40@3x.png": 120,
  "Icon-App-60x60@2x.png": 120,
  "Icon-App-60x60@3x.png": 180,
  "Icon-App-76x76@1x.png": 76,
  "Icon-App-76x76@2x.png": 152,
  "Icon-App-83.5x83.5@2x.png": 167,
  "Icon-App-1024x1024@1x.png": 1024,
};

const androidIcons = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

async function renderIcon(size, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(sourceIcon)
    .resize(size, size, { fit: "fill", kernel: sharp.kernel.lanczos3 })
    .flatten({ background: "#000000" })
    .removeAlpha()
    .png()
    .toFile(outputPath);
}

async function main() {
  if (!fs.existsSync(sourceIcon)) {
    throw new Error(`Missing desktop master icon: ${sourceIcon}`);
  }

  await Promise.all([
    ...Object.entries(iosIcons).map(([filename, size]) =>
      renderIcon(size, path.join(iosIconDir, filename)),
    ),
    ...Object.entries(androidIcons).map(([directory, size]) =>
      renderIcon(size, path.join(androidResDir, directory, "ic_launcher.png")),
    ),
    renderIcon(
      512,
      path.join(mobileRoot, "android", "app", "src", "main", "ic_launcher-playstore.png"),
    ),
  ]);

  console.log(
    `Generated ${Object.keys(iosIcons).length} iOS icons and ${Object.keys(androidIcons).length + 1} Android icons.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
