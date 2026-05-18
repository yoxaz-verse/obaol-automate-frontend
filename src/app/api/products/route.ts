import { NextResponse } from "next/server";
import { buildPublicWebApiUrl } from "@/utils/publicApi";

export const dynamic = "force-dynamic";
const REVALIDATE_SECONDS = 45;

export async function GET(req: Request) {
    const startedAt = Date.now();
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug") || "";
        const limit = searchParams.get("limit") || "300";
        const page = searchParams.get("page") || "1";
        const subCategory = searchParams.get("subCategory") || "";
        const summary = searchParams.get("summary") || "";

        let backendUrl = "";
        if (slug && summary === "1") {
            backendUrl = buildPublicWebApiUrl(`/products/slug/${encodeURIComponent(slug)}/summary`);
        } else if (slug) {
            backendUrl = buildPublicWebApiUrl(`/products/slug/${encodeURIComponent(slug)}`);
        } else {
            const params = new URLSearchParams({ limit, page });
            if (subCategory) params.set("subCategory", subCategory);
            backendUrl = buildPublicWebApiUrl(`/products?${params.toString()}`);
        }

        const res = await fetch(backendUrl, {
            next: { revalidate: REVALIDATE_SECONDS },
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.error(`[/api/products] Backend error ${res.status}: ${text}`);
            return NextResponse.json(
                { success: false, message: `Backend returned ${res.status}` },
                { status: res.status }
            );
        }

        const data = await res.json();
        const durationMs = Date.now() - startedAt;
        const payloadBytes = Buffer.byteLength(JSON.stringify(data), "utf8");
        if (process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview") {
            console.info(
                `[/api/products] ${res.status} ${durationMs}ms ${payloadBytes}B page=${page} limit=${limit} slug=${slug || "-"}`
            );
        }
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=120`,
            },
        });
    } catch (error: any) {
        console.error("[/api/products] Failed to proxy products:", error?.message || error);
        return NextResponse.json(
            { success: false, message: "Failed to load products." },
            { status: 500 }
        );
    }
}
