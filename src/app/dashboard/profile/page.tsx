// pages/Profile.tsx
"use client";

import React, { useContext } from "react";
import AuthContext from "@/context/AuthContext";
import {
  Avatar as HeroAvatar,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spacer as HeroSpacer,
  Chip as HeroChip,
  Tooltip,
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
import { FiClock, FiActivity, FiLayers, FiBriefcase } from "react-icons/fi";

function OperatorDashboardPanel({ userId }: { userId: string }) {
  const { data: enquiryResponse } = useQuery({
    queryKey: ["operatorEnquiries", userId],
    queryFn: () => getData(apiRoutes.enquiry.getAll, { assignedOperatorId: userId, limit: 200 }),
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
    if (Array.isArray(raw?.data?.data?.data)) return raw.data.data.data;
    return [];
  };

  const enquiries = extractList(enquiryResponse);
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
    <div className="w-full mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
        <h3 className="text-xl font-bold text-foreground tracking-tight">
          My Performance Activity
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          title="Assigned Companies"
          metric={totalAssignedCompanies}
          icon={<FiBriefcase size={18} />}
        />
        <InsightCard
          title="Assigned Enquiries"
          metric={totalAssignedEnquiries}
          icon={<FiActivity size={18} />}
        />
        <InsightCard
          title="Pending Enquiries"
          metric={pendingEnquiries}
          icon={<FiClock size={18} />}
        />
        <InsightCard
          title="Converted Enquiries"
          metric={convertedEnquiries}
          icon={<FiLayers size={18} />}
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

// 🕒 Helper to format working hours
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

// 🛠️ Role-based grouped configs
const roleConfigs: Record<
  string,
  {
    groups: {
      title: string;
      icon?: React.ReactNode;
      fields: { key: string; label: string; format?: (val: any, profile?: any) => any }[];
    }[];
  }
> = {
  operator: {
    groups: [
      {
        title: "Personal Information",
        fields: [
          { key: "name", label: "Full Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address" },
          { key: "district.name", label: "District" },
          { key: "state.name", label: "State" },
        ],
      },
      {
        title: "Job Details",
        fields: [
          {
            key: "joiningDate",
            label: "Joining Date",
            format: (v) => formatDate(v),
          },
          { key: "jobRole.name", label: "Job Role" },
          { key: "jobType.name", label: "Job Type" },
          {
            key: "workingHours",
            label: "Working Hours",
            format: (v) => formatWorkingHours(v),
          },
        ],
      },
      {
        title: "Account Information",
        fields: [
          {
            key: "languageKnown",
            label: "Languages",
            format: (arr) =>
              Array.isArray(arr) ? arr.map((l: any) => l.name).join(", ") : "—",
          },
          {
            key: "createdAt",
            label: "Member Since",
            format: (v) => formatDate(v),
          },
        ],
      },
    ],
  },
  associate: {
    groups: [
      {
        title: "Company Identification",
        fields: [
          { key: "associateCompany.name", label: "Company" },
          { key: "associateCompany.companyType.name", label: "Business Type" },
          { key: "associateCompany.email", label: "Company Email" },
          { key: "associateCompany.phone", label: "Company Phone" },
        ],
      },
      {
        title: "Location Details",
        fields: [
          { key: "associateCompany.state.name", label: "State" },
          { key: "associateCompany.district.name", label: "District" },
          { key: "associateCompany.division.name", label: "Division" },
          { key: "associateCompany.pincodeEntry.pincode", label: "Pin Code" },
        ],
      },
      {
        title: "Personal Representative",
        fields: [
          { key: "name", label: "Representative Name" },
          { key: "email", label: "Login Email" },
          { key: "phone", label: "Contact Phone" },
          { key: "designation.name", label: "Designation" },
        ],
      },
      {
        title: "Verification Status & Activity",
        fields: [
          { key: "isEmailVerified", label: "Email Verification", format: (v) => v ? "✅ Verified" : "❌ Unverified" },
          { key: "isPhoneVerified", label: "Phone Verification", format: (v) => v ? "✅ Verified" : "❌ Unverified" },
          { key: "isOneToOneVerified", label: "One-to-One Chat", format: (v) => v ? "✅ Verified" : "❌ Unverified" },
          {
            key: "isCompanyVerified",
            label: "Company Verification",
            format: (v: boolean, profile?: any) => {
              if (!profile?.associateCompany) return "❌ Not Linked";
              return v ? "✅ Verified" : "⏳ Pending Approval";
            },
          },
        ],
      },
    ],
  },
  admin: {
    groups: [
      {
        title: "Administrative Access",
        fields: [
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "System Role" },
        ],
      },
      {
        title: "Account Metadata",
        fields: [
          {
            key: "createdAt",
            label: "Created At",
            format: (v) => formatDate(v),
          },
        ],
      },
    ],
  },
  inventorymanager: {
    groups: [
      {
        title: "Manager Identification",
        fields: [
          { key: "name", label: "Full Name" },
          { key: "email", label: "Email" },
        ],
      },
      {
        title: "System Integration",
        fields: [
          { key: "admin.name", label: "Supervisor" },
          {
            key: "createdAt",
            label: "Onboarded Date",
            format: (v) => formatDate(v),
          },
        ],
      },
    ],
  },
};

// 🔍 Helper to read nested values
const getValue = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const roleKeyRaw = user?.role?.toLowerCase() as string;

  if (!roleKeyRaw) return null;

  const roleKey =
    roleKeyRaw === "operator" || roleKeyRaw === "team"
      ? "operator"
      : roleKeyRaw;
  const displayRole =
    roleKeyRaw === "operator" || roleKeyRaw === "team"
      ? "OPERATOR"
      : String(user?.role || "").toUpperCase();

  const config = roleConfigs[roleKey] || { groups: [] };
  const refetchData = () => { };

  return (
    <div className="p-4 md:p-10 w-full min-h-screen">
      <QueryComponent
        api={`${apiRoutesByRole[roleKey]}/${user?.id}`}
        queryKey={[roleKey, user?.id]}
      >
        {(response: any) => {
          const profile = response?.data || response;
          const formFields = initialTableConfig[roleKey]?.filter((field: any) => field.key !== "password") || [];

          return (
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
              <div className="flex flex-col lg:flex-row gap-8 w-full">
                {/* Left Column: Profile Summary */}
                <div className="lg:w-1/3 flex flex-col gap-6">
                  <Card className="border border-default-100 bg-background/60 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-warning-500/20 to-danger-500/20" />
                    <CardBody className="relative flex flex-col items-center -mt-16 pb-8 px-6">
                      <div className="relative p-1 bg-background rounded-full shadow-lg">
                        <Avatar
                          className="w-28 h-28 text-large border-2 border-background"
                          showFallback
                          name={profile.name}
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            profile.name || "User"
                          )}&background=random&size=128`}
                        />
                      </div>
                      <div className="mt-4 text-center">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">
                          {profile.name}
                        </h2>
                        <p className="text-default-500 font-medium">{profile.email}</p>
                      </div>

                      <Divider className="my-6 bg-default-100" />

                      <div className="w-full flex flex-col gap-4">
                        <div className="flex justify-between items-center px-4">
                          <span className="text-sm font-semibold text-default-400">Account Type</span>
                          <Chip
                            color="warning"
                            variant="flat"
                            className="font-bold uppercase text-[10px]"
                            size="sm"
                          >
                            {displayRole}
                          </Chip>
                        </div>
                        <div className="flex justify-between items-center px-4">
                          <span className="text-sm font-semibold text-default-400">Status</span>
                          <Chip
                            color="success"
                            variant="dot"
                            className="font-bold text-[10px]"
                            size="sm"
                          >
                            Active
                          </Chip>
                        </div>
                      </div>

                      <Spacer y={8} />

                      <div className="w-full px-4">
                        <EditModal
                          _id={profile._id}
                          initialData={profile}
                          currentTable={roleKey}
                          formFields={formFields}
                          apiEndpoint={apiRoutesByRole[roleKey]}
                          refetchData={refetchData}
                        />
                      </div>
                    </CardBody>
                  </Card>

                  {/* Optional: Stats or Quick Actions */}
                  <Card className="border border-default-100 bg-background/60 backdrop-blur-md shadow-md rounded-3xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-default-100 rounded-2xl">
                        <svg className="w-6 h-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Need help?</h4>
                        <p className="text-xs text-default-400">Contact system administrator</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Right Column: Detailed Grouped Info */}
                <div className="lg:w-2/3 flex flex-col gap-6">
                  {roleKey === "associate" && !profile?.associateCompany && (
                    <Card className="border-2 border-dashed border-warning-500/30 bg-warning-500/5 shadow-xl rounded-[32px] animate-in fade-in slide-in-from-top-4 duration-700">
                      <CardBody className="p-10 flex flex-col items-center text-center gap-8">
                        <div className="p-4 bg-warning-500/10 rounded-full">
                          <FiBriefcase className="text-warning-500 w-10 h-10" />
                        </div>
                        <div className="flex flex-col gap-3">
                          <h3 className="text-xl font-bold text-foreground tracking-tight uppercase">
                            Registration Required
                          </h3>
                          <p className="text-default-500 max-w-md text-base leading-relaxed">
                            To unlock premium trading features, verified status, and personalized marketplace rates, please register your company profile.
                          </p>
                        </div>
                        <AddModal
                          name="Company"
                          buttonLabel="Register Your Company Profile"
                          currentTable="associateCompany"
                          apiEndpoint={apiRoutes.associateCompany.getAll}
                          formFields={initialTableConfig.associateCompany}
                          onSuccess={async (companyData: any) => {
                            if (companyData?._id) {
                              try {
                                await patchData(`${apiRoutes.associate.getAll}/${profile?._id}`, {
                                  associateCompany: companyData._id,
                                  hasCompany: true,
                                });
                                window.location.reload();
                              } catch (err) {
                                console.error("Failed to link company:", err);
                              }
                            }
                          }}
                        />
                      </CardBody>
                    </Card>
                  )}

                  {config.groups
                    .filter((group) => {
                      if (roleKey === "associate" && !profile?.associateCompany) {
                        return (
                          group.title !== "Company Identification" &&
                          group.title !== "Location Details"
                        );
                      }
                      return true;
                    })
                    .map((group, idx) => (
                      <Card
                        key={idx}
                        className="border border-default-100 bg-background/60 backdrop-blur-md shadow-lg rounded-3xl"
                      >
                        <CardHeader className="px-8 pt-8 flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-warning-500 rounded-full" />
                          <h3 className="text-xl font-bold text-foreground tracking-tight">
                            {group.title}
                          </h3>
                        </CardHeader>
                        <CardBody className="px-8 pb-8 pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {group.fields.map(({ key, label, format }) => {
                              const value = getValue(profile, key);
                              return (
                                <div key={key} className="flex flex-col gap-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-default-400">
                                    {label}
                                  </span>
                                  <div className="flex items-center gap-2 group">
                                    <span className="text-base font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
                                      {format ? format(value, profile) : value ?? "—"}
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
              {roleKey === "operator" && <OperatorDashboardPanel userId={user?.id} />}
            </div>
          );
        }}
      </QueryComponent>
    </div>
  );
}
