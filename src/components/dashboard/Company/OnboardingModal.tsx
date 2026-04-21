"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Button, 
  Input, 
  Select, 
  SelectItem, 
  Textarea, 
  Progress, 
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/react";
import { LuUser, LuPlus, LuCheck } from "react-icons/lu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";
import { extractList } from "@/core/data/queryUtils";
import { showToastMessage } from "@/utils/utils";
import { useContext } from "react";
import AuthContext from "@/context/AuthContext";

const EMPTY_COMBINED_ASSOCIATE_FORM = {
  name: "",
  email: "",
  phone: "",
  phoneSecondary: "",
};

const EMPTY_OPERATOR_COMPANY_FORM = {
  name: "",
  email: "",
  phone: "",
  phoneSecondary: "",
  address: "",
  geoType: "INDIAN",
  companyType: "",
  country: "",
  state: "",
  district: "",
  division: "",
  pincodeEntry: "",
  serviceCapabilities: [] as string[],
  companyFunctionPriorities: [] as string[],
};

const EMPTY_OPERATOR_ASSOCIATE_FORM = {
  name: "",
  email: "",
  phone: "",
  phoneSecondary: "",
  associateCompany: "",
};

const buildTemporaryPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const bytes = new Uint32Array(14);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((value) => chars[value % chars.length])
      .join("");
  }
  return `${Math.random().toString(36).slice(-8)}A!9`;
};

interface OnboardingFlowProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function OnboardingModal({ isOpen, onOpenChange, onSuccess }: OnboardingFlowProps) {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const roleLower = String(user?.role || "").toLowerCase();
  const isOperatorFamily = roleLower === "operator" || roleLower === "team";
  const [combinedStep, setCombinedStep] = useState<1 | 2 | 3 | 4>(1);
  const [operatorWorkspaceMode, setOperatorWorkspaceMode] = useState<"combined" | "company" | "associate">("combined");
  const [combinedAssociateForm, setCombinedAssociateForm] = useState(EMPTY_COMBINED_ASSOCIATE_FORM);
  const [operatorCompanyForm, setOperatorCompanyForm] = useState(EMPTY_OPERATOR_COMPANY_FORM);
  const [operatorAssociateForm, setOperatorAssociateForm] = useState(EMPTY_OPERATOR_ASSOCIATE_FORM);
  const [createdAssociateCredential, setCreatedAssociateCredential] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);

  // Queries for forms
  const companyTypesQuery = useQuery({
    queryKey: ["onboarding-company-types"],
    queryFn: async () => {
      const response = await getData(apiRoutes.companyType.getAll, { page: 1, limit: 100, sort: "name:asc" });
      return extractList(response);
    },
  });

  const countriesQuery = useQuery({
    queryKey: ["onboarding-countries"],
    queryFn: async () => {
      const response = await getData(apiRoutes.country.getAll, { page: 1, limit: 400, sort: "name:asc" });
      return extractList(response);
    },
  });

  const statesQuery = useQuery({
    queryKey: ["onboarding-states"],
    queryFn: async () => {
      const response = await getData(apiRoutes.state.getAll, { page: 1, limit: 100, sort: "name:asc" });
      return extractList(response);
    },
  });

  const districtsQuery = useQuery({
    queryKey: ["onboarding-districts", operatorCompanyForm.state],
    queryFn: async () => {
      const response = await getData(apiRoutes.district.getAll, {
        state: operatorCompanyForm.state,
        page: 1,
        limit: 200,
        sort: "name:asc",
      });
      return extractList(response);
    },
    enabled: Boolean(operatorCompanyForm.state),
  });

  const companyFunctionsQuery = useQuery({
    queryKey: ["onboarding-company-functions"],
    queryFn: async () => {
      const response = await getData(apiRoutes.companyFunction.getAll, {
        page: 1,
        limit: 200,
        sort: "orderIndex:asc",
      });
      return extractList(response);
    },
  });

  const assignedCompaniesQuery = useQuery({
    queryKey: ["onboarding-assigned-companies"],
    queryFn: async () => {
      const response = await getData(apiRoutes.associateCompany.getAll, {
        page: 1,
        limit: 500,
        ...(isOperatorFamily && user?.id ? { assignedOperator: user.id } : {}),
      });
      return extractList(response);
    },
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    setOperatorCompanyForm((current) => ({
      ...current,
      district: "",
      division: "",
      pincodeEntry: "",
    }));
  }, [operatorCompanyForm.state]);

  useEffect(() => {
    setOperatorCompanyForm((current) => ({
      ...current,
      division: "",
      pincodeEntry: "",
    }));
  }, [operatorCompanyForm.district]);

  const isCombinedAssociateStepValid = Boolean(
    combinedAssociateForm.name &&
    combinedAssociateForm.email &&
    combinedAssociateForm.phone
  );

  const isCompanyFormValid = Boolean(
    operatorCompanyForm.name &&
    operatorCompanyForm.email &&
    operatorCompanyForm.phone &&
    operatorCompanyForm.phoneSecondary &&
    operatorCompanyForm.companyType
  );

  const selectedFunctionIds = useMemo(
    () => (Array.isArray(operatorCompanyForm.serviceCapabilities) ? operatorCompanyForm.serviceCapabilities : []),
    [operatorCompanyForm.serviceCapabilities]
  );
  const selectedFunctionPriorities = useMemo(
    () =>
      Array.isArray(operatorCompanyForm.companyFunctionPriorities)
        ? operatorCompanyForm.companyFunctionPriorities
        : [],
    [operatorCompanyForm.companyFunctionPriorities]
  );
  const isFunctionStepValid = selectedFunctionIds.length >= 1 && selectedFunctionPriorities.length >= 1;

  const isAssociateOnlyFormValid = Boolean(
    operatorAssociateForm.name &&
    operatorAssociateForm.email &&
    operatorAssociateForm.phone &&
    operatorAssociateForm.associateCompany
  );

  const availableCompanyFunctions = useMemo(
    () =>
      (Array.isArray(companyFunctionsQuery.data) ? companyFunctionsQuery.data : [])
        .filter((fn: any) => fn?.isActive !== false)
        .sort((a: any, b: any) => Number(a?.orderIndex || 0) - Number(b?.orderIndex || 0)),
    [companyFunctionsQuery.data]
  );

  const companyFunctionNameById = useMemo(() => {
    const map = new Map<string, string>();
    availableCompanyFunctions.forEach((fn: any) => {
      const id = String(fn?._id || fn?.id || "");
      if (!id) return;
      map.set(id, String(fn?.name || "Company Function"));
    });
    return map;
  }, [availableCompanyFunctions]);

  const selectedFunctionRows = useMemo(() => {
    const selected = new Set(selectedFunctionIds.map((id) => String(id)));
    return availableCompanyFunctions.filter((fn: any) => selected.has(String(fn?._id || fn?.id || "")));
  }, [availableCompanyFunctions, selectedFunctionIds]);

  const normalizedFunctionSlugs = useMemo(() => {
    return selectedFunctionRows
      .map((fn: any) => String(fn?.slug || "").trim().toUpperCase())
      .filter(Boolean);
  }, [selectedFunctionRows]);

  const normalizedPriorityIds = useMemo(() => {
    return selectedFunctionPriorities
      .map((id) => String(id || "").trim())
      .filter((id) => selectedFunctionIds.includes(id))
      .slice(0, 3);
  }, [selectedFunctionIds, selectedFunctionPriorities]);

  const updateCompanyFunctionSelection = (functionId: string) => {
    setOperatorCompanyForm((prev) => {
      const currentIds = Array.isArray(prev.serviceCapabilities) ? prev.serviceCapabilities : [];
      const currentPriorities = Array.isArray(prev.companyFunctionPriorities) ? prev.companyFunctionPriorities : [];
      const isSelected = currentIds.includes(functionId);
      let nextIds = currentIds;
      if (isSelected) {
        nextIds = currentIds.filter((id) => id !== functionId);
      } else if (currentIds.length < 6) {
        nextIds = [...currentIds, functionId];
      }

      let nextPriorities = currentPriorities.filter((id) => nextIds.includes(id)).slice(0, 3);
      if (!isSelected && nextPriorities.length < 3 && nextIds.includes(functionId)) {
        nextPriorities = [...nextPriorities, functionId];
      }

      return {
        ...prev,
        serviceCapabilities: nextIds,
        companyFunctionPriorities: nextPriorities,
      };
    });
  };

  const moveCompanyFunctionPriority = (functionId: string, direction: "up" | "down") => {
    setOperatorCompanyForm((prev) => {
      const current = Array.isArray(prev.companyFunctionPriorities)
        ? [...prev.companyFunctionPriorities].filter((id) => prev.serviceCapabilities.includes(id))
        : [];
      const index = current.indexOf(functionId);
      if (index === -1) return prev;
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= current.length) return prev;
      const next = [...current];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return { ...prev, companyFunctionPriorities: next.slice(0, 3) };
    });
  };

  const combinedOnboardingMutation = useMutation({
    mutationFn: async () => {
      const sanitizedCompanyForm = { ...operatorCompanyForm };
      const objectIdFields = ["country", "state", "district", "division", "pincodeEntry", "companyType"];
      objectIdFields.forEach(f => { if (sanitizedCompanyForm[f as keyof typeof sanitizedCompanyForm] === "") delete sanitizedCompanyForm[f as keyof typeof sanitizedCompanyForm]; });

      const resCompany = await postData(apiRoutes.associateCompany.getAll, {
        ...sanitizedCompanyForm,
        serviceCapabilities: normalizedFunctionSlugs,
        companyFunctionPriorities: normalizedPriorityIds,
        ...(isOperatorFamily && user?.id ? { assignedOperator: user.id } : {}),
      });
      const companyId = resCompany?.data?.data?._id || resCompany?.data?.data?.id;
      if (!companyId) throw new Error("Failed to extract company ID");

      const tempPass = buildTemporaryPassword();
      const resAssociate = await postData(apiRoutes.associate.getAll, {
        ...combinedAssociateForm,
        associateCompany: companyId,
        password: tempPass,
      });
      return { payload: resAssociate?.data?.data, tempPass };
    },
    onSuccess: (data: any) => {
      setCreatedAssociateCredential({
        name: data?.payload?.name || "",
        email: data?.payload?.email || "",
        password: data?.tempPass || "Contact Admin",
      });
      showToastMessage({ type: "success", message: "Combined onboarding successful." });
      queryClient.invalidateQueries();
      onSuccess?.();
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Onboarding failed." });
    },
  });

  const operatorCreateCompanyMutation = useMutation({
    mutationFn: async () => {
      const sanitizedCompanyForm = { ...operatorCompanyForm };
      const objectIdFields = ["country", "state", "district", "division", "pincodeEntry", "companyType"];
      objectIdFields.forEach(f => { if (sanitizedCompanyForm[f as keyof typeof sanitizedCompanyForm] === "") delete sanitizedCompanyForm[f as keyof typeof sanitizedCompanyForm]; });

      return postData(apiRoutes.associateCompany.getAll, {
        ...sanitizedCompanyForm,
        serviceCapabilities: normalizedFunctionSlugs,
        companyFunctionPriorities: normalizedPriorityIds,
        ...(isOperatorFamily && user?.id ? { assignedOperator: user.id } : {}),
      });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Company protocol deployed." });
      setOperatorCompanyForm(EMPTY_OPERATOR_COMPANY_FORM);
      queryClient.invalidateQueries();
      onSuccess?.();
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Submission failed." });
    },
  });

  const operatorCreateAssociateMutation = useMutation({
    mutationFn: async () => {
      const tempPass = buildTemporaryPassword();
      const res = await postData(apiRoutes.associate.getAll, {
        ...operatorAssociateForm,
        password: tempPass,
      });
      return { payload: res?.data?.data, tempPass };
    },
    onSuccess: (data: any) => {
      setCreatedAssociateCredential({
        name: data?.payload?.name || "",
        email: data?.payload?.email || "",
        password: data?.tempPass || "Contact Admin",
      });
      showToastMessage({ type: "success", message: "Associate protocol deployed." });
      setOperatorAssociateForm(EMPTY_OPERATOR_ASSOCIATE_FORM);
      queryClient.invalidateQueries();
      onSuccess?.();
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Submission failed." });
    },
  });

  const availableCompanyTypes = companyTypesQuery.data || [];
  const locationCountries = countriesQuery.data || [];
  const locationStates = statesQuery.data || [];
  const locationDistricts = districtsQuery.data || [];
  const operatorAssignedCompanies = assignedCompaniesQuery.data || [];

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
      isDismissable={false}
      classNames={{
        base: "bg-[#0B0F14]/95 border border-divider/50 shadow-2xl rounded-[2rem] max-h-[calc(100vh-2rem)] flex flex-col",
        header: "border-b border-divider/50 py-6 px-6 md:px-10 shrink-0",
        body: "py-6 px-6 md:px-10 overflow-y-auto flex-1",
        footer: "border-t border-divider/50 py-6 px-6 md:px-10 shrink-0",
      }}
    >
      <ModalContent className="max-h-[calc(100vh-2rem)] flex flex-col">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(0,111,238,0.5)]" />
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Identity <span className="text-primary-500">Onboarding</span></h2>
                  <p className="text-[10px] text-default-500 font-bold tracking-widest uppercase">Establish new associate and company protocols</p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="space-y-8 overflow-y-auto">
              <div className="rounded-[2.5rem] border border-primary-500/20 bg-primary-500/5 p-8 space-y-8 shadow-inner relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] -z-10" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Onboard Associate + Company</h3>
                    <p className="text-[10px] text-default-500 font-bold tracking-widest uppercase mt-1">Primary combined onboarding flow</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full md:w-48">
                    <div className="flex items-center justify-between w-full px-1">
                       <span className="text-[9px] font-black uppercase text-primary-500 tracking-[0.2em] italic">Flow status</span>
                       <span className="text-[9px] font-black uppercase text-primary-500 tracking-widest italic">{combinedStep}/4</span>
                    </div>
                    <Progress value={(combinedStep / 4) * 100} size="sm" color="primary" className="h-1.5 bg-primary-500/10" classNames={{ indicator: "shadow-[0_0_10px_rgba(0,111,238,0.5)]" }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Associate", "Company", "Functions", "Review"].map((label, index) => (
                    <div
                      key={label}
                      className={`rounded-2xl border px-5 py-4 text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                        combinedStep === index + 1
                          ? "border-primary-500/50 bg-primary-500/20 text-primary-500 shadow-[0_10px_30px_rgba(0,111,238,0.15)] scale-[1.02]"
                          : combinedStep > index + 1
                          ? "border-success-500/30 bg-success-500/10 text-success-500 opacity-60"
                          : "border-divider/50 bg-content2/30 text-default-400 opacity-30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                         <span>{index + 1}. {label}</span>
                         {combinedStep > index + 1 && <div className="w-1.5 h-1.5 rounded-full bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                      </div>
                    </div>
                  ))}
                </div>

                {!createdAssociateCredential ? (
                  <>
                    <div className="rounded-[2rem] border border-divider/50 bg-content1/70 p-8 shadow-[inset_0_2px_20px_rgba(0,0,0,0.2)] backdrop-blur-md">
                      {combinedStep === 1 && (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                          <Input label="Associate Name" labelPlacement="outside" placeholder="Legal full name" variant="bordered" radius="lg" size="lg" value={combinedAssociateForm.name} onValueChange={(value) => setCombinedAssociateForm((current) => ({ ...current, name: value }))} isRequired classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", inputWrapper: "h-14 bg-default-100/50 border-divider shadow-inner" }} />
                          <Input label="Associate Email" type="email" labelPlacement="outside" placeholder="Business email protocol" variant="bordered" radius="lg" size="lg" value={combinedAssociateForm.email} onValueChange={(value) => setCombinedAssociateForm((current) => ({ ...current, email: value }))} isRequired classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", inputWrapper: "h-14 bg-default-100/50 border-divider shadow-inner" }} />
                          <Input label="Phone" labelPlacement="outside" placeholder="+X (XXX) XXX-XXXX" variant="bordered" radius="lg" size="lg" value={combinedAssociateForm.phone} onValueChange={(value) => setCombinedAssociateForm((current) => ({ ...current, phone: value }))} isRequired classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", inputWrapper: "h-14 bg-default-100/50 border-divider shadow-inner" }} />
                          <Input label="Backup Phone" labelPlacement="outside" placeholder="Recovery contact" variant="bordered" radius="lg" size="lg" value={combinedAssociateForm.phoneSecondary} onValueChange={(value) => setCombinedAssociateForm((current) => ({ ...current, phoneSecondary: value }))} classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", inputWrapper: "h-14 bg-default-100/50 border-divider shadow-inner" }} />
                        </div>
                      )}

                      {combinedStep === 2 && (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <Input label="Company Name" labelPlacement="outside" placeholder="Entity registered name" variant="bordered" radius="lg" size="lg" value={operatorCompanyForm.name} onValueChange={(value) => setOperatorCompanyForm((current) => ({ ...current, name: value }))} isRequired classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", inputWrapper: "h-14 bg-default-100/50 border-divider shadow-inner" }} />
                           <Input label="Corporate Email" type="email" labelPlacement="outside" placeholder="Billing email protocol" variant="bordered" radius="lg" size="lg" value={operatorCompanyForm.email} onValueChange={(value) => setOperatorCompanyForm((current) => ({ ...current, email: value }))} isRequired classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", inputWrapper: "h-14 bg-default-100/50 border-divider shadow-inner" }} />
                           <Input label="Desk Phone" labelPlacement="outside" placeholder="HQ contact number" variant="bordered" radius="lg" size="lg" value={operatorCompanyForm.phone} onValueChange={(value) => setOperatorCompanyForm((current) => ({ ...current, phone: value }))} isRequired classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", inputWrapper: "h-14 bg-default-100/50 border-divider shadow-inner" }} />
                           <Input label="Backup Phone" labelPlacement="outside" placeholder="Recovery contact" variant="bordered" radius="lg" size="lg" value={operatorCompanyForm.phoneSecondary} onValueChange={(value) => setOperatorCompanyForm((current) => ({ ...current, phoneSecondary: value }))} isRequired classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", inputWrapper: "h-14 bg-default-100/50 border-divider shadow-inner" }} />
                           <Select 
                            label="Entity Type" 
                            labelPlacement="outside" 
                            placeholder="Select company type" 
                            variant="bordered" 
                            radius="lg" 
                            size="lg" 
                            selectedKeys={operatorCompanyForm.companyType ? new Set([operatorCompanyForm.companyType]) : new Set()}
                            onSelectionChange={(keys) => setOperatorCompanyForm((current) => ({ ...current, companyType: String(Array.from(keys as Set<string>)[0] || "") }))}
                            isLoading={companyTypesQuery.isLoading}
                            isRequired
                            classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", trigger: "h-14 bg-default-100/50 border-divider shadow-inner" }}
                          >
                            {availableCompanyTypes.map((type: any) => (
                               <SelectItem key={type?._id || type?.id} textValue={type?.name}>{type?.name}</SelectItem>
                            ))}
                          </Select>
                           <Select 
                            label="Geo Type" 
                            labelPlacement="outside" 
                            placeholder="Select geography" 
                            variant="bordered" 
                            radius="lg" 
                            size="lg" 
                            selectedKeys={new Set([operatorCompanyForm.geoType])} 
                            onSelectionChange={(keys) => setOperatorCompanyForm((current) => ({ ...current, geoType: String(Array.from(keys as Set<string>)[0] || "INDIAN") }))} 
                            classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", trigger: "h-14 bg-default-100/50 border-divider shadow-inner" }}
                          >
                            <SelectItem key="INDIAN" value="INDIAN">Indian Market</SelectItem>
                            <SelectItem key="INTERNATIONAL" value="INTERNATIONAL">Global Market</SelectItem>
                          </Select>
                          <Textarea label="Corporate Headquarters" labelPlacement="outside" placeholder="Full physical address" minRows={2} variant="bordered" radius="lg" size="lg" value={operatorCompanyForm.address} onValueChange={(value) => setOperatorCompanyForm((current) => ({ ...current, address: value }))} className="md:col-span-2" classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", inputWrapper: "bg-default-100/50 border-divider" }} />

                          {operatorCompanyForm.geoType === "INTERNATIONAL" ? (
                            <Select label="Jurisdiction (Country)" labelPlacement="outside" variant="bordered" radius="lg" size="lg" selectedKeys={operatorCompanyForm.country ? new Set([operatorCompanyForm.country]) : new Set()} onSelectionChange={(keys) => setOperatorCompanyForm((current) => ({ ...current, country: String(Array.from(keys as Set<string>)[0] || "") }))} isLoading={countriesQuery.isLoading} classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", trigger: "h-14 bg-default-100/50 border-divider" }}>
                              {locationCountries.map((country: any) => (<SelectItem key={country?._id || country?.id}>{country?.name}</SelectItem>))}
                            </Select>
                          ) : (
                            <>
                              <Select label="State Protocol" labelPlacement="outside" variant="bordered" radius="lg" size="lg" selectedKeys={operatorCompanyForm.state ? new Set([operatorCompanyForm.state]) : new Set()} onSelectionChange={(keys) => setOperatorCompanyForm((current) => ({ ...current, state: String(Array.from(keys as Set<string>)[0] || "") }))} isLoading={statesQuery.isLoading} classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", trigger: "h-14 bg-default-100/50 border-divider" }}>
                                {locationStates.map((state: any) => (<SelectItem key={state?._id || state?.id}>{state?.name}</SelectItem>))}
                              </Select>
                              <Select label="District Unit" labelPlacement="outside" variant="bordered" radius="lg" size="lg" selectedKeys={operatorCompanyForm.district ? new Set([operatorCompanyForm.district]) : new Set()} onSelectionChange={(keys) => setOperatorCompanyForm((current) => ({ ...current, district: String(Array.from(keys as Set<string>)[0] || "") }))} isDisabled={!operatorCompanyForm.state} isLoading={districtsQuery.isLoading} classNames={{ label: "text-[10px] font-black uppercase tracking-[0.2em] text-default-500 ml-1 mb-2", trigger: "h-14 bg-default-100/50 border-divider" }}>
                                {locationDistricts.map((district: any) => (<SelectItem key={district?._id || district?.id}>{district?.name}</SelectItem>))}
                              </Select>
                            </>
                          )}
                        </div>
                      )}

                      {combinedStep === 3 && (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500">Select Company Functions</h4>
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-default-500">
                              {selectedFunctionIds.length}/6 selected
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {companyFunctionsQuery.isLoading ? (
                              <div className="md:col-span-2 py-6 flex items-center justify-center text-default-400">
                                <Spinner size="sm" />
                              </div>
                            ) : (
                              availableCompanyFunctions.map((fn: any) => {
                                const functionId = String(fn?._id || fn?.id || "");
                                const isSelected = selectedFunctionIds.includes(functionId);
                                const isDisabled = !isSelected && selectedFunctionIds.length >= 6;
                                const priorityIndex = selectedFunctionPriorities.indexOf(functionId);
                                return (
                                  <button
                                    key={functionId}
                                    type="button"
                                    onClick={() => updateCompanyFunctionSelection(functionId)}
                                    disabled={isDisabled}
                                    className={`rounded-2xl border p-4 text-left transition-all ${
                                      isSelected
                                        ? "border-primary-500/40 bg-primary-500/10"
                                        : "border-divider/60 bg-content2/20 hover:border-primary-500/20"
                                    } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-xs font-black uppercase tracking-tight text-foreground">
                                        {String(fn?.name || "Company Function")}
                                      </span>
                                      {priorityIndex >= 0 ? (
                                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.12em]">
                                          P{priorityIndex + 1}
                                        </span>
                                      ) : null}
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                          <div className="rounded-2xl border border-divider/60 bg-content2/20 p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500 mb-3">Top Priorities (max 3)</p>
                            {selectedFunctionPriorities.length ? (
                              <div className="space-y-2">
                                {selectedFunctionPriorities.map((id, index) => (
                                  <div key={id} className="flex items-center justify-between rounded-xl border border-divider/50 bg-content1/40 px-3 py-2">
                                    <span className="text-[11px] font-bold text-foreground">
                                      {index + 1}. {companyFunctionNameById.get(id) || "Selected function"}
                                    </span>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="flat"
                                        isDisabled={index === 0}
                                        onPress={() => moveCompanyFunctionPriority(id, "up")}
                                      >
                                        Up
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="flat"
                                        isDisabled={index === selectedFunctionPriorities.length - 1}
                                        onPress={() => moveCompanyFunctionPriority(id, "down")}
                                      >
                                        Down
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-default-500">Select functions to set priority order.</p>
                            )}
                          </div>
                          {!isFunctionStepValid ? (
                            <p className="text-[11px] text-danger-400">
                              Select at least 1 function and set priority order (max 3 priorities).
                            </p>
                          ) : null}
                        </div>
                      )}

                      {combinedStep === 4 && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-[1.5rem] border border-primary-500/20 bg-primary-500/5 p-6 space-y-4">
                              <h4 className="text-[10px] font-black uppercase text-primary-500 tracking-[0.3em] italic mb-2">Associate Protocol Summary</h4>
                              <div className="space-y-3">
                                <div><p className="text-[9px] font-black text-default-400 uppercase tracking-widest leading-none mb-1">Identity</p><p className="text-sm font-black text-foreground italic uppercase tracking-tighter">{combinedAssociateForm.name}</p></div>
                                <div><p className="text-[9px] font-black text-default-400 uppercase tracking-widest leading-none mb-1">Contact</p><p className="text-[11px] font-bold text-default-500">{combinedAssociateForm.email} • {combinedAssociateForm.phone}</p></div>
                              </div>
                            </div>
                            <div className="rounded-[1.5rem] border border-warning-500/20 bg-warning-500/5 p-6 space-y-4">
                              <h4 className="text-[10px] font-black uppercase text-warning-500 tracking-[0.3em] italic mb-2">Company Entity Summary</h4>
                              <div className="space-y-3">
                                <div><p className="text-[9px] font-black text-default-400 uppercase tracking-widest leading-none mb-1">Entity</p><p className="text-sm font-black text-foreground italic uppercase tracking-tighter">{operatorCompanyForm.name}</p></div>
                                <div><p className="text-[9px] font-black text-default-400 uppercase tracking-widest leading-none mb-1">Contact</p><p className="text-[11px] font-bold text-default-500">{operatorCompanyForm.email} • {operatorCompanyForm.phone}</p></div>
                                <div><p className="text-[9px] font-black text-default-400 uppercase tracking-widest leading-none mb-1">Selected Functions</p><p className="text-[11px] font-bold text-default-500">{selectedFunctionRows.map((row: any) => String(row?.name || "")).filter(Boolean).join(", ") || "None selected"}</p></div>
                                <div><p className="text-[9px] font-black text-default-400 uppercase tracking-widest leading-none mb-1">Priority Order</p><p className="text-[11px] font-bold text-default-500">{normalizedPriorityIds.map((id, idx) => `${idx + 1}. ${companyFunctionNameById.get(id) || "Function"}`).join(" | ") || "No priority set"}</p></div>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 rounded-2xl border border-primary-500/20 bg-primary-500/10 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <p className="text-[11px] font-black uppercase italic text-primary-500 tracking-[0.25em]">Awaiting execution deployment on submit</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <Button variant="light" isDisabled={combinedStep === 1} onPress={() => setCombinedStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 | 4 : prev))} className="font-black uppercase text-[10px] tracking-widest italic h-12 px-10 rounded-2xl">Previous Step</Button>
                      <div className="flex gap-4">
                        {combinedStep < 4 ? (
                          <Button color="primary" isDisabled={(combinedStep === 1 && !isCombinedAssociateStepValid) || (combinedStep === 2 && !isCompanyFormValid) || (combinedStep === 3 && !isFunctionStepValid)} onPress={() => setCombinedStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)} className="font-black uppercase text-[10px] tracking-widest h-12 px-12 rounded-2xl shadow-[0_10px_40px_-5px_rgba(0,111,238,0.3)] bg-gradient-to-tr from-primary-600 to-primary-400">Continue Discovery</Button>
                        ) : (
                          <Button color="primary" isLoading={combinedOnboardingMutation.isPending} isDisabled={!isCombinedAssociateStepValid || !isCompanyFormValid || !isFunctionStepValid} onPress={() => combinedOnboardingMutation.mutate()} className="font-black uppercase text-[11px] tracking-widest italic h-12 px-14 rounded-2xl bg-primary-600 shadow-[0_20px_50px_-5px_rgba(0,111,238,0.4)]">Activate Protocol Deployment</Button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-12 rounded-[3.5rem] border border-success-500/30 bg-success-500/5 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-success-500/50 to-transparent" />
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-success-500/10 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-success-500/10 rounded-full blur-[100px]" />
                    
                    <div className="w-24 h-24 rounded-[3rem] bg-gradient-to-br from-success-500/30 to-success-500/10 flex items-center justify-center text-success-500 shadow-[0_0_80px_-10px_rgba(34,197,94,0.5)] border border-success-500/40 relative z-10">
                      <LuCheck size={48} className="drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    </div>
                    
                    <div className="relative z-10 max-w-lg">
                      <h3 className="text-4xl font-black italic uppercase tracking-tighter text-success-500 leading-tight">Operation Successful</h3>
                      <p className="text-[12px] text-default-500 font-bold uppercase tracking-[0.4em] mt-3 opacity-60">Identity & Entity protocols fully deployed to baseline</p>
                    </div>

                    <div className="group relative z-10 max-w-md w-full p-10 rounded-[3rem] border border-success-500/20 bg-black/60 backdrop-blur-3xl shadow-2xl space-y-8 transition-all hover:border-success-500/40">
                      <div className="flex items-center justify-between border-b border-divider/50 pb-5">
                        <span className="text-[10px] font-black uppercase text-default-500 tracking-[0.3em]">Protocol Hash</span>
                        <span className="text-[10px] font-black uppercase text-success-500 tracking-[0.3em] italic">Combined-Init-01</span>
                      </div>
                      
                      <div className="space-y-6 text-left">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-default-500 tracking-[0.25em]">Identity Agent</p>
                          <p className="text-lg font-black text-foreground italic uppercase tracking-tight">{createdAssociateCredential.name}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase text-default-500 tracking-[0.25em]">Registry ID</p>
                          <p className="text-sm font-bold text-default-400 font-mono">{createdAssociateCredential.email}</p>
                        </div>
                        
                        <div className="p-5 rounded-2xl border border-success-500/30 bg-success-500/5 cursor-pointer hover:bg-success-500/10 transition-all group/cred active:scale-[0.98]" onClick={() => {
                          navigator.clipboard.writeText(createdAssociateCredential.password);
                          showToastMessage({ type: "success", message: "Security token copied to clipboard." });
                        }}>
                          <div className="flex items-center justify-between mb-2">
                             <p className="text-[9px] font-black uppercase text-success-500 tracking-[0.3em]">Temporary Access Token</p>
                             <div className="flex items-center gap-1 opacity-40 group-hover/cred:opacity-100 transition-opacity">
                               <LuCheck size={12} className="text-success-500" />
                               <span className="text-[8px] font-black uppercase tracking-tighter">Copy Code</span>
                             </div>
                          </div>
                          <p className="text-2xl font-black text-success-500 italic tracking-[0.25em] font-mono drop-shadow-[0_0_5px_rgba(34,197,94,0.3)]">{createdAssociateCredential.password}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 relative z-10 flex flex-col items-center gap-6">
                      <p className="text-[10px] text-default-500 font-black uppercase tracking-[0.5em] animate-pulse italic">Secure credentials and terminate modal</p>
                      <Button color="success" onPress={onClose} className="font-black uppercase text-[11px] tracking-[0.3em] h-14 px-16 rounded-2xl bg-gradient-to-tr from-success-600 to-success-400 text-white shadow-[0_20px_50px_-10px_rgba(34,197,94,0.4)] hover:shadow-none transition-all italic">Return to Mission Control</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Standalone protocols - Hidden on success */}
              {!createdAssociateCredential && (
                <div className="space-y-6">
                <div className="flex items-center gap-6">
                   <h3 className="text-sm font-black uppercase italic tracking-[0.25em] text-default-400">Alternative Protocol Pathways</h3>
                   <div className="flex-1 h-px bg-gradient-to-r from-divider via-divider/20 to-transparent" />
                </div>
                
                <div className="flex flex-wrap gap-3">
                   <Button variant={operatorWorkspaceMode === "company" ? "solid" : "flat"} color={operatorWorkspaceMode === "company" ? "primary" : "default"} onPress={() => setOperatorWorkspaceMode(m => m === "company" ? "combined" : "company")} className={`font-black uppercase text-[10px] tracking-widest px-8 h-10 rounded-2xl transition-all ${operatorWorkspaceMode === "company" ? "shadow-lg shadow-primary-500/30" : "opacity-60"}`}>Isolated Company</Button>
                   <Button variant={operatorWorkspaceMode === "associate" ? "solid" : "flat"} color={operatorWorkspaceMode === "associate" ? "secondary" : "default"} onPress={() => setOperatorWorkspaceMode(m => m === "associate" ? "combined" : "associate")} className={`font-black uppercase text-[10px] tracking-widest px-8 h-10 rounded-2xl transition-all ${operatorWorkspaceMode === "associate" ? "shadow-lg shadow-secondary-500/30" : "opacity-60"}`}>Isolated Associate</Button>
                </div>

                {operatorWorkspaceMode === "company" && (
                  <div className="p-8 rounded-[2rem] border border-divider/50 bg-content2/30 space-y-6 shadow-inner">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-4 bg-primary-500 rounded-full" />
                       <h4 className="text-xs font-black uppercase italic text-foreground tracking-widest">Isolated Company Initialization</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input label="Entity Name" labelPlacement="outside" variant="bordered" radius="lg" size="lg" value={operatorCompanyForm.name} onValueChange={(v) => setOperatorCompanyForm(c => ({...c, name: v}))} isRequired classNames={{ inputWrapper: "h-14 bg-content1/50 border-divider shadow-inner", label: "text-[9px] font-black uppercase text-default-500 tracking-widest ml-1 mb-2" }} />
                       <Input label="Entity Email" labelPlacement="outside" variant="bordered" radius="lg" size="lg" value={operatorCompanyForm.email} onValueChange={(v) => setOperatorCompanyForm(c => ({...c, email: v}))} isRequired classNames={{ inputWrapper: "h-14 bg-content1/50 border-divider shadow-inner", label: "text-[9px] font-black uppercase text-default-500 tracking-widest ml-1 mb-2" }} />
                       <Input label="Desk Phone" labelPlacement="outside" variant="bordered" radius="lg" size="lg" value={operatorCompanyForm.phone} onValueChange={(v) => setOperatorCompanyForm(c => ({...c, phone: v}))} isRequired classNames={{ inputWrapper: "h-14 bg-content1/50 border-divider shadow-inner", label: "text-[9px] font-black uppercase text-default-500 tracking-widest ml-1 mb-2" }} />
                       <Input label="Backup Phone" labelPlacement="outside" variant="bordered" radius="lg" size="lg" value={operatorCompanyForm.phoneSecondary} onValueChange={(v) => setOperatorCompanyForm(c => ({...c, phoneSecondary: v}))} isRequired classNames={{ inputWrapper: "h-14 bg-content1/50 border-divider shadow-inner", label: "text-[9px] font-black uppercase text-default-500 tracking-widest ml-1 mb-2" }} />
                       <Select 
                        label="Entity Type" 
                        labelPlacement="outside" 
                        variant="bordered" 
                        radius="lg" 
                        size="lg" 
                        selectedKeys={operatorCompanyForm.companyType ? new Set([operatorCompanyForm.companyType]) : new Set()}
                        onSelectionChange={(keys) => setOperatorCompanyForm((current) => ({ ...current, companyType: String(Array.from(keys as Set<string>)[0] || "") }))}
                        isLoading={companyTypesQuery.isLoading}
                        isRequired
                        classNames={{ trigger: "h-14 bg-content1/50 border-divider shadow-inner", label: "text-[9px] font-black uppercase text-default-500 tracking-widest ml-1 mb-2" }}
                       >
                        {availableCompanyTypes.map((type: any) => (
                           <SelectItem key={type?._id || type?.id} textValue={type?.name}>{type?.name}</SelectItem>
                        ))}
                       </Select>
                    </div>
                    <div className="rounded-2xl border border-divider/60 bg-content1/20 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500">Company Functions</p>
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-default-500">{selectedFunctionIds.length}/6</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availableCompanyFunctions.map((fn: any) => {
                          const functionId = String(fn?._id || fn?.id || "");
                          const isSelected = selectedFunctionIds.includes(functionId);
                          const isDisabled = !isSelected && selectedFunctionIds.length >= 6;
                          return (
                            <button
                              key={functionId}
                              type="button"
                              onClick={() => updateCompanyFunctionSelection(functionId)}
                              disabled={isDisabled}
                              className={`rounded-xl border px-3 py-2 text-left text-[11px] font-bold transition-all ${
                                isSelected ? "border-primary-500/40 bg-primary-500/10 text-primary-400" : "border-divider/50 bg-content2/20 text-default-300"
                              } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                              {String(fn?.name || "Company Function")}
                            </button>
                          );
                        })}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500">Priority (Top 3)</p>
                        {selectedFunctionPriorities.length ? (
                          <div className="space-y-2">
                            {selectedFunctionPriorities.map((id, index) => (
                              <div key={id} className="flex items-center justify-between rounded-xl border border-divider/50 bg-content1/40 px-3 py-2">
                                <span className="text-[11px] font-bold text-foreground">{index + 1}. {companyFunctionNameById.get(id) || "Selected function"}</span>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="flat" isDisabled={index === 0} onPress={() => moveCompanyFunctionPriority(id, "up")}>Up</Button>
                                  <Button size="sm" variant="flat" isDisabled={index === selectedFunctionPriorities.length - 1} onPress={() => moveCompanyFunctionPriority(id, "down")}>Down</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-default-500">Select at least one function to continue.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button color="primary" isLoading={operatorCreateCompanyMutation.isPending} isDisabled={!isCompanyFormValid || !isFunctionStepValid} onPress={() => operatorCreateCompanyMutation.mutate()} className="font-black uppercase text-[10px] tracking-widest px-12 h-12 rounded-2xl shadow-xl shadow-primary-500/20">Authorize Company</Button>
                    </div>
                  </div>
                )}

                {operatorWorkspaceMode === "associate" && (
                  <div className="p-8 rounded-[2rem] border border-divider/50 bg-content2/30 space-y-6 shadow-inner">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-4 bg-secondary-500 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.5)]" />
                       <h4 className="text-xs font-black uppercase italic text-foreground tracking-widest">Isolated Associate Initialization</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input label="Associate Name" labelPlacement="outside" variant="bordered" radius="lg" size="lg" value={operatorAssociateForm.name} onValueChange={(v) => setOperatorAssociateForm(c => ({...c, name: v}))} isRequired classNames={{ inputWrapper: "h-14 bg-content1/50 border-divider shadow-inner", label: "text-[9px] font-black uppercase text-default-500 tracking-widest ml-1 mb-2" }} />
                       <Input label="Associate Email" labelPlacement="outside" variant="bordered" radius="lg" size="lg" value={operatorAssociateForm.email} onValueChange={(v) => setOperatorAssociateForm(c => ({...c, email: v}))} isRequired classNames={{ inputWrapper: "h-14 bg-content1/50 border-divider shadow-inner", label: "text-[9px] font-black uppercase text-default-500 tracking-widest ml-1 mb-2" }} />
                       <Select label="Entity Allocation" labelPlacement="outside" variant="bordered" radius="lg" size="lg" selectedKeys={operatorAssociateForm.associateCompany ? new Set([operatorAssociateForm.associateCompany]) : new Set()} onSelectionChange={(keys) => setOperatorAssociateForm(c => ({...c, associateCompany: String(Array.from(keys as Set<string>)[0] || "")}))} className="md:col-span-2" classNames={{ trigger: "h-14 bg-content1/50 border-divider shadow-inner", label: "text-[9px] font-black uppercase text-default-500 tracking-widest ml-1 mb-2" }}>
                          {operatorAssignedCompanies.map((c: any) => (<SelectItem key={c._id || c.id} textValue={c.name}>{c.name}</SelectItem>))}
                       </Select>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button color="secondary" isLoading={operatorCreateAssociateMutation.isPending} isDisabled={!isAssociateOnlyFormValid} onPress={() => operatorCreateAssociateMutation.mutate()} className="font-black uppercase text-[10px] tracking-widest px-12 h-12 rounded-2xl shadow-xl shadow-secondary-500/20">Authorize Associate</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} className="font-black uppercase text-[10px] tracking-widest italic opacity-40 hover:opacity-100 h-10 px-8">Return to Mission Control</Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
);
}
