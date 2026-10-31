import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const fingerprints = String(process.env.ANDROID_APP_LINK_SHA256 || "").split(",").map((value) => value.trim()).filter(Boolean);
  const body = fingerprints.length ? [{ relation: ["delegate_permission/common.handle_all_urls"], target: { namespace: "android_app", package_name: "com.obaol.app", sha256_cert_fingerprints: fingerprints } }] : [];
  return NextResponse.json(body, { headers: { "Cache-Control": "public, max-age=3600" } });
}
