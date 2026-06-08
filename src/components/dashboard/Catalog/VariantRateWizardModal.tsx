"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiCheckCircle, FiGlobe, FiMapPin, FiPackage, FiTruck, FiZap } from "react-icons/fi";
import { getData, postData } from "@/core/api/apiHandler";
import { patchData } from "@/core/api/apiHandler";
import { useMutation } from "@tanstack/react-query";
import { fetchDependentOptions } from "@/utils/fetchDependentOptions";
import { showToastMessage } from "@/utils/utils";
import { associateCompanyRoutes, associateRoutes, productRoutes, productVariantRoutes, warehouseRoutes } from "@/core/api/apiRoutes";
import { useCalculationConfig, DEFAULT_CALCULATION_CONFIG } from "@/hooks/useCalculationConfig";

type WizardProps = {
  isOpen: boolean;
  onClose: () => void;
  apiEndpoint: string;
  additionalVariable?: Record<string, any>;
  onSuccess?: (data: any) => void;
  productVariantValue?: any | null;
  user?: any;
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
  const [submitPhase, setSubmitPhase] = useState<"idle" | "saving-product" | "launching-rate">("idle");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<any>(null);

  const roleLower = String(user?.role || "").toLowerCase();
  const { data: calculationConfig } = useCalculationConfig(roleLower === "admin");
  const commissionPercent =
    calculationConfig?.variantRateCommissionPercent ??
    DEFAULT_CALCULATION_CONFIG.variantRateCommissionPercent;

  const isAssociateUser = roleLower === "associate";
  const isOperatorUser = roleLower === "operator" || roleLower === "team";
  const fixedVariantId = productVariantValue?._id || productVariantValue;

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [associates, setAssociates] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | null>(null);
  const [resolvedProductId, setResolvedProductId] = useState<string | null>(null);
  const [companyAddress, setCompanyAddress] = useState<string>("");

  const rateValue = Number(formData.rate || 0);
  const computedCommission = Number.isFinite(rateValue) ? rateValue * (commissionPercent / 100) : 0;

  useEffect(() => {
    if (!isOpen) return;
    fetchDependentOptions("category").then(setCategories);
    if (!isAssociateUser) {
      fetchDependentOptions("associate").then(setAssociates);
    }
    if (fixedVariantId) {
      setFormData((prev) => ({ ...prev, productVariant: fixedVariantId }));
    }
  }, [isOpen, fixedVariantId, isAssociateUser]);

  useEffect(() => {
    if (!isOpen) return;
    if (!fixedVariantId) return;
    const resolveFromVariant = async () => {
      try {
        const res = await getData(`${productVariantRoutes.getAll}/${fixedVariantId}`);
        const row = res?.data?.data || null;
        const productId = String(row?.product?._id || row?.product || "").trim();
        setResolvedProductId(productId || null);
      } catch {
        setResolvedProductId(null);
      }
    };
    resolveFromVariant();
  }, [isOpen, fixedVariantId]);

  useEffect(() => {
    if (!formData.category) return;
    fetchDependentOptions("subCategory", "category", formData.category).then(setSubCategories);
  }, [formData.category]);

  useEffect(() => {
    if (!formData.subCategory) return;
    fetchDependentOptions("product", "subCategory", formData.subCategory).then(setProducts);
  }, [formData.subCategory]);

  useEffect(() => {
    if (!formData.product) {
      setVariants([]);
      setIsLoadingVariants(false);
      return;
    }

    let isMounted = true;
    setIsLoadingVariants(true);

    fetchDependentOptions("productVariant", "product", formData.product)
      .then((data) => {
        if (isMounted) {
          setVariants(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setVariants([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingVariants(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [formData.product]);

  useEffect(() => {
    if (!isOpen) return;
    if (fixedVariantId) return;
    const nextProduct = String(formData.product || "").trim();
    setResolvedProductId(nextProduct || null);
  }, [isOpen, fixedVariantId, formData.product]);

  useEffect(() => {
    if (!isOpen) return;
    if (!resolvedProductId) {
      setFormData((prev) => ({
        ...prev,
        isNatural: false,
        isOrganic: false,
        isIpmQuality: false,
        isOrganicCertified: false,
        organicCertificationBody: "",
        organicCertificationBodyOther: "",
        organicCertificateNumber: "",
        organicCertificateValidFrom: "",
        organicCertificateValidTo: "",
        organicCertifiedQuantity: "",
        organicCertifiedQuantityUnit: "KG",
        organicCertificationScope: "NPOP",
        organicCertificateDocumentUrl: "",
        isGiTagged: false,
        giName: "",
        giCertificateNumber: "",
        giDocumentUrl: "",
      }));
      return;
    }
    const loadClassification = async () => {
      try {
        const res = await getData(`${productRoutes.getAll}/${resolvedProductId}`);
        const row = res?.data?.data || {};
        setFormData((prev) => ({
          ...prev,
          isNatural: Boolean(row?.isNatural),
          isOrganic: Boolean(row?.isOrganic),
          isIpmQuality: Boolean(row?.isIpmQuality),
          isOrganicCertified: Boolean(row?.isOrganicCertified),
          organicCertificationBody: String(row?.organicCertificationBody || ""),
          organicCertificationBodyOther: String(row?.organicCertificationBodyOther || ""),
          organicCertificateNumber: String(row?.organicCertificateNumber || ""),
          organicCertificateValidFrom: row?.organicCertificateValidFrom
            ? String(new Date(row.organicCertificateValidFrom).toISOString().slice(0, 10))
            : "",
          organicCertificateValidTo: row?.organicCertificateValidTo
            ? String(new Date(row.organicCertificateValidTo).toISOString().slice(0, 10))
            : "",
          organicCertifiedQuantity: row?.organicCertifiedQuantity ?? "",
          organicCertifiedQuantityUnit: String(row?.organicCertifiedQuantityUnit || "KG"),
          organicCertificationScope: String(row?.organicCertificationScope || "NPOP"),
          organicCertificateDocumentUrl: String(row?.organicCertificateDocumentUrl || ""),
          isGiTagged: Boolean(row?.isGiTagged),
          giName: String(row?.giName || ""),
          giCertificateNumber: String(row?.giCertificateNumber || ""),
          giDocumentUrl: String(row?.giDocumentUrl || ""),
        }));
        setErrors((prev) => ({
          ...prev,
          organicCertificationBody: "",
          organicCertificationBodyOther: "",
          organicCertificateNumber: "",
          organicCertificateValidFrom: "",
          organicCertificateValidTo: "",
          organicCertifiedQuantity: "",
          organicCertifiedQuantityUnit: "KG",
          organicCertificationScope: "NPOP",
          organicCertificateDocumentUrl: "",
          giName: "",
          giCertificateNumber: "",
          classification: "",
        }));
      } catch {
        setFormData((prev) => ({
          ...prev,
          isNatural: false,
          isOrganic: false,
          isIpmQuality: false,
          isOrganicCertified: false,
          organicCertificationBody: "",
          organicCertificationBodyOther: "",
          organicCertificateNumber: "",
          organicCertificateValidFrom: "",
          organicCertificateValidTo: "",
          organicCertifiedQuantity: "",
          organicCertifiedQuantityUnit: "KG",
          organicCertificationScope: "NPOP",
          organicCertificateDocumentUrl: "",
          isGiTagged: false,
          giName: "",
          giCertificateNumber: "",
          giDocumentUrl: "",
        }));
      }
    };
    loadClassification();
  }, [isOpen, resolvedProductId]);

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

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setSuccessData(null);
    setStep(1);
    setFormData({ locationSource: "WAREHOUSE" });
    setResolvedProductId(null);
    setIsLive(true);
    setSubmitPhase("idle");
  }, [isOpen]);

  const stepLabel = useMemo(() => stepMeta.find((item) => item.key === step), [step]);

  const getOptionKey = (item: any) =>
    String(item?.key ?? item?._id ?? item?.id ?? item?.value ?? "");
  const getOptionLabel = (item: any) =>
    String(item?.value ?? item?.name ?? item?.label ?? item?.code ?? item?.title ?? "");

  const setValue = (key: string, value: any) => {
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
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};
    if (step === 1 && !fixedVariantId) {
      if (!formData.category) nextErrors.category = "Select a category.";
      if (!formData.subCategory) nextErrors.subCategory = "Select a sub category.";
      if (!formData.product) nextErrors.product = "Select a product.";
      if (!formData.productVariant) nextErrors.productVariant = "Select a product variant.";
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
      if (!resolvedProductId) {
        throw new Error("Select a product to define classification.");
      }
      const classificationPayload = normalizeClassificationPayload();
      if (process.env.NODE_ENV !== "production") {
        console.info("[LaunchListing] phase=saving-product", { productId: resolvedProductId, classificationPayload });
      }
      setSubmitPhase("saving-product");
      await patchData(`${productRoutes.getAll}/${resolvedProductId}`, classificationPayload, {});

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
        message: "Trade listing launched!",
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
        message: submitPhase === "saving-product"
          ? message || "Failed while saving product certification."
          : message || "Failed while launching listing.",
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
    setFormData({ locationSource: "WAREHOUSE" });
    setErrors({});
    setStep(1);
    setSubmitPhase("idle");
  };

  const themeField = {
    base: "text-foreground",
    label: "font-black uppercase text-[9px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.2em] text-default-400 mb-1.5 sm:mb-2 ml-1",
    trigger: "rounded-xl sm:rounded-2xl border-default-200 bg-content2 hover:bg-content3 data-[open=true]:border-warning-500/40 data-[hover=true]:border-default-300 transition-all border shadow-inner h-12 sm:h-14",
    inputWrapper: "rounded-xl sm:rounded-2xl border-default-200 bg-content2 hover:bg-content3 data-[focus=true]:border-warning-500/40 data-[hover=true]:border-default-300 transition-all border shadow-inner h-12 sm:h-14",
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
    base: "rounded-xl text-foreground data-[hover=true]:bg-default-100 data-[selectable=true]:focus:bg-default-100 data-[selected=true]:text-warning-400 font-black uppercase text-[10px] tracking-widest h-12 transition-all border border-transparent data-[hover=true]:border-default-200",
    title: "font-black uppercase tracking-widest text-[11px] text-foreground",
  };
  const isNatural = Boolean(formData.isNatural);
  const isOrganic = Boolean(formData.isOrganic);
  const isIpmQuality = Boolean(formData.isIpmQuality);
  const isGiTagged = Boolean(formData.isGiTagged);
  const isConventional = !(isNatural || isOrganic || isGiTagged);
  const isSubmitting = submitPhase !== "idle" || createMutation.isPending;

  const getStepForErrors = (keys: string[]): number => {
    const step1Keys = new Set([
      "category", "subCategory", "product", "productVariant",
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
    }
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
    if (msg.includes("warehouse is required")) mapped.warehouseId = "Select a warehouse.";
    if (msg.includes("office address is required")) mapped.officeAddress = "Enter office address.";
    if (msg.includes("selected associate is not linked to a company")) mapped.associate = "Selected associate is not linked to a company.";
    if (msg.includes("select a location source")) mapped.locationSource = "Select a location source.";
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
          <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.4em] text-warning-400">
            Trade Mission • Step {step} of 4
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            {stepLabel?.icon && <stepLabel.icon size={22} className="text-warning-400 sm:w-7 sm:h-7" />}
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-foreground leading-tight">{stepLabel?.title}</h3>
              <p className="text-xs sm:text-sm text-default-500">{stepLabel?.subtitle}</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pb-8">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
            {stepMeta.map((item) => (
              <div key={item.key} className={`flex-1 h-1 rounded-full ${item.key <= step ? "bg-warning-400" : "bg-default-200"}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            {successData ? (
              <motion.div key="success" {...motionVariants} className="rounded-2xl sm:rounded-3xl border border-success-500/30 bg-success-500/10 p-4 sm:p-8 text-center">
                <FiCheckCircle size={36} className="mx-auto text-success-400 mb-3 sm:mb-4" />
                <h4 className="text-lg sm:text-xl font-black text-foreground mb-2">Mission complete</h4>
                <p className="text-xs sm:text-sm text-default-500 mb-4 sm:mb-6">Your product is now live in the trade network.</p>
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
              </motion.div>
            ) : (
              <motion.div key={step} {...motionVariants} className="space-y-4 sm:space-y-6">
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {!fixedVariantId && (
                      <>
                        <Select variant="bordered" label="Category" classNames={themeField} listboxProps={{ itemClasses }} selectedKeys={formData.category ? [formData.category] : []} onSelectionChange={(keys) => setValue("category", Array.from(keys)[0])} isInvalid={!!errors.category} errorMessage={errors.category}>
                          {categories.map((item) => (
                            <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
                              {getOptionLabel(item)}
                            </SelectItem>
                          ))}
                        </Select>
                        <Select variant="bordered" label="Sub Category" classNames={themeField} listboxProps={{ itemClasses }} selectedKeys={formData.subCategory ? [formData.subCategory] : []} onSelectionChange={(keys) => setValue("subCategory", Array.from(keys)[0])} isDisabled={!formData.category} isInvalid={!!errors.subCategory} errorMessage={errors.subCategory}>
                          {subCategories.map((item) => (
                            <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
                              {getOptionLabel(item)}
                            </SelectItem>
                          ))}
                        </Select>
                        <Select variant="bordered" label="Product" classNames={themeField} listboxProps={{ itemClasses }} selectedKeys={formData.product ? [formData.product] : []} onSelectionChange={(keys) => setValue("product", Array.from(keys)[0])} isDisabled={!formData.subCategory} isInvalid={!!errors.product} errorMessage={errors.product}>
                          {products.map((item) => (
                            <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
                              {getOptionLabel(item)}
                            </SelectItem>
                          ))}
                        </Select>
                        <Select
                          variant="bordered"
                          label="Product Variant"
                          classNames={themeField}
                          listboxProps={{
                            itemClasses,
                            emptyContent: isLoadingVariants ? "Loading variants..." : "No variants found.",
                          }}
                          selectedKeys={formData.productVariant ? [formData.productVariant] : []}
                          onSelectionChange={(keys) => setValue("productVariant", Array.from(keys)[0])}
                          isLoading={isLoadingVariants}
                          isDisabled={!formData.product}
                          isInvalid={!!errors.productVariant}
                          errorMessage={errors.productVariant}
                        >
                          {variants.map((item) => (
                            <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
                              {getOptionLabel(item)}
                            </SelectItem>
                          ))}
                        </Select>
                      </>
                    )}
                    {fixedVariantId && (
                      <div className="md:col-span-2 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-warning-500/30 bg-warning-500/10 text-white text-sm sm:text-base">
                        Variant preselected for this listing.
                      </div>
                    )}
                    <div className="md:col-span-2 rounded-xl sm:rounded-2xl border border-warning-500/30 bg-warning-500/10 px-3 sm:px-4 py-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <FiGlobe size={16} className="text-warning-400 mt-0.5" />
                          <p className="text-[11px] sm:text-xs text-warning-700 dark:text-warning-300 leading-relaxed font-medium">
                            Can&apos;t find your product or variant? Go to Global Catalog and add it.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push("/dashboard/product")}
                          className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider text-warning-300 hover:text-warning-200 underline underline-offset-4 transition-colors"
                        >
                          Go to Global Catalog
                          <FiArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2 rounded-xl sm:rounded-2xl border border-default-200 bg-content2 p-3 sm:p-4">
                      <div className="mb-3">
                        <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.14em] sm:tracking-[0.2em] text-default-400">Product Type & GI Signal</p>
                        <p className="text-[11px] text-default-500 mt-1">
                          Natural and Organic are type signals. IPM Quality and GI Tag are additional independent signals and can be combined.
                        </p>
                      </div>

                      {!resolvedProductId ? (
                        <div className="rounded-xl border border-default-200 bg-content1 px-4 py-3 text-xs text-default-500">
                          Select product first to configure classification.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 sm:gap-3">
                            <div className="rounded-xl border border-default-200 bg-content1 px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-default-400">Natural</span>
                              <Switch isSelected={isNatural} onValueChange={(v) => setValue("isNatural", v)} color="warning" />
                            </div>
                            <div className="rounded-xl border border-default-200 bg-content1 px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-default-400">Organic</span>
                              <Switch isSelected={isOrganic} onValueChange={(v) => setValue("isOrganic", v)} color="warning" />
                            </div>
                            <div className="rounded-xl border border-default-200 bg-content1 px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-default-400">IPM Quality</span>
                              <Switch isSelected={isIpmQuality} onValueChange={(v) => setValue("isIpmQuality", v)} color="warning" />
                            </div>
                            <div className="rounded-xl border border-default-200 bg-content1 px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-default-400">GI Tag</span>
                              <Switch isSelected={isGiTagged} onValueChange={(v) => setValue("isGiTagged", v)} color="warning" />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
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
                                IPM Quality
                              </span>
                            )}
                            {isGiTagged && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300">
                                GI Tag
                              </span>
                            )}
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
                                    <SelectItem key={item.key} textValue={item.value} className="uppercase text-white font-black">
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
                                  <SelectItem key="KG" className="uppercase text-white font-black">KG</SelectItem>
                                  <SelectItem key="MT" className="uppercase text-white font-black">Metric Ton (MT)</SelectItem>
                                  <SelectItem key="Quintal" className="uppercase text-white font-black">Quintal</SelectItem>
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
                                    <SelectItem key={item.key} textValue={item.value} className="uppercase text-white font-black">
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
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <Input variant="bordered" label="Price (per KG)" type="number" classNames={themeField} value={formData.rate || ""} onChange={(e) => setValue("rate", e.target.value)} isInvalid={!!errors.rate} errorMessage={errors.rate} />
                    <Select variant="bordered" label="Unit" classNames={themeField} listboxProps={{ itemClasses }} selectedKeys={formData.unit ? [formData.unit] : []} onSelectionChange={(keys) => setValue("unit", Array.from(keys)[0])} isInvalid={!!errors.unit} errorMessage={errors.unit}>
                      <SelectItem key="KG" className="font-black">KG</SelectItem>
                      <SelectItem key="MT" className="font-black">Metric Ton (MT)</SelectItem>
                      <SelectItem key="Quintal" className="font-black">Quintal</SelectItem>
                    </Select>
                    {!isAssociateUser && (
                      <Select variant="bordered" label="Associate" classNames={themeField} listboxProps={{ itemClasses }} selectedKeys={formData.associate ? [formData.associate] : []} onSelectionChange={(keys) => setValue("associate", Array.from(keys)[0])} isInvalid={!!errors.associate} errorMessage={errors.associate}>
                        {associates.map((item) => (
                          <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item) || item.email} className="uppercase text-white font-black">
                            {getOptionLabel(item) || item.email}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                    <div className="md:col-span-2 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <span>Commission ({commissionPercent}%)</span>
                          <span className="font-bold text-warning-300">{computedCommission.toFixed(2)}</span>
                        </div>
                        <div className="h-[1px] w-full bg-white/10"></div>
                        <div className="flex items-center justify-between text-sm font-medium text-white/90">
                          <span>Price after commission</span>
                          <span className="font-bold text-success-400">{(rateValue + computedCommission).toFixed(2)}</span>
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
                      <SelectItem key="WAREHOUSE" className="uppercase text-white font-black">Warehouse</SelectItem>
                      <SelectItem key="OFFICE_ADDRESS" className="uppercase text-white font-black">Office Address</SelectItem>
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
                          <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
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
                    <div className="md:col-span-2 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 text-sm text-white/70 break-words">
                      Location: {formData.locationSource === "WAREHOUSE"
                        ? (warehouses.find((w) => getOptionKey(w) === formData.warehouseId)?.address || "—")
                        : (formData.officeAddress || "—")}
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-xl sm:rounded-2xl border border-default-200 bg-content2 p-4 sm:p-5 text-sm text-foreground">
                      Review your trade mission before launch.
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
                          <div className="text-lg font-bold text-warning-500">{computedCommission.toFixed(2)}</div>
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
                                IPM Quality
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
                        <div className="text-sm text-foreground font-semibold">Launch listing live</div>
                        <div className="text-xs text-default-500">Toggle if you want to keep it as draft.</div>
                      </div>
                      <Switch isSelected={isLive} onValueChange={setIsLive} color="warning" />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ModalBody>
        <ModalFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div className="flex w-full sm:w-auto items-center gap-2">
            {successData ? (
              <>
                <Button className="w-full sm:w-auto" variant="flat" onPress={handleAddAnother}>Add Another</Button>
                <Button className="w-full sm:w-auto" color="warning" onPress={onClose}>View Products</Button>
              </>
            ) : (
              <Button className="w-full sm:w-auto" variant="light" onPress={step === 1 ? onClose : handleBack} isDisabled={isSubmitting}>Back</Button>
            )}
          </div>
          {!successData && (
            <Button
              color="warning"
              endContent={<FiArrowRight />}
              onPress={step < 4 ? handleNext : handleSubmit}
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              className="w-full sm:w-auto font-bold"
            >
              {isSubmitting
                ? (submitPhase === "saving-product" ? "Saving product certification..." : "Launching listing...")
                : step < 4
                  ? "Continue"
                  : "Launch Listing"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VariantRateWizardModal;
