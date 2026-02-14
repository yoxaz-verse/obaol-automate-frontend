"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { FaMapMarkerAlt } from "react-icons/fa";
import { renderToStaticMarkup } from "react-dom/server";

export interface MarkerData {
  latitude: number;
  longitude: number;
  label: string;
  description: string;
  source: "pinEntry" | "district" | "state";
  countryName?: string;
  functions?: string[];
  statusName?: string;
}

interface GeoSphereProps {
  markers: MarkerData[];
}

const GeoSphere: React.FC<GeoSphereProps> = ({ markers }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerClusterGroup = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    leafletMap.current = L.map(mapRef.current).setView([22.9734, 78.6569], 5); // Centered on India

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; Obaol Supreme",
    }).addTo(leafletMap.current);
  }, []);

  useEffect(() => {
    if (!leafletMap.current) return;

    // Remove previous cluster group
    if (markerClusterGroup.current) {
      leafletMap.current.removeLayer(markerClusterGroup.current);
    }

    // Define custom cluster icon
    markerClusterGroup.current = L.markerClusterGroup({
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();

        const iconMarkup = `
          <div style="position: relative; width: 36px; height: 36px;">
          <div>
            <span style="
              text-align: center;
              color: orange;
              background:#00000095;
              padding:5px;
              border-radius:50%;
              font-size: 12px;
              font-weight: bold;
              z-index: 10;
            ">
              ${count}  
            </span>  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="orange" width="36" height="36" >
              <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"/>
            </svg>
          
         </div> </div>
        `;

        return L.divIcon({
          html: iconMarkup,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });
      },
    });

    // Group by lat/lng to avoid overlapping
    const groupedMarkers: Record<string, MarkerData[]> = {};
    markers.forEach((marker) => {
      const key = `${marker.latitude.toFixed(5)},${marker.longitude.toFixed(
        5
      )}`;
      if (!groupedMarkers[key]) groupedMarkers[key] = [];
      groupedMarkers[key].push(marker);
    });

    // Render individual markers
    Object.entries(groupedMarkers).forEach(([_, group]) => {
      const { latitude, longitude, source } = group[0];

      const iconColor =
        source === "pinEntry"
          ? "green"
          : source === "district"
            ? "blue"
            : "red";

      const iconMarkup = renderToStaticMarkup(
        <FaMapMarkerAlt color={iconColor} size="16px" />
      );

      const customIcon = L.divIcon({
        html: iconMarkup,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 16],
      });

      const popupContent = group
        .map(
          (item) => `
      <div class="mb-2">
        <strong>${item.label}</strong><br/>
        <strong>Country:</strong> ${item.countryName || "N/A"}<br/>
        <strong>Status:</strong> ${item.statusName || "N/A"}<br/>
        <hr/>
        <br/>
        <div class="mb-4"> <strong>Functions:</strong> 
       <span style="color: #ffa500;">
       ${item.functions?.join(", ") || "N/A"}</span>
     </div>
    `
        )
        .join("");

      const marker = L.marker([latitude, longitude], { icon: customIcon })
        .bindPopup(`
        <section>
          <div class="max-h-[250px] overflow-auto mb-4">
            ${popupContent}
          </div>
        </section>
      `);

      markerClusterGroup.current!.addLayer(marker);
    });

    leafletMap.current.addLayer(markerClusterGroup.current);
  }, [markers]);

  return (
    <div
      ref={mapRef}
      className="z-10"
      style={{ height: "100%", width: "100%" }}
    />
  );
};

export default GeoSphere;
