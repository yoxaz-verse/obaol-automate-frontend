"use client";

import React from "react";
import dayjs from "dayjs";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Select,
  SelectItem,
  Button,
  Input,
  Textarea,
} from "@nextui-org/react";
import {
  LuNavigation,
  LuMapPin,
  LuAnchor,
  LuFileCheck,
  LuTag,
  LuTruck,
  LuEye,
  LuCheck,
  LuPackage,
  LuActivity,
  LuUser,
  LuStore,
  LuShieldCheck,
} from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertCircle, FiInfo, FiCheckCircle } from "react-icons/fi";

export type ResponsibilityField = {
  key: string;
  label: string;
  allowed: string[];
  show?: boolean;
  icon: React.ReactElement;
};

type Props = {
  incotermOptions: any[];
  paymentTermOptions: any[];
  selectedIncotermId: string;
  setSelectedIncotermId: (v: string) => void;
  selectedPaymentTermId: string;
  setSelectedPaymentTermId: (v: string) => void;
  isTradeTermsChanged: boolean;
  onSaveTradeTerms?: () => void;
  savingTradeTerms?: boolean;
  tradeTermsSavedAt?: string;

  executionContext: any;
  setExecutionContext: (updater: any) => void;
  canToggleTradeType?: boolean;

  states: any[];
  originDistrictOptions: any[];
  destinationDistrictOptions: any[];
  originCountryOptions: any[];
  destinationCountryOptions: any[];
  originPortOptions: any[];
  destinationPortOptions: any[];

  showOriginLogisticsFields: boolean;
  showDestinationLogisticsFields: boolean;
  canEditOriginLogistics: boolean;
  canEditDestinationLogistics: boolean;
  canEditRouteNotes: boolean;

  responsibilityPlan: any;
  setResponsibilityPlan: (updater: any) => void;
  responsibilityFieldConfig: ResponsibilityField[];
  canEditResponsibilityPlan: boolean;
  isReadOnlyAfterConversion?: boolean;

  inlandTransportSegments: Array<{ label: string; from: string; to: string }>;
  setInlandTransportSegments: (updater: any) => void;

  packagingSpecifications: string;
  setPackagingSpecifications: (v: string) => void;
  hasPackagingSpecifications: boolean;

  isInternational: boolean;
  showCargoInsuranceNote?: boolean;

  isResponsibilityEventChanged: boolean;
  onFinalize?: () => void;
  onSaveFramework?: () => void;
  finalizeLoading?: boolean;
  savingFramework?: boolean;
  responsibilitySavedAt?: string;
  showFinalizeButton?: boolean;
  showSaveTermsButton?: boolean;
};

const ownerLabelByKey: Record<string, string> = {
  buyer: "Buyer",
  seller: "Seller",
  obaol: "OBAOL",
};

const getOwnerStyles = (owner: string) => {
  switch (owner) {
    case "buyer":
      return "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]";
    case "seller":
      return "bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]";
    case "obaol":
      return "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]";
    default:
      return "bg-white text-primary";
  }
};

const getOwnerIcons = (owner: string) => {
    switch (owner) {
        case "buyer": return <LuUser size={10} />;
        case "seller": return <LuStore size={10} />;
        case "obaol": return <LuShieldCheck size={10} />;
        default: return null;
    }
};

const ResponsibilityEventForm: React.FC<Props> = ({
  incotermOptions,
  paymentTermOptions,
  selectedIncotermId,
  setSelectedIncotermId,
  selectedPaymentTermId,
  setSelectedPaymentTermId,
  isTradeTermsChanged,
  onSaveTradeTerms,
  savingTradeTerms,
  tradeTermsSavedAt,
  executionContext,
  setExecutionContext,
  canToggleTradeType,
  states,
  originDistrictOptions,
  destinationDistrictOptions,
  originCountryOptions,
  destinationCountryOptions,
  originPortOptions,
  destinationPortOptions,
  showOriginLogisticsFields,
  showDestinationLogisticsFields,
  canEditOriginLogistics,
  canEditDestinationLogistics,
  canEditRouteNotes,
  responsibilityPlan,
  setResponsibilityPlan,
  responsibilityFieldConfig,
  canEditResponsibilityPlan,
  isReadOnlyAfterConversion,
  inlandTransportSegments,
  setInlandTransportSegments,
  packagingSpecifications,
  setPackagingSpecifications,
  hasPackagingSpecifications,
  isInternational,
  showCargoInsuranceNote,
  isResponsibilityEventChanged,
  onFinalize,
  onSaveFramework,
  finalizeLoading,
  savingFramework,
  responsibilitySavedAt,
  showFinalizeButton = true,
  showSaveTermsButton = true,
}) => {
  const canToggle = typeof canToggleTradeType === "boolean" ? canToggleTradeType : canEditResponsibilityPlan;
  const selectedIncoterm = incotermOptions?.find((it: any) => String(it?._id || it?.id) === String(selectedIncotermId));
  const selectedIncotermCode = String(selectedIncoterm?.code || "").toUpperCase();
  const filteredPaymentTerms = Array.isArray(paymentTermOptions)
    ? paymentTermOptions.filter((term: any) => {
        const allowed = Array.isArray(term?.applicableIncoterms) ? term.applicableIncoterms : [];
        if (!selectedIncotermCode) return true;
        if (!allowed.length) return true;
        return allowed.map((v: any) => String(v).toUpperCase()).includes(selectedIncotermCode);
      })
    : [];
  const selectedPaymentTerm = filteredPaymentTerms.find((term: any) => String(term?._id || term?.id) === String(selectedPaymentTermId))
    || paymentTermOptions?.find((term: any) => String(term?._id || term?.id) === String(selectedPaymentTermId));

  return (
    <Card className="lg:col-span-3 order-12 border border-divider bg-content1/50">
      <CardHeader className="px-6 pt-6 pb-0 flex flex-col items-start gap-1">
        <span className="font-bold text-lg tracking-tight whitespace-nowrap">Responsibility Event</span>
        <span className="text-[10px] uppercase font-black tracking-widest text-default-400">Execution Ownership Allocation</span>
      </CardHeader>
      <Divider className="mt-4" />
      <CardBody className="flex flex-col gap-10 px-6 py-6 transition-all duration-300">
        <div className="flex flex-col gap-4 p-5 rounded-3xl border border-default-200/60 bg-gradient-to-br from-default-50/60 to-white dark:from-default-100/5 dark:to-transparent shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-default-400">Trade Terms</span>
              <span className="text-base font-black text-foreground">Incoterms & Payment</span>
            </div>
            {showSaveTermsButton && (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  isDisabled={!canEditResponsibilityPlan || !isTradeTermsChanged || isReadOnlyAfterConversion}
                  isLoading={Boolean(savingTradeTerms)}
                  onPress={() => onSaveTradeTerms && onSaveTradeTerms()}
                  className="font-bold"
                >
                  Save Terms
                </Button>
                {tradeTermsSavedAt && (
                  <span className="text-xs text-default-400">
                    Saved {dayjs(tradeTermsSavedAt).format("DD MMM, HH:mm")}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              size="sm"
              label="Incoterm Protocol"
              variant="bordered"
              selectedKeys={selectedIncotermId ? [selectedIncotermId] : []}
              onSelectionChange={(keys) => {
                const arr = Array.from(keys as Set<string>);
                setSelectedIncotermId((arr[0] as string) || "");
              }}
              isDisabled={!canEditResponsibilityPlan || isReadOnlyAfterConversion}
              classNames={{ trigger: "rounded-2xl border-default-200 h-10 shadow-sm", label: "font-black uppercase text-[10px] tracking-widest text-default-400" }}
              startContent={<LuAnchor size={16} className="text-primary/70" />}
            >
              {incotermOptions.map((item: any) => (
                <SelectItem key={item._id} value={item._id}>
                  {[item.code, item.name].filter(Boolean).join(" — ")}
                </SelectItem>
              ))}
            </Select>

            <Select
              size="sm"
              label="Payment Framework"
              variant="bordered"
              selectedKeys={selectedPaymentTermId ? [selectedPaymentTermId] : []}
              onSelectionChange={(keys) => {
                const arr = Array.from(keys as Set<string>);
                setSelectedPaymentTermId((arr[0] as string) || "");
              }}
              isDisabled={!canEditResponsibilityPlan || isReadOnlyAfterConversion}
              classNames={{ trigger: "rounded-2xl border-default-200 h-10 shadow-sm", label: "font-black uppercase text-[10px] tracking-widest text-default-400" }}
              startContent={<LuFileCheck size={16} className="text-success/70" />}
            >
              {(filteredPaymentTerms.length > 0 ? filteredPaymentTerms : paymentTermOptions).map((item: any) => (
                <SelectItem key={item._id} value={item._id}>
                  {item.label || "Payment Term"}
                </SelectItem>
              ))}
            </Select>
          </div>
          {selectedPaymentTerm && Array.isArray(selectedPaymentTerm?.milestones) && selectedPaymentTerm.milestones.length > 0 && (
            <div className="mt-3 rounded-2xl border border-default-200/60 bg-background/60 p-3">
              <div className="text-[10px] uppercase font-black tracking-widest text-default-400 mb-2">Payment Framework Milestones</div>
              <div className="flex flex-col gap-2">
                {selectedPaymentTerm.milestones.map((milestone: any, idx: number) => (
                  <div
                    key={`${milestone.label}-${idx}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-divider px-3 py-2 bg-background/40"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-foreground uppercase tracking-tight">{milestone.label}</span>
                      <span className="text-[11px] text-default-500">
                        {String(milestone.triggerType || "").toUpperCase() === "STAGE"
                          ? `Stage: ${String(milestone.triggerValue || "").replaceAll("_", " ")}`
                          : `Doc: ${String(milestone.triggerValue || "").replaceAll("_", " ")}`}
                      </span>
                    </div>
                    <span className="text-xs font-black text-default-600">{Number(milestone.percent || 0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8 p-6 rounded-3xl border border-default-200/60 bg-gradient-to-br from-default-50/50 to-white dark:from-default-100/5 dark:to-transparent relative overflow-hidden group shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none rotate-12 group-hover:rotate-0 duration-700">
            <LuNavigation size={140} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 border-b border-divider/50 pb-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-foreground inline-flex items-center gap-2 tracking-tighter">
                <LuNavigation className="text-primary" size={20} />
                Execution Context
              </h3>
              <p className="text-xs text-default-500 font-bold tracking-tight uppercase opacity-70">Logistics Parameters & Trade Type</p>
            </div>
            <div className="bg-default-200/50 dark:bg-black/40 p-1.5 rounded-2xl gap-1.5 border border-default-300/40 flex self-start md:self-center shadow-inner md:mr-4">
              {["DOMESTIC", "INTERNATIONAL"].map((type) => {
                const isSelected = executionContext.tradeType === type;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      if (canToggle) {
                        const value = type as "DOMESTIC" | "INTERNATIONAL";
                        setExecutionContext((prev: any) => ({
                          ...prev,
                          tradeType: value,
                          ...(value === "DOMESTIC"
                            ? { originCountry: "", destinationCountry: "", originPort: "", destinationPort: "" }
                            : { originState: "", destinationState: "", originDistrict: "", destinationDistrict: "" }),
                        }));
                      }
                    }}
                    disabled={!canToggle}
                    className={`px-6 h-9 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${isSelected
                      ? "bg-white dark:bg-default-200 text-primary shadow-xl scale-[1.05] z-10 ring-1 ring-black/5"
                      : "text-default-500 hover:text-default-700 hover:bg-white/40 dark:hover:bg-default-200/20"
                      } ${!canToggle ? "opacity-30 cursor-not-allowed grayscale" : "cursor-pointer"}`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {executionContext.tradeType === "DOMESTIC" ? (
              <>
                {showOriginLogisticsFields && (
                  <div className="flex flex-col gap-5 p-5 rounded-2xl border border-white/60 dark:border-default-200/20 bg-white/40 dark:bg-black/10 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <LuMapPin size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-default-400 leading-none mb-1">Domestic Origin</span>
                        <span className="text-base font-black text-foreground tracking-tighter">Ship From</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select
                        size="sm"
                        label="State"
                        variant="bordered"
                        classNames={{ trigger: "rounded-2xl border-default-200 h-10 shadow-sm", label: "font-black uppercase text-[10px] tracking-widest text-default-400" }}
                        selectedKeys={executionContext.originState ? [executionContext.originState] : []}
                        onSelectionChange={(keys) => {
                          const arr = Array.from(keys as Set<string>);
                          const value = (arr[0] as string) || "";
                          setExecutionContext((prev: any) => ({
                            ...prev,
                            originState: value,
                            originDistrict: "",
                          }));
                        }}
                        isDisabled={!canEditOriginLogistics}
                      >
                        {states.map((item: any) => (
                          <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                        ))}
                      </Select>
                      <Select
                        size="sm"
                        label="District"
                        variant="bordered"
                        classNames={{ trigger: "rounded-2xl border-default-200 h-10 shadow-sm", label: "font-black uppercase text-[10px] tracking-widest text-default-400" }}
                        selectedKeys={executionContext.originDistrict ? [executionContext.originDistrict] : []}
                        onSelectionChange={(keys) => {
                          const arr = Array.from(keys as Set<string>);
                          setExecutionContext((prev: any) => ({ ...prev, originDistrict: (arr[0] as string) || "" }));
                        }}
                        isDisabled={!canEditOriginLogistics || !executionContext.originState}
                      >
                        {originDistrictOptions.map((item: any) => (
                          <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}
                {showDestinationLogisticsFields && (
                  <div className="flex flex-col gap-5 p-5 rounded-2xl border border-white/60 dark:border-default-200/20 bg-white/40 dark:bg-black/10 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                        <LuNavigation size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-default-400 leading-none mb-1">Domestic Destination</span>
                        <span className="text-base font-black text-foreground tracking-tighter">Ship To</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select
                        size="sm"
                        label="State"
                        variant="bordered"
                        classNames={{ trigger: "rounded-2xl border-default-200 h-10 shadow-sm", label: "font-black uppercase text-[10px] tracking-widest text-default-400" }}
                        selectedKeys={executionContext.destinationState ? [executionContext.destinationState] : []}
                        onSelectionChange={(keys) => {
                          const arr = Array.from(keys as Set<string>);
                          const value = (arr[0] as string) || "";
                          setExecutionContext((prev: any) => ({
                            ...prev,
                            destinationState: value,
                            destinationDistrict: "",
                          }));
                        }}
                        isDisabled={!canEditDestinationLogistics}
                      >
                        {states.map((item: any) => (
                          <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                        ))}
                      </Select>
                      <Select
                        size="sm"
                        label="District"
                        variant="bordered"
                        classNames={{ trigger: "rounded-2xl border-default-200 h-10 shadow-sm", label: "font-black uppercase text-[10px] tracking-widest text-default-400" }}
                        selectedKeys={executionContext.destinationDistrict ? [executionContext.destinationDistrict] : []}
                        onSelectionChange={(keys) => {
                          const arr = Array.from(keys as Set<string>);
                          setExecutionContext((prev: any) => ({ ...prev, destinationDistrict: (arr[0] as string) || "" }));
                        }}
                        isDisabled={!canEditDestinationLogistics || !executionContext.destinationState}
                      >
                        {destinationDistrictOptions.map((item: any) => (
                          <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {showOriginLogisticsFields && (
                  <div className="flex flex-col gap-5 p-5 rounded-2xl border border-white/60 dark:border-default-200/20 bg-white/40 dark:bg-black/10 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <LuMapPin size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-default-400 leading-none mb-1">Origin Country</span>
                        <span className="text-base font-black text-foreground tracking-tighter">Ship From</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select
                        size="sm"
                        label="Country"
                        variant="bordered"
                        classNames={{ trigger: "rounded-2xl border-default-200 h-10 shadow-sm", label: "font-black uppercase text-[10px] tracking-widest text-default-400" }}
                        selectedKeys={executionContext.originCountry ? [executionContext.originCountry] : []}
                        onSelectionChange={(keys) => {
                          const arr = Array.from(keys as Set<string>);
                          const value = (arr[0] as string) || "";
                          setExecutionContext((prev: any) => ({
                            ...prev,
                            originCountry: value,
                            originPort: "",
                          }));
                        }}
                        isDisabled={!canEditOriginLogistics}
                      >
                        {originCountryOptions.map((item: any) => (
                          <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                        ))}
                      </Select>
                      <Select
                        size="sm"
                        label="Port of Origin"
                        variant="bordered"
                        classNames={{ trigger: "rounded-2xl border-default-200 h-10 shadow-sm", label: "font-black uppercase text-[10px] tracking-widest text-default-400" }}
                        selectedKeys={executionContext.originPort ? [executionContext.originPort] : []}
                        onSelectionChange={(keys) => {
                          const arr = Array.from(keys as Set<string>);
                          setExecutionContext((prev: any) => ({ ...prev, originPort: (arr[0] as string) || "" }));
                        }}
                        isDisabled={!canEditOriginLogistics || !executionContext.originCountry}
                        startContent={<LuAnchor size={16} className="text-primary/60" />}
                      >
                        {originPortOptions.map((item: any) => (
                          <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}
                {showDestinationLogisticsFields && (
                  <div className="flex flex-col gap-5 p-5 rounded-2xl border border-white/60 dark:border-default-200/20 bg-white/40 dark:bg-black/10 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                        <LuNavigation size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-default-400 leading-none mb-1">Destination Country</span>
                        <span className="text-base font-black text-foreground tracking-tighter">Ship To</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select
                        size="sm"
                        label="Country"
                        variant="bordered"
                        classNames={{ trigger: "rounded-2xl border-default-200 h-10 shadow-sm", label: "font-black uppercase text-[10px] tracking-widest text-default-400" }}
                        selectedKeys={executionContext.destinationCountry ? [executionContext.destinationCountry] : []}
                        onSelectionChange={(keys) => {
                          const arr = Array.from(keys as Set<string>);
                          const value = (arr[0] as string) || "";
                          setExecutionContext((prev: any) => ({
                            ...prev,
                            destinationCountry: value,
                            destinationPort: "",
                          }));
                        }}
                        isDisabled={!canEditDestinationLogistics}
                      >
                        {destinationCountryOptions.map((item: any) => (
                          <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                        ))}
                      </Select>
                      <Select
                        size="sm"
                        label="Port of Arrival"
                        variant="bordered"
                        classNames={{ trigger: "rounded-2xl border-default-200 h-10 shadow-sm", label: "font-black uppercase text-[10px] tracking-widest text-default-400" }}
                        selectedKeys={executionContext.destinationPort ? [executionContext.destinationPort] : []}
                        onSelectionChange={(keys) => {
                          const arr = Array.from(keys as Set<string>);
                          setExecutionContext((prev: any) => ({ ...prev, destinationPort: (arr[0] as string) || "" }));
                        }}
                        isDisabled={!canEditDestinationLogistics || !executionContext.destinationCountry}
                        startContent={<LuAnchor size={16} className="text-secondary/60" />}
                      >
                        {destinationPortOptions.map((item: any) => (
                          <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {responsibilityFieldConfig
              .filter((field) => field.show !== false)
              .map((field) => {
                const currentValue = (responsibilityPlan as any)[field.key] || "";
                const allowed = field.allowed || [];
                return (
                  <div key={field.key} className="flex flex-col gap-4 p-4 rounded-2xl border border-white dark:border-default-200/10 bg-white/60 dark:bg-black/20 shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 border border-primary-100/30 shadow-inner">
                        {React.cloneElement(field.icon, { size: 18 })}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black text-foreground/90 uppercase tracking-widest leading-none mb-1">{field.label}</span>
                        <span className="text-[8px] text-default-400 font-bold uppercase tracking-tighter opacity-70">Step Owner Selection</span>
                      </div>
                    </div>

                    <div className="bg-default-100/80 dark:bg-black/40 p-1 rounded-2xl border border-default-200/50 flex gap-1 relative overflow-hidden h-10 w-full">
                      {allowed.map((option: string) => {
                        const isSelected = currentValue === option;
                        const canSelect = canEditResponsibilityPlan && (allowed.length > 1 || !isSelected);
                        return (
                          <button
                            key={option}
                            onClick={() => {
                              if (canSelect) {
                                setResponsibilityPlan((prev: any) => ({ ...prev, [field.key]: option as any }));
                              }
                            }}
                            disabled={!canSelect}
                            className={`relative flex-1 flex items-center justify-center gap-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 z-10
                              ${isSelected ? "text-white" : "text-default-400 hover:text-default-700"}
                              ${!canSelect && !isSelected ? "opacity-30 cursor-not-allowed grayscale" : "cursor-pointer"}
                            `}
                          >
                            <AnimatePresence>
                                {isSelected && (
                                    <motion.div
                                        layoutId={`active-bg-${field.key}`}
                                        className={`absolute inset-0 rounded-xl ${getOwnerStyles(option)} z-0`}
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                                    />
                                )}
                            </AnimatePresence>
                            <span className="relative z-10 flex items-center gap-1.5 px-2">
                                {getOwnerIcons(option)}
                                {ownerLabelByKey[option] || option}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="flex flex-col gap-4 p-4 rounded-2xl border border-default-200/60 bg-default-50/40 dark:bg-default-100/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-foreground">Inland Transportation Segments</span>
                <span className="text-[11px] text-default-500 font-semibold">Add each inland leg that should run on this order.</span>
              </div>
              {canEditResponsibilityPlan && (
                <Button
                  size="sm"
                  variant="flat"
                  className="font-black"
                  onPress={() => setInlandTransportSegments((prev: any) => ([...prev, { label: "", from: "", to: "" }]))}
                >
                  Add Segment
                </Button>
              )}
            </div>
            {inlandTransportSegments.length === 0 ? (
              <div className="text-xs text-default-500 font-semibold">No inland transport segments added.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {inlandTransportSegments.map((segment, index) => (
                  <div key={`segment-${index}`} className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr_auto] gap-3 items-end">
                    <Input
                      size="sm"
                      variant="bordered"
                      label="Segment label"
                      value={segment.label}
                      onValueChange={(value) => {
                        setInlandTransportSegments((prev: any) =>
                          prev.map((item: any, idx: number) => idx === index ? { ...item, label: value } : item)
                        );
                      }}
                      isDisabled={!canEditResponsibilityPlan || isReadOnlyAfterConversion}
                    />
                    <Input
                      size="sm"
                      variant="bordered"
                      label="From"
                      value={segment.from}
                      onValueChange={(value) => {
                        setInlandTransportSegments((prev: any) =>
                          prev.map((item: any, idx: number) => idx === index ? { ...item, from: value } : item)
                        );
                      }}
                      isDisabled={!canEditResponsibilityPlan || isReadOnlyAfterConversion}
                    />
                    <Input
                      size="sm"
                      variant="bordered"
                      label="To"
                      value={segment.to}
                      onValueChange={(value) => {
                        setInlandTransportSegments((prev: any) =>
                          prev.map((item: any, idx: number) => idx === index ? { ...item, to: value } : item)
                        );
                      }}
                      isDisabled={!canEditResponsibilityPlan || isReadOnlyAfterConversion}
                    />
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      className="font-black"
                      onPress={() => setInlandTransportSegments((prev: any) => prev.filter((_: any, idx: number) => idx !== index))}
                      isDisabled={!canEditResponsibilityPlan || isReadOnlyAfterConversion}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isInternational && showCargoInsuranceNote && (
            <div className="rounded-[1.5rem] border border-primary-100/40 bg-primary-50/40 dark:bg-primary-900/10 px-8 py-5 text-xs text-primary-700 dark:text-primary-300 font-bold leading-relaxed flex items-center gap-5 shadow-sm">
              <div className="w-3 h-3 rounded-full bg-primary animate-ping shrink-0" />
              <p className="tracking-tight">Cargo Insurance is automatically synchronized with the owner handling Freight Forwarding & Logistics Operations.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-3xl border border-white/80 dark:border-default-200/10 bg-white/40 dark:bg-default-100/5 relative overflow-hidden shadow-sm">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-warning/10 flex items-center justify-center text-warning shadow-inner">
                <LuPackage size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400 leading-none mb-1">Product Specs</span>
                <span className="text-base font-black text-foreground tracking-tighter">Packaging Detail</span>
              </div>
            </div>
            <Textarea
              size="lg"
              variant="flat"
              value={packagingSpecifications}
              onValueChange={setPackagingSpecifications}
              isDisabled={!canEditResponsibilityPlan || isReadOnlyAfterConversion}
              minRows={4}
              placeholder="Specify packaging requirements (dimensions, weight, material, handling instructions...)"
              classNames={{
                input: "text-base font-medium",
                inputWrapper: "bg-white/80 dark:bg-black/40 border border-default-200/50 hover:bg-white focus-within:bg-white shadow-sm transition-all rounded-2xl p-4 h-auto"
              }}
            />
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <LuActivity size={20} />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-foreground">Route Notes</span>
              </div>
              <Input
                size="lg"
                variant="bordered"
                classNames={{
                  inputWrapper: "rounded-2xl border-default-200 h-14 bg-white/50 dark:bg-white/5 shadow-sm",
                  input: "font-semibold"
                }}
                placeholder="Add logistics constraints..."
                value={executionContext.routeNotes}
                onValueChange={(v) => setExecutionContext((prev: any) => ({ ...prev, routeNotes: v }))}
                isDisabled={!canEditRouteNotes}
              />
            </div>

            <div className="flex flex-col gap-4 mt-auto">
              {!hasPackagingSpecifications && (
                <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-danger-500/10 border border-danger-500/20 backdrop-blur-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-danger-500/20 blur-[30px] rounded-full -mr-10 -mt-10" />
                  <div className="w-12 h-12 rounded-xl bg-danger-500/20 flex items-center justify-center text-danger-500 shrink-0">
                    <FiAlertCircle size={24} className="animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-danger-500">Prerequisite</span>
                    <p className="text-[11px] font-semibold text-foreground opacity-80 leading-tight tracking-tight italic">Packaging specs required for order generation.</p>
                  </div>
                </div>
              )}

              {isInternational && (
                <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-warning-500/10 border border-warning-500/20 backdrop-blur-xl relative overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-warning-500/20 flex items-center justify-center text-warning-500 shrink-0">
                    <FiInfo size={24} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-warning-500">Deployment Context</span>
                    <p className="text-[11px] font-medium text-foreground opacity-80 leading-tight tracking-tight italic">Cross-border logistics and port handling protocols will be enforced.</p>
                  </div>
                </div>
              )}

              {(onSaveFramework || (showFinalizeButton && onFinalize)) && (
                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex flex-col gap-4">
                    {onSaveFramework && (
                      <div className="flex flex-col items-center gap-3">
                        <Button
                          fullWidth
                          size="lg"
                          className={`h-16 rounded-[1.5rem] font-bold uppercase tracking-widest text-[11px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all ${!isResponsibilityEventChanged && responsibilitySavedAt ? "bg-success text-white" : "bg-foreground text-background"}`}
                          isLoading={Boolean(savingFramework)}
                          isDisabled={(!isResponsibilityEventChanged && !!responsibilitySavedAt) || isReadOnlyAfterConversion}
                          onPress={() => onSaveFramework()}
                          startContent={!savingFramework && (isResponsibilityEventChanged ? <LuFileCheck size={18} /> : <LuCheck size={18} />)}
                        >
                          {!isResponsibilityEventChanged && responsibilitySavedAt ? "Workspace Synced" : "Synchronize Workspace"}
                        </Button>
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/5">
                           <div className={`w-1.5 h-1.5 rounded-full ${isResponsibilityEventChanged ? "bg-warning-500 animate-pulse" : "bg-success"}`} />
                           <span className={`text-[9px] font-bold uppercase tracking-widest italic leading-none ${isResponsibilityEventChanged ? "text-default-400" : "text-success"}`}>
                             {isResponsibilityEventChanged ? "Awaiting Synchronization" : "Workspace Synchronized"}
                           </span>
                        </div>
                      </div>
                    )}
                    {showFinalizeButton && onFinalize && (
                      <div className="flex flex-col gap-4">
                        <Button
                          size="lg"
                          fullWidth
                          color={isReadOnlyAfterConversion ? "success" : "primary"}
                          variant={isReadOnlyAfterConversion ? "flat" : "shadow"}
                          onPress={() => onFinalize()}
                          isLoading={Boolean(finalizeLoading)}
                          isDisabled={isReadOnlyAfterConversion}
                          className={`h-16 rounded-[1.75rem] font-black uppercase tracking-[0.4em] text-[11px] italic transition-all duration-500 relative overflow-hidden group/btn
                            ${isReadOnlyAfterConversion 
                              ? "bg-success/10 text-success border border-success/30 shadow-[0_0_25px_rgba(34,197,94,0.15)]" 
                              : "bg-primary text-white shadow-[0_15px_45px_rgba(37,99,235,0.3)] hover:shadow-primary/60 hover:-translate-y-1 hover:scale-[1.02]"
                            }`}
                          startContent={!finalizeLoading && (isReadOnlyAfterConversion 
                            ? <LuShieldCheck size={18} className="mr-1" /> 
                            : <LuActivity size={18} className="mr-1 group-hover/btn:animate-pulse" />
                          )}
                        >
                          {!isReadOnlyAfterConversion && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite] pointer-events-none" />}
                          {isReadOnlyAfterConversion ? "PROTOCOL LOCKED" : "FINALIZE FRAMEWORK"}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2 mt-4">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-foreground/[0.04] border border-white/5 shadow-inner">
                       <div className={`w-1.5 h-1.5 rounded-full ${isReadOnlyAfterConversion ? "bg-success animate-pulse" : "bg-warning-500 animate-pulse"} shadow-[0_0_8px_rgba(234,179,8,0.5)]`} />
                       <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40 italic">
                          {finalizeLoading || savingFramework
                            ? "PARSING PROTOCOL..."
                            : isReadOnlyAfterConversion
                              ? "EXECUTION READY"
                              : "AWAITING LOCAL SYNC"}
                       </span>
                    </div>
                    {responsibilitySavedAt && (
                       <span className="text-[8px] font-bold uppercase tracking-widest text-default-400 opacity-50">
                          LOGGED AT // {dayjs(responsibilitySavedAt).format("HH:mm:ss")}
                       </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ResponsibilityEventForm;
