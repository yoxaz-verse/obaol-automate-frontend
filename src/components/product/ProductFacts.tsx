import React from "react";
import Image from "next/image";
import { FiInfo, FiLayers, FiMapPin, FiExternalLink } from "react-icons/fi";
import { CommodityFacts } from "@/utils/research";

interface ProductFactsProps {
    facts: CommodityFacts;
    productionRegions?: string[];
}

const ProductFacts: React.FC<ProductFactsProps> = ({ facts, productionRegions }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="overflow-hidden rounded-3xl border border-default-200 bg-content1/50 shadow-sm backdrop-blur-md">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[200px_1fr] gap-6 p-6">
                        <div className="relative group">
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-default-100 border border-default-200">
                                {facts.thumbnail ? (
                                    <Image
                                        src={facts.thumbnail}
                                        alt={facts.title}
                                        fill
                                        sizes="(min-width: 1024px) 200px, (min-width: 768px) 33vw, 90vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-obaol-500/5 text-obaol-500">
                                        <FiLayers size={32} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Facts Content */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-warning-700">
                                    <FiInfo size={14} />
                                    Resource Insight
                                </span>
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
                                        <FiMapPin className="text-obaol-500" />
                                        <span>Global Production Centers</span>
                                    </div>
                                )}

                                <a
                                    href={facts.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-obaol-600 hover:text-obaol-500"
                                >
                                    Research Source
                                    <FiExternalLink className="ml-1 inline-block" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {(productionRegions && productionRegions.length > 0) && (
                        <>
                            <div className="h-px bg-default-200/60" />
                            <div className="p-4 bg-default-50/50 flex flex-wrap gap-2">
                                {productionRegions.map((region) => (
                                    <span key={region} className="rounded-full border border-default-200 px-2.5 py-1 text-xs font-medium text-default-600">
                                        {region}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
            </div>
        </div>
    );
};

export default ProductFacts;
