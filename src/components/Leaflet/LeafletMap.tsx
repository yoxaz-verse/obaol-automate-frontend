"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { Map as LeafletMapInstance } from "leaflet";
import { useEffect } from "react";
import { MutableRefObject } from "react";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path (for Next.js)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon.png",
  // iconUrl: "/marker-icon.png",
  // shadowUrl: "/marker-shadow.png",
});

const customIcon = L.icon({
  iconUrl: "/marker-icon.png",
  // iconRetinaUrl: "/marker-icon.png",
  // shadowUrl: "/marker-shadow.png",
  iconSize: [25, 30],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function ClickHandler({ onMapClick }: { onMapClick: (e: any) => void }) {
  useMapEvents({ click: onMapClick });
  return null;
}

function SetMapRef({
  mapRef,
}: {
  mapRef: MutableRefObject<LeafletMapInstance | null>;
}) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  return null;
}

type LeafletMapProps = {
  origin: [number, number] | null;
  destination: [number, number] | null;
  onMapClick: (e: any) => void;
  mapRef: MutableRefObject<LeafletMapInstance | null>;
};

export default function LeafletMap({
  origin,
  destination,
  onMapClick,
  mapRef,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={[20, 80]}
      zoom={4.5}
      style={{ height: "100%", width: "100%" }}
    >
      <SetMapRef mapRef={mapRef} />
      <ClickHandler onMapClick={onMapClick} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {origin && (
        <Marker position={origin} icon={customIcon}>
          <Popup>Origin</Popup>
        </Marker>
      )}
      {destination && (
        <Marker position={destination} icon={customIcon}>
          <Popup>Destination</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
