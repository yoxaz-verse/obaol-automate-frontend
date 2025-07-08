"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { MarkerData } from "@/components/GeoSphere/GeoSphere";

const GeoSphere = dynamic(() => import("@/components/GeoSphere/GeoSphere"), {
  ssr: false,
});

interface GeoSphereWrapperProps {
  mappingValue: MarkerData[];
}

export default function GeoSphereWrapper({
  mappingValue,
}: GeoSphereWrapperProps) {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  console.log(markers);

  useEffect(() => {
    // Directly set all markers from API
    if (mappingValue) {
      setMarkers(mappingValue);
    }
  }, [mappingValue]);

  return (
    <div className="h-[82vh] w-full">
      <GeoSphere markers={markers} />
    </div>
  );
}
