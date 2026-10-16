"use client";
import { useQuery } from "@tanstack/react-query";
import { Accordion, AccordionItem, Button, Card, CardBody, Chip, Spinner } from "@nextui-org/react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import type { LabProfile } from "@/types/labProfile";
import { optionId, optionName, whatsappHref } from "@/types/labProfile";

const supplied = (values: string[]) => values.length ? values.join(", ") : "Not supplied";

export default function LabDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const query = useQuery({ queryKey: ["lab-profile", id], queryFn: async () => (await getData(apiRoutes.labProfiles.detail(id))).data.data as LabProfile });
  if (query.isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner color="success" /></div>;
  const profile = query.data?.published;
  if (!profile) return <div className="p-10 text-center">Published lab not found.</div>;
  const templateById = new Map(profile.productCapabilityTemplates.map((template) => [String(template._id), template]));
  const whatsAppUrl = whatsappHref(profile.whatsappPhone);
  return <section className="min-h-screen bg-background p-4 md:p-8"><div className="mx-auto max-w-5xl space-y-5">
    <Button variant="light" startContent={<FiArrowLeft />} onPress={() => router.push("/dashboard/quality-labs")}>Back to labs</Button>
    <Card className="border border-default-200"><CardBody className="gap-5 p-6 md:p-8"><div><h1 className="text-3xl font-black">{profile.displayName}</h1><p className="mt-2 flex items-center gap-2 text-default-500"><FiMapPin />{profile.address}, {[profile.city, profile.state, optionName(profile.physicalCountryId)].filter(Boolean).join(", ")}</p></div>{profile.summary ? <p>{profile.summary}</p> : null}<div className="flex flex-wrap gap-3"><Button as="a" href={profile.contactPhone ? `tel:${profile.contactPhone}` : undefined} isDisabled={!profile.contactPhone} color="success" startContent={<FiPhone />}>Call {profile.contactPhone || "lab"}</Button><Button as="a" href={whatsAppUrl} target={whatsAppUrl ? "_blank" : undefined} rel={whatsAppUrl ? "noopener noreferrer" : undefined} isDisabled={!whatsAppUrl} color="success" variant="flat" startContent={<FaWhatsapp />}>WhatsApp</Button><Button as="a" href={profile.contactEmail ? `mailto:${profile.contactEmail}` : undefined} isDisabled={!profile.contactEmail} variant="bordered" startContent={<FiMail />}>Email lab</Button></div></CardBody></Card>
    <div><h2 className="text-xl font-black">Country-wise product coverage</h2><p className="text-sm text-default-500">Open a country to review its products, testing capabilities, and verified credentials.</p></div>
    <Accordion variant="splitted">{profile.countryAssignments.map((assignment) => <AccordionItem key={optionId(assignment.countryId)} title={optionName(assignment.countryId)} subtitle={`${assignment.productTemplateIds.length} product capability set(s)`}><div className="space-y-3 pb-4">{assignment.productTemplateIds.map((templateId) => { const template = templateById.get(String(templateId)); if (!template) return null; const credentials = profile.credentials.filter((credential) => template.credentialIds.includes(optionId(credential.accreditationId))); return <Card key={templateId} className="border border-default-200"><CardBody className="gap-3"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold">{template.name || optionName(template.commodityId)}</h3><Chip variant="flat">{optionName(template.commodityId)}</Chip>{template.qualityClassifications.map((value) => <Chip key={value} color="success" variant="flat">{value}</Chip>)}</div><div><b>Tests:</b> {supplied(template.testIds.map(optionName))}</div><div><b>Parameters:</b> {supplied(template.parameterIds.map(optionName))}</div><div><b>Method:</b> {template.method || "Not supplied"}</div><div><b>Turnaround:</b> {template.turnaroundDays == null ? "Not supplied" : `${template.turnaroundDays} day(s)`}</div><div><b>Sample requirements:</b> {template.sampleRequirements || "Not supplied"}</div><div className="flex flex-wrap gap-2">{credentials.length ? credentials.map((credential, index) => { const valid = credential.verificationStatus === "VERIFIED" && (!credential.validTo || new Date(credential.validTo) >= new Date()); return <Chip key={credential._id || `${optionId(credential.accreditationId)}-${index}`} color={valid ? "success" : "default"} variant="flat">{optionName(credential.accreditationId)}{credential.credentialNumber ? ` · ${credential.credentialNumber}` : ""} · {valid ? "Verified" : "Not verified"}</Chip>; }) : <span><b>Certificates/accreditations:</b> Not supplied</span>}</div></CardBody></Card>; })}</div></AccordionItem>)}</Accordion>
  </div></section>;
}
