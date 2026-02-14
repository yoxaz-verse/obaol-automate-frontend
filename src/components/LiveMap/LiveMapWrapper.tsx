"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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
interface LiveMapProps {
  mappingValue: any;
}

export default function LiveMapWrapper({ mappingValue }: LiveMapProps) {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  useEffect(() => {
    if (!mappingValue) return;

    const immediateMarkers: MarkerData[] = [];
    const delayedQueue: (() => Promise<void>)[] = [];

    for (const item of mappingValue) {
      const label =
        item.productVariant?.product?.name +
        " " +
        item.productVariant?.name +
        " - " +
        item.rate || "Unknown";

      const description = `by: ${item.associateCompany?.name}`;

      const pincodeEntry = item.pincodeEntry || item.associateCompany?.pincodeEntry;
      const district = item.district || item.associateCompany?.district;
      const state = item.state || item.associateCompany?.state;

      if (pincodeEntry?.latitude && pincodeEntry?.longitude) {
        immediateMarkers.push({
          latitude: pincodeEntry.latitude,
          longitude: pincodeEntry.longitude,
          label,
          description,
          source: "pinEntry",
        });
      } else if (district?.name && state?.name) {
        const query = `${district.name}, ${state.name}, India`;
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
  }, [mappingValue]);

  return (
    <div className="h-[82vh] z-10 w-full">
      <LiveMap markers={markers} />
    </div>
  );
}
