// pages/cif.tsx
"use client";
import { queryClient } from "@/app/provider";
import { postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import { Button, Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CIFPage() {
  const [form, setForm] = useState({
    originLat: "",
    originLon: "",
    originPort: "",
    destinationLat: "",
    destinationLon: "",
    destinationPort: "",
    destPort: "",
    value: "",
    weight: "",
  });
  const [result, setResult] = useState<any>(null);
  console.log(result.data);

  const addItem = useMutation({
    mutationFn: async (data: any) => postData("/cif", data, {}),
    onSuccess: (res) => {
      queryClient.refetchQueries({
        queryKey: ["/cif"],
      });
      setResult(res);

      toast.success("You did it!"); // Displays a success message
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error.response?.data?.message || "An error occurred",
        position: "top-right",
      });
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const uploadFormData = {
      originCoords: [parseFloat(form.originLat), parseFloat(form.originLon)],
      destinationCoords: [
        parseFloat(form.destinationLat),
        parseFloat(form.destinationLon),
      ],
      originPort: form.originPort,
      destPort: form.destPort,
      cargoValueUSD: parseFloat(form.value),
      unitWeightTon: parseFloat(form.weight),
    };
    addItem.mutate(uploadFormData);
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">CIF Calculator</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        {[
          { key: "originLat", label: "Origin Latitude" },
          { key: "originLon", label: "Origin Longitude" },
          { key: "destinationLat", label: "Destination Latitude" },
          { key: "destinationLon", label: "Destination Longitude" },
          { key: "originPort", label: "Origin Port" },
          { key: "destPort", label: "Destination Port" },
          { key: "value", label: "Cargo Value (USD)" },
          { key: "weight", label: "Weight (ton)" },
        ].map((field) => (
          <div key={field.key}>
            <Input
              type="text"
              label={field.label}
              name={field.label}
              value={(form as any)[field.key]}
              onChange={(e) =>
                setForm({ ...form, [field.key]: e.target.value })
              }
              required
            />
          </div>
        ))}
        <Button type="submit" size="sm" color="warning">
          Calculate
        </Button>
      </form>
      {result && (
        <div className="mt-6 p-4 rounded-lg bg-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            📦 CIF Calculation Breakdown
          </h2>

          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <span className="font-medium">📍 Road Distance:</span>{" "}
              {result.data.distanceKm?.toFixed(2) ?? " "} km
            </li>
            <li>
              <span className="font-medium">🚚 Inland Transport Cost:</span> $
              {result.data.inlandCostUSD?.toFixed(2) ?? " "}
            </li>
            <li>
              <span className="font-medium">🛳️ Ocean Freight Cost:</span> $
              {result.data.oceanCostUSD?.toFixed(2) ?? ""}
            </li>
            <li>
              <span className="font-medium">🛡️ Insurance Cost:</span> $
              {result.data.insuranceUSD?.toFixed(2) ?? " "}
            </li>
            <li className="mt-2 border-t pt-2 font-semibold text-black">
              <span className="text-md">💰 Total CIF Cost:</span>{" "}
              <span className="text-green-700">
                ${result.data.cifUSD?.toFixed(2) ?? " "}
              </span>
            </li>
          </ul>
        </div>
      )}
      zzzz
    </div>
  );
}
