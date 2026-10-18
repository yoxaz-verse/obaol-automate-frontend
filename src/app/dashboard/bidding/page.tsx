"use client";

import { useContext, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Tab,
  Tabs,
  Textarea,
} from "@nextui-org/react";
import {
  FiCalendar,
  FiClock,
  FiHash,
  FiLayers,
  FiLock,
  FiMapPin,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTag,
  FiX,
} from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { deleteData, getData, postData, putData } from "@/core/api/apiHandler";
import { productBiddingRoutes, productRoutes, variantRateRoutes } from "@/core/api/apiRoutes";

type Mode = "buyer" | "seller";
type EventRow = {
  _id: string;
  title: string;
  product?: any;
  productVariant?: any;
  quantity: number;
  unit: string;
  specifications?: string;
  deliveryLocation?: string;
  deliveryDate?: string;
  opensAt?: string;
  closesAt?: string;
  status: string;
  offerCount: number;
  ownOffer?: any;
  offers?: any[];
  draftEnquiry?: string | null;
};

const statuses = ["DRAFT", "SCHEDULED", "OPEN", "CLOSED", "AWARDED", "CANCELLED"];
const message = (error: any) => error?.response?.data?.message || "The request could not be completed.";
const dateText = (value?: string) =>
  value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not scheduled";

export default function BiddingPage() {
  const { user } = useContext(AuthContext);
  const client = useQueryClient();
  const role = String(user?.role || "").toLowerCase();
  const provided = user?.providedCapabilities || [];
  const sought = user?.soughtCapabilities || [];
  const canBuy = role !== "associate" || sought.includes("buyer") || provided.includes("buyer");
  const canSell = role !== "associate" || provided.includes("seller");
  const [mode, setMode] = useState<Mode>(canBuy ? "buyer" : "seller");
  const [status, setStatus] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [activeOffer, setActiveOffer] = useState<EventRow | null>(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<any>({
    title: "",
    product: "",
    quantity: "",
    unit: "MT",
    specifications: "",
    deliveryLocation: "",
    deliveryDate: "",
    opensAt: "",
    closesAt: "",
  });
  const [offer, setOffer] = useState<any>({
    listing: "",
    unitPrice: "",
    offeredQuantity: "",
    unit: "MT",
    validUntil: "",
    note: "",
  });

  const eventsQuery = useQuery({
    queryKey: ["product-bidding", mode, status],
    queryFn: async () =>
      (await getData(productBiddingRoutes.list, { mode, ...(status !== "ALL" ? { status } : {}) }, { cacheMode: "bypass" }))
        .data.data as EventRow[],
  });

  const productsQuery = useQuery({
    queryKey: ["bidding-products"],
    queryFn: async () => (await getData(productRoutes.getAll, { limit: 200 })).data?.data?.data || [],
  });

  const listingsQuery = useQuery({
    queryKey: ["bidding-own-listings", user?.id],
    queryFn: async () =>
      (await getData(variantRateRoutes.getAll, { associate: user?.id, view: "product-table", limit: 200 })).data?.data?.data || [],
    enabled: mode === "seller",
  });

  const matchingListings = useMemo(
    () =>
      (listingsQuery.data || []).filter((row: any) => {
        const productId = row?.productVariant?.product?._id || row?.productVariant?.product;
        return !activeOffer || String(productId || "") === String(activeOffer.product?._id || activeOffer.product || "");
      }),
    [listingsQuery.data, activeOffer]
  );

  const productOptions = useMemo(() => {
    return (productsQuery.data || []).map((p: any) => ({
      id: String(p._id),
      name: String(p.name || "Product"),
      category: p.category?.name || p.subCategory?.name || "",
    }));
  }, [productsQuery.data]);

  const listingOptions = useMemo(() => {
    return matchingListings.map((row: any) => ({
      id: String(row._id),
      name: `${row.productVariant?.product?.name || "Product"} — ${row.productVariant?.name || "Variant"}`,
      status: row.isLive ? "Live" : "Offline",
    }));
  }, [matchingListings]);

  const refresh = () => client.invalidateQueries({ queryKey: ["product-bidding"] });

  const action = useMutation({
    mutationFn: async ({ url, body = {}, method = "post" }: any) => (method === "delete" ? deleteData(url) : postData(url, body)),
    onSuccess: () => {
      setError("");
      setActiveOffer(null);
      refresh();
    },
    onError: (e) => setError(message(e)),
  });

  const create = useMutation({
    mutationFn: async () => {
      const created = await postData(productBiddingRoutes.create, {
        ...draft,
        quantity: Number(draft.quantity),
        deliveryDate: draft.deliveryDate || null,
      });
      await postData(productBiddingRoutes.publish(created.data.data._id), {
        opensAt: new Date(draft.opensAt).toISOString(),
        closesAt: new Date(draft.closesAt).toISOString(),
      });
    },
    onSuccess: () => {
      setShowCreate(false);
      setError("");
      setDraft({
        title: "",
        product: "",
        quantity: "",
        unit: "MT",
        specifications: "",
        deliveryLocation: "",
        deliveryDate: "",
        opensAt: "",
        closesAt: "",
      });
      refresh();
    },
    onError: (e) => setError(message(e)),
  });

  const submitOffer = useMutation({
    mutationFn: () =>
      putData(productBiddingRoutes.offer(activeOffer!._id), {
        ...offer,
        unitPrice: Number(offer.unitPrice),
        offeredQuantity: Number(offer.offeredQuantity),
        validUntil: offer.validUntil || null,
      }),
    onSuccess: () => {
      setActiveOffer(null);
      setError("");
      refresh();
    },
    onError: (e) => setError(message(e)),
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      setError("Please enter a title for the bidding event.");
      return;
    }
    if (!draft.product) {
      setError("Please search and select a product.");
      return;
    }
    if (!draft.quantity || Number(draft.quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    if (!draft.opensAt || !draft.closesAt) {
      setError("Please specify both opening and closing dates and times.");
      return;
    }
    if (new Date(draft.closesAt) <= new Date(draft.opensAt)) {
      setError("Closes at must be scheduled after Opens at.");
      return;
    }
    setError("");
    create.mutate();
  };

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer.listing) {
      setError("Please select a matching trade listing.");
      return;
    }
    if (!offer.unitPrice || Number(offer.unitPrice) <= 0) {
      setError("Please enter a valid unit price.");
      return;
    }
    if (!offer.offeredQuantity || Number(offer.offeredQuantity) <= 0) {
      setError("Please enter a valid offered quantity.");
      return;
    }
    setError("");
    submitOffer.mutate();
  };

  const themeField = {
    label: "font-bold text-[10px] sm:text-[11px] uppercase tracking-wider text-default-500 mb-1",
    inputWrapper:
      "h-12 rounded-xl sm:rounded-2xl border-default-200 bg-content2 hover:bg-content3 data-[focus=true]:border-warning-500 data-[focus=true]:ring-2 data-[focus=true]:ring-warning-500/20 transition-all border shadow-inner",
    trigger:
      "h-12 rounded-xl sm:rounded-2xl border-default-200 bg-content2 hover:bg-content3 data-[open=true]:border-warning-500 data-[open=true]:ring-2 data-[open=true]:ring-warning-500/20 transition-all border shadow-inner",
  };

  const textareaThemeField = {
    label: "font-bold text-[10px] sm:text-[11px] uppercase tracking-wider text-default-500 mb-1",
    inputWrapper:
      "py-3 rounded-xl sm:rounded-2xl border-default-200 bg-content2 hover:bg-content3 data-[focus=true]:border-warning-500 data-[focus=true]:ring-2 data-[focus=true]:ring-warning-500/20 transition-all border shadow-inner",
  };

  const rows = eventsQuery.data || [];

  return (
    <main className="mx-auto w-full max-w-[1400px] p-4 md:p-8">
      <header className="mb-6 rounded-3xl border border-warning-300/30 bg-gradient-to-br from-warning-50 to-background p-5 dark:from-warning-900/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-warning-600">
              <FiLock />
              <span className="text-xs font-black uppercase tracking-[.2em]">Sealed product offers</span>
            </div>
            <h1 className="text-3xl font-black">Bidding</h1>
            <p className="mt-1 max-w-2xl text-sm text-default-500">
              Create scheduled buying requirements or participate with a confidential offer linked to your company’s trade listing.
            </p>
          </div>
          {mode === "buyer" && canBuy && (
            <Button
              color="warning"
              startContent={<FiPlus />}
              className="font-bold shadow-lg shadow-warning-500/20"
              onPress={() => {
                setError("");
                setShowCreate(true);
              }}
            >
              Create bidding event
            </Button>
          )}
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-danger-500/30 bg-danger-500/10 p-4 text-sm font-semibold text-danger-500"
        >
          <span>{error}</span>
          <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => setError("")} aria-label="Dismiss error">
            <FiX size={16} />
          </Button>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          selectedKey={mode}
          onSelectionChange={(key) => {
            setMode(String(key) as Mode);
            setStatus("ALL");
          }}
          color="warning"
          variant="underlined"
        >
          {canBuy && <Tab key="buyer" title="Buying events" />}
          {canSell && <Tab key="seller" title="Seller opportunities" />}
        </Tabs>
        <Button isIconOnly variant="light" aria-label="Refresh" onPress={() => refresh()}>
          <FiRefreshCw />
        </Button>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {["ALL", ...statuses].map((item) => (
          <Button
            key={item}
            size="sm"
            color={status === item ? "warning" : "default"}
            variant={status === item ? "solid" : "flat"}
            className="font-semibold"
            onPress={() => setStatus(item)}
          >
            {item.replaceAll("_", " ")}
          </Button>
        ))}
      </div>

      {eventsQuery.isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner color="warning" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-divider py-20 text-center">
          <FiLock className="mx-auto mb-3 text-3xl text-default-300" />
          <h2 className="font-bold">No bidding events here</h2>
          <p className="text-sm text-default-500">Events matching this view will appear here.</p>
        </div>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {rows.map((item) => (
            <article key={item._id} className="rounded-3xl border border-divider bg-content1 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-warning-600">
                    {item.product?.name || "Product requirement"}
                  </p>
                  <h2 className="mt-1 text-xl font-black">{item.title}</h2>
                </div>
                <Chip
                  size="sm"
                  color={
                    item.status === "OPEN"
                      ? "success"
                      : item.status === "CANCELLED"
                        ? "danger"
                        : item.status === "AWARDED"
                          ? "warning"
                          : "default"
                  }
                  variant="flat"
                >
                  {item.status}
                </Chip>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-default-50 p-4 text-sm dark:bg-content2">
                <div>
                  <span className="text-default-400">Quantity</span>
                  <p className="font-bold">
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <div>
                  <span className="text-default-400">Offers</span>
                  <p className="font-bold">{item.offerCount}</p>
                </div>
                <div>
                  <span className="text-default-400">Opens</span>
                  <p className="font-medium">{dateText(item.opensAt)}</p>
                </div>
                <div>
                  <span className="text-default-400">Closes</span>
                  <p className="font-medium">{dateText(item.closesAt)}</p>
                </div>
              </div>

              {item.specifications && <p className="mt-3 text-sm text-default-600">{item.specifications}</p>}

              {mode === "seller" && item.ownOffer && (
                <div className="mt-3 rounded-2xl border border-success-300/40 bg-success-500/10 p-3.5 text-sm">
                  <strong className="text-success-500">Your sealed offer:</strong> {item.ownOffer.unitPrice} / {item.ownOffer.unit} ·{" "}
                  {item.ownOffer.status}
                </div>
              )}

              {mode === "buyer" && item.status === "OPEN" && (
                <p className="mt-3 flex items-center gap-2 text-xs text-default-500">
                  <FiLock />
                  Offer identities and prices unlock only after closing.
                </p>
              )}

              {mode === "buyer" && item.offers?.length ? (
                <div className="mt-4 space-y-2">
                  {item.offers
                    .filter((o) => o.status === "SUBMITTED" || o.status === "AWARDED")
                    .map((o) => (
                      <div key={o._id} className="flex items-center justify-between gap-3 rounded-2xl border border-divider p-3.5">
                        <div>
                          <p className="font-bold">{o.sellerCompany?.name || "Seller"}</p>
                          <p className="text-xs text-default-500">
                            {o.offeredQuantity} {o.unit} · {o.unitPrice} per {o.unit}
                          </p>
                        </div>
                        {item.status === "CLOSED" && (
                          <Button
                            size="sm"
                            color="warning"
                            className="font-bold"
                            onPress={() => action.mutate({ url: productBiddingRoutes.award(item._id), body: { offerId: o._id } })}
                          >
                            Select winner
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {mode === "seller" && item.status === "OPEN" && (
                  <Button
                    color="warning"
                    variant="flat"
                    className="font-bold"
                    onPress={() => {
                      setError("");
                      setActiveOffer(item);
                      setOffer(
                        item.ownOffer
                          ? {
                              listing: item.ownOffer.listing?._id || item.ownOffer.listing,
                              unitPrice: item.ownOffer.unitPrice,
                              offeredQuantity: item.ownOffer.offeredQuantity,
                              unit: item.ownOffer.unit,
                              validUntil: item.ownOffer.validUntil?.slice(0, 10) || "",
                              note: item.ownOffer.note || "",
                            }
                          : {
                              listing: "",
                              unitPrice: "",
                              offeredQuantity: item.quantity,
                              unit: item.unit,
                              validUntil: "",
                              note: "",
                            }
                      );
                    }}
                  >
                    {item.ownOffer ? "Revise offer" : "Submit offer"}
                  </Button>
                )}
                {mode === "seller" && item.status === "OPEN" && item.ownOffer?.status === "SUBMITTED" && (
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => action.mutate({ url: productBiddingRoutes.offer(item._id), method: "delete" })}
                  >
                    Withdraw
                  </Button>
                )}
                {mode === "buyer" && item.status === "OPEN" && (
                  <Button variant="flat" onPress={() => action.mutate({ url: productBiddingRoutes.close(item._id) })}>
                    Close now
                  </Button>
                )}
                {mode === "buyer" && !["AWARDED", "CANCELLED"].includes(item.status) && (
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => action.mutate({ url: productBiddingRoutes.cancel(item._id), body: {} })}
                  >
                    Cancel
                  </Button>
                )}
                {item.draftEnquiry && (
                  <>
                    <Button as="a" href={`/dashboard/enquiries/${item.draftEnquiry}`} variant="flat">
                      Review draft
                    </Button>
                    <Button color="success" onPress={() => action.mutate({ url: productBiddingRoutes.confirmEnquiry(item._id) })}>
                      Confirm enquiry
                    </Button>
                  </>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Create Sealed Bidding Event Modal */}
      <Modal
        isOpen={showCreate}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowCreate(false);
            setError("");
          }
        }}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          base: "border border-default-200 bg-background/95 dark:bg-[#0E0D0A]/95 backdrop-blur-2xl shadow-2xl rounded-3xl",
          header: "border-b border-default-100 px-6 py-5",
          body: "px-6 py-5",
          footer: "border-t border-default-100 px-6 py-4",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleCreateSubmit} className="contents">
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-warning-500">
                  <FiLock size={13} />
                  <span>Sealed Procurement</span>
                </div>
                <h2 className="text-xl font-black text-foreground sm:text-2xl">Create sealed bidding event</h2>
                <p className="text-xs font-normal text-default-500 sm:text-sm">
                  Prices remain strictly confidential and sealed until the scheduled event close.
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Title"
                    placeholder="e.g. Bulk Wheat Procurement Q4"
                    variant="bordered"
                    isRequired
                    value={draft.title}
                    onValueChange={(val) => setDraft((prev: any) => ({ ...prev, title: val }))}
                    className="md:col-span-2"
                    classNames={themeField}
                    startContent={<FiTag className="shrink-0 text-default-400 text-sm" />}
                  />
                  <Autocomplete
                    label="Product"
                    placeholder="Search and select product"
                    variant="bordered"
                    isRequired
                    className="md:col-span-2"
                    items={productOptions}
                    selectedKey={draft.product || null}
                    onSelectionChange={(key) => setDraft((prev: any) => ({ ...prev, product: key ? String(key) : "" }))}
                    startContent={<FiSearch className="shrink-0 text-default-400 text-sm" />}
                    inputProps={{
                      classNames: {
                        label: themeField.label,
                        inputWrapper: themeField.inputWrapper,
                      },
                    }}
                    listboxProps={{
                      emptyContent: productsQuery.isLoading ? "Loading products..." : "No products found",
                    }}
                    popoverProps={{
                      classNames: {
                        content: "border border-default-200 bg-content1 shadow-2xl z-[120]",
                      },
                    }}
                  >
                    {(p: any) => (
                      <AutocompleteItem key={p.id} textValue={p.name}>
                        <div className="flex items-center justify-between py-0.5">
                          <span className="text-sm font-semibold text-foreground">{p.name}</span>
                          {p.category && <span className="text-[11px] uppercase tracking-wider text-default-400">{p.category}</span>}
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                  <Input
                    label="Quantity"
                    placeholder="0.00"
                    type="number"
                    min="0.000001"
                    step="any"
                    variant="bordered"
                    isRequired
                    value={draft.quantity}
                    onValueChange={(val) => setDraft((prev: any) => ({ ...prev, quantity: val }))}
                    classNames={themeField}
                    startContent={<FiHash className="shrink-0 text-default-400 text-sm" />}
                  />
                  <Select
                    label="Unit"
                    variant="bordered"
                    isRequired
                    selectedKeys={draft.unit ? [draft.unit] : ["MT"]}
                    onSelectionChange={(keys) => setDraft((prev: any) => ({ ...prev, unit: Array.from(keys)[0] || "MT" }))}
                    classNames={themeField}
                    startContent={<FiLayers className="shrink-0 text-default-400 text-sm" />}
                  >
                    <SelectItem key="KG" textValue="KG">
                      KG
                    </SelectItem>
                    <SelectItem key="MT" textValue="MT (Metric Ton)">
                      MT (Metric Ton)
                    </SelectItem>
                    <SelectItem key="Quintal" textValue="Quintal">
                      Quintal
                    </SelectItem>
                  </Select>
                  <Input
                    type="datetime-local"
                    label="Opens at"
                    variant="bordered"
                    isRequired
                    value={draft.opensAt}
                    onValueChange={(val) => setDraft((prev: any) => ({ ...prev, opensAt: val }))}
                    classNames={themeField}
                    startContent={<FiClock className="shrink-0 text-default-400 text-sm" />}
                  />
                  <Input
                    type="datetime-local"
                    label="Closes at"
                    variant="bordered"
                    isRequired
                    value={draft.closesAt}
                    onValueChange={(val) => setDraft((prev: any) => ({ ...prev, closesAt: val }))}
                    classNames={themeField}
                    startContent={<FiClock className="shrink-0 text-default-400 text-sm" />}
                  />
                  <Input
                    type="date"
                    label="Delivery date"
                    variant="bordered"
                    value={draft.deliveryDate}
                    onValueChange={(val) => setDraft((prev: any) => ({ ...prev, deliveryDate: val }))}
                    classNames={themeField}
                    startContent={<FiCalendar className="shrink-0 text-default-400 text-sm" />}
                  />
                  <Input
                    label="Delivery location"
                    placeholder="City, State or Warehouse"
                    variant="bordered"
                    value={draft.deliveryLocation}
                    onValueChange={(val) => setDraft((prev: any) => ({ ...prev, deliveryLocation: val }))}
                    classNames={themeField}
                    startContent={<FiMapPin className="shrink-0 text-default-400 text-sm" />}
                  />
                  <Textarea
                    label="Specifications & Terms"
                    placeholder="Specify grading standards, moisture limits, packaging, or special inspection terms..."
                    variant="bordered"
                    minRows={3}
                    maxRows={5}
                    value={draft.specifications}
                    onValueChange={(val) => setDraft((prev: any) => ({ ...prev, specifications: val }))}
                    className="md:col-span-2"
                    classNames={textareaThemeField}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="warning"
                  isLoading={create.isPending}
                  className="font-bold shadow-lg shadow-warning-500/20"
                  startContent={!create.isPending && <FiPlus />}
                >
                  Schedule bidding
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* Confidential Seller Offer Modal */}
      <Modal
        isOpen={Boolean(activeOffer)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setActiveOffer(null);
            setError("");
          }
        }}
        size="xl"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          base: "border border-default-200 bg-background/95 dark:bg-[#0E0D0A]/95 backdrop-blur-2xl shadow-2xl rounded-3xl",
          header: "border-b border-default-100 px-6 py-5",
          body: "px-6 py-5",
          footer: "border-t border-default-100 px-6 py-4",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmitOffer} className="contents">
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-warning-500">
                  <FiLock size={13} />
                  <span>Confidential Offer</span>
                </div>
                <h2 className="text-xl font-black text-foreground sm:text-2xl">Submit confidential offer</h2>
                <p className="text-xs font-normal text-default-500 sm:text-sm">
                  Only your company can see this price until the event closes.
                </p>
              </ModalHeader>
              <ModalBody className="space-y-4">
                {activeOffer && (
                  <div className="flex items-center justify-between rounded-2xl border border-warning-500/30 bg-warning-500/10 p-3.5 text-xs text-foreground">
                    <div>
                      <p className="text-sm font-bold text-warning-500">{activeOffer.title}</p>
                      <p className="mt-0.5 text-default-400">
                        {activeOffer.product?.name || "Product requirement"} · Requirement: {activeOffer.quantity} {activeOffer.unit}
                      </p>
                    </div>
                    <Chip size="sm" variant="flat" color="warning">
                      Target: {activeOffer.quantity} {activeOffer.unit}
                    </Chip>
                  </div>
                )}
                <Autocomplete
                  label="Matching trade listing"
                  placeholder="Select or search your listing"
                  variant="bordered"
                  isRequired
                  items={listingOptions}
                  selectedKey={offer.listing || null}
                  onSelectionChange={(key) => setOffer((prev: any) => ({ ...prev, listing: key ? String(key) : "" }))}
                  startContent={<FiPackage className="shrink-0 text-default-400 text-sm" />}
                  inputProps={{
                    classNames: {
                      label: themeField.label,
                      inputWrapper: themeField.inputWrapper,
                    },
                  }}
                  listboxProps={{
                    emptyContent: "No matching listings found for this product",
                  }}
                  popoverProps={{
                    classNames: {
                      content: "border border-default-200 bg-content1 shadow-2xl z-[120]",
                    },
                  }}
                >
                  {(row: any) => (
                    <AutocompleteItem key={row.id} textValue={row.name}>
                      <div className="flex items-center justify-between gap-2 py-0.5">
                        <span className="text-sm font-semibold text-foreground">{row.name}</span>
                        <Chip size="sm" variant="flat" color={row.status === "Live" ? "success" : "default"}>
                          {row.status}
                        </Chip>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Unit price"
                    placeholder="0.00"
                    type="number"
                    min="0.000001"
                    step="any"
                    variant="bordered"
                    isRequired
                    value={offer.unitPrice}
                    onValueChange={(val) => setOffer((prev: any) => ({ ...prev, unitPrice: val }))}
                    classNames={themeField}
                    startContent={<span className="text-xs font-bold text-default-400">₹</span>}
                  />
                  <Input
                    label="Offered quantity"
                    placeholder="0.00"
                    type="number"
                    min="0.000001"
                    step="any"
                    variant="bordered"
                    isRequired
                    value={offer.offeredQuantity}
                    onValueChange={(val) => setOffer((prev: any) => ({ ...prev, offeredQuantity: val }))}
                    classNames={themeField}
                    startContent={<FiHash className="shrink-0 text-default-400 text-sm" />}
                  />
                  <Select
                    label="Unit"
                    variant="bordered"
                    selectedKeys={offer.unit ? [offer.unit] : ["MT"]}
                    onSelectionChange={(keys) => setOffer((prev: any) => ({ ...prev, unit: Array.from(keys)[0] || "MT" }))}
                    classNames={themeField}
                    startContent={<FiLayers className="shrink-0 text-default-400 text-sm" />}
                  >
                    <SelectItem key="KG" textValue="KG">
                      KG
                    </SelectItem>
                    <SelectItem key="MT" textValue="MT">
                      MT
                    </SelectItem>
                    <SelectItem key="Quintal" textValue="Quintal">
                      Quintal
                    </SelectItem>
                  </Select>
                  <Input
                    type="date"
                    label="Valid until"
                    variant="bordered"
                    value={offer.validUntil}
                    onValueChange={(val) => setOffer((prev: any) => ({ ...prev, validUntil: val }))}
                    classNames={themeField}
                    startContent={<FiCalendar className="shrink-0 text-default-400 text-sm" />}
                  />
                </div>
                <Textarea
                  label="Offer Note"
                  placeholder="Lead time, quality assurances, payment terms..."
                  variant="bordered"
                  minRows={2}
                  maxRows={4}
                  value={offer.note}
                  onValueChange={(val) => setOffer((prev: any) => ({ ...prev, note: val }))}
                  classNames={textareaThemeField}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="warning"
                  isLoading={submitOffer.isPending}
                  className="font-bold shadow-lg shadow-warning-500/20"
                >
                  Seal and submit
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
