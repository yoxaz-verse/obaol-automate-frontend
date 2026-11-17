"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Spinner } from "@nextui-org/react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { FiMapPin, FiSearch } from "react-icons/fi";
import type { StructuredLocation } from "@/types/location";
import { isValidCoordinate, toStructuredLocation } from "@/types/location";
import "leaflet/dist/leaflet.css";

type Props = {
  value: StructuredLocation | null;
  onChange: (value: StructuredLocation) => void;
  disabled?: boolean;
  required?: boolean;
  height?: number;
  markerVariant?: "default" | "warehouse" | "lab" | "company" | "vehicle";
  countryCode?: string;
  label?: string;
};

const icon = L.divIcon({
  className: "shared-location-pin",
  html: '<div class="shared-location-pin__dot"></div>',
  iconSize: [34, 42],
  iconAnchor: [17, 42],
});

async function lookup(url: string) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "Location lookup failed.");
  return data;
}

function MapEvents({ disabled, onPick }: { disabled: boolean; onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: event => !disabled && onPick(event.latlng.lat, event.latlng.lng) });
  return null;
}

function MapSync({ value }: { value: StructuredLocation | null }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 0);
    if (value) map.setView([value.latitude, value.longitude], Math.max(map.getZoom(), 13), { animate: true });
  }, [map, value?.latitude, value?.longitude]);
  return null;
}

export default function LocationSelector({ value, onChange, disabled = false, required = false, height = 360, countryCode, label = "Search address or place" }: Props) {
  const normalized = useMemo(() => toStructuredLocation(value), [value]);
  const [query, setQuery] = useState(value?.address || value?.label || "");
  const [results, setResults] = useState<StructuredLocation[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selectionRef = useRef(false);

  useEffect(() => {
    if (selectionRef.current) { selectionRef.current = false; return; }
    const q = query.trim();
    if (disabled || q.length < 3 || q === value?.address || q === value?.label) { setResults([]); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setBusy(true); setError("");
      try {
        const suffix = countryCode ? `&countryCode=${encodeURIComponent(countryCode)}` : "";
        const data = await lookup(`/api/geocoding?mode=search&q=${encodeURIComponent(q)}${suffix}`);
        if (!controller.signal.aborted) setResults(data.results || []);
      } catch (cause: any) {
        if (!controller.signal.aborted) setError(cause?.message || "Address search failed.");
      } finally { if (!controller.signal.aborted) setBusy(false); }
    }, 450);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [query, countryCode, disabled, value?.address, value?.label]);

  const select = (next: StructuredLocation) => {
    selectionRef.current = true;
    setQuery(next.address || next.label);
    setResults([]); setError(""); onChange(next);
  };
  const reverse = async (latitude: number, longitude: number) => {
    setBusy(true); setError(""); setResults([]);
    try {
      const data = await lookup(`/api/geocoding?mode=reverse&lat=${latitude}&lng=${longitude}`);
      select(data.result);
    } catch (cause: any) {
      const fallback = { latitude, longitude, label: "Selected location", address: query, city: "", district: "", state: "", country: "", countryCode: "", postalCode: "" };
      onChange(fallback); setError(cause?.message || "The pin was saved, but its address could not be resolved.");
    } finally { setBusy(false); }
  };

  const center: [number, number] = normalized ? [normalized.latitude, normalized.longitude] : [20.5937, 78.9629];
  return <div className="space-y-3">
    <div className="relative z-[500]">
      <Input label={label} value={query} onValueChange={setQuery} isDisabled={disabled} isRequired={required} startContent={<FiSearch />} endContent={busy ? <Spinner size="sm" /> : null} description="Choose a suggestion or place the pin on the map." />
      {results.length > 0 && <div className="absolute top-full mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-divider bg-content1 p-1 shadow-2xl">
        {results.map((result, index) => <Button key={`${result.latitude}-${result.longitude}-${index}`} variant="light" className="h-auto w-full justify-start whitespace-normal px-3 py-3 text-left" startContent={<FiMapPin className="shrink-0" />} onPress={() => select(result)}>{result.label}</Button>)}
      </div>}
    </div>
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    <div className="overflow-hidden rounded-2xl border border-divider" style={{ height }}>
      <MapContainer center={center} zoom={normalized ? 13 : 4} scrollWheelZoom={!disabled} dragging={!disabled} attributionControl={false} style={{ height: "100%", width: "100%" }}>
        <MapSync value={normalized} /><MapEvents disabled={disabled} onPick={reverse} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {normalized && isValidCoordinate(normalized.latitude, normalized.longitude) && <Marker position={[normalized.latitude, normalized.longitude]} icon={icon} draggable={!disabled} eventHandlers={{ dragend: event => { const point = event.target.getLatLng(); reverse(point.lat, point.lng); } }} />}
      </MapContainer>
    </div>
    {normalized && <p className="text-xs text-default-500"><FiMapPin className="mr-1 inline" />{normalized.label} · {normalized.latitude.toFixed(5)}, {normalized.longitude.toFixed(5)}</p>}
    <style jsx global>{`.shared-location-pin{background:transparent;border:0}.shared-location-pin__dot{width:34px;height:34px;border:5px solid white;border-radius:50% 50% 50% 0;background:#ff9f43;box-shadow:0 5px 18px rgba(0,0,0,.35);transform:rotate(-45deg)}`}</style>
  </div>;
}
