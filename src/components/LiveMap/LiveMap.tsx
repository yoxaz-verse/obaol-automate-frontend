"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { FaMapMarkerAlt } from "react-icons/fa";
import { renderToStaticMarkup } from "react-dom/server";

export interface MarkerData {
  latitude: number;
  longitude: number;
  label: string;
  description: string;
  source: "pinEntry" | "district" | "state";
}

interface LiveMapProps {
  markers: MarkerData[];
}

const LiveMap: React.FC<LiveMapProps> = ({ markers }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Initialize map
    leafletMap.current = L.map(mapRef.current).setView([22.9734, 78.6569], 5); // Center of India

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(leafletMap.current);
  }, []);

  useEffect(() => {
    if (!leafletMap.current) return;

    // Clear existing markers by resetting the map
    leafletMap.current.eachLayer((layer) => {
      if ((layer as any)._url === undefined) {
        leafletMap.current!.removeLayer(layer);
      }
    });

    // Group markers by lat/lng
    const groupedMarkers: Record<string, MarkerData[]> = {};
    markers.forEach((marker) => {
      const key = `${marker.latitude.toFixed(5)},${marker.longitude.toFixed(
        5
      )}`;
      if (!groupedMarkers[key]) {
        groupedMarkers[key] = [];
      }
      groupedMarkers[key].push(marker);
    });

    // Add grouped markers to map
    Object.entries(groupedMarkers).forEach(([key, group]) => {
      const { latitude, longitude, source } = group[0];

      // Choose icon color
      const iconColor =
        source === "pinEntry"
          ? "red"
          : source === "district"
          ? "blue"
          : "green";

      const iconMarkup = renderToStaticMarkup(
        <FaMapMarkerAlt color={iconColor} size="32px" />
      );

      const customIcon = L.divIcon({
        html: iconMarkup,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      // Build popup content
      const popupContent = group
        .map(
          (item) => `
            <div>
              <strong>${item.label}</strong><br/>
              ${item.description}
            </div><hr/>
          `
        )
        .join("");

      // Add marker to map
      L.marker([latitude, longitude], { icon: customIcon })
        .addTo(leafletMap.current!)
        .bindPopup(popupContent);
    });
  }, [markers]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />;
};

export default LiveMap;
