import React from "react";
import { Metadata } from "next";
import { Card, CardBody, CardHeader, Spacer } from "@nextui-org/react";
import nextDynamic from "next/dynamic";
import CTASection from "@/components/home/ctasection";
import Footer from "@/components/home/footer";
const TradeOperatingLayer = nextDynamic(() => import("@/components/home/tradeoperatinglayer"), {
    loading: () => <div className="mx-auto mt-10 h-56 w-[95%] max-w-7xl animate-pulse rounded-2xl bg-default-200/20" />,
});

const BASE_URL = "https://obaol.com";

export const metadata: Metadata = {
    title: "Products | OBAOL Supreme",
    description: "Explore OBAOL product categories and verified commodity listings with transparent product context and execution-focused support.",
    alternates: {
        canonical: `${BASE_URL}/product`,
    },
    openGraph: {
        title: "Products | OBAOL Supreme",
        description: "Browse verified product listings and commodity categories on OBAOL.",
        url: `${BASE_URL}/product`,
        type: "website",
        images: [{ url: "/logo.png", width: 1200, height: 630, alt: "OBAOL Products" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Products | OBAOL Supreme",
        description: "Browse verified product listings and commodity categories on OBAOL.",
        images: ["/logo.png"],
    },
};

export const dynamic = "force-dynamic";

async function getProducts() {
    // Fetch from the new public endpoint
    const publicApiBase = process.env.NEXT_PUBLIC_OBAOL_API_BASE_URL || "http://localhost:5001";
    const publicApiPath = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1/web";

    // Ensure we have an absolute URL for server-side fetching
    const apiUrl = publicApiBase.startsWith('http')
        ? `${publicApiBase}${publicApiPath}`
        : `http://localhost:5001${publicApiPath}`;

    try {
        const res = await fetch(`${apiUrl}/products?limit=300`, {
            cache: "no-store", // Ensure fresh data
        });

        if (!res.ok) {
            console.error(`[ProductPage] Fetch failed with status: ${res.status}`);
            return null;
        }

        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error("[ProductPage] Error fetching products:", error);
        return null;
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
    const products = productsResponse?.data || [];

    return (
        <div className="bg-background">
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
                        {products.map((product: any) => (
                            <Card key={`${product._id}-product-card`} className="h-full hover:scale-105 transition-transform duration-200">
                                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                    <p className="text-tiny uppercase font-bold text-primary/80 mb-1">
                                        {product.subCategory?.name || "Commodity"}
                                    </p>
                                    <h4 className="font-bold text-large">{product.name}</h4>
                                </CardHeader>
                                <CardBody className="overflow-visible py-2">
                                    <p className="text-default-500 text-sm line-clamp-3">
                                        {product.description}
                                    </p>
                                    {/* @ts-ignore */}
                                    <Spacer y={2} />
                                    {/* If we had images, we'd put them here. For now, description key. */}
                                </CardBody>
                            </Card>
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
