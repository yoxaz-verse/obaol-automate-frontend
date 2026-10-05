"use client";

import React, { useContext, useState } from "react";
import AuthContext from "@/context/AuthContext";
import {
  Avatar as HeroAvatar,
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
} from "@nextui-org/react";

const Avatar = HeroAvatar as any;
import QueryComponent from "@/components/queryComponent";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import EditModal from "@/components/CurdTable/edit-model";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { deleteDataBody, getData, patchData, postData } from "@/core/api/apiHandler";
import AddModal from "@/components/CurdTable/add-model";
import { apiRoutes } from "@/core/api/apiRoutes";
import { extractCount, extractList } from "@/core/data/queryUtils";
import InsightCard from "@/components/dashboard/InsightCard";
import { FiClock, FiActivity, FiLayers, FiBriefcase, FiDatabase, FiCheckCircle, FiInfo, FiArrowRight, FiKey, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";
import PageHeader from "@/components/ui/PageHeader";
import { DashboardField, DashboardPage, DashboardPanel, DashboardSectionHeader, DashboardStatusBadge } from "@/components/dashboard/DashboardUI";

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
  if (!date) return "Not provided";
  const d = dayjs(date);
  return d.isValid() ? d.format("DD MMM YYYY") : "Invalid Date";
};

const formatWorkingHours = (hours: any[]) => {
  if (!Array.isArray(hours)) return "Not provided";
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
        title: "Personal information",
        fields: [
          { key: "name", label: "Operator Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address" },
          { key: "district.name", label: "District" },
          { key: "state.name", label: "State" },
        ],
      },
      {
        title: "Work details",
        fields: [
          { key: "joiningDate", label: "Joining date", format: (v: any) => formatDate(v) },
          { key: "jobRole.name", label: "Role" },
          { key: "jobType.name", label: "Employment type" },
          { key: "workingHours", label: "Working hours", format: (v: any) => formatWorkingHours(v) },
        ],
      },
    ],
  },
  associate: {
    groups: [
      {
        title: "Company information",
        fields: [
          { key: "associateCompany.name", label: "Company" },
          { key: "associateCompany.companyType.name", label: "Company type" },
          { key: "associateCompany.email", label: "Business email" },
          { key: "associateCompany.phone", label: "Business phone" },
        ],
      },
      {
        title: "Location",
        fields: [
          { key: "associateCompany.state.name", label: "State" },
          { key: "associateCompany.district.name", label: "District" },
          { key: "associateCompany.division.name", label: "Division" },
          { key: "associateCompany.pincodeEntry.pincode", label: "Postal code" },
        ],
      },
      {
        title: "Verification",
        fields: [
          { key: "isEmailVerified", label: "Email", format: (v: any) => v ? "Verified" : "Pending" },
          { key: "isPhoneVerified", label: "Phone", format: (v: any) => v ? "Verified" : "Pending" },
          {
            key: "isCompanyVerified",
            label: "Company",
            format: (v: boolean, profile?: any) => {
              if (!profile?.associateCompany) return "Required";
              return v ? "Verified" : "Under review";
            },
          },
        ],
      },
    ],
  },
  admin: {
    groups: [
      {
        title: "Administrator information",
        fields: [
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
        ],
      },
      {
        title: "Account status",
        fields: [
          { key: "isActive", label: "Status", format: (v: any) => v ? "Active" : "Inactive" },
          { key: "createdAt", label: "Created" , format: (v: any) => formatDate(v) },
        ],
      },
    ],
  },
};

const getValue = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

function PasskeySecurityPanel() {
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [deviceLabel, setDeviceLabel] = useState("My device");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState("");

  const { data, refetch } = useQuery({
    queryKey: ["authPasskeys"],
    queryFn: () => getData("/auth/passkeys"),
  });

  const passkeys = data?.data?.passkeys || [];
  const passkeySupported = typeof window !== "undefined" && browserSupportsWebAuthn();

  const sendOtp = async () => {
    setIsSendingOtp(true);
    setStatusMessage("");
    try {
      await postData("/verification/send-otp", { method: "email" });
      setStatusMessage("OTP sent to your registered email.");
    } catch (error: any) {
      setStatusMessage(error?.response?.data?.message || "Unable to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const createPasskey = async () => {
    if (!passkeySupported) {
      setStatusMessage("Passkeys are not available on this browser.");
      return;
    }
    setIsCreating(true);
    setStatusMessage("");
    try {
      const optionsResponse = await postData("/auth/passkeys/registration/options", {
        password,
        otpCode,
        deviceLabel,
      });
      const registrationResponse = await startRegistration({ optionsJSON: optionsResponse.data.options });
      await postData("/auth/passkeys/registration/verify", {
        response: registrationResponse,
        deviceLabel,
      });
      setPassword("");
      setOtpCode("");
      setStatusMessage("Passkey added.");
      await refetch();
    } catch (error: any) {
      setStatusMessage(error?.response?.data?.message || error?.message || "Passkey setup failed.");
    } finally {
      setIsCreating(false);
    }
  };

  const removePasskey = async (credentialId: string) => {
    setPendingDeleteId(credentialId);
    setStatusMessage("");
    try {
      await deleteDataBody(`/auth/passkeys/${encodeURIComponent(credentialId)}`, {}, { password, otpCode });
      setPassword("");
      setOtpCode("");
      setStatusMessage("Passkey removed.");
      await refetch();
    } catch (error: any) {
      setStatusMessage(error?.response?.data?.message || "Unable to remove passkey.");
    } finally {
      setPendingDeleteId("");
    }
  };

  return (
    <Card className="border db-border-subtle db-panel shadow-none rounded-[1.25rem] sm:rounded-[2rem]">
      <CardHeader className="flex items-center gap-3 px-5 pt-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-obaol-500/20 bg-obaol-500/10 text-obaol-600 dark:text-obaol-300">
          <FiKey />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-foreground">Passkeys</h3>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-default-400">Password plus email OTP required</p>
        </div>
      </CardHeader>
      <CardBody className="gap-4 px-5 pb-5">
        <div className="flex flex-col gap-3">
          <Input
            label="Device label"
            labelPlacement="outside"
            value={deviceLabel}
            onValueChange={setDeviceLabel}
            placeholder="My laptop"
            variant="bordered"
          />
          <Input
            label="Current password"
            labelPlacement="outside"
            value={password}
            onValueChange={setPassword}
            placeholder="Enter password"
            type="password"
            autoComplete="current-password"
            variant="bordered"
          />
          <Input
            label="Email OTP"
            labelPlacement="outside"
            value={otpCode}
            onValueChange={(value) => setOtpCode(value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            variant="bordered"
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button variant="flat" isLoading={isSendingOtp} onPress={sendOtp}>
              Send OTP
            </Button>
            <Button color="warning" isLoading={isCreating} isDisabled={!password || otpCode.length !== 6} onPress={createPasskey}>
              Add passkey
            </Button>
          </div>
        </div>

        {statusMessage && (
          <p className="rounded-xl border border-default-200 px-3 py-2 text-xs font-semibold text-foreground/70 dark:border-white/10">
            {statusMessage}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {passkeys.length === 0 ? (
            <p className="text-xs font-semibold text-default-400">No passkeys registered.</p>
          ) : passkeys.map((passkey: any) => (
            <div key={passkey.credentialId} className="flex items-center justify-between gap-3 rounded-xl border border-default-200 px-3 py-3 dark:border-white/10">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{passkey.deviceLabel || "Passkey"}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-default-400">
                  {passkey.lastUsedAt ? `Last used ${formatDate(passkey.lastUsedAt)}` : `Created ${formatDate(passkey.createdAt)}`}
                </p>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="danger"
                isLoading={pendingDeleteId === passkey.credentialId}
                isDisabled={!password || otpCode.length !== 6}
                onPress={() => removePasskey(passkey.credentialId)}
                aria-label="Remove passkey"
              >
                <FiTrash2 />
              </Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

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
    <DashboardPage className="py-3 sm:py-5">
      <PageHeader
        title="Profile"
        description="Manage your account, company information, verification, and sign-in security."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Company & account" }, { label: "Profile" }]}
      />
      <QueryComponent
        api={`${apiRoutesByRole[roleKey]}/${user?.id}`}
        queryKey={[roleKey, user?.id]}
      >
        {(response: any) => {
          const profile = response?.data || response;
          const formFields = initialTableConfig[roleKey]?.filter((field: any) => field.key !== "password") || [];

          return (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                {/* Account summary */}
                <div className="flex flex-col gap-4">
                  <DashboardPanel className="overflow-hidden" feature>
                    <div className="flex items-center justify-between border-b db-border-subtle bg-obaol-500/[0.04] px-5 py-4">
                      <span className="dashboard-label">Account</span>
                      <DashboardStatusBadge tone="brand">{displayRole}</DashboardStatusBadge>
                    </div>

                    <div className="flex flex-col items-center px-5 py-6">
                      <div className="relative mb-4 rounded-2xl border db-border-subtle db-panel p-1">
                        <Avatar
                          className="h-24 w-24 rounded-xl border border-foreground/5 text-2xl"
                          showFallback
                          name={profile.name}
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&background=18181b&color=eab308&size=256&bold=true&font-size=0.35`}
                        />
                      </div>

                      <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                          {profile.name}
                        </h2>
                        <p className="mt-1 break-all text-sm db-muted">{profile.email}</p>
                      </div>

                      <div className="grid w-full grid-cols-2 gap-3">
                        <div className="rounded-xl border db-border-subtle db-inset p-3 text-center">
                          <p className="dashboard-label">Account status</p>
                          <p className="mt-1 text-sm font-semibold text-success-600 dark:text-success-400">Verified</p>
                        </div>
                        <div className="rounded-xl border db-border-subtle db-inset p-3 text-center">
                          <p className="dashboard-label">Membership</p>
                          <p className="mt-1 text-sm font-semibold text-obaol-700 dark:text-obaol-300">Active</p>
                        </div>
                      </div>

                      <div className="mt-5 w-full">
                        <EditModal
                          _id={profile._id}
                          initialData={profile}
                          currentTable={roleKey}
                          formFields={formFields}
                          apiEndpoint={apiRoutesByRole[roleKey]}
                          refetchData={() => { }}
                        />
                      </div>
                    </div>
                  </DashboardPanel>

                  <DashboardPanel className="group cursor-pointer p-4 transition-colors hover:border-obaol-500/30 hover:bg-obaol-500/[0.04]">
                    <div className="flex items-center gap-3 sm:gap-6">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-obaol-500/8 sm:bg-obaol-500/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-obaol-500 border border-obaol-500/15 sm:border-obaol-500/20">
                        <FiInfo size={22} className="sm:hidden" />
                        <FiInfo size={28} className="hidden sm:block" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-foreground">Support</h4>
                        <p className="mt-0.5 text-sm db-muted">Contact the OBAOL team</p>
                      </div>
                      <FiArrowRight size={18} className="text-default-300 group-hover:translate-x-1 transition-transform sm:hidden" />
                      <FiArrowRight size={20} className="text-default-300 group-hover:translate-x-1 transition-transform hidden sm:block" />
                    </div>
                  </DashboardPanel>

                  <PasskeySecurityPanel />
                </div>

                {/* Profile details */}
                <div className="flex min-w-0 flex-col gap-6">
                  {roleKey === "associate" && !profile?.associateCompany && (
                    <Card className="dashboard-panel border-dashed bg-obaol-500/[0.03] shadow-none">
                      <CardBody className="flex flex-col items-center gap-5 p-6 text-center sm:p-10">
                        <div className="relative">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-obaol-500/20 bg-obaol-500/10">
                            <FiBriefcase className="h-7 w-7 text-obaol-600 dark:text-obaol-300" />
                          </div>
                        </div>
                        <div>
                          <h3 className="dashboard-section-title">
                            Complete your company profile
                          </h3>
                          <p className="mt-2 max-w-xl text-sm leading-6 db-muted">
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
                          return group.title !== "Company information" && group.title !== "Location";
                        }
                        return true;
                      })
                      .map((group: any, idx: number) => (
                        <DashboardPanel
                          key={idx}
                          className="overflow-hidden"
                        >
                          <div className="border-b db-border-subtle px-5 py-4 sm:px-6">
                            <DashboardSectionHeader title={group.title} />
                          </div>
                          <div className="p-5 sm:p-6">
                            <dl className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                              {group.fields.map(({ key, label, format }: any) => {
                                const value = getValue(profile, key);
                                return (
                                  <DashboardField key={key} label={label} value={format ? format(value, profile) : value} />
                                );
                              })}
                            </dl>
                          </div>
                        </DashboardPanel>
                      ))}
                  </div>
                </div>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-12 duration-[1500ms]">
              </div>

              <DashboardPanel className="space-y-4 p-4 sm:p-6">
                <div className="flex items-center gap-2.5 sm:gap-4">
                  <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
                    <FiInfo size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold sm:text-lg">Keyboard shortcuts</h3>
                    <p className="text-sm db-muted">Customize quick navigation commands</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/shortcuts"
                  className="inline-flex min-h-11 items-center justify-between rounded-xl border db-border-subtle db-inset px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-obaol-500/30"
                >
                  Manage Shortcuts
                  <FiArrowRight />
                </Link>
              </DashboardPanel>
            </div>
          );
        }}
      </QueryComponent>
    </DashboardPage>
  );
}
