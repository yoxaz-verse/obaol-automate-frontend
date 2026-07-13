"use client";

import React, { useContext, useState } from "react";
import AuthContext from "@/context/AuthContext";
import {
  Avatar as HeroAvatar,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spacer as HeroSpacer,
  Chip as HeroChip,
} from "@nextui-org/react";

const Avatar = HeroAvatar as any;
const Chip = HeroChip as any;
const Spacer = HeroSpacer as any;
import QueryComponent from "@/components/queryComponent";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import EditModal from "@/components/CurdTable/edit-model";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getData, patchData } from "@/core/api/apiHandler";
import AddModal from "@/components/CurdTable/add-model";
import { apiRoutes } from "@/core/api/apiRoutes";
import { extractCount, extractList } from "@/core/data/queryUtils";
import InsightCard from "@/components/dashboard/InsightCard";
import { FiClock, FiActivity, FiLayers, FiBriefcase, FiDatabase, FiCheckCircle, FiInfo, FiArrowRight, FiUser, FiMoreVertical } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";

function AdminDashboardPanel() {
  const { data: globalStats } = useQuery({
    queryKey: ["adminGlobalStats"],
    queryFn: async () => {
      const [enquiries, companies, users, products] = await Promise.all([
        getData(apiRoutes.enquiry.getAll, { limit: 1 }),
        getData(apiRoutes.associateCompany.getAll, { limit: 1 }),
        getData(apiRoutes.associate.getAll, { limit: 1 }),
        getData(apiRoutes.product.getAll, { limit: 1 }),
      ]);
      return {
        enquiries: extractCount(enquiries, extractList(enquiries)),
        companies: extractCount(companies, extractList(companies)),
        users: extractCount(users, extractList(users)),
        products: extractCount(products, extractList(products)),
      };
    },
  });

  return (
    <div className="w-full mt-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-2 h-8 bg-obaol-500 rounded-full" />
        <div>
          <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">Platform Command Overview</h3>
          <p className="text-[10px] font-bold text-default-400 uppercase tracking-[0.2em] mt-0.5">High-level System Metrics & Global Assets</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <InsightCard
          title="Global Enquiries"
          metric={globalStats?.enquiries || 0}
          icon={<FiActivity size={20} className="text-obaol-500" />}
        />
        <InsightCard
          title="Onboarded Entities"
          metric={globalStats?.companies || 0}
          icon={<FiBriefcase size={20} className="text-obaol-500" />}
        />
        <InsightCard
          title="Trade Listing Users"
          metric={globalStats?.users || 0}
          icon={<FiLayers size={20} className="text-obaol-500" />}
        />
        <InsightCard
          title="Catalog Scale"
          metric={globalStats?.products || 0}
          icon={<FiDatabase size={20} className="text-obaol-500" />}
        />
      </div>
    </div>
  );
}

function AssociateDashboardPanel({ userId }: { userId: string }) {
  const { data: associateStats } = useQuery({
    queryKey: ["associateStats", userId],
    queryFn: async () => {
      const [catalog, enquiries] = await Promise.all([
        getData(apiRoutes.catalogItem.getAll, { associateId: userId, limit: 1 }),
        getData(apiRoutes.enquiry.getAll, { limit: 1 }),
      ]);
      return {
        catalogItems: extractCount(catalog, extractList(catalog)),
        activeLeads: extractCount(enquiries, extractList(enquiries)),
      };
    },
    enabled: !!userId,
  });

  return (
    <div className="w-full mt-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-2 h-8 bg-orange-500 rounded-full" />
        <div>
          <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">My Trading Ecosystem</h3>
          <p className="text-[10px] font-bold text-default-400 uppercase tracking-[0.2em] mt-0.5">Commercial Performance & Listing Reach</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <InsightCard
          title="Catalog Inventory"
          metric={associateStats?.catalogItems || 0}
          icon={<FiLayers size={20} className="text-orange-500" />}
        />
        <InsightCard
          title="Active Market Leads"
          metric={associateStats?.activeLeads || 0}
          icon={<FiActivity size={20} className="text-orange-500" />}
        />
        <InsightCard
          title="Business Integrity"
          metric="N/A"
          icon={<FiCheckCircle size={20} className="text-orange-500" />}
        />
      </div>
    </div>
  );
}

function OperatorDashboardPanel({ userId }: { userId: string }) {
  const { data: enquiryResponse } = useQuery({
    queryKey: ["operatorEnquiries", userId],
    queryFn: () => getData(apiRoutes.enquiry.getAll, { limit: 200 }),
    enabled: !!userId,
  });

  const { data: companiesResponse } = useQuery({
    queryKey: ["operatorCompanies", userId],
    queryFn: () => getData(apiRoutes.researchedCompany.getAll, { submittedByOperator: userId, limit: 200 }),
    enabled: !!userId,
  });

  const enquiries = extractList(enquiryResponse).filter((item: any) => {
    const supplierOperatorId = (item?.supplierOperatorId?._id || item?.supplierOperatorId || "").toString();
    const dealCloserOperatorId = (item?.dealCloserOperatorId?._id || item?.dealCloserOperatorId || "").toString();
    return supplierOperatorId === userId || dealCloserOperatorId === userId;
  });
  const companies = extractList(companiesResponse);

  const totalAssignedCompanies = companies.length;
  const totalAssignedEnquiries = enquiries.length;

  const pendingEnquiries = enquiries.filter((item: any) => {
    const s = String(item?.status || "").toUpperCase();
    return !["COMPLETED", "CLOSED", "CANCELLED", "CONVERTED"].includes(s);
  }).length;

  const convertedEnquiries = enquiries.filter((item: any) =>
    String(item?.status || "").toUpperCase() === "CONVERTED"
  ).length;

  return (
    <div className="w-full mt-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-2 h-8 bg-primary-500 rounded-full" />
        <div>
          <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">My Operational Matrix</h3>
          <p className="text-[10px] font-bold text-default-400 uppercase tracking-[0.2em] mt-0.5">Functional Performance & Action Logs</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <InsightCard
          title="Assigned Entities"
          metric={totalAssignedCompanies}
          icon={<FiBriefcase size={20} className="text-primary-500" />}
        />
        <InsightCard
          title="Direct Enquiries"
          metric={totalAssignedEnquiries}
          icon={<FiActivity size={20} className="text-primary-500" />}
        />
        <InsightCard
          title="Active HotLeads"
          metric={pendingEnquiries}
          icon={<FiClock size={20} className="text-primary-500" />}
        />
        <InsightCard
          title="Closed Conversions"
          metric={convertedEnquiries}
          icon={<FiLayers size={20} className="text-primary-500" />}
        />
      </div>
    </div>
  );
}

const formatDate = (date: any) => {
  if (!date) return "N/A";
  const d = dayjs(date);
  return d.isValid() ? d.format("DD MMM YYYY") : "Invalid Date";
};

const formatWorkingHours = (hours: any[]) => {
  if (!Array.isArray(hours)) return "—";
  return hours
    .map(
      (h) =>
        `${String(h.start.hour).padStart(2, "0")}:${String(
          h.start.minute
        ).padStart(2, "0")} - ${String(h.end.hour).padStart(2, "0")}:${String(
          h.end.minute
        ).padStart(2, "0")}`
    )
    .join(", ");
};

const roleConfigs: Record<string, any> = {
  operator: {
    groups: [
      {
        title: "Tactical Personnel Data",
        fields: [
          { key: "name", label: "Operator Name" },
          { key: "email", label: "Registry Login" },
          { key: "phone", label: "Secure Contact" },
          { key: "address", label: "Operational HQ" },
          { key: "district.name", label: "Assigned District" },
          { key: "state.name", label: "State Territory" },
        ],
      },
      {
        title: "Operational Status",
        fields: [
          { key: "joiningDate", label: "Commission Date", format: (v: any) => formatDate(v) },
          { key: "jobRole.name", label: "Functional Role" },
          { key: "jobType.name", label: "Deployment Type" },
          { key: "workingHours", label: "Duty Window", format: (v: any) => formatWorkingHours(v) },
        ],
      },
    ],
  },
  associate: {
    groups: [
      {
        title: "Market Identity Matrix",
        fields: [
          { key: "associateCompany.name", label: "Trade Entity" },
          { key: "associateCompany.companyType.name", label: "Market Segment" },
          { key: "associateCompany.email", label: "Business Comm" },
          { key: "associateCompany.phone", label: "Corporate Link" },
        ],
      },
      {
        title: "Geographic Footprint",
        fields: [
          { key: "associateCompany.state.name", label: "State HQ" },
          { key: "associateCompany.district.name", label: "Zonal District" },
          { key: "associateCompany.division.name", label: "Trade Division" },
          { key: "associateCompany.pincodeEntry.pincode", label: "Regional Zip" },
        ],
      },
      {
        title: "Clearance & Security",
        fields: [
          { key: "isEmailVerified", label: "Digital Handshake", format: (v: any) => v ? "✅ VERIFIED" : "❌ PENDING" },
          { key: "isPhoneVerified", label: "Comm Encryption", format: (v: any) => v ? "✅ VERIFIED" : "❌ PENDING" },
          {
            key: "isCompanyVerified",
            label: "Integrity Audit",
            format: (v: boolean, profile?: any) => {
              if (!profile?.associateCompany) return "⚠️ REQUIRED";
              return v ? "✅ CERTIFIED" : "⏳ AUDITING";
            },
          },
        ],
      },
    ],
  },
  admin: {
    groups: [
      {
        title: "Administrative Shell Access",
        fields: [
          { key: "name", label: "Terminal Master" },
          { key: "email", label: "Root Access Email" },
          { key: "role", label: "Governance Tier" },
        ],
      },
      {
        title: "System Integrity Logs",
        fields: [
          { key: "isActive", label: "Node Healthstatus", format: (v: any) => v ? "🛡️ ALPHA_ACTIVE" : "⚠️ STANDBY" },
          { key: "createdAt", label: "Registry Initialization", format: (v: any) => formatDate(v) },
        ],
      },
    ],
  },
};

const getValue = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const roleKeyRaw = user?.role?.toLowerCase() as string;

  if (!roleKeyRaw) return null;

  const roleKey = roleKeyRaw === "operator" || roleKeyRaw === "team"
    ? "operator"
    : roleKeyRaw === "customer"
      ? "associate"
      : roleKeyRaw;
  const displayRole = roleKeyRaw === "operator" || roleKeyRaw === "team"
    ? "OPERATOR"
    : roleKeyRaw === "customer"
      ? "BUYING ASSOCIATE"
      : String(user?.role || "").toUpperCase();
  const config = roleConfigs[roleKey] || { groups: [] };

  return (
    <div className="p-3 sm:p-8 md:p-14 w-full min-h-screen">
      <QueryComponent
        api={`${apiRoutesByRole[roleKey]}/${user?.id}`}
        queryKey={[roleKey, user?.id]}
      >
        {(response: any) => {
          const profile = response?.data || response;
          const formFields = initialTableConfig[roleKey]?.filter((field: any) => field.key !== "password") || [];

          return (
            <div className="max-w-[1400px] mx-auto flex flex-col gap-6 sm:gap-14">
              <div className="flex flex-col xl:flex-row gap-5 sm:gap-12 w-full">
                {/* Left Node: Tactical Identity */}
                <div className="xl:w-[420px] flex flex-col gap-4 sm:gap-8 shrink-0">
                  <Card className="border db-border-subtle db-panel shadow-none backdrop-blur-3xl rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden">
                    <div className="h-28 sm:h-44 bg-obaol-500/[0.04] relative overflow-hidden border-b db-border-subtle">
                      <div className="absolute top-3 right-3 sm:top-6 sm:right-6">
                        <Chip
                          color="warning"
                          variant="flat"
                          className="font-black uppercase text-[8px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.3em] h-6 sm:h-8 px-2.5 sm:px-4 bg-obaol-500/10 text-obaol-700 dark:text-obaol-300 border border-obaol-500/20"
                        >
                          {displayRole}
                        </Chip>
                      </div>
                    </div>

                    <CardBody className="relative flex flex-col items-center -mt-14 sm:-mt-24 pb-5 sm:pb-12 px-4 sm:px-10">
                      <div className="relative p-1 sm:p-2 db-panel rounded-[1.5rem] sm:rounded-[3rem] border db-border-subtle mb-4 sm:mb-8">
                        <Avatar
                          className="w-20 h-20 sm:w-36 sm:h-36 text-xl sm:text-3xl border-2 border-foreground/5 rounded-[1.25rem] sm:rounded-[2.5rem]"
                          showFallback
                          name={profile.name}
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&background=18181b&color=eab308&size=256&bold=true&font-size=0.35`}
                        />
                      </div>

                      <div className="text-center mb-4 sm:mb-10">
                        <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight sm:tracking-tighter uppercase leading-[0.9] sm:leading-[0.8] mb-2 sm:mb-4">
                          {profile.name}
                        </h2>
                        <div className="flex items-center justify-center gap-1.5 sm:gap-3">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success-500 animate-pulse" />
                          <p className="text-[9px] sm:text-xs font-bold text-default-400 uppercase tracking-[0.1em] sm:tracking-[0.2em]">{profile.email}</p>
                        </div>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-4">
                        <div className="db-inset p-3 sm:p-5 rounded-[1rem] sm:rounded-[2rem] border db-border-subtle text-center">
                          <p className="text-[8px] sm:text-[10px] font-black text-default-400 uppercase tracking-[0.1em] sm:tracking-widest mb-1 sm:mb-1.5 opacity-60 italic">Node Status</p>
                          <p className="text-[10px] sm:text-xs font-black text-success-500 uppercase tracking-tight sm:tracking-tighter">Verified Active</p>
                        </div>
                        <div className="db-inset p-3 sm:p-5 rounded-[1rem] sm:rounded-[2rem] border db-border-subtle text-center">
                          <p className="text-[8px] sm:text-[10px] font-black text-default-400 uppercase tracking-[0.1em] sm:tracking-widest mb-1 sm:mb-1.5 opacity-60 italic">System Rank</p>
                          <p className="text-[10px] sm:text-xs font-black text-obaol-500 uppercase tracking-tight sm:tracking-tighter">Alpha Class</p>
                        </div>
                      </div>

                      <div className="w-full mt-5 sm:mt-12">
                        <EditModal
                          _id={profile._id}
                          initialData={profile}
                          currentTable={roleKey}
                          formFields={formFields}
                          apiEndpoint={apiRoutesByRole[roleKey]}
                          refetchData={() => { }}
                        />
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="border border-obaol-500/15 bg-obaol-500/[0.02] sm:bg-obaol-500/[0.03] backdrop-blur-3xl shadow-none rounded-[1.2rem] sm:rounded-[2.5rem] p-3.5 sm:p-7 group cursor-pointer hover:border-obaol-500/30 hover:bg-obaol-500/[0.05] sm:hover:bg-obaol-500/[0.06] transition-colors">
                    <div className="flex items-center gap-3 sm:gap-6">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-obaol-500/8 sm:bg-obaol-500/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-obaol-500 border border-obaol-500/15 sm:border-obaol-500/20">
                        <FiInfo size={22} className="sm:hidden" />
                        <FiInfo size={28} className="hidden sm:block" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[15px] sm:text-lg font-black text-foreground uppercase tracking-tight italic">System Support</h4>
                        <p className="text-[9px] sm:text-[11px] text-default-400 font-bold uppercase tracking-[0.16em] sm:tracking-widest mt-0.5 sm:mt-1">Direct Node Comms</p>
                      </div>
                      <FiArrowRight size={18} className="text-default-300 group-hover:translate-x-1 transition-transform sm:hidden" />
                      <FiArrowRight size={20} className="text-default-300 group-hover:translate-x-1 transition-transform hidden sm:block" />
                    </div>
                  </Card>
                </div>

                {/* Right Matrix: Informative Hub */}
                <div className="flex-1 flex flex-col gap-5 sm:gap-12">
                  {roleKey === "associate" && !profile?.associateCompany && (
                    <Card className="border-2 border-dashed border-obaol-500/25 sm:border-obaol-500/30 bg-obaol-500/[0.02] sm:bg-obaol-500/[0.03] shadow-none rounded-[1.5rem] sm:rounded-[3.5rem] animate-in fade-in slide-in-from-top-6 duration-1000">
                      <CardBody className="p-5 sm:p-16 flex flex-col items-center text-center gap-5 sm:gap-12">
                        <div className="relative">
                          <div className="relative w-16 h-16 sm:w-28 sm:h-28 bg-obaol-500/8 sm:bg-obaol-500/10 rounded-[1.1rem] sm:rounded-[2.5rem] flex items-center justify-center border border-obaol-500/15 sm:border-obaol-500/20">
                            <FiBriefcase className="text-obaol-500 w-7 h-7 sm:w-12 sm:h-12" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2.5 sm:gap-5">
                          <h3 className="text-xl sm:text-4xl font-black text-foreground tracking-tight sm:tracking-tighter uppercase italic leading-[0.95] sm:leading-[0.85]">
                            Corporate Activation Required
                          </h3>
                          <p className="text-default-400 max-w-xl text-[13px] sm:text-base leading-relaxed font-medium">
                            To publish trade listings, coordinate verified logistics, and manage rates, you must complete your company profile.
                          </p>
                        </div>
                        <div className="w-full max-w-sm">
                          <AddModal
                            name="Company"
                            buttonLabel="Start Entity Registration"
                            currentTable="associateCompany"
                            apiEndpoint={apiRoutes.associateCompany.getAll}
                            formFields={initialTableConfig.associateCompany}
                            onSuccess={async (companyData: any) => {
                              if (companyData?._id) {
                                await patchData(`${apiRoutes.associate.getAll}/${profile?._id}`, { associateCompany: companyData._id, hasCompany: true });
                                window.location.reload();
                              }
                            }}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:gap-10">
                    {config.groups
                      .filter((group: any) => {
                        if (roleKey === "associate" && !profile?.associateCompany) {
                          return group.title !== "Market Identity Matrix" && group.title !== "Geographic Footprint";
                        }
                        return true;
                      })
                      .map((group: any, idx: number) => (
                        <Card
                          key={idx}
                          className="border db-border-subtle db-panel backdrop-blur-2xl shadow-none rounded-[1.25rem] sm:rounded-[3rem] overflow-hidden"
                        >
                          <CardHeader className="px-4 sm:px-12 pt-4 sm:pt-12 flex items-center justify-between gap-2.5 sm:gap-3">
                            <div className="flex items-center gap-2.5 sm:gap-5">
                              <div className="w-1 sm:w-2 h-6 sm:h-10 bg-obaol-500/80 sm:bg-obaol-500 rounded-full" />
                              <h3 className="text-lg sm:text-3xl font-black text-foreground tracking-tight sm:tracking-tighter uppercase italic leading-[0.9] sm:leading-[0.8] pr-1 sm:pr-4">
                                {group.title}
                              </h3>
                            </div>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full db-inset flex items-center justify-center opacity-30 border db-border-subtle shrink-0">
                              <FiMoreVertical size={16} className="sm:hidden" />
                              <FiMoreVertical size={20} className="hidden sm:block" />
                            </div>
                          </CardHeader>
                          <CardBody className="px-4 sm:px-12 pb-5 sm:pb-12 pt-3 sm:pt-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-20 gap-y-5 sm:gap-y-12">
                              {group.fields.map(({ key, label, format }: any) => {
                                const value = getValue(profile, key);
                                return (
                                  <div key={key} className="flex flex-col gap-1 sm:gap-3 relative group/field">
                                    <div className="absolute -left-2.5 sm:-left-6 top-0 bottom-0 w-1 bg-obaol-500/0 group-hover/field:bg-obaol-500/35 sm:group-hover/field:bg-obaol-500/50 transition-all rounded-full" />
                                    <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.14em] sm:tracking-[0.4em] text-default-400 group-hover/field:translate-x-1 transition-transform inline-block">
                                      {label}
                                    </span>
                                    <div className="flex items-center gap-1.5 sm:gap-3">
                                      <span className="text-[15px] sm:text-xl font-black text-foreground tracking-tight group-hover/field:text-obaol-500 transition-colors uppercase">
                                        {format ? format(value, profile) : value ?? "NODE_NUL"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                  </div>
                </div>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-12 duration-[1500ms]">
              </div>

              <div className="rounded-[1.2rem] sm:rounded-[2.5rem] border db-border-subtle db-panel shadow-none backdrop-blur-2xl p-3.5 sm:p-8 space-y-3.5 sm:space-y-6">
                <div className="flex items-center gap-2.5 sm:gap-4">
                  <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
                    <FiInfo size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-black uppercase tracking-wide">Keyboard Shortcuts</h3>
                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.3em] text-default-400">Open the shortcuts manager</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/shortcuts"
                  className="inline-flex items-center justify-between rounded-lg sm:rounded-2xl border db-border-subtle db-inset px-3.5 sm:px-6 py-2.5 sm:py-4 text-[9px] sm:text-xs font-black uppercase tracking-[0.14em] sm:tracking-[0.3em] text-foreground hover:border-obaol-500/30 transition-colors"
                >
                  Manage Shortcuts
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          );
        }}
      </QueryComponent>
    </div>
  );
}
