"use client";

import { useEffect } from "react";
import { Button } from "@heroui/react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type WarehouseMapItem = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  color: string;
  storageRatePerUnit?: number;
  unit?: "KG" | "MT";
  isBooked: boolean;
  isQuoteRequested: boolean;
  isActionDisabled: boolean;
  source: {
    _id: string;
    name: string;
  } & Record<string, unknown>;
};

type SearchPoint = { latitude: number; longitude: number; label: string };

type WarehouseRentMapProps = {
  center: [number, number];
  zoom: number;
  searchPoint: SearchPoint | null;
  warehouses: WarehouseMapItem[];
  onBook: (warehouse: WarehouseMapItem) => void;
};

const mkDotIcon = (color: string) =>
  L.divIcon({
    className: "warehouse-dot-icon",
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid rgba(255,255,255,0.95);box-shadow:0 0 0 3px color-mix(in oklab, ${color} 26%, transparent), 0 4px 12px rgba(0,0,0,0.45);"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

function MapAutoCenter({ point }: { point: SearchPoint | null }) {
  const map = useMap();

  useEffect(() => {
    if (!point) return;
    map.setView([point.latitude, point.longitude], 8, { animate: true });
  }, [map, point]);

  return null;
}

const LEGEND = [
  ["GENERAL", "#f59e0b"],
  ["COLD_STORAGE", "#06b6d4"],
  ["BONDED", "#8b5cf6"],
  ["AGRO", "#22c55e"],
] as const;

export default function WarehouseRentMap({ center, zoom, searchPoint, warehouses, onBook }: WarehouseRentMapProps) {
  return (
    <>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <MapAutoCenter point={searchPoint} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {warehouses.map((warehouse) => (
          <Marker key={warehouse.id} position={[warehouse.lat, warehouse.lng]} icon={mkDotIcon(warehouse.color)}>
            <Popup className="tactical-popup">
              <div className="min-w-[200px] p-2 space-y-3 bg-[#0A0A0A] text-foreground">
                <div className="space-y-1">
                  <div className="text-[9px] font-black uppercase tracking-widest text-orange-500 font-mono">W_Node_{warehouse.id.slice(-4)}</div>
                  <div className="text-sm font-black">{warehouse.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: warehouse.color }} />
                  <div className="text-[10px] font-bold uppercase text-default-400">{warehouse.category || "GENERAL"}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="text-[10px] text-default-500 uppercase tracking-tight">Storage Rate</div>
                  <div className="text-sm font-mono font-bold text-orange-400">
                    {warehouse.storageRatePerUnit ?? "—"} {warehouse.unit || "MT"} <span className="text-[9px] text-default-600">/ unit</span>
                  </div>
                </div>
                <Button
                  color={warehouse.isBooked ? "success" : "warning"}
                  variant={warehouse.isBooked ? "flat" : "solid"}
                  size="sm"
                  fullWidth
                  isDisabled={warehouse.isActionDisabled}
                  onPress={() => onBook(warehouse)}
                  className="font-black uppercase tracking-wider text-[10px]"
                >
                  {warehouse.isBooked ? "Booked" : warehouse.isQuoteRequested ? "Quote Requested" : "Start Booking"}
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="p-3 rounded-xl bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 flex flex-col gap-2">
          <div className="text-[9px] font-black uppercase tracking-widest text-default-400 mb-1 border-b border-white/5 pb-1 font-mono">Legend_Diagnostics</div>
          {LEGEND.map(([label, color]) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ background: color }} />
              <span className="text-[9px] font-bold text-default-300 uppercase tracking-tight">{label.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
