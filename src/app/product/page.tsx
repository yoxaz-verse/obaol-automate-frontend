import React from "react";
import { Metadata } from "next";
import { Card, CardBody, CardHeader, Divider, Spacer, Image } from "@heroui/react";
import Title from "@/components/titles";

export const metadata: Metadata = {
    title: "Products | OBAOL Supreme",
    description: "Explore our wide range of agricultural and industrial products. Verified quality, transparent rates.",
};

async function getProducts() {
    // Fetch from the new public endpoint
    // Note: Adjust localhost URL if needed for production environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1/web";

    try {
        const res = await fetch(`${apiUrl}/products?limit=1000`, {
            cache: "no-store", // Ensure fresh data
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch products: ${res.status}`);
        }

        const data = await res.json();
        return data.data; // Assuming response structure { success: true, data: { data: [...] } } or { success: true, data: [...] }
    } catch (error) {
        console.error("Error fetching products:", error);
        return null;
    }
}

export default async function ProductPage() {
    const productsResponse = await getProducts();

    // GenericCrudController returns { data: [], pagination: ... } usually in 'data' field of response
    // But wait, CrudEngine.findAll returns { data: [...], pagination: ... }
    // GenericCrudController res.json({ success: true, data: result });
    // So result.data is the array.
    const products = productsResponse?.data || [];

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-[95%] max-w-7xl py-12">
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
                            <Card key={product._id} className="h-full hover:scale-105 transition-transform duration-200">
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
                                    <Spacer y={2} />
                                    {/* If we had images, we'd put them here. For now, description key. */}
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}

                <Spacer y={12} />
            </div>
        </div>
    );
}
