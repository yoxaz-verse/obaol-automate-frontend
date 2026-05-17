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
  contactPhone?: string;
  contactPhoneSecondary?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  } | null;
};

type SearchPoint = { latitude: number; longitude: number; label: string };

type Props = {
  warehouses: WarehouseMapItem[];
  searchPoint: SearchPoint | null;
  center: [number, number];
  zoom: number;
  onContact: (warehouse: WarehouseMapItem) => void;
  showBookNow?: boolean;
};

const CATEGORY_COLOR: Record<string, string> = {
  GENERAL: "#f59e0b",
  COLD_STORAGE: "#06b6d4",
  BONDED: "#8b5cf6",
  AGRO: "#22c55e",
};

const mkWarehouseIcon = (color: string) =>
  L.divIcon({
    className: "warehouse-node-icon",
    html: `
      <span style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:28px;
        height:28px;
        border-radius:9999px;
        border:2px solid rgba(255,255,255,0.95);
        background:linear-gradient(180deg, ${color}44 0%, ${color}26 100%);
        box-shadow:0 0 0 3px ${color}33, 0 6px 14px rgba(0,0,0,0.45);
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-3v-6h-4v6H4a1 1 0 0 1-1-1v-9.5Z" fill="${color}" stroke="rgba(255,255,255,0.92)" stroke-width="1.2" />
          <path d="M3 10.5h18" stroke="rgba(255,255,255,0.82)" stroke-width="1" />
        </svg>
      </span>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

function MapAutoCenter({ point }: { point: SearchPoint | null }) {
  const map = useMap();
  useEffect(() => {
    if (!point) return;
    map.setView([point.latitude, point.longitude], 8, { animate: true });
  }, [map, point]);
  return null;
}

export default function WarehouseRentMap({ warehouses, searchPoint, center, zoom, onContact, showBookNow = false }: Props) {
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const safeWarehouses = warehouses.filter((warehouse) => {
    const lat = Number(warehouse.location?.latitude);
    const lng = Number(warehouse.location?.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  });

  return (
    <>
      <MapContainer
        className="warehouse-rent-map"
        center={center}
        zoom={zoom}
        scrollWheelZoom
        attributionControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <MapAutoCenter point={searchPoint} />
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {safeWarehouses.map((warehouse) => {
          const lat = Number(warehouse.location?.latitude);
          const lng = Number(warehouse.location?.longitude);
          const color = CATEGORY_COLOR[String(warehouse.category || "GENERAL")] || CATEGORY_COLOR.GENERAL;

          return (
            <Marker key={warehouse._id} position={[lat, lng]} icon={mkWarehouseIcon(color)}>
              <Popup className="tactical-popup">
                <div className="min-w-[220px] p-2 space-y-3 rounded-lg border bg-content1 border-default-200">
                  <div className="space-y-1">
                    <div className="text-[9px] font-black uppercase tracking-widest text-orange-500 font-mono">
                      W_Node_{warehouse._id.slice(-4)}
                    </div>
                    <div className="text-sm font-black">{warehouse.name}</div>
                  </div>
                  <div className="text-[11px] font-semibold text-default-300">
                    {warehouse.contactPhone || "Contact unavailable"}
                  </div>
                  {warehouse.contactPhoneSecondary ? (
                    <div className="text-[10px] text-default-500">Alt: {warehouse.contactPhoneSecondary}</div>
                  ) : null}
                  <Button
                    color="warning"
                    variant="solid"
                    size="sm"
                    fullWidth
                    isDisabled={!warehouse.contactPhone}
                    onPress={() => onContact(warehouse)}
                    className="font-black uppercase tracking-wider text-[10px]"
                  >
                    Contact
                  </Button>
                  {showBookNow ? (
                    <Button
                      color="default"
                      variant="bordered"
                      size="sm"
                      fullWidth
                      isDisabled
                      className="font-black uppercase tracking-wider text-[10px]"
                    >
                      Book Now (Coming Soon)
                    </Button>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <style jsx global>{`
        .warehouse-rent-map .leaflet-control-attribution {
          display: none !important;
        }
      `}</style>
    </>
  );
}
