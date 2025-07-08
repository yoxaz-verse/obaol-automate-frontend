"use client";
import React from "react";
import QueryComponent from "@/components/queryComponent";
import GeoSphereWrapper from "@/components/GeoSphere/GeoSphereWrapper";
import type { MarkerData } from "@/components/GeoSphere/GeoSphere";
import { unLoCodeRoutes } from "@/core/api/apiRoutes";

export default function UnLoCodeMapPage() {
  return (
    <div className="w-full h-screen">
      <QueryComponent
        api={unLoCodeRoutes.getAll}
        queryKey={["unlocodes", unLoCodeRoutes.getAll]}
        page={1}
        limit={20000}
      >
        {(response: any) => {
          const docs: any[] = response?.data || [];
          console.log(docs);

          const markers: MarkerData[] = docs.flatMap((u) => {
            const lat = u.coordinates?.latitude;
            const lon = u.coordinates?.longitude;
            if (!lat || !lon) return [];

            const functionNames = u.functions?.map((f: any) => f.name) || [];
            const countryName = u.country?.name || "Unknown";

            return [
              {
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
                label: `${u.loCode} — ${u.name}`,
                description: u.description || "No description",
                source: "pinEntry",
                countryName,
                functions: functionNames,
              },
            ];
          });

          return <GeoSphereWrapper mappingValue={markers} />;
        }}
      </QueryComponent>
    </div>
  );
}
