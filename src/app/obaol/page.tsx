"use client";
import { NextPage } from "next";
import React from "react";
import { Spacer } from "@heroui/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";
import Title from "@/components/titles";

const Projects: NextPage = () => {
  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  return (
    <div className="flex items-center justify-center ">
      <div className="w-[95%]  ">
        {/* @ts-ignore */}
        <Spacer y={6} />
        <Title title="OBAOL Supreme" />
        <VariantRate rate="variantRate" displayOnly />
        {/* @ts-ignore */}
        <Spacer y={4} />
      </div>
    </div>
  );
};

export default Projects;
