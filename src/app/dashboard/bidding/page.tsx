"use client";

import { useContext, useMemo, useRef, useState } from "react";
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
import { productBiddingRoutes, productRoutes, productVariantRoutes, variantRateRoutes } from "@/core/api/apiRoutes";
import { detectOffPlatformDisclosure } from "@/utils/offPlatformDisclosure";

type Mode = "buyer" | "seller";
type SellerView = "available" | "participating" | "history";
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
type CreateField = "title" | "product" | "productVariant" | "quantity" | "opensAt" | "closesAt" | "deliveryDate" | "specifications";
type CreateErrors = Partial<Record<CreateField, string>>;
type OpenMode = "now" | "scheduled";
const localDateTimeValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};
const nextLocalDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + 1);
  return localDateTimeValue(date).slice(0, 10);
};

export default function BiddingPage({ fixedMode = "seller" }: { fixedMode?: Mode }) {
  const { user } = useContext(AuthContext);
  const client = useQueryClient();
  const role = String(user?.role || "").toLowerCase();
  const provided = user?.providedCapabilities || [];
  const sought = user?.soughtCapabilities || [];
  const canBuy = role !== "associate" || sought.includes("buyer") || provided.includes("buyer");
  const mode = fixedMode;
  const [status, setStatus] = useState("ALL");
  const [sellerView, setSellerView] = useState<SellerView>("available");
  const [showCreate, setShowCreate] = useState(false);
  const [activeOffer, setActiveOffer] = useState<EventRow | null>(null);
  const [pageError, setPageError] = useState("");
  const [createError, setCreateError] = useState("");
  const [createErrors, setCreateErrors] = useState<CreateErrors>({});
  const [offerError, setOfferError] = useState("");
  const [openMode, setOpenMode] = useState<OpenMode>("now");
  const createErrorRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<any>({
    title: "",
    product: "",
    productVariant: "",
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
    queryKey: ["product-bidding", mode, status, sellerView],
    queryFn: async () =>
      (await getData(productBiddingRoutes.list, { mode, ...(mode === "buyer" && status !== "ALL" ? { status } : {}), ...(mode === "seller" ? { view: sellerView } : {}) }, { cacheMode: "bypass" }))
        .data.data as EventRow[],
  });

  const productsQuery = useQuery({
    queryKey: ["bidding-products"],
    queryFn: async () => (await getData(productRoutes.getAll, { limit: 200 })).data?.data?.data || [],
  });

  const productVariantsQuery = useQuery({
    queryKey: ["bidding-product-variants", draft.product],
    queryFn: async () => (await getData(productVariantRoutes.getAll, { product: draft.product, limit: 200 })).data?.data?.data || [],
    enabled: mode === "buyer" && Boolean(draft.product),
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

  const clearCreateFieldError = (field: CreateField) => {
    if (!createErrors[field]) return;
    const next = { ...createErrors };
    delete next[field];
    setCreateErrors(next);
    if (!Object.keys(next).length) setCreateError("");
  };

  const updateDisclosureField = (field: "title" | "specifications", value: string) => {
    const violation = detectOffPlatformDisclosure(value);
    setDraft((current: any) => ({ ...current, [field]: value }));
    const next = { ...createErrors };
    if (violation) next[field] = violation.message;
    else delete next[field];
    setCreateErrors(next);
    if (!Object.keys(next).length) setCreateError("");
  };

  const resetCreateForm = () => {
    setOpenMode("now");
    setCreateError("");
    setCreateErrors({});
    setDraft({
      title: "", product: "", productVariant: "", quantity: "", unit: "MT",
      specifications: "", deliveryLocation: "", deliveryDate: "", opensAt: "", closesAt: "",
    });
  };

  const focusCreateError = (errors: CreateErrors) => {
    const firstField = Object.keys(errors)[0];
    window.setTimeout(() => {
      const field = firstField ? document.getElementById(`buying-request-${firstField}`) : null;
      if (field instanceof HTMLElement) {
        field.scrollIntoView({ behavior: "smooth", block: "center" });
        field.focus();
      } else {
        createErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        createErrorRef.current?.focus();
      }
    }, 0);
  };

  const action = useMutation({
    mutationFn: async ({ url, body = {}, method = "post" }: any) => (method === "delete" ? deleteData(url) : postData(url, body)),
    onSuccess: () => {
      setPageError("");
      setActiveOffer(null);
      refresh();
    },
    onError: (e) => setPageError(message(e)),
  });

  const create = useMutation({
    mutationFn: async ({ effectiveOpensAt }: { effectiveOpensAt: Date }) => {
      const created = await postData(productBiddingRoutes.create, {
        ...draft,
        quantity: Number(draft.quantity),
        deliveryDate: draft.deliveryDate ? new Date(`${draft.deliveryDate}T00:00:00`).toISOString() : null,
      });
      await postData(productBiddingRoutes.publish(created.data.data._id), {
        opensAt: effectiveOpensAt.toISOString(),
        closesAt: new Date(draft.closesAt).toISOString(),
      });
    },
    onSuccess: () => {
      setShowCreate(false);
      resetCreateForm();
      refresh();
    },
    onError: (e) => {
      setCreateError(message(e));
      focusCreateError({});
    },
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
      setOfferError("");
      refresh();
    },
    onError: (e) => setOfferError(message(e)),
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: CreateErrors = {};
    const now = new Date();
    const effectiveOpensAt = openMode === "now" ? now : new Date(draft.opensAt);
    const closesAt = new Date(draft.closesAt);
    const titleViolation = detectOffPlatformDisclosure(draft.title);
    const specificationsViolation = detectOffPlatformDisclosure(draft.specifications);
    if (!draft.title.trim()) errors.title = "Enter a title for the buying request.";
    else if (titleViolation) errors.title = titleViolation.message;
    if (!draft.product) errors.product = "Search for and select a product.";
    if (!draft.productVariant) errors.productVariant = "Select the required variant or grade.";
    if (!draft.quantity || Number(draft.quantity) <= 0) errors.quantity = "Enter a quantity greater than zero.";
    if (openMode === "scheduled" && (!draft.opensAt || Number.isNaN(effectiveOpensAt.getTime()) || effectiveOpensAt <= now)) {
      errors.opensAt = "Choose an opening time in the future.";
    }
    if (!draft.closesAt || Number.isNaN(closesAt.getTime())) errors.closesAt = "Choose a closing date and time.";
    else if (closesAt <= effectiveOpensAt) errors.closesAt = "Closing must be later than opening.";
    if (!draft.deliveryDate) errors.deliveryDate = "Choose a delivery date.";
    else if (draft.deliveryDate < nextLocalDate(draft.closesAt)) errors.deliveryDate = "Delivery must be on a later day than closing.";
    if (specificationsViolation) errors.specifications = specificationsViolation.message;
    if (Object.keys(errors).length) {
      setCreateErrors(errors);
      setCreateError("Review the highlighted fields before scheduling this request.");
      focusCreateError(errors);
      return;
    }
    setCreateErrors({});
    setCreateError("");
    create.mutate({ effectiveOpensAt });
  };

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer.listing) {
      setOfferError("Please select a matching trade listing.");
      return;
    }
    if (!offer.unitPrice || Number(offer.unitPrice) <= 0) {
      setOfferError("Please enter a valid unit price.");
      return;
    }
    if (!offer.offeredQuantity || Number(offer.offeredQuantity) <= 0) {
      setOfferError("Please enter a valid offered quantity.");
      return;
    }
    setOfferError("");
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
            <h1 className="text-3xl font-black">{mode === "buyer" ? "My Buying Requests" : "Bidding"}</h1>
            <p className="mt-1 max-w-2xl text-sm text-default-500">
              {mode === "buyer"
                ? "Create and manage sealed buying requests, compare offers after closing, and select a winning seller."
                : "Discover product opportunities and participate with a confidential offer linked to your company’s trade listing."}
            </p>
          </div>
          {mode === "buyer" && canBuy && (
            <Button
              color="warning"
              startContent={<FiPlus />}
              className="font-bold shadow-lg shadow-warning-500/20"
              onPress={() => {
                resetCreateForm();
                setShowCreate(true);
              }}
            >
              Create buying request
            </Button>
          )}
        </div>
      </header>

      {pageError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-danger-500/30 bg-danger-500/10 p-4 text-sm font-semibold text-danger-500"
        >
          <span>{pageError}</span>
          <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => setPageError("")} aria-label="Dismiss error">
            <FiX size={16} />
          </Button>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {mode === "seller" ? <Tabs selectedKey={sellerView} onSelectionChange={(key) => setSellerView(String(key) as SellerView)} color="warning" variant="underlined" aria-label="Seller bidding views">
          <Tab key="available" title="Available" />
          <Tab key="participating" title="Participating" />
          <Tab key="history" title="History" />
        </Tabs> : <div className="text-sm font-semibold text-default-500">Buyer workspace</div>}
        <Button isIconOnly variant="light" aria-label="Refresh" onPress={() => refresh()}>
          <FiRefreshCw />
        </Button>
      </div>

      {mode === "buyer" && <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
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
      </div>}

      {eventsQuery.isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner color="warning" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-divider py-20 text-center">
          <FiLock className="mx-auto mb-3 text-3xl text-default-300" />
          <h2 className="font-bold">{mode === "buyer" ? "No buying requests here" : sellerView === "available" ? "No available bidding opportunities" : sellerView === "participating" ? "You are not participating in any bidding events" : "No bidding history yet"}</h2>
          <p className="text-sm text-default-500">{mode === "buyer" ? "Buying requests matching this status will appear here." : "Matching seller opportunities will appear here."}</p>
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
                      setOfferError("");
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
        isDismissable={false}
        isKeyboardDismissDisabled
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowCreate(false);
            setCreateError("");
            setCreateErrors({});
          }
        }}
        size="3xl"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          base: "border border-default-200 bg-content1/95 backdrop-blur-2xl shadow-2xl rounded-2xl sm:rounded-3xl",
          header: "border-b border-default-100 px-5 py-4 sm:px-7 sm:py-5",
          body: "px-5 py-5 sm:px-7",
          footer: "border-t border-default-100 px-5 py-4 sm:px-7",
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
                <h2 className="text-xl font-black text-foreground sm:text-2xl">Create sealed buying request</h2>
                <p className="text-xs font-normal text-default-500 sm:text-sm">
                  Prices remain strictly confidential and sealed until the scheduled event close.
                </p>
              </ModalHeader>
              <ModalBody className="gap-5">
                {createError && (
                  <div ref={createErrorRef} tabIndex={-1} role="alert" className="rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 outline-none dark:bg-danger-500/10 dark:text-danger-400">
                    {createError}
                  </div>
                )}

                <section aria-labelledby="requirement-heading" className="space-y-4 rounded-2xl border border-default-200 bg-default-50/60 p-4 sm:p-5 dark:bg-content2/40">
                  <div>
                    <h3 id="requirement-heading" className="font-bold text-foreground">Requirement</h3>
                    <p className="text-xs text-default-500">Describe what you need without sharing direct contact details.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    id="buying-request-title"
                    label="Title"
                    placeholder="e.g. Bulk Wheat Procurement Q4"
                    variant="bordered"
                    isRequired
                    value={draft.title}
                    onValueChange={(val) => updateDisclosureField("title", val)}
                    className="md:col-span-2"
                    classNames={themeField}
                    isInvalid={Boolean(createErrors.title)}
                    errorMessage={createErrors.title}
                    startContent={<FiTag className="shrink-0 text-default-400 text-sm" />}
                  />
                  <Autocomplete
                    id="buying-request-product"
                    label="Product"
                    placeholder="Search and select product"
                    variant="bordered"
                    isRequired
                    className="md:col-span-2"
                    items={productOptions}
                    selectedKey={draft.product || null}
                    onSelectionChange={(key) => { setDraft((prev: any) => ({ ...prev, product: key ? String(key) : "", productVariant: "" })); clearCreateFieldError("product"); }}
                    isInvalid={Boolean(createErrors.product)}
                    errorMessage={createErrors.product}
                    maxListboxHeight={224}
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
                      placement: "bottom-start",
                      shouldFlip: true,
                      classNames: {
                        content: "border border-default-200 bg-content1 shadow-xl z-[120] max-h-60",
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
                  <Autocomplete
                    id="buying-request-productVariant"
                    label="Variant / Grade"
                    placeholder={draft.product ? "Search and select variant" : "Select a product first"}
                    variant="bordered"
                    isRequired
                    isDisabled={!draft.product}
                    className="md:col-span-2"
                    items={(productVariantsQuery.data || []).map((variant: any) => ({ id: String(variant._id), name: String(variant.name || "Variant") }))}
                    selectedKey={draft.productVariant || null}
                    onSelectionChange={(key) => { setDraft((prev: any) => ({ ...prev, productVariant: key ? String(key) : "" })); clearCreateFieldError("productVariant"); }}
                    isInvalid={Boolean(createErrors.productVariant)}
                    errorMessage={createErrors.productVariant}
                    maxListboxHeight={224}
                    startContent={<FiLayers className="shrink-0 text-default-400 text-sm" />}
                    inputProps={{ classNames: { label: themeField.label, inputWrapper: themeField.inputWrapper } }}
                    listboxProps={{ emptyContent: productVariantsQuery.isLoading ? "Loading variants..." : "No variants found for this product" }}
                    popoverProps={{ placement: "bottom-start", shouldFlip: true, classNames: { content: "border border-default-200 bg-content1 shadow-xl z-[120] max-h-60" } }}
                  >
                    {(variant: any) => <AutocompleteItem key={variant.id} textValue={variant.name}><span className="text-sm font-semibold text-foreground">{variant.name}</span></AutocompleteItem>}
                  </Autocomplete>
                  <Input
                    id="buying-request-quantity"
                    label="Quantity"
                    placeholder="0.00"
                    type="number"
                    min="0.000001"
                    step="any"
                    variant="bordered"
                    isRequired
                    value={draft.quantity}
                    onValueChange={(val) => { setDraft((prev: any) => ({ ...prev, quantity: val })); clearCreateFieldError("quantity"); }}
                    classNames={themeField}
                    isInvalid={Boolean(createErrors.quantity)}
                    errorMessage={createErrors.quantity}
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
                  </div>
                </section>

                <section aria-labelledby="schedule-heading" className="space-y-4 rounded-2xl border border-default-200 p-4 sm:p-5">
                  <div>
                    <h3 id="schedule-heading" className="font-bold text-foreground">Bidding schedule</h3>
                    <p className="text-xs text-default-500">Choose when sellers can begin and when sealed offers close.</p>
                  </div>
                  <div role="group" aria-label="Opening time" className="grid grid-cols-2 gap-2 rounded-xl bg-default-100 p-1">
                    <Button type="button" size="sm" variant={openMode === "now" ? "solid" : "light"} color={openMode === "now" ? "warning" : "default"} className="font-semibold" onPress={() => { setOpenMode("now"); setDraft((current: any) => ({ ...current, opensAt: "", closesAt: "", deliveryDate: "" })); clearCreateFieldError("opensAt"); clearCreateFieldError("closesAt"); clearCreateFieldError("deliveryDate"); }}>Open now</Button>
                    <Button type="button" size="sm" variant={openMode === "scheduled" ? "solid" : "light"} color={openMode === "scheduled" ? "warning" : "default"} className="font-semibold" onPress={() => { setOpenMode("scheduled"); setDraft((current: any) => ({ ...current, opensAt: "", closesAt: "", deliveryDate: "" })); }}>Schedule for later</Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {openMode === "scheduled" ? <Input
                    id="buying-request-opensAt"
                    type="datetime-local"
                    label="Opening time"
                    variant="bordered"
                    isRequired
                    min={localDateTimeValue(new Date())}
                    value={draft.opensAt}
                    onValueChange={(val) => { setDraft((prev: any) => ({ ...prev, opensAt: val, closesAt: "", deliveryDate: "" })); clearCreateFieldError("opensAt"); clearCreateFieldError("closesAt"); clearCreateFieldError("deliveryDate"); }}
                    classNames={themeField}
                    isInvalid={Boolean(createErrors.opensAt)}
                    errorMessage={createErrors.opensAt}
                    startContent={<FiClock className="shrink-0 text-default-400 text-sm" />}
                  /> : <div className="flex min-h-12 items-center gap-3 rounded-xl border border-success-300/50 bg-success-50 px-4 text-sm dark:bg-success-500/10">
                    <span className="grid size-8 place-items-center rounded-full bg-success-100 text-success-600 dark:bg-success-500/20"><FiClock /></span>
                    <div><p className="font-semibold text-success-700 dark:text-success-400">Starts immediately</p><p className="text-xs text-default-500">Opening time is set when you submit.</p></div>
                  </div>}
                  <Input
                    id="buying-request-closesAt"
                    type="datetime-local"
                    label="Closing time"
                    variant="bordered"
                    isRequired
                    min={openMode === "scheduled" && draft.opensAt ? draft.opensAt : localDateTimeValue(new Date())}
                    value={draft.closesAt}
                    onValueChange={(val) => { setDraft((prev: any) => ({ ...prev, closesAt: val, deliveryDate: "" })); clearCreateFieldError("closesAt"); clearCreateFieldError("deliveryDate"); }}
                    classNames={themeField}
                    isInvalid={Boolean(createErrors.closesAt)}
                    errorMessage={createErrors.closesAt}
                    startContent={<FiClock className="shrink-0 text-default-400 text-sm" />}
                  />
                  </div>
                </section>

                <section aria-labelledby="delivery-heading" className="space-y-4 rounded-2xl border border-default-200 p-4 sm:p-5">
                  <div>
                    <h3 id="delivery-heading" className="font-bold text-foreground">Delivery &amp; terms</h3>
                    <p className="text-xs text-default-500">Delivery must be scheduled after bidding has closed.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    id="buying-request-deliveryDate"
                    type="date"
                    label="Delivery date"
                    variant="bordered"
                    isRequired
                    min={nextLocalDate(draft.closesAt)}
                    value={draft.deliveryDate}
                    onValueChange={(val) => { setDraft((prev: any) => ({ ...prev, deliveryDate: val })); clearCreateFieldError("deliveryDate"); }}
                    classNames={themeField}
                    isInvalid={Boolean(createErrors.deliveryDate)}
                    errorMessage={createErrors.deliveryDate}
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
                    id="buying-request-specifications"
                    label="Specifications & Terms"
                    placeholder="Specify grading standards, moisture limits, packaging, or special inspection terms..."
                    variant="bordered"
                    minRows={3}
                    maxRows={5}
                    value={draft.specifications}
                    onValueChange={(val) => updateDisclosureField("specifications", val)}
                    className="md:col-span-2"
                    classNames={textareaThemeField}
                    isInvalid={Boolean(createErrors.specifications)}
                    errorMessage={createErrors.specifications}
                  />
                  </div>
                </section>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" isDisabled={create.isPending} onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="warning"
                  isLoading={create.isPending}
                  isDisabled={create.isPending}
                  className="font-bold shadow-lg shadow-warning-500/20"
                  startContent={!create.isPending && <FiPlus />}
                >
                  Schedule buying request
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
            setOfferError("");
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
                {offerError && <div role="alert" className="rounded-xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 dark:bg-danger-500/10 dark:text-danger-400">{offerError}</div>}
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
