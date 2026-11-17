"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, CardBody, Input, Select, SelectItem } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getData, postData } from "@/core/api/apiHandler";
import { inlandTransportationRoutes as api } from "@/core/api/apiRoutes";
import { TransportEmpty, TransportError, TransportHeader, TransportLoading, TransportScopeRequired, TripStatus } from "@/components/inland-transportation/InlandWorkspace";
import { useTransportCompany } from "@/components/inland-transportation/TransportCompanyScope";
import type { InlandTrip } from "@/types/inlandTransportation";
import type { LocationSlot } from "@/types/location";

const MultiLocationSelector = dynamic(() => import("@/components/location/MultiLocationSelector"), { ssr: false });
const emptySlots = (): LocationSlot[] => [{ id: "origin", label: "Origin", required: true, value: null }, { id: "destination", label: "Destination", required: true, value: null }];
const blank = { segmentLabel: "", cargoDescription: "", scheduledPickupAt: "" };

export default function TripsPage() {
  const searchParams = useSearchParams(), { companyId, params } = useTransportCompany(), queryClient = useQueryClient();
  const [search, setSearch] = useState(""), [status, setStatus] = useState(searchParams.get("status") || ""), [show, setShow] = useState(false);
  const [form, setForm] = useState(blank), [routeSlots, setRouteSlots] = useState<LocationSlot[]>(emptySlots);
  const query = useQuery({ queryKey: ["inland-trips", companyId, search, status], queryFn: async () => (await getData(api.trips, { ...params, search, status })).data.data || [], enabled: Boolean(companyId) });
  const close = () => { setShow(false); setForm(blank); setRouteSlots(emptySlots()); };
  const create = useMutation({ mutationFn: () => postData(api.trips, { ...form, companyId, scheduledPickupAt: form.scheduledPickupAt || null, routePoints: routeSlots.map((slot, index) => ({ slotId: slot.id, role: index === 0 ? "ORIGIN" : index === routeSlots.length - 1 ? "DESTINATION" : "WAYPOINT", order: index, location: slot.value })) }), onSuccess: () => { close(); queryClient.invalidateQueries({ queryKey: ["inland-trips", companyId] }); } });
  const routeComplete = routeSlots.every(slot => !slot.required || slot.value);
  return <main className="space-y-6 pb-16">
    <TransportHeader title="Transport Trips" description="Plan, dispatch, track, and close every awarded or manually recorded inland movement." action={<Button color="primary" onPress={() => setShow(true)} isDisabled={!companyId}>Create trip</Button>} />
    {!companyId ? <TransportScopeRequired /> : <><div className="grid gap-3 sm:grid-cols-[1fr_220px]"><Input aria-label="Search trips" placeholder="Search reference, route, or cargo" value={search} onValueChange={setSearch} /><Select aria-label="Filter trip status" placeholder="All statuses" selectedKeys={status ? new Set([status]) : new Set()} onSelectionChange={keys => setStatus(String(Array.from(keys as Set<string>)[0] || ""))}>{["PLANNED", "DISPATCHED", "AT_PICKUP", "LOADING", "IN_TRANSIT", "DELIVERED", "COMPLETED", "EXCEPTION", "CANCELLED"].map(value => <SelectItem key={value}>{value.replaceAll("_", " ")}</SelectItem>)}</Select></div>{query.isLoading ? <TransportLoading /> : query.isError ? <TransportError error={query.error} retry={() => query.refetch()} /> : query.data.length ? <div className="grid gap-4 lg:grid-cols-2">{query.data.map((trip: InlandTrip) => <Card key={trip._id}><CardBody className="gap-3 p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-obaol-600">{trip.reference}</p><h2 className="text-xl font-black">{trip.segmentLabel}</h2></div><TripStatus value={trip.status} /></div><p className="text-sm">{trip.origin || "Origin pending"} → {trip.destination || "Destination pending"}</p><p className="text-xs text-default-500">{trip.currentLocation ? `Last location: ${trip.currentLocation}` : "No location update"}</p><Button as={Link} href={`/dashboard/inland-transportation/trips/${trip._id}?companyId=${companyId}`} variant="bordered">Open control tower</Button></CardBody></Card>)}</div> : <TransportEmpty title="No trips found" description="Awarded transportation work appears automatically, or create a trip for an offline movement." />}</>}
    {show && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4"><form onSubmit={event => { event.preventDefault(); if (routeComplete) create.mutate(); }} className="my-6 w-full max-w-3xl space-y-4 rounded-3xl bg-content1 p-6"><h2 className="text-2xl font-black">Create manual trip</h2><Input label="Trip / segment label" value={form.segmentLabel} onValueChange={segmentLabel => setForm({ ...form, segmentLabel })} isRequired /><MultiLocationSelector slots={routeSlots} onChange={setRouteSlots} height={320} countryCode="IN" /><Input label="Cargo" value={form.cargoDescription} onValueChange={cargoDescription => setForm({ ...form, cargoDescription })} /><Input label="Scheduled pickup" type="datetime-local" value={form.scheduledPickupAt} onValueChange={scheduledPickupAt => setForm({ ...form, scheduledPickupAt })} />{create.isError && <p className="text-sm text-danger">{(create.error as any)?.response?.data?.message || "Trip could not be created."}</p>}<div className="flex justify-end gap-2"><Button variant="light" onPress={close}>Cancel</Button><Button type="submit" color="primary" isDisabled={!routeComplete} isLoading={create.isPending}>Create trip</Button></div></form></div>}
  </main>;
}
