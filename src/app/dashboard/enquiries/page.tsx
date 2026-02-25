"use client";

import React, { useContext } from "react";
import { Button, Spacer } from "@heroui/react";
import { Tabs, Tab, Tooltip } from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

import Title from "@/components/titles";
import AddModal from "@/components/CurdTable/add-model";
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

/**
 * The main Enquiry page
 */
export default function EnquiryPage() {
  const [selectedType, setSelectedType] = React.useState<string>("All");
  const [selectedStage, setSelectedStage] = React.useState<string>("All");
  const tableConfig = { ...initialTableConfig };
  const filteredStatusOptions = useFilteredStatusOptions();

  let columns = generateColumns("enquiry", tableConfig);
  columns = columns.filter(
    (col: any) => col.key !== "commission" && col.key !== "mediatorCommission"
  );
  const { user } = useContext(AuthContext);

  const refetchData = React.useCallback(() => {
    // e.g. queryClient.invalidateQueries(["enquiry"]);
  }, []);

  return (
    <section className="">
      <Title title="Enquiry" />

      <AddModal
        currentTable="Enquiry"
        formFields={tableConfig["enquiry"]}
        apiEndpoint={apiRoutesByRole["enquiry"]}
        refetchData={refetchData}
      />

      <QueryComponent
        api={apiRoutesByRole["enquiry"]}
        queryKey={["enquiry"]}
        page={1}
        limit={50}
      >
        {(enquiryResponse: any) => {
          // Helper to extract array from paginated response
          const extractArray = (raw: any): any[] => {
            if (Array.isArray(raw)) return raw;
            if (raw?.data && Array.isArray(raw.data)) return raw.data;
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

            const isAdmin = user?.role === "Admin" || user?.role === "Employee";
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

            const getEmployeeName = (employee: any) => {
              if (!employee) return "OBAOL Desk";
              if (typeof employee === 'object' && employee !== null) {
                return employee.name || employee.firstName || employee.email || "OBAOL Desk";
              }
              if (typeof employee === "string" && /^[a-f0-9]{24}$/i.test(employee)) {
                return "Assigned team member";
              }
              return employee || "OBAOL Desk";
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
              if (!status) return "Pending";
              const statusName = typeof status === 'string' ? status : status.name;

              const mapping: Record<string, string> = {
                "NEW": "Pending",
                "CONTACTED": "Pending",
                "IN_DISCUSSION": "Pending",
                "QUOTE_REQUIRED": "Pending",
                "CLOSED": "Completed",
                "CANCELLED": "Cancelled"
              };

              return mapping[statusName as string] || "Pending";
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

            if (isAdmin) {
              counterpartyStr = `B: ${item.buyerAssociateId?.name || "N/A"} | S: ${item.sellerAssociateId?.name || "N/A"}`;
              counterpartyLabelStr = "Buyer / Supplier";
              companyStr = `B: ${item.buyerAssociateId?.associateCompany?.name || "N/A"} | S: ${item.sellerAssociateId?.associateCompany?.name || "N/A"}`;
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
              assignedEmployee: getEmployeeName(item.assignedEmployeeId),
              mediatorAssociate: item.mediatorAssociateId?.name || "Direct",
              dateColor: dateInfo.color,
              status: getStatusKey(item.status),
              quantity: item.quantity || null,
              isAdmin,
              supplierPhone: item.sellerAssociateId?.phone || "N/A",
              buyerPhone: item.buyerAssociateId?.phone || "N/A",
              employeePhone: item.assignedEmployeeId?.phone || "+917306096941",
            };
          });

          const filteredData = tableData.filter((item: any) => {
            const matchesType = selectedType === "All" || item.type === selectedType;
            const matchesStage = selectedStage === "All" || item.status === selectedStage;
            return matchesType && matchesStage;
          });

          return (
            <div className="flex items-center justify-center w-full">
              <div className="w-[95%]">
                <StatsHeader data={enquiriesData} />

                <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2">
                  <Tabs
                    selectedKey={selectedType}
                    onSelectionChange={(key) => setSelectedType(key as string)}
                    classNames={{
                      tabList: "gap-8 w-full relative rounded-none p-0 border-b border-divider",
                      cursor: "w-full bg-primary h-[3px] shadow-[0_-2px_10px_rgba(6,182,212,0.5)]",
                      tab: "max-w-fit px-0 h-10",
                      tabContent: "group-data-[selected=true]:text-primary font-black uppercase tracking-widest text-[11px]"
                    }}
                    variant="underlined"
                  >
                    <Tab key="All" title="All" />
                    <Tab key="Buying" title="My Purchases" />
                    <Tab key="Selling" title="Received" />
                  </Tabs>
                </div>

                <div className="flex justify-between items-center mb-10 overflow-x-auto pb-2">
                  <Tabs
                    selectedKey={selectedStage}
                    onSelectionChange={(key) => setSelectedStage(key as string)}
                    classNames={{
                      tabList: "gap-8 w-full relative rounded-none p-0 border-b border-divider",
                      cursor: "w-full bg-primary h-[3px] shadow-[0_-2px_10px_rgba(6,182,212,0.5)]",
                      tab: "max-w-fit px-0 h-10",
                      tabContent: "group-data-[selected=true]:text-primary font-black uppercase tracking-widest text-[11px]"
                    }}
                    variant="underlined"
                  >
                    <Tab key="All" title="All Stages" />
                    <Tab key="Pending" title="New" />
                    <Tab key="Converted" title="Converted" />
                    <Tab key="Completed" title="Completed" />
                    <Tab key="Cancelled" title="Cancelled" />
                  </Tabs>
                </div>

                <section className="py-2 w-full min-h-[400px]">
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredData.map((item: any, index: number) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <EnquiryCard
                            data={item}
                            action={
                              <Tooltip content="View Details">
                                <span
                                  onClick={() => window.location.href = `/dashboard/enquiries/${item._id}`}
                                  className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary transition-colors flex items-center justify-center w-10 h-10 bg-default-100 rounded-xl"
                                >
                                  <FiArrowRight size={20} />
                                </span>
                              </Tooltip>
                            }
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

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
    </section>
  );
}
