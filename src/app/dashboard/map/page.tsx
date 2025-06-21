"use client";

import { useEffect, useState } from "react";
import LiveMap, { MarkerData } from "@/components/LiveMap/LiveMap";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { variantRateRoutes } from "@/core/api/apiRoutes";
const geoCache: Record<string, { lat: number; lon: number }> = JSON.parse(
  localStorage.getItem("geoCache") || "{}"
);

const geocode = async (
  query: string
): Promise<{ lat: number; lon: number } | null> => {
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
      localStorage.setItem("geoCache", JSON.stringify(geoCache)); // Save back
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
  console.log(variantRateValue);

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
