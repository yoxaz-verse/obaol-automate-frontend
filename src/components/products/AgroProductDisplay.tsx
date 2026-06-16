"use client";

import React from "react";
import Title from "@/components/titles";
import PublicRateList from "@/components/public/PublicRateList";

const AgroProductDisplay = () => {
    const AGRO_CATEGORY_ID = "683f2765462cb5a84b14cbb4";

    return (
        <div className="w-full">
            <Title title="Agro Trade Execution" />
            <p className="text-default-500 mb-6 px-4">
                Verified agricultural commodities ready for trade execution.
            </p>

            <PublicRateList
                rate="variantRate"
                displayOnly
                additionalParams={{ category: AGRO_CATEGORY_ID }}
            />
        </div>
    );
};

export default AgroProductDisplay;
