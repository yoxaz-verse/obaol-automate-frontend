"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardBody,
    Image,
    Button,
    Spinner,
    Chip,
    Divider,
    Spacer
} from "@heroui/react";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";

const PublicProductPage = () => {
    const params = useParams();
    const companySlug = params.companySlug as string;
    const productSlug = params.productSlug as string;
    const { convertRate } = useCurrency();

    // Fetch product details
    const { data, isLoading, error } = useQuery({
        queryKey: ["publicProduct", companySlug, productSlug],
        queryFn: () => getData(`${apiRoutes.catalog.publicDetails}/${companySlug}/${productSlug}`),
        enabled: !!companySlug && !!productSlug,
    });

    const catalogItem = data?.data?.data;
    const companyInfo = data?.data?.company || { name: companySlug };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                {/* @ts-ignore */}
                <Spinner size="lg" label="Loading product details..." />
            </div>
        );
    }

    if (error || !data?.data?.success || !catalogItem) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h1 className="text-2xl font-bold text-danger">Product Not Found</h1>
                <p className="text-default-500">
                    We couldn't find this product in {companyInfo.name}'s catalog.
                </p>
                <Button as={Link} href={`/obaol/${companySlug}`} color="primary" variant="flat">
                    Back to Catalog
                </Button>
            </div>
        );
    }

    const product = catalogItem.productVariantId?.product;
    const variant = catalogItem.productVariantId;
    const displayName = catalogItem.customTitle || `${product?.name} - ${variant?.name}`;
    const displayDesc = catalogItem.customDescription || product?.description;

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            {/* Breadcrumb / Back Navigation */}
            <div className="mb-6">
                <Link href={`/obaol/${companySlug}`} className="text-primary hover:underline flex items-center gap-2">
                    ← Back to {companyInfo.name}
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Left: Image / Gallery */}
                <div className="flex flex-col gap-4">
                    <Card className="w-full aspect-square bg-default-100 flex items-center justify-center">
                        <span className="text-6xl">📦</span>
                        {/* TODO: Real Image Component */}
                        {/* <Image src={product?.imageUrl} ... /> */}
                    </Card>
                    {/* Thumbnails if any */}
                </div>

                {/* Right: Details */}
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {displayName}
                    </h1>
                    <p className="text-small text-default-400 mb-4">
                        Category: {product?.category?.name || "General"}
                    </p>

                    <div className="flex items-end gap-3 mb-6">
                        <span className="text-4xl font-bold text-success">
                            {convertRate(catalogItem.finalPrice)}
                        </span>
                        <span className="text-default-400 mb-1">
                            / {variant?.unit || "unit"}
                        </span>
                    </div>

                    <Button
                        size="lg"
                        color="primary"
                        className="font-bold w-full md:w-auto"
                        onPress={() => alert("Inquiry feature coming soon!")}
                    >
                        Send Inquiry
                    </Button>

                    {/* @ts-ignore */}
                    <Spacer y={8} />
                    <Divider />
                    {/* @ts-ignore */}
                    <Spacer y={4} />

                    <div className="prose dark:prose-invert max-w-none">
                        <h3 className="text-xl font-semibold mb-2">Description</h3>
                        <p className="whitespace-pre-wrap text-default-500">
                            {displayDesc}
                        </p>

                        {variant?.specifications && (
                            <>
                                <h3 className="text-xl font-semibold mt-6 mb-2">Specifications</h3>
                                <ul className="list-disc pl-5 text-default-500">
                                    {/* Placeholder for dynamic specs */}
                                    <li>Grade: {variant.grade || "Standard"}</li>
                                    <li>Origin: {variant.origin || "India"}</li>
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProductPage;
