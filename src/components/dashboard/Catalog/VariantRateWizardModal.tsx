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
import { postData } from "@/core/api/apiHandler";
import { useMutation } from "@tanstack/react-query";
import { fetchDependentOptions } from "@/utils/fetchDependentOptions";
import { showToastMessage } from "@/utils/utils";

type WizardProps = {
  isOpen: boolean;
  onClose: () => void;
  apiEndpoint: string;
  additionalVariable?: Record<string, any>;
  onSuccess?: (data: any) => void;
  productVariantValue?: any | null;
  user?: any;
};

const COMMISSION_RATE = 0.025;

const stepMeta = [
  { key: 1, title: "Product & Grade", subtitle: "Define the cargo you’re listing", icon: FiPackage },
  { key: 2, title: "Pricing & Quantity", subtitle: "Set the trade rate and volume", icon: FiZap },
  { key: 3, title: "Supply Location", subtitle: "Pinpoint your origin hub", icon: FiMapPin },
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

  const isAssociateUser = String(user?.role || "").toLowerCase() === "associate";
  const fixedVariantId = productVariantValue?._id || productVariantValue;

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [associates, setAssociates] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [pincodes, setPincodes] = useState<any[]>([]);

  const rateValue = Number(formData.rate || 0);
  const quantityValue = Number(formData.quantity || 0);
  const computedCommission = Number.isFinite(rateValue) ? rateValue * COMMISSION_RATE : 0;
  const projectedValue = Number.isFinite(rateValue) && Number.isFinite(quantityValue)
    ? rateValue * quantityValue * 1000
    : 0;

  useEffect(() => {
    if (!isOpen) return;
    fetchDependentOptions("category").then(setCategories);
    fetchDependentOptions("state").then(setStates);
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
    if (!formData.state) return;
    fetchDependentOptions("district", "state", formData.state).then(setDistricts);
  }, [formData.state]);

  useEffect(() => {
    if (!formData.district) return;
    fetchDependentOptions("division", "district", formData.district).then(setDivisions);
  }, [formData.district]);

  useEffect(() => {
    if (!formData.division) return;
    fetchDependentOptions("pincodeEntry", "division", formData.division).then(setPincodes);
  }, [formData.division]);

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setSuccessData(null);
    setStep(1);
    setFormData({});
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
      if (key === "state") {
        next.district = "";
        next.division = "";
        next.pincodeEntry = "";
      }
      if (key === "district") {
        next.division = "";
        next.pincodeEntry = "";
      }
      if (key === "division") {
        next.pincodeEntry = "";
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
      if (!formData.state) nextErrors.state = "Select a state.";
      if (!formData.district) nextErrors.district = "Select a district.";
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
        quantity: formData.quantity ? Number(formData.quantity) : undefined,
        commission: Number.isFinite(computedCommission) ? Number(computedCommission.toFixed(2)) : undefined,
        productVariant: fixedVariantId || formData.productVariant,
        associate: isAssociateUser ? user?.id : formData.associate,
        state: formData.state || undefined,
        district: formData.district || undefined,
        division: formData.division || undefined,
        pincodeEntry: formData.pincodeEntry || undefined,
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
    setFormData({});
    setErrors({});
    setStep(1);
  };

  const darkField = {
    base: "text-white",
    label: "font-black uppercase text-[10px] tracking-[0.2em] text-white/30 mb-2 ml-1",
    trigger: "rounded-2xl border-white/10 bg-[#1A1F26] hover:bg-[#232932] data-[open=true]:border-warning-500/40 data-[hover=true]:border-white/20 transition-all border shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)] h-14",
    inputWrapper: "rounded-2xl border-white/10 bg-[#1A1F26] hover:bg-[#232932] data-[focus=true]:border-warning-500/40 data-[hover=true]:border-white/20 transition-all border shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)] h-14",
    innerWrapper: "text-white",
    value: "text-white font-black uppercase text-[11px] tracking-widest !text-white",
    input: "text-white placeholder:text-white/20 font-bold text-sm !text-white",
    selectorIcon: "text-white/60",
    popoverContent: "bg-[#0B0F14] border border-white/10 shadow-2xl rounded-3xl p-2 backdrop-blur-3xl !text-white",
    listbox: "bg-transparent !text-white",
    errorMessage: "text-danger-400 text-xs",
    description: "text-white/40 text-xs",
    helperWrapper: "ml-1",
  };

  const itemClasses = {
    base: "rounded-xl text-white data-[hover=true]:bg-white/10 data-[selectable=true]:focus:bg-white/10 data-[selected=true]:text-warning-400 font-black uppercase text-[10px] tracking-widest h-12 transition-all border border-transparent data-[hover=true]:border-white/10",
    title: "font-black uppercase tracking-widest text-[11px] text-white",
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
        base: "bg-gradient-to-br from-[#0B0F14] via-[#0B1016] to-[#151A22] border border-white/10 max-h-[92vh] backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)]",
        header: "border-b border-white/10",
        footer: "border-t border-white/10",
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
              <h3 className="text-2xl font-black text-white">{stepLabel?.title}</h3>
              <p className="text-sm text-white/60">{stepLabel?.subtitle}</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pb-8">
          <div className="flex items-center gap-2 mb-6">
            {stepMeta.map((item) => (
              <div key={item.key} className={`flex-1 h-1 rounded-full ${item.key <= step ? "bg-warning-400" : "bg-white/10"}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            {successData ? (
              <motion.div key="success" {...motionVariants} className="rounded-3xl border border-success-500/30 bg-success-500/10 p-8 text-center">
                <FiCheckCircle size={42} className="mx-auto text-success-400 mb-4" />
                <h4 className="text-xl font-black text-white mb-2">Mission complete</h4>
                <p className="text-sm text-white/70 mb-6">Your product is now live in the trade network.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/30 border border-white/10 rounded-2xl p-4 text-left">
                  <div>
                    <p className="text-xs uppercase text-white/40">Rate</p>
                    <p className="text-lg font-bold text-white">{formData.rate || "--"} / {formData.unit || "KG"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/40">Quantity</p>
                    <p className="text-lg font-bold text-white">{formData.quantity || "--"} MT</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/40">Origin</p>
                    <p className="text-lg font-bold text-white">{states.find((s) => s._id === formData.state)?.name || "--"} / {districts.find((d) => d._id === formData.district)?.name || "--"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/40">Status</p>
                    <p className="text-lg font-bold text-white">{isLive ? "Live" : "Draft"}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key={step} {...motionVariants} className="space-y-6">
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!fixedVariantId && (
                      <>
                        <Select variant="bordered" label="Category" classNames={darkField} listboxProps={{ itemClasses }} selectedKeys={formData.category ? [formData.category] : []} onSelectionChange={(keys) => setValue("category", Array.from(keys)[0])} isInvalid={!!errors.category} errorMessage={errors.category}>
                          {categories.map((item) => (
                            <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
                              {getOptionLabel(item)}
                            </SelectItem>
                          ))}
                        </Select>
                        <Select variant="bordered" label="Sub Category" classNames={darkField} listboxProps={{ itemClasses }} selectedKeys={formData.subCategory ? [formData.subCategory] : []} onSelectionChange={(keys) => setValue("subCategory", Array.from(keys)[0])} isDisabled={!formData.category} isInvalid={!!errors.subCategory} errorMessage={errors.subCategory}>
                          {subCategories.map((item) => (
                            <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
                              {getOptionLabel(item)}
                            </SelectItem>
                          ))}
                        </Select>
                        <Select variant="bordered" label="Product" classNames={darkField} listboxProps={{ itemClasses }} selectedKeys={formData.product ? [formData.product] : []} onSelectionChange={(keys) => setValue("product", Array.from(keys)[0])} isDisabled={!formData.subCategory} isInvalid={!!errors.product} errorMessage={errors.product}>
                          {products.map((item) => (
                            <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
                              {getOptionLabel(item)}
                            </SelectItem>
                          ))}
                        </Select>
                        <Select variant="bordered" label="Product Variant" classNames={darkField} listboxProps={{ itemClasses }} selectedKeys={formData.productVariant ? [formData.productVariant] : []} onSelectionChange={(keys) => setValue("productVariant", Array.from(keys)[0])} isDisabled={!formData.product} isInvalid={!!errors.productVariant} errorMessage={errors.productVariant}>
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
                    <Input variant="bordered" label="Price (per KG)" type="number" classNames={darkField} value={formData.rate || ""} onChange={(e) => setValue("rate", e.target.value)} isInvalid={!!errors.rate} errorMessage={errors.rate} />
                    <Select variant="bordered" label="Unit" classNames={darkField} listboxProps={{ itemClasses }} selectedKeys={formData.unit ? [formData.unit] : []} onSelectionChange={(keys) => setValue("unit", Array.from(keys)[0])} isInvalid={!!errors.unit} errorMessage={errors.unit}>
                      <SelectItem key="KG" className="text-white font-black">KG</SelectItem>
                      <SelectItem key="MT" className="text-white font-black">Metric Ton (MT)</SelectItem>
                      <SelectItem key="Quintal" className="text-white font-black">Quintal</SelectItem>
                    </Select>
                    <Input variant="bordered" label="Quantity (MT)" type="number" classNames={darkField} value={formData.quantity || ""} onChange={(e) => setValue("quantity", e.target.value)} />
                    {!isAssociateUser && (
                      <Select variant="bordered" label="Associate" classNames={darkField} listboxProps={{ itemClasses }} selectedKeys={formData.associate ? [formData.associate] : []} onSelectionChange={(keys) => setValue("associate", Array.from(keys)[0])} isInvalid={!!errors.associate} errorMessage={errors.associate}>
                        {associates.map((item) => (
                          <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item) || item.email} className="uppercase text-white font-black">
                            {getOptionLabel(item) || item.email}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                    <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>Commission (2.5%)</span>
                        <span className="font-bold text-warning-300">{computedCommission.toFixed(2)}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-white/70">
                        <span>Projected total value</span>
                        <span className="font-bold text-white">{projectedValue ? projectedValue.toFixed(2) : "--"}</span>
                      </div>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select variant="bordered" label="State" classNames={darkField} listboxProps={{ itemClasses }} selectedKeys={formData.state ? [formData.state] : []} onSelectionChange={(keys) => setValue("state", Array.from(keys)[0])} isInvalid={!!errors.state} errorMessage={errors.state}>
                      {states.map((item) => (
                        <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
                          {getOptionLabel(item)}
                        </SelectItem>
                      ))}
                    </Select>
                    <Select variant="bordered" label="District" classNames={darkField} listboxProps={{ itemClasses }} selectedKeys={formData.district ? [formData.district] : []} onSelectionChange={(keys) => setValue("district", Array.from(keys)[0])} isDisabled={!formData.state} isInvalid={!!errors.district} errorMessage={errors.district}>
                      {districts.map((item) => (
                        <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
                          {getOptionLabel(item)}
                        </SelectItem>
                      ))}
                    </Select>
                    <Select variant="bordered" label="Division" classNames={darkField} listboxProps={{ itemClasses }} selectedKeys={formData.division ? [formData.division] : []} onSelectionChange={(keys) => setValue("division", Array.from(keys)[0])} isDisabled={!formData.district}>
                      {divisions.map((item) => (
                        <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
                          {getOptionLabel(item)}
                        </SelectItem>
                      ))}
                    </Select>
                    <Select variant="bordered" label="Pin Code" classNames={darkField} listboxProps={{ itemClasses }} selectedKeys={formData.pincodeEntry ? [formData.pincodeEntry] : []} onSelectionChange={(keys) => setValue("pincodeEntry", Array.from(keys)[0])} isDisabled={!formData.division}>
                      {pincodes.map((item) => (
                        <SelectItem key={getOptionKey(item)} textValue={getOptionLabel(item)} className="uppercase text-white font-black">
                          {getOptionLabel(item)}
                        </SelectItem>
                      ))}
                    </Select>
                    <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                      Origin confirmed: {states.find((s) => s._id === formData.state)?.name || "—"}, {districts.find((d) => d._id === formData.district)?.name || "—"}.
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
                      Review your trade mission before launch.
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs uppercase text-white/40">Rate</div>
                          <div className="text-lg font-bold text-white">{formData.rate || "--"} / {formData.unit || "KG"}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-white/40">Quantity</div>
                          <div className="text-lg font-bold text-white">{formData.quantity || "--"} MT</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-white/40">Origin</div>
                          <div className="text-lg font-bold text-white">{states.find((s) => s._id === formData.state)?.name || "--"} / {districts.find((d) => d._id === formData.district)?.name || "--"}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-white/40">Commission</div>
                          <div className="text-lg font-bold text-warning-300">{computedCommission.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div>
                        <div className="text-sm text-white font-semibold">Launch listing live</div>
                        <div className="text-xs text-white/60">Toggle if you want to keep it as draft.</div>
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
