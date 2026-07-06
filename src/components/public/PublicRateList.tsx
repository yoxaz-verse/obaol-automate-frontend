"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getData } from "@/core/api/apiHandler";

type PublicRateKind = "variantRate" | "displayedRate" | "catalogItem";

type PublicRateListProps = {
  rate: PublicRateKind;
  additionalParams?: Record<string, unknown>;
  variantRateMixed?: boolean;
  displayOnly?: true;
  initialSearch?: string;
  limit?: number;
};

type Meta = {
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
};

type NormalizedRate = {
  id: string;
  product: string;
  variant: string;
  company: string;
  location: string;
  quantity: string;
  price: number | null;
  currency: string;
  classifications: string[];
  isLive: boolean;
  updatedAt: string;
};

const API_BY_RATE: Record<PublicRateKind, string> = {
  variantRate: "/variant-rates",
  displayedRate: "/displayed-rates",
  catalogItem: "/catalog-items",
};

const toText = (value: any, fallback = "N/A"): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const text = String(value).trim();
    return text || fallback;
  }
  if (Array.isArray(value)) {
    const text = value.map((entry) => toText(entry, "")).filter(Boolean).join(", ");
    return text || fallback;
  }
  if (typeof value === "object") {
    return (
      toText(value.name, "") ||
      toText(value.label, "") ||
      toText(value.title, "") ||
      toText(value.slug, "") ||
      fallback
    );
  }
  return fallback;
};

const extractRowsAndMeta = (payload: any): { rows: any[]; meta: Meta } => {
  const raw = payload?.data?.data ?? payload?.data ?? payload;
  if (Array.isArray(raw)) return { rows: raw, meta: {} };
  if (Array.isArray(raw?.data)) {
    return {
      rows: raw.data,
      meta: {
        totalCount: raw.totalCount,
        currentPage: raw.currentPage,
        totalPages: raw.totalPages,
      },
    };
  }
  return { rows: [], meta: {} };
};

const getClassifications = (product: any): string[] => {
  if (!product) return ["Conventional"];
  const labels: string[] = [];
  const hasPrimary = Boolean(product.isNatural || product.isOrganic || product.isIpmQuality);
  if (!hasPrimary) labels.push("Conventional");
  if (product.isNatural) labels.push("Natural");
  if (product.isOrganic) labels.push("Organic");
  if (product.isIpmQuality) labels.push("IPM");
  if (product.isGiTagged) labels.push("GI Tag");
  return labels;
};

const normalizeRate = (row: any, rate: PublicRateKind): NormalizedRate => {
  const baseRate = rate === "catalogItem" ? row?.baseRateId : rate === "displayedRate" ? row?.variantRate : row;
  const variant = baseRate?.productVariant || row?.productVariantId || row?.productVariant || {};
  const product = variant?.product || baseRate?.product || row?.product || {};
  const company =
    row?.associateCompany ||
    row?.associateCompanyId ||
    baseRate?.associateCompany ||
    baseRate?.associate ||
    row?.associate ||
    {};
  const commission = Number(row?.commission || 0);
  const basePrice = Number(baseRate?.rate || row?.rate || 0);
  const adminCommission = Number(baseRate?.commission || row?.adminCommission || 0);
  const price = Number.isFinite(basePrice) && basePrice > 0 ? basePrice + adminCommission + commission : null;
  const quantity = baseRate?.quantity ?? row?.quantity;
  const unit = baseRate?.quantityUnit || row?.quantityUnit || "MT";
  const productName = toText(product?.name || row?.productName || product);
  let variantName = toText(variant?.name || row?.productVariantName || variant, "Base");
  if (variantName.toLowerCase().startsWith(productName.toLowerCase())) {
    variantName = variantName.slice(productName.length).trim() || "Base";
  }

  return {
    id: String(row?._id || baseRate?._id || row?.id || `${productName}-${variantName}`),
    product: productName,
    variant: variantName,
    company: toText(company?.name || company, "Verified supplier"),
    location: toText(
      row?.locationDisplay ||
        baseRate?.locationDisplay ||
        baseRate?.warehouseId?.address ||
        baseRate?.officeAddress ||
        company?.address,
      "Location on request",
    ),
    quantity: quantity !== undefined && quantity !== null && quantity !== "" ? `${quantity} ${unit}` : "On request",
    price,
    currency: row?.currency || baseRate?.currency || "USD",
    classifications: getClassifications(product),
    isLive: Boolean(row?.isLive ?? baseRate?.isLive),
    updatedAt: row?.lastLiveDate || row?.updatedAt || baseRate?.updatedAt || row?.createdAt || "",
  };
};

const formatPrice = (price: number | null, currency: string) => {
  if (price === null) return "Price on request";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString("en-IN")}`;
  }
};

export default function PublicRateList({
  rate,
  additionalParams,
  displayOnly = true,
  initialSearch = "",
  limit = 24,
}: PublicRateListProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [rows, setRows] = useState<NormalizedRate[]>([]);
  const [meta, setMeta] = useState<Meta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const stableParams = useMemo(() => JSON.stringify(additionalParams || {}), [additionalParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, stableParams]);

  useEffect(() => {
    let cancelled = false;
    const fetchRates = async () => {
      setLoading(true);
      setError(false);
      try {
        const params = {
          page,
          limit,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(additionalParams || {}),
          ...(displayOnly && { selected: "true" }),
        };
        const response = await getData(API_BY_RATE[rate], params);
        if (cancelled) return;
        const { rows: rawRows, meta: responseMeta } = extractRowsAndMeta(response);
        setRows(rawRows.map((row) => normalizeRate(row, rate)));
        setMeta(responseMeta);
      } catch {
        if (!cancelled) {
          setRows([]);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchRates();
    return () => {
      cancelled = true;
    };
  }, [additionalParams, debouncedSearch, displayOnly, limit, page, rate]);

  const totalPages = Math.max(1, Number(meta.totalPages || 1));

  return (
    <section className="w-full min-w-0">
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-default-200/70 bg-content1/60 p-3 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products, variants, suppliers..."
          className="min-h-11 flex-1 rounded-xl border border-default-200 bg-background px-4 text-sm font-medium text-foreground outline-none transition focus:border-obaol-500"
        />
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-default-500">
          {loading ? "Syncing" : `${meta.totalCount ?? rows.length} Items`}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-danger-300/50 bg-danger-500/10 px-5 py-4 text-sm font-semibold text-danger-600 dark:text-danger-300">
          Unable to load rates right now.
        </div>
      )}

      {!error && loading && rows.length === 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-2xl border border-default-200/70 bg-content1/50" />
          ))}
        </div>
      )}

      {!error && !loading && rows.length === 0 && (
        <div className="rounded-3xl border border-default-200/70 bg-content1/50 px-6 py-14 text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-default-500">No live products found</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-default-500">
            Try a different search term or check back as verified rates go live.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-70" : "opacity-100"} transition-opacity`}>
          {rows.map((item) => (
            <article
              key={item.id}
              className="group flex min-h-56 flex-col rounded-2xl border border-default-200/70 bg-content1/70 p-5 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:border-obaol-500/40 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-obaol-600">
                    {item.isLive ? "Live rate" : "Verified rate"}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-xl font-black tracking-tight text-foreground">
                    {item.product}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-default-500">{item.variant}</p>
                </div>
                <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.isLive ? "bg-success-500" : "bg-default-300"}`} />
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.classifications.map((label) => (
                  <span
                    key={`${item.id}-${label}`}
                    className="rounded-full border border-default-200 bg-background/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-default-500"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid gap-3 text-sm">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-default-400">Supplier</p>
                  <p className="mt-1 truncate font-semibold text-foreground">{item.company}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-default-400">Location</p>
                  <p className="mt-1 line-clamp-1 font-medium text-default-500">{item.location}</p>
                </div>
              </div>

              <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-default-400">Quantity</p>
                  <p className="mt-1 text-sm font-bold text-foreground">{item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-default-400">Ex factory</p>
                  <p className="mt-1 text-base font-black text-obaol-600">{formatPrice(item.price, item.currency)}</p>
                </div>
              </div>

              <Link
                href="/auth"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-obaol-500 px-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-obaol-400"
              >
                Start enquiry
              </Link>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="h-10 rounded-xl border border-default-200 px-4 text-xs font-black uppercase tracking-widest text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-default-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="h-10 rounded-xl border border-default-200 px-4 text-xs font-black uppercase tracking-widest text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
