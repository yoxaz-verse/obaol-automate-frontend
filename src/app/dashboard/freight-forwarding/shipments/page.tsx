"use client";
import Link from "next/link";
import { Button, Card, CardBody, Tab, Tabs } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { FiPackage } from "react-icons/fi";
import { getData } from "@/core/api/apiHandler";
import { freightForwardingRoutes as api } from "@/core/api/apiRoutes";
import { FreightHeader, StatusChip, freightLabel, freightMessage } from "@/components/freight/FreightUI";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
export default function FreightShipmentsPage(){
 const [state,setState]=React.useState("active"),[mode,setMode]=React.useState("ALL"); const query=useQuery({queryKey:["freight-shipments",state,mode],queryFn:async()=>(await getData(api.shipments,{state,...(mode!=="ALL"?{workflowMode:mode}:{})})).data.data||[]});
 return <main className="space-y-6 pb-16"><FreightHeader eyebrow="Operations · Control tower" title="Freight Shipments" description="Operate OBAOL-awarded and traditional offline shipments from one canonical record, with a simplified legacy view when needed." actionHref="/dashboard/freight-forwarding/shipments/new" actionLabel="Create manual shipment"/><div className="flex flex-wrap justify-between gap-3"><Tabs selectedKey={state} onSelectionChange={k=>setState(String(k))} color="primary"><Tab key="active" title="Active"/><Tab key="history" title="History"/></Tabs><Tabs selectedKey={mode} onSelectionChange={k=>setMode(String(k))} variant="bordered"><Tab key="ALL" title="All workflows"/><Tab key="FULL" title="Full operations"/><Tab key="LEGACY" title="Legacy tracker"/></Tabs></div>
 {query.isLoading?<LoadingState title="Loading freight shipments" message="Fetching active and historical shipments."/>:query.isError?<ErrorState title="Unable to load freight shipments" message={freightMessage(query.error)} onRetry={()=>query.refetch()}/>:!(query.data||[]).length?<EmptyState title="No freight shipments found" description={state==="active"?"Awarded freight shipments appear here automatically, or you can create a manual shipment to get started.":"No completed or archived freight shipments match these filters."} icon={<FiPackage size={28}/>} action={{label:"Create manual shipment",href:"/dashboard/freight-forwarding/shipments/new"}}/>:<div className="grid gap-4 xl:grid-cols-2">{(query.data||[]).map((s:any)=><Card key={s._id}><CardBody className="gap-4 p-5"><div className="flex justify-between gap-3"><div><p className="text-xs font-bold text-primary">{s.reference}</p><h2 className="text-xl font-black">{s.customerCompany?.name||s.customerName||"Freight shipment"}</h2></div><StatusChip value={s.status}/></div><div className="grid grid-cols-2 gap-3 rounded-xl bg-default-50 p-3 text-sm"><p>{s.origin?.name||"Origin"} → {s.destination?.name||"Destination"}</p><p>{(s.modes||[]).join(" + ")}</p><p>{freightLabel(s.source)}</p><p>{freightLabel(s.workflowMode)}</p></div><Button as={Link} href={`/dashboard/freight-forwarding/shipments/${s._id}`} color="primary" variant="bordered">Open control tower</Button></CardBody></Card>)}</div>}
 </main>;
}
import React from "react";

