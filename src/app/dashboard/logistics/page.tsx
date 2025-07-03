"use client";

import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Spacer,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { postData } from "@/core/api/apiHandler";

// Dynamically load LeafletMap without SSR
const LeafletMap = dynamic(() => import("@/components/Leaflet/LeafletMap"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

// Sample ports
const INDIAN_PORTS = [
  { code: "MUM", name: "Mumbai" },
  { code: "KOC", name: "Kochi" },
  { code: "NAG", name: "New Mangalore" },
  { code: "CHN", name: "Chennai" },
];

const GLOBAL_PORTS = [
  { code: "SGP", name: "Singapore" },
  { code: "SHG", name: "Shanghai" },
  { code: "DXB", name: "Dubai" },
  { code: "LON", name: "London" },
];

export default function CIFPage() {
  const [mode, setMode] = useState<"domestic" | "international">(
    "international"
  );
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [originPort, setOriginPort] = useState("");
  const [destPort, setDestPort] = useState("");
  const [cargoValue, setCargoValue] = useState("");
  const [weight, setWeight] = useState("");
  const [placing, setPlacing] = useState<"origin" | "dest" | null>(null);
  const [result, setResult] = useState<any>(null);
  const mapRef = useRef<any>(null);

  const handleMapClick = (e: any) => {
    const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
    if (placing === "origin") setOrigin(coords);
    else if (placing === "dest") setDestination(coords);
    setPlacing(null);
  };

  const cifMutation = useMutation({
    mutationFn: (data: any) => postData("/cif", data, {}),
    onSuccess(res) {
      setResult(res);
      toast.success("CIF calculated!");
    },
    onError(err: any) {
      toast.error(err.response?.data?.message || "Calculation failed");
    },
  });

  const domesticMutation = useMutation({
    mutationFn: (data: any) => postData("/cif/domestic", data, {}),
    onSuccess(res) {
      setResult(res);
      toast.success("Domestic cost calculated!");
    },
    onError(err: any) {
      toast.error(err.response?.data?.message || "Domestic calc failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!origin || !destination) {
      return toast.error("Please select both points");
    }

    const basePayload = {
      originCoords: origin,
      destinationCoords: destination,
      cargoValueUSD: parseFloat(cargoValue),
      unitWeightTon: parseFloat(weight),
    };

    if (mode === "international") {
      if (!originPort || !destPort) {
        return toast.error("Please select origin and destination ports");
      }
      cifMutation.mutate({
        ...basePayload,
        originPort,
        destPort,
      });
    } else {
      domesticMutation.mutate(basePayload);
    }
  };

  return (
    <div className="flex flex-col md:flex-row p-4 gap-6">
      {/* ─── Left Side: Map & Controls ───────────────── */}
      <div className="flex-1">
        <Tabs
          variant="underlined"
          color="warning"
          selectedKey={mode}
          onSelectionChange={(key) =>
            setMode(key as "domestic" | "international")
          }
          className="mb-4"
        >
          <Tab key="domestic" title="Domestic" />
          <Tab key="international" title="International" />
        </Tabs>

        <h2 className="text-lg font-bold mb-2 text-white">📍 Pick Locations</h2>
        <div className="flex gap-2 mb-2">
          <Button
            size="sm"
            color={placing === "origin" ? "primary" : "default"}
            onClick={() => setPlacing("origin")}
          >
            {origin ? "Reset Origin" : "Set Origin"}
          </Button>
          <Button
            size="sm"
            color={placing === "dest" ? "primary" : "default"}
            onClick={() => setPlacing("dest")}
          >
            {destination ? "Reset Destination" : "Set Destination"}
          </Button>
        </div>

        <div className="h-[300px]">
          <LeafletMap
            origin={origin}
            destination={destination}
            onMapClick={handleMapClick}
            mapRef={mapRef}
          />
        </div>

        {mode === "international" && (
          <>
            <Spacer y={1} />
            <Select
              label="Origin Port"
              selectedKeys={new Set([originPort])}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0];
                if (typeof v === "string") setOriginPort(v);
              }}
            >
              {INDIAN_PORTS.map((p) => (
                <SelectItem key={p.code} textValue={p.code} value={p.code}>
                  {p.name} ({p.code})
                </SelectItem>
              ))}
            </Select>
            <Spacer y={1} />
            <Select
              label="Destination Port"
              selectedKeys={new Set([destPort])}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0];
                if (typeof v === "string") setDestPort(v);
              }}
            >
              {GLOBAL_PORTS.map((p) => (
                <SelectItem key={p.code} textValue={p.code} value={p.code}>
                  {p.name} ({p.code})
                </SelectItem>
              ))}
            </Select>
          </>
        )}
      </div>

      {/* ─── Right Side: Inputs & Result ───────────────── */}
      <div className="w-[300px] space-y-4">
        <h2 className="text-lg font-bold text-white">
          📝 <span className="text-warning-500">Cargo </span> Details
        </h2>
        <Input
          type="number"
          label="Cargo Value (USD)"
          value={cargoValue}
          onChange={(e) => setCargoValue(e.target.value)}
          fullWidth
        />
        <Input
          type="number"
          label="Weight (ton)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          fullWidth
        />
        <Button onClick={handleSubmit} color="warning" fullWidth>
          {mode === "international"
            ? "Calculate CIF"
            : "Calculate Domestic Cost"}
        </Button>

        {result && (
          <div className="bg-gray-50 p-4 rounded shadow text-black">
            <h3 className="font-semibold mb-2">
              📦 {mode === "international" ? "CIF Breakdown" : "Domestic Cost"}
            </h3>
            <ul className="space-y-1 text-sm">
              <li>
                <strong>🛣️ Road Distance:</strong>{" "}
                {result.data.distanceKm?.toFixed(2) ?? "N/A"} km
              </li>
              <li>
                <strong>🚚 Inland Cost:</strong> $
                {result.data.inlandCostUSD?.toFixed(2) ?? "N/A"}
              </li>

              {mode === "international" ? (
                <>
                  <li>
                    <strong>🛳️ Ocean Freight:</strong> $
                    {result.data.oceanCostUSD?.toFixed(2) ?? "N/A"}
                  </li>
                  <li>
                    <strong>🛡️ Insurance:</strong> $
                    {result.data.insuranceUSD?.toFixed(2) ?? "N/A"}
                  </li>
                  <li className="mt-2 border-t pt-2">
                    <strong>💰 Total CIF:</strong>{" "}
                    <span className="text-green-700">
                      ${result.data.cifUSD?.toFixed(2) ?? "N/A"}
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <strong>🧾 Product Value:</strong> $
                    {parseFloat(cargoValue).toFixed(2)}
                  </li>
                  <li>
                    <strong>🧮 GST (5%):</strong> $
                    {result.data.gstUSD?.toFixed(2) ?? "N/A"}
                  </li>
                  <li className="mt-2 border-t pt-2">
                    <strong>💰 Total Cost:</strong>{" "}
                    <span className="text-blue-700">
                      ${result.data.totalCostUSD?.toFixed(2) ?? "N/A"}
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
