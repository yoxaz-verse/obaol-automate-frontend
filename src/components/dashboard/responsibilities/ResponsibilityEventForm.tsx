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
} from "react-icons/lu";
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
      return "bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none translate-y-[-2px]";
    case "seller":
      return "bg-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-none translate-y-[-2px]";
    case "obaol":
      return "bg-cyan-600 text-white shadow-lg shadow-cyan-200 dark:shadow-none translate-y-[-2px]";
    default:
      return "bg-white text-primary";
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

  return (
    <Card className="lg:col-span-3 order-12 border border-divider bg-content1/50">
      <CardHeader className="px-6 pt-6 pb-0 flex flex-col items-start gap-1">
        <span className="font-bold text-lg tracking-tight">Responsibility Event</span>
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
              {paymentTermOptions.map((item: any) => (
                <SelectItem key={item._id} value={item._id}>
                  {item.label || "Payment Term"}
                </SelectItem>
              ))}
            </Select>
          </div>
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

                    <div className="grid grid-cols-3 bg-default-100/80 dark:bg-black/40 p-1.5 rounded-2xl gap-2 border border-default-200/50 relative overflow-hidden">
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
                            className={`relative flex items-center justify-center py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-500
                              ${isSelected
                                ? `${getOwnerStyles(option)} z-10`
                                : "text-default-400 hover:text-default-700 hover:bg-white dark:hover:bg-default-200/20"
                              }
                              ${!canSelect && !isSelected ? "opacity-30 cursor-not-allowed grayscale" : "cursor-pointer"}
                            `}
                          >
                            {ownerLabelByKey[option] || option}
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
                          className="h-16 rounded-[1.5rem] font-bold uppercase tracking-widest text-[11px] bg-foreground text-background shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                          isLoading={Boolean(savingFramework)}
                          isDisabled={!isResponsibilityEventChanged || isReadOnlyAfterConversion}
                          onPress={() => onSaveFramework()}
                          startContent={!savingFramework && <LuFileCheck size={18} />}
                        >
                          Synchronize Workspace
                        </Button>
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/5">
                           <div className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
                           <span className="text-[9px] font-bold text-default-400 uppercase tracking-widest italic leading-none">Awaiting Synchronization</span>
                        </div>
                      </div>
                    )}
                    {showFinalizeButton && onFinalize && (
                      <Button
                        size="lg"
                        color="primary"
                        variant="shadow"
                        onPress={() => onFinalize()}
                        isLoading={Boolean(finalizeLoading)}
                        isDisabled={isReadOnlyAfterConversion}
                        className="flex-[2] h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        startContent={!finalizeLoading && <FiCheckCircle size={20} />}
                      >
                        Finalize Framework
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 opacity-50">
                    <span className="text-[9px] font-black uppercase tracking-widest text-default-500">
                      {finalizeLoading || savingFramework
                        ? "Synchronizing..."
                        : responsibilitySavedAt
                          ? `Last Sync: ${dayjs(responsibilitySavedAt).format("DD MMM, HH:mm")}`
                          : "Awaiting sync"}
                    </span>
                    {responsibilitySavedAt && <div className="w-1 h-1 rounded-full bg-success" />}
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
