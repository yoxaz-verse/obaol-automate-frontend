import { NextResponse } from "next/server";

const resolveBackendBase = (origin: string) => {
    const explicit =
        process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
        process.env.NEXT_PUBLIC_OBAOL_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "";
    if (explicit) {
        return explicit.replace(/\/+$/, "");
    }
    // Fall back to same-host proxy so public pages work without auth/CORS issues.
    return origin;
};

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const origin = new URL(req.url).origin;
        const backendBase = resolveBackendBase(origin);
        const slug = searchParams.get("slug") || "";
        const limit = searchParams.get("limit") || "300";
        const subCategory = searchParams.get("subCategory") || "";

        let backendUrl = "";
        if (slug) {
            backendUrl = `${backendBase}/api/v1/web/products/slug/${encodeURIComponent(slug)}`;
        } else {
            const params = new URLSearchParams({ limit });
            if (subCategory) params.set("subCategory", subCategory);
            backendUrl = `${backendBase}/api/v1/web/products?${params.toString()}`;
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
