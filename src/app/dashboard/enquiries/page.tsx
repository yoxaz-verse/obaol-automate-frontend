"use client";

import React, { useContext } from "react";
import { Button, Spacer } from "@heroui/react";
import { Tabs, Tab } from "@nextui-org/react";
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
  const [selectedTab, setSelectedTab] = React.useState<string>("All");
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
          const enquiriesData = enquiryResponse?.data || [];

          const tableData = enquiriesData.map((item: any) => {
            const {
              isDeleted,
              isActive,
              password,
              __v,
              commission,
              mediatorCommission,
              ...rest
            } = item;

            const isAdmin = user?.role === "Admin";
            const data: any = { ...rest };

            if (!isAdmin) {
              delete data.commission;
              if (item.productAssociate?._id === user?.id)
                delete data.mediatorCommission;
            }

            const getRate = (rateVal: any) => {
              if (typeof rateVal === 'object' && rateVal !== null) {
                return rateVal.rate || rateVal.price || rateVal.amount || "N/A";
              }
              return rateVal;
            };

            const getEmployeeName = (employee: any) => {
              if (!employee) return null;
              if (typeof employee === 'object' && employee !== null) {
                return employee.name || "Unknown Employee";
              }
              return employee;
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

            const getStatusName = (status: any) => {
              if (!status) return "Pending";
              if (typeof status === 'string') return status;
              return status.name || "Pending";
            };

            return {
              ...data,
              specification: item.specification || "No Spec",
              product: item.productVariant?.product?.name,
              productVariant: item.productVariant?.name,
              productAssociate: item.productAssociate?.name,
              associateCompany: item.productAssociate?.associateCompany?.name || "N/A",
              assignedEmployee: getEmployeeName(item.variantRate?.associateCompany?.assignedEmployee) ||
                getEmployeeName(item.productAssociate?.associateCompany?.assignedEmployee),
              mediatorAssociate: item.mediatorAssociate?.name || "Direct",
              commission:
                item.commission ?? data.mediatorCommission ?? "Own Rate",
              variantRate: getRate(item.variantRate),
              dateColor: dateInfo.color,
              status: getStatusName(item.status),
            };
          });

          return (
            <div className="flex items-center justify-center w-full">
              <div className="w-[95%]">
                <StatsHeader data={enquiriesData} />

                <div className="flex justify-between items-center mb-10 overflow-x-auto pb-2">
                  <Tabs
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => setSelectedTab(key as string)}
                    classNames={{
                      tabList: "gap-8 w-full relative rounded-none p-0 border-b border-divider",
                      cursor: "w-full bg-primary h-[3px] shadow-[0_-2px_10px_rgba(6,182,212,0.5)]",
                      tab: "max-w-fit px-0 h-10",
                      tabContent: "group-data-[selected=true]:text-primary font-black uppercase tracking-widest text-[11px]"
                    }}
                    variant="underlined"
                  >
                    <Tab key="All" title="All" />
                    <Tab key="Pending" title="New" />
                    <Tab key="Quoted" title="Quoted" />
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
                      {tableData
                        .filter((item: any) => selectedTab === "All" || item.status === selectedTab)
                        .map((item: any, index: number) => (
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
                                <Button
                                  className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black h-9 rounded-xl shadow-lg hover:shadow-primary/20 transition-all text-[10px] uppercase tracking-wider px-3"
                                  size="sm"
                                  onPress={() => window.location.href = `/dashboard/enquiries/${item._id}`}
                                >
                                  View
                                </Button>
                              }
                            />
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </motion.div>

                  {tableData.filter((item: any) => selectedTab === "All" || item.status === selectedTab).length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-32 text-default-400"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center">
                          <FiArrowRight className="rotate-90 text-default-300" size={24} />
                        </div>
                        <p className="font-bold uppercase tracking-widest text-xs">No enquiries found in this stage</p>
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
