"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiCheck, FiCheckCircle, FiChevronDown, FiGlobe, FiMapPin, FiPackage, FiRefreshCw, FiSearch, FiTruck, FiX, FiZap } from "react-icons/fi";
import { getData, postData } from "@/core/api/apiHandler";
import { useMutation } from "@tanstack/react-query";
import { fetchDependentOptions } from "@/utils/fetchDependentOptions";
import { fetchCatalogHierarchyOptions, normalizeCatalogSearch, type CatalogHierarchyOption } from "@/utils/catalogHierarchy";
import { showToastMessage } from "@/utils/utils";
import { associateCompanyRoutes, associateRoutes, catalogModerationRoutes, productVariantRoutes, warehouseRoutes } from "@/core/api/apiRoutes";
import { useCalculationConfig, DEFAULT_CALCULATION_CONFIG } from "@/hooks/useCalculationConfig";
import {
  applyProductionMethod,
  type ProductionMethod,
} from "@/utils/productClassification";

type WizardProps = {
  isOpen: boolean;
  onClose: () => void;
  apiEndpoint: string;
  additionalVariable?: Record<string, any>;
  onSuccess?: (data: any) => void;
  productVariantValue?: any | null;
  user?: any;
};

type CommodityField = "category" | "subCategory" | "product" | "productVariant";
type CommodityRetries = Record<CommodityField, number>;
type CommodityLoadState = {
  status: "idle" | "loading" | "success" | "empty" | "error";
  message?: string;
};
type CommodityLoadStates = Record<CommodityField, CommodityLoadState>;

const INITIAL_COMMODITY_LOAD_STATES: CommodityLoadStates = {
  category: { status: "idle" },
  subCategory: { status: "idle" },
  product: { status: "idle" },
  productVariant: { status: "idle" },
};

type CommodityPickerProps = {
  field: CommodityField;
  label: string;
  placeholder: string;
  options: CatalogHierarchyOption[];
  selectedKey: string;
  disabled?: boolean;
  loading?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  emptyContent: React.ReactNode;
  onSelect: (key: string) => void;
};

const CommodityPicker = ({
  field,
  label,
  placeholder,
  options,
  selectedKey,
  disabled,
  loading,
  invalid,
  errorMessage,
  emptyContent,
  onSelect,
}: CommodityPickerProps) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuWidth, setMenuWidth] = useState<number>();
  const selected = options.find((option) => option.id === selectedKey);
  const filtered = options.filter((option) => normalizeCatalogSearch(option.name).includes(normalizeCatalogSearch(query)));
  const levelLabel: Record<CatalogHierarchyOption["level"], string> = {
    category: "Category",
    subCategory: "Subcategory",
    product: "Product",
    productVariant: "Variant",
  };

  const updateMenuWidth = useCallback(() => {
    const trigger = fieldRef.current?.querySelector<HTMLButtonElement>("[data-commodity-trigger]");
    const width = trigger?.getBoundingClientRect().width || fieldRef.current?.getBoundingClientRect().width;
    if (width && width > 0) {
      setMenuWidth(Math.round(width));
    }
  }, []);

  useEffect(() => {
    const trigger = fieldRef.current?.querySelector<HTMLButtonElement>("[data-commodity-trigger]");
    updateMenuWidth();
    if (!trigger || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateMenuWidth);
    observer.observe(trigger);
    if (fieldRef.current) {
      observer.observe(fieldRef.current);
    }
    window.addEventListener("resize", updateMenuWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMenuWidth);
    };
  }, [updateMenuWidth]);

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  return (
    <div ref={fieldRef} data-commodity-field={field} className="relative w-full">
      <Popover
        isOpen={isOpen}
        onOpenChange={(nextOpen) => {
          if (nextOpen) updateMenuWidth();
          setIsOpen(nextOpen);
        }}
        placement="bottom-start"
        offset={6}
        shouldFlip
        style={menuWidth ? { width: `${menuWidth}px`, maxWidth: "calc(100vw - 2rem)" } : undefined}
        classNames={{
          base: "!w-full max-w-[calc(100vw-2rem)]",
          content: "!w-full",
        }}
        motionProps={{ className: "w-full" }}
      >
        <PopoverTrigger>
          <Button
            data-commodity-trigger={field}
            variant="bordered"
            isDisabled={disabled}
            onMouseDown={() => updateMenuWidth()}
            onFocus={() => updateMenuWidth()}
            aria-label={`${label}: ${selected?.name || placeholder}`}
            className={`h-14 w-full justify-between rounded-xl border bg-content1 px-4 text-left shadow-sm aria-expanded:!scale-100 transition-all ${
              invalid
                ? "border-danger"
                : isOpen
                  ? "border-obaol-500/80 ring-2 ring-obaol-500/20"
                  : "border-default-200 hover:border-default-300 dark:hover:border-default-600"
            }`}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-default-400 dark:text-default-500">
                {label}
              </span>
              <span className={`block truncate text-sm ${selected ? "font-semibold text-foreground" : "font-normal text-default-400"}`}>
                {selected?.name || placeholder}
              </span>
            </span>
            <FiChevronDown
              className={`shrink-0 text-default-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-obaol-500" : ""}`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          data-commodity-menu={field}
          className="z-[120] w-full overflow-hidden rounded-xl border border-default-200 bg-background p-0 shadow-2xl"
        >
          <div
            data-picker-options={field}
            style={menuWidth ? { width: `${menuWidth}px`, minWidth: `${menuWidth}px` } : undefined}
            className="w-full min-w-[280px] overflow-hidden"
          >
            <div className="sticky top-0 z-10 border-b border-default-100 bg-background/95 p-2 backdrop-blur-md">
              <Input
                autoFocus
                aria-label={`Search ${label.toLowerCase()}`}
                placeholder={`Search ${label.toLowerCase()}`}
                value={query}
                onValueChange={setQuery}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setIsOpen(false);
                  if (event.key === "Enter" && filtered[0]) {
                    event.preventDefault();
                    onSelect(filtered[0].id);
                    setIsOpen(false);
                  }
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    const firstVisibleOption = Array.from(
                      document.querySelectorAll<HTMLElement>(`[data-picker-options="${field}"] [role="option"]`),
                    ).find((option) => option.getClientRects().length > 0);
                    firstVisibleOption?.focus();
                  }
                }}
                startContent={<FiSearch className="text-default-400" />}
                size="sm"
                variant="bordered"
                classNames={{
                  inputWrapper: "bg-content1 border-default-200 focus-within:!border-obaol-500 focus-within:!ring-1 focus-within:!ring-obaol-500/30",
                  input: "text-xs",
                }}
              />
            </div>
            <div className="max-h-[min(16rem,40vh)] overflow-y-auto overscroll-contain p-1.5">
              {loading ? (
                <div className="flex min-h-24 items-center justify-center text-sm text-default-500" role="status" aria-live="polite">
                  Loading {label.toLowerCase()}…
                </div>
              ) : filtered.length ? (
                <Listbox
                  aria-label={`${label} options`}
                  selectionMode="single"
                  selectionBehavior="replace"
                  disallowEmptySelection
                  selectedKeys={selectedKey ? new Set([selectedKey]) : new Set()}
                  onSelectionChange={(keys) => {
                    if (keys === "all") return;
                    const nextKey = String(Array.from(keys)[0] || "");
                    if (!nextKey || nextKey === selectedKey) return;
                    onSelect(nextKey);
                    setIsOpen(false);
                  }}
                  itemClasses={{
                    base: "min-h-11 w-full rounded-lg border border-transparent px-3 py-2 text-sm outline-none transition-colors data-[focus-visible=true]:border-primary data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-primary/30 data-[hover=true]:border-default-200 data-[hover=true]:bg-default-100 data-[selected=true]:border-primary/30 data-[selected=true]:bg-primary/10",
                  }}
                >
                  {filtered.map((option) => (
                    <ListboxItem key={option.id} textValue={option.name}>
                      <span className="flex items-center justify-between w-full min-w-0 gap-2">
                        <span className="block min-w-0 flex-1">
                          <span className={`block truncate ${option.id === selectedKey ? "font-semibold text-obaol-600 dark:text-obaol-400" : "font-medium text-foreground"}`}>
                            {option.name}
                          </span>
                          <span className="block truncate text-[11px] text-default-400">
                            {levelLabel[option.level]}{option.parentName ? ` under ${option.parentName}` : ""}
                            {option.approvalStatus && option.approvalStatus !== "APPROVED" ? ` · ${option.approvalStatus.replaceAll("_", " ")}` : ""}
                          </span>
                        </span>
                        {option.id === selectedKey && (
                          <FiCheck className="shrink-0 text-obaol-500" size={16} />
                        )}
                      </span>
                    </ListboxItem>
                  ))}
                </Listbox>
              ) : emptyContent}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {selectedKey && !disabled && (
        <button
          type="button"
          aria-label={`Clear ${label.toLowerCase()}`}
          className="absolute right-9 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 text-default-400 hover:bg-default-100 hover:text-foreground transition-colors"
          onClick={(event) => {
            event.stopPropagation();
            onSelect("");
          }}
        >
          <FiX size={14} />
        </button>
      )}
      {errorMessage && <p className="mt-1 px-1 text-xs text-danger">{errorMessage}</p>}
    </div>
  );
};

const stepMeta = [
  { key: 1, title: "Product & Grade", subtitle: "Define the cargo you’re listing", icon: FiPackage },
  { key: 2, title: "Pricing", subtitle: "Set the trade rate", icon: FiZap },
  { key: 3, title: "Supply Location", subtitle: "Choose warehouse or office address", icon: FiMapPin },
  { key: 4, title: "Publish", subtitle: "Review and launch your listing", icon: FiTruck },
];

const motionVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const ORGANIC_CERT_BODIES = [
  { key: "APEDA_NPOP", value: "APEDA NPOP Accredited Body" },
  { key: "PGS_INDIA", value: "PGS-India Local Group" },
  { key: "JAIVIK_BHARAT", value: "Jaivik Bharat / FSSAI Organic" },
  { key: "NOP", value: "USDA NOP" },
  { key: "EU_ORGANIC", value: "EU Organic" },
  { key: "OTHER", value: "Other" },
];

const ORGANIC_SCOPES = [
  { key: "NPOP", value: "NPOP (India)" },
  { key: "PGS-India", value: "PGS-India" },
  { key: "NOP", value: "USDA NOP" },
  { key: "EU", value: "EU Organic" },
  { key: "Other", value: "Other" },
];

const PRODUCTION_METHODS: Array<{ key: ProductionMethod; label: string }> = [
  { key: "conventional", label: "Conventional" },
  { key: "natural", label: "Natural" },
  { key: "organic", label: "Organic" },
  { key: "ipm", label: "IPM" },
];

const VariantRateWizardModal: React.FC<WizardProps> = ({
  isOpen,
  onClose,
  apiEndpoint,
  additionalVariable,
  onSuccess,
  productVariantValue,
  user,
}) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLive, setIsLive] = useState(true);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "launching-rate">("idle");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<any>(null);
  const [showCatalogRequest, setShowCatalogRequest] = useState(false);
  const [catalogRequestName, setCatalogRequestName] = useState("");
  const [catalogRequestDescription, setCatalogRequestDescription] = useState("");

  const roleLower = String(user?.role || "").toLowerCase();
  const requestEntityType: CommodityField = !formData.category ? "category" : !formData.subCategory ? "subCategory" : !formData.product ? "product" : "productVariant";
  const catalogRequestMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { name: catalogRequestName.trim(), description: catalogRequestDescription.trim() };
      if (requestEntityType === "subCategory") payload.category = formData.category;
      if (requestEntityType === "product") payload.subCategory = formData.subCategory;
      if (requestEntityType === "productVariant") payload.product = formData.product;
      const created = await postData(catalogModerationRoutes.create(requestEntityType), payload, {});
      const row = created?.data?.data;
      if (!row?._id) throw new Error("Catalog proposal was created without an id.");
      await postData(catalogModerationRoutes.submit(requestEntityType, row._id), {}, {});
      return row;
    },
    onSuccess: (row: any) => {
      const option: CatalogHierarchyOption = { id: String(row._id), name: String(row.name), level: requestEntityType, parentId: requestEntityType === "category" ? null : String(row.category || row.subCategory || row.product || ""), parentName: null, approvalStatus: "PENDING_REVIEW", reviewNotes: "" };
      if (requestEntityType === "category") setCategories((prev) => [...prev, option]);
      if (requestEntityType === "subCategory") setSubCategories((prev) => [...prev, option]);
      if (requestEntityType === "product") setProducts((prev) => [...prev, option]);
      if (requestEntityType === "productVariant") setVariants((prev) => [...prev, option]);
      setValue(requestEntityType, row._id);
      setCatalogRequestName(""); setCatalogRequestDescription(""); setShowCatalogRequest(false);
      showToastMessage({ type: "success", message: `${option.name} submitted for admin approval.` });
    },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || error?.message || "Could not submit catalog request." }),
  });
  const { data: calculationConfig } = useCalculationConfig(roleLower === "admin");
  const commissionPercent =
    calculationConfig?.variantRateCommissionPercent ??
    DEFAULT_CALCULATION_CONFIG.variantRateCommissionPercent;

  const isAssociateUser = roleLower === "associate";
  const isOperatorUser = roleLower === "operator" || roleLower === "team";
  const fixedVariantId = productVariantValue?._id || productVariantValue;

  const [categories, setCategories] = useState<CatalogHierarchyOption[]>([]);
  const [subCategories, setSubCategories] = useState<CatalogHierarchyOption[]>([]);
  const [products, setProducts] = useState<CatalogHierarchyOption[]>([]);
  const [variants, setVariants] = useState<CatalogHierarchyOption[]>([]);
  const [commodityLoadStates, setCommodityLoadStates] = useState<CommodityLoadStates>(INITIAL_COMMODITY_LOAD_STATES);
  const [commodityRetries, setCommodityRetries] = useState<CommodityRetries>({
    category: 0,
    subCategory: 0,
    product: 0,
    productVariant: 0,
  });
  const requestVersions = useRef<CommodityRetries>({
    category: 0,
    subCategory: 0,
    product: 0,
    productVariant: 0,
  });
  const [associates, setAssociates] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | null>(null);
  const [resolvedProductId, setResolvedProductId] = useState<string | null>(null);
  const [resolvedVariant, setResolvedVariant] = useState<any>(null);
  const [companyAddress, setCompanyAddress] = useState<string>("");

  const rateValue = Number(formData.rate || 0);
  const computedCommission = Number.isFinite(rateValue) ? rateValue * (commissionPercent / 100) : 0;
  const goToGlobalCatalog = () => {
    onClose();
    router.push("/dashboard/catalog");
  };

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setSuccessData(null);
    setStep(1);
    setFormData({ locationSource: "WAREHOUSE", unit: "KG" });
    setCategories([]);
    setSubCategories([]);
    setProducts([]);
    setVariants([]);
    setCommodityLoadStates(INITIAL_COMMODITY_LOAD_STATES);
    setResolvedProductId(null);
    setResolvedVariant(null);
    setIsLive(true);
    setSubmitPhase("idle");
  }, [isOpen]);

  useEffect(() => {
    const requestVersion = ++requestVersions.current.category;
    if (!isOpen) return;
    const controller = new AbortController();
    setCommodityLoadStates((prev) => ({ ...prev, category: { status: "loading" } }));
    fetchCatalogHierarchyOptions(undefined, controller.signal)
      .then((data) => {
        if (requestVersions.current.category === requestVersion) {
          setCategories(data);
          setCommodityLoadStates((prev) => ({ ...prev, category: { status: data.length ? "success" : "empty" } }));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted && requestVersions.current.category === requestVersion) {
          setCategories([]);
          setCommodityLoadStates((prev) => ({ ...prev, category: { status: "error", message: "Could not load categories." } }));
        }
      });
    if (!isAssociateUser) {
      fetchDependentOptions("associate").then(setAssociates);
    }
    if (fixedVariantId) {
      setFormData((prev) => ({ ...prev, productVariant: fixedVariantId }));
    }
    return () => controller.abort();
  }, [isOpen, fixedVariantId, isAssociateUser, commodityRetries.category]);

  useEffect(() => {
    if (!isOpen) return;
    if (!fixedVariantId) return;
    const resolveFromVariant = async () => {
      try {
        const res = await getData(`${productVariantRoutes.getAll}/${fixedVariantId}`);
        const row = res?.data?.data || null;
        const productId = String(row?.product?._id || row?.product || "").trim();
        setResolvedProductId(productId || null);
        setResolvedVariant(row);
      } catch {
        setResolvedProductId(null);
        setResolvedVariant(null);
      }
    };
    resolveFromVariant();
  }, [isOpen, fixedVariantId]);

  useEffect(() => {
    const requestVersion = ++requestVersions.current.subCategory;
    if (!formData.category) {
      setSubCategories([]);
      setCommodityLoadStates((prev) => ({ ...prev, subCategory: { status: "idle" } }));
      return;
    }
    const controller = new AbortController();
    setSubCategories([]);
    setCommodityLoadStates((prev) => ({ ...prev, subCategory: { status: "loading" } }));
    fetchCatalogHierarchyOptions({ key: "category", id: String(formData.category) }, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted && requestVersions.current.subCategory === requestVersion) {
          setSubCategories(data);
          setCommodityLoadStates((prev) => ({ ...prev, subCategory: { status: data.length ? "success" : "empty" } }));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted && requestVersions.current.subCategory === requestVersion) {
          setSubCategories([]);
          setCommodityLoadStates((prev) => ({ ...prev, subCategory: { status: "error", message: "Could not load subcategories." } }));
        }
      });
    return () => controller.abort();
  }, [formData.category, commodityRetries.subCategory]);

  useEffect(() => {
    const requestVersion = ++requestVersions.current.product;
    if (!formData.subCategory) {
      setProducts([]);
      setCommodityLoadStates((prev) => ({ ...prev, product: { status: "idle" } }));
      return;
    }
    const controller = new AbortController();
    setProducts([]);
    setCommodityLoadStates((prev) => ({ ...prev, product: { status: "loading" } }));
    fetchCatalogHierarchyOptions({ key: "subCategory", id: String(formData.subCategory) }, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted && requestVersions.current.product === requestVersion) {
          setProducts(data);
          setCommodityLoadStates((prev) => ({ ...prev, product: { status: data.length ? "success" : "empty" } }));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted && requestVersions.current.product === requestVersion) {
          setProducts([]);
          setCommodityLoadStates((prev) => ({ ...prev, product: { status: "error", message: "Could not load products." } }));
        }
      });
    return () => controller.abort();
  }, [formData.subCategory, commodityRetries.product]);

  useEffect(() => {
    const requestVersion = ++requestVersions.current.productVariant;
    if (!formData.product) {
      setVariants([]);
      setCommodityLoadStates((prev) => ({ ...prev, productVariant: { status: "idle" } }));
      return;
    }

    const controller = new AbortController();
    setVariants([]);
    setCommodityLoadStates((prev) => ({ ...prev, productVariant: { status: "loading" } }));

    fetchCatalogHierarchyOptions({ key: "product", id: String(formData.product) }, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted && requestVersions.current.productVariant === requestVersion) {
          setVariants(data);
          setCommodityLoadStates((prev) => ({ ...prev, productVariant: { status: data.length ? "success" : "empty" } }));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted && requestVersions.current.productVariant === requestVersion) {
          setVariants([]);
          setCommodityLoadStates((prev) => ({ ...prev, productVariant: { status: "error", message: "Could not load product variants." } }));
        }
      });
    return () => controller.abort();
  }, [formData.product, commodityRetries.productVariant]);

  useEffect(() => {
    if (!isOpen) return;
    if (fixedVariantId) return;
    const nextProduct = String(formData.product || "").trim();
    setResolvedProductId(nextProduct || null);
  }, [isOpen, fixedVariantId, formData.product]);

  useEffect(() => {
    if (!isOpen) return;
    const resolveCompany = async () => {
      if (isAssociateUser) {
        const companyId = String(user?.associateCompanyId || user?.associateCompany?._id || user?.associateCompany || "").trim();
        setResolvedCompanyId(companyId || null);
        return;
      }
      const associateId = String(formData.associate || "").trim();
      if (!associateId) {
        setResolvedCompanyId(null);
        return;
      }
      try {
        const res = await getData(associateRoutes.getAll, { _id: associateId, limit: 1 });
        const row = Array.isArray(res?.data?.data?.data)
          ? res.data.data.data[0]
          : Array.isArray(res?.data?.data)
            ? res.data.data[0]
            : null;
        const companyId = String(row?.associateCompany?._id || row?.associateCompany || "").trim();
        setResolvedCompanyId(companyId || null);
      } catch {
        setResolvedCompanyId(null);
      }
    };
    resolveCompany();
  }, [isOpen, isAssociateUser, formData.associate, user?.associateCompanyId, user?.associateCompany]);

  useEffect(() => {
    if (!resolvedCompanyId) {
      setCompanyAddress("");
      return;
    }
    const fetchCompany = async () => {
      try {
        const res = await getData(associateCompanyRoutes.getAll, { _id: resolvedCompanyId, limit: 1 });
        const row = Array.isArray(res?.data?.data?.data)
          ? res.data.data.data[0]
          : Array.isArray(res?.data?.data)
            ? res.data.data[0]
            : null;
        setCompanyAddress(String(row?.address || "").trim());
      } catch {
        setCompanyAddress("");
      }
    };
    fetchCompany();
  }, [resolvedCompanyId]);

  useEffect(() => {
    if (!isOpen) return;
    if (companyAddress && !formData.officeAddress) {
      setFormData((prev) => ({ ...prev, officeAddress: companyAddress }));
    }
  }, [companyAddress, isOpen, formData.officeAddress]);

  useEffect(() => {
    if (!isOpen) return;
    if (formData.locationSource !== "WAREHOUSE") return;
    const fetchWarehouses = async () => {
      try {
        const params: Record<string, any> = { scope: "my" };
        if (!isAssociateUser && resolvedCompanyId) {
          params.ownerCompanyId = resolvedCompanyId;
        }
        if (!isAssociateUser && !resolvedCompanyId) {
          setWarehouses([]);
          return;
        }
        const res = await getData(warehouseRoutes.getAll, params);
        const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
        setWarehouses(rows);
      } catch {
        setWarehouses([]);
      }
    };
    fetchWarehouses();
  }, [isOpen, formData.locationSource, resolvedCompanyId, isAssociateUser]);

  useEffect(() => {
    if (!isOpen) return;
    if (formData.locationSource === "WAREHOUSE" && warehouses.length === 0) {
      setFormData((prev) => ({ ...prev, locationSource: "OFFICE_ADDRESS", warehouseId: "" }));
    }
  }, [isOpen, formData.locationSource, warehouses.length]);

  const stepLabel = useMemo(() => stepMeta.find((item) => item.key === step), [step]);

  const getOptionKey = (item: any) =>
    String(item?.key ?? item?._id ?? item?.id ?? item?.value ?? "");
  const getOptionLabel = (item: any) =>
    String(item?.value ?? item?.name ?? item?.label ?? item?.code ?? item?.title ?? "");

  const selectedProductName = getOptionLabel(
    products.find((item) => getOptionKey(item) === String(formData.product))
      || resolvedVariant?.product
      || productVariantValue?.product,
  ).trim();
  const selectedVariantName = getOptionLabel(
    variants.find((item) => getOptionKey(item) === String(formData.productVariant))
      || resolvedVariant
      || productVariantValue,
  ).trim();
  const listingProductName = selectedProductName && selectedVariantName
    ? normalizeCatalogSearch(selectedVariantName).includes(normalizeCatalogSearch(selectedProductName))
      ? selectedVariantName
      : `${selectedProductName} ${selectedVariantName}`
    : selectedVariantName || selectedProductName || "Selected product";

  const setValue = (key: string, value: any) => {
    if (key === "category") {
      requestVersions.current.subCategory += 1;
      requestVersions.current.product += 1;
      requestVersions.current.productVariant += 1;
      setSubCategories([]);
      setProducts([]);
      setVariants([]);
      setCommodityLoadStates((prev) => ({
        ...prev,
        subCategory: { status: "idle" },
        product: { status: "idle" },
        productVariant: { status: "idle" },
      }));
    }
    if (key === "subCategory") {
      requestVersions.current.product += 1;
      requestVersions.current.productVariant += 1;
      setProducts([]);
      setVariants([]);
      setCommodityLoadStates((prev) => ({
        ...prev,
        product: { status: "idle" },
        productVariant: { status: "idle" },
      }));
    }
    if (key === "product") {
      requestVersions.current.productVariant += 1;
      setVariants([]);
      setCommodityLoadStates((prev) => ({ ...prev, productVariant: { status: "idle" } }));
    }
    setFormData((prev) => {
      const next: Record<string, any> = { ...prev, [key]: value };
      if (key === "category") {
        next.subCategory = "";
        next.product = "";
        next.productVariant = "";
      }
      if (key === "subCategory") {
        next.product = "";
        next.productVariant = "";
      }
      if (key === "product") {
        next.productVariant = "";
      }
      if (key === "locationSource") {
        if (value === "WAREHOUSE") {
          next.officeAddress = "";
        }
        if (value === "OFFICE_ADDRESS") {
          next.warehouseId = "";
        }
      }
      if (key === "isGiTagged" && !value) {
        next.giName = "";
        next.giCertificateNumber = "";
        next.giDocumentUrl = "";
      }
      if (key === "isOrganic" && !value) {
        next.isOrganicCertified = false;
        next.organicCertificationBody = "";
        next.organicCertificationBodyOther = "";
        next.organicCertificateNumber = "";
        next.organicCertificateValidFrom = "";
        next.organicCertificateValidTo = "";
        next.organicCertifiedQuantity = "";
        next.organicCertifiedQuantityUnit = "KG";
        next.organicCertificationScope = "NPOP";
        next.organicCertificateDocumentUrl = "";
      }
      if (key === "organicCertificationBody" && value !== "OTHER") {
        next.organicCertificationBodyOther = "";
      }
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev, [key]: "" };
      if (key === "category") {
        next.subCategory = "";
        next.product = "";
        next.productVariant = "";
      } else if (key === "subCategory") {
        next.product = "";
        next.productVariant = "";
      } else if (key === "product") {
        next.productVariant = "";
      }
      return next;
    });
  };

  const setProductionMethod = (method: ProductionMethod) => {
    setFormData((prev) => {
      const next: Record<string, any> = applyProductionMethod(prev, method);
      if (method !== "organic") {
        next.isOrganicCertified = false;
        next.organicCertificationBody = "";
        next.organicCertificationBodyOther = "";
        next.organicCertificateNumber = "";
        next.organicCertificateValidFrom = "";
        next.organicCertificateValidTo = "";
        next.organicCertifiedQuantity = "";
        next.organicCertifiedQuantityUnit = "KG";
        next.organicCertificationScope = "NPOP";
        next.organicCertificateDocumentUrl = "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, classification: "" }));
  };

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};
    if (step === 1 && !fixedVariantId) {
      if (!formData.category) nextErrors.category = "Select a category.";
      if (!formData.subCategory) nextErrors.subCategory = "Select a sub category.";
      if (!formData.product) nextErrors.product = "Select a product.";
      if (!formData.productVariant) nextErrors.productVariant = "Select a product variant.";
      if (formData.category && !categories.some((item) => getOptionKey(item) === String(formData.category))) {
        nextErrors.category = "Select a valid category.";
      }
      if (formData.subCategory && !subCategories.some((item) => getOptionKey(item) === String(formData.subCategory))) {
        nextErrors.subCategory = "This subcategory is not associated with the selected category.";
      }
      if (formData.product && !products.some((item) => getOptionKey(item) === String(formData.product))) {
        nextErrors.product = "This product is not associated with the selected subcategory.";
      }
      if (formData.productVariant && !variants.some((item) => getOptionKey(item) === String(formData.productVariant))) {
        nextErrors.productVariant = "This variant is not associated with the selected product.";
      }
    }
    if (step === 1 && !formData.productionMethod) {
      nextErrors.classification = "Select one production / farming method.";
    }
    if (step === 1 && formData.isGiTagged) {
      if (!String(formData.giName || "").trim()) nextErrors.giName = "Enter GI name.";
      if (!String(formData.giCertificateNumber || "").trim()) nextErrors.giCertificateNumber = "Enter GI certificate number.";
    }
    if (step === 1 && formData.isOrganic) {
      if (!String(formData.organicCertificationBody || "").trim()) {
        nextErrors.organicCertificationBody = "Select organic certification body.";
      }
      if (String(formData.organicCertificationBody || "").trim() === "OTHER" && !String(formData.organicCertificationBodyOther || "").trim()) {
        nextErrors.organicCertificationBodyOther = "Specify certification body.";
      }
      if (!String(formData.organicCertificateNumber || "").trim()) {
        nextErrors.organicCertificateNumber = "Enter organic certificate number.";
      }
      if (!String(formData.organicCertificateValidFrom || "").trim()) {
        nextErrors.organicCertificateValidFrom = "Select organic valid from date.";
      }
      if (!String(formData.organicCertificateValidTo || "").trim()) {
        nextErrors.organicCertificateValidTo = "Select organic valid to date.";
      }
      const validFromTs = Date.parse(String(formData.organicCertificateValidFrom || ""));
      const validToTs = Date.parse(String(formData.organicCertificateValidTo || ""));
      if (Number.isFinite(validFromTs) && Number.isFinite(validToTs) && validToTs < validFromTs) {
        nextErrors.organicCertificateValidTo = "Valid to date cannot be before valid from date.";
      }
      const organicQty = Number(formData.organicCertifiedQuantity || 0);
      if (!Number.isFinite(organicQty) || organicQty <= 0) {
        nextErrors.organicCertifiedQuantity = "Enter certified quantity greater than zero.";
      }
      if (!String(formData.organicCertifiedQuantityUnit || "").trim()) {
        nextErrors.organicCertifiedQuantityUnit = "Select certified quantity unit.";
      }
      if (!String(formData.organicCertificationScope || "").trim()) {
        nextErrors.organicCertificationScope = "Select certification scope.";
      }
    }
    if (step === 2) {
      if (!formData.rate) nextErrors.rate = "Enter price per KG.";
      if (!formData.unit) nextErrors.unit = "Select a unit.";
    }
    if (step === 3) {
      if (!formData.locationSource) nextErrors.locationSource = "Select a location source.";
      if (formData.locationSource === "WAREHOUSE" && !formData.warehouseId) {
        nextErrors.warehouseId = "Select a warehouse.";
      }
      if (formData.locationSource === "OFFICE_ADDRESS" && !String(formData.officeAddress || "").trim()) {
        nextErrors.officeAddress = "Enter office address.";
      }
    }
    if (!isAssociateUser && step >= 2 && !formData.associate) {
      nextErrors.associate = "Select an associate.";
    }
    if (!isAssociateUser && isOperatorUser && step >= 2 && formData.associate && !resolvedCompanyId) {
      nextErrors.associate = "Selected associate is not linked to a company.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!fixedVariantId) {
        const freshSubCategories = await fetchCatalogHierarchyOptions({ key: "category", id: String(formData.category) });
        if (!freshSubCategories.some((option) => option.id === String(formData.subCategory))) {
          throw new Error("The selected subcategory is no longer associated with this category.");
        }
        const freshProducts = await fetchCatalogHierarchyOptions({ key: "subCategory", id: String(formData.subCategory) });
        if (!freshProducts.some((option) => option.id === String(formData.product))) {
          throw new Error("The selected product is no longer associated with this subcategory.");
        }
        const freshVariants = await fetchCatalogHierarchyOptions({ key: "product", id: String(formData.product) });
        if (!freshVariants.some((option) => option.id === String(formData.productVariant))) {
          throw new Error("The selected variant is no longer associated with this product.");
        }
      }
      const classificationPayload = normalizeClassificationPayload();
      const payload: any = {
        rate: Number(formData.rate || 0),
        unit: formData.unit,
        commission: Number.isFinite(computedCommission) ? Number(computedCommission.toFixed(2)) : undefined,
        productVariant: fixedVariantId || formData.productVariant,
        associate: isAssociateUser ? user?.id : formData.associate,
        ...(!isAssociateUser && isOperatorUser && resolvedCompanyId ? { associateCompany: resolvedCompanyId } : {}),
        locationSource: formData.locationSource,
        warehouseId: formData.locationSource === "WAREHOUSE" ? formData.warehouseId : undefined,
        officeAddress: formData.locationSource === "OFFICE_ADDRESS"
          ? String(formData.officeAddress || "").trim()
          : undefined,
        isLive,
        ...classificationPayload,
        ...(additionalVariable || {}),
      };
      if (process.env.NODE_ENV !== "production") {
        console.info("[LaunchListing] phase=launching-rate", {
          productVariant: payload.productVariant,
          associate: payload.associate,
          associateCompany: payload.associateCompany,
          locationSource: payload.locationSource,
          warehouseId: payload.warehouseId,
          officeAddress: payload.officeAddress ? "[redacted]" : "",
          rate: payload.rate,
          unit: payload.unit,
          isLive: payload.isLive,
        });
      }
      setSubmitPhase("launching-rate");
      return postData(apiEndpoint, payload, {});
    },
    onSuccess: (result: any) => {
      const data = result?.data;
      setSuccessData(data);
      showToastMessage({
        type: "success",
        message: isLive ? "Trade listing launched successfully." : "Trade listing saved successfully.",
        position: "top-right",
      });
      setSubmitPhase("idle");
      onSuccess?.(data);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || "Failed to create rate.";
      if (process.env.NODE_ENV !== "production") {
        console.error("[LaunchListing] error", {
          phase: submitPhase,
          status: error?.response?.status,
          message,
        });
      }
      const mapped = mapBackendErrorToFields(message);
      if (Object.keys(mapped).length > 0) {
        setErrors((prev) => ({ ...prev, ...mapped }));
        setStep(getStepForErrors(Object.keys(mapped)));
      }
      showToastMessage({
        type: "error",
        message: message || "Failed while launching listing.",
        position: "top-right",
      });
      setSubmitPhase("idle");
    },
  });

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    if (!validateForLaunch()) return;
    if (isSubmitting) return;
    createMutation.mutate();
  };

  const handleAddAnother = () => {
    setSuccessData(null);
    setFormData({ locationSource: "WAREHOUSE", unit: "KG" });
    setCommodityLoadStates(INITIAL_COMMODITY_LOAD_STATES);
    setErrors({});
    setStep(1);
    setSubmitPhase("idle");
  };

  const themeField = {
    base: "text-foreground",
    label: "font-black uppercase text-[9px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.2em] text-default-400 mb-1.5 sm:mb-2 ml-1",
    trigger: "rounded-xl sm:rounded-2xl border-default-200 bg-content2 hover:bg-content3 data-[open=true]:border-obaol-500/40 data-[hover=true]:border-default-300 transition-all border shadow-inner h-12 sm:h-14",
    inputWrapper: "rounded-xl sm:rounded-2xl border-default-200 bg-content2 hover:bg-content3 data-[focus=true]:border-obaol-500/40 data-[hover=true]:border-default-300 transition-all border shadow-inner h-12 sm:h-14",
    innerWrapper: "text-foreground",
    value: "text-foreground font-black uppercase text-[10px] sm:text-[11px] tracking-[0.08em] sm:tracking-widest !text-foreground",
    input: "text-foreground placeholder:text-default-300 font-bold text-xs sm:text-sm !text-foreground",
    selectorIcon: "text-default-500",
    popoverContent: "bg-background border border-default-200 shadow-2xl rounded-2xl sm:rounded-3xl p-2 backdrop-blur-3xl !text-foreground",
    listbox: "bg-transparent !text-foreground",
    errorMessage: "text-danger-400 text-xs",
    description: "text-default-400 text-xs",
    helperWrapper: "ml-1",
  };

  const itemClasses = {
    base: "rounded-xl text-foreground data-[hover=true]:bg-default-100 data-[selectable=true]:focus:bg-default-100 data-[selected=true]:text-obaol-500 font-semibold text-sm min-h-11 transition-all border border-transparent data-[hover=true]:border-default-200",
    title: "font-semibold text-sm text-foreground",
  };
  const productionMethod = formData.productionMethod as ProductionMethod | null | undefined;
  const isConventional = productionMethod === "conventional";
  const isNatural = productionMethod === "natural";
  const isOrganic = productionMethod === "organic";
  const isIpmQuality = productionMethod === "ipm";
  const isGiTagged = Boolean(formData.isGiTagged);
  const isSubmitting = submitPhase !== "idle" || createMutation.isPending;
  const isCommodityLoading = Object.values(commodityLoadStates).some((state) => state.status === "loading");
  const isCurrentStepIncomplete = step === 1
    ? (!fixedVariantId && (!formData.category || !formData.subCategory || !formData.product || !formData.productVariant)) || !productionMethod || isCommodityLoading
    : step === 2
      ? !formData.rate || !formData.unit || (!isAssociateUser && !formData.associate)
      : step === 3
        ? !formData.locationSource
          || (formData.locationSource === "WAREHOUSE" && !formData.warehouseId)
          || (formData.locationSource === "OFFICE_ADDRESS" && !String(formData.officeAddress || "").trim())
        : false;

  const renderCommodityAutocomplete = ({
    field,
    label,
    options,
    isDisabled = false,
    placeholder,
  }: {
    field: CommodityField;
    label: string;
    options: CatalogHierarchyOption[];
    isDisabled?: boolean;
    placeholder: string;
  }) => {
    const selectedKey = formData[field] ? String(formData[field]) : "";
    const loadState = commodityLoadStates[field];
    const isLoading = loadState.status === "loading";
    const retryLoad = () => {
      setCommodityRetries((prev) => ({ ...prev, [field]: prev[field] + 1 }));
    };
    const emptyLabel = field === "subCategory" && formData.category
      ? `No subcategories are associated with ${getOptionLabel(categories.find((item) => getOptionKey(item) === String(formData.category))) || "this category"}.`
      : field === "product" && formData.subCategory
        ? "No products are associated with this subcategory."
        : field === "productVariant" && formData.product
          ? "No variants are associated with this product."
          : `No ${label.toLowerCase()} found.`;
    const nextField: Partial<Record<CommodityField, CommodityField>> = {
      category: "subCategory",
      subCategory: "product",
      product: "productVariant",
    };

    return (
      <CommodityPicker
        field={field}
        label={label}
        placeholder={placeholder}
        options={options}
        selectedKey={selectedKey}
        disabled={isDisabled}
        loading={isLoading}
        invalid={Boolean(errors[field])}
        errorMessage={errors[field]}
        onSelect={(value) => {
          setValue(field, value);
          const next = nextField[field];
          if (value && next) {
            window.setTimeout(() => {
              const nextVisibleTrigger = Array.from(
                document.querySelectorAll<HTMLButtonElement>(`[data-commodity-trigger="${next}"]`),
              ).find((trigger) => !trigger.disabled && trigger.getClientRects().length > 0);
              nextVisibleTrigger?.focus();
            }, 0);
          }
        }}
        emptyContent={
          isLoading ? (
            <div className="flex min-h-20 items-center justify-center text-sm text-default-500" role="status" aria-live="polite">
              Loading {label.toLowerCase()}…
            </div>
          ) : loadState.status === "error" ? (
            <div className="flex min-h-24 flex-col items-center justify-center gap-2 py-3 text-center" role="alert">
              <span className="text-xs text-danger-500">{loadState.message}</span>
              <Button size="sm" variant="flat" color="warning" startContent={<FiRefreshCw />} onPress={retryLoad}>Retry</Button>
            </div>
          ) : (
            <div className="flex min-h-24 flex-col items-center justify-center gap-2 px-3 py-3 text-center">
              <span className="text-xs text-default-500">{emptyLabel}</span>
              <div className="flex flex-wrap justify-center gap-2">
                <Button size="sm" variant="flat" startContent={<FiRefreshCw />} onPress={retryLoad}>Refresh</Button>
                {field !== "category" && <Button size="sm" variant="flat" color="warning" onPress={goToGlobalCatalog}>Commodity Directory</Button>}
              </div>
            </div>
          )
        }
      />
    );
  };

  const getStepForErrors = (keys: string[]): number => {
    const step1Keys = new Set([
      "category", "subCategory", "product", "productVariant",
      "classification",
      "giName", "giCertificateNumber",
      "organicCertificationBody", "organicCertificationBodyOther",
      "organicCertificateNumber", "organicCertificateValidFrom", "organicCertificateValidTo",
      "organicCertifiedQuantity", "organicCertifiedQuantityUnit", "organicCertificationScope",
    ]);
    const step2Keys = new Set(["rate", "unit", "associate"]);
    const step3Keys = new Set(["locationSource", "warehouseId", "officeAddress"]);
    if (keys.some((k) => step1Keys.has(k))) return 1;
    if (keys.some((k) => step2Keys.has(k))) return 2;
    if (keys.some((k) => step3Keys.has(k))) return 3;
    return 4;
  };

  const validateForLaunch = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!fixedVariantId) {
      if (!formData.category) nextErrors.category = "Select a category.";
      if (!formData.subCategory) nextErrors.subCategory = "Select a sub category.";
      if (!formData.product) nextErrors.product = "Select a product.";
      if (!formData.productVariant) nextErrors.productVariant = "Select a product variant.";
      if (formData.category && !categories.some((item) => getOptionKey(item) === String(formData.category))) {
        nextErrors.category = "Select a valid category.";
      }
      if (formData.subCategory && !subCategories.some((item) => getOptionKey(item) === String(formData.subCategory))) {
        nextErrors.subCategory = "This subcategory is not associated with the selected category.";
      }
      if (formData.product && !products.some((item) => getOptionKey(item) === String(formData.product))) {
        nextErrors.product = "This product is not associated with the selected subcategory.";
      }
      if (formData.productVariant && !variants.some((item) => getOptionKey(item) === String(formData.productVariant))) {
        nextErrors.productVariant = "This variant is not associated with the selected product.";
      }
    }
    if (!productionMethod) nextErrors.classification = "Select one production / farming method.";
    if (isGiTagged) {
      if (!String(formData.giName || "").trim()) nextErrors.giName = "Enter GI name.";
      if (!String(formData.giCertificateNumber || "").trim()) nextErrors.giCertificateNumber = "Enter GI certificate number.";
    }
    if (isOrganic) {
      if (!String(formData.organicCertificationBody || "").trim()) nextErrors.organicCertificationBody = "Select organic certification body.";
      if (String(formData.organicCertificationBody || "").trim() === "OTHER" && !String(formData.organicCertificationBodyOther || "").trim()) {
        nextErrors.organicCertificationBodyOther = "Specify certification body.";
      }
      if (!String(formData.organicCertificateNumber || "").trim()) nextErrors.organicCertificateNumber = "Enter organic certificate number.";
      if (!String(formData.organicCertificateValidFrom || "").trim()) nextErrors.organicCertificateValidFrom = "Select organic valid from date.";
      if (!String(formData.organicCertificateValidTo || "").trim()) nextErrors.organicCertificateValidTo = "Select organic valid to date.";
      const fromTs = Date.parse(String(formData.organicCertificateValidFrom || ""));
      const toTs = Date.parse(String(formData.organicCertificateValidTo || ""));
      if (Number.isFinite(fromTs) && Number.isFinite(toTs) && toTs < fromTs) {
        nextErrors.organicCertificateValidTo = "Valid to date cannot be before valid from date.";
      }
      const qty = Number(formData.organicCertifiedQuantity || 0);
      if (!Number.isFinite(qty) || qty <= 0) nextErrors.organicCertifiedQuantity = "Enter certified quantity greater than zero.";
      if (!String(formData.organicCertifiedQuantityUnit || "").trim()) nextErrors.organicCertifiedQuantityUnit = "Select certified quantity unit.";
      if (!String(formData.organicCertificationScope || "").trim()) nextErrors.organicCertificationScope = "Select certification scope.";
    }
    if (!formData.rate) nextErrors.rate = "Enter price per KG.";
    if (!formData.unit) nextErrors.unit = "Select a unit.";
    if (!formData.locationSource) nextErrors.locationSource = "Select a location source.";
    if (formData.locationSource === "WAREHOUSE" && !formData.warehouseId) nextErrors.warehouseId = "Select a warehouse.";
    if (formData.locationSource === "OFFICE_ADDRESS" && !String(formData.officeAddress || "").trim()) nextErrors.officeAddress = "Enter office address.";
    if (!isAssociateUser && !formData.associate) nextErrors.associate = "Select an associate.";
    if (!isAssociateUser && isOperatorUser && formData.associate && !resolvedCompanyId) {
      nextErrors.associate = "Selected associate is not linked to a company.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStep(getStepForErrors(Object.keys(nextErrors)));
      showToastMessage({ type: "error", message: "Fix highlighted fields before launching listing.", position: "top-right" });
      return false;
    }
    return true;
  };

  const normalizeClassificationPayload = () => ({
    isConventional: isConventional,
    isNatural: isNatural,
    isOrganic: isOrganic,
    isIpmQuality: isIpmQuality,
    isOrganicCertified: isOrganic,
    organicCertificationBody: isOrganic ? String(formData.organicCertificationBody || "").trim() : "",
    organicCertificationBodyOther: isOrganic ? String(formData.organicCertificationBodyOther || "").trim() : "",
    organicCertificateNumber: isOrganic ? String(formData.organicCertificateNumber || "").trim() : "",
    organicCertificateValidFrom: isOrganic ? String(formData.organicCertificateValidFrom || "").trim() : "",
    organicCertificateValidTo: isOrganic ? String(formData.organicCertificateValidTo || "").trim() : "",
    organicCertifiedQuantity: isOrganic ? Number(formData.organicCertifiedQuantity || 0) : 0,
    organicCertifiedQuantityUnit: isOrganic ? String(formData.organicCertifiedQuantityUnit || "KG").trim() : "KG",
    organicCertificationScope: isOrganic ? String(formData.organicCertificationScope || "NPOP").trim() : "NPOP",
    organicCertificateDocumentUrl: isOrganic ? String(formData.organicCertificateDocumentUrl || "").trim() : "",
    isGiTagged: isGiTagged,
    giName: isGiTagged ? String(formData.giName || "").trim() : "",
    giCertificateNumber: isGiTagged ? String(formData.giCertificateNumber || "").trim() : "",
    giDocumentUrl: isGiTagged ? String(formData.giDocumentUrl || "").trim() : "",
  });

  const mapBackendErrorToFields = (message: string): Record<string, string> => {
    const msg = String(message || "").toLowerCase();
    const mapped: Record<string, string> = {};
    if (msg.includes("organic certification body")) mapped.organicCertificationBody = "Select a valid organic certification body.";
    if (msg.includes("specify organic certification body")) mapped.organicCertificationBodyOther = "Specify certification body.";
    if (msg.includes("organic certificate number")) mapped.organicCertificateNumber = "Enter organic certificate number.";
    if (msg.includes("organic certificate validity")) {
      mapped.organicCertificateValidFrom = "Provide valid certification dates.";
      mapped.organicCertificateValidTo = "Provide valid certification dates.";
    }
    if (msg.includes("valid to date")) mapped.organicCertificateValidTo = "Valid to date cannot be before valid from date.";
    if (msg.includes("organic certified quantity")) mapped.organicCertifiedQuantity = "Certified quantity must be greater than zero.";
    if (msg.includes("gi details")) {
      mapped.giName = "GI details are required.";
      mapped.giCertificateNumber = "GI details are required.";
    }
    if (msg.includes("production / farming method")) {
      mapped.classification = "Select exactly one production / farming method.";
    }
    if (msg.includes("warehouse is required")) mapped.warehouseId = "Select a warehouse.";
    if (msg.includes("office address is required")) mapped.officeAddress = "Enter office address.";
    if (msg.includes("selected associate is not linked to a company")) mapped.associate = "Selected associate is not linked to a company.";
    if (msg.includes("select a location source")) mapped.locationSource = "Select a location source.";
    if (msg.includes("subcategory is no longer associated")) mapped.subCategory = "Select a subcategory associated with this category.";
    if (msg.includes("product is no longer associated")) mapped.product = "Select a product associated with this subcategory.";
    if (msg.includes("variant is no longer associated")) mapped.productVariant = "Select a variant associated with this product.";
    return mapped;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="inside"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      backdrop="blur"
      classNames={{
        base: "bg-background border border-default-200 w-screen h-[100dvh] max-h-[100dvh] rounded-none sm:w-[94vw] sm:h-auto sm:max-h-[92vh] sm:rounded-2xl lg:max-w-[1100px] backdrop-blur-3xl shadow-2xl",
        header: "border-b border-default-100 px-4 py-3 sm:px-6 sm:py-4",
        footer: "border-t border-default-100 px-4 pt-3 pb-24 sm:px-6 sm:py-4 bg-background/95 backdrop-blur-md sticky bottom-0 z-20",
        body: "overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 pb-28 sm:pb-8",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.4em] text-obaol-400">
            Trade Mission • Step {step} of 4
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            {stepLabel?.icon && <stepLabel.icon size={22} className="text-obaol-400 sm:w-7 sm:h-7" />}
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-foreground leading-tight">{stepLabel?.title}</h3>
              <p className="text-xs sm:text-sm text-default-500">{stepLabel?.subtitle}</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pb-8">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
            {stepMeta.map((item) => (
              <div key={item.key} className={`flex-1 h-1 rounded-full ${item.key <= step ? "bg-obaol-400" : "bg-default-200"}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            {successData ? (
              <motion.div key="success" {...motionVariants} className="rounded-2xl sm:rounded-3xl border border-success-500/30 bg-success-500/10 p-4 sm:p-8 text-center">
                <FiCheckCircle size={36} className="mx-auto text-success-400 mb-3 sm:mb-4" />
                <h4 className="text-lg sm:text-xl font-black text-foreground mb-2">{isLive ? "Trade listing launched successfully" : "Trade listing saved successfully"}</h4>
                <p className="text-xs sm:text-sm text-default-500 mb-4 sm:mb-6">{isLive ? "Your product is now live in the trade network." : "Your listing is saved offline and can be made live when you are ready."}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-content2 border border-default-200 rounded-2xl p-4 text-left">
                  <div>
                    <p className="text-xs uppercase text-default-400">Rate</p>
                    <p className="text-lg font-bold text-foreground">{formData.rate || "--"} / {formData.unit || "KG"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-default-400">Location</p>
                    <p className="text-lg font-bold text-foreground">
                      {formData.locationSource === "WAREHOUSE"
                        ? (warehouses.find((w) => getOptionKey(w) === formData.warehouseId)?.address || "--")
                        : (formData.officeAddress || "--")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-default-400">Status</p>
                    <p className="text-lg font-bold text-foreground">{isLive ? "Live" : "Draft"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 mt-6">
                  <Button className="w-full sm:w-auto font-bold" variant="flat" onPress={handleAddAnother}>Add Another</Button>
                  <Button className="w-full sm:w-auto font-bold" color="warning" onPress={onClose}>View Products</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key={step} {...motionVariants} className="space-y-4 sm:space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    {!fixedVariantId && (
                      <section aria-labelledby="commodity-selection-heading" className="rounded-2xl border border-default-200 bg-content1 p-4 sm:p-5">
                        <div className="mb-4">
                          <h4 id="commodity-selection-heading" className="text-sm font-bold text-foreground">Commodity selection</h4>
                          <p className="mt-1 text-xs text-default-500">Search and select each level to identify the exact product grade.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {renderCommodityAutocomplete({
                            field: "category",
                            label: "Category",
                            options: categories,
                            placeholder: "Search categories",
                          })}
                          {renderCommodityAutocomplete({
                            field: "subCategory",
                            label: "Subcategory",
                            options: subCategories,
                            isDisabled: !formData.category,
                            placeholder: formData.category ? "Search subcategories" : "Select category first",
                          })}
                          {renderCommodityAutocomplete({
                            field: "product",
                            label: "Product",
                            options: products,
                            isDisabled: !formData.subCategory,
                            placeholder: formData.subCategory ? "Search products" : "Select subcategory first",
                          })}
                          {renderCommodityAutocomplete({
                            field: "productVariant",
                            label: "Product variant",
                            options: variants,
                            isDisabled: !formData.product,
                            placeholder: formData.product ? "Search product variants" : "Select product first",
                          })}
                        </div>
                      </section>
                    )}
                    {fixedVariantId && (
                      <div className="p-4 sm:p-5 rounded-2xl border border-obaol-500/30 bg-obaol-500/10 text-foreground text-sm">
                        Variant preselected for this listing.
                      </div>
                    )}
                    <div className="rounded-xl border border-obaol-500/25 bg-obaol-500/5 px-3 sm:px-4 py-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <FiGlobe size={16} className="text-obaol-400 mt-0.5" />
                          <p className="text-[11px] sm:text-xs text-obaol-700 dark:text-obaol-300 leading-relaxed font-medium">
                            Can&apos;t find the next directory level? Request it here and continue building your private chain while admin reviews it.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button type="button" onClick={() => setShowCatalogRequest((value) => !value)} className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-obaol-300 hover:text-obaol-200 underline underline-offset-4">
                            Request {requestEntityType === "productVariant" ? "Variant" : requestEntityType === "subCategory" ? "Subcategory" : requestEntityType.charAt(0).toUpperCase() + requestEntityType.slice(1)}
                            <FiArrowRight size={14} />
                          </button>
                          <button type="button" onClick={goToGlobalCatalog} className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-default-500 hover:text-foreground underline underline-offset-4">
                            Go to Commodity Directory
                          </button>
                        </div>
                      </div>
                      {showCatalogRequest && roleLower === "associate" && (
                        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-obaol-500/20 pt-4 sm:grid-cols-2">
                          <Input label="Requested name" value={catalogRequestName} onValueChange={setCatalogRequestName} />
                          <Input label="Description" value={catalogRequestDescription} onValueChange={setCatalogRequestDescription} />
                          <div className="sm:col-span-2 flex justify-end gap-2">
                            <Button size="sm" variant="light" onPress={() => setShowCatalogRequest(false)}>Cancel</Button>
                            <Button size="sm" color="warning" isLoading={catalogRequestMutation.isPending} isDisabled={!catalogRequestName.trim()} onPress={() => catalogRequestMutation.mutate()}>Submit for approval</Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <section aria-labelledby="classification-heading" className="rounded-2xl border border-default-200 bg-content1 p-4 sm:p-5">
                      <div className="mb-4">
                        <h4 id="classification-heading" className="text-sm font-bold text-foreground">Product classification</h4>
                        <p className="mt-1 text-xs text-default-500">Set the production method and any recognized certification.</p>
                      </div>
                      {!resolvedProductId ? (
                        <div className="rounded-xl bg-default-100 px-4 py-3 text-xs text-default-500">
                          Select product first to configure classification.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="rounded-xl bg-default-100/70 p-3 sm:p-4">
                            <div className="mb-3">
                              <p className="text-xs font-bold text-foreground">
                                Production / Farming Method
                              </p>
                              <p className="text-[11px] text-default-500 mt-1">
                                Select the production method used for this product.
                              </p>
                            </div>
                            <div role="radiogroup" aria-label="Production / Farming Method" className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                              {PRODUCTION_METHODS.map((method) => {
                                const selected = productionMethod === method.key;
                                return (
                                  <button
                                    key={method.key}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => setProductionMethod(method.key)}
                                    className={`rounded-xl border px-3 py-2.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 focus-visible:ring-offset-2 ${
                                      selected
                                        ? "border-obaol-500/60 bg-obaol-500/15 text-obaol-400 shadow-inner"
                                        : "border-default-200 bg-content2 text-default-400 hover:border-default-300 hover:bg-content3"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2 text-xs font-semibold">
                                      <span className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${selected ? "border-obaol-500" : "border-default-400"}`}>
                                        {selected && <span className="h-2 w-2 rounded-full bg-obaol-500" />}
                                      </span>
                                      {method.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                            {errors.classification && (
                              <p className="mt-2 text-xs text-danger-400" role="alert">{errors.classification}</p>
                            )}
                          </div>

                          <div className="rounded-xl bg-default-100/70 px-3 sm:px-4 py-3 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-bold text-foreground">Geographical indication (GI)</p>
                              <p className="mt-1 text-[11px] text-default-500">Enable this when the product has recognized geographical certification.</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="text-xs font-semibold text-default-600">GI tag</span>
                              <Switch aria-label="GI Tag" isSelected={isGiTagged} onValueChange={(v) => setValue("isGiTagged", v)} color="warning" />
                            </div>
                          </div>

                          {isOrganic && (
                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-2">
                                Organic Certification (India Focus)
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                                <Select
                                  variant="bordered"
                                  label="Certification Body"
                                  classNames={themeField}
                                  listboxProps={{ itemClasses }}
                                  selectedKeys={formData.organicCertificationBody ? [formData.organicCertificationBody] : []}
                                  onSelectionChange={(keys) => setValue("organicCertificationBody", Array.from(keys)[0])}
                                  isInvalid={!!errors.organicCertificationBody}
                                  errorMessage={errors.organicCertificationBody}
                                >
                                  {ORGANIC_CERT_BODIES.map((item) => (
                                    <SelectItem key={item.key} textValue={item.value} className="uppercase text-foreground dark:text-white font-black">
                                      {item.value}
                                    </SelectItem>
                                  ))}
                                </Select>
                                {String(formData.organicCertificationBody || "") === "OTHER" && (
                                  <Input
                                    variant="bordered"
                                    label="Certification Body (Other)"
                                    classNames={themeField}
                                    value={String(formData.organicCertificationBodyOther || "")}
                                    onChange={(e) => setValue("organicCertificationBodyOther", e.target.value)}
                                    isInvalid={!!errors.organicCertificationBodyOther}
                                    errorMessage={errors.organicCertificationBodyOther}
                                  />
                                )}
                                <Input
                                  variant="bordered"
                                  label="Organic Certificate Number"
                                  classNames={themeField}
                                  value={String(formData.organicCertificateNumber || "")}
                                  onChange={(e) => setValue("organicCertificateNumber", e.target.value)}
                                  isInvalid={!!errors.organicCertificateNumber}
                                  errorMessage={errors.organicCertificateNumber}
                                />
                                <Input
                                  variant="bordered"
                                  label="Valid From"
                                  type="date"
                                  classNames={themeField}
                                  value={String(formData.organicCertificateValidFrom || "")}
                                  onChange={(e) => setValue("organicCertificateValidFrom", e.target.value)}
                                  isInvalid={!!errors.organicCertificateValidFrom}
                                  errorMessage={errors.organicCertificateValidFrom}
                                />
                                <Input
                                  variant="bordered"
                                  label="Valid To"
                                  type="date"
                                  classNames={themeField}
                                  value={String(formData.organicCertificateValidTo || "")}
                                  onChange={(e) => setValue("organicCertificateValidTo", e.target.value)}
                                  isInvalid={!!errors.organicCertificateValidTo}
                                  errorMessage={errors.organicCertificateValidTo}
                                />
                                <Input
                                  variant="bordered"
                                  label="Certified Quantity"
                                  type="number"
                                  classNames={themeField}
                                  value={String(formData.organicCertifiedQuantity || "")}
                                  onChange={(e) => setValue("organicCertifiedQuantity", e.target.value)}
                                  isInvalid={!!errors.organicCertifiedQuantity}
                                  errorMessage={errors.organicCertifiedQuantity}
                                />
                                <Select
                                  variant="bordered"
                                  label="Quantity Unit"
                                  classNames={themeField}
                                  listboxProps={{ itemClasses }}
                                  selectedKeys={formData.organicCertifiedQuantityUnit ? [formData.organicCertifiedQuantityUnit] : []}
                                  onSelectionChange={(keys) => setValue("organicCertifiedQuantityUnit", Array.from(keys)[0])}
                                  isInvalid={!!errors.organicCertifiedQuantityUnit}
                                  errorMessage={errors.organicCertifiedQuantityUnit}
                                >
                                  <SelectItem key="KG" className="uppercase text-foreground dark:text-white font-black">KG</SelectItem>
                                  <SelectItem key="MT" className="uppercase text-foreground dark:text-white font-black">Metric Ton (MT)</SelectItem>
                                  <SelectItem key="Quintal" className="uppercase text-foreground dark:text-white font-black">Quintal</SelectItem>
                                </Select>
                                <Select
                                  variant="bordered"
                                  label="Certification Scope"
                                  classNames={themeField}
                                  listboxProps={{ itemClasses }}
                                  selectedKeys={formData.organicCertificationScope ? [formData.organicCertificationScope] : ["NPOP"]}
                                  onSelectionChange={(keys) => setValue("organicCertificationScope", Array.from(keys)[0])}
                                  isInvalid={!!errors.organicCertificationScope}
                                  errorMessage={errors.organicCertificationScope}
                                >
                                  {ORGANIC_SCOPES.map((item) => (
                                    <SelectItem key={item.key} textValue={item.value} className="uppercase text-foreground dark:text-white font-black">
                                      {item.value}
                                    </SelectItem>
                                  ))}
                                </Select>
                                <Input
                                  variant="bordered"
                                  label="Certificate Document URL (Optional)"
                                  classNames={themeField}
                                  value={String(formData.organicCertificateDocumentUrl || "")}
                                  onChange={(e) => setValue("organicCertificateDocumentUrl", e.target.value)}
                                />
                              </div>
                            </div>
                          )}

                          {isGiTagged && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                              <Input
                                variant="bordered"
                                label="GI Name"
                                classNames={themeField}
                                value={String(formData.giName || "")}
                                onChange={(e) => setValue("giName", e.target.value)}
                                isInvalid={!!errors.giName}
                                errorMessage={errors.giName}
                              />
                              <Input
                                variant="bordered"
                                label="GI Certificate Number"
                                classNames={themeField}
                                value={String(formData.giCertificateNumber || "")}
                                onChange={(e) => setValue("giCertificateNumber", e.target.value)}
                                isInvalid={!!errors.giCertificateNumber}
                                errorMessage={errors.giCertificateNumber}
                              />
                              <Input
                                variant="bordered"
                                label="GI Document URL (Optional)"
                                classNames={themeField}
                                value={String(formData.giDocumentUrl || "")}
                                onChange={(e) => setValue("giDocumentUrl", e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  </div>
                )}
                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <Input variant="bordered" label={`Price (per ${formData.unit || "KG"})`} type="number" classNames={themeField} value={formData.rate || ""} onChange={(e) => setValue("rate", e.target.value)} isInvalid={!!errors.rate} errorMessage={errors.rate} />
                    <Select variant="bordered" label="Unit" classNames={themeField} listboxProps={{ itemClasses }} selectedKeys={formData.unit ? [formData.unit] : []} onSelectionChange={(keys) => setValue("unit", Array.from(keys)[0])} isInvalid={!!errors.unit} errorMessage={errors.unit}>
                      <SelectItem key="KG" className="font-black">KG</SelectItem>
                      <SelectItem key="MT" className="font-black">Metric Ton (MT)</SelectItem>
                      <SelectItem key="Quintal" className="font-black">Quintal</SelectItem>
                    </Select>
                    {!isAssociateUser && (
                      <Select variant="bordered" label="Associate" classNames={themeField} listboxProps={{ itemClasses }} selectedKeys={formData.associate ? [formData.associate] : []} onSelectionChange={(keys) => setValue("associate", Array.from(keys)[0])} isInvalid={!!errors.associate} errorMessage={errors.associate}>
                        {associates.map((item) => (
                          <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item) || item.email} className="uppercase text-foreground dark:text-white font-black">
                            {getOptionLabel(item) || item.email}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                    <div className="md:col-span-2 rounded-xl sm:rounded-2xl border border-default-200/60 dark:border-white/10 bg-default-100/50 dark:bg-white/5 p-3 sm:p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between text-sm text-default-600 dark:text-white/70">
                          <span>Commission ({commissionPercent}%)</span>
                          <span className="font-bold text-obaol-600 dark:text-obaol-300">{computedCommission.toFixed(2)}</span>
                        </div>
                        <div className="h-[1px] w-full bg-default-200/60 dark:bg-white/10"></div>
                        <div className="flex items-center justify-between text-sm font-medium text-foreground dark:text-white/90">
                          <span>Price after commission</span>
                          <span className="font-bold text-success-600 dark:text-success-400">{(rateValue + computedCommission).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <Select
                      variant="bordered"
                      label="Location Source"
                      classNames={themeField}
                      listboxProps={{ itemClasses }}
                      selectedKeys={formData.locationSource ? [formData.locationSource] : []}
                      onSelectionChange={(keys) => setValue("locationSource", Array.from(keys)[0])}
                      isInvalid={!!errors.locationSource}
                      errorMessage={errors.locationSource}
                    >
                      <SelectItem key="WAREHOUSE" className="uppercase text-foreground dark:text-white font-black">Warehouse</SelectItem>
                      <SelectItem key="OFFICE_ADDRESS" className="uppercase text-foreground dark:text-white font-black">Office Address</SelectItem>
                    </Select>
                    {formData.locationSource === "WAREHOUSE" ? (
                      <Select
                        variant="bordered"
                        label="Warehouse"
                        classNames={themeField}
                        listboxProps={{ itemClasses }}
                        selectedKeys={formData.warehouseId ? [formData.warehouseId] : []}
                        onSelectionChange={(keys) => setValue("warehouseId", Array.from(keys)[0])}
                        isDisabled={!isAssociateUser && !resolvedCompanyId}
                        isInvalid={!!errors.warehouseId}
                        errorMessage={errors.warehouseId}
                      >
                        {warehouses.map((item) => (
                          <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-foreground dark:text-white font-black">
                            {getOptionLabel(item)}
                          </SelectItem>
                        ))}
                      </Select>
                    ) : formData.locationSource === "OFFICE_ADDRESS" ? (
                      <Input
                        variant="bordered"
                        label="Office Address"
                        classNames={themeField}
                        value={formData.officeAddress || ""}
                        onChange={(e) => setValue("officeAddress", e.target.value)}
                        isInvalid={!!errors.officeAddress}
                        errorMessage={errors.officeAddress}
                      />
                    ) : (
                      <Input
                        variant="bordered"
                        label="Location Detail"
                        classNames={themeField}
                        value=""
                        placeholder="Select location source first"
                        isDisabled
                      />
                    )}
                    <div className="md:col-span-2 rounded-xl sm:rounded-2xl border border-default-200/60 dark:border-white/10 bg-default-100/50 dark:bg-white/5 p-3 sm:p-4 text-sm text-default-600 dark:text-white/70 break-words">
                      Location: {formData.locationSource === "WAREHOUSE"
                        ? (warehouses.find((w) => getOptionKey(w) === formData.warehouseId)?.address || "—")
                        : (formData.officeAddress || "—")}
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-xl sm:rounded-2xl border border-default-200 bg-content2 p-4 sm:p-5 text-sm text-foreground">
                      <div className="border-b border-default-200 pb-4">
                        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-default-400">Product</div>
                        <h4 className="mt-1 text-xl sm:text-2xl font-black text-foreground capitalize">{listingProductName}</h4>
                        <p className="mt-1 text-xs sm:text-sm text-default-500">Review your trade mission before launch.</p>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs uppercase text-default-400">Rate</div>
                          <div className="text-lg font-bold text-foreground">{formData.rate || "--"} / {formData.unit || "KG"}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-default-400">Location</div>
                          <div className="text-lg font-bold text-foreground">
                            {formData.locationSource === "WAREHOUSE"
                              ? (warehouses.find((w) => getOptionKey(w) === formData.warehouseId)?.address || "--")
                              : (formData.officeAddress || "--")}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-default-400">Commission</div>
                          <div className="text-lg font-bold text-obaol-500">{computedCommission.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-default-400">Price After Commission</div>
                          <div className="text-lg font-bold text-success-500">{(rateValue + computedCommission).toFixed(2)}</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-xs uppercase text-default-400">Classification</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {isConventional && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-default-300/40 bg-default-500/10 text-default-300">
                                Conventional
                              </span>
                            )}
                            {isNatural && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-500/40 bg-amber-500/15 text-amber-400">
                                Natural
                              </span>
                            )}
                            {isOrganic && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
                                Organic
                              </span>
                            )}
                            {isIpmQuality && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-sky-400/40 bg-sky-500/15 text-sky-300">
                                IPM
                              </span>
                            )}
                            {isGiTagged && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300">
                                GI Tag
                              </span>
                            )}
                          </div>
                          {isOrganic && (
                            <div className="mt-2 text-xs text-default-400">
                              Organic Cert: {String(formData.organicCertificationBody || "—")} •
                              Cert No: {String(formData.organicCertificateNumber || "—")} •
                              Qty: {String(formData.organicCertifiedQuantity || "—")} {String(formData.organicCertifiedQuantityUnit || "KG")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl sm:rounded-2xl border border-default-200 bg-content2 p-4 sm:p-5">
                      <div>
                        <div className="text-sm text-foreground font-semibold">Request publication after approval</div>
                        <div className="text-xs text-default-500">Your publication preference takes effect only after the full directory chain and this listing are approved.</div>
                      </div>
                      <Switch isSelected={isLive} onValueChange={setIsLive} color="warning" />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ModalBody>
        {!successData && (
          <ModalFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex w-full sm:w-auto items-center gap-2">
              <Button className="w-full sm:w-auto" variant="light" onPress={step === 1 ? onClose : handleBack} isDisabled={isSubmitting}>Back</Button>
            </div>
            <Button
              color="warning"
              endContent={<FiArrowRight />}
              onPress={step < 4 ? handleNext : handleSubmit}
              isLoading={isSubmitting}
              isDisabled={isSubmitting || (step < 4 && isCurrentStepIncomplete)}
              className="w-full sm:w-auto font-bold"
            >
              {isSubmitting
                ? (isAssociateUser ? "Publishing your product..." : "Launching listing...")
                : step < 4
                  ? "Continue"
                  : (isAssociateUser ? "Publish Your Product" : "Launch Listing")}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default VariantRateWizardModal;
