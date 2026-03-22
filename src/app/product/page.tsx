"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardBody, CardHeader, Image, Input, Button, Skeleton } from "@nextui-org/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiArrowRight, FiPackage, FiGrid, FiList } from "react-icons/fi";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import CTASection from "@/components/home/ctasection";
import ThemedContentWrapper from "@/components/layout/ThemedContentWrapper";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";

type ProductRow = {
    _id: string;
    slug?: string;
    name: string;
    description?: string;
    subCategory?: { name?: string } | null;
};

export default function ProductPage() {
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/products?limit=300");
                const data = await res.json();
                const payload = data?.data;
                const rows = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                setProducts(rows);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const categories = useMemo(() => {
        const cats = new Set<string>();
        cats.add("All");
        products.forEach((p) => {
            if (p.subCategory?.name) {
                cats.add(p.subCategory.name);
            }
        });
        const categoryPriority = ["Spices", "Rices", "Pulses", "Grains", "Buffalo", "Coconut", "Coffee"];
        const allCats = Array.from(cats);
        const hasAll = allCats.includes("All");
        const rest = allCats.filter((c) => c !== "All");
        rest.sort((a, b) => {
            const aIndex = categoryPriority.indexOf(a);
            const bIndex = categoryPriority.indexOf(b);
            const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
            const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
            if (aRank !== bRank) return aRank - bRank;
            return a.localeCompare(b);
        });
        return hasAll ? ["All", ...rest] : rest;
    }, [products]);

    const filteredProducts = useMemo(() => {
        const filtered = products.filter((p) => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory =
                activeCategory === "All" || p.subCategory?.name === activeCategory;
            return matchesSearch && matchesCategory;
        });
        const namePriority: Record<string, number> = {
            // Priority over categories can be added here if specific products need to be first
        };
        const categoryPriority = ["Spices", "Rices", "Pulses", "Grains", "Pulses", "Buffalo", "Coconut"];
        return filtered.sort((a, b) => {
            const aName = a.name?.toLowerCase() || "";
            const bName = b.name?.toLowerCase() || "";
            const aNameRank = namePriority[aName] ?? 100;
            const bNameRank = namePriority[bName] ?? 100;
            if (aNameRank !== bNameRank) return aNameRank - bNameRank;

            const aCat = a.subCategory?.name || "";
            const bCat = b.subCategory?.name || "";
            const aCatIndex = categoryPriority.indexOf(aCat);
            const bCatIndex = categoryPriority.indexOf(bCat);
            const aCatRank = aCatIndex === -1 ? Number.MAX_SAFE_INTEGER : aCatIndex;
            const bCatRank = bCatIndex === -1 ? Number.MAX_SAFE_INTEGER : bCatIndex;
            if (aCatRank !== bCatRank) return aCatRank - bCatRank;

            return a.name.localeCompare(b.name);
        });
    }, [products, searchQuery, activeCategory]);

    return (
        <section className="min-h-screen bg-background">
            <Header />

            <ThemedContentWrapper>
                {/* ── COMPACT HERO & FILTERS ── */}
                <div className="relative pt-20 pb-10 overflow-hidden border-b border-default-100">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[400px] h-[400px] bg-orange-500/5 blur-[100px] rounded-full" />

                    <div className="container mx-auto max-w-7xl px-4 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="space-y-1 text-left max-w-2xl">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                                    Our <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent italic">Catalog</span>
                                </h1>
                                <p className="text-base text-default-500 leading-relaxed">
                                    Premium commodities and raw materials, globally sourced and verified.
                                </p>
                                <div className="mt-4 max-w-2xl">
                                    <IndiaFirstNote />
                                </div>
                            </div>

                            <div className="relative w-full md:w-80 group">
                                <Input
                                    placeholder="Find a commodity..."
                                    startContent={<FiSearch className="text-default-400" />}
                                    value={searchQuery}
                                    onValueChange={setSearchQuery}
                                    variant="bordered"
                                    size="lg"
                                    classNames={{
                                        inputWrapper: "h-14 border-default-200 bg-content1 group-hover:border-orange-500/50 transition-colors rounded-2xl",
                                    }}
                                />
                            </div>
                        </div>

                        {/* ── REFINED CATEGORY PILLS ── */}
                        <div className="mt-8 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest mr-2">Categories:</span>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all border ${activeCategory === cat
                                        ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                                        : "bg-background text-default-500 border-default-200 hover:border-orange-500/30 hover:text-orange-500"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── PRODUCT GRID ── */}
                <div className="container mx-auto max-w-7xl px-4 py-16">

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {[...Array(8)].map((_, i) => (
                                <Card key={i} className="h-64 space-y-5 p-8 rounded-[2rem] shadow-sm bg-content1/50 border border-default-100">
                                    <div className="space-y-3">
                                        <Skeleton className="w-2/5 rounded-lg h-3" />
                                        <Skeleton className="w-4/5 rounded-lg h-6" />
                                        <Skeleton className="w-full rounded-lg h-20" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map((product) => (
                                    <motion.div
                                        key={product._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Link
                                            href={product.slug ? `/product/${product.slug}` : "#"}
                                            className={!product.slug ? "pointer-events-none" : "block h-full group"}
                                        >
                                            <Card className="h-full border border-default-200/50 bg-content1/50 backdrop-blur-md overflow-hidden hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 rounded-[2rem]">
                                                <div className="p-8 pb-0">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-500/70">
                                                            {product.subCategory?.name || "Commodity"}
                                                        </p>
                                                        <h3 className="text-2xl font-bold text-foreground tracking-tight group-hover:text-orange-500 transition-colors line-clamp-2">
                                                            {product.name}
                                                        </h3>
                                                    </div>
                                                </div>

                                                <CardBody className="p-8 pt-6">
                                                    <p className="text-default-500 text-base leading-relaxed line-clamp-3">
                                                        {product.description || "Premium agricultural commodity sourced with excellence and verified for global trade execution."}
                                                    </p>

                                                    <div className="mt-8 pt-6 border-t border-default-100 flex items-center justify-between">
                                                        <span className="text-xs font-bold text-default-400 uppercase tracking-widest">Details</span>
                                                        <div className="w-8 h-8 rounded-full bg-default-100 text-default-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                                            <FiArrowRight />
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <div className="text-center py-40 bg-content1/30 rounded-[3rem] border-2 border-dashed border-default-200">
                            <div className="w-20 h-20 bg-default-100 rounded-full flex items-center justify-center mx-auto mb-6 text-default-300">
                                <FiSearch size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">No products found</h3>
                            <p className="text-default-500">Try adjusting your search or category filters.</p>
                            <Button
                                variant="light"
                                className="mt-6 text-orange-500 font-bold"
                                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                            >
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </div>
            </ThemedContentWrapper>

            <CTASection />
            <Footer />
        </section>
    );
}
