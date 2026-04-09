"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { FiArrowRight, FiCheckCircle, FiMapPin, FiPackage, FiTruck, FiZap } from "react-icons/fi";
import { getData, postData } from "@/core/api/apiHandler";
import { useMutation } from "@tanstack/react-query";
import { fetchDependentOptions } from "@/utils/fetchDependentOptions";
import { showToastMessage } from "@/utils/utils";
import { associateCompanyRoutes, associateRoutes, warehouseRoutes } from "@/core/api/apiRoutes";
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

const VariantRateWizardModal: React.FC<WizardProps> = ({
  isOpen,
  onClose,
  apiEndpoint,
  additionalVariable,
  onSuccess,
  productVariantValue,
  user,
}) => {
  const [step, setStep] = useState(1);
  const [isLive, setIsLive] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<any>(null);

  const roleLower = String(user?.role || "").toLowerCase();
  const { data: calculationConfig } = useCalculationConfig(roleLower === "admin");
  const commissionPercent =
    calculationConfig?.variantRateCommissionPercent ??
    DEFAULT_CALCULATION_CONFIG.variantRateCommissionPercent;

  const isAssociateUser = roleLower === "associate";
  const fixedVariantId = productVariantValue?._id || productVariantValue;

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [associates, setAssociates] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | null>(null);
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
    if (!formData.category) return;
    fetchDependentOptions("subCategory", "category", formData.category).then(setSubCategories);
  }, [formData.category]);

  useEffect(() => {
    if (!formData.subCategory) return;
    fetchDependentOptions("product", "subCategory", formData.subCategory).then(setProducts);
  }, [formData.subCategory]);

  useEffect(() => {
    if (!formData.product) return;
    fetchDependentOptions("productVariant", "product", formData.product).then(setVariants);
  }, [formData.product]);

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
    setIsLive(true);
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
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        rate: Number(formData.rate || 0),
        unit: formData.unit,
        commission: Number.isFinite(computedCommission) ? Number(computedCommission.toFixed(2)) : undefined,
        productVariant: fixedVariantId || formData.productVariant,
        associate: isAssociateUser ? user?.id : formData.associate,
        locationSource: formData.locationSource,
        warehouseId: formData.locationSource === "WAREHOUSE" ? formData.warehouseId : undefined,
        officeAddress: formData.locationSource === "OFFICE_ADDRESS"
          ? String(formData.officeAddress || "").trim()
          : undefined,
        isLive,
        ...(additionalVariable || {}),
      };
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
      onSuccess?.(data);
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to create rate.",
        position: "top-right",
      });
    },
  });

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    if (!validateStep()) return;
    createMutation.mutate();
  };

  const handleAddAnother = () => {
    setSuccessData(null);
    setFormData({ locationSource: "WAREHOUSE" });
    setErrors({});
    setStep(1);
  };

  const themeField = {
    base: "text-foreground",
    label: "font-black uppercase text-[10px] tracking-[0.2em] text-default-400 mb-2 ml-1",
    trigger: "rounded-2xl border-default-200 bg-content2 hover:bg-content3 data-[open=true]:border-warning-500/40 data-[hover=true]:border-default-300 transition-all border shadow-inner h-14",
    inputWrapper: "rounded-2xl border-default-200 bg-content2 hover:bg-content3 data-[focus=true]:border-warning-500/40 data-[hover=true]:border-default-300 transition-all border shadow-inner h-14",
    innerWrapper: "text-foreground",
    value: "text-foreground font-black uppercase text-[11px] tracking-widest !text-foreground",
    input: "text-foreground placeholder:text-default-300 font-bold text-sm !text-foreground",
    selectorIcon: "text-default-500",
    popoverContent: "bg-background border border-default-200 shadow-2xl rounded-3xl p-2 backdrop-blur-3xl !text-foreground",
    listbox: "bg-transparent !text-foreground",
    errorMessage: "text-danger-400 text-xs",
    description: "text-default-400 text-xs",
    helperWrapper: "ml-1",
  };

  const itemClasses = {
    base: "rounded-xl text-foreground data-[hover=true]:bg-default-100 data-[selectable=true]:focus:bg-default-100 data-[selected=true]:text-warning-400 font-black uppercase text-[10px] tracking-widest h-12 transition-all border border-transparent data-[hover=true]:border-default-200",
    title: "font-black uppercase tracking-widest text-[11px] text-foreground",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      backdrop="blur"
      classNames={{
        base: "bg-background border border-default-200 max-h-[92vh] backdrop-blur-3xl shadow-2xl",
        header: "border-b border-default-100",
        footer: "border-t border-default-100",
        body: "overflow-y-auto",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-warning-400">
            Trade Mission • Step {step} of 4
          </div>
          <div className="flex items-center gap-3">
            {stepLabel?.icon && <stepLabel.icon size={28} className="text-warning-400" />}
            <div>
              <h3 className="text-2xl font-black text-foreground">{stepLabel?.title}</h3>
              <p className="text-sm text-default-500">{stepLabel?.subtitle}</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pb-8">
          <div className="flex items-center gap-2 mb-6">
            {stepMeta.map((item) => (
              <div key={item.key} className={`flex-1 h-1 rounded-full ${item.key <= step ? "bg-warning-400" : "bg-default-200"}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            {successData ? (
              <motion.div key="success" {...motionVariants} className="rounded-3xl border border-success-500/30 bg-success-500/10 p-8 text-center">
                <FiCheckCircle size={42} className="mx-auto text-success-400 mb-4" />
                <h4 className="text-xl font-black text-foreground mb-2">Mission complete</h4>
                <p className="text-sm text-default-500 mb-6">Your product is now live in the trade network.</p>
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
              <motion.div key={step} {...motionVariants} className="space-y-6">
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Select variant="bordered" label="Product Variant" classNames={themeField} listboxProps={{ itemClasses }} selectedKeys={formData.productVariant ? [formData.productVariant] : []} onSelectionChange={(keys) => setValue("productVariant", Array.from(keys)[0])} isDisabled={!formData.product} isInvalid={!!errors.productVariant} errorMessage={errors.productVariant}>
                          {variants.map((item) => (
                            <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
                              {getOptionLabel(item)}
                            </SelectItem>
                          ))}
                        </Select>
                      </>
                    )}
                    {fixedVariantId && (
                      <div className="col-span-2 p-6 rounded-2xl border border-warning-500/30 bg-warning-500/10 text-white">
                        Variant preselected for this listing.
                      </div>
                    )}
                  </div>
                )}
                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>Commission ({commissionPercent}%)</span>
                        <span className="font-bold text-warning-300">{computedCommission.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    ) : (
                      <Input
                        variant="bordered"
                        label="Office Address"
                        classNames={themeField}
                        value={formData.officeAddress || ""}
                        onChange={(e) => setValue("officeAddress", e.target.value)}
                        isInvalid={!!errors.officeAddress}
                        errorMessage={errors.officeAddress}
                      />
                    )}
                    <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                      Location: {formData.locationSource === "WAREHOUSE"
                        ? (warehouses.find((w) => getOptionKey(w) === formData.warehouseId)?.address || "—")
                        : (formData.officeAddress || "—")}
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-2xl border border-default-200 bg-content2 p-5 text-sm text-foreground">
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
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-default-200 bg-content2 p-5">
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
        <ModalFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {successData ? (
              <>
                <Button variant="flat" onPress={handleAddAnother}>Add Another</Button>
                <Button color="warning" onPress={onClose}>View Products</Button>
              </>
            ) : (
              <Button variant="light" onPress={step === 1 ? onClose : handleBack}>Back</Button>
            )}
          </div>
          {!successData && (
            <Button
              color="warning"
              endContent={<FiArrowRight />}
              onPress={step < 4 ? handleNext : handleSubmit}
              isLoading={createMutation.isPending}
              className="font-bold"
            >
              {step < 4 ? "Continue" : "Launch Listing"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VariantRateWizardModal;
