import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get("host") || "";

    // Define allowed domains (main platform domains)
    const mainDomains = [
        "obaol.com",
        "www.obaol.com",
        "localhost:3000",
        "obaol-automate-frontend.vercel.app",
        "automate-frontend.infra.obaol.com", // Backend infra domain if applicable
    ];

    // Skip middleware for internal Next.js paths and API routes
    if (
        url.pathname.startsWith("/_next") ||
        url.pathname.startsWith("/api") ||
        url.pathname.startsWith("/static") ||
        url.pathname.includes(".") // common static assets
    ) {
        return NextResponse.next();
    }

    // If it's a main domain, handle subdomains
    if (mainDomains.some(domain => hostname.includes(domain))) {
        const parts = hostname.split(".");
        // pattern: slug.obaol.com (3 parts) or slug.company.obaol.com (4 parts)
        if (parts.length >= 3 && parts[0] !== "www") {
            const slug = parts[0];
            return NextResponse.rewrite(
                new URL(`/brand/${slug}${url.pathname}`, request.url)
            );
        }
        return NextResponse.next();
    }

    // If we reach here and it's not a localhost/internal domain, 
    // treat it as a custom domain rewrite
    if (!hostname.includes("localhost") && !hostname.includes(".local")) {
        return NextResponse.rewrite(
            new URL(`/brand/${hostname}${url.pathname}`, request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
