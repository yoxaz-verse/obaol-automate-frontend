"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@heroui/react";
import { LuFlaskConical } from "react-icons/lu";
import { renderToStaticMarkup } from "react-dom/server";

export type QualityLabMapItem = {
  _id: string;
  name: string;
  contactPhone?: string;
  contactPhoneSecondary?: string;
  certificatesSummary?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  } | null;
};

type SearchPoint = { latitude: number; longitude: number; label: string };

type Props = {
  labs: QualityLabMapItem[];
  searchPoint: SearchPoint | null;
  center: [number, number];
  zoom: number;
  onContact: (lab: QualityLabMapItem) => void;
};

const mkDotIcon = () =>
  L.divIcon({
    className: "quality-lab-icon",
    html: `
      <div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:#0b1220;border:2px solid #22c55e;box-shadow:0 0 0 3px rgba(34,197,94,0.2),0 6px 16px rgba(0,0,0,0.45);color:#22c55e;line-height:1;">
        ${renderToStaticMarkup(<LuFlaskConical size={13} />)}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

function MapAutoCenter({ point }: { point: SearchPoint | null }) {
  const map = useMap();
  useEffect(() => {
    if (!point) return;
    map.setView([point.latitude, point.longitude], 8, { animate: true });
  }, [map, point]);
  return null;
}

export default function QualityLabsMap({ labs, searchPoint, center, zoom, onContact }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markerIcon = useMemo(() => mkDotIcon(), []);
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const safeLabs = labs.filter((lab) => {
    const lat = Number(lab.location?.latitude);
    const lng = Number(lab.location?.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  });

  return (
    <>
      <MapContainer
        ref={mapRef}
        className="quality-labs-map"
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
        {safeLabs.map((lab) => (
          <Marker key={lab._id} position={[Number(lab.location?.latitude), Number(lab.location?.longitude)]} icon={markerIcon}>
            <Popup className="tactical-popup">
              <div className="min-w-[240px] p-2 space-y-3 rounded-lg border bg-content1 border-default-200">
                <div className="space-y-1">
                  <div className="text-[9px] font-black uppercase tracking-widest text-success-500 font-mono">Q_Lab_{lab._id.slice(-4)}</div>
                  <div className="text-sm font-black">{lab.name}</div>
                </div>
                {lab.contactPhone ? <div className="text-[11px] font-semibold text-default-300">{lab.contactPhone}</div> : null}
                {lab.contactPhoneSecondary ? <div className="text-[10px] text-default-500">Alt: {lab.contactPhoneSecondary}</div> : null}
                {lab.certificatesSummary ? <div className="text-[10px] text-default-500 line-clamp-3">{lab.certificatesSummary}</div> : null}
                <Button
                  color="success"
                  variant="solid"
                  size="sm"
                  fullWidth
                  isDisabled={!lab.contactPhone}
                  onPress={() => onContact(lab)}
                  className="font-black uppercase tracking-wider text-[10px]"
                >
                  Contact
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <style jsx global>{`
        .quality-labs-map .leaflet-control-attribution {
          display: none !important;
        }
      `}</style>
    </>
  );
}
