"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import { Button, Input, Spacer, Tabs, Tab } from "@nextui-org/react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { postData } from "@/core/api/apiHandler";

const LeafletMap = dynamic(() => import("@/components/Leaflet/LeafletMap"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function CIFPage() {
  const [mode, setMode] = useState<"domestic" | "international">(
    "international"
  );
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [cargoValue, setCargoValue] = useState("");
  const [weight, setWeight] = useState("");
  const [placing, setPlacing] = useState<"origin" | "dest" | null>(null);
  const [result, setResult] = useState<any>(null);
  const mapRef = useRef<any>(null);

  const [indianPorts, setIndianPorts] = useState<any[]>([]);
  const [globalPorts, setGlobalPorts] = useState<any[]>([]);
  const [originPortCode, setOriginPortCode] = useState<string>("");
  const [destPortCode, setDestPortCode] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/ports"); // Use your custom backend for UN/LOCODE
        const data = await res.json();
        setIndianPorts(data.filter((p: any) => p.country === "IN"));
        setGlobalPorts(data);
      } catch {
        toast.error("Failed to load port data.");
      }
    })();
  }, []);

  useEffect(() => {
    if (originPortCode) {
      const p = indianPorts.find((p) => p.locode === originPortCode);
      if (p) setOrigin([+p.latitude, +p.longitude]);
    }
  }, [originPortCode, indianPorts]);

  useEffect(() => {
    if (destPortCode) {
      const p = globalPorts.find((p) => p.locode === destPortCode);
      if (p) setDestination([+p.latitude, +p.longitude]);
    }
  }, [destPortCode, globalPorts]);

  const handleMapClick = (e: any) => {
    const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
    placing === "origin" ? setOrigin(coords) : setDestination(coords);
    setPlacing(null);
  };

  const cifMut = useMutation({
    mutationFn: (data: any) => postData("/cif", data, {}),
    onSuccess(res) {
      setResult(res);
      toast.success("CIF calculated!");
    },
    onError(err: any) {
      toast.error(err.response?.data?.message || "CIF failed");
    },
  });

  const domMut = useMutation({
    mutationFn: (data: any) => postData("/cif/domestic", data, {}),
    onSuccess(res) {
      setResult(res);
      toast.success("Domestic cost calculated!");
    },
    onError(err: any) {
      toast.error(err.response?.data?.message || "Domestic failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination)
      return toast.error("Select both origin & destination");
    const base = {
      originCoords: origin,
      destinationCoords: destination,
      cargoValueUSD: parseFloat(cargoValue),
      unitWeightTon: parseFloat(weight),
    };
    mode === "international"
      ? cifMut.mutate({
          ...base,
          originPort: originPortCode,
          destPort: destPortCode,
        })
      : domMut.mutate(base);
  };

  return (
    <div className="flex flex-col md:flex-row p-4 gap-6">
      <div className="flex-1">
        <Tabs selectedKey={mode} onSelectionChange={(k) => setMode(k as any)}>
          <Tab key="domestic" title="Domestic" />
          <Tab key="international" title="International" />
        </Tabs>

        <div className="flex items-center gap-2 mb-2">
          <Button
            color={placing === "origin" ? "primary" : "default"}
            onClick={() => setPlacing("origin")}
          >
            {origin ? "Move Origin" : "Set Origin"}
          </Button>
          <Button
            color={placing === "dest" ? "primary" : "default"}
            onClick={() => setPlacing("dest")}
          >
            {destination ? "Move Destination" : "Set Destination"}
          </Button>
        </div>

        <div className="h-[400px] mb-4">
          <LeafletMap
            origin={origin}
            destination={destination}
            onMapClick={handleMapClick}
            mapRef={mapRef}
          />
        </div>

        {mode === "international" && (
          <>
            <Autocomplete
              label="Origin Port (IN)"
              placeholder="Search Indian port"
              selectedKey={originPortCode}
              onSelectionChange={(key) => key && setOriginPortCode(String(key))}
            >
              {indianPorts.map((p) => (
                <AutocompleteItem key={p.locode}>
                  {p.name} ({p.locode})
                </AutocompleteItem>
              ))}
            </Autocomplete>
            <Spacer y={0.5} />
            <Autocomplete
              label="Destination Port (Global)"
              placeholder="Search global port"
              selectedKey={destPortCode}
              onSelectionChange={(key) => key && setDestPortCode(String(key))}
            >
              {globalPorts.map((p) => (
                <AutocompleteItem key={p.locode}>
                  {p.name}, {p.country} ({p.locode})
                </AutocompleteItem>
              ))}
            </Autocomplete>
          </>
        )}
      </div>

      <div className="w-[300px] space-y-4">
        <Input
          label="Cargo Value (USD)"
          value={cargoValue}
          onChange={(e) => setCargoValue(e.target.value)}
          fullWidth
        />
        <Input
          label="Weight (ton)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          fullWidth
        />
        <Button onClick={handleSubmit} color="warning" fullWidth>
          {mode === "international" ? "Calculate CIF" : "Calculate Domestic"}
        </Button>

        {result && (
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="font-semibold">
              {mode === "international" ? "CIF Breakdown" : "Domestic Summary"}
            </h3>
            <ul>
              <li>Distance: {result.data.distanceKm?.toFixed(1)} km</li>
              <li>Inland Cost: ${result.data.inlandCostUSD?.toFixed(2)}</li>
              {mode === "international" ? (
                <>
                  <li>
                    Ocean Freight: ${result.data.oceanCostUSD?.toFixed(2)}
                  </li>
                  <li>Insurance: ${result.data.insuranceUSD?.toFixed(2)}</li>
                  <li className="mt-2 font-bold">
                    CIF: ${result.data.cifUSD?.toFixed(2)}
                  </li>
                </>
              ) : (
                <>
                  <li>GST (5%): ${result.data.gstUSD?.toFixed(2)}</li>
                  <li className="mt-2 font-bold text-blue-700">
                    Total: ${result.data.totalCostUSD?.toFixed(2)}
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
