"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardBody, Chip, Radio, RadioGroup } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { FiArrowLeft, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { LuTruck } from "react-icons/lu";
import { getData } from "@/core/api/apiHandler";
import { serviceDirectoryRoutes } from "@/core/api/apiRoutes";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { categoryLabel, ServiceDirectoryProvider } from "@/types/serviceDirectory";

export default function ServiceProviderDetailPage() {
  const params = useParams(); const router = useRouter(); const companyId = String(params.companyId || ""); const [vehicleId, setVehicleId] = useState("");
  const providerQuery = useQuery({ queryKey: ["service-provider", companyId], queryFn: async () => (await getData(serviceDirectoryRoutes.detail(companyId))).data.data, enabled: Boolean(companyId) });
  const provider: ServiceDirectoryProvider | undefined = providerQuery.data; const transport = provider?.categories.includes("inland-transportation");
  const vehicleQuery = useQuery({ queryKey: ["service-provider-vehicles", companyId], queryFn: async () => (await getData(serviceDirectoryRoutes.vehicles(companyId))).data.data || [], enabled: Boolean(companyId && transport) });
  if (providerQuery.isLoading) return <LoadingState title="Loading provider" message="Retrieving approved company capabilities."/>;
  if (providerQuery.isError || !provider) return <ErrorState title="Unable to load this service provider" onRetry={() => providerQuery.refetch()}/>;
  const requestUrl = `/dashboard/requirements/new?service=transportation&providerCompanyId=${companyId}${vehicleId ? `&vehicleId=${vehicleId}` : ""}`;
  return <main className="space-y-6 pb-16"><Button as={Link} href="/dashboard/services" variant="light" startContent={<FiArrowLeft/>}>Service providers</Button><Card><CardBody className="gap-5 p-6"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-black">{provider.name}</h1>{provider.verified ? <Chip color="success">Verified</Chip> : null}</div><p className="mt-2 flex items-center gap-2 text-sm text-default-500"><FiMapPin/>{provider.location?.label || "Location not supplied"}</p></div><p className="max-w-3xl leading-7 text-default-600">{provider.summary || "Approved OBAOL service provider."}</p><div className="flex flex-wrap gap-2">{provider.categories.map((category) => <Chip key={category} variant="flat">{categoryLabel(category)}</Chip>)}</div><div className="flex flex-wrap gap-2 border-t pt-4"><Button as="a" href={provider.contact.phone ? `tel:${provider.contact.phone}` : undefined} isDisabled={!provider.contact.phone} startContent={<FiPhone/>}>Call</Button><Button as="a" href={provider.contact.email ? `mailto:${provider.contact.email}` : undefined} isDisabled={!provider.contact.email} startContent={<FiMail/>}>Email</Button>{provider.specialized.labProfileId ? <Button as={Link} href={`/dashboard/quality-labs/${provider.specialized.labProfileId}`}>Lab profile</Button> : null}{provider.specialized.packagingProfileId ? <Button as={Link} href={`/dashboard/packaging/${provider.specialized.packagingProfileId}`}>Packaging profile</Button> : null}{provider.specialized.freightProfileId ? <Button as={Link} href={`/dashboard/freight-forwarding/${provider.specialized.freightProfileId}`}>Freight profile</Button> : null}</div></CardBody></Card>
    {transport ? <section className="space-y-4"><div><h2 className="text-2xl font-black">Company trucks</h2><p className="text-sm text-default-500">Choose a published truck to prefill a transport request. The provider must confirm availability.</p></div>{vehicleQuery.isLoading ? <LoadingState title="Loading company trucks" message="Checking the published fleet."/> : !(vehicleQuery.data || []).length ? <Card><CardBody className="p-8 text-center text-default-500">This company has no publicly selectable trucks right now.</CardBody></Card> : <><RadioGroup value={vehicleId} onValueChange={setVehicleId} classNames={{ wrapper: "grid gap-3 md:grid-cols-2 xl:grid-cols-3" }}>{vehicleQuery.data.map((truck: any) => <Radio key={truck._id} value={truck._id} classNames={{ base: "m-0 max-w-none rounded-2xl border border-default-200 bg-content1 p-4", label: "w-full" }}><div className="ml-2"><div className="flex items-center gap-2"><LuTruck/><b>{truck.publicAlias || [truck.manufacturer, truck.model].filter(Boolean).join(" ") || truck.vehicleType}</b></div><p className="mt-1 text-xs text-default-500">{truck.vehicleType} · {truck.capacity} {truck.capacityUnit} · {truck.status}</p></div></Radio>)}</RadioGroup><Button color="primary" isDisabled={!vehicleId} onPress={() => router.push(requestUrl)}>Request selected company and truck</Button></>}</section> : null}</main>;
}
