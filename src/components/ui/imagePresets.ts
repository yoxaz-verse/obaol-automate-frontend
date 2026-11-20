export type ImagePresetName = "avatar" | "logo" | "banner" | "product" | "signature";

export type ImagePreset = {
  aspect: number;
  width: number;
  height: number;
  mimeType: "image/webp" | "image/png";
  quality: number;
  shape: "circle" | "rectangle";
  allowRotation: boolean;
  transparent: boolean;
  fit: "cover" | "contain";
};

export const IMAGE_PRESETS: Record<ImagePresetName, ImagePreset> = {
  avatar: { aspect: 1, width: 512, height: 512, mimeType: "image/webp", quality: 0.9, shape: "circle", allowRotation: true, transparent: false, fit: "cover" },
  logo: { aspect: 1, width: 800, height: 800, mimeType: "image/png", quality: 1, shape: "rectangle", allowRotation: true, transparent: true, fit: "contain" },
  banner: { aspect: 16 / 5, width: 1600, height: 500, mimeType: "image/webp", quality: 0.9, shape: "rectangle", allowRotation: true, transparent: false, fit: "cover" },
  product: { aspect: 4 / 3, width: 1200, height: 900, mimeType: "image/webp", quality: 0.9, shape: "rectangle", allowRotation: true, transparent: false, fit: "cover" },
  signature: { aspect: 3, width: 1200, height: 400, mimeType: "image/png", quality: 1, shape: "rectangle", allowRotation: false, transparent: true, fit: "contain" },
};

export const extensionForMimeType = (mimeType: ImagePreset["mimeType"]) => mimeType === "image/png" ? "png" : "webp";
