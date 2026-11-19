"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Spinner } from "@nextui-org/react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { FiMapPin, FiSearch } from "react-icons/fi";
import type { StructuredLocation } from "@/types/location";
import { DEFAULT_INDIA_CENTER, DEFAULT_INDIA_ZOOM, isValidCoordinate, toStructuredLocation } from "@/types/location";
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

async function lookup(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal });
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
  const latitude = value?.latitude;
  const longitude = value?.longitude;
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 0);
    if (latitude !== undefined && longitude !== undefined) {
      map.setView([latitude, longitude], Math.max(map.getZoom(), 13), { animate: true });
    } else {
      map.setView(DEFAULT_INDIA_CENTER, DEFAULT_INDIA_ZOOM, { animate: false });
    }
  }, [map, latitude, longitude]);
  return null;
}

export default function LocationSelector({ value, onChange, disabled = false, required = false, height = 360, countryCode, label = "Search address or place" }: Props) {
  const normalized = useMemo(() => toStructuredLocation(value), [value]);
  const [query, setQuery] = useState(normalized?.address || normalized?.label || "");
  const [results, setResults] = useState<StructuredLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");
  const selectionRef = useRef(false);

  useEffect(() => {
    if (selectionRef.current) { selectionRef.current = false; setIsSearching(false); return; }
    const q = query.trim();
    if (disabled || q.length < 3 || q === value?.address || q === value?.label) {
      setResults([]); setIsSearching(false); setSearchedQuery(""); return;
    }
    const controller = new AbortController();
    setIsSearching(true); setSearchedQuery(""); setError("");
    const timer = setTimeout(async () => {
      try {
        const suffix = countryCode ? `&countryCode=${encodeURIComponent(countryCode)}` : "";
        const data = await lookup(`/api/geocoding?mode=search&q=${encodeURIComponent(q)}${suffix}`, controller.signal);
        if (!controller.signal.aborted) { setResults(data.results || []); setSearchedQuery(q); }
      } catch (cause: any) {
        if (!controller.signal.aborted) { setResults([]); setError(cause?.message || "Address search failed."); }
      } finally { if (!controller.signal.aborted) setIsSearching(false); }
    }, 450);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [query, countryCode, disabled, value?.address, value?.label]);

  const select = (next: StructuredLocation) => {
    selectionRef.current = true;
    setQuery(next.address || next.label);
    setResults([]); setSearchedQuery(""); setError(""); setMapError(""); setIsMapLoading(true); onChange(next);
  };
  const reverse = async (latitude: number, longitude: number) => {
    setIsResolvingAddress(true); setError(""); setResults([]); setSearchedQuery("");
    try {
      const suffix = countryCode ? `&countryCode=${encodeURIComponent(countryCode)}` : "";
      const data = await lookup(`/api/geocoding?mode=reverse&lat=${latitude}&lng=${longitude}${suffix}`);
      select(data.result);
    } catch (cause: any) {
      if (countryCode) {
        setError(cause?.message || "Choose a location within the supported country.");
        return;
      }
      const fallback = { latitude, longitude, label: "Selected location", address: query, city: "", district: "", state: "", country: "", countryCode: "", postalCode: "" };
      setMapError(""); setIsMapLoading(true); onChange(fallback); setError(cause?.message || "The pin was saved, but its address could not be resolved.");
    } finally { setIsResolvingAddress(false); }
  };

  const center: [number, number] = normalized ? [normalized.latitude, normalized.longitude] : DEFAULT_INDIA_CENTER;
  const trimmedQuery = query.trim();
  const noResults = !isSearching && !error && searchedQuery === trimmedQuery && trimmedQuery.length >= 3 && results.length === 0;
  const status = isResolvingAddress ? "Finding address…" : isSearching ? "Searching locations…" : isMapLoading ? "Loading map…" : "";
  return <div className="space-y-3">
    <div className="relative z-[500]">
      <Input label={label} value={query} onValueChange={setQuery} isDisabled={disabled} isRequired={required} startContent={<FiSearch />} endContent={isSearching || isResolvingAddress ? <Spinner size="sm" aria-label={isSearching ? "Searching locations" : "Finding address"} /> : null} description="Choose a suggestion or place the pin on the map." />
      {results.length > 0 && <div className="absolute top-full mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-divider bg-content1 p-1 shadow-2xl">
        {results.map((result, index) => <Button key={`${result.latitude}-${result.longitude}-${index}`} variant="light" className="h-auto w-full justify-start whitespace-normal px-3 py-3 text-left" startContent={<FiMapPin className="shrink-0" />} onPress={() => select(result)}>{result.label}</Button>)}
      </div>}
      {noResults && <div className="absolute top-full mt-1 w-full rounded-2xl border border-divider bg-content1 px-4 py-3 text-sm text-default-500 shadow-xl">No matching locations found.</div>}
    </div>
    <p className="sr-only" role="status" aria-live="polite">{status}</p>
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    <div className="relative overflow-hidden rounded-2xl border border-divider" style={{ height }}>
      <MapContainer center={center} zoom={normalized ? 13 : DEFAULT_INDIA_ZOOM} scrollWheelZoom={!disabled} dragging={!disabled} attributionControl={false} style={{ height: "100%", width: "100%" }}>
        <MapSync value={normalized} /><MapEvents disabled={disabled} onPick={reverse} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" eventHandlers={{ loading: () => { setMapError(""); setIsMapLoading(true); }, load: () => setIsMapLoading(false), tileerror: () => { setIsMapLoading(false); setMapError("The map could not finish loading. You can still search for or place a location."); } }} />
        {normalized && isValidCoordinate(normalized.latitude, normalized.longitude) && <Marker position={[normalized.latitude, normalized.longitude]} icon={icon} draggable={!disabled} eventHandlers={{ dragend: event => { const point = event.target.getLatLng(); reverse(point.lat, point.lng); } }} />}
      </MapContainer>
      {(isMapLoading || isResolvingAddress) && <div className="pointer-events-none absolute inset-0 z-[450] grid place-items-center bg-content1/70 backdrop-blur-[1px]" aria-hidden="true">
        <div className="flex items-center gap-3 rounded-2xl border border-divider bg-content1/95 px-4 py-3 shadow-lg"><Spinner size="sm" /><span className="text-sm font-semibold">{isResolvingAddress ? "Finding address…" : "Loading map…"}</span></div>
      </div>}
    </div>
    {mapError && <p role="alert" className="text-sm text-warning-700">{mapError}</p>}
    {normalized && <p className="text-xs text-default-500"><FiMapPin className="mr-1 inline" />{normalized.label} · {normalized.latitude.toFixed(5)}, {normalized.longitude.toFixed(5)}</p>}
    <style jsx global>{`.shared-location-pin{background:transparent;border:0}.shared-location-pin__dot{width:34px;height:34px;border:5px solid white;border-radius:50% 50% 50% 0;background:#ff9f43;box-shadow:0 5px 18px rgba(0,0,0,.35);transform:rotate(-45deg)}`}</style>
  </div>;
}
