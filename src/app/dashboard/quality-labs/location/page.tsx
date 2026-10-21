"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, Switch, Textarea } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FiArrowLeft, FiArrowRight, FiCheck, FiCopy, FiMapPin, FiNavigation, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { getData, postData, putData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
import SearchableSelect from "@/components/ui/SearchableSelect";
import type { CountryOption, LabCountryAssignment, LabCredential, LabOption, LabProductCapabilityTemplate, LabSnapshot } from "@/types/labProfile";
import { optionId, optionName } from "@/types/labProfile";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

const STEPS = ["Lab identity", "Credential library", "Product capabilities", "Country product coverage", "Review"];
const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (byte) => byte.toString(16).padStart(2, "0")).join("");
const EMPTY: LabSnapshot = { displayName: "", contactEmail: "", contactPhone: "", whatsappPhone: "", contactPhoneSecondary: "", address: "", physicalCountryId: "", state: "", city: "", summary: "", credentials: [], productCapabilityTemplates: [], countryAssignments: [] };
const emptyProfile = (): LabSnapshot => ({ ...EMPTY, credentials: [], productCapabilityTemplates: [], countryAssignments: [] });
const emptyCredential = (): LabCredential => ({ accreditationId: "", issuer: "", credentialNumber: "", validFrom: "", validTo: "", documentUrl: "", verificationStatus: "PENDING" });
const emptyTemplate = (): LabProductCapabilityTemplate => ({ _id: newId(), name: "", commodityId: "", qualityClassifications: [], testIds: [], parameterIds: [], credentialIds: [], method: "", turnaroundDays: null, sampleRequirements: "", notes: "" });
const selectionValues = (selection: any) => selection === "all" ? [] : Array.from(selection as Set<React.Key>).map(String);
const LocationPicker = dynamic(() => import("@/components/Warehouse/WarehouseLocationPicker"), { ssr: false });
const validLocation = (location?: LabSnapshot["location"]) => Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude) && Number(location?.latitude) >= -90 && Number(location?.latitude) <= 90 && Number(location?.longitude) >= -180 && Number(location?.longitude) <= 180;

const forwardGeocode = async (query: string) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Address search failed");
  const rows = await response.json();
  if (!Array.isArray(rows) || !rows.length) return null;
  return { latitude: Number(rows[0].lat), longitude: Number(rows[0].lon) };
};

const reverseGeocode = async (latitude: number, longitude: number) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${latitude}&lon=${longitude}`);
  if (!response.ok) throw new Error("Location lookup failed");
  const result = await response.json();
  const address = result?.address || {};
  return {
    label: result?.display_name || "Selected laboratory location",
    street: [address.house_number, address.road || address.pedestrian || address.neighbourhood].filter(Boolean).join(" "),
    city: address.city || address.town || address.village || address.county || "",
    state: address.state || address.region || "",
    country: address.country || "",
  };
};

type LabProfileWizardProps = { labId?: string; managedCompanyId?: string; returnTo?: string };
type CoverageDialog = { open: boolean; mode: "manage" | "copy"; countryId: string };

export default function LabProfileWizard({ labId, managedCompanyId = "", returnTo = "/dashboard/quality-labs/my" }: LabProfileWizardProps = {}) {
  const router = useRouter();
  const client = useQueryClient();
  const { user } = useContext(AuthContext);
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const [companyId, setCompanyId] = useState(managedCompanyId);
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<LabSnapshot>(emptyProfile);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [coverageDialog, setCoverageDialog] = useState<CoverageDialog>({ open: false, mode: "manage", countryId: "" });
  const [coverageSelections, setCoverageSelections] = useState<string[]>([]);
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [requestModal, setRequestModal] = useState<{ open: boolean; kind: string; name: string; description: string; unit: string; method: string; templateId?: string; credentialIndex?: number }>({ open: false, kind: "COMMODITY", name: "", description: "", unit: "", method: "" });
  const [stepErrors, setStepErrors] = useState<Record<number, boolean>>({});
  const [whatsappSameAsPrimary, setWhatsappSameAsPrimary] = useState(true);
  const [customWhatsappPhone, setCustomWhatsappPhone] = useState("");
  const [revision, setRevision] = useState(1);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(emptyProfile()));
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [mapSearch, setMapSearch] = useState("");
  const locationPanelRef = useRef<HTMLDivElement>(null);

  const companiesQuery = useQuery({ queryKey: ["lab-admin-companies"], queryFn: async () => { const response: any = await getData(apiRoutes.associateCompany.getAll, { page: 1, limit: 500, sort: "name:asc" }); const root = response?.data?.data; return Array.isArray(root?.data) ? root.data : Array.isArray(root) ? root : []; }, enabled: isAdmin });
  const taxonomyQuery = useQuery({ queryKey: ["lab-taxonomy"], queryFn: async () => (await getData(apiRoutes.labProfiles.taxonomy)).data.data });
  const draftQuery = useQuery({ queryKey: ["lab-profile-draft", labId, companyId], queryFn: async () => (await getData(apiRoutes.labProfiles.mineDetail(labId!), companyId ? { companyId } : {})).data.data, enabled: Boolean(labId), retry: false });

  useEffect(() => {
    if (!draftQuery.isSuccess) return;
    const draft = draftQuery.data?.draft || draftQuery.data?.published;
    setRevision(Number(draftQuery.data?.revision || 1));
    if (!draft) {
      setProfile(emptyProfile());
      setWhatsappSameAsPrimary(true);
      setCustomWhatsappPhone("");
      setLocationConfirmed(false);
      return;
    }
    const savedWhatsapp = String(draft.whatsappPhone || "");
    const usesPrimaryPhone = Boolean(savedWhatsapp) && savedWhatsapp.replace(/\D/g, "") === String(draft.contactPhone || "").replace(/\D/g, "");
    setWhatsappSameAsPrimary(usesPrimaryPhone);
    setCustomWhatsappPhone(usesPrimaryPhone ? "" : savedWhatsapp);
    const normalized = {
      ...draft,
      whatsappPhone: savedWhatsapp,
      physicalCountryId: optionId(draft.physicalCountryId),
      credentials: (draft.credentials || []).map((credential: LabCredential) => ({ ...credential, _id: undefined, accreditationId: optionId(credential.accreditationId) })),
      productCapabilityTemplates: (draft.productCapabilityTemplates || []).map((template: LabProductCapabilityTemplate) => ({ ...template, _id: String(template._id), commodityId: optionId(template.commodityId), testIds: (template.testIds || []).map(optionId), parameterIds: (template.parameterIds || []).map(optionId) })),
      countryAssignments: (draft.countryAssignments || []).map((assignment: LabCountryAssignment) => ({ ...assignment, countryId: optionId(assignment.countryId), productTemplateIds: (assignment.productTemplateIds || []).map(String) })),
    };
    setProfile(normalized);
    setLocationConfirmed(validLocation(normalized.location));
    setSavedSnapshot(JSON.stringify(normalized));
  }, [draftQuery.data, draftQuery.isSuccess]);

  const dirty = JSON.stringify(profile) !== savedSnapshot;
  useUnsavedChangesGuard(dirty, "You have unsaved laboratory profile changes. Leave without saving?");

  const resetWizard = () => {
    setProfile(emptyProfile());
    setSelectedCountries([]);
    setSelectedTemplates([]);
    setCoverageDialog({ open: false, mode: "manage", countryId: "" });
    setCoverageSelections([]);
    setAssignmentSearch("");
    setStepErrors({});
    setWhatsappSameAsPrimary(true);
    setCustomWhatsappPhone("");
    setStep(0);
    setLocationConfirmed(false);
    setLocationError("");
    setMapSearch("");
  };

  const items: LabOption[] = taxonomyQuery.data?.items || [];
  const countries: CountryOption[] = taxonomyQuery.data?.countries || [];
  const byKind = (kind: string) => items.filter((item) => item.kind === kind);
  const taxonomyName = (value: string | LabOption) => items.find((item) => item._id === optionId(value))?.name || optionName(value);
  const countryName = (countryId: string) => countries.find((country) => country._id === countryId)?.name || countryId;
  const capabilityName = (template: LabProductCapabilityTemplate, index = profile.productCapabilityTemplates.indexOf(template)) => template.name?.trim() || taxonomyName(template.commodityId) || `Untitled product capability ${index + 1}`;
  const templateName = (templateId: string) => {
    const template = profile.productCapabilityTemplates.find((item) => item._id === templateId);
    return template ? capabilityName(template) : "Unknown product";
  };
  const usageCount = (templateId: string) => profile.countryAssignments.filter((assignment) => assignment.productTemplateIds.includes(templateId)).length;
  const setField = (field: keyof LabSnapshot, value: any) => setProfile((current) => ({ ...current, [field]: value }));
  const setAddressField = (field: "physicalCountryId" | "state" | "city" | "address", value: any) => {
    setField(field, value);
    if (validLocation(profile.location)) setLocationConfirmed(false);
  };
  const focusLocation = () => requestAnimationFrame(() => locationPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  const applyLocation = async (latitude: number, longitude: number) => {
    if (!validLocation({ latitude, longitude })) {
      setLocationError("Choose a valid point on the map.");
      return;
    }
    setLocationBusy(true);
    setLocationError("");
    try {
      const details = await reverseGeocode(latitude, longitude);
      const matchedCountry = countries.find((country) => country.name.localeCompare(details.country, undefined, { sensitivity: "base" }) === 0);
      setProfile((current) => ({ ...current, physicalCountryId: optionId(current.physicalCountryId) || matchedCountry?._id || "", state: current.state || details.state, city: current.city || details.city, address: current.address || details.street, location: { latitude, longitude, label: details.label } }));
    } catch {
      setProfile((current) => ({ ...current, location: { latitude, longitude, label: "Selected laboratory location" } }));
      setLocationError("The coordinates were saved, but the address could not be resolved automatically.");
    } finally {
      setLocationConfirmed(true);
      setLocationBusy(false);
    }
  };
  const searchAddressOnMap = async () => {
    const query = mapSearch.trim();
    if (!query) return setLocationError("Enter an address or place to search the map.");
    setLocationBusy(true);
    setLocationError("");
    try {
      const result = await forwardGeocode(query);
      if (!result || !validLocation(result)) throw new Error("not found");
      await applyLocation(result.latitude, result.longitude);
    } catch {
      setLocationError("We could not find that address or place. Check the search or select the location directly on the map.");
      setLocationBusy(false);
    }
  };
  const useCurrentLocation = () => {
    if (!navigator.geolocation) return setLocationError("Current location is not supported by this browser.");
    setLocationBusy(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(({ coords }) => void applyLocation(coords.latitude, coords.longitude), () => { setLocationBusy(false); setLocationError("Location access was unavailable. Allow access or select a point on the map."); }, { enableHighAccuracy: true, timeout: 15000 });
  };
  const setPrimaryPhone = (value: string) => setProfile((current) => ({ ...current, contactPhone: value, ...(whatsappSameAsPrimary ? { whatsappPhone: value } : {}) }));
  const setWhatsAppMatchesPrimary = (matches: boolean) => {
    setWhatsappSameAsPrimary(matches);
    if (matches && profile.whatsappPhone && profile.whatsappPhone !== profile.contactPhone) setCustomWhatsappPhone(profile.whatsappPhone);
    setProfile((current) => ({ ...current, whatsappPhone: matches ? current.contactPhone : customWhatsappPhone }));
  };
  const setWhatsAppPhone = (value: string) => { setCustomWhatsappPhone(value); setField("whatsappPhone", value); };
  const updateCredential = (index: number, field: keyof LabCredential, value: any) => setField("credentials", profile.credentials.map((credential, i) => i === index ? { ...credential, [field]: value } : credential));
  const updateTemplate = (id: string, field: keyof LabProductCapabilityTemplate, value: any) => setField("productCapabilityTemplates", profile.productCapabilityTemplates.map((template) => template._id === id ? { ...template, [field]: value } : template));

  const profileForSave = () => ({ ...profile, location: locationConfirmed ? profile.location : undefined });
  const save = useMutation({ mutationFn: async () => {
    if (isAdmin && !companyId) throw new Error("Select an associate company before saving.");
    return labId
      ? putData(apiRoutes.labProfiles.mineDraft(labId), { profile: profileForSave(), expectedRevision: revision, ...(companyId ? { companyId } : {}) })
      : postData(apiRoutes.labProfiles.mine, { profile: profileForSave(), ...(companyId ? { companyId } : {}) });
  }, onSuccess: (response: any) => { const saved = response?.data?.data; const savedProfile = profileForSave(); setProfile(savedProfile); setRevision(Number(saved?.revision || revision + 1)); setSavedSnapshot(JSON.stringify(savedProfile)); client.invalidateQueries({ queryKey: ["lab-profile-draft"] }); client.invalidateQueries({ queryKey: ["my-labs"] }); showToastMessage({ type: "success", message: "Lab draft saved." }); if (!labId && saved?._id) router.replace(`/dashboard/quality-labs/my/${saved._id}${companyId ? `?companyId=${companyId}` : ""}`); }, onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || error?.message || "Unable to save draft." }) });
  const submit = useMutation({ mutationFn: async () => {
    if (isAdmin && !companyId) throw new Error("Select an associate company before submitting.");
    if (!labId) {
      const created: any = await postData(apiRoutes.labProfiles.mine, { profile: profileForSave(), ...(companyId ? { companyId } : {}) });
      const row = created?.data?.data;
      return postData(apiRoutes.labProfiles.mineSubmit(row._id), { expectedRevision: row.revision, ...(companyId ? { companyId } : {}) });
    }
    const saved: any = await putData(apiRoutes.labProfiles.mineDraft(labId), { profile: profileForSave(), expectedRevision: revision, ...(companyId ? { companyId } : {}) });
    return postData(apiRoutes.labProfiles.mineSubmit(labId), { expectedRevision: saved?.data?.data?.revision, ...(companyId ? { companyId } : {}) });
  }, onSuccess: () => { showToastMessage({ type: "success", message: "Lab profile submitted for review." }); router.push(returnTo); }, onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || error?.message || "Unable to submit profile." }) });

  const openRequest = (kind: string, target: { templateId?: string; credentialIndex?: number } = {}) => {
    const nextTarget = { ...target };
    if (["COMMODITY", "TEST", "PARAMETER"].includes(kind) && !nextTarget.templateId) {
      const current = profile.productCapabilityTemplates.at(-1);
      if (current) nextTarget.templateId = current._id;
      else { const capability = emptyTemplate(); nextTarget.templateId = capability._id; setField("productCapabilityTemplates", [capability]); }
    }
    setRequestModal({ open: true, kind, name: "", description: "", unit: "", method: "", ...nextTarget });
  };
  const requestOption = async () => {
    if (!requestModal.name.trim()) return showToastMessage({ type: "warning", message: "Enter a name for the new option." });
    const template = profile.productCapabilityTemplates.find((item) => item._id === requestModal.templateId);
    const parentIds = requestModal.kind === "TEST" && template?.commodityId ? [optionId(template.commodityId)] : requestModal.kind === "PARAMETER" ? (template?.testIds || []).map(optionId) : [];
    try {
      const response: any = await postData(apiRoutes.labProfiles.taxonomyCreate, { kind: requestModal.kind, name: requestModal.name, description: requestModal.description, unit: requestModal.unit, method: requestModal.method, parentIds, ...(companyId ? { companyId } : {}) });
      const created = response?.data?.data;
      if (!created?._id) throw new Error("The new option could not be selected.");
      if (requestModal.kind === "ACCREDITATION" && requestModal.credentialIndex != null) updateCredential(requestModal.credentialIndex, "accreditationId", created._id);
      if (requestModal.kind === "ACCREDITATION" && requestModal.credentialIndex == null) setField("credentials", [...profile.credentials, { ...emptyCredential(), accreditationId: created._id }]);
      if (template && requestModal.kind === "COMMODITY") updateTemplate(template._id, "commodityId", created._id);
      if (template && requestModal.kind === "TEST") updateTemplate(template._id, "testIds", Array.from(new Set([...template.testIds.map(optionId), created._id])));
      if (template && requestModal.kind === "PARAMETER") updateTemplate(template._id, "parameterIds", Array.from(new Set([...template.parameterIds.map(optionId), created._id])));
      await taxonomyQuery.refetch();
      showToastMessage({ type: "success", message: `${requestModal.name.trim()} was requested and can be used in this draft while it awaits approval.` });
      setRequestModal((current) => ({ ...current, open: false }));
    } catch (error: any) { showToastMessage({ type: "error", message: error?.response?.data?.message || error?.message || "Unable to add option." }); }
  };
  const validateStep = () => {
    const locationInvalid = step === 0 && (!validLocation(profile.location) || !locationConfirmed);
    const invalid = step === 0 ? !profile.displayName.trim() || !profile.contactEmail.trim() || !profile.contactPhone.trim() || !optionId(profile.physicalCountryId) || !profile.address.trim() || locationInvalid : step === 1 ? profile.credentials.some((credential) => !optionId(credential.accreditationId) || !credential.issuer.trim() || Boolean(credential.validFrom && credential.validTo && new Date(credential.validTo) < new Date(credential.validFrom))) : step === 2 ? profile.productCapabilityTemplates.some((template) => !optionId(template.commodityId)) : step === 3 ? !profile.countryAssignments.length : false;
    if (invalid) { setStepErrors((current) => ({ ...current, [step]: true })); if (locationInvalid) { setLocationError(validLocation(profile.location) ? "Confirm the laboratory location again after changing the address." : "Select the laboratory’s exact location on the map before continuing."); focusLocation(); } showToastMessage({ type: "warning", message: locationInvalid ? "Select and confirm the exact laboratory location." : "Complete the required fields before continuing." }); return false; }
    setStepErrors((current) => ({ ...current, [step]: false })); return true;
  };
  const assignTemplates = () => {
    if (!selectedCountries.length || !selectedTemplates.length) return showToastMessage({ type: "warning", message: "Select at least one country and one product capability." });
    const assignments = new Map(profile.countryAssignments.map((assignment) => [optionId(assignment.countryId), new Set(assignment.productTemplateIds)]));
    selectedCountries.forEach((countryId) => {
      const current = assignments.get(countryId) || new Set<string>();
      selectedTemplates.forEach((templateId) => current.add(templateId));
      assignments.set(countryId, current);
    });
    setField("countryAssignments", Array.from(assignments, ([countryId, templateIds]) => ({ countryId, productTemplateIds: Array.from(templateIds) })));
    setSelectedCountries([]);
    setSelectedTemplates([]);
    showToastMessage({ type: "success", message: "Products added to the selected countries." });
  };
  const closeCoverageDialog = () => {
    setCoverageDialog((current) => ({ ...current, open: false }));
    setCoverageSelections([]);
  };
  const openCoverageDialog = (mode: CoverageDialog["mode"], countryId: string) => {
    setCoverageSelections([]);
    setCoverageDialog({ open: true, mode, countryId });
  };
  const removeCountryProducts = () => {
    if (!coverageSelections.length) return;
    setProfile((current) => ({
      ...current,
      countryAssignments: current.countryAssignments.flatMap((assignment) => {
        if (optionId(assignment.countryId) !== coverageDialog.countryId) return [assignment];
        const productTemplateIds = assignment.productTemplateIds.filter((id) => !coverageSelections.includes(id));
        return productTemplateIds.length ? [{ ...assignment, productTemplateIds }] : [];
      }),
    }));
    showToastMessage({ type: "success", message: `${coverageSelections.length} product ${coverageSelections.length === 1 ? "was" : "were"} removed from ${countryName(coverageDialog.countryId)}.` });
    closeCoverageDialog();
  };
  const copyCountryProducts = () => {
    const source = profile.countryAssignments.find((assignment) => optionId(assignment.countryId) === coverageDialog.countryId);
    if (!source || !coverageSelections.length) return;
    setProfile((current) => {
      const assignments = new Map(current.countryAssignments.map((assignment) => [optionId(assignment.countryId), new Set(assignment.productTemplateIds)]));
      coverageSelections.forEach((countryId) => {
        const target = assignments.get(countryId) || new Set<string>();
        source.productTemplateIds.forEach((templateId) => target.add(templateId));
        assignments.set(countryId, target);
      });
      return { ...current, countryAssignments: Array.from(assignments, ([countryId, templateIds]) => ({ countryId, productTemplateIds: Array.from(templateIds) })) };
    });
    showToastMessage({ type: "success", message: `${countryName(coverageDialog.countryId)} setup was added to ${coverageSelections.length} ${coverageSelections.length === 1 ? "country" : "countries"}.` });
    closeCoverageDialog();
  };
  const duplicateTemplate = (template: LabProductCapabilityTemplate) => setField("productCapabilityTemplates", [...profile.productCapabilityTemplates, { ...template, _id: newId(), name: `${template.name || "Product capability"} copy` }]);
  const deleteTemplate = (template: LabProductCapabilityTemplate) => { const uses = usageCount(template._id); if (uses) return showToastMessage({ type: "warning", message: `Remove this capability from ${uses} country assignment(s) before deleting it.` }); setField("productCapabilityTemplates", profile.productCapabilityTemplates.filter((item) => item._id !== template._id)); };
  const visibleAssignments = useMemo(() => profile.countryAssignments.filter((assignment) => { const text = `${countryName(optionId(assignment.countryId))} ${assignment.productTemplateIds.map(templateName).join(" ")}`.toLowerCase(); return text.includes(assignmentSearch.trim().toLowerCase()); }).sort((a, b) => countryName(optionId(a.countryId)).localeCompare(countryName(optionId(b.countryId)))), [profile.countryAssignments, profile.productCapabilityTemplates, assignmentSearch, countries]);
  const activeCoverageAssignment = profile.countryAssignments.find((assignment) => optionId(assignment.countryId) === coverageDialog.countryId);
  const activeCoverageName = countryName(coverageDialog.countryId);

  const identityFieldClassNames = {
    label: "pb-1 text-sm font-semibold leading-5 tracking-normal text-foreground",
    input: "text-base tracking-normal",
    inputWrapper: "h-12 rounded-xl bg-default-100 px-4",
    description: "pt-1 text-xs leading-5 tracking-normal text-default-500",
  };

  const header = <header><Button variant="light" startContent={<FiArrowLeft />} onPress={() => router.push(returnTo)}>Back to My Lab</Button><h1 className="mt-3 text-3xl font-black">Country-first lab capability setup</h1><p className="mt-2 text-sm text-default-500">Create each product capability once, then assign it to every export country where it is accepted.</p>{isAdmin && !labId ? <div className="mt-4 max-w-xl"><SearchableSelect label="Associate company to manage" multiple={false} allowSelectAll={false} options={(companiesQuery.data || []).map((company: any) => ({ key: company._id, label: company.name }))} value={companyId ? [companyId] : []} onChange={(values) => { resetWizard(); setCompanyId(values[0] || ""); }} />{companiesQuery.isLoading ? <p className="mt-2 text-xs text-default-500">Loading associate companies…</p> : null}{companiesQuery.isError ? <p className="mt-2 text-sm text-danger">Unable to load associate companies. Refresh the page to try again.</p> : null}</div> : null}{draftQuery.data?.status ? <Chip className="mt-3" color={draftQuery.data.status === "REJECTED" ? "danger" : draftQuery.data.status === "PENDING_REVIEW" ? "warning" : "success"} variant="flat">{draftQuery.data.status.replaceAll("_", " ")}</Chip> : null}{draftQuery.data?.reviewNotes ? <p className="mt-2 text-sm text-danger">Review note: {draftQuery.data.reviewNotes}</p> : null}</header>;
  const statePage = (content: any) => <section className="min-h-screen bg-background p-4 md:p-8"><div className="mx-auto max-w-6xl space-y-6">{header}{content}</div></section>;

  if (isAdmin && !labId && !companyId) return statePage(<Card className="border border-dashed border-default-300"><CardBody className="items-center gap-2 p-10 text-center"><h2 className="text-xl font-black">Select an associate company</h2><p className="max-w-xl text-sm text-default-500">Choose a company above to view and manage the exact lab profile its associates use.</p></CardBody></Card>);
  if (taxonomyQuery.isLoading || (labId && draftQuery.isLoading)) return statePage(<Card className="border border-default-200"><CardBody className="flex min-h-64 items-center justify-center gap-3"><Spinner color="success" /><p className="text-sm text-default-500">Loading the lab profile…</p></CardBody></Card>);
  if (taxonomyQuery.isError || (labId && draftQuery.isError)) return statePage(<Card className="border border-danger-200"><CardBody className="items-center gap-3 p-10 text-center"><h2 className="text-xl font-black">Unable to load the lab profile</h2><p className="text-sm text-default-500">The selected company’s panel could not be loaded. Try again before making changes.</p><Button color="danger" variant="flat" onPress={() => { taxonomyQuery.refetch(); if (labId) draftQuery.refetch(); }}>Try again</Button></CardBody></Card>);
  return <section className="min-h-screen bg-background p-4 md:p-8"><div className="mx-auto max-w-6xl space-y-6">
    {header}
    <div className="grid grid-cols-5 gap-2" aria-label="Lab setup progress">{STEPS.map((name, index) => <button key={name} type="button" onClick={() => { if (step === 0 && index > 0 && !validateStep()) return; setStep(index); }} aria-current={step === index ? "step" : undefined} className={`min-h-16 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold leading-4 tracking-normal transition-colors ${step === index ? "border-success-500 bg-success-500/10 text-success-600" : stepErrors[index] ? "border-danger bg-danger-50 text-danger" : index < step ? "border-success-300 bg-success-50 text-success-600" : "border-default-200 text-default-500"}`}><span className="flex items-center justify-between text-[11px] leading-none"><span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>{index === 1 ? <span className="hidden font-medium text-default-400 sm:inline">Optional</span> : index < step ? <FiCheck aria-label="Completed" /> : null}</span><span className="mt-2 hidden md:block">{name}</span></button>)}</div>
    <Card className="border border-default-200"><CardBody className="gap-5 p-5 md:p-8">
      {step === 0 ? <>
        <div className="space-y-1"><h2 className="text-xl font-black leading-tight tracking-tight">Laboratory identity</h2><p className="text-sm leading-6 tracking-normal text-default-500">Provide the public contact and physical location details used in the directory.</p></div>
        <div className="space-y-8">
          <div><h3 className="mb-4 text-sm font-bold leading-5 tracking-normal text-default-600">Laboratory details</h3><div className="grid gap-x-5 gap-y-5 md:grid-cols-2"><Input label="Lab display name" labelPlacement="outside" placeholder="e.g. OBAOL Food Testing Laboratory" isRequired value={profile.displayName} onValueChange={(value) => setField("displayName", value)} classNames={identityFieldClassNames} /><Textarea label="Public summary" labelPlacement="outside" placeholder="Briefly describe the laboratory and its core capabilities" value={profile.summary} onValueChange={(value) => setField("summary", value)} classNames={{ label: identityFieldClassNames.label, input: "text-base leading-6 tracking-normal", inputWrapper: "min-h-24 rounded-xl bg-default-100 px-4 py-3" }} /></div></div>
          <div><h3 className="mb-4 text-sm font-bold leading-5 tracking-normal text-default-600">Contact information</h3><div className="grid gap-x-5 gap-y-5 md:grid-cols-2"><Input label="Contact email" labelPlacement="outside" placeholder="laboratory@example.com" type="email" isRequired value={profile.contactEmail} onValueChange={(value) => setField("contactEmail", value)} classNames={identityFieldClassNames} /><Input label="Primary phone" labelPlacement="outside" placeholder="+91 00000 00000" description="Include the international country code" isRequired value={profile.contactPhone} onValueChange={setPrimaryPhone} classNames={identityFieldClassNames} /><div className="rounded-2xl border border-default-200 bg-default-50/50 p-4 md:col-span-2 md:p-5"><div className="flex min-h-8 items-center"><Switch size="sm" color="success" isSelected={whatsappSameAsPrimary} onValueChange={setWhatsAppMatchesPrimary} classNames={{ base: "max-w-full gap-3", wrapper: "mr-0 shrink-0", label: "text-sm font-semibold leading-5 tracking-normal text-foreground" }}>WhatsApp number is the same as primary phone</Switch></div>{!whatsappSameAsPrimary ? <div className="mt-5 border-t border-default-200 pt-5"><Input label="WhatsApp number" labelPlacement="outside" placeholder="+91 00000 00000" description="Optional · include the international country code" value={profile.whatsappPhone || ""} onValueChange={setWhatsAppPhone} classNames={identityFieldClassNames} /></div> : <p className="mt-2 pl-11 text-xs leading-5 tracking-normal text-default-500">WhatsApp will use {profile.contactPhone || "the primary phone number"}.</p>}</div><Input label="Secondary phone" labelPlacement="outside" placeholder="Optional alternate number" value={profile.contactPhoneSecondary} onValueChange={(value) => setField("contactPhoneSecondary", value)} classNames={identityFieldClassNames} /></div></div>
          <div><h3 className="mb-4 text-sm font-bold leading-5 tracking-normal text-default-600">Physical address</h3><div className="grid gap-x-5 gap-y-5 md:grid-cols-2"><SearchableSelect label="Physical country" required multiple={false} allowSelectAll={false} options={countries.map((country) => ({ key: country._id, label: country.name }))} value={profile.physicalCountryId ? [optionId(profile.physicalCountryId)] : []} onChange={(values) => setAddressField("physicalCountryId", values[0] || "")} /><Input label="State / region" labelPlacement="outside" placeholder="State or region" value={profile.state} onValueChange={(value) => setAddressField("state", value)} classNames={identityFieldClassNames} /><Input label="City / district" labelPlacement="outside" placeholder="City or district" value={profile.city} onValueChange={(value) => setAddressField("city", value)} classNames={identityFieldClassNames} /><Input label="Street address" labelPlacement="outside" placeholder="Building, street, area and postal code" isRequired value={profile.address} onValueChange={(value) => setAddressField("address", value)} classNames={identityFieldClassNames} /></div></div>
          <div ref={locationPanelRef} className={`overflow-hidden rounded-2xl border bg-content1 ${locationError && (!validLocation(profile.location) || !locationConfirmed) ? "border-danger" : "border-default-200"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-default-200 p-5"><div className="flex gap-3"><span className="rounded-xl bg-success-50 p-2.5 text-success-600"><FiMapPin /></span><div><h3 className="font-bold leading-5">Exact laboratory location <span className="text-danger">*</span></h3><p className="mt-1 text-sm leading-5 text-default-500">Search an address or click the map to place the laboratory marker.</p></div></div><Button size="sm" variant="flat" isDisabled={locationBusy} startContent={<FiNavigation />} onPress={useCurrentLocation}>Use current location</Button></div>
            <form className="flex flex-col gap-2 border-b border-default-200 p-4 sm:flex-row" onSubmit={(event) => { event.preventDefault(); void searchAddressOnMap(); }}>
              <Input aria-label="Search address or place" placeholder="Search address, landmark, city, or postal code" value={mapSearch} onValueChange={setMapSearch} startContent={<FiSearch className="shrink-0 text-default-400" />} isDisabled={locationBusy} className="flex-1" />
              <Button type="submit" color="success" isLoading={locationBusy} isDisabled={locationBusy}>Search map</Button>
            </form>
            <LocationPicker markerVariant="lab" value={validLocation(profile.location) ? { latitude: Number(profile.location?.latitude), longitude: Number(profile.location?.longitude) } : null} onChange={({ latitude, longitude }) => void applyLocation(latitude, longitude)} height={300} />
            <div className="border-t border-default-200 p-4">{validLocation(profile.location) && locationConfirmed ? <div className="flex items-start gap-2 text-sm text-success-700"><FiCheck className="mt-0.5 shrink-0" /><div><b>Location confirmed</b><p className="mt-0.5 text-xs leading-5 text-default-500">{profile.location?.label || "Selected laboratory location"} · {Number(profile.location?.latitude).toFixed(5)}, {Number(profile.location?.longitude).toFixed(5)}</p></div></div> : validLocation(profile.location) ? <p className="text-sm text-warning-600">The address changed. Select the marker again or find the address on the map to confirm it.</p> : <p className="text-sm text-default-500">No map location selected yet.</p>}{locationError ? <p role="alert" className={`mt-2 text-sm ${validLocation(profile.location) && locationConfirmed ? "text-warning-600" : "text-danger"}`}>{locationError}</p> : null}</div>
          </div>
        </div>
      </> : null}
      {step === 1 ? <><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-xl font-black">Reusable credential library</h2><p className="text-sm text-default-500">Add a certificate or accreditation once and reuse it across product capabilities.</p></div><Button size="sm" variant="flat" startContent={<FiPlus />} onPress={() => openRequest("ACCREDITATION")}>Add accreditation</Button></div>{!profile.credentials.length ? <div className="rounded-xl border border-dashed border-default-300 p-8 text-center"><p className="font-semibold">No credentials added yet</p><p className="mt-1 text-sm text-default-500">Credentials are optional. Only the accreditation type and issuing body are required when you add one.</p></div> : null}{profile.credentials.map((credential, index) => <Card key={credential._id || index} className="border border-default-200"><CardBody className="gap-3"><div className="flex justify-between"><b>Credential {index + 1}</b><Button isIconOnly size="sm" color="danger" variant="light" onPress={() => setField("credentials", profile.credentials.filter((_, i) => i !== index))}><FiTrash2 /></Button></div><div className="grid gap-3 md:grid-cols-2"><SearchableSelect label="Accreditation / certificate" required multiple={false} allowSelectAll={false} options={byKind("ACCREDITATION").map((option) => ({ key: option._id, label: option.name }))} value={credential.accreditationId ? [optionId(credential.accreditationId)] : []} onChange={(values) => updateCredential(index, "accreditationId", values[0] || "")} emptyActionLabel="Add accreditation" onEmptyAction={() => openRequest("ACCREDITATION", { credentialIndex: index })} /><Input label="Issuing body" description="The organization that issued this credential" isRequired value={credential.issuer} onValueChange={(value) => updateCredential(index, "issuer", value)} /><Input label="Credential number (optional)" value={credential.credentialNumber} onValueChange={(value) => updateCredential(index, "credentialNumber", value)} /><Input label="Supporting document (optional)" description="Add a public document URL if available. Credentials without proof remain not verified." type="url" value={credential.documentUrl} onValueChange={(value) => updateCredential(index, "documentUrl", value)} /><Input label="Valid from (optional)" type="date" value={String(credential.validFrom || "").slice(0, 10)} onValueChange={(value) => updateCredential(index, "validFrom", value || null)} /><Input label="Valid to (optional)" type="date" value={String(credential.validTo || "").slice(0, 10)} onValueChange={(value) => updateCredential(index, "validTo", value || null)} /></div></CardBody></Card>)}<Button startContent={<FiPlus />} onPress={() => setField("credentials", [...profile.credentials, emptyCredential()])}>Add credential</Button></> : null}
      {step === 2 ? <><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-xl font-black">Reusable product capabilities</h2><p className="text-sm text-default-500">Define each product once, then reuse it across every destination country.</p></div><Button color="success" startContent={<FiPlus />} onPress={() => setField("productCapabilityTemplates", [...profile.productCapabilityTemplates, emptyTemplate()])}>Add product capability</Button></div>{!profile.productCapabilityTemplates.length ? <button type="button" onClick={() => setField("productCapabilityTemplates", [...profile.productCapabilityTemplates, emptyTemplate()])} className="w-full rounded-xl border border-dashed border-default-300 p-8 text-center transition hover:border-success-400 hover:bg-success-50 focus:outline-none focus:ring-2 focus:ring-success-500"><p className="font-semibold">Create your first product capability</p><p className="mt-1 text-sm text-default-500">Choose a commodity first. Tests, parameters and operating details can be supplied later.</p></button> : null}{profile.productCapabilityTemplates.map((template, index) => <Card key={template._id} className="border border-default-200"><CardBody className="gap-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><b>{capabilityName(template, index)}</b><p className="text-xs text-default-500">Used in {usageCount(template._id)} countries</p></div><div className="flex gap-1"><Button size="sm" variant="flat" startContent={<FiCopy />} onPress={() => duplicateTemplate(template)}>Duplicate</Button><Button isIconOnly size="sm" color="danger" variant="light" aria-label={`Delete ${capabilityName(template, index)}`} onPress={() => deleteTemplate(template)}><FiTrash2 /></Button></div></div><div className="grid gap-3 md:grid-cols-2"><Input label="Capability name (optional)" placeholder="e.g. Organic turmeric – EU" value={template.name} onValueChange={(value) => updateTemplate(template._id, "name", value)} /><SearchableSelect label="Commodity / product" required multiple={false} allowSelectAll={false} options={byKind("COMMODITY").map((option) => ({ key: option._id, label: option.name }))} value={template.commodityId ? [optionId(template.commodityId)] : []} onChange={(values) => updateTemplate(template._id, "commodityId", values[0] || "")} emptyActionLabel="Add commodity" onEmptyAction={() => openRequest("COMMODITY", { templateId: template._id })} /><SearchableSelect label="Quality classifications (optional)" options={["ORGANIC", "CONVENTIONAL", "IPM"].map((value) => ({ key: value, label: value }))} value={template.qualityClassifications} onChange={(values) => updateTemplate(template._id, "qualityClassifications", values)} /><SearchableSelect label="Tests / packages (optional)" options={byKind("TEST").filter((option) => !option.parentIds?.length || option.parentIds.map(String).includes(optionId(template.commodityId))).map((option) => ({ key: option._id, label: option.name }))} value={template.testIds.map(optionId)} onChange={(values) => updateTemplate(template._id, "testIds", values)} emptyActionLabel="Add test" onEmptyAction={() => openRequest("TEST", { templateId: template._id })} /><SearchableSelect label="Parameters (optional)" options={byKind("PARAMETER").filter((option) => !option.parentIds?.length || option.parentIds.some((id) => template.testIds.map(optionId).includes(String(id)))).map((option) => ({ key: option._id, label: option.name, description: option.unit }))} value={template.parameterIds.map(optionId)} onChange={(values) => updateTemplate(template._id, "parameterIds", values)} emptyActionLabel="Add parameter" onEmptyAction={() => openRequest("PARAMETER", { templateId: template._id })} /><SearchableSelect label="Credentials from library (optional)" options={profile.credentials.filter((credential) => optionId(credential.accreditationId)).map((credential, credentialIndex) => ({ key: optionId(credential.accreditationId), label: credential.credentialNumber || optionName(credential.accreditationId) || `Credential ${credentialIndex + 1}` }))} value={template.credentialIds} onChange={(values) => updateTemplate(template._id, "credentialIds", values)} /><Input label="Method (optional)" value={template.method} onValueChange={(value) => updateTemplate(template._id, "method", value)} /><Input label="Turnaround days (optional)" type="number" value={template.turnaroundDays == null ? "" : String(template.turnaroundDays)} onValueChange={(value) => updateTemplate(template._id, "turnaroundDays", value ? Number(value) : null)} /><Textarea label="Sample requirements (optional)" value={template.sampleRequirements} onValueChange={(value) => updateTemplate(template._id, "sampleRequirements", value)} /><Textarea label="Notes (optional)" value={template.notes} onValueChange={(value) => updateTemplate(template._id, "notes", value)} /></div></CardBody></Card>)}</> : null}
      {step === 3 ? <>
        <div><h2 className="text-xl font-black">Country product coverage</h2><p className="text-sm text-default-500">Choose destination countries, then select the products available in those markets.</p></div>
        <Card className="border border-success-500/20 bg-success-500/5"><CardBody className="gap-5 p-5">
          <div><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-success-600">1. Destination countries</span><SearchableSelect label="Search and select countries" options={countries.map((country) => ({ key: country._id, label: country.name }))} value={selectedCountries} onChange={setSelectedCountries} /></div>
          <div><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-success-600">2. Product capabilities</span>{profile.productCapabilityTemplates.length ? <div className="grid gap-3 md:grid-cols-2">{profile.productCapabilityTemplates.map((capability, index) => { const selected = selectedTemplates.includes(capability._id); const tests = capability.testIds.map(taxonomyName).filter(Boolean); return <button type="button" key={capability._id} aria-pressed={selected} onClick={() => setSelectedTemplates((current) => selected ? current.filter((id) => id !== capability._id) : [...current, capability._id])} className={`rounded-xl border p-4 text-left transition ${selected ? "border-success-500 bg-success-500/10" : "border-default-200 bg-content1 hover:border-success-300"}`}><div className="flex items-start justify-between gap-2"><div><b>{capabilityName(capability, index)}</b><p className="mt-1 text-xs text-default-500">{taxonomyName(capability.commodityId) || "Commodity not selected"}</p></div>{selected ? <FiCheck className="mt-1 text-success-500" /> : null}</div><p className="mt-3 text-xs text-default-500">{tests.length ? tests.join(", ") : "Testing details not supplied"} · Used in {usageCount(capability._id)} countries</p></button>; })}</div> : <div className="rounded-xl border border-dashed border-default-300 p-6 text-center text-sm text-default-500">Add a product capability in the previous step before assigning countries.</div>}</div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-content1 p-4"><div><b>{selectedCountries.length} countries · {selectedTemplates.length} product capabilities</b>{!selectedCountries.length || !selectedTemplates.length ? <p className="text-xs text-default-500">Select at least one country and one product capability to continue.</p> : null}</div><Button color="success" isDisabled={!selectedCountries.length || !selectedTemplates.length} onPress={assignTemplates}>Add products to countries</Button></div>
        </CardBody></Card>
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Current country coverage</h3><p className="text-xs text-default-500">Review each country, manage its products, or reuse its setup elsewhere.</p></div><Chip color="success" variant="flat">{profile.countryAssignments.length} countries · {profile.productCapabilityTemplates.length} product capabilities</Chip></div>
        {profile.countryAssignments.length ? <Input value={assignmentSearch} onValueChange={setAssignmentSearch} placeholder="Search assigned country or product" startContent={<FiSearch />} className="max-w-xl" /> : null}
        {!profile.countryAssignments.length ? <div className="rounded-2xl border border-dashed border-default-300 bg-default-50/50 px-6 py-10 text-center"><p className="font-semibold">No country coverage added yet</p><p className="mt-1 text-sm text-default-500">Select countries and product capabilities above, then add them to create coverage cards.</p></div> : visibleAssignments.length ? <div className="grid gap-4 md:grid-cols-2">{visibleAssignments.map((assignment) => { const countryId = optionId(assignment.countryId); return <Card key={countryId} className="border border-default-200 shadow-sm"><CardBody className="gap-4 p-5"><div className="flex items-start justify-between gap-3"><div><h4 className="font-bold leading-5">{countryName(countryId)}</h4><p className="mt-1 text-xs text-default-500">{assignment.productTemplateIds.length} {assignment.productTemplateIds.length === 1 ? "product capability" : "product capabilities"}</p></div><Chip size="sm" color="success" variant="flat">Configured</Chip></div><div className="flex min-h-8 flex-wrap gap-2">{assignment.productTemplateIds.map((templateId) => <Chip key={templateId} size="sm" variant="flat">{templateName(templateId)}</Chip>)}</div><div className="flex flex-wrap gap-2 border-t border-default-200 pt-4"><Button size="sm" variant="bordered" onPress={() => openCoverageDialog("manage", countryId)}>Manage products</Button><Button size="sm" variant="flat" startContent={<FiCopy />} onPress={() => openCoverageDialog("copy", countryId)}>Copy setup</Button></div></CardBody></Card>; })}</div> : <div className="rounded-2xl border border-dashed border-default-300 px-6 py-10 text-center"><p className="font-semibold">No matching country coverage</p><p className="mt-1 text-sm text-default-500">Try another country or product name.</p></div>}
      </> : null}
      {step === 4 ? <><h2 className="text-xl font-black">Review and submit</h2><div className="grid gap-3 md:grid-cols-3"><Card><CardBody><span className="text-xs text-default-500">Lab</span><b>{profile.displayName || "Missing"}</b></CardBody></Card><Card><CardBody><span className="text-xs text-default-500">Export countries</span><b className="text-2xl">{profile.countryAssignments.length}</b></CardBody></Card><Card><CardBody><span className="text-xs text-default-500">Reusable products</span><b className="text-2xl">{profile.productCapabilityTemplates.length}</b></CardBody></Card></div><div className="space-y-2">{profile.countryAssignments.map((assignment) => <div key={optionId(assignment.countryId)} className="rounded-xl border border-default-200 p-3"><b>{countryName(optionId(assignment.countryId))}</b><p className="text-sm text-default-500">{assignment.productTemplateIds.map(templateName).join(", ")}</p></div>)}</div><p className="rounded-xl bg-warning-500/10 p-4 text-sm text-warning-600">Country and product are sufficient for publication. Missing tests, parameters, classifications, or credentials will appear as “Not supplied.”</p></> : null}
      <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-default-200 bg-content1/95 p-3 shadow-lg backdrop-blur"><div className="flex items-center gap-2"><Button variant="flat" isDisabled={step === 0} startContent={<FiArrowLeft />} onPress={() => setStep((current) => current - 1)}>Previous</Button><span className="hidden text-xs text-default-500 sm:inline">Step {step + 1} of {STEPS.length}</span></div><div className="flex gap-2"><Button variant="bordered" isDisabled={isAdmin && !companyId} isLoading={save.isPending} onPress={() => save.mutate()}>Save draft</Button>{step < STEPS.length - 1 ? <Button color="success" endContent={<FiArrowRight />} onPress={() => { if (validateStep()) setStep((current) => current + 1); }}>{step === 1 && !profile.credentials.length ? "Skip optional step" : "Save and continue"}</Button> : <Button color="success" startContent={<FiCheck />} isDisabled={isAdmin && !companyId} isLoading={submit.isPending} onPress={() => submit.mutate()}>Submit for review</Button>}</div></div>
    </CardBody></Card>
    <Modal isOpen={coverageDialog.open} onOpenChange={(open) => { if (!open) closeCoverageDialog(); }}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{coverageDialog.mode === "manage" ? `Manage ${activeCoverageName} products` : `Copy ${activeCoverageName} setup`}</ModalHeader>
        <ModalBody className="pb-5">
          {coverageDialog.mode === "manage" ? <>
            <p className="text-sm leading-6 text-default-500">Select only the products you want to remove from this country. Nothing changes until you confirm.</p>
            <SearchableSelect label="Products to remove" placeholder="Search assigned products" allowSelectAll={false} options={(activeCoverageAssignment?.productTemplateIds || []).map((templateId) => ({ key: templateId, label: templateName(templateId) }))} value={coverageSelections} onChange={setCoverageSelections} />
            {coverageSelections.length === activeCoverageAssignment?.productTemplateIds.length && coverageSelections.length > 0 ? <p className="rounded-xl bg-danger-50 p-3 text-xs leading-5 text-danger">Removing every product will also remove {activeCoverageName} from current coverage.</p> : null}
          </> : <>
            <p className="text-sm leading-6 text-default-500">Choose the countries that should also receive {activeCoverageName}’s products. Existing products in those countries will be kept.</p>
            <div className="rounded-xl bg-default-100 p-3"><span className="text-xs text-default-500">Products being copied</span><div className="mt-2 flex flex-wrap gap-2">{(activeCoverageAssignment?.productTemplateIds || []).map((templateId) => <Chip key={templateId} size="sm" variant="flat">{templateName(templateId)}</Chip>)}</div></div>
            <SearchableSelect label="Target countries" placeholder="Search target countries" options={countries.filter((country) => country._id !== coverageDialog.countryId).map((country) => ({ key: country._id, label: country.name }))} value={coverageSelections} onChange={setCoverageSelections} />
          </>}
        </ModalBody>
        <ModalFooter><Button variant="light" onPress={closeCoverageDialog}>Cancel</Button>{coverageDialog.mode === "manage" ? <Button color="danger" isDisabled={!coverageSelections.length} onPress={removeCountryProducts}>Remove {coverageSelections.length || "selected"} {coverageSelections.length === 1 ? "product" : "products"}</Button> : <Button color="success" isDisabled={!coverageSelections.length} startContent={<FiCopy />} onPress={copyCountryProducts}>Copy to {coverageSelections.length || "selected"} {coverageSelections.length === 1 ? "country" : "countries"}</Button>}</ModalFooter>
      </ModalContent>
    </Modal>
    <Modal isOpen={requestModal.open} onOpenChange={(open) => setRequestModal((current) => ({ ...current, open }))}>
      <ModalContent><ModalHeader>Add {requestModal.kind.toLowerCase()}</ModalHeader><ModalBody>
        <p className="text-sm text-default-500">This option will stay private to your draft until an administrator approves it.</p>
        <Input autoFocus label="Option name" labelPlacement="outside" placeholder={`Enter ${requestModal.kind.toLowerCase()} name`} isRequired value={requestModal.name} onValueChange={(name) => setRequestModal((current) => ({ ...current, name }))} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); requestOption(); } }} />
        <Textarea label="Description" labelPlacement="outside" placeholder="Explain what this option represents" value={requestModal.description} onValueChange={(description) => setRequestModal((current) => ({ ...current, description }))} />
        {requestModal.kind === "PARAMETER" ? <Input label="Unit" labelPlacement="outside" placeholder="e.g. mg/kg" value={requestModal.unit} onValueChange={(unit) => setRequestModal((current) => ({ ...current, unit }))} /> : null}
        {["TEST", "PARAMETER"].includes(requestModal.kind) ? <Input label="Method" labelPlacement="outside" placeholder="Optional testing method" value={requestModal.method} onValueChange={(method) => setRequestModal((current) => ({ ...current, method }))} /> : null}
      </ModalBody><ModalFooter><Button variant="light" onPress={() => setRequestModal((current) => ({ ...current, open: false }))}>Cancel</Button><Button color="success" onPress={requestOption}>Add and select</Button></ModalFooter></ModalContent>
    </Modal>
  </div></section>;
}
