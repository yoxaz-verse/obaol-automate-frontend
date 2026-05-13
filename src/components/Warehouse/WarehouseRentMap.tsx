"use client";

import React, { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@heroui/react";

export type WarehouseMapItem = {
  _id: string;
  name: string;
  category?: "GENERAL" | "COLD_STORAGE" | "BONDED" | "AGRO";
  storageRatePerUnit?: number;
  unit?: "KG" | "MT";
  location?: {
    latitude?: number;
    longitude?: number;
  } | null;
};

type SearchPoint = { latitude: number; longitude: number; label: string };

type Props = {
  warehouses: WarehouseMapItem[];
  bookedWarehouseIdSet: Set<string>;
  needsCompanySelect: boolean;
  selectedCompanyId: string;
  bookMutationPending: boolean;
  onBook: (warehouse: WarehouseMapItem) => void;
  searchPoint: SearchPoint | null;
  defaultCenter: [number, number];
  defaultZoom: number;
  categoryColor: Record<string, string>;
};

const mkDotIcon = (color: string) =>
  L.divIcon({
    className: "warehouse-dot-icon",
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid rgba(255,255,255,0.95);box-shadow:0 0 0 3px ${color}33, 0 4px 12px rgba(0,0,0,0.45);"></span>`,
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

export default function WarehouseRentMap({
  warehouses,
  bookedWarehouseIdSet,
  needsCompanySelect,
  selectedCompanyId,
  bookMutationPending,
  onBook,
  searchPoint,
  defaultCenter,
  defaultZoom,
  categoryColor,
}: Props) {
  const safeWarehouses = warehouses.filter((warehouse) => {
    const lat = Number(warehouse.location?.latitude);
    const lng = Number(warehouse.location?.longitude);
    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  });

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <MapAutoCenter point={searchPoint} />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {safeWarehouses.map((warehouse) => {
        const lat = Number(warehouse.location?.latitude);
        const lng = Number(warehouse.location?.longitude);
        const category = String(warehouse.category || "GENERAL");
        const color = categoryColor[category] || categoryColor.GENERAL;
        const isBooked = bookedWarehouseIdSet.has(String(warehouse._id || ""));
        const bookingDisabled =
          isBooked || (needsCompanySelect && !selectedCompanyId) || bookMutationPending;

        return (
          <Marker key={warehouse._id} position={[lat, lng]} icon={mkDotIcon(color)}>
            <Popup className="tactical-popup">
              <div className="min-w-[200px] p-2 space-y-3 bg-[#0A0A0A] text-foreground">
                <div className="space-y-1">
                  <div className="text-[9px] font-black uppercase tracking-widest text-orange-500 font-mono">
                    W_Node_{warehouse._id.slice(-4)}
                  </div>
                  <div className="text-sm font-black">{warehouse.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  <div className="text-[10px] font-bold uppercase text-default-400">
                    {warehouse.category || "GENERAL"}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="text-[10px] text-default-500 uppercase tracking-tight">
                    Storage Rate
                  </div>
                  <div className="text-sm font-mono font-bold text-orange-400">
                    {warehouse.storageRatePerUnit ?? "—"} {warehouse.unit || "MT"}{" "}
                    <span className="text-[9px] text-default-600">/ unit</span>
                  </div>
                </div>
                <Button
                  color={isBooked ? "success" : "warning"}
                  variant={isBooked ? "flat" : "solid"}
                  size="sm"
                  fullWidth
                  isDisabled={bookingDisabled}
                  onPress={() => onBook(warehouse)}
                  className="font-black uppercase tracking-wider text-[10px]"
                >
                  {isBooked ? "Access Confirmed" : "Secure Capacity"}
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
