import { NextRequest, NextResponse } from "next/server";
import { buildPublicWebApiUrl } from "@/utils/publicApi";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const slug = String(params.get("slug") || "").trim();
    const backendUrl = slug
      ? buildPublicWebApiUrl(`/trade-directory/commodities/${encodeURIComponent(slug)}`)
      : buildPublicWebApiUrl(`/trade-directory/commodities?${params.toString()}`);
    const response = await fetch(backendUrl, { cache: "no-store" });
    const payload = await response.json().catch(() => ({ success: false, message: "Invalid directory response." }));
    return NextResponse.json(payload, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Commodity Catalog is temporarily unavailable.", error: error?.message },
      { status: 502 },
    );
  }
}
