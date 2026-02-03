import React from "react";
import Image from "next/image";
import ParticleNetwork from "@/components/ui/particle-network";

export default function AboutSection() {
    return (
        <section className="py-24 px-6 bg-black border-t border-gray-800" id="about">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                {/* TEXT CONTENT */}
                <div>
                    <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
                        Who We Are
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-6">
                        OBAOL is founded on the principle that transparency and execution are the lifeblood of commodities trading.
                        We are not just a platform; we are a dedicated team of trade operating specialists committed to fixing the broken agro-commodity supply chain.
                    </p>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        Our mission is to eliminate the noise of non-performers and provide a secure, verified environment where real buyers and suppliers can transact with confidence.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-white font-medium text-xl">The Founder</h3>
                            <p className="text-gray-500 mt-1">
                                Jacob Alwin
                            </p>
                            <p className="text-sm text-gray-600">
                                CEO - OBAOL Supreme, Founder - Yoxaz Verse                            </p>
                        </div>
                        {/* Add more team members or company details here */}
                    </div>
                </div>

                {/* IMAGE / VISUAL */}
                <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 flex items-center justify-center">
                    <ParticleNetwork />
                </div>
            </div>
        </section>
    );
}
