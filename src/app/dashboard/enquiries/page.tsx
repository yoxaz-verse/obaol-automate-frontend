"use client";

import React, { useContext, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Input, Chip } from "@heroui/react";
import { Tabs, Tab, Tooltip } from "@nextui-org/react";
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
  const [activeView, setActiveView] = React.useState<string>("enquiries");
  const [selectedType, setSelectedType] = React.useState<string>("All");
  const [selectedStage, setSelectedStage] = React.useState<string>("All");
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [navigatingId, setNavigatingId] = React.useState<string | null>(null);
  const router = useRouter();
  const tableConfig = { ...initialTableConfig };
  const filteredStatusOptions = useFilteredStatusOptions();

  useEffect(() => {
    patchData(apiRoutes.notifications.markSectionRead("enquiries"), {}).catch(() => {});
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

  const [quoteModalOpen, setQuoteModalOpen] = React.useState(false);
  const [markupModalOpen, setMarkupModalOpen] = React.useState(false);
  const [selectedSample, setSelectedSample] = React.useState<any>(null);
  const [quoteMinQty, setQuoteMinQty] = React.useState("");
  const [quotePrice, setQuotePrice] = React.useState("");
  const [markupPercent, setMarkupPercent] = React.useState("");

  const { data: sampleResponse } = useQuery({
    queryKey: ["sample-requests", activeView],
    queryFn: () => getData(apiRoutes.sampleRequest.list, { page: 1, limit: 200 }),
    enabled: activeView === "samples",
  });

  const sampleRows = Array.isArray(sampleResponse?.data?.data?.data)
    ? sampleResponse?.data?.data?.data
    : (sampleResponse?.data?.data || []);

  const quoteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSample) return;
      return patchData(apiRoutes.sampleRequest.quote(selectedSample._id), {
        supplierMinQty: Number(quoteMinQty),
        supplierPrice: Number(quotePrice),
      });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Sample quote submitted.", position: "top-right" });
      setQuoteModalOpen(false);
      setQuoteMinQty("");
      setQuotePrice("");
      queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Unable to submit quote.",
        position: "top-right",
      });
    },
  });

  const decisionMutation = useMutation({
    mutationFn: async (decision: "ACCEPT" | "REJECT") => {
      if (!selectedSample) return;
      return patchData(apiRoutes.sampleRequest.decision(selectedSample._id), { decision });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Decision updated.", position: "top-right" });
      setSelectedSample(null);
      queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Unable to update decision.",
        position: "top-right",
      });
    },
  });

  const markupMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSample) return;
      return patchData(apiRoutes.sampleRequest.markup(selectedSample._id), {
        markupPercent: Number(markupPercent),
      });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Markup updated.", position: "top-right" });
      setMarkupModalOpen(false);
      setMarkupPercent("");
      queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Unable to update markup.",
        position: "top-right",
      });
    },
  });

  return (
    <section className="">
      <Title title="Enquiry" />

      <div className="mx-2 md:mx-6 mb-4">
        <Tabs
          selectedKey={activeView}
          onSelectionChange={(key) => setActiveView(String(key))}
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary h-[2px]",
            tab: "max-w-fit px-0 h-10",
            tabContent: "group-data-[selected=true]:text-primary font-black uppercase tracking-widest text-[10px] opacity-70 group-data-[selected=true]:opacity-100"
          }}
        >
          <Tab key="enquiries" title="Enquiries" />
          <Tab key="samples" title="Sample Requests" />
        </Tabs>
      </div>

      {activeView === "samples" && (
        <div className="mx-2 md:mx-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(sampleRows || []).length === 0 ? (
              <div className="rounded-xl border border-default-200/30 bg-content1 px-4 py-6 text-sm text-default-500">
                No sample requests found.
              </div>
            ) : (
              sampleRows.map((row: any) => {
                const variantName = row?.variantRateId?.productVariant?.name || "Variant";
                const productName = row?.variantRateId?.productVariant?.product?.name || "Product";
                const buyerName = row?.buyerAssociateId?.name || "Buyer";
                const supplierName = row?.supplierCompanyId?.name || "Supplier";
                const location = `${row?.requestCity?.name || "City"}, ${row?.requestDistrict?.name || "District"}, ${row?.requestState?.name || "State"}`;
                const isBuyer = isAssociate && String(row?.buyerAssociateId?._id || row?.buyerAssociateId) === String(user?.id);
                const isSupplier = isAssociate && associateCompanyId && String(row?.supplierCompanyId?._id || row?.supplierCompanyId) === String(associateCompanyId);
                const canQuote = isSupplier && row.status === "REQUESTED";
                const canDecide = isBuyer && row.status === "QUOTED";
                return (
                  <div key={row._id} className="rounded-xl border border-default-200/30 bg-content1 px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{productName} • {variantName}</div>
                      <Chip size="sm" variant="flat" color={row.status === "REQUESTED" ? "warning" : row.status === "QUOTED" ? "primary" : row.status === "ACCEPTED" ? "success" : "default"}>
                        {row.status}
                      </Chip>
                    </div>
                    <div className="mt-2 text-xs text-default-500">Buyer: {buyerName}</div>
                    <div className="text-xs text-default-500">Supplier: {supplierName}</div>
                    <div className="text-xs text-default-500">Location: {location}</div>
                    <div className="mt-2 text-xs text-default-500">
                      Supplier Quote: {row.supplierPrice ? `₹ ${row.supplierPrice}` : "—"} • Min Qty: {row.supplierMinQty || "—"}
                    </div>
                    <div className="text-xs text-default-500">
                      Markup: {row.markupPercent ?? 20}% • Buyer Price: {row.buyerPrice ? `₹ ${row.buyerPrice}` : "—"}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {canQuote && (
                        <Button
                          size="sm"
                          color="warning"
                          variant="flat"
                          onPress={() => {
                            setSelectedSample(row);
                            setQuoteModalOpen(true);
                          }}
                        >
                          Quote Sample
                        </Button>
                      )}
                      {canDecide && (
                        <>
                          <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            onPress={() => {
                              setSelectedSample(row);
                              decisionMutation.mutate("ACCEPT");
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => {
                              setSelectedSample(row);
                              decisionMutation.mutate("REJECT");
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {isSystemAdmin && (
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => {
                            setSelectedSample(row);
                            setMarkupPercent(String(row.markupPercent ?? 20));
                            setMarkupModalOpen(true);
                          }}
                        >
                          Edit Markup
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeView === "enquiries" && (
        <>
          <div className="mx-2 md:mx-6 mb-4 rounded-xl border border-primary-200/60 bg-primary-50/50 dark:bg-primary-900/20 px-3 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Create enquiry from Marketplace by selecting product and variant.
            </p>
            <Button
              color="primary"
              variant="flat"
              onPress={() => router.push("/dashboard/marketplace")}
              className="w-full md:w-auto font-bold tracking-tight rounded-xl"
            >
              Go to Marketplace
            </Button>
          </div>

          <QueryComponent
            api={apiRoutesByRole["enquiry"]}
            queryKey={["enquiry"]}
            page={1}
            limit={50}
          >
            {(enquiryResponse: any) => {
              // Helper to extract array from paginated response
              const extractArray = (raw: any): any[] => {
                if (raw?.data && Array.isArray(raw.data)) return raw.data;
                if (Array.isArray(raw)) return raw;
                return [];
              };

              const enquiriesData = extractArray(enquiryResponse);

              // ... (mapping logic stays same, I skip showing it for brevity)

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

                const assignedOperatorId = (item.assignedOperatorId?._id || item.assignedOperatorId || "").toString();
                const isAssignedOperator = Boolean(isOperatorUser && user?.id && assignedOperatorId === String(user.id));
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
                  // Mediator sees their own commission but not OBAOL commission
                  data.mediatorCommission = mediatorCommission || 0;
                  // Fold admin commission into the displayed rate
                  data.rate = (rate || 0) + (adminCommission || commission || 0) + (mediatorCommission || 0);
                } else {
                  // Regular associate:
                  //  - Buyer: sees full market rate (base + all commissions)
                  //  - Seller: sees only base supplier rate (no commissions)
                  const totalComm = (adminCommission || commission || 0) + (mediatorCommission || 0);
                  if (isBuying) {
                    data.rate = (rate || 0) + totalComm;
                  } else if (isSelling) {
                    data.rate = rate || 0;
                  } else {
                    data.rate = (rate || 0) + totalComm;
                  }
                }

                const getRate = (rateVal: any) => {
                  if (typeof rateVal === 'object' && rateVal !== null) {
                    return rateVal.rate || rateVal.price || rateVal.amount || "N/A";
                  }
                  return rateVal;
                };

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
                  if (statusName === "CANCELLED" || statusName === "CANCELLED") return "Cancelled";
                  if (statusName === "COMPLETED" || statusName === "CLOSED") return "Completed";
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

                if (index === 0) {
                  console.log("DEBUG ROLE DETECTION:", {
                    buying: isBuying,
                    selling: isSelling,
                    buyerId: (item.buyerAssociateId?._id || item.buyerAssociateId)?.toString(),
                    sellerId: (item.sellerAssociateId?._id || item.sellerAssociateId)?.toString(),
                    userId: user?.id?.toString(),
                    buyerObj: item.buyerAssociateId
                  });
                }

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
                  counterpartyStr = `B: ${buyerName} | S: ${sellerName}`;
                  counterpartyLabelStr = "Buyer / Supplier";
                  companyStr = `B: ${buyerCompany} | S: ${sellerCompany}`;
                }

                return {
                  ...data,
                  type: typeValue,
                  isBuying,
                  isSelling,
                  specification: item.specifications || "No Spec",
                  product: item.productId?.name || "N/A",
                  productVariant: "N/A",
                  counterparty: counterpartyStr,
                  counterpartyLabel: counterpartyLabelStr,
                  associateCompany: companyStr,
                  assignedOperator: getOperatorName(item.assignedOperatorId),
                  mediatorAssociate: item.mediatorAssociateId?.name || "Direct",
                  dateColor: dateInfo.color,
                  status: getStatusKey(item.status),
                  quantity: item.quantity || null,
                  isAdmin,
                  supplierPhone: item.sellerAssociateId?.phone || "N/A",
                  buyerPhone: item.buyerAssociateId?.phone || "N/A",
                  operatorPhone: item.assignedOperatorId?.phone || "+917306096941",
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
                <div className="flex flex-col items-center w-full">
                  <div className="w-full px-2 sm:px-4 md:px-0 md:w-[95%]">
                    <StatsHeader data={enquiriesData} />

                    <div className="flex justify-between items-center mb-4 overflow-x-auto pb-2 no-scrollbar touch-pan-x">
                      <Tabs
                        selectedKey={selectedType}
                        onSelectionChange={(key) => {
                          setIsTransitioning(true);
                          setSelectedType(key as string);
                          setTimeout(() => setIsTransitioning(false), 400);
                        }}
                        classNames={{
                          tabList: "gap-4 sm:gap-8 w-full relative rounded-none p-0 border-b border-divider shadow-none",
                          cursor: "w-full bg-primary h-[2px]",
                          tab: "max-w-fit px-0 h-10",
                          tabContent: "group-data-[selected=true]:text-primary font-black uppercase tracking-widest text-[10px] opacity-70 group-data-[selected=true]:opacity-100"
                        }}
                        variant="underlined"
                      >
                        <Tab key="All" title="All" />
                        <Tab key="Buying" title="My Purchases" />
                        <Tab key="Selling" title="Received" />
                      </Tabs>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex justify-between items-center mb-4 overflow-x-auto pb-2 no-scrollbar touch-pan-x">
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
                        classNames={{
                          tabList: "gap-4 sm:gap-8 w-full relative rounded-none p-0 border-b border-divider shadow-none",
                          cursor: "w-full bg-primary h-[2px]",
                          tab: "max-w-fit px-0 h-10",
                          tabContent: "group-data-[selected=true]:text-primary font-black uppercase tracking-widest text-[10px] opacity-70 group-data-[selected=true]:opacity-100"
                        }}
                      >
                        <Tab key="All" title="All Stages" />
                        <Tab key="Pending" title="New" />
                        <Tab key="Converted" title="Converted" />
                        <Tab key="Completed" title="Completed" />
                        <Tab key="Cancelled" title="Cancelled" />
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
                              <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">
                                Filtering Insights
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
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                                    play("nav");
                                    setNavigatingId(item._id);
                                    router.push(`/dashboard/enquiries/${item._id}`);
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
                                        isLoading={navigatingId === item._id}
                                        variant="flat"
                                        onPress={(e) => {
                                          play("nav");
                                          setNavigatingId(item._id);
                                          router.push(`/dashboard/enquiries/${item._id}`);
                                        }}
                                        className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary transition-colors flex items-center justify-center w-10 h-10 bg-default-100 rounded-xl p-0 min-w-10"
                                      >
                                        {!navigatingId || navigatingId !== item._id ? <FiArrowRight size={20} /> : null}
                                      </Button>
                                    </Tooltip>
                                  }
                                />
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {filteredData.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-32 text-default-400"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center">
                              <FiArrowRight className="rotate-90 text-default-300" size={24} />
                            </div>
                            <p className="font-bold uppercase tracking-widest text-xs">No {selectedType !== "All" ? selectedType.toLowerCase() : ""} enquiries found in this stage</p>
                          </div>
                        </motion.div>
                      )}
                    </section>
                  </div>
                </div>
              );
            }}
          </QueryComponent>
        </>
      )}

      <Modal
        isOpen={quoteModalOpen}
        onOpenChange={(open) => {
          setQuoteModalOpen(open);
          if (!open) {
            setQuoteMinQty("");
            setQuotePrice("");
          }
        }}
        isDismissable={!quoteMutation.isPending}
      >
        <ModalContent>
          <ModalHeader>Quote Sample</ModalHeader>
          <ModalBody>
            <Input
              label="Minimum Quantity"
              type="number"
              value={quoteMinQty}
              onChange={(e) => setQuoteMinQty(e.target.value)}
            />
            <Input
              label="Supplier Price"
              type="number"
              value={quotePrice}
              onChange={(e) => setQuotePrice(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setQuoteModalOpen(false)} isDisabled={quoteMutation.isPending}>
              Cancel
            </Button>
            <Button color="warning" onPress={() => quoteMutation.mutate()} isLoading={quoteMutation.isPending}>
              Submit Quote
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={markupModalOpen}
        onOpenChange={(open) => {
          setMarkupModalOpen(open);
          if (!open) setMarkupPercent("");
        }}
        isDismissable={!markupMutation.isPending}
      >
        <ModalContent>
          <ModalHeader>Edit Markup</ModalHeader>
          <ModalBody>
            <Input
              label="Markup Percent"
              type="number"
              value={markupPercent}
              onChange={(e) => setMarkupPercent(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setMarkupModalOpen(false)} isDisabled={markupMutation.isPending}>
              Cancel
            </Button>
            <Button color="primary" onPress={() => markupMutation.mutate()} isLoading={markupMutation.isPending}>
              Update Markup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}
