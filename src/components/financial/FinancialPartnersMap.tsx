"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
export default function FinancialPartnersMap({ rows, onOpen }: { rows: any[]; onOpen: (id: string) => void }) {
  const node = useRef<HTMLDivElement>(null), map = useRef<L.Map | null>(null);
  useEffect(() => { if (!node.current || map.current) return; map.current = L.map(node.current).setView([22.9734, 78.6569], 5); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors" }).addTo(map.current); }, []);
  useEffect(() => { if (!map.current) return; map.current.eachLayer((layer: any) => { if (!layer._url) map.current?.removeLayer(layer); }); const points: L.LatLngExpression[] = []; rows.forEach((row) => (row.published?.locations || []).forEach((location: any) => { if (!Number.isFinite(Number(location.latitude)) || !Number.isFinite(Number(location.longitude))) return; const point: L.LatLngExpression = [Number(location.latitude), Number(location.longitude)]; points.push(point); const marker = L.marker(point).addTo(map.current!); marker.bindPopup(`<b>${row.published.displayName}</b><br/>${location.label || location.city || "Location"}<br/><button data-profile="${row._id}" style="margin-top:8px;font-weight:700">View profile</button>`); marker.on("popupopen", () => document.querySelector(`[data-profile="${row._id}"]`)?.addEventListener("click", () => onOpen(row._id), { once: true })); })); if (points.length) map.current.fitBounds(L.latLngBounds(points), { padding: [35, 35], maxZoom: 9 }); }, [rows, onOpen]);
  return <div ref={node} className="h-[560px] w-full rounded-2xl" aria-label="Financial partner locations" />;
}
