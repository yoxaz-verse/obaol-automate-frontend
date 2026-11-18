"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Spinner } from "@nextui-org/react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { FiMapPin, FiSearch } from "react-icons/fi";
import type { LocationSlot, StructuredLocation } from "@/types/location";
import { DEFAULT_INDIA_CENTER, DEFAULT_INDIA_ZOOM, isValidCoordinate } from "@/types/location";
import "leaflet/dist/leaflet.css";

type Props = {
  slots: LocationSlot[];
  onChange: (slots: LocationSlot[]) => void;
  disabled?: boolean;
  height?: number;
  countryCode?: string;
};

const colors = ["#ff9f43", "#2563eb", "#16a34a", "#9333ea", "#dc2626"];
const markerIcon = (index: number, label: string) => L.divIcon({
  className: "multi-location-pin",
  html: `<div class="multi-location-pin__shape" style="background:${colors[index % colors.length]}"><span>${index + 1}</span></div><div class="multi-location-pin__label">${label.replace(/[<>&"']/g, "")}</div>`,
  iconSize: [42, 52], iconAnchor: [21, 42],
});

async function lookup(url: string) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "Location lookup failed.");
  return data;
}

function FitPoints({ slots }: { slots: LocationSlot[] }) {
  const map = useMap();
  const signature = slots.map(slot => slot.value ? `${slot.value.latitude},${slot.value.longitude}` : "").join("|");
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 0);
    const points = slots.flatMap(slot => slot.value && isValidCoordinate(slot.value.latitude, slot.value.longitude) ? [[slot.value.latitude, slot.value.longitude] as [number, number]] : []);
    if (points.length === 1) map.setView(points[0], 13, { animate: true });
    else if (points.length > 1) map.fitBounds(points, { padding: [45, 45], maxZoom: 13, animate: true });
    else map.setView(DEFAULT_INDIA_CENTER, DEFAULT_INDIA_ZOOM, { animate: false });
  }, [map, signature, slots]);
  return null;
}

function MapClick({ disabled, onPick }: { disabled: boolean; onPick: (latitude: number, longitude: number) => void }) {
  useMapEvents({ click: event => !disabled && onPick(event.latlng.lat, event.latlng.lng) });
  return null;
}

export default function MultiLocationSelector({ slots, onChange, disabled = false, height = 360, countryCode }: Props) {
  const [activeId, setActiveId] = useState(slots[0]?.id || "");
  const [queries, setQueries] = useState<Record<string, string>>(() => Object.fromEntries(slots.map(slot => [slot.id, slot.value?.address || slot.value?.label || ""])));
  const [results, setResults] = useState<Record<string, StructuredLocation[]>>({});
  const [busyId, setBusyId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const activeIndex = Math.max(0, slots.findIndex(slot => slot.id === activeId));

  useEffect(() => {
    setQueries(current => Object.fromEntries(slots.map(slot => [slot.id, current[slot.id] ?? slot.value?.address ?? slot.value?.label ?? ""])));
    if (!slots.some(slot => slot.id === activeId)) setActiveId(slots[0]?.id || "");
  }, [slots, activeId]);

  const updateSlot = (id: string, value: StructuredLocation) => {
    setQueries(current => ({ ...current, [id]: value.address || value.label }));
    setResults(current => ({ ...current, [id]: [] }));
    setErrors(current => ({ ...current, [id]: "" }));
    onChange(slots.map(slot => slot.id === id ? { ...slot, value } : slot));
  };
  const search = async (slot: LocationSlot) => {
    const query = String(queries[slot.id] || "").trim();
    if (query.length < 3) return setErrors(current => ({ ...current, [slot.id]: "Enter at least three characters." }));
    setActiveId(slot.id); setBusyId(slot.id); setErrors(current => ({ ...current, [slot.id]: "" }));
    try {
      const suffix = countryCode ? `&countryCode=${encodeURIComponent(countryCode)}` : "";
      const data = await lookup(`/api/geocoding?mode=search&q=${encodeURIComponent(query)}${suffix}`);
      setResults(current => ({ ...current, [slot.id]: data.results || [] }));
      if (!data.results?.length) setErrors(current => ({ ...current, [slot.id]: "No matching locations found." }));
    } catch (error: any) { setErrors(current => ({ ...current, [slot.id]: error?.message || "Address search failed." })); }
    finally { setBusyId(""); }
  };
  const reverse = async (id: string, latitude: number, longitude: number) => {
    setActiveId(id); setBusyId(id); setErrors(current => ({ ...current, [id]: "" }));
    try { const data = await lookup(`/api/geocoding?mode=reverse&lat=${latitude}&lng=${longitude}`); updateSlot(id, data.result); }
    catch (error: any) {
      updateSlot(id, { latitude, longitude, label: "Selected location", address: queries[id] || "", city: "", district: "", state: "", country: "", countryCode: "", postalCode: "" });
      setErrors(current => ({ ...current, [id]: error?.message || "The point was saved without a resolved address." }));
    } finally { setBusyId(""); }
  };
  const center = useMemo<[number, number]>(() => {
    const selected = slots.find(slot => slot.value && isValidCoordinate(slot.value.latitude, slot.value.longitude))?.value;
    return selected ? [selected.latitude, selected.longitude] : DEFAULT_INDIA_CENTER;
  }, [slots]);

  return <div className="space-y-4">
    <div className={`grid gap-3 ${slots.length > 1 ? "md:grid-cols-2" : ""}`}>
      {slots.map((slot, index) => <div key={slot.id} className={`relative rounded-2xl border p-2 transition ${activeId === slot.id ? "border-obaol-500 bg-obaol-500/5" : "border-divider"}`} onFocus={() => setActiveId(slot.id)}>
        <form className="flex gap-2" onSubmit={event => { event.preventDefault(); void search(slot); }}>
          <Input label={slot.label} value={queries[slot.id] || ""} onValueChange={value => setQueries(current => ({ ...current, [slot.id]: value }))} isRequired={slot.required} isDisabled={disabled} startContent={<span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black text-white" style={{ background: colors[index % colors.length] }}>{index + 1}</span>} endContent={busyId === slot.id ? <Spinner size="sm" /> : null} />
          <Button isIconOnly type="submit" aria-label={`Search ${slot.label}`} isDisabled={disabled || busyId === slot.id} className="mt-2 h-12 shrink-0"><FiSearch /></Button>
        </form>
        {(results[slot.id] || []).length > 0 && <div className="absolute left-2 right-2 top-full z-[600] mt-1 max-h-56 overflow-auto rounded-xl border border-divider bg-content1 p-1 shadow-2xl">{results[slot.id].map((result, resultIndex) => <Button key={`${result.latitude}-${result.longitude}-${resultIndex}`} variant="light" className="h-auto w-full justify-start whitespace-normal px-3 py-2 text-left" startContent={<FiMapPin />} onPress={() => updateSlot(slot.id, result)}>{result.label}</Button>)}</div>}
        {errors[slot.id] && <p role="alert" className="px-2 pt-1 text-xs text-danger">{errors[slot.id]}</p>}
      </div>)}
    </div>
    <p className="text-xs text-default-500">Select a field above, then search or click the map to place that point.</p>
    <div className="overflow-hidden rounded-2xl border border-divider" style={{ height }}>
      <MapContainer center={center} zoom={slots.some(slot => slot.value && isValidCoordinate(slot.value.latitude, slot.value.longitude)) ? 12 : DEFAULT_INDIA_ZOOM} scrollWheelZoom={!disabled} dragging={!disabled} attributionControl={false} style={{ height: "100%", width: "100%" }}>
        <FitPoints slots={slots} /><MapClick disabled={disabled || !slots[activeIndex]} onPick={(lat, lng) => reverse(slots[activeIndex].id, lat, lng)} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {slots.map((slot, index) => slot.value && isValidCoordinate(slot.value.latitude, slot.value.longitude) && <Marker key={slot.id} position={[slot.value.latitude, slot.value.longitude]} icon={markerIcon(index, slot.label)} draggable={!disabled} eventHandlers={{ click: () => setActiveId(slot.id), dragend: event => { const point = event.target.getLatLng(); void reverse(slot.id, point.lat, point.lng); } }} />)}
      </MapContainer>
    </div>
    <style jsx global>{`.multi-location-pin{background:transparent;border:0}.multi-location-pin__shape{display:grid;width:34px;height:34px;place-items:center;border:4px solid #fff;border-radius:50% 50% 50% 0;box-shadow:0 5px 16px rgba(0,0,0,.35);color:#fff;font-weight:900;transform:rotate(-45deg)}.multi-location-pin__shape span{transform:rotate(45deg)}.multi-location-pin__label{position:absolute;left:40px;top:5px;white-space:nowrap;border-radius:8px;background:rgba(17,24,39,.88);padding:3px 7px;color:#fff;font-size:11px;font-weight:700}`}</style>
  </div>;
}
