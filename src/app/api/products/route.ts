import { NextResponse } from "next/server";
import { buildPublicWebApiUrl } from "@/utils/publicApi";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug") || "";
        const limit = searchParams.get("limit") || "300";
        const subCategory = searchParams.get("subCategory") || "";
        const summary = searchParams.get("summary") || "";

        let backendUrl = "";
        if (slug && summary === "1") {
            backendUrl = buildPublicWebApiUrl(`/products/slug/${encodeURIComponent(slug)}/summary`);
        } else if (slug) {
            backendUrl = buildPublicWebApiUrl(`/products/slug/${encodeURIComponent(slug)}`);
        } else {
            const params = new URLSearchParams({ limit });
            if (subCategory) params.set("subCategory", subCategory);
            backendUrl = buildPublicWebApiUrl(`/products?${params.toString()}`);
        }

        const res = await fetch(backendUrl, {
            cache: "no-store",
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
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("[/api/products] Failed to proxy products:", error?.message || error);
        return NextResponse.json(
            { success: false, message: "Failed to load products." },
            { status: 500 }
        );
    }
}
