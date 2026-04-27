"use client";

import React, { useContext, useEffect } from "react";
import { Button } from "@heroui/react";
import { Tabs, Tab, Tooltip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Input, Chip } from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Title from "@/components/titles";
import QueryComponent from "@/components/queryComponent";

import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import AuthContext from "@/context/AuthContext";
import useFilteredStatusOptions from "@/utils/roleActivityStatus";
import StatsHeader from "@/components/dashboard/enquiries/StatsHeader";
import EnquiryStatus from "@/components/dashboard/enquiries/EnquiryStatus";
import EnquiryCard from "@/components/dashboard/enquiries/EnquiryCard";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, patchData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import { useSoundEffect } from "@/context/SoundContext";

/**
 * The main Enquiry page
 */
export default function EnquiryPage() {
  const isValidObjectId = (value: any) => /^[a-f0-9]{24}$/i.test(String(value || "").trim());
  const [selectedType, setSelectedType] = React.useState<string>("All");
  const [selectedStage, setSelectedStage] = React.useState<string>("All");
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [navigatingId, setNavigatingId] = React.useState<string | null>(null);
  const router = useRouter();
  const tableConfig = { ...initialTableConfig };
  const filteredStatusOptions = useFilteredStatusOptions();

  useEffect(() => {
    setNavigatingId(null);
    patchData(apiRoutes.notifications.markSectionRead("enquiries"), {}).catch(() => { });
  }, []);
  const queryClient = useQueryClient();
  const { play } = useSoundEffect();

  let columns = generateColumns("enquiry", tableConfig);
  columns = columns.filter(
    (col: any) => col.key !== "commission" && col.key !== "mediatorCommission"
  );
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isSystemAdmin = roleLower === "admin";
  const isOperatorUser = roleLower === "operator" || roleLower === "team";
  const isAssociate = roleLower === "associate";
  const associateCompanyId = (user as any)?.associateCompanyId || null;


  return (
    <section className="">
      <Title title="Enquiry" />



      <div className="mx-2 md:mx-6 mb-8 rounded-[2rem] border border-default-300 dark:border-white/20 bg-white dark:bg-[#04070f] px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-500/10 border border-warning-500/20 flex items-center justify-center">
                <FiArrowRight size={20} className="text-warning-600 rotate-180" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-default-500">
                Execute new enquiries from the <span className="text-warning-500">Marketplace Terminal</span>
            </p>
        </div>
        <Button
          variant="flat"
          onPress={() => router.push("/dashboard/marketplace")}
          className="w-full md:w-auto font-black uppercase text-[10px] tracking-widest rounded-xl bg-warning-500 text-black h-11 shadow-lg shadow-warning-500/10"
        >
          Go to Marketplace
        </Button>
      </div>

      <QueryComponent
        api={apiRoutesByRole["enquiry"]}
        queryKey={["enquiry"]}
        page={1}
        limit={20}
      >
        {(enquiryResponse: any) => {
          const extractArray = (raw: any): any[] => {
            if (raw?.data && Array.isArray(raw.data)) return raw.data;
            if (Array.isArray(raw)) return raw;
            return [];
          };

          const enquiriesData = extractArray(enquiryResponse);

          const tableData = enquiriesData.map((item: any, index: number) => {
            const {
              isDeleted,
              isActive,
              password,
              __v,
              commission,
              mediatorCommission,
              adminCommission,
              rate,
              ...rest
            } = item;

            const supplierOperatorId = (item.supplierOperatorId?._id || item.supplierOperatorId || "").toString();
            const dealCloserOperatorId = (item.dealCloserOperatorId?._id || item.dealCloserOperatorId || "").toString();
            const isAssignedOperator = Boolean(
              isOperatorUser &&
                user?.id &&
                (supplierOperatorId === String(user.id) || dealCloserOperatorId === String(user.id))
            );
            const createdById = (item.createdBy?._id || item.createdBy || "").toString();
            const isCreatedByOperator = Boolean(isOperatorUser && user?.id && createdById === String(user.id));
            const isAdmin = isSystemAdmin || isAssignedOperator;
            const data: any = { ...rest, rate: rate || 0 };

            // Determine if the user is the mediator
            const isMediator = item.mediatorAssociateId?._id
              ? item.mediatorAssociateId._id.toString() === user?.id?.toString()
              : item.mediatorAssociateId === user?.id?.toString();
            const isBuying = (item.buyerAssociateId?._id || item.buyerAssociateId)?.toString() === user?.id?.toString();
            const isSelling = (item.sellerAssociateId?._id || item.sellerAssociateId)?.toString() === user?.id?.toString();

            if (isAdmin) {
              data.adminCommission = adminCommission || commission || 0;
              data.mediatorCommission = mediatorCommission || 0;
            } else if (isMediator) {
              data.mediatorCommission = mediatorCommission || 0;
              data.rate = (rate || 0) + (adminCommission || commission || 0) + (mediatorCommission || 0);
            } else {
              const totalComm = (adminCommission || commission || 0) + (mediatorCommission || 0);
              if (isBuying) {
                data.rate = (rate || 0) + totalComm;
              } else if (isSelling) {
                data.rate = rate || 0;
              } else {
                data.rate = (rate || 0) + totalComm;
              }
            }

            const getOperatorName = (operator: any) => {
              if (!operator) return "OBAOL Desk";
              if (typeof operator === 'object' && operator !== null) {
                return operator.name || operator.firstName || operator.email || "OBAOL Desk";
              }
              if (typeof operator === "string" && /^[a-f0-9]{24}$/i.test(operator)) {
                return "Assigned team member";
              }
              return operator || "OBAOL Desk";
            };

            const getDateInfo = (dateString: string | undefined) => {
              if (!dateString) return { color: "default" as const };
              const date = new Date(dateString);
              const now = new Date();
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const queryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              const diffTime = today.getTime() - queryDate.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays === 0) return { color: "success" as const };
              if (diffDays === 1) return { color: "warning" as const };
              if (diffDays <= 7) return { color: "primary" as const };
              return { color: "default" as const };
            };

            const dateInfo = getDateInfo(item.createdAt);

            const getStatusKey = (status: any) => {
              const statusName = String(typeof status === "string" ? status : status?.name || "").toUpperCase();
              if (statusName === "CANCELLED") return "Cancelled";
              if (statusName === "CLOSED") return "Succeeded";
              if (statusName === "COMPLETED") return "Completed";
              if (statusName === "CONVERTED") return "Converted";
              if (item?.responsibilitiesFinalizedAt) return "Converted";
              if (item?.buyerConfirmedAt || item?.sellerAcceptedAt) return "Pending";

              const mapping: Record<string, string> = {
                "NEW": "Pending",
                "CONTACTED": "Pending",
                "IN_DISCUSSION": "Pending",
                "QUOTE_REQUIRED": "Pending",
              };

              return mapping[statusName] || "Pending";
            };

            const typeValue = isBuying ? "Buying" : (isSelling ? "Selling" : "Mediated");

            let counterpartyStr = "";
            let counterpartyLabelStr = "";
            let companyStr = "";
            const buyerObj = typeof item.buyerAssociateId === "object" ? item.buyerAssociateId : null;
            const sellerObj = typeof item.sellerAssociateId === "object" ? item.sellerAssociateId : null;
            const extractCompanyName = (associate: any, fallbackField: string) =>
              associate?.associateCompany?.name ||
              associate?.associateCompanyId?.name ||
              associate?.company?.name ||
              item?.[fallbackField] ||
              "N/A";
            const buyerName =
              buyerObj?.name ||
              item.buyerAssociateName ||
              item.buyerName ||
              (typeof item.buyerAssociateId === "string" ? `Associate (${item.buyerAssociateId.slice(-6)})` : "N/A");
            const sellerName =
              sellerObj?.name ||
              item.sellerAssociateName ||
              item.sellerName ||
              (typeof item.sellerAssociateId === "string" ? `Associate (${item.sellerAssociateId.slice(-6)})` : "N/A");
            const buyerCompany = extractCompanyName(buyerObj, "buyerAssociateCompanyName");
            const sellerCompany = extractCompanyName(sellerObj, "sellerAssociateCompanyName");

            if (isAdmin) {
              counterpartyStr = `${buyerName} / ${sellerName}`;
              counterpartyLabelStr = "Buyer / Supplier";
              companyStr = `${buyerCompany} / ${sellerCompany}`;
            } else if (isBuying) {
              counterpartyStr = sellerName;
              counterpartyLabelStr = "Supplier";
              companyStr = sellerCompany;
            } else if (isSelling) {
              counterpartyStr = buyerName;
              counterpartyLabelStr = "Buyer";
              companyStr = buyerCompany;
            }

            return {
              ...data,
              type: typeValue,
              isBuying,
              isSelling,
              specification: item.specifications || "No Spec",
              product: item.productId?.name || "N/A",
              counterparty: counterpartyStr,
              counterpartyLabel: counterpartyLabelStr,
              associateCompany: companyStr,
              assignedOperator: getOperatorName(item.supplierOperatorId),
              mediatorAssociate: item.mediatorAssociateId?.name || "Direct",
              dateColor: dateInfo.color,
              status: getStatusKey(item.status),
              quantity: item.quantity || null,
              isAdmin,
              supplierPhone: item.sellerAssociateId?.phone || "N/A",
              buyerPhone: item.buyerAssociateId?.phone || "N/A",
              operatorPhone: item.supplierOperatorId?.phone || "+917306096941",
              isAssignedOperator,
              isCreatedByOperator,
            };
          });

          const scopedData = tableData.filter((item: any) => {
            if (!isOperatorUser) return true;
            return Boolean(item.isAssignedOperator || item.isCreatedByOperator);
          });

          const filteredData = scopedData.filter((item: any) => {
            const matchesType = selectedType === "All" || item.type === selectedType;
            const matchesStage = selectedStage === "All" || item.status === selectedStage;
            return matchesType && matchesStage;
          });

          return (
            <div className="flex flex-col w-full px-4 md:px-6">
              <div className="w-full">
                <StatsHeader data={enquiriesData} />

                <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2 no-scrollbar touch-pan-x">
                  <Tabs
                    selectedKey={selectedType}
                    onSelectionChange={(key) => {
                      setIsTransitioning(true);
                      setSelectedType(key as string);
                      setTimeout(() => setIsTransitioning(false), 400);
                    }}
                    variant="underlined"
                    color="primary"
                    className="w-fit"
                    classNames={{
                      tabList: "gap-6 relative rounded-none p-0 border-b border-divider/40",
                      cursor: "bg-warning-500 w-full h-[3px] rounded-t-full",
                      tab: "max-w-fit px-2 h-12 transition-all duration-300",
                      tabContent: "font-black uppercase tracking-[0.15em] text-[10px] text-default-400 group-data-[selected=true]:text-warning-500"
                    }}
                  >
                    <Tab key="All" title="Global Pipeline" />
                    <Tab key="Buying" title="My Acquisitions" />
                    <Tab key="Selling" title="Supply Streams" />
                  </Tabs>
                </div>

                <div className="flex justify-between items-center mb-8 overflow-x-auto pb-2 no-scrollbar touch-pan-x">
                  <Tabs
                    aria-label="Enquiry Stages"
                    color="primary"
                    variant="underlined"
                    selectedKey={selectedStage}
                    onSelectionChange={(key) => {
                      setIsTransitioning(true);
                      setSelectedStage(key as string);
                      setTimeout(() => setIsTransitioning(false), 400);
                    }}
                    className="w-fit"
                    classNames={{
                      tabList: "gap-6 relative rounded-none p-0 border-b border-divider/40",
                      cursor: "bg-warning-500/60 w-full h-[2px] rounded-t-full",
                      tab: "max-w-fit px-2 h-10 transition-all duration-300",
                      tabContent: "font-black uppercase tracking-[0.12em] text-[9px] text-default-500 group-data-[selected=true]:text-warning-500"
                    }}
                  >
                    <Tab key="All" title="Full Stack" />
                    <Tab key="Pending" title="New" />
                    <Tab key="Converted" title="Converted" />
                    <Tab key="Completed" title="Closed" />
                    <Tab key="Cancelled" title="Dormant" />
                  </Tabs>
                </div>

                <section className="py-2 w-full min-h-[400px] relative">
                  <AnimatePresence mode="wait">
                    {isTransitioning ? (
                      <motion.div
                        key="transition-loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[2px] rounded-2xl"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-10 h-10 border-2 border-warning-500/20 border-t-warning-500 rounded-full animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-warning-500 animate-pulse">
                            Syncing Pipeline
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`${selectedType}-${selectedStage}`}
                        layout
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
                      >
                        {filteredData.map((item: any, index: number) => (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.02 }}
                          >
                            <EnquiryCard
                              data={item}
                              onCardClick={() => {
                                if (navigatingId) return;
                                const targetId = String(item?._id || item?.id || "").trim();
                                if (!isValidObjectId(targetId)) return;
                                play("nav");
                                setNavigatingId(targetId);
                                router.push(`/dashboard/enquiries/${targetId}`);
                              }}
                              action={
                                <Tooltip
                                  content="View Details"
                                  classNames={{
                                    content: "bg-content1 text-foreground border border-default-200 shadow-none"
                                  }}
                                >
                                  <Button
                                    isIconOnly
                                    isLoading={navigatingId === String(item?._id || item?.id || "")}
                                    variant="flat"
                                    onPress={(e) => {
                                      if (navigatingId) return;
                                      const targetId = String(item?._id || item?.id || "").trim();
                                      if (!isValidObjectId(targetId)) return;
                                      play("nav");
                                      setNavigatingId(targetId);
                                      router.push(`/dashboard/enquiries/${targetId}`);
                                    }}
                                    className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary transition-colors flex items-center justify-center w-10 h-10 bg-default-100 rounded-xl p-0 min-w-10"
                                  >
                                    {!navigatingId || navigatingId !== String(item?._id || item?.id || "") ? <FiArrowRight size={20} /> : null}
                                  </Button>
                                </Tooltip>
                              }
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {filteredData.length === 0 && !isTransitioning && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
                        {/* Icon */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-warning-500/10 blur-2xl rounded-full" />
                          <div className="relative w-20 h-20 rounded-[1.75rem] bg-warning-500/[0.06] border border-warning-500/20 flex items-center justify-center">
                            <FiArrowRight className="-rotate-45 text-warning-500/60" size={28} />
                          </div>
                        </div>

                        {/* Text */}
                        <div className="flex flex-col gap-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-warning-500/80">
                            NO_ENQUIRIES_FOUND
                          </p>
                          <h3 className="text-base font-black text-foreground uppercase tracking-tight leading-snug">
                            {selectedType !== "All"
                              ? `No ${selectedType.toLowerCase()} enquiries in this stage`
                              : "No enquiries in this stage"}
                          </h3>
                          <p className="text-[11px] text-default-400 font-medium leading-relaxed mt-1">
                            Browse the marketplace to discover available commodities and initiate a new trade enquiry.
                          </p>
                        </div>

                        {/* CTA */}
                        <Button
                          variant="flat"
                          onPress={() => router.push("/dashboard/marketplace")}
                          className="font-black uppercase text-[10px] tracking-widest rounded-2xl bg-warning-500 text-black h-11 px-8 shadow-lg shadow-warning-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                          endContent={<FiArrowRight size={14} />}
                        >
                          Go to Marketplace
                        </Button>
                      </div>
                    </motion.div>
                  )}

                </section>
              </div>
            </div>
          );
        }}
      </QueryComponent>


      <AnimatePresence>
        {navigatingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-background/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-8 p-12 rounded-[2rem] bg-background/80 border border-divider shadow-2xl relative overflow-hidden"
            >
              <div className="relative">
                <div className="absolute inset-[-12px] rounded-full border border-primary/20 animate-ping opacity-50" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-20 h-20 border-[3px] border-primary/10 border-t-primary rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 w-20 h-20 border-[3px] border-secondary/10 border-b-secondary rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center text-primary">
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <FiArrowRight size={24} />
                  </motion.div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 text-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary animate-pulse">
                  Opening Enquiry
                </h3>
                <p className="text-[10px] font-semibold text-default-500 uppercase tracking-widest opacity-80 leading-relaxed">
                  Navigating to secure trade stream...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
