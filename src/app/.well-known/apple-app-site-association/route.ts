import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const teamId = String(process.env.APPLE_TEAM_ID || "").trim();
  const details = teamId ? [{ appIDs: [`${teamId}.com.obaol.app`], components: [{ "/": "/auth*" }, { "/": "/dashboard/*" }, { "/": "/product/*" }, { "/": "/company/*" }] }] : [];
  return NextResponse.json({ applinks: { details } }, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" } });
}
