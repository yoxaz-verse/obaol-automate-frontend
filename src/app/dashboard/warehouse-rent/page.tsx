"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import Title from "@/components/titles";
import AuthContext from "@/context/AuthContext";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
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

type AssociateCompany = {
  _id: string;
  name: string;
};

type WarehouseAssignment = {
  _id: string;
  warehouseId?: string | { _id?: string };
  companyId?: string | { _id?: string };
  status?: "ACTIVE" | "INACTIVE";
};

const toArrayData = (response: any): any[] => {
  const direct = response?.data?.data;
  if (Array.isArray(direct)) return direct;
  if (Array.isArray(direct?.data)) return direct.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export default function WarehouseRentPage() {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isAssociate = roleLower === "associate";
  const needsCompanySelect = roleLower === "admin" || roleLower === "operator" || roleLower === "team";
  const userAssociateCompanyId = String(user?.associateCompanyId || "");

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const {
    data: warehousesData,
    isLoading: isLoadingWarehouses,
    isError: isWarehousesError,
    error: warehousesError,
  } = useQuery({
    queryKey: ["warehouse-rentals"],
    queryFn: async () => {
      const res: any = await getData(apiRoutes.warehouses.list, { scope: "available" });
      return toArrayData(res);
    },
  });

  const { data: companiesData } = useQuery({
    queryKey: ["warehouse-rent-companies", roleLower, user?.id],
    queryFn: async () => {
      const res: any = await getData(apiRoutes.associateCompany.getAll, { page: 1, limit: 500, sort: "name:asc" });
      return toArrayData(res);
    },
    enabled: needsCompanySelect,
  });

  const resolvedCompanyIdForAssignments = isAssociate ? userAssociateCompanyId : selectedCompanyId;
  const { data: assignmentsData } = useQuery({
    queryKey: ["warehouse-assignments", roleLower, user?.id, resolvedCompanyIdForAssignments],
    queryFn: async () => {
      const params: any = { status: "ACTIVE" };
      if (resolvedCompanyIdForAssignments) params.companyId = resolvedCompanyIdForAssignments;
      const res: any = await getData(apiRoutes.warehouses.assignments, params);
      return toArrayData(res);
    },
    enabled: isAssociate ? Boolean(userAssociateCompanyId) : Boolean(selectedCompanyId),
  });

  const companies: AssociateCompany[] = Array.isArray(companiesData) ? companiesData : [];
  useEffect(() => {
    if (isAssociate) {
      if (userAssociateCompanyId && selectedCompanyId !== userAssociateCompanyId) {
        setSelectedCompanyId(userAssociateCompanyId);
      }
      return;
    }
    if (needsCompanySelect && !selectedCompanyId && companies.length > 0) {
      setSelectedCompanyId(String(companies[0]?._id || ""));
    }
  }, [isAssociate, needsCompanySelect, userAssociateCompanyId, selectedCompanyId, companies]);

  const rentalWarehouses = useMemo(() => {
    const list: Warehouse[] = Array.isArray(warehousesData) ? warehousesData : [];
    return list.filter((w) => w?.listingType === "RENTAL" && w?.isRentalActive !== false);
  }, [warehousesData]);

  const activeAssignments: WarehouseAssignment[] = Array.isArray(assignmentsData) ? assignmentsData : [];
  const bookedWarehouseIdSet = useMemo(() => {
    const ids = new Set<string>();
    activeAssignments.forEach((assignment) => {
      const value = assignment?.warehouseId;
      const warehouseId = typeof value === "string" ? value : String(value?._id || "");
      if (warehouseId) ids.add(warehouseId);
    });
    return ids;
  }, [activeAssignments]);

  const bookMutation = useMutation({
    mutationFn: (payload: { warehouseId: string; companyId?: string }) =>
      postData(apiRoutes.warehouses.assignments, payload),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Warehouse space booked successfully." });
      queryClient.invalidateQueries({ queryKey: ["warehouse-assignments"] });
      setIsBookModalOpen(false);
      setSelectedWarehouse(null);
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to book warehouse space.",
      });
    },
  });

  const openBookModal = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsBookModalOpen(true);
  };

  const submitBooking = () => {
    if (!selectedWarehouse?._id) return;
    if (!isAssociate && !selectedCompanyId) {
      showToastMessage({ type: "warning", message: "Select an associate company first." });
      return;
    }

    bookMutation.mutate({
      warehouseId: selectedWarehouse._id,
      ...(isAssociate ? {} : { companyId: selectedCompanyId }),
    });
  };

  const warehousesErrorStatus = Number((warehousesError as any)?.response?.status || 0);
  const warehousesErrorMessage =
    warehousesErrorStatus === 403
      ? "Access denied for your role."
      : ((warehousesError as any)?.response?.data?.message || "Unable to load warehouse space right now.");

  return (
    <section className="w-full min-h-screen p-6 md:p-10 bg-background text-foreground">
      <Title title="Warehouse Space" />
      <Card className="border border-default-200/60 bg-content1/70 backdrop-blur-md rounded-2xl max-w-5xl">
        <CardHeader className="px-6 pt-6">
          <div className="w-full">
            <h1 className="text-xl font-black tracking-tight">Warehouse Space</h1>
            <p className="text-sm text-default-500 mt-2">
              Book rental warehouse space for active operational demand.
            </p>
            {needsCompanySelect && (
              <div className="mt-4 max-w-md">
                <Select
                  label="Book On Behalf Of"
                  variant="flat"
                  selectedKeys={selectedCompanyId ? [selectedCompanyId] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string | undefined;
                    setSelectedCompanyId(key || "");
                  }}
                  placeholder="Select associate company"
                >
                  {companies.map((company) => (
                    <SelectItem key={company._id} value={company._id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <Divider className="mb-5" />

          {isLoadingWarehouses && (
            <div className="flex items-center gap-2 text-default-400 py-10">
              <FiLoader className="animate-spin" />
              <span className="text-sm font-medium">Loading available warehouse space...</span>
            </div>
          )}

          {isWarehousesError && (
            <div className="text-sm text-danger-400 py-10">
              {warehousesErrorMessage}
            </div>
          )}

          {!isLoadingWarehouses && !isWarehousesError && rentalWarehouses.length === 0 && (
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

          {!isLoadingWarehouses && !isWarehousesError && rentalWarehouses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rentalWarehouses.map((warehouse) => {
                const isBooked = bookedWarehouseIdSet.has(String(warehouse._id || ""));
                const bookingDisabled = isBooked || (needsCompanySelect && !selectedCompanyId) || bookMutation.isPending;

                return (
                  <Card key={warehouse._id} className="border border-default-200/60 bg-content1">
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-foreground">{warehouse.name}</div>
                          <div className="text-xs text-default-400 mt-1 flex items-center gap-1">
                            <FiMapPin size={12} />
                            <span>{warehouse.address || "Location not specified"}</span>
                          </div>
                        </div>
                        <Chip size="sm" variant="flat" color={isBooked ? "success" : "warning"}>
                          {isBooked ? "Booked" : "Rental"}
                        </Chip>
                      </div>

                      <div className="mt-3 text-xs text-default-500">
                        Category: <span className="text-foreground font-semibold">{warehouse.category || "General"}</span>
                      </div>
                      <div className="mt-1 text-xs text-default-500">
                        Rate:{" "}
                        <span className="text-foreground font-semibold">
                          {warehouse.storageRatePerUnit ?? "—"} {warehouse.unit || "MT"}
                        </span>{" "}
                        / storage unit
                      </div>

                      <div className="mt-4">
                        <Button
                          color={isBooked ? "success" : "warning"}
                          variant={isBooked ? "flat" : "solid"}
                          size="sm"
                          isDisabled={bookingDisabled}
                          onPress={() => openBookModal(warehouse)}
                        >
                          {isBooked ? "Already Booked" : "Book Space"}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirm Warehouse Booking</ModalHeader>
              <ModalBody>
                <div className="text-sm text-default-600">
                  You are about to book <span className="font-semibold text-foreground">{selectedWarehouse?.name || "-"}</span>
                  {needsCompanySelect ? (
                    <>
                      {" "}for{" "}
                      <span className="font-semibold text-foreground">
                        {companies.find((company) => String(company._id) === String(selectedCompanyId))?.name || "selected company"}
                      </span>.
                    </>
                  ) : (
                    <> for your associate company.</>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Cancel</Button>
                <Button color="warning" isLoading={bookMutation.isPending} onPress={submitBooking}>
                  Confirm Booking
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}
