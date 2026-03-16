import React from "react";
import { Metadata } from "next";
import { Card, CardBody, CardHeader, Spacer, Image } from "@nextui-org/react";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import CTASection from "@/components/home/ctasection";
import Footer from "@/components/home/footer";
import { buildPublicWebApiUrl, resolvePublicWebApiBase } from "@/utils/publicApi";
const TradeOperatingLayer = nextDynamic(() => import("@/components/home/tradeoperatinglayer"), {
    loading: () => <div className="mx-auto mt-10 h-56 w-[95%] max-w-7xl animate-pulse rounded-2xl bg-default-200/20" />,
});

const BASE_URL = "https://obaol.com";
type ProductRow = {
    _id: string;
    slug?: string;
    name: string;
    description?: string;
    subCategory?: { name?: string } | null;
};

export const metadata: Metadata = {
    title: "Products | OBAOL Supreme",
    description: "Explore global agro‑commodity products with region‑aware sourcing context and verified trade execution support.",
    keywords: [
        "agro commodities",
        "commodity products",
        "global trade",
        "export import",
        "agriculture sourcing",
        "procurement marketplace",
    ],
    alternates: {
        canonical: `${BASE_URL}/product`,
    },
    openGraph: {
        title: "Products | OBAOL Supreme",
        description: "Browse verified agro‑commodity listings and sourcing categories on OBAOL.",
        url: `${BASE_URL}/product`,
        type: "website",
        images: [{ url: "/logo.png", width: 1200, height: 630, alt: "OBAOL Products" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Products | OBAOL Supreme",
        description: "Browse verified agro‑commodity listings and categories on OBAOL.",
        images: ["/logo.png"],
    },
    other: {
        "geo.region": "IN",
        "geo.placename": "Global Commodity Market",
        distribution: "global",
    }
};

export const dynamic = "force-dynamic";

async function getProducts() {
    // Use the internal Next.js API proxy so this works with or without auth
    // In server components we can use an absolute URL to our own Next.js server
    const nextPort = process.env.PORT || 3000;
    const origin = process.env.NEXTAUTH_URL || `http://localhost:${nextPort}`;
    const requestUrl = `${origin}/api/products?limit=300`;

    try {
        const res = await fetch(requestUrl, {
            cache: "no-store",
        });

        if (!res.ok) {
            console.error(`[ProductPage] Fetch failed with status ${res.status}`);
            return [];
        }

        const data = await res.json();
        const payload = data?.data;
        const rows = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
                ? payload
                : [];
        return rows as ProductRow[];
    } catch (error) {
        console.error(`[ProductPage] Error fetching products:`, error);
        return [];
    }
}

export default async function ProductPage() {
    const productsResponse = await getProducts();

    // GenericCrudController returns { data: [], pagination: ... } usually in 'data' field of response
    // But wait, CrudEngine.findAll returns { data: [...], pagination: ... }
    // GenericCrudController res.json({ success: true, data: result });
    // So result.data is the array.
    // GenericCrudController returns { success: true, data: { data: [], totalCount: ... } }
    // So productsResponse is { data: [], totalCount: ... }
    const products = Array.isArray(productsResponse) ? productsResponse : [];

    const itemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "OBAOL Products",
        description: "Global agro‑commodity listings and sourcing categories.",
        url: `${BASE_URL}/product`,
        mainEntity: {
            "@type": "ItemList",
            itemListOrder: "https://schema.org/ItemListOrderAscending",
            itemListElement: products.slice(0, 50).map((product: ProductRow, index: number) => ({
                "@type": "ListItem",
                position: index + 1,
                name: product.name,
                url: product.slug ? `${BASE_URL}/product/${product.slug}` : `${BASE_URL}/product`,
            })),
        },
    };

    return (
        <div className="bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />
            <div className="w-[95%] max-w-7xl mx-auto py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Our Products</h1>
                    <p className="text-default-500 max-w-2xl mx-auto">
                        Discover the comprehensive catalog of commodities and goods we trade and facilitate.
                        From premium agricultural produce to essential raw materials.
                    </p>
                </div>

                {(!products || products.length === 0) ? (
                    <div className="text-center py-20">
                        <p className="text-default-500">No products found at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product: ProductRow) => (
                            <Link
                                key={`${product._id}-product-link`}
                                href={product.slug ? `/product/${product.slug}` : "#"}
                                className={!product.slug ? "pointer-events-none" : "block h-full group"}
                            >
                                <Card className="h-full border-none bg-content1 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                                    <CardHeader className="pb-2 pt-6 px-5 flex-col items-start gap-1">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-primary/70">
                                            {product.subCategory?.name || "Commodity"}
                                        </p>
                                        <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                            {product.name}
                                        </h4>
                                    </CardHeader>
                                    <CardBody className="py-3 px-4">
                                        <p className="text-default-500 text-sm line-clamp-3 leading-relaxed">
                                            {product.description}
                                        </p>
                                        {product.slug && (
                                            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter text-primary group-hover:gap-2 transition-all">
                                                <span>View details</span>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        )}
                                        {/* @ts-ignore */}
                                        <Spacer y={2} />
                                    </CardBody>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {/* @ts-ignore */}
                <Spacer y={12} />
            </div>
            <TradeOperatingLayer />
            <CTASection />
            <Footer />
        </div>
    );
}
