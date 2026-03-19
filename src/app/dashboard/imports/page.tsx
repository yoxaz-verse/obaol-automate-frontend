"use client";

import React, { useContext, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Chip,
} from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/tabs";
import AuthContext from "@/context/AuthContext";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { DEFAULT_STALE_TIME, extractList, useImportReservations, useImportsList } from "@/core/data";
import Title from "@/components/titles";
import InlineLoader from "@/components/ui/InlineLoader";
import { showToastMessage } from "@/utils/utils";

type ImportTab = "all" | "mine" | "reservations";

export default function ImportsPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ImportTab>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const isFormOpen = createOpen || editOpen;

  const [createForm, setCreateForm] = useState({
    productId: "",
    productVariant: "",
    totalQuantity: "",
    quantityUnit: "MT",
    price: "",
    priceUnit: "KG",
    adminCommission: "",
    expectedArrivalDate: "",
    arrivalWindowDays: "",
    portId: "",
    portName: "",
    importerCompanyId: "",
  });

  const [editForm, setEditForm] = useState({
    productId: "",
    productVariant: "",
    totalQuantity: "",
    quantityUnit: "MT",
    price: "",
    priceUnit: "KG",
    adminCommission: "",
    expectedArrivalDate: "",
    arrivalWindowDays: "",
    portId: "",
    portName: "",
    importerCompanyId: "",
  });

  const [reserveQty, setReserveQty] = useState("");

  const {
    data: importsResponse,
    isLoading: importsLoading,
  } = useImportsList(
    {
      mine: activeTab === "mine",
      limit: 20,
    },
    { enabled: true }
  );

  const {
    data: reservationsResponse,
    isLoading: reservationsLoading,
  } = useImportReservations(
    {
      mine: activeTab === "reservations",
      listingId: selectedListing?._id,
      limit: 20,
    },
    { enabled: activeTab === "reservations" || !!selectedListing?._id }
  );

  const imports = importsResponse?.list ?? extractList(importsResponse?.raw ?? importsResponse);
  const reservations = reservationsResponse?.list ?? extractList(reservationsResponse?.raw ?? reservationsResponse);

  const { data: countriesResponse } = useQuery({
    queryKey: ["countries"],
    queryFn: () => getData(apiRoutes.country.getAll, { limit: 200 }),
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const countries = extractList(countriesResponse?.data);
  const india = useMemo(() => countries.find((c: any) => String(c?.name || "").toLowerCase() === "india"), [countries]);

  const { data: portsResponse } = useQuery({
    queryKey: ["sea-ports", india?._id],
    queryFn: () => getData(apiRoutes.enquiry.seaPorts, { country: india?._id, limit: 500 }),
    enabled: !!india?._id && isFormOpen,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const ports = extractList(portsResponse?.data);

  const { data: productsResponse } = useQuery({
    queryKey: ["products"],
    queryFn: () => getData(apiRoutes.product.getAll, { limit: 200 }),
    enabled: isFormOpen,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const products = extractList(productsResponse?.data);

  const { data: companiesResponse } = useQuery({
    queryKey: ["associate-companies"],
    queryFn: () => getData(apiRoutes.associateCompany.getAll, { limit: 200 }),
    enabled: isFormOpen,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const companies = extractList(companiesResponse?.data);

  const { data: variantsResponse } = useQuery({
    queryKey: ["product-variants", createForm.productId],
    queryFn: () =>
      getData(apiRoutes.productVariant.getAll, {
        limit: 200,
        product: createForm.productId || undefined,
      }),
    enabled: !!createForm.productId && isFormOpen,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const variants = extractList(variantsResponse?.data);

  const createMutation = useMutation({
    mutationFn: (payload: any) => postData(apiRoutes.imports.create, payload),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Import listing created." });
      setCreateOpen(false);
      setCreateForm({
        productId: "",
        productVariant: "",
        totalQuantity: "",
        quantityUnit: "MT",
        price: "",
        priceUnit: "KG",
        adminCommission: "",
        expectedArrivalDate: "",
        arrivalWindowDays: "",
        portId: "",
        portName: "",
        importerCompanyId: "",
      });
      queryClient.invalidateQueries({ queryKey: ["imports"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to create listing.",
      });
    },
  });

  const reserveMutation = useMutation({
    mutationFn: (payload: any) => postData(apiRoutes.imports.reserve(payload.id), payload.data),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Reservation submitted." });
      setReserveOpen(false);
      setReserveQty("");
      queryClient.invalidateQueries({ queryKey: ["imports"] });
      queryClient.invalidateQueries({ queryKey: ["import-reservations"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to reserve quantity.",
      });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => patchData(apiRoutes.importReservations.accept(id), {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Reservation accepted and enquiry created." });
      queryClient.invalidateQueries({ queryKey: ["imports"] });
      queryClient.invalidateQueries({ queryKey: ["import-reservations"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to accept reservation.",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => patchData(apiRoutes.importReservations.reject(id), {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Reservation rejected." });
      queryClient.invalidateQueries({ queryKey: ["import-reservations"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to reject reservation.",
      });
    },
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => patchData(apiRoutes.imports.close(id), {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Listing closed." });
      queryClient.invalidateQueries({ queryKey: ["imports"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to close listing.",
      });
    },
  });

  const roleLower = String(user?.role || "").toLowerCase();
  const canCreate = roleLower === "associate" || roleLower === "admin" || roleLower === "operator" || roleLower === "team";
  const needsCompanySelect = roleLower === "admin" || roleLower === "operator" || roleLower === "team";
  const canSetCommission = roleLower === "admin" || roleLower === "operator" || roleLower === "team";
  const canEditAny = roleLower === "admin" || roleLower === "operator" || roleLower === "team";
  const canEditListing = (listing: any) =>
    canEditAny || String(listing?.importerAssociateId?._id || listing?.importerAssociateId || "") === String(user?._id || user?.id || "");
  const associateCompanyId = String(user?.associateCompanyId || "");

  const canViewSensitive = (listing: any) => {
    if (typeof listing?.canViewCommission === "boolean") return listing.canViewCommission;
    if (roleLower === "admin") return true;
    if (roleLower === "operator" || roleLower === "team") {
      const assignedOperator = listing?.importerCompanyId?.assignedOperator;
      return String(assignedOperator || "") === String(user?.id || "");
    }
    if (roleLower === "associate") {
      const importerCompanyId = String(listing?.importerCompanyId?._id || listing?.importerCompanyId || "");
      return Boolean(associateCompanyId && importerCompanyId && importerCompanyId === associateCompanyId);
    }
    return false;
  };

  const canViewImporter = (listing: any) => {
    if (typeof listing?.canViewImporter === "boolean") return listing.canViewImporter;
    return canViewSensitive(listing);
  };

  const getDisplayPrice = (listing: any) => {
    if (listing?.displayPrice !== undefined && listing?.displayPrice !== null) {
      return listing.displayPrice;
    }
    return Number(listing?.price || 0);
  };

  const editMutation = useMutation({
    mutationFn: (payload: { id: string; data: any }) => patchData(apiRoutes.imports.update(payload.id), payload.data),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Import listing updated." });
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["imports"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to update listing.",
      });
    },
  });

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8">
      <div className="w-full max-w-[1400px]">
        <header className="mb-6 flex flex-col gap-2">
          <Title title="Incoming Imports" />
          <p className="text-default-500">
            Importer associates can list incoming loads; buyers can reserve quantities and move into the enquiry flow.
          </p>
        </header>

        <div className="bg-content1 rounded-3xl border border-default-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
              <Tabs
                aria-label="Import tabs"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as ImportTab)}
                variant="underlined"
                color="warning"
                classNames={{
                  tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                  cursor: "w-full bg-warning-500",
                  tab: "max-w-fit px-0 h-12",
                  tabContent:
                    "text-default-600 dark:text-default-300 group-data-[selected=true]:text-warning-500 font-semibold",
                }}
              >
                <Tab key="all" title="All Imports" />
                <Tab key="mine" title="My Listings" />
                <Tab key="reservations" title="My Reservations" />
              </Tabs>

              {canCreate && (
                <Button color="warning" onClick={() => setCreateOpen(true)}>
                  Create Listing
                </Button>
              )}
            </div>

            {activeTab !== "reservations" && importsLoading && (
              <InlineLoader message="Loading import listings" />
            )}

            {activeTab === "reservations" && reservationsLoading && (
              <InlineLoader message="Loading reservations" />
            )}

            {activeTab !== "reservations" && !importsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {imports.map((listing: any) => (
                  <Card key={listing._id} className="border border-default-200">
                    <CardHeader className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-lg font-semibold">{listing.commodityName}</div>
                        <Chip size="sm" color="warning" variant="flat">
                          {listing.status}
                        </Chip>
                        {listing.expectedArrivalDate && (() => {
                          const diffDays = Math.ceil((new Date(listing.expectedArrivalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          if (diffDays > 0) return <Chip size="sm" color="primary" variant="flat">In {diffDays} {diffDays === 1 ? 'day' : 'days'}</Chip>;
                          if (diffDays === 0) return <Chip size="sm" color="success" variant="flat">Arrives today</Chip>;
                          return <Chip size="sm" color="danger" variant="flat">{Math.abs(diffDays)} {Math.abs(diffDays) === 1 ? 'day' : 'days'} ago</Chip>;
                        })()}
                      </div>
                      <div className="text-sm text-default-500">
                        {listing.portName || "Port TBD"} • ETA{" "}
                        {listing.expectedArrivalDate
                          ? new Date(listing.expectedArrivalDate).toLocaleDateString()
                          : "TBD"}
                      </div>
                    </CardHeader>
                    <CardBody className="gap-3">
                      <div className="text-sm">
                        Quantity:{" "}
                        <span className="font-semibold">
                          {listing.availableQuantity}/{listing.totalQuantity} {listing.quantityUnit}
                        </span>
                      </div>
                      <div className="text-sm">
                        Price:{" "}
                        <span className="font-semibold">
                          {getDisplayPrice(listing)} / {listing.priceUnit}
                        </span>
                      </div>
                      {canViewSensitive(listing) && Number(listing.adminCommission || 0) > 0 && (
                        <div className="text-xs text-default-500">
                          OBAOL Commission: {listing.adminCommission} / {listing.priceUnit}
                        </div>
                      )}
                      {canViewSensitive(listing) && (
                        <div className="text-xs text-default-500">
                          Importer: {listing.importerCompanyId?.name || "—"}
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {activeTab === "all" && (
                          <Button
                            size="sm"
                            color="warning"
                            onClick={() => {
                              setSelectedListing(listing);
                              setReserveOpen(true);
                            }}
                          >
                            Reserve Quantity
                          </Button>
                        )}
                        {canEditListing(listing) && (
                          <Button
                            size="sm"
                            variant="bordered"
                            onClick={() => {
                              setSelectedListing(listing);
                              const productId = listing?.productVariant?.product?._id || listing?.productId || "";
                              const productVariant = listing?.productVariant?._id || listing?.productVariant || "";
                              const arrivalDate = listing?.expectedArrivalDate
                                ? new Date(listing.expectedArrivalDate).toISOString().slice(0, 10)
                                : "";
                              setEditForm({
                                productId: productId ? String(productId) : "",
                                productVariant: productVariant ? String(productVariant) : "",
                                totalQuantity: String(listing.totalQuantity || ""),
                                quantityUnit: listing.quantityUnit || "MT",
                                price: String(listing.price || ""),
                                priceUnit: listing.priceUnit || "KG",
                                adminCommission: String(listing.adminCommission || ""),
                                expectedArrivalDate: arrivalDate,
                                arrivalWindowDays: String(listing.arrivalWindowDays || ""),
                                portId: listing.portId?._id || listing.portId || "",
                                portName: listing.portName || "",
                                importerCompanyId: listing.importerCompanyId?._id || listing.importerCompanyId || "",
                              });
                              setEditOpen(true);
                            }}
                          >
                            Edit Listing
                          </Button>
                        )}
                        {activeTab === "mine" && (
                          <>
                            <Button
                              size="sm"
                              variant="bordered"
                              onClick={() => {
                                setSelectedListing(listing);
                                setManageOpen(true);
                              }}
                            >
                              View Reservations
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onClick={() => closeMutation.mutate(listing._id)}
                            >
                              Close Listing
                            </Button>
                          </>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "reservations" && !reservationsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {reservations.map((reservation: any) => (
                  <Card key={reservation._id} className="border border-default-200">
                    <CardHeader className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">
                          {reservation.listingId?.commodityName || "Import"}
                        </div>
                        <div className="text-xs text-default-500">
                          {reservation.listingId?.portName || "Port TBD"}
                        </div>
                      </div>
                      <Chip size="sm" color="warning" variant="flat">
                        {reservation.status}
                      </Chip>
                    </CardHeader>
                    <CardBody className="gap-3">
                      <div className="text-sm">
                        Quantity: <span className="font-semibold">{reservation.quantityRequested}</span>
                      </div>
                      {canViewSensitive(reservation.listingId) && (
                        <div className="text-xs text-default-500">
                          Importer: {reservation.listingId?.importerCompanyId?.name || "—"}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={createOpen}
        onOpenChange={setCreateOpen}
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled
        shouldCloseOnInteractOutside={() => false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create Import Listing</ModalHeader>
              <ModalBody className="gap-4">
                {needsCompanySelect && (
                  <Select
                    label="Importer Company"
                    selectedKeys={createForm.importerCompanyId ? [createForm.importerCompanyId] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setCreateForm((prev) => ({ ...prev, importerCompanyId: key || "" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    {companies.map((company: any) => (
                      <SelectItem key={company._id} value={company._id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
                <Select
                  label="Product"
                  selectedKeys={createForm.productId ? [createForm.productId] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string | undefined;
                    setCreateForm((prev) => ({ ...prev, productId: key || "", productVariant: "" }));
                  }}
                  popoverProps={{ shouldCloseOnBlur: false }}
                >
                  {products.map((product: any) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Product Variant"
                  isDisabled={!createForm.productId}
                  selectedKeys={createForm.productVariant ? [createForm.productVariant] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string | undefined;
                    setCreateForm((prev) => ({ ...prev, productVariant: key || "" }));
                  }}
                  popoverProps={{ shouldCloseOnBlur: false }}
                >
                  {variants.map((variant: any) => (
                    <SelectItem key={variant._id} value={variant._id}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </Select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Total Quantity"
                    type="number"
                    value={createForm.totalQuantity}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, totalQuantity: value }))}
                  />
                  <Select
                    label="Quantity Unit"
                    selectedKeys={[createForm.quantityUnit]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setCreateForm((prev) => ({ ...prev, quantityUnit: key || "MT" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    <SelectItem key="MT" value="MT">
                      MT
                    </SelectItem>
                    <SelectItem key="KG" value="KG">
                      KG
                    </SelectItem>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    value={createForm.price}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, price: value }))}
                  />
                  <Select
                    label="Price Unit"
                    selectedKeys={[createForm.priceUnit]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setCreateForm((prev) => ({ ...prev, priceUnit: key || "KG" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    <SelectItem key="KG" value="KG">
                      Per KG
                    </SelectItem>
                    <SelectItem key="MT" value="MT">
                      Per MT
                    </SelectItem>
                  </Select>
                </div>
                {canSetCommission && (
                  <Input
                    label="OBAOL Commission"
                    type="number"
                    value={createForm.adminCommission}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, adminCommission: value }))}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Expected Arrival Date"
                    type="date"
                    value={createForm.expectedArrivalDate}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, expectedArrivalDate: value }))}
                  />
                  <Input
                    label="Arrival Window (days)"
                    type="number"
                    value={createForm.arrivalWindowDays}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, arrivalWindowDays: value }))}
                  />
                </div>
                {ports.length > 0 ? (
                  <Select
                    label="Arrival Port"
                    selectedKeys={createForm.portId ? [createForm.portId] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setCreateForm((prev) => ({ ...prev, portId: key || "", portName: "" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    {ports.map((port: any) => (
                      <SelectItem key={port._id} value={port._id}>
                        {port.name} ({port.loCode})
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <Input
                    label="Arrival Port (manual)"
                    value={createForm.portName}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, portName: value }))}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  color="warning"
                  isLoading={createMutation.isPending}
                  isDisabled={!createForm.productId || !createForm.productVariant}
                  onClick={() =>
                    createMutation.mutate({
                      productId: createForm.productId || undefined,
                      productVariant: createForm.productVariant || undefined,
                      totalQuantity: Number(createForm.totalQuantity),
                      quantityUnit: createForm.quantityUnit,
                      price: Number(createForm.price),
                      priceUnit: createForm.priceUnit,
                      adminCommission: canSetCommission ? Number(createForm.adminCommission || 0) : undefined,
                      expectedArrivalDate: createForm.expectedArrivalDate || undefined,
                      arrivalWindowDays: createForm.arrivalWindowDays || undefined,
                      portId: createForm.portId || undefined,
                      portName: createForm.portName || undefined,
                      importerCompanyId: needsCompanySelect ? createForm.importerCompanyId || undefined : undefined,
                    })
                  }
                >
                  Create Listing
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={reserveOpen}
        onOpenChange={setReserveOpen}
        isDismissable={false}
        isKeyboardDismissDisabled
        shouldCloseOnInteractOutside={() => false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Reserve Quantity</ModalHeader>
              <ModalBody>
                <Input
                  label="Quantity"
                  type="number"
                  value={reserveQty}
                  onValueChange={setReserveQty}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  color="warning"
                  isLoading={reserveMutation.isPending}
                  onClick={() => {
                    if (!selectedListing) return;
                    reserveMutation.mutate({
                      id: selectedListing._id,
                      data: { quantityRequested: Number(reserveQty) },
                    });
                  }}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={manageOpen}
        onOpenChange={setManageOpen}
        size="3xl"
        isDismissable={false}
        isKeyboardDismissDisabled
        shouldCloseOnInteractOutside={() => false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Manage Reservations</ModalHeader>
              <ModalBody className="gap-4">
                {reservations.length === 0 && (
                  <div className="text-default-500 text-sm">No reservations yet.</div>
                )}
                {reservations.map((reservation: any) => (
                  <Card key={reservation._id} className="border border-default-200">
                    <CardBody className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{reservation.buyerCompanyId?.name || "Buyer"}</div>
                        <Chip size="sm" color="warning" variant="flat">
                          {reservation.status}
                        </Chip>
                      </div>
                      <div className="text-sm">
                        Quantity: <span className="font-semibold">{reservation.quantityRequested}</span>
                      </div>
                      {reservation.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button size="sm" color="warning" onClick={() => acceptMutation.mutate(reservation._id)}>
                            Accept
                          </Button>
                          <Button size="sm" variant="flat" onClick={() => rejectMutation.mutate(reservation._id)}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled
        shouldCloseOnInteractOutside={() => false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Import Listing</ModalHeader>
              <ModalBody className="gap-4">
                <Select
                  label="Product"
                  isDisabled
                  selectedKeys={editForm.productId ? [editForm.productId] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string | undefined;
                    setEditForm((prev) => ({ ...prev, productId: key || "", productVariant: "" }));
                  }}
                  popoverProps={{ shouldCloseOnBlur: false }}
                >
                  {products.map((product: any) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Product Variant"
                  isDisabled
                  selectedKeys={editForm.productVariant ? [editForm.productVariant] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string | undefined;
                    setEditForm((prev) => ({ ...prev, productVariant: key || "" }));
                  }}
                  popoverProps={{ shouldCloseOnBlur: false }}
                >
                  {variants.map((variant: any) => (
                    <SelectItem key={variant._id} value={variant._id}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </Select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Total Quantity"
                    type="number"
                    value={editForm.totalQuantity}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, totalQuantity: value }))}
                  />
                  <Select
                    label="Quantity Unit"
                    selectedKeys={[editForm.quantityUnit]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setEditForm((prev) => ({ ...prev, quantityUnit: key || "MT" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    <SelectItem key="MT" value="MT">
                      MT
                    </SelectItem>
                    <SelectItem key="KG" value="KG">
                      KG
                    </SelectItem>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    value={editForm.price}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, price: value }))}
                  />
                  <Select
                    label="Price Unit"
                    selectedKeys={[editForm.priceUnit]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setEditForm((prev) => ({ ...prev, priceUnit: key || "KG" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    <SelectItem key="KG" value="KG">
                      Per KG
                    </SelectItem>
                    <SelectItem key="MT" value="MT">
                      Per MT
                    </SelectItem>
                  </Select>
                </div>
                {canSetCommission && (
                  <Input
                    label="OBAOL Commission"
                    type="number"
                    value={editForm.adminCommission}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, adminCommission: value }))}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Expected Arrival Date"
                    type="date"
                    value={editForm.expectedArrivalDate}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, expectedArrivalDate: value }))}
                  />
                  <Input
                    label="Arrival Window (days)"
                    type="number"
                    value={editForm.arrivalWindowDays}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, arrivalWindowDays: value }))}
                  />
                </div>
                {ports.length > 0 ? (
                  <Select
                    label="Arrival Port"
                    selectedKeys={editForm.portId ? [editForm.portId] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setEditForm((prev) => ({ ...prev, portId: key || "", portName: "" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    {ports.map((port: any) => (
                      <SelectItem key={port._id} value={port._id}>
                        {port.name} ({port.loCode})
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <Input
                    label="Arrival Port (manual)"
                    value={editForm.portName}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, portName: value }))}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  color="warning"
                  isLoading={editMutation.isPending}
                  onClick={() => {
                    if (!selectedListing?._id) return;
                    editMutation.mutate({
                      id: selectedListing._id,
                      data: {
                        totalQuantity: Number(editForm.totalQuantity),
                        quantityUnit: editForm.quantityUnit,
                        price: Number(editForm.price),
                        priceUnit: editForm.priceUnit,
                        adminCommission: canSetCommission ? Number(editForm.adminCommission || 0) : undefined,
                        expectedArrivalDate: editForm.expectedArrivalDate || undefined,
                        arrivalWindowDays: editForm.arrivalWindowDays || undefined,
                        portId: editForm.portId || undefined,
                        portName: editForm.portName || undefined,
                      },
                    });
                  }}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
