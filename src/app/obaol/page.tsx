"use client";
import { NextPage } from "next";
import React from "react";
import { Spacer } from "@heroui/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import Title from "@/components/titles";
import AgroProductDisplay from "@/components/products/AgroProductDisplay";

const Obaol: NextPage = () => {
  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-[95%] py-8">
        {/* @ts-ignore */}
        <Spacer y={2} />
        <AgroProductDisplay />
        {/* @ts-ignore */}
        <Spacer y={4} />
      </div>
    </div>
  );
};

export default Obaol;
