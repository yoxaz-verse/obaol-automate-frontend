"use client";
import { NextPage } from "next";
import { useContext, useState } from "react";

import React from "react";
import { AccordionItem, Button, Spacer } from "@heroui/react";
import VariantRate from "@/components/dashboard/Catalog/variant-rate";

const Projects: NextPage = () => {
  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  return (
    <div className="flex items-center justify-center ">
      <div className="w-[95%]  ">
        <VariantRate rate="variantRate" displayOnly />
        <Spacer y={4} />
      </div>
    </div>
  );
};

export default Projects;
