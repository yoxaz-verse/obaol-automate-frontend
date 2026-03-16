"use client";

import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { countryCentroids } from "@/data/countryCentroids";
import { useTheme } from "next-themes";

type NewsItem = {
  title: string;
  link: string;
  summary: string;
  publishedAt: string | null;
  sourceName: string;
  continent: string;
  country: string;
};

type NewsMapProps = {
  items: NewsItem[];
  onSelectCountry: (country: string) => void;
  loading?: boolean;
  loadedCount?: number;
};

const getMarkerStyle = (tone: "light" | "dark") => {
  const ring = tone === "dark" ? "rgba(255,160,70,0.3)" : "rgba(255,140,30,0.25)";
  const core = tone === "dark" ? "#FF9F3A" : "#FF8A1E";
  return {
    color: core,
    fillColor: core,
    fillOpacity: 0.9,
    weight: 2,
    opacity: 0.9,
    className: "news-map-marker",
    dashArray: "",
    lineCap: "round",
    lineJoin: "round",
  } as const;
};

const byCountry = (items: NewsItem[]) => {
  const map = new Map<string, NewsItem[]>();
  items.forEach((item) => {
    const key = item.country || "Global";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  });
  return map;
};

export default function NewsMap({ items, onSelectCountry, loading, loadedCount }: NewsMapProps) {
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = (theme === "system" ? systemTheme : theme) || "dark";
  const tone = resolvedTheme === "light" ? "light" : "dark";

  const tileUrl =
    tone === "light"
      ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  const grouped = useMemo(() => byCountry(items), [items]);
  const markers = Array.from(grouped.entries()).map(([country, rows]) => {
    const centroid = countryCentroids.find((c) => c.country === country);
    const lat = Number(centroid?.lat);
    const lng = Number(centroid?.lng);
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
    return { country, rows, centroid, hasCoords };
  }).filter((row) => row.hasCoords);

  const markerStyle = useMemo(() => getMarkerStyle(tone), [tone]);

  // Create standard DivIcon for stable pulsing
  const createPulseIcon = () => {
    return L.divIcon({
      className: "custom-pulse-icon",
      html: `
        <div class="pulse-container">
          <div class="pulse-halo"></div>
          <div class="pulse-core"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <div className="news-map h-[520px] w-full rounded-xl overflow-hidden border border-default-200/70 relative">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%", cursor: "pointer" }}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />
        {markers.map((marker) => (
          <Marker
            key={marker.country}
            position={[Number(marker.centroid!.lat), Number(marker.centroid!.lng)]}
            icon={createPulseIcon()}
            eventHandlers={{
              click: () => onSelectCountry(marker.country),
              mouseover: (event) => {
                event.target.openTooltip();
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} sticky interactive={false}>
              <div className="text-xs">
                <div className="font-semibold mb-1">{marker.country}</div>
                {(marker.rows || []).slice(0, 3).map((row) => (
                  <div key={row.link} className="mb-1">
                    {row.title}
                  </div>
                ))}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      <style jsx global>{`
        .news-map .leaflet-control-attribution {
          display: none !important;
        }
        .custom-pulse-icon {
          background: transparent !important;
          border: none !important;
        }
        .pulse-container {
          position: relative;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pulse-core {
          width: 10px;
          height: 10px;
          background-color: #FF9F3A;
          border-radius: 50%;
          z-index: 2;
          box-shadow: 0 0 10px rgba(255, 159, 58, 0.5);
          border: 1.5px solid white;
        }
        .pulse-halo {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 159, 58, 0.4);
          border-radius: 50%;
          z-index: 1;
          animation: stablePulse 2.2s ease-out infinite;
        }
        @keyframes stablePulse {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          70% {
            transform: scale(2.2);
            opacity: 0;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 text-white text-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2">
            <span>{loadedCount && loadedCount > 0 ? `Loaded ${loadedCount} items` : "Fetching feeds"}</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse [animation-delay:300ms]" />
            </span>
          </div>
        </div>
      ) : markers.length === 0 ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-content1/70 text-default-500 text-sm">
          No news pins yet. Adjust filters or refresh to load feeds.
        </div>
      ) : null}
    </div>
  );
}
