"use client";

import { Button } from "@nextui-org/react";
import { FiExternalLink, FiMapPin } from "react-icons/fi";
import type { StructuredLocation } from "@/types/location";
import { toStructuredLocation } from "@/types/location";

type Props = { value: StructuredLocation | null; height?: number; compact?: boolean; className?: string };

export default function LocationPreviewMap({ value, height = 240, compact = false, className = "" }: Props) {
  const location = toStructuredLocation(value);
  if (!location) return null;
  const delta = compact ? 0.015 : 0.025;
  const bbox = [location.longitude - delta, location.latitude - delta, location.longitude + delta, location.latitude + delta].join(",");
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`;
  const externalUrl = `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`;
  return <section className={`overflow-hidden rounded-2xl border border-divider bg-content1 ${className}`} aria-label="Location map">
    <iframe title={`Map of ${location.label}`} src={mapUrl} className="w-full border-0" style={{ height }} loading="lazy" referrerPolicy="no-referrer" />
    <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"><p className="min-w-0 text-sm text-default-600"><FiMapPin className="mr-1 inline" />{location.label}</p><Button as="a" href={externalUrl} target="_blank" rel="noopener noreferrer" size="sm" variant="flat" endContent={<FiExternalLink />}>View on map</Button></div>
  </section>;
}
