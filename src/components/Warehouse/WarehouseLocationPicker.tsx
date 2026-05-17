"use client";

import { useEffect, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type WarehouseLocationValue = {
  latitude: number;
  longitude: number;
};

type WarehouseLocationPickerProps = {
  value: WarehouseLocationValue | null;
  onChange: (value: WarehouseLocationValue) => void;
  height?: number;
};

const markerIcon = L.divIcon({
  className: "warehouse-pin",
  html: `
    <div class="warehouse-pin__core">
      <div class="warehouse-pin__ring"></div>
      <div class="warehouse-pin__dot"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function ClickHandler({ onPick }: { onPick: (value: WarehouseLocationValue) => void }) {
  useMapEvents({
    click: (event) => {
      onPick({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });
  return null;
}

function SyncView({ value }: { value: WarehouseLocationValue | null }) {
  const map = useMap();
  const invalidateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value) {
      map.setView([value.latitude, value.longitude], Math.max(map.getZoom(), 8), {
        animate: true,
      });
    }

    if (invalidateTimerRef.current) {
      clearTimeout(invalidateTimerRef.current);
    }
    invalidateTimerRef.current = setTimeout(() => {
      if (map.getContainer()) {
        map.invalidateSize();
      }
    }, 0);

    return () => {
      if (invalidateTimerRef.current) {
        clearTimeout(invalidateTimerRef.current);
        invalidateTimerRef.current = null;
      }
    };
  }, [map, value]);

  return null;
}

export default function WarehouseLocationPicker({
  value,
  onChange,
  height = 320,
}: WarehouseLocationPickerProps) {
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const center: [number, number] = value
    ? [value.latitude, value.longitude]
    : [20.5937, 78.9629];
  const zoom = value ? 9 : 4.5;

  return (
    <div className="warehouse-location-picker" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        attributionControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <SyncView value={value} />
        <ClickHandler onPick={onChange} />
        <TileLayer
          url={tileUrl}
          attribution={tileAttribution}
        />
        {value && (
          <Marker position={[value.latitude, value.longitude]} icon={markerIcon} />
        )}
      </MapContainer>
      <style jsx global>{`
        .warehouse-pin {
          background: transparent;
          border: none;
        }
        .warehouse-location-picker :global(.leaflet-tile-pane) {
          filter: brightness(1.08) contrast(1.12) saturate(1.02);
        }
        .warehouse-pin__core {
          position: relative;
          width: 28px;
          height: 28px;
        }
        .warehouse-pin__ring {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          border: 2px solid rgba(245, 165, 36, 0.9);
          background: rgba(245, 165, 36, 0.15);
          box-shadow: 0 0 0 4px rgba(245, 165, 36, 0.12), 0 10px 22px rgba(0, 0, 0, 0.35);
        }
        .warehouse-pin__dot {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: #f59e0b;
          border: 2px solid #111827;
        }
      `}</style>
    </div>
  );
}
