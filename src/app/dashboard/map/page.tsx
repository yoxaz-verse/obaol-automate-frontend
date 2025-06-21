"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { variantRateRoutes } from "@/core/api/apiRoutes";
import { MarkerData } from "@/components/LiveMap/LiveMap";

// Dynamically import the map to prevent SSR issues with Leaflet
const LiveMap = dynamic(() => import("@/components/LiveMap/LiveMap"), {
  ssr: false,
});

let geoCache: Record<string, { lat: number; lon: number }> = {};

const geocode = async (
  query: string
): Promise<{ lat: number; lon: number } | null> => {
  if (typeof window !== "undefined" && Object.keys(geoCache).length === 0) {
    try {
      geoCache = JSON.parse(localStorage.getItem("geoCache") || "{}");
    } catch {
      geoCache = {};
    }
  }

  if (geoCache[query]) return geoCache[query];

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GeoMap/1.0 (contact@example.com)" },
    });
    const data = await res.json();
    if (data.length > 0) {
      const result = { lat: +data[0].lat, lon: +data[0].lon };
      geoCache[query] = result;
      if (typeof window !== "undefined") {
        localStorage.setItem("geoCache", JSON.stringify(geoCache));
      }
      return result;
    }
  } catch (err) {
    console.error("Geocode error", err);
  }
  return null;
};

export default function HomePage() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const { data: variantRateResponse, isSuccess } = useQuery({
    queryKey: ["variantRate"],
    queryFn: () => getData(variantRateRoutes.getAll, { limit: 10000 }),
  });

  const variantRateValue = variantRateResponse?.data?.data?.data;

  useEffect(() => {
    if (!isSuccess || !variantRateValue) return;

    const loadMarkers = async () => {
      const results: MarkerData[] = [];

      for (const item of variantRateValue) {
        const label =
          item.productVariant?.product?.name +
            " " +
            item.productVariant?.name +
            " - " +
            item.rate || "Unknown";
        const description = `By: ${item.associateCompany?.name}`;

        if (item.pinEntry?.latitude && item.pinEntry?.longitude) {
          results.push({
            latitude: item.pinEntry.latitude,
            longitude: item.pinEntry.longitude,
            label,
            description,
            source: "pinEntry",
          });
        } else if (item.district?.name && item.state?.name) {
          const geo = await geocode(
            `${item.district.name}, ${item.state.name}, India`
          );
          if (geo) {
            results.push({
              latitude: geo.lat,
              longitude: geo.lon,
              label,
              description,
              source: "district",
            });
          }
        } else if (item.state?.name) {
          const geo = await geocode(`${item.state.name}, India`);
          if (geo) {
            results.push({
              latitude: geo.lat,
              longitude: geo.lon,
              label,
              description,
              source: "state",
            });
          }
        }
      }

      setMarkers(results);
    };

    loadMarkers();
  }, [isSuccess, variantRateValue]);

  return (
    <div className="h-[82vh] w-full">
      <LiveMap markers={markers} />
    </div>
  );
}
