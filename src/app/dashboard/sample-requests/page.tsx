"use client";

import React, { useContext, useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { Chip, Input, Card, CardBody, Divider } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LuUser, LuPackage, LuMapPin, LuDatabase, LuArrowRight, LuSearch, LuActivity, LuBox } from "react-icons/lu";

import Title from "@/components/titles";
import AuthContext from "@/context/AuthContext";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";

const statusColor = (status: string) => {
  switch (status) {
    case "REQUESTED": return "warning";
    case "QUOTED": return "primary";
    case "ACCEPTED":
    case "PAYMENT_RECEIVED":
    case "PREPARING_PACKAGING":
    case "PACKAGED":
    case "COURIER_SUBMITTED":
    case "IN_TRANSIT": return "warning";
    case "RECEIPT_CONFIRMED": return "success";
    case "REJECTED": return "danger";
    case "CANCELLED": return "default";
    default: return "default";
  }
};

export default function SampleRequestsPage() {
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isAdmin = roleLower === "admin";
  const isOperatorUser = roleLower === "operator" || roleLower === "team";
  const isAssociate = roleLower === "associate";
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const { data: sampleResponse } = useQuery({
    queryKey: ["sample-requests"],
    queryFn: () => getData(apiRoutes.sampleRequest.list, { page: 1, limit: 100 }),
  });

  const sampleRows = Array.isArray(sampleResponse?.data?.data?.data)
    ? sampleResponse?.data?.data?.data
    : (sampleResponse?.data?.data || []);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sampleRows;
    return (sampleRows || []).filter((row: any) => {
      const productName = row?.variantRateId?.productVariant?.product?.name || "";
      const variantName = row?.variantRateId?.productVariant?.name || "";
      const buyerName = row?.buyerAssociateId?.name || "";
      const supplierName = row?.supplierCompanyId?.name || "";
      const location = `${row?.requestDivision?.name || ""} ${row?.requestDistrict?.name || ""} ${row?.requestState?.name || ""}`;
      const stack = `${productName} ${variantName} ${buyerName} ${supplierName} ${location}`.toLowerCase();
      return stack.includes(term);
    });
  }, [sampleRows, search]);

  return (
    <section className="pb-20">
      <Title title="Sample Requests" />

      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 md:mx-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8"
      >
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-3 mb-1">
              <div className="p-3 bg-warning-500/10 rounded-2xl text-warning-500 shadow-inner">
                 <LuBox size={24} />
              </div>
              <h2 className="text-4xl font-black text-foreground tracking-tight uppercase">Sample <span className="text-warning-500">Hub</span></h2>
           </div>
           <p className="text-[10px] font-black text-default-400 uppercase tracking-[0.2em] ml-1">Protocol Initialization & Sample Logistics Lifecycle</p>
        </div>
        
        <div className="relative w-full max-w-lg group">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Product, Cargo or Entity..."
            size="lg"
            variant="flat"
            className="w-full"
            classNames={{
              input: "font-black text-xs tracking-tight",
              inputWrapper: "h-14 bg-content1/40 hover:bg-content1/60 border border-divider/50 hover:border-warning-500/50 rounded-2xl transition-all pl-12 shadow-xl backdrop-blur-md"
            }}
          />
          <LuSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-warning-500 opacity-40 group-hover:opacity-100 transition-opacity" size={18} />
        </div>
      </motion.div>

      <div className="mx-4 md:mx-10 pb-20">
        {(filteredRows || []).length === 0 ? (
          <div className="rounded-[3rem] border border-dashed border-divider bg-content1/30 px-10 py-40 flex flex-col items-center justify-center text-center backdrop-blur-xl">
             <div className="w-20 h-20 bg-warning-500/10 rounded-3xl flex items-center justify-center mb-8 text-warning-500 shadow-inner">
               <LuDatabase size={36} />
             </div>
             <h4 className="text-2xl font-black text-foreground uppercase tracking-tight">System Empty</h4>
             <p className="text-xs font-bold text-default-400 uppercase tracking-widest mt-3 opacity-60 max-w-sm mx-auto leading-relaxed">Active sourcing sequences not found. Initialize marketplace protocols to track sampling.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {(filteredRows || []).map((row: any, idx: number) => {
              const variantName = row?.variantRateId?.productVariant?.name || "Cargo ID Pending";
              const productName = row?.variantRateId?.productVariant?.product?.name || "Unidentified Product";
              const buyerName = row?.buyerAssociateId?.name || "Unknown Buyer";
              const supplierName = row?.supplierCompanyId?.name || "Unknown Supplier";
              const location = `${row?.requestDivision?.name || row?.requestCity?.name || ""}, ${row?.requestState?.name || ""}`;
              const requestedQty = row?.requestedSampleQtyKg ? `${row.requestedSampleQtyKg} KG` : "N/A";
              const canView = isAdmin || isOperatorUser || isAssociate;
              const isMoving = navigatingId === row._id;

              return (
                <motion.div 
                   key={row._id}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="h-full"
                >
                  <Card className="bg-white dark:bg-[#04070f] border border-default-300 dark:border-white/20 shadow-none rounded-[2rem] overflow-hidden group hover:border-warning-500/30 transition-all duration-500 h-full flex flex-col">
                    <CardBody className="p-0 flex flex-col h-full">
                      <div className="p-6 pb-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between w-full">
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-warning-500 uppercase tracking-widest bg-warning-500/10 px-2 py-0.5 rounded-full border border-warning-500/20">ID: {String(row._id).slice(-6).toUpperCase()}</span>
                                <div className="w-1 h-1 rounded-full bg-warning-500 animate-pulse" />
                            </div>
                            <Chip 
                            size="sm" 
                            variant="flat" 
                            color={statusColor(String(row.status || ""))}
                            className="font-black uppercase text-[8px] tracking-[0.1em] h-6 px-3 border border-white/5"
                            >
                            {String(row.status || "").replaceAll("_", " ").toLowerCase()}
                            </Chip>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-warning-500 transition-colors uppercase leading-tight">{productName}</h3>
                            <p className="text-[9px] font-bold text-default-400 uppercase tracking-widest opacity-70 mt-0.5">{variantName}</p>
                        </div>
                      </div>

                      <div className="px-6 py-5 grid grid-cols-2 gap-y-5 gap-x-6 border-t border-divider/40 flex-grow bg-foreground/[0.02]">
                        {[
                          { label: "Owner", val: buyerName, icon: LuUser, color: "text-blue-500/50" },
                          { label: "Entity", val: supplierName, icon: LuPackage, color: "text-orange-500/50" },
                          { label: "Zone", val: location, icon: LuMapPin, color: "text-emerald-500/50" },
                          { label: "Load", val: requestedQty, icon: LuActivity, color: "text-warning-500/50" },
                        ].map((detail, dIdx) => (
                           <div key={dIdx} className="flex flex-col gap-1 overflow-hidden">
                              <span className="text-[8px] font-black text-default-400 uppercase tracking-[0.1em] flex items-center gap-2 opacity-60">
                                <detail.icon size={10} className={detail.color} />
                                {detail.label}
                              </span>
                              <span className="text-[11px] font-black text-foreground uppercase truncate tracking-tight">{detail.val}</span>
                           </div>
                        ))}
                      </div>

                      <div className="p-6 mt-auto">
                        {canView && (
                          <Button
                            fullWidth
                            className="bg-warning-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl h-10 shadow-lg shadow-warning-500/10 hover:scale-[1.02] active:scale-95 transition-all"
                            isLoading={isMoving}
                            onPress={() => {
                               setNavigatingId(row._id);
                               router.push(`/dashboard/sample-requests/${row._id}`);
                            }}
                            endContent={!isMoving && <LuArrowRight size={14} />}
                          >
                            {isMoving ? "Loading..." : "Execute Flow"}
                          </Button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
