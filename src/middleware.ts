import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveRequestHost } from "@/utils/hostResolution";

export function middleware(request: NextRequest) {
    // NOTE: Language selection is client-driven via cookies (language/googtrans).
    // Middleware should not mutate language cookies during rewrites.
    const url = request.nextUrl;
    const hostResolution = resolveRequestHost(request.headers.get("x-forwarded-host") || request.headers.get("host"));

    // Skip middleware for internal Next.js paths and API routes
    if (
        url.pathname.startsWith("/_next") ||
        url.pathname.startsWith("/api") ||
        url.pathname.startsWith("/static") ||
        url.pathname.includes(".") // common static assets
    ) {
        return NextResponse.next();
    }

    if (url.pathname === "/product" || url.pathname.startsWith("/product/")) {
        const suffix = url.pathname.slice("/product".length);
        const target = url.clone();
        target.pathname = `/trade-directory${suffix}`;
        return NextResponse.redirect(target, 308);
    }

    // Exclude shared routes from subdomain rewrites
    const sharedRoutes = ["/auth", "/dashboard", "/developer", "/admin", "/login", "/register", "/forgot-password"];
    const isSharedRoute = sharedRoutes.some(route => url.pathname.startsWith(route));

    if (
        !isSharedRoute
        && (hostResolution.kind === "subdomain-brand" || hostResolution.kind === "custom-domain-brand")
    ) {
        return NextResponse.rewrite(
            new URL(`/brand/${encodeURIComponent(hostResolution.slug)}${url.pathname}`, request.url)
        );
    }

    // Invalid and unknown local hosts safely fall back to the main platform.
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
