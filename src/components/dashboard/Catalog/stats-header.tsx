"use client";

import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { FiShoppingBag, FiGlobe, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";

interface StatsHeaderProps {
    myCatalogCount: number;
    marketplaceCount: number;
    isLoading?: boolean;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
    myCatalogCount,
    marketplaceCount,
    isLoading = false,
}) => {
    return (
        <div className="flex justify-center mb-6 w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <Card className="bg-gradient-to-br from-success-500/10 to-success-500/5 border-success-500/20 shadow-lg backdrop-blur-md overflow-hidden">
                    <CardBody className="flex flex-row items-center gap-4 p-5">
                        <div className="p-3 bg-success-500/20 rounded-2xl text-success-600">
                            <FiCheckCircle size={28} />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-success-700 font-semibold text-sm uppercase tracking-wider">My Catalog</p>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-3xl font-bold text-foreground">
                                    {isLoading ? "..." : myCatalogCount}
                                </h2>
                            </div>
                        </div>
                    </CardBody>
                    <div className="absolute -right-4 -bottom-4 opacity-5 text-success-500">
                        <FiCheckCircle size={100} />
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};
