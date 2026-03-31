"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { brandPublicRoutes } from "@/core/api/apiRoutes";
import {
    Avatar,
    Button as HeroButton,
    Card as HeroCard,
    Chip as HeroChip,
    Skeleton,
    Divider as HeroDivider,
} from "@heroui/react";

const Button = HeroButton as any;
const Card = HeroCard as any;
const Chip = HeroChip as any;
const Divider = HeroDivider as any;

const strokeStyle = `
  .stroke-text {
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.4);
  }
`;

import { LuGlobe, LuLinkedin, LuFacebook, LuTwitter, LuInstagram, LuArrowRight, LuShoppingBag, LuInfo, LuExternalLink, LuChevronLeft } from "react-icons/lu";
import { useParams } from "next/navigation";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";

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

    const products = productsData?.data?.data?.products || [];

    const capabilityLabels = (Array.isArray(company?.serviceCapabilities) ? company.serviceCapabilities : [])
        .map((cap: string) => String(cap || "").toLowerCase().replace(/_/g, " "))
        .map((cap: string) => cap.replace(/\b\w/g, (c) => c.toUpperCase()));

    if (isCompanyLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
                {/* Skeleton Nav */}
                <div className="h-24 px-8 border-b border-white/5 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-white/5" />
                        <div className="flex flex-col gap-2">
                           <div className="w-32 h-3 bg-white/10 rounded" />
                           <div className="w-20 h-2 bg-white/5 rounded" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex items-center px-8 max-w-7xl mx-auto w-full">
                    <div className="max-w-4xl w-full space-y-12 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded-full bg-white/5" />
                            <div className="w-32 h-2 bg-white/5 rounded" />
                        </div>
                        <div className="space-y-6">
                            <div className="w-full max-w-2xl h-20 bg-white/10 rounded-2xl" />
                            <div className="w-3/4 max-w-xl h-20 bg-white/5 rounded-2xl opacity-40" />
                        </div>
                        <div className="flex gap-6">
                            <div className="w-48 h-20 bg-white/10 rounded-[2rem]" />
                            <div className="w-32 h-20 bg-white/5 rounded-[2rem]" />
                        </div>
                    </div>
                </div>

                {/* Ambient Glow */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                     <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-warning-500/[0.02] rounded-full blur-[120px]" />
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">404 • Lost in Space</h1>
                <p className="text-default-400 mb-8 max-w-md">This brand experience is either under construction or doesn&apos;t exist in our galaxy yet.</p>
                <Button color="warning" variant="flat" onClick={() => window.location.href = "/"}>Back to OBAOL Cosmos</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-warning-500 selection:text-black">
            {!company.isWebsiteLive && (
                <div className="sticky top-0 z-50 bg-warning-500/10 border-b border-warning-500/30 text-warning-100 px-4 py-3 text-sm font-semibold text-center">
                    Preview Mode: This brand page isn&apos;t live yet, but you&apos;re viewing the draft preview.
                </div>
            )}
            {/* --- STANDALONE WEBSITE NAVIGATION --- */}
            <nav className="sticky top-0 z-[60] backdrop-blur-xl border-b border-white/5 bg-black/40">
                <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Avatar
                            src={company.logo}
                            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform"
                        />
                        <div className="flex flex-col">
                           <span className="text-sm font-black uppercase tracking-tight text-white leading-none">{company.name}</span>
                           <span className="text-[8px] font-black uppercase tracking-[0.3em] text-warning-500 mt-1 italic">Verified Industry Partner</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-10">
                        <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">Strategic Ops</button>
                        <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">Inventory Hub</button>
                        <div className="w-px h-10 bg-white/5" />
                        <Button
                            as="a"
                            href="/"
                            variant="flat"
                            className="bg-warning-500 text-black text-[10px] font-black uppercase tracking-widest h-11 px-8 rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
                        >
                            Procure Now
                        </Button>
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-7xl px-8 pt-8">
                <IndiaFirstNote className="border-white/5 bg-white/[0.01] text-white/20" />
            </div>
            {/* --- LUXURY HERO SECTION --- */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Refined Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] bg-warning-500/[0.03] rounded-full blur-[150px]" />
                    <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-[120px]" />
                    {company.banner && (
                        <div className="absolute inset-0 opacity-20 grayscale hover:grayscale-0 transition-all duration-1000">
                             <img src={company.banner} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent lg:to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-20 lg:py-40">
                    <div className="max-w-4xl space-y-12 animate-in slide-in-from-left-10 duration-1000">
                        {/* Global Identity Marker */}
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                <div className="w-4 h-4 rounded-full bg-warning-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] border border-black" />
                                <div className="w-4 h-4 rounded-full bg-white/20 border border-black" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30 italic">Direct Protocol Access</span>
                        </div>

                        {/* Standalone Website Hero Content */}
                        <div className="space-y-4">
                            <h1 className="text-7xl md:text-[9rem] font-black uppercase tracking-tighter leading-[0.8] text-white italic">
                                {company.name.split(' ').map((word: string, i: number) => (
                                    <span key={i} className={i % 2 === 1 ? "text-transparent stroke-text" : "text-white"}>
                                        {word}{" "}
                                    </span>
                                ))}
                            </h1>
                            <div className="flex items-center gap-6 pt-4">
                               <div className="h-0.5 w-20 bg-warning-500" />
                               <p className="text-2xl md:text-3xl font-light text-warning-500 italic lowercase tracking-tight">
                                {company.description || "The future of quality sourcing."}
                               </p>
                            </div>
                        </div>

                        <p className="text-lg md:text-xl text-white/40 max-w-2xl font-bold uppercase tracking-widest leading-relaxed">
                            A verified trade entity operating within the OBAOL core ecosystem. Specializing in high-density product allocation and global market reach.
                        </p>

                        {/* Action Portal */}
                        <div className="pt-10 flex flex-wrap items-center gap-6">
                            <Button
                                className="h-24 px-16 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.3em] shadow-[0_40px_70px_rgba(255,255,255,0.1)] hover:scale-105 transition-all group"
                                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Enter Logistics Hub
                                <LuArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" size={20} />
                            </Button>
                            <Button
                                variant="bordered"
                                className="h-24 px-12 rounded-[2rem] border border-white/10 text-white/50 font-black text-xs uppercase tracking-[0.3em] hover:bg-white/5 transition-all"
                                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Structure
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Scroll to reveal</span>
                    <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
                </div>
            </section>

            {/* --- REFINED ABOUT SECTION --- */}
            <section id="about" className="py-40 px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 items-start">
                    <div className="lg:col-span-6 space-y-16">
                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="h-10 w-[2px] bg-warning-500" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-warning-500">The Manifesto & Legacy</h3>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] text-white italic">
                                Redefining the <br /> <span className="text-white/40">Sourcing Standard.</span>
                            </h2>
                            <p className="text-white/50 text-xl font-light leading-relaxed">
                                {company.aboutUs || "Welcome to our space. We are dedicated to providing the highest quality products directly from the source. Our commitment to excellence and innovation drives everything we do."}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <div className="text-4xl font-black text-warning-500/20 italic">01.</div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-white/80">Direct Trade Focus</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 leading-relaxed">Eliminating inefficiencies in the global supply chain through direct partnership.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="text-4xl font-black text-warning-500/20 italic">02.</div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-white/80">Execution Visibility</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 leading-relaxed">Providing end-to-end transparency in every transaction within our ecosystem.</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-6 sticky top-32">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-warning-500/5 blur-[120px] rounded-full" />
                            <div className="relative bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[3rem] p-12 overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-48 h-48 bg-warning-500/[0.05] rounded-full blur-[80px]" />
                                
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-12 flex items-center gap-4">
                                    <LuGlobe size={18} className="text-warning-500" />
                                    Global Corporate Record
                                </h3>

                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Operational Hub</span>
                                        <div className="text-lg font-black uppercase tracking-tight text-white/80 leading-snug">
                                            {company.address || "Location not listed"}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Core Capabilities</span>
                                        <div className="flex flex-wrap gap-2">
                                            {capabilityLabels.length > 0 ? capabilityLabels.map((cap: string) => (
                                                <div key={cap} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-warning-500/80">
                                                    {cap}
                                                </div>
                                            )) : (
                                                <span className="text-[10px] font-black italic text-white/20">Awaiting parameter finalization...</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-white/5 flex flex-wrap items-center justify-between gap-8">
                                        {company.website && (
                                            <a href={company.website} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-warning-500 transition-colors flex items-center gap-2">
                                                <LuExternalLink size={14} /> Official Portal
                                            </a>
                                        )}
                                        <div className="flex gap-4">
                                            {[
                                                { icon: LuLinkedin, link: company.socialLinks?.linkedin },
                                                { icon: LuFacebook, link: company.socialLinks?.facebook },
                                                { icon: LuTwitter, link: company.socialLinks?.twitter },
                                                { icon: LuInstagram, link: company.socialLinks?.instagram },
                                            ].filter(s => s.link).map((s, i) => (
                                                <a key={i} href={s.link} target="_blank" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-warning-500 hover:text-black transition-all">
                                                    <s.icon size={16} />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Coverage Section */}
            <section id="products" className="py-32 bg-[rgba(255,255,255,0.02)] border-y border-white/5">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Products Covered</h2>
                            <p className="text-default-400 max-w-xl">Product coverage shared by the company across marketplace and catalog listings. Pricing is not shown here.</p>
                        </div>
                    </div>

                    {isProductsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-[30px] bg-white/5" />)}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map((product: any) => (
                                <Card key={product.productId} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all rounded-[30px] p-8 overflow-hidden group shadow-none">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-warning-500/10 blur-[50px] group-hover:bg-warning-500/20 transition-all" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="w-12 h-12 rounded-2xl bg-warning-500/20 flex items-center justify-center text-warning-500 italic font-black text-xl">
                                                {String(product.productName || "").charAt(0)}
                                            </div>
                                            <Chip size="sm" color="warning" variant="flat" className="h-5 text-[9px] font-black uppercase">Coverage</Chip>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white/40 uppercase tracking-widest mb-1">Product</h4>
                                            <h3 className="text-2xl font-bold">{product.productName}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(product.variants) && product.variants.length > 0 ? (
                                                product.variants.map((variant: any) => (
                                                    <Chip key={variant.id} size="sm" variant="flat" color="primary" className="text-[10px] font-black uppercase tracking-widest">
                                                        {variant.name}
                                                    </Chip>
                                                ))
                                            ) : (
                                                <span className="text-xs text-white/40">No variants listed.</span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-40 border border-dashed border-white/10 rounded-[40px]">
                            <LuShoppingBag className="w-16 h-16 mx-auto mb-6 text-white/20" />
                            <h3 className="text-xl font-bold mb-2">No products published yet</h3>
                            <p className="text-white/40">This company hasn&apos;t shared any product coverage here yet.</p>
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
                    <div>© {new Date().getFullYear()} {company.name} | ALL RIGHTS RESERVED</div>
                    <div className="flex items-center gap-2">
                        DESIGNED & SECURED BY <span className="text-warning-500">OBAOL CORE</span>
                    </div>
                </div>
            </footer>
            <style dangerouslySetInnerHTML={{ __html: strokeStyle }} />
        </div>
    );
}
