"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Card, CardBody, Chip, Spinner } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { FiArrowLeft, FiCheckCircle, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { getData } from "@/core/api/apiHandler";
import { packagingRoutes } from "@/core/api/apiRoutes";

const names = (values: any[] = []) => values.map((value) => value?.name || value).filter(Boolean).join(", ") || "Not specified";
export default function PackagingProviderPage() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({ queryKey: ["packaging-provider", id], queryFn: async () => (await getData(packagingRoutes.profile(id))).data.data });
  if (query.isLoading) return <div className="grid min-h-64 place-items-center"><Spinner /></div>;
  if (!query.data) return <p>Packaging provider not found.</p>;
  const profile = query.data.published;
  return <main className="space-y-6 pb-16">
    <Button as={Link} href="/dashboard/packaging" variant="light" startContent={<FiArrowLeft />}>Back to Packaging Services</Button>
    <header className="rounded-3xl border border-warning-300/30 bg-warning-50/50 p-6 dark:bg-warning-900/10"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.3em] text-warning-600">Verified packaging provider</p><h1 className="mt-2 text-3xl font-black">{profile.displayName}</h1><p className="mt-2 max-w-3xl text-default-500">{profile.summary}</p></div><Button as={Link} href="/dashboard/packaging?create=true" color="warning">Create packaging requirement</Button></div></header>
    <section className="grid gap-5 lg:grid-cols-[2fr_1fr]"><div className="space-y-4"><h2 className="text-xl font-black">Capabilities</h2>{(profile.capabilities || []).map((capability: any) => <Card key={capability._id || capability.name} className="border border-default-200"><CardBody className="gap-3 p-5"><div className="flex justify-between gap-3"><h3 className="text-lg font-bold">{capability.name}</h3><Chip variant="flat">{capability.turnaroundDays || 0} day turnaround</Chip></div><p className="text-sm text-default-500">{capability.notes}</p><dl className="grid gap-2 text-sm sm:grid-cols-2"><div><dt className="font-bold">Services</dt><dd>{names(capability.serviceIds)}</dd></div><div><dt className="font-bold">Formats</dt><dd>{names(capability.formatIds)}</dd></div><div><dt className="font-bold">Materials</dt><dd>{names(capability.materialIds)}</dd></div><div><dt className="font-bold">Commodities</dt><dd>{names(capability.commodityIds)}</dd></div><div><dt className="font-bold">Capacity</dt><dd>{capability.capacityPerDay || "—"} {capability.quantityUnit || ""} / day</dd></div><div><dt className="font-bold">Minimum quantity</dt><dd>{capability.minimumQuantity || "—"} {capability.quantityUnit || ""}</dd></div></dl></CardBody></Card>)}</div>
      <aside className="space-y-4"><Card><CardBody className="gap-3 p-5"><h2 className="font-black">Contact</h2><p className="flex items-center gap-2"><FiMail />{profile.contactEmail}</p><p className="flex items-center gap-2"><FiPhone />{profile.contactPhone}</p>{profile.website && <a className="text-warning-600" href={profile.website} target="_blank">Visit website</a>}</CardBody></Card><Card><CardBody className="gap-3 p-5"><h2 className="font-black">Coverage</h2>{(profile.locations || []).map((location: any) => <div key={location._id || location.name}><p className="flex items-center gap-2 font-semibold"><FiMapPin />{location.name}</p><p className="text-xs text-default-500">{[location.city, location.state, location.country].filter(Boolean).join(", ")}</p></div>)}</CardBody></Card><Card><CardBody className="gap-3 p-5"><h2 className="font-black">Verified credentials</h2>{(profile.credentials || []).filter((credential: any) => credential.verificationStatus === "VERIFIED").map((credential: any) => <p key={credential._id} className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-success" />{credential.certificationId?.name || credential.issuer}</p>)}</CardBody></Card></aside>
    </section>
  </main>;
}
