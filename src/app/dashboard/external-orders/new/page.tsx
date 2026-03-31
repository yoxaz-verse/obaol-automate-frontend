"use client";

import React, { useMemo, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Divider,
  Switch,
  Textarea,
  Chip,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import Title from "@/components/titles";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import ResponsibilityEventForm from "@/components/dashboard/responsibilities/ResponsibilityEventForm";
import AuthContext from "@/context/AuthContext";
import {
  LuChevronLeft,
  LuUser,
  LuPackage,
  LuSearch,
  LuClipboardCheck,
  LuTruck,
  LuAnchor,
  LuFileCheck,
  LuTag,
  LuEye,
  LuCheck,
  LuShoppingBag,
} from "react-icons/lu";

type ResponsibilityPlan = {
  procurementBy: "buyer" | "seller" | "obaol" | "";
  certificateBy: "buyer" | "seller" | "obaol" | "";
  transportBy: "buyer" | "seller" | "obaol" | "";
  shippingBy: "buyer" | "seller" | "obaol" | "";
  packagingBy: "buyer" | "seller" | "obaol" | "";
  qualityTestingBy: "buyer" | "seller" | "obaol" | "";
  cargoInsuranceBy: "buyer" | "seller" | "obaol" | "";
  exportCustomsBy: "buyer" | "seller" | "obaol" | "";
  importCustomsBy: "buyer" | "obaol" | "";
  dutiesTaxesBy: "buyer" | "";
  portHandlingBy: "buyer" | "obaol" | "";
  destinationInlandTransportBy: "buyer" | "obaol" | "";
  destinationInspectionBy: "buyer" | "obaol" | "";
  finalDeliveryConfirmationBy: "obaol" | "";
};

type ExecutionContext = {
  tradeType: "DOMESTIC" | "INTERNATIONAL";
  originCountry: string;
  originState: string;
  originDistrict: string;
  originPort: string;
  destinationCountry: string;
  destinationState: string;
  destinationDistrict: string;
  destinationPort: string;
  routeNotes: string;
};

const parseMasterRows = (raw: any): any[] => {
  if (Array.isArray(raw?.data?.data?.data)) return raw.data.data.data;
  if (Array.isArray(raw?.data?.data?.docs)) return raw.data.data.docs;
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  if (Array.isArray(raw?.data?.docs)) return raw.data.docs;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw)) return raw;
  return [];
};

const getEntityId = (value: any): string => String(value?._id || value?.id || value || "");

export default function ExternalOrderCreatePage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<string>("");

  const [externalRole, setExternalRole] = useState("");
  const [buyerUndisclosed, setBuyerUndisclosed] = useState(false);
  const [sellerUndisclosed, setSellerUndisclosed] = useState(false);
  const [externalBuyer, setExternalBuyer] = useState({ name: "", email: "", phone: "" });
  const [externalSeller, setExternalSeller] = useState({ name: "", email: "", phone: "" });
  const [externalProduct, setExternalProduct] = useState({ name: "", variant: "", quantity: "", unit: "MT" });
  const [externalTradeType, setExternalTradeType] = useState<"DOMESTIC" | "INTERNATIONAL">("DOMESTIC");

  const [executionContext, setExecutionContext] = useState<ExecutionContext>({
    tradeType: "DOMESTIC",
    originCountry: "",
    originState: "",
    originDistrict: "",
    originPort: "",
    destinationCountry: "",
    destinationState: "",
    destinationDistrict: "",
    destinationPort: "",
    routeNotes: "",
  });
  const [responsibilityPlan, setResponsibilityPlan] = useState<ResponsibilityPlan>({
    procurementBy: "",
    certificateBy: "",
    transportBy: "",
    shippingBy: "",
    packagingBy: "",
    qualityTestingBy: "",
    cargoInsuranceBy: "",
    exportCustomsBy: "",
    importCustomsBy: "",
    dutiesTaxesBy: "",
    portHandlingBy: "",
    destinationInlandTransportBy: "",
    destinationInspectionBy: "",
    finalDeliveryConfirmationBy: "",
  });
  const [selectedIncotermId, setSelectedIncotermId] = useState<string>("");
  const [selectedPaymentTermId, setSelectedPaymentTermId] = useState<string>("");
  const [packagingSpecifications, setPackagingSpecifications] = useState<string>("");
  const [inlandTransportSegments, setInlandTransportSegments] = useState<Array<{ label: string; from: string; to: string }>>([]);
  const [responsibilitiesFinalized, setResponsibilitiesFinalized] = useState(false);
  const [finalizeLoading, setFinalizeLoading] = useState(false);

  useEffect(() => {
    if (buyerUndisclosed) {
      setExternalBuyer({ name: "Undisclosed", email: "", phone: "" });
    } else if (externalBuyer.name === "Undisclosed") {
      setExternalBuyer((prev) => ({ ...prev, name: "" }));
    }
  }, [buyerUndisclosed]);

  useEffect(() => {
    if (sellerUndisclosed) {
      setExternalSeller({ name: "Undisclosed", email: "", phone: "" });
    } else if (externalSeller.name === "Undisclosed") {
      setExternalSeller((prev) => ({ ...prev, name: "" }));
    }
  }, [sellerUndisclosed]);

  useEffect(() => {
    if (externalRole === "BUYER") {
      setSellerUndisclosed(true);
    } else if (externalRole === "SELLER") {
      setBuyerUndisclosed(true);
    } else if (externalRole === "MEDIATOR") {
      setBuyerUndisclosed(false);
      setSellerUndisclosed(false);
    }
  }, [externalRole]);

  useEffect(() => {
    if (executionContext.tradeType !== externalTradeType) {
      setExternalTradeType(executionContext.tradeType);
    }
  }, [executionContext.tradeType]);

  const { data: incotermResponse } = useQuery({
    queryKey: ["incoterms"],
    queryFn: () => getData(apiRoutes.incoterm.getAll),
  });
  const { data: paymentTermResponse } = useQuery({
    queryKey: ["payment-terms"],
    queryFn: () => getData(apiRoutes.paymentTerm.getAll),
  });
  const { data: statesResponse } = useQuery({
    queryKey: ["states"],
    queryFn: () => getData(apiRoutes.state.getAll, { page: 1, limit: 500 }),
  });
  const { data: districtsResponse } = useQuery({
    queryKey: ["districts"],
    queryFn: () => getData(apiRoutes.district.getAll, { page: 1, limit: 2000 }),
  });
  const { data: countriesResponse } = useQuery({
    queryKey: ["countries"],
    queryFn: () => getData(apiRoutes.country.getAll, { page: 1, limit: 300 }),
  });
  const { data: originPortsResponse } = useQuery({
    queryKey: ["sea-ports", "origin", executionContext.originCountry],
    queryFn: () =>
      getData(apiRoutes.enquiry.seaPorts, {
        country: executionContext.originCountry,
        page: 1,
        limit: 300,
      }),
    enabled: executionContext.tradeType === "INTERNATIONAL" && Boolean(executionContext.originCountry),
  });
  const { data: destinationPortsResponse } = useQuery({
    queryKey: ["sea-ports", "destination", executionContext.destinationCountry],
    queryFn: () =>
      getData(apiRoutes.enquiry.seaPorts, {
        country: executionContext.destinationCountry,
        page: 1,
        limit: 300,
      }),
    enabled: executionContext.tradeType === "INTERNATIONAL" && Boolean(executionContext.destinationCountry),
  });

  const incotermOptions = parseMasterRows(incotermResponse);
  const paymentTermOptions = parseMasterRows(paymentTermResponse);
  const states = parseMasterRows(statesResponse).filter((item: any) => !item?.isDeleted);
  const districts = parseMasterRows(districtsResponse).filter((item: any) => !item?.isDeleted);
  const countries = parseMasterRows(countriesResponse).filter((item: any) => !item?.isDeleted);
  const originSeaPorts = parseMasterRows(originPortsResponse).filter((item: any) => !item?.isDeleted);
  const destinationSeaPorts = parseMasterRows(destinationPortsResponse).filter((item: any) => !item?.isDeleted);

  const originDistrictOptions = districts.filter((item: any) => getEntityId(item?.state) === executionContext.originState);
  const destinationDistrictOptions = districts.filter((item: any) => getEntityId(item?.state) === executionContext.destinationState);

  const countryRowsForCheck = countries;
  const getCountryNameById = (countryId: string) =>
    countryRowsForCheck.find((c: any) => String(c?._id || c?.id || "") === String(countryId || ""))?.name || "";
  const isIndiaName = (name: string) => String(name || "").trim().toLowerCase() === "india";
  const isFromIndia = executionContext.tradeType === "INTERNATIONAL" && isIndiaName(getCountryNameById(executionContext.originCountry));
  const isToIndia = executionContext.tradeType === "INTERNATIONAL" && isIndiaName(getCountryNameById(executionContext.destinationCountry));

  const responsibilityFieldConfig = useMemo(() => {
    return [
      { key: "procurementBy", label: "Procurement / Sourcing", allowed: ["buyer", "seller", "obaol"], show: true, icon: <LuSearch size={16} /> },
      { key: "qualityTestingBy", label: "Quality Testing", allowed: ["buyer", "seller", "obaol"], show: true, icon: <LuClipboardCheck size={16} /> },
      { key: "packagingBy", label: "Packaging & Labelling", allowed: ["buyer", "seller", "obaol"], show: true, icon: <LuPackage size={16} /> },
      { key: "transportBy", label: "Inland Transportation", allowed: ["buyer", "seller", "obaol"], show: true, icon: <LuTruck size={16} /> },
      { key: "shippingBy", label: "Freight Forwarding & Shipping", allowed: ["buyer", "seller", "obaol"], show: executionContext.tradeType === "INTERNATIONAL", icon: <LuAnchor size={16} /> },
      { key: "certificateBy", label: "Certification", allowed: ["buyer", "seller", "obaol"], show: executionContext.tradeType === "INTERNATIONAL", icon: <LuFileCheck size={16} /> },
      { key: "exportCustomsBy", label: "Export Customs", allowed: ["buyer", "seller", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isFromIndia, icon: <LuFileCheck size={16} /> },
      { key: "importCustomsBy", label: "Import Customs", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuFileCheck size={16} /> },
      { key: "dutiesTaxesBy", label: "Duties & Taxes", allowed: ["buyer"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuTag size={16} /> },
      { key: "portHandlingBy", label: "Port Handling", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuAnchor size={16} /> },
      { key: "destinationInlandTransportBy", label: "Port → Warehouse Transport", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuTruck size={16} /> },
      { key: "destinationInspectionBy", label: "Destination Inspection", allowed: ["buyer", "obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuEye size={16} /> },
      { key: "finalDeliveryConfirmationBy", label: "Final Delivery Check", allowed: ["obaol"], show: executionContext.tradeType === "INTERNATIONAL" && isToIndia, icon: <LuCheck size={16} /> },
    ].filter((f) => f.show);
  }, [executionContext.tradeType, isFromIndia, isToIndia]);

  const allowedResponsibilityValues: Record<string, Set<string>> = {
    procurementBy: new Set(["buyer", "seller", "obaol"]),
    qualityTestingBy: new Set(["buyer", "seller", "obaol"]),
    packagingBy: new Set(["buyer", "seller", "obaol"]),
    transportBy: new Set(["buyer", "seller", "obaol"]),
    shippingBy: new Set(["buyer", "seller", "obaol"]),
    certificateBy: new Set(["buyer", "seller", "obaol"]),
    cargoInsuranceBy: new Set(["buyer", "seller", "obaol"]),
    exportCustomsBy: new Set(["buyer", "seller", "obaol"]),
    importCustomsBy: new Set(["buyer", "obaol"]),
    dutiesTaxesBy: new Set(["buyer"]),
    portHandlingBy: new Set(["buyer", "obaol"]),
    destinationInlandTransportBy: new Set(["buyer", "obaol"]),
    destinationInspectionBy: new Set(["buyer", "obaol"]),
    finalDeliveryConfirmationBy: new Set(["obaol"]),
  };

  const requiredResponsibilityKeys =
    executionContext.tradeType === "INTERNATIONAL"
      ? ["procurementBy", "qualityTestingBy", "packagingBy", "transportBy", "shippingBy", "certificateBy"]
      : ["procurementBy", "qualityTestingBy", "packagingBy", "transportBy"];

  const hasFullResponsibilityPlan = requiredResponsibilityKeys.every((key) =>
    allowedResponsibilityValues[key]?.has(String((responsibilityPlan as any)[key] || ""))
  );
  const hasPackagingSpecifications = Boolean(String(packagingSpecifications || "").trim());

  const isExecutionContextValid = (() => {
    if (executionContext.tradeType === "DOMESTIC") {
      return Boolean(
        executionContext.originState &&
        executionContext.originDistrict &&
        executionContext.destinationState &&
        executionContext.destinationDistrict
      );
    }
    return Boolean(
      executionContext.originCountry &&
      executionContext.originPort &&
      executionContext.destinationCountry &&
      executionContext.destinationPort
    );
  })();

  const handleFinalizeResponsibilities = async () => {
    if (!hasPackagingSpecifications || !hasFullResponsibilityPlan || !isExecutionContextValid) {
      showToastMessage({
        type: "error",
        message: "Complete responsibilities, packaging specs, and execution context before finalizing.",
        position: "top-right",
      });
      return;
    }
    setFinalizeLoading(true);
    setResponsibilitiesFinalized(true);
    setFinalizeLoading(false);
    showToastMessage({
      type: "success",
      message: "Responsibilities finalized. External order can now be initialized.",
      position: "top-right",
    });
  };

  const canSubmit =
    Boolean(externalRole) &&
    (buyerUndisclosed || externalBuyer.name.trim()) &&
    (sellerUndisclosed || externalSeller.name.trim()) &&
    externalProduct.name.trim() &&
    Number(externalProduct.quantity || 0) > 0 &&
    hasPackagingSpecifications &&
    hasFullResponsibilityPlan &&
    isExecutionContextValid &&
    responsibilitiesFinalized;

  const missingItems = [
    { key: "role", label: "Role in trade", ok: Boolean(externalRole) },
    { key: "buyer", label: "Buyer name", ok: buyerUndisclosed || Boolean(externalBuyer.name.trim()) },
    { key: "seller", label: "Seller name", ok: sellerUndisclosed || Boolean(externalSeller.name.trim()) },
    { key: "product", label: "Product + quantity", ok: Boolean(externalProduct.name.trim()) && Number(externalProduct.quantity || 0) > 0 },
    { key: "context", label: "Execution context", ok: isExecutionContextValid },
    { key: "responsibilities", label: "Responsibilities", ok: hasFullResponsibilityPlan },
    { key: "packaging", label: "Packaging specs", ok: hasPackagingSpecifications },
    { key: "finalized", label: "Finalize responsibilities", ok: responsibilitiesFinalized },
  ];
  const incompleteItems = missingItems.filter((item) => !item.ok);

  const handleSubmit = async () => {
    if (!canSubmit) {
      showToastMessage({
        type: "error",
        message: "Please complete all required fields before submitting.",
        position: "top-right",
      });
      return;
    }

    setSubmitError("");
    setSubmitSuccess("");
    setSubmitting(true);
    try {
      const responsibilitiesPayload = Object.entries(responsibilityPlan || {}).reduce(
        (acc, [key, value]) => {
          const normalized = String(value || "").trim().toLowerCase();
          if (!normalized) return acc;
          acc[key] = normalized;
          return acc;
        },
        {} as Record<string, string>
      );

      const payload = {
        externalRole,
        externalBuyer: {
          name: buyerUndisclosed ? "Undisclosed" : externalBuyer.name,
          email: buyerUndisclosed ? "" : externalBuyer.email,
          phone: buyerUndisclosed ? "" : externalBuyer.phone,
        },
        externalSeller: {
          name: sellerUndisclosed ? "Undisclosed" : externalSeller.name,
          email: sellerUndisclosed ? "" : externalSeller.email,
          phone: sellerUndisclosed ? "" : externalSeller.phone,
        },
        externalProduct: {
          name: externalProduct.name,
          variant: externalProduct.variant,
          quantity: Number(externalProduct.quantity || 0),
          unit: externalProduct.unit,
        },
        externalTradeType: executionContext.tradeType,
        executionContext,
        packagingSpecifications,
        responsibilities: responsibilitiesPayload,
        incotermId: selectedIncotermId || null,
        paymentTermId: selectedPaymentTermId || null,
      };
      const response = await postData(apiRoutes.orders.createExternal, payload);
      const orderId = response?.data?.data?._id || response?.data?.data?.id;
      if (!orderId) {
        setSubmitSuccess("External order created. Open it from the External Orders list.");
      } else {
        setSubmitSuccess("External order created successfully.");
      }
      showToastMessage({
        type: "success",
        message: "External order created successfully.",
        position: "top-right",
      });
      router.push(orderId ? `/dashboard/orders/${orderId}` : "/dashboard/external-orders");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Unable to create external order.";
      setSubmitError(message);
      showToastMessage({
        type: "error",
        message,
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="pb-20">
      <Title title="Create External Order" />
      
      <div className="w-full px-4 md:w-[96%] max-w-[1400px] mx-auto flex flex-col gap-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-6"
        >
          <Button
            variant="flat"
            className="font-black uppercase text-[10px] tracking-[0.2em] h-12 px-6 rounded-2xl bg-foreground/5"
            startContent={<LuChevronLeft size={16} />}
            onPress={() => router.push("/dashboard/external-orders")}
          >
            RETURN TO LIST
          </Button>
          <div className="flex items-center gap-3 px-4 py-2 bg-foreground/[0.03] rounded-full border border-foreground/5">
             <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
             <span className="text-[9px] font-black text-default-400 uppercase tracking-widest italic">
                OPERATIONAL MODE // {user?.role || "OPERATOR"}
             </span>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
        >
          <Card className="border-none bg-foreground/[0.02] shadow-none backdrop-blur-3xl rounded-[3rem] overflow-hidden">
            <CardHeader className="flex flex-col items-start gap-1 px-10 pt-10 pb-6">
              <h3 className="text-[11px] font-black text-warning-500 uppercase tracking-[0.4em] italic mb-1">Trade Role Selection</h3>
              <p className="text-2xl font-black text-foreground uppercase tracking-tight italic">HOW DO YOU PARTICIPATE?</p>
            </CardHeader>
            <CardBody className="px-10 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: "BUYER", icon: LuUser, sub: "BUYER SIDE REP" },
                  { id: "SELLER", icon: LuPackage, sub: "SELLER SIDE REP" },
                  { id: "MEDIATOR", icon: LuSearch, sub: "GLOBAL COORDINATOR" },
                ].map((role) => {
                  const selected = externalRole === role.id;
                  return (
                    <button
                      key={role.id}
                      className={`group relative rounded-[2rem] border p-8 text-left transition-all duration-500 overflow-hidden ${
                        selected 
                        ? "border-warning-500/30 bg-warning-500/10 shadow-[0_0_40px_rgba(234,179,8,0.1)]" 
                        : "border-foreground/5 bg-foreground/[0.02] hover:bg-foreground/[0.05] hover:border-foreground/10"
                      }`}
                      onClick={() => setExternalRole(role.id)}
                    >
                      {selected && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-warning-500/10 blur-[40px] rounded-full -mr-8 -mt-8" />
                      )}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${selected ? "bg-warning-500 text-black scale-110" : "bg-foreground/5 text-default-400 group-hover:scale-110"}`}>
                        <role.icon size={24} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-default-400 uppercase tracking-widest">{role.sub}</span>
                        <div className={`text-xl font-black uppercase tracking-tight italic transition-colors ${selected ? "text-warning-500" : "text-foreground"}`}>{role.id}</div>
                      </div>
                      <p className="text-[10px] font-bold text-default-500 uppercase mt-4 leading-relaxed opacity-60">
                         {role.id === "BUYER" ? "Primary asset acquirer and capital dispatch node." : role.id === "SELLER" ? "Asset origin and supply chain fulfillment entity." : "Cross-border operational facilitation and logistics oversight."}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none bg-foreground/[0.02] shadow-none backdrop-blur-3xl rounded-[3rem] h-full overflow-hidden">
              <CardHeader className="flex flex-col items-start gap-1 px-10 pt-10 pb-6">
                 <h3 className="text-[10px] font-black text-warning-500 uppercase tracking-[0.3em] italic mb-1">Identity Module</h3>
                 <p className="text-xl font-black text-foreground uppercase tracking-tight italic">BUYER DETAILS</p>
              </CardHeader>
              <CardBody className="px-10 pb-10 flex flex-col gap-8">
                <Switch
                  isSelected={buyerUndisclosed}
                  onValueChange={setBuyerUndisclosed}
                  classNames={{ label: "text-[10px] font-black uppercase tracking-widest text-default-400" }}
                >
                  UNDISCLOSED ENTITY
                </Switch>
                <div className="space-y-6">
                  {[
                    { label: "ENTITY NAME", key: "name", placeholder: "ENTER LEGAL ENTITY", icon: LuUser },
                    { label: "COMM CHANNEL EMAIL", key: "email", placeholder: "CONTACT@ENTITY.COM", icon: LuFileCheck },
                    { label: "VOICE ENCRYPTION ID", key: "phone", placeholder: "+X XXX XXX XXXX", icon: LuSearch },
                  ].map((field) => (
                    <Input
                      key={field.key}
                      label={field.label}
                      placeholder={field.placeholder}
                      value={(externalBuyer as any)[field.key]}
                      onValueChange={(value) => setExternalBuyer((prev) => ({ ...prev, [field.key]: value }))}
                      isDisabled={buyerUndisclosed}
                      variant="flat"
                      size="lg"
                      labelPlacement="outside"
                      classNames={{
                        input: "font-bold text-xs uppercase tracking-widest",
                        inputWrapper: "h-14 bg-foreground/5 hover:bg-foreground/10 border-none rounded-2xl transition-all",
                        label: "text-[9px] font-black uppercase tracking-[0.3em] mb-3 ml-2"
                      }}
                      startContent={<field.icon className="text-warning-500/50 mr-2" size={16} />}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-none bg-foreground/[0.02] shadow-none backdrop-blur-3xl rounded-[3rem] h-full overflow-hidden">
              <CardHeader className="flex flex-col items-start gap-1 px-10 pt-10 pb-6">
                 <h3 className="text-[10px] font-black text-warning-500 uppercase tracking-[0.3em] italic mb-1">Identity Module</h3>
                 <p className="text-xl font-black text-foreground uppercase tracking-tight italic">SELLER DETAILS</p>
              </CardHeader>
              <CardBody className="px-10 pb-10 flex flex-col gap-8">
                <Switch
                  isSelected={sellerUndisclosed}
                  onValueChange={setSellerUndisclosed}
                  classNames={{ label: "text-[10px] font-black uppercase tracking-widest text-default-400" }}
                >
                  UNDISCLOSED ENTITY
                </Switch>
                <div className="space-y-6">
                  {[
                    { label: "ENTITY NAME", key: "name", placeholder: "ENTER LEGAL ENTITY", icon: LuUser },
                    { label: "COMM CHANNEL EMAIL", key: "email", placeholder: "CONTACT@ENTITY.COM", icon: LuFileCheck },
                    { label: "VOICE ENCRYPTION ID", key: "phone", placeholder: "+X XXX XXX XXXX", icon: LuSearch },
                  ].map((field) => (
                    <Input
                      key={field.key}
                      label={field.label}
                      placeholder={field.placeholder}
                      value={(externalSeller as any)[field.key]}
                      onValueChange={(value) => setExternalSeller((prev) => ({ ...prev, [field.key]: value }))}
                      isDisabled={sellerUndisclosed}
                      variant="flat"
                      size="lg"
                      labelPlacement="outside"
                      classNames={{
                        input: "font-bold text-xs uppercase tracking-widest",
                        inputWrapper: "h-14 bg-foreground/5 hover:bg-foreground/10 border-none rounded-2xl transition-all",
                        label: "text-[9px] font-black uppercase tracking-[0.3em] mb-3 ml-2"
                      }}
                      startContent={<field.icon className="text-warning-500/50 mr-2" size={16} />}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-none bg-foreground/[0.02] shadow-none backdrop-blur-3xl rounded-[3rem] overflow-hidden">
            <CardHeader className="flex flex-col items-start gap-1 px-10 pt-10 pb-6">
               <h3 className="text-[10px] font-black text-warning-500 uppercase tracking-[0.3em] italic mb-1">Cargo Manifest</h3>
               <p className="text-xl font-black text-foreground uppercase tracking-tight italic">PRODUCT PARAMETERS</p>
            </CardHeader>
            <CardBody className="px-10 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Input
                  label="PRIMARY COMMODITY"
                  placeholder="IDENTIFY PRODUCT"
                  value={externalProduct.name}
                  onValueChange={(value) => setExternalProduct((prev) => ({ ...prev, name: value }))}
                  variant="flat" size="lg" labelPlacement="outside"
                  classNames={{ input: "font-bold text-xs uppercase tracking-widest", inputWrapper: "h-14 bg-foreground/5 border-none rounded-2xl", label: "text-[9px] font-black uppercase tracking-[0.3em] mb-3 ml-2" }}
                  startContent={<LuPackage className="text-warning-500/50 mr-2" size={16} />}
                />
                <Input
                  label="CARGO VARIANT"
                  placeholder="SPEC ID"
                  value={externalProduct.variant}
                  onValueChange={(value) => setExternalProduct((prev) => ({ ...prev, variant: value }))}
                  variant="flat" size="lg" labelPlacement="outside"
                  classNames={{ input: "font-bold text-xs uppercase tracking-widest", inputWrapper: "h-14 bg-foreground/5 border-none rounded-2xl", label: "text-[9px] font-black uppercase tracking-[0.3em] mb-3 ml-2" }}
                  startContent={<LuTag className="text-warning-500/50 mr-2" size={16} />}
                />
                <Input
                  label="PAYLOAD QUANTITY"
                  placeholder="VALUE"
                  type="number"
                  value={externalProduct.quantity}
                  onValueChange={(value) => setExternalProduct((prev) => ({ ...prev, quantity: value }))}
                  variant="flat" size="lg" labelPlacement="outside"
                  classNames={{ input: "font-bold text-xs uppercase tracking-widest", inputWrapper: "h-14 bg-foreground/5 border-none rounded-2xl", label: "text-[9px] font-black uppercase tracking-[0.3em] mb-3 ml-2" }}
                />
                <Select
                  label="METRIC UNIT"
                  variant="flat"
                  size="lg"
                  labelPlacement="outside"
                  selectedKeys={[externalProduct.unit]}
                  onSelectionChange={(keys) => {
                    const arr = Array.from(keys as Set<string>);
                    setExternalProduct((prev) => ({ ...prev, unit: (arr[0] as string) || "MT" }));
                  }}
                  classNames={{ trigger: "h-14 bg-foreground/5 border-none rounded-2xl", label: "text-[9px] font-black uppercase tracking-[0.3em] mb-3 ml-2", value: "font-bold text-xs uppercase tracking-widest" }}
                >
                  {["MT", "KG", "TON", "BAG", "BOX"].map((unit) => (
                    <SelectItem key={unit} value={unit} className="font-bold uppercase text-[10px] tracking-widest">{unit}</SelectItem>
                  ))}
                </Select>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <ResponsibilityEventForm
            incotermOptions={incotermOptions}
            paymentTermOptions={paymentTermOptions}
            selectedIncotermId={selectedIncotermId}
            setSelectedIncotermId={setSelectedIncotermId}
            selectedPaymentTermId={selectedPaymentTermId}
            setSelectedPaymentTermId={setSelectedPaymentTermId}
            isTradeTermsChanged={true}
            executionContext={executionContext}
            setExecutionContext={setExecutionContext}
            canToggleTradeType
            states={states}
            originDistrictOptions={originDistrictOptions}
            destinationDistrictOptions={destinationDistrictOptions}
            originCountryOptions={countries}
            destinationCountryOptions={countries}
            originPortOptions={originSeaPorts}
            destinationPortOptions={destinationSeaPorts}
            showOriginLogisticsFields
            showDestinationLogisticsFields
            canEditOriginLogistics
            canEditDestinationLogistics
            canEditRouteNotes
            responsibilityPlan={responsibilityPlan}
            setResponsibilityPlan={setResponsibilityPlan}
            responsibilityFieldConfig={responsibilityFieldConfig}
            canEditResponsibilityPlan
            inlandTransportSegments={inlandTransportSegments}
            setInlandTransportSegments={setInlandTransportSegments}
            packagingSpecifications={packagingSpecifications}
            setPackagingSpecifications={setPackagingSpecifications}
            hasPackagingSpecifications={hasPackagingSpecifications}
            isInternational={executionContext.tradeType === "INTERNATIONAL"}
            showCargoInsuranceNote
            isResponsibilityEventChanged={true}
            onFinalize={handleFinalizeResponsibilities}
            finalizeLoading={finalizeLoading}
            isReadOnlyAfterConversion={responsibilitiesFinalized}
            showFinalizeButton
            showSaveTermsButton={false}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
          <Card className="border-none bg-foreground/[0.04] backdrop-blur-3xl shadow-2xl rounded-[3.5rem] overflow-hidden">
            <CardBody className="px-12 py-12 flex flex-col xl:flex-row items-center justify-between gap-10">
              <div className="flex items-start gap-6 max-w-2xl">
                <div className="w-16 h-16 bg-warning-500 rounded-[2rem] flex items-center justify-center text-black shrink-0 relative">
                   <LuShoppingBag size={32} />
                   <div className="absolute inset-0 bg-warning-500 blur-2xl opacity-30 animate-pulse" />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="text-2xl font-black text-foreground uppercase tracking-tight italic leading-none">INITIALIZE EXTERNAL ORDER</div>
                  <p className="text-[10px] font-bold text-default-500 uppercase tracking-widest leading-relaxed opacity-80">
                    Routing this transaction through the global execution matrix. All responsibility mappings will be encoded into the core ledger upon initialization.
                  </p>
                  
                  <div className="flex flex-wrap gap-2.5 mt-3">
                    {missingItems.map((item) => (
                      <Chip 
                        key={item.key} 
                        size="sm" 
                        variant="flat" 
                        className={`font-black uppercase text-[8px] tracking-[0.2em] h-7 px-3 border border-current transition-all duration-500 rounded-lg ${item.ok ? "bg-success-500/5 text-success-500/60" : "bg-danger-500/10 text-danger-500 animate-pulse"}`}
                        startContent={item.ok ? <LuCheck size={10} className="mr-1" /> : <div className="w-1.5 h-1.5 rounded-full bg-danger-500 mr-2" />}
                      >
                        {item.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 w-full xl:w-auto">
                {submitError && (
                  <div className="px-4 py-3 bg-danger-500/10 border border-danger-500/20 rounded-xl text-danger-500 text-[10px] font-black uppercase tracking-widest text-center italic">
                    {submitError}
                  </div>
                )}
                <Button
                  color="warning"
                  variant="shadow"
                  className="font-black px-16 h-16 rounded-[2.5rem] text-[13px] tracking-[0.4em] uppercase italic transition-all duration-500 
                    bg-warning-500 text-black hover:scale-[1.03] active:scale-95
                    shadow-[0_20px_60px_rgba(234,179,8,0.4)] hover:shadow-warning-500/60
                    disabled:bg-foreground/5 disabled:text-default-400 disabled:shadow-none"
                  isLoading={submitting}
                  isDisabled={!canSubmit || submitting}
                  onPress={handleSubmit}
                  startContent={!submitting && <LuShoppingBag size={20} className="mr-2" />}
                >
                  {submitting ? "REDIRECTING..." : "DEPLOY MISSION ORCHESTRATION"}
                </Button>
                {submitting && (
                  <div className="text-[9px] font-black uppercase tracking-[0.35em] text-default-400 text-center italic">
                    Redirecting to order view
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
