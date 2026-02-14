"use client";

import React, { useState } from "react";
import {
    Card,
    CardBody,
    Input,
    Button,
    Select,
    SelectItem,
    Divider,
    Chip,
    Spacer
} from "@heroui/react";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import dynamic from "next/dynamic";
import { postData } from "@/core/api/apiHandler";

// Dynamic import for Map to avoid SSR issues with Leaflet
const LiveMap = dynamic(() => import("@/components/LiveMap/LiveMap"), {
    ssr: false,
});

const ORIGINS = [
    { label: "Mumbai, India", value: "MUMBAI", lat: 18.975, lng: 72.8258 },
    { label: "Chennai, India", value: "CHENNAI", lat: 13.0827, lng: 80.2707 },
    { label: "Shanghai, China", value: "SHANGHAI", lat: 31.2304, lng: 121.4737 },
];

const DESTINATIONS = [
    { label: "Dubai, UAE", value: "DUBAI", lat: 25.2048, lng: 55.2708 },
    { label: "Singapore", value: "SINGAPORE", lat: 1.3521, lng: 103.8198 },
    { label: "London, UK", value: "LONDON", lat: 51.5074, lng: -0.1278 },
    { label: "New York, USA", value: "NEW_YORK", lat: 40.7128, lng: -74.006 },
    { label: "Rotterdam, Netherlands", value: "ROTTERDAM", lat: 51.9225, lng: 4.4792 },
];

export default function LogisticsPage() {
    const [formData, setFormData] = useState({
        origin: "MUMBAI",
        destination: "DUBAI",
        commodityValue: "50000",
        weight: "20",
        mode: "OCEAN",
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleCalculate = async () => {
        setLoading(true);
        try {
            const response = await postData("/cif", {
                ...formData,
                commodityValue: Number(formData.commodityValue),
                weight: Number(formData.weight),
            });
            setResult(response.data);
        } catch (error) {
            console.error("Calculation failed", error);
        } finally {
            setLoading(false);
        }
    };

    const mapMarkers = result ? [
        { ...ORIGINS.find(o => o.value === formData.origin)!, label: "Origin", description: formData.origin, source: "state" as const },
        { ...DESTINATIONS.find(d => d.value === formData.destination)!, label: "Destination", description: formData.destination, source: "state" as const },
    ].map(m => ({ latitude: m.lat, longitude: m.lng, label: m.label, description: m.description, source: m.source })) : [];

    return (
        <main className="bg-background text-foreground min-h-screen">
            <Header />

            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-4">Ultimate CIF Calculator</h1>
                    <p className="text-default-500 text-lg">
                        Calculate Cost, Insurance, and Freight for your global trade in seconds.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* CALCULATOR FORM */}
                    <Card className="lg:col-span-4 shadow-none border border-default-200">
                        <CardBody className="p-6 flex flex-col gap-6">
                            <h3 className="text-xl font-semibold mb-2">Request Quote</h3>

                            {/* @ts-ignore */}
                            <Select
                                label="Origin Port / City"
                                selectedKeys={[formData.origin]}
                                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                            >
                                {ORIGINS.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </Select>

                            {/* @ts-ignore */}
                            <Select
                                label="Destination Port / City"
                                selectedKeys={[formData.destination]}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            >
                                {DESTINATIONS.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                type="number"
                                label="Commodity Value (USD)"
                                value={formData.commodityValue}
                                onChange={(e) => setFormData({ ...formData, commodityValue: e.target.value })}
                            />

                            <Input
                                type="number"
                                label="Weight (Metric Tons)"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            />

                            {/* @ts-ignore */}
                            <Select
                                label="Mode of Transport"
                                selectedKeys={[formData.mode]}
                                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                            >
                                <SelectItem key="OCEAN" value="OCEAN">Ocean Freight</SelectItem>
                                <SelectItem key="AIR" value="AIR">Air Freight</SelectItem>
                            </Select>

                            <Button
                                color="warning"
                                size="lg"
                                className="w-full font-bold"
                                onPress={handleCalculate}
                                isLoading={loading}
                            >
                                Calculate Now
                            </Button>
                        </CardBody>
                    </Card>

                    {/* RESULTS & MAP */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {result ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="shadow-none border border-default-200">
                                    <CardBody className="p-6">
                                        <h3 className="text-lg font-bold mb-4">Price Breakdown</h3>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between">
                                                <span className="text-default-500">Commodity Value</span>
                                                <span className="font-medium">${result.breakdown.commodityValue.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-default-500">Freight Cost ({result.mode})</span>
                                                <span className="font-medium text-success">${result.breakdown.freight.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-default-500">Insurance (1.5%)</span>
                                                <span className="font-medium text-success">${result.breakdown.insurance.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-default-500">Handling Fees</span>
                                                <span className="font-medium text-success">${result.breakdown.handling.toLocaleString()}</span>
                                            </div>
                                            <Divider className="my-2" />
                                            <div className="flex justify-between items-center">
                                                <span className="text-xl font-bold">Total CIF</span>
                                                <span className="text-2xl font-bold text-warning">${result.totalCIF.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        {/* @ts-ignore */}
                                        <Spacer y={4} />
                                        {/* @ts-ignore */}
                                        <Chip color="secondary" variant="flat" className="w-full py-4 h-auto text-center">
                                            Estimated Distance: {result.distanceKm.toLocaleString()} km
                                        </Chip>
                                    </CardBody>
                                </Card>

                                <div className="h-[350px] rounded-xl overflow-hidden border border-default-200">
                                    <LiveMap markers={mapMarkers} />
                                </div>
                            </div>
                        ) : (
                            <Card className="h-full flex items-center justify-center p-12 bg-default-50 border-dashed border-2 border-default-200 shadow-none">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🚢</div>
                                    <h3 className="text-xl font-bold mb-2">Ready to Calculate</h3>
                                    <p className="text-default-500">Enter your shipment details to see instant CIF estimates and route map.</p>
                                </div>
                            </Card>
                        )}

                        {result && (
                            <div className="p-6 bg-warning-50 rounded-xl border border-warning-200">
                                <h4 className="font-bold text-warning-700 mb-2">Note:</h4>
                                <p className="text-sm text-warning-600">
                                    These estimates are based on standard market rates and verified distance metrics. Final pricing may vary based on exact commodity specifications, carrier availability, and port congestion.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
