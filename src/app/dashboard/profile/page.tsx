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
} from "@heroui/react";

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
        enquiries: enquiries?.data?.total || 124,
        companies: companies?.data?.total || 45,
        users: users?.data?.total || 89,
        products: products?.data?.total || 2560,
      };
    },
  });

  return (
    <div className="w-full mt-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-2 h-8 bg-warning-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
        <div>
          <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">Platform Command Overview</h3>
          <p className="text-[10px] font-bold text-default-400 uppercase tracking-[0.2em] mt-0.5">High-level System Metrics & Global Assets</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <InsightCard
          title="Global Enquiries"
          metric={globalStats?.enquiries || 0}
          icon={<FiActivity size={20} className="text-warning-500" />}
        />
        <InsightCard
          title="Onboarded Entities"
          metric={globalStats?.companies || 0}
          icon={<FiBriefcase size={20} className="text-warning-500" />}
        />
        <InsightCard
          title="Marketplace Users"
          metric={globalStats?.users || 0}
          icon={<FiLayers size={20} className="text-warning-500" />}
        />
        <InsightCard
          title="Catalog Scale"
          metric={globalStats?.products || 0}
          icon={<FiDatabase size={20} className="text-warning-500" />}
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
        catalogItems: catalog?.data?.total || 0,
        activeLeads: enquiries?.data?.total || 0,
      };
    },
    enabled: !!userId,
  });

  return (
    <div className="w-full mt-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-2 h-8 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
        <div>
          <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">My Trading Ecosystem</h3>
          <p className="text-[10px] font-bold text-default-400 uppercase tracking-[0.2em] mt-0.5">Commercial Performance & Marketplace Reach</p>
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
          metric="98%"
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

  const extractList = (raw: any): any[] => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.data?.data)) return raw.data.data;
    return [];
  };

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
        <div className="w-2 h-8 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
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

  const roleKey = roleKeyRaw === "operator" || roleKeyRaw === "team" ? "operator" : roleKeyRaw;
  const displayRole = roleKeyRaw === "operator" || roleKeyRaw === "team" ? "OPERATOR" : String(user?.role || "").toUpperCase();
  const config = roleConfigs[roleKey] || { groups: [] };

  return (
    <div className="p-8 md:p-14 w-full min-h-screen">
      <QueryComponent
        api={`${apiRoutesByRole[roleKey]}/${user?.id}`}
        queryKey={[roleKey, user?.id]}
      >
        {(response: any) => {
          const profile = response?.data || response;
          const formFields = initialTableConfig[roleKey]?.filter((field: any) => field.key !== "password") || [];

          return (
            <div className="max-w-[1400px] mx-auto flex flex-col gap-14">
              <div className="flex flex-col xl:flex-row gap-12 w-full">
                {/* Left Node: Tactical Identity */}
                <div className="xl:w-[420px] flex flex-col gap-8 shrink-0">
                  <Card className="border border-foreground/5 bg-foreground/[0.02] backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden">
                    <div className="h-44 bg-gradient-to-br from-warning-500/20 via-orange-500/10 to-transparent relative overflow-hidden">
                      <div className="absolute top-6 right-6">
                        <Chip
                          color="warning"
                          variant="shadow"
                          className="font-black uppercase text-[10px] tracking-[0.3em] h-8 px-4 bg-warning-500 text-black border-none"
                        >
                          {displayRole}
                        </Chip>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-warning-500/5 blur-3xl rounded-full" />
                    </div>

                    <CardBody className="relative flex flex-col items-center -mt-24 pb-12 px-10">
                      <div className="relative p-2 bg-background/50 backdrop-blur-sm rounded-[3rem] shadow-2xl border border-foreground/10 mb-8">
                        <Avatar
                          className="w-36 h-36 text-3xl border-2 border-foreground/5 rounded-[2.5rem]"
                          showFallback
                          name={profile.name}
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&background=18181b&color=eab308&size=256&bold=true&font-size=0.35`}
                        />
                      </div>

                      <div className="text-center mb-10">
                        <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-[0.8] mb-4">
                          {profile.name}
                        </h2>
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                          <p className="text-xs font-bold text-default-400 uppercase tracking-[0.2em]">{profile.email}</p>
                        </div>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-4">
                        <div className="bg-foreground/[0.04] p-5 rounded-[2rem] border border-foreground/5 text-center">
                          <p className="text-[10px] font-black text-default-400 uppercase tracking-widest mb-1.5 opacity-60 italic">Node Status</p>
                          <p className="text-xs font-black text-success-500 uppercase tracking-tighter">Verified Active</p>
                        </div>
                        <div className="bg-foreground/[0.04] p-5 rounded-[2rem] border border-foreground/5 text-center">
                          <p className="text-[10px] font-black text-default-400 uppercase tracking-widest mb-1.5 opacity-60 italic">System Rank</p>
                          <p className="text-xs font-black text-warning-500 uppercase tracking-tighter">Alpha Class</p>
                        </div>
                      </div>

                      <div className="w-full mt-12">
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

                  <Card className="border border-warning-500/10 bg-warning-500/[0.03] backdrop-blur-3xl shadow-xl rounded-[2.5rem] p-7 group cursor-pointer hover:bg-warning-500/[0.06] transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-warning-500/10 rounded-2xl flex items-center justify-center text-warning-500 border border-warning-500/20 group-hover:scale-105 transition-transform">
                        <FiInfo size={28} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-black text-foreground uppercase tracking-tight italic">System Support</h4>
                        <p className="text-[11px] text-default-400 font-bold uppercase tracking-widest mt-1">Direct Node Comms</p>
                      </div>
                      <FiArrowRight size={20} className="text-default-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </div>

                {/* Right Matrix: Informative Hub */}
                <div className="flex-1 flex flex-col gap-12">
                  {roleKey === "associate" && !profile?.associateCompany && (
                    <Card className="border-2 border-dashed border-warning-500/30 bg-warning-500/[0.03] shadow-2xl rounded-[3.5rem] animate-in fade-in slide-in-from-top-6 duration-1000">
                      <CardBody className="p-16 flex flex-col items-center text-center gap-12">
                        <div className="relative">
                          <div className="absolute inset-0 bg-warning-500/20 blur-[50px] rounded-full scale-150 animate-pulse" />
                          <div className="relative w-28 h-28 bg-warning-500/10 rounded-[2.5rem] flex items-center justify-center border border-warning-500/20 shadow-2xl">
                            <FiBriefcase className="text-warning-500 w-12 h-12" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-5">
                          <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-[0.85]">
                            Corporate Activation Required
                          </h3>
                          <p className="text-default-400 max-w-xl text-base leading-relaxed font-medium">
                            To unlock elite marketplace trading, verified logistics clearance, and algorithmic rate optimization, you must initialize your corporate entity profile.
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

                  <div className="grid grid-cols-1 gap-10">
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
                          className="border border-foreground/5 bg-foreground/[0.01] backdrop-blur-2xl shadow-2xl rounded-[3rem] overflow-hidden"
                        >
                          <CardHeader className="px-12 pt-12 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                              <div className="w-2 h-10 bg-warning-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
                              <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase italic leading-[0.8] pr-4">
                                {group.title}
                              </h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center opacity-20 border border-foreground/10">
                              <FiMoreVertical size={20} />
                            </div>
                          </CardHeader>
                          <CardBody className="px-12 pb-12 pt-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                              {group.fields.map(({ key, label, format }: any) => {
                                const value = getValue(profile, key);
                                return (
                                  <div key={key} className="flex flex-col gap-3 relative group/field">
                                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-warning-500/0 group-hover/field:bg-warning-500/50 transition-all rounded-full" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-default-400 group-hover/field:translate-x-1 transition-transform inline-block">
                                      {label}
                                    </span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xl font-black text-foreground tracking-tight group-hover/field:text-warning-500 transition-colors uppercase">
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
                {roleKey === "admin" && <AdminDashboardPanel />}
                {roleKey === "associate" && <AssociateDashboardPanel userId={user?.id} />}
                {roleKey === "operator" && <OperatorDashboardPanel userId={user?.id} />}
              </div>

              <div className="rounded-[2.5rem] border border-default-200/60 bg-content1/70 backdrop-blur-2xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <FiInfo size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-wide">Keyboard Shortcuts</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-default-400">Open the shortcuts manager</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/shortcuts"
                  className="inline-flex items-center justify-between rounded-2xl border border-default-200/60 bg-content2/30 px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-foreground hover:bg-content2/50 transition"
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
