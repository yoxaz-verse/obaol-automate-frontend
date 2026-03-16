"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MarkerData } from "@/components/LiveMap/LiveMap";
import { Spinner } from "@nextui-org/react";
import { LuMapPin } from "react-icons/lu";

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
  const [isReady, setIsReady] = useState(false);
  const [geocodingCount, setGeocodingCount] = useState(0);

  useEffect(() => {
    if (!mappingValue) {
      setIsReady(true);
      return;
    }

    setIsReady(false);
    setMarkers([]);

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

    // Set immediate pin markers and geocoding count
    setMarkers(immediateMarkers);
    setGeocodingCount(delayedQueue.length);

    if (delayedQueue.length === 0) {
      // No geocoding needed, map is ready immediately
      setIsReady(true);
      return;
    }

    // Limit concurrent geocode requests (to prevent API throttling)
    const maxConcurrent = 5;
    let running = 0;
    let index = 0;
    let completed = 0;

    const processQueue = () => {
      while (running < maxConcurrent && index < delayedQueue.length) {
        const job = delayedQueue[index++];
        running++;
        job().finally(() => {
          running--;
          completed++;
          if (completed === delayedQueue.length) {
            setIsReady(true);
          }
          processQueue();
        });
      }
    };

    processQueue();
  }, [mappingValue]);

  return (
    <div className="h-[82vh] z-10 w-full relative group">
      <LiveMap markers={markers} />

      {!isReady && (
        <div className="absolute inset-0 z-[100] rounded-xl bg-content1/40 backdrop-blur-[2px] transition-all duration-500 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-content1/90 p-8 rounded-3xl shadow-2xl border border-default-200/50 flex flex-col items-center gap-5 max-w-sm w-full animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-warning-500/10 flex items-center justify-center border-2 border-warning-400/20 shadow-inner">
                <LuMapPin className="text-warning-500 animate-bounce" size={36} />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-warning-500/30 animate-ping opacity-20" />
              <span className="absolute -right-1 -top-1">
                <Spinner size="sm" color="warning" />
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black tracking-tight text-foreground">
                Looking up locations...
              </h3>
              <p className="text-xs text-default-500 font-medium px-4">
                {geocodingCount > 0
                  ? `Mapping ${geocodingCount} locations for available rates. This ensures accurate distance calculations.`
                  : "Synchronizing local map data with our server..."}
              </p>
            </div>

            {/* Enhanced progress indicator */}
            <div className="w-full space-y-2 pt-2">
              <div className="w-full h-1.5 rounded-full bg-default-100 overflow-hidden relative border border-default-200/30">
                <div
                  className="absolute inset-y-0 bg-gradient-to-r from-warning-400 to-warning-600 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                  style={{
                    width: markers.length > 0 ? `${Math.min(100, (markers.length / (geocodingCount || 1)) * 100)}%` : '15%',
                    animation: markers.length === 0 ? "shimmer 2s ease-in-out infinite" : "none"
                  }}
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Processing</span>
                <span className="text-[10px] font-black text-warning-500 tracking-tighter">
                  {Math.round(markers.length > 0 ? (markers.length / (geocodingCount || 1)) * 100 : 15)}%
                </span>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes shimmer {
              0% { left: -30%; width: 30%; }
              50% { width: 50%; }
              100% { left: 100%; width: 30%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
