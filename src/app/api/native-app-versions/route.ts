import { NextResponse } from "next/server";

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

const validStoreUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "apps.apple.com";
  } catch {
    return false;
  }
};

export async function GET() {
  const latestVersion = String(process.env.IOS_LATEST_VERSION || "1.0.1").trim();
  const minimumVersion = String(process.env.IOS_MINIMUM_VERSION || "1.0.0").trim();
  const storeUrl = String(process.env.IOS_APP_STORE_URL || "").trim();
  const enabled = VERSION_PATTERN.test(latestVersion)
    && VERSION_PATTERN.test(minimumVersion)
    && validStoreUrl(storeUrl);

  return NextResponse.json(
    {
      ios: {
        enabled,
        latestVersion: enabled ? latestVersion : "",
        minimumVersion: enabled ? minimumVersion : "",
        storeUrl: enabled ? storeUrl : "",
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
      },
    },
  );
}
