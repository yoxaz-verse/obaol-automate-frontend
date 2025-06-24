"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { variantRateRoutes } from "@/core/api/apiRoutes";
import { MarkerData } from "@/components/LiveMap/LiveMap";

// Dynamic import to fix SSR issue
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

    const immediateMarkers: MarkerData[] = [];
    const delayedQueue: (() => Promise<void>)[] = [];

    for (const item of variantRateValue) {
      const label =
        item.productVariant?.product?.name +
          " " +
          item.productVariant?.name +
          " - " +
          item.rate || "Unknown";

      const description = `by: ${item.associateCompany?.name}`;

      if (item.pinEntry?.latitude && item.pinEntry?.longitude) {
        immediateMarkers.push({
          latitude: item.pinEntry.latitude,
          longitude: item.pinEntry.longitude,
          label,
          description,
          source: "pinEntry",
        });
      } else if (item.district?.name && item.state?.name) {
        const query = `${item.district.name}, ${item.state.name}, India`;
        delayedQueue.push(async () => {
          const geo = await geocode(query);
          if (geo) {
            setMarkers((prev) => [
              ...prev,
              {
                latitude: geo.lat,
                longitude: geo.lon,
                label,
                description,
                source: "district",
              },
            ]);
          }
        });
      } else if (item.state?.name) {
        const query = `${item.state.name}, India`;
        delayedQueue.push(async () => {
          const geo = await geocode(query);
          if (geo) {
            setMarkers((prev) => [
              ...prev,
              {
                latitude: geo.lat,
                longitude: geo.lon,
                label,
                description,
                source: "state",
              },
            ]);
          }
        });
      }
    }

    // Show all available markers immediately
    setMarkers(immediateMarkers);

    // Limit concurrent geocode requests (to prevent API throttling)
    const maxConcurrent = 5;
    let running = 0;
    let index = 0;

    const processQueue = () => {
      while (running < maxConcurrent && index < delayedQueue.length) {
        const job = delayedQueue[index++];
        running++;
        job().finally(() => {
          running--;
          processQueue();
        });
      }
    };

    processQueue();
  }, [isSuccess, variantRateValue]);

  return (
    <div className="h-[82vh] w-full">
      <LiveMap markers={markers} />
    </div>
  );
}
