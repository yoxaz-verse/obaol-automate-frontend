"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardFooter, Image, Button, Spinner, Chip } from "@heroui/react";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";

const PublicCatalogPage = () => {
    const params = useParams();
    const companySlug = params.companySlug as string;
    const { convertRate } = useCurrency();

    // Fetch catalog items for this company
    const { data, isLoading, error } = useQuery({
        queryKey: ["publicCatalog", companySlug],
        queryFn: () => getData(`${apiRoutes.catalog.public}/${companySlug}`),
        enabled: !!companySlug,
    });

    const catalogItems = data?.data?.data || [];
    const companyInfo = data?.data?.company || { name: companySlug };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                {/* @ts-ignore */}
                <Spinner size="lg" label="Loading catalog..." />
            </div>
        );
    }

    if (error || !data?.data?.success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h1 className="text-2xl font-bold text-danger">Catalog Not Found</h1>
                <p className="text-default-500">
                    We couldn't find a catalog for "{companySlug}". Check the URL or try again later.
                </p>
                <Button as={Link} href="/obaol" color="primary" variant="flat">
                    Browse All Products
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            {/* Header */}
            <div className="mb-8 text-center md:text-left border-b border-default-200 pb-6">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent inline-block">
                    {companyInfo.name}
                </h1>
                <p className="text-default-500 mt-2 text-lg">Official Product Catalog</p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {catalogItems.length > 0 ? (
                    catalogItems.map((item: any) => {
                        const product = item.productVariantId?.product;
                        const variant = item.productVariantId;
                        // Use custom title if available, else standard naming
                        const displayName = item.customTitle || `${product?.name} - ${variant?.name}`;
                        const displayDesc = item.customDescription || product?.description || "High quality product from OBAOL network.";
                        const productSlug = variant?.slug || item._id; // Fallback to ID if no slug on variant

                        return (
                            <React.Fragment key={item._id}>
                                {/* @ts-ignore */}
                                <Card
                                    isPressable
                                    as={Link}
                                    href={`/obaol/${companySlug}/${productSlug}`}
                                    className="shadow-sm hover:shadow-md transition-shadow h-full"
                                >
                                    <CardBody className="p-0 aspect-square overflow-hidden relative bg-default-100">
                                        {/* Placeholder for product image logic */}
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-default-100 to-default-200 text-default-400">
                                            <span className="text-4xl">📦</span>
                                        </div>
                                        {/* Price Tag Overlay */}
                                        <div className="absolute bottom-2 right-2">
                                            {/* @ts-ignore */}
                                            <Chip color="success" variant="solid" className="shadow-sm font-bold">
                                                {convertRate(item.finalPrice)}
                                            </Chip>
                                        </div>
                                    </CardBody>
                                    <CardFooter className="flex flex-col items-start gap-1 p-4">
                                        <h3 className="text-lg font-semibold line-clamp-1 w-full">{displayName}</h3>
                                        <p className="text-small text-default-500 line-clamp-2 w-full">
                                            {displayDesc}
                                        </p>
                                    </CardFooter>
                                </Card>
                            </React.Fragment>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-12 text-default-400">
                        <p className="text-xl">No products listed yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicCatalogPage;
