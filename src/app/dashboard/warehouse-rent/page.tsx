"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import Title from "@/components/titles";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { FiBox, FiLoader, FiMapPin } from "react-icons/fi";

type Warehouse = {
  _id: string;
  name: string;
  address?: string;
  category?: "GENERAL" | "COLD_STORAGE" | "BONDED" | "AGRO";
  storageRatePerUnit?: number;
  unit?: "KG" | "MT";
  listingType?: "PRIVATE" | "RENTAL";
  isRentalActive?: boolean;
  isActive?: boolean;
};

export default function WarehouseRentPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["warehouse-rentals"],
    queryFn: async () => {
      const res: any = await getData(apiRoutes.warehouses.list, { scope: "available" });
      return res?.data?.data || res?.data || [];
    },
  });

  const rentalWarehouses = useMemo(() => {
    const list: Warehouse[] = Array.isArray(data) ? data : [];
    return list.filter((w) => w?.listingType === "RENTAL" && w?.isRentalActive !== false);
  }, [data]);

  return (
    <section className="w-full min-h-screen p-6 md:p-10 bg-background text-foreground">
      <Title title="Warehouse Space" />
      <Card className="border border-default-200/60 bg-content1/70 backdrop-blur-md rounded-2xl max-w-4xl">
        <CardHeader className="px-6 pt-6">
          <div>
            <h1 className="text-xl font-black tracking-tight">Warehouse Space</h1>
            <p className="text-sm text-default-500 mt-2">
              This section is for renting warehouse space. Requests are handled here and are not migrated
              to any other module.
            </p>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <Divider className="mb-5" />

          {isLoading && (
            <div className="flex items-center gap-2 text-default-400 py-10">
              <FiLoader className="animate-spin" />
              <span className="text-sm font-medium">Loading available warehouse space…</span>
            </div>
          )}

          {isError && (
            <div className="text-sm text-danger-400 py-10">
              Unable to load warehouse space right now.
            </div>
          )}

          {!isLoading && !isError && rentalWarehouses.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-14">
              <div className="w-14 h-14 rounded-2xl bg-default-100 flex items-center justify-center text-2xl text-default-400 mb-3">
                <FiBox />
              </div>
              <div className="text-sm font-semibold text-foreground">No rental warehouses listed yet.</div>
              <div className="text-xs text-default-400 mt-1">
                Rental listings will appear here as they become available.
              </div>
            </div>
          )}

          {!isLoading && !isError && rentalWarehouses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rentalWarehouses.map((w) => (
                <Card key={w._id} className="border border-default-200/60 bg-content1">
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-foreground">{w.name}</div>
                        <div className="text-xs text-default-400 mt-1 flex items-center gap-1">
                          <FiMapPin size={12} />
                          <span>{w.address || "Location not specified"}</span>
                        </div>
                      </div>
                      <Chip size="sm" variant="flat" color="warning">
                        Rental
                      </Chip>
                    </div>

                    <div className="mt-3 text-xs text-default-500">
                      Category: <span className="text-foreground font-semibold">{w.category || "General"}</span>
                    </div>
                    <div className="mt-1 text-xs text-default-500">
                      Rate:{" "}
                      <span className="text-foreground font-semibold">
                        {w.storageRatePerUnit ?? "—"} {w.unit || "MT"}
                      </span>
                      {" "} / storage unit
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
