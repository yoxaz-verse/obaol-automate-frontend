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
        className="quality-labs-map"
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
              <div className="min-w-[240px] p-2 space-y-3 rounded-lg border bg-white border-slate-200 text-slate-900">
                <div className="space-y-1">
                  <div className="text-[9px] font-black uppercase tracking-widest text-success-500 font-mono">Q_Lab_{lab._id.slice(-4)}</div>
                  <div className="text-sm font-black">{lab.name}</div>
                </div>
                {lab.contactPhone ? <div className="text-[11px] font-semibold text-slate-700">{lab.contactPhone}</div> : null}
                {lab.contactPhoneSecondary ? <div className="text-[10px] text-slate-500">Alt: {lab.contactPhoneSecondary}</div> : null}
                {lab.certificatesSummary ? <div className="text-[10px] text-slate-500 line-clamp-3">{lab.certificatesSummary}</div> : null}
                <div className="flex flex-wrap gap-1">
                  {lab.capabilityStatus === "LEGACY_REQUIRES_MAPPING" ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-800">Requires mapping</span> : <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-800">Structured</span>}
                  {lab.source ? <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] text-slate-700">{lab.source.replaceAll("_", " ")}</span> : null}
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
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
        }

        .quality-labs-map .tactical-popup .leaflet-popup-content {
          margin: 8px;
        }

        .quality-labs-map .tactical-popup .leaflet-popup-tip {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: none;
        }
      `}</style>
    </>
  );
}
