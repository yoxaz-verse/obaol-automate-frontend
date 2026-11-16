"use client";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

export type AgritechMarker = { profileId: string; displayName: string; address: string; latitude: number; longitude: number };
const icon = L.divIcon({ className: "agritech-map-icon", html: '<div style="width:24px;height:24px;border-radius:50%;background:#14532d;border:3px solid #86efac;box-shadow:0 4px 12px #0005"></div>', iconSize: [24, 24], iconAnchor: [12, 12] });
function Fit({ markers }: { markers: AgritechMarker[] }) { const map = useMap(); useEffect(() => { const points = markers.map((m) => [m.latitude, m.longitude] as [number, number]); if (points.length === 1) map.setView(points[0], 8); else if (points.length > 1) map.fitBounds(points, { padding: [32, 32], maxZoom: 9 }); }, [map, markers]); return null; }
export default function AgritechMap({ markers }: { markers: AgritechMarker[] }) {
  return <MapContainer center={[20.5937, 78.9629]} zoom={5} className="themed-leaflet-map" style={{ height: "100%", width: "100%" }} attributionControl={false}>
    <Fit markers={markers} /><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {markers.map((marker) => <Marker key={marker.profileId} position={[marker.latitude, marker.longitude]} icon={icon}><Popup><div className="space-y-2"><b>{marker.displayName}</b><p className="text-xs">{marker.address}</p><Link className="font-bold text-success-700" href={`/dashboard/agritech-startups/${marker.profileId}`}>View profile</Link></div></Popup></Marker>)}
  </MapContainer>;
}
