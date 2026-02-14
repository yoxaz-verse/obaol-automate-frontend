"use client";

import React from "react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import { Spacer } from "@heroui/react";
import Title from "@/components/titles";

const AgroProductDisplay = () => {
    const AGRO_CATEGORY_ID = "683f2765462cb5a84b14cbb4";

    return (
        <div className="w-full">
            <Title title="Agro Trade Execution" />
            <p className="text-default-500 mb-6 px-4">
                Verified agricultural commodities ready for trade execution.
            </p>

            <VariantRate
                rate="variantRate"
                displayOnly
                additionalParams={{ category: AGRO_CATEGORY_ID }}
            />
        </div>
    );
};

export default AgroProductDisplay;
