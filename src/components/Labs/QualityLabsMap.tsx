"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@nextui-org/react";
import { LuFlaskConical } from "react-icons/lu";
import { FiMail, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { renderToStaticMarkup } from "react-dom/server";
import { whatsappHref } from "@/types/labProfile";
import { trackLabContact } from "@/utils/labContact";
import { mapTheme } from "@/utils/mapTheme";

export type QualityLabMapItem = {
  _id: string;
  name: string;
  contactPhone?: string;
  whatsappPhone?: string;
  contactEmail?: string;
  contactPhoneSecondary?: string;
  certificatesSummary?: string;
  capabilityStatus?: string;
  source?: string;
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
};

const mkDotIcon = () =>
  L.divIcon({
    className: "quality-lab-icon",
    html: `
      <div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:${mapTheme.abyssal};border:2px solid ${mapTheme.flame};box-shadow:0 0 0 3px rgba(255,177,98,0.22),0 6px 16px rgba(27,38,50,0.32);color:${mapTheme.flame};line-height:1;">
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

function FitLabBounds({ labs, point }: { labs: QualityLabMapItem[]; point: SearchPoint | null }) {
  const map = useMap();
  useEffect(() => {
    if (point) return;
    const positions = labs.flatMap((lab) => {
      const latitude = Number(lab.location?.latitude), longitude = Number(lab.location?.longitude);
      return Number.isFinite(latitude) && Number.isFinite(longitude) ? [[latitude, longitude] as [number, number]] : [];
    });
    if (positions.length === 1) map.setView(positions[0], 9);
    else if (positions.length > 1) map.fitBounds(positions, { padding: [36, 36], maxZoom: 10 });
  }, [labs, map, point]);
  return null;
}

export default function QualityLabsMap({ labs, searchPoint, center, zoom }: Props) {
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
        className="quality-labs-map themed-leaflet-map"
        center={center}
        zoom={zoom}
        scrollWheelZoom
        attributionControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <MapAutoCenter point={searchPoint} />
        <FitLabBounds labs={safeLabs} point={searchPoint} />
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {safeLabs.map((lab) => {
          const whatsAppUrl = whatsappHref(lab.whatsappPhone);
          return (
          <Marker key={lab._id} position={[Number(lab.location?.latitude), Number(lab.location?.longitude)]} icon={markerIcon}>
            <Popup className="tactical-popup">
              <div className="themed-map-popup min-w-[240px] space-y-3 rounded-lg border p-2">
                <div className="space-y-1">
                  <div className="font-mono text-[9px] font-black uppercase tracking-widest text-obaol-700 dark:text-obaol-300">Q_Lab_{lab._id.slice(-4)}</div>
                  <div className="text-sm font-black">{lab.name}</div>
                </div>
                {lab.contactPhone ? <div className="themed-map-popup-muted text-[11px] font-semibold">{lab.contactPhone}</div> : null}
                {lab.contactPhoneSecondary ? <div className="themed-map-popup-muted text-[10px]">Alt: {lab.contactPhoneSecondary}</div> : null}
                {lab.certificatesSummary ? <div className="themed-map-popup-muted line-clamp-3 text-[10px]">{lab.certificatesSummary}</div> : null}
                <div className="flex flex-wrap gap-1">
                  {lab.capabilityStatus === "LEGACY_REQUIRES_MAPPING" ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-800">Requires mapping</span> : <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-800">Structured</span>}
                  {lab.source ? <span className="rounded-full bg-default-100 px-2 py-1 text-[9px] text-default-700">{lab.source.replaceAll("_", " ")}</span> : null}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <Button as="a" href={lab.contactPhone ? `tel:${lab.contactPhone}` : undefined} isDisabled={!lab.contactPhone} size="sm" variant="flat" isIconOnly aria-label="Call lab" onPress={() => trackLabContact(lab._id, "PHONE")}><FiPhone /></Button>
                  <Button as="a" href={whatsAppUrl} target={whatsAppUrl ? "_blank" : undefined} rel={whatsAppUrl ? "noopener noreferrer" : undefined} isDisabled={!whatsAppUrl} size="sm" color="success" variant="flat" isIconOnly aria-label="Chat on WhatsApp" onPress={() => trackLabContact(lab._id, "WHATSAPP")}><FaWhatsapp /></Button>
                  <Button as="a" href={lab.contactEmail ? `mailto:${lab.contactEmail}` : undefined} isDisabled={!lab.contactEmail} size="sm" variant="flat" isIconOnly aria-label="Email lab" onPress={() => trackLabContact(lab._id, "EMAIL")}><FiMail /></Button>
                </div>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>
      <style jsx global>{`
        .quality-labs-map .leaflet-control-attribution {
          display: none !important;
        }

        .quality-labs-map .tactical-popup .leaflet-popup-content-wrapper {
          background: var(--map-popup);
          border: 1px solid var(--map-popup-border);
          border-radius: 12px;
          color: var(--map-popup-text);
          box-shadow: var(--db-shadow-card);
        }

        .quality-labs-map .tactical-popup .leaflet-popup-content {
          margin: 8px;
        }

        .quality-labs-map .tactical-popup .leaflet-popup-tip {
          background: var(--map-popup);
          border: 1px solid var(--map-popup-border);
          box-shadow: none;
        }
      `}</style>
    </>
  );
}
