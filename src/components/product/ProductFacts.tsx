"use client";

import React from "react";
import { Card, CardBody, Chip, Divider, Link as NextLink, Image } from "@nextui-org/react";
import { FiInfo, FiLayers, FiMapPin, FiExternalLink } from "react-icons/fi";
import { CommodityFacts } from "@/utils/research";

interface ProductFactsProps {
    facts: CommodityFacts;
    productionRegions?: string[];
}

const ProductFacts: React.FC<ProductFactsProps> = ({ facts, productionRegions }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="border-none bg-content1/50 backdrop-blur-md shadow-sm">
                <CardBody className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[200px_1fr] gap-6 p-6">
                        {/* Thumbnail/Image */}
                        <div className="relative group">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-default-100 border border-default-200">
                                {facts.thumbnail ? (
                                    <Image
                                        src={facts.thumbnail}
                                        alt={facts.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-warning-500/5 text-warning-500">
                                        <FiLayers size={32} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Facts Content */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Chip
                                    {...({
                                        startContent: <FiInfo size={14} />,
                                        variant: "flat",
                                        color: "warning",
                                        size: "sm",
                                        className: "font-bold uppercase tracking-wider text-[10px]"
                                    } as any)}
                                >
                                    Resource Insight
                                </Chip>
                                <div className="h-px flex-1 bg-default-100" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-foreground">
                                    About {facts.title}
                                </h3>
                                <p className="text-default-600 text-sm leading-relaxed">
                                    {facts.extract}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-2">
                                {productionRegions && productionRegions.length > 0 && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-default-500">
                                        <FiMapPin className="text-warning-500" />
                                        <span>Global Production Centers</span>
                                    </div>
                                )}

                                <NextLink
                                    href={facts.sourceUrl}
                                    isExternal
                                    showAnchorIcon
                                    anchorIcon={<FiExternalLink className="ml-1" />}
                                    className="text-xs font-bold text-warning-600 hover:text-warning-500"
                                >
                                    Research Source
                                </NextLink>
                            </div>
                        </div>
                    </div>

                    {(productionRegions && productionRegions.length > 0) && (
                        <>
                            <Divider className="opacity-50" />
                            <div className="p-4 bg-default-50/50 flex flex-wrap gap-2">
                                {productionRegions.map((region) => (
                                    <Chip key={region} {...({ size: "sm", variant: "bordered" } as any)} className="border-default-200 text-default-600 font-medium">
                                        {region}
                                    </Chip>
                                ))}
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default ProductFacts;
