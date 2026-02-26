"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { brandPublicRoutes } from "@/core/api/apiRoutes";
import { variantRateRoutes } from "@/core/api/apiRoutes";
import {
    Avatar,
    Button as HeroButton,
    Card as HeroCard,
    Chip as HeroChip,
    Skeleton,
} from "@heroui/react";

const Button = HeroButton as any;
const Card = HeroCard as any;
const Chip = HeroChip as any;
import {
    LuGlobe,
    LuLinkedin,
    LuFacebook,
    LuTwitter,
    LuInstagram,
    LuArrowRight,
    LuShoppingBag,
    LuInfo,
    LuStar,
    LuExternalLink
} from "react-icons/lu";
import { useParams } from "next/navigation";

export default function BrandPage() {
    const params = useParams();
    const slug = params.slug as string;

    // Fetch company data by subdomain or custom domain
    const { data: companyData, isLoading: isCompanyLoading } = useQuery({
        queryKey: ["brand", slug],
        queryFn: () => getData(`${brandPublicRoutes.details}/${slug}`),
    });

    const company = companyData?.data?.data;

    // Fetch live products for this company
    const { data: productsData, isLoading: isProductsLoading } = useQuery({
        queryKey: ["brand-products", company?._id],
        enabled: !!company?._id,
        queryFn: () => getData(`${brandPublicRoutes.products}/${company._id}`),
    });

    const products = productsData?.data?.data || [];

    if (isCompanyLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,165,0,0.1)_0%,_transparent_50%)]">
                <Skeleton className="w-48 h-48 rounded-full bg-default-200 mb-8" />
                <Skeleton className="w-64 h-8 rounded-lg bg-default-200 mb-4" />
                <Skeleton className="w-96 h-20 rounded-lg bg-default-200" />
            </div>
        );
    }

    if (!company || !company.isWebsiteLive) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">404 • Lost in Space</h1>
                <p className="text-default-400 mb-8 max-w-md">This brand experience is either under construction or doesn't exist in our galaxy yet.</p>
                <Button color="warning" variant="flat" onClick={() => window.location.href = "/"}>Back to OBAOL Cosmos</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-warning-500 selection:text-black">
            {/* Cinematic Hero Section */}
            <section className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden border-b border-white/5">
                {/* Animated Background Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-warning-500/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[100px] -ml-20 -mb-20" />
                    {company.banner && (
                        <img
                            src={company.banner}
                            alt="Banner"
                            className="w-full h-full object-cover opacity-30 mix-blend-overlay scale-110 transform transition-transform duration-10000 hover:scale-100"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl animate-in fade-in zoom-in duration-1000">
                    <Avatar
                        src={company.logo}
                        className="w-32 h-32 md:w-40 md:h-40 border-4 border-warning-500/20 shadow-[0_0_50px_rgba(255,165,0,0.2)] mb-8 bg-default-900"
                    />
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 leading-none">
                        {company.name}
                    </h1>
                    <p className="text-lg md:text-2xl text-warning-500 font-medium max-w-2xl mb-8 drop-shadow-md">
                        {company.description || "The future of quality sourcing."}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {company.tags?.map((tag: string) => (
                            <Chip key={tag} variant="dot" color="warning" className="bg-white/5 border-white/10 text-xs font-bold uppercase tracking-widest">{tag}</Chip>
                        ))}
                    </div>
                    <Button
                        className="mt-12 h-16 px-10 rounded-full bg-gradient-to-r from-warning-500 to-orange-600 font-bold text-lg uppercase tracking-widest shadow-[0_0_40px_rgba(255,165,0,0.4)] hover:shadow-[0_0_60px_rgba(255,165,0,0.6)] transition-all group"
                        onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Explore Marketplace
                        <LuArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </div>
            </section>

            {/* About Section - Glassmorphic Concept */}
            <section className="py-32 px-4 container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 text-warning-500">
                            <div className="w-12 h-[2px] bg-warning-500" />
                            <span className="text-xs font-black uppercase tracking-[0.3em]">The Legacy</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">Beyond Conventional <br /> Sourcing Patterns</h2>
                        <p className="text-default-400 text-lg leading-relaxed text-justify">
                            {company.aboutUs || "Welcome to our space. We are dedicated to providing the highest quality products directly from the source. Our commitment to excellence and innovation drives everything we do."}
                        </p>
                        <div className="grid grid-cols-2 gap-6 pt-8">
                            <Card className="bg-white/5 border-white/10 p-6 shadow-none">
                                <div className="text-3xl font-bold mb-1 text-warning-500">01.</div>
                                <div className="text-sm font-bold uppercase text-white/60">Quality Tech</div>
                            </Card>
                            <Card className="bg-white/5 border-white/10 p-6 shadow-none">
                                <div className="text-3xl font-bold mb-1 text-primary-500">02.</div>
                                <div className="text-sm font-bold uppercase text-white/60">Global Reach</div>
                            </Card>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-warning-500/20 blur-[100px] rounded-full" />
                        <div className="relative bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[40px] p-12 overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity">
                                <LuInfo className="w-24 h-24 text-warning-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <LuGlobe className="text-warning-500" />
                                Online Footprint
                            </h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span className="text-white/40 uppercase text-xs font-black">Official HQ</span>
                                    <span className="text-sm font-medium">{company.address || "Global Offices"}</span>
                                </div>
                                {company.website && (
                                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                        <span className="text-white/40 uppercase text-xs font-black">Nexus Link</span>
                                        <a href={company.website} className="text-sm font-medium text-warning-500 hover:underline">{company.website}</a>
                                    </div>
                                )}
                                <div className="pt-4 flex gap-6">
                                    {company.socialLinks?.linkedin && <a href={company.socialLinks.linkedin} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-warning-500 hover:text-black transition-all"><LuLinkedin /></a>}
                                    {company.socialLinks?.facebook && <a href={company.socialLinks.facebook} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-warning-500 hover:text-black transition-all"><LuFacebook /></a>}
                                    {company.socialLinks?.twitter && <a href={company.socialLinks.twitter} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-warning-500 hover:text-black transition-all"><LuTwitter /></a>}
                                    {company.socialLinks?.instagram && <a href={company.socialLinks.instagram} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-warning-500 hover:text-black transition-all"><LuInstagram /></a>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Marketplace Section - Future Grid */}
            <section id="marketplace" className="py-32 bg-[rgba(255,255,255,0.02)] border-y border-white/5">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Live Marketplace</h2>
                            <p className="text-default-400 max-w-xl">Curated live products and variants available for immediate procurement. Real-time rates fueled by OBAOL intelligence.</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-warning-500">
                            <span className="animate-pulse">●</span> Data Verified
                        </div>
                    </div>

                    {isProductsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-[30px] bg-white/5" />)}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map((rate: any) => (
                                <Card key={rate._id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all rounded-[30px] p-8 overflow-hidden group shadow-none">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-warning-500/10 blur-[50px] group-hover:bg-warning-500/20 transition-all" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="w-12 h-12 rounded-2xl bg-warning-500/20 flex items-center justify-center text-warning-500 italic font-black text-xl">
                                                {rate.product?.name?.charAt(0)}
                                            </div>
                                            <Chip size="sm" color="success" variant="flat" className="h-5 text-[9px] font-black uppercase">In Stock</Chip>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white/40 uppercase tracking-widest mb-1">{rate.product?.name}</h4>
                                            <h3 className="text-2xl font-bold">{rate.variant?.name}</h3>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-warning-500">₹{rate.directTradeRate}</span>
                                            <span className="text-xs text-white/40 uppercase font-bold">/ MT</span>
                                        </div>
                                        <Button
                                            fullWidth
                                            className="h-14 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-warning-500 transition-colors"
                                            onClick={() => alert('Order flow integration coming soon!')}
                                        >
                                            Place Order
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-40 border border-dashed border-white/10 rounded-[40px]">
                            <LuShoppingBag className="w-16 h-16 mx-auto mb-6 text-white/20" />
                            <h3 className="text-xl font-bold mb-2">Marketplace Empty</h3>
                            <p className="text-white/40">This brand hasn't allocated any products to the live marketplace yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Futuristic CTA */}
            <section className="py-40 relative overflow-hidden">
                <div className="absolute inset-0 bg-warning-500/5 mix-blend-overlay" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">Powered by <br /> <span className="text-warning-500 underline decoration-white/10">OBAOL OS</span></h2>
                        <p className="text-xl text-default-400">Join the ecosystem of transparent trade and intelligent sourcing.</p>
                        <div className="flex justify-center gap-6">
                            <Button
                                variant="bordered"
                                className="h-16 px-8 rounded-full border-white/20 font-bold uppercase tracking-widest text-xs hover:border-warning-500 hover:text-warning-500"
                                onClick={() => window.open('https://obaol.com', '_blank')}
                            >
                                Become Partner <LuExternalLink className="ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cyberpunk Footer */}
            <footer className="py-12 border-t border-white/5">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                    <div>© {new Date().getFullYear()} {company.name} // ALL RIGHTS RESERVED</div>
                    <div className="flex items-center gap-2">
                        DESIGNED & SECURED BY <span className="text-warning-500">OBAOL CORE</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
