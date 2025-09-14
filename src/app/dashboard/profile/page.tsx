// pages/Profile.tsx
"use client";

import React, { useContext } from "react";
import AuthContext from "@/context/AuthContext";
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spacer,
} from "@nextui-org/react";
import QueryComponent from "@/components/queryComponent";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import EditModal from "@/components/CurdTable/edit-model";
import dayjs from "dayjs";

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
      fields: { key: string; label: string; format?: (val: any) => string }[];
    }[];
  }
> = {
  employee: {
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
            format: (v) => dayjs(v).format("DD MMM YYYY"),
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
        title: "Other Information",
        fields: [
          {
            key: "languageKnown",
            label: "Languages",
            format: (arr) =>
              Array.isArray(arr) ? arr.map((l: any) => l.name).join(", ") : "—",
          },
          {
            key: "createdAt",
            label: "Profile Created",
            format: (v) => dayjs(v).format("DD MMM YYYY"),
          },
        ],
      },
    ],
  },

  associate: {
    groups: [
      {
        title: "Company Information",
        fields: [
          { key: "company.name", label: "Company Name" },
          { key: "company.type", label: "Company Type" },
          { key: "company.address", label: "Address" },
          { key: "company.state.name", label: "State" },
          { key: "company.district.name", label: "District" },
        ],
      },
      {
        title: "Contact Person",
        fields: [
          { key: "contact.name", label: "Contact Name" },
          { key: "contact.phone", label: "Contact Phone" },
          { key: "contact.email", label: "Contact Email" },
        ],
      },
    ],
  },

  admin: {
    groups: [
      {
        title: "Admin Profile",
        fields: [
          { key: "name", label: "Admin Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
        ],
      },
      {
        title: "Access Details",
        fields: [
          { key: "role", label: "Role" },
          {
            key: "lastLogin",
            label: "Last Login",
            format: (v) => (v ? dayjs(v).format("DD MMM YYYY, HH:mm") : "—"),
          },
          {
            key: "permissions",
            label: "Permissions",
            format: (arr) =>
              Array.isArray(arr) ? arr.join(", ") : "No Permissions",
          },
        ],
      },
    ],
  },

  inventoryManager: {
    groups: [
      {
        title: "Manager Profile",
        fields: [
          { key: "name", label: "Full Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
        ],
      },
      {
        title: "Inventory Details",
        fields: [
          {
            key: "assignedWarehouse.name",
            label: "Assigned Warehouse",
          },
          {
            key: "totalStockManaged",
            label: "Total Stock Managed",
          },
          {
            key: "lastUpdated",
            label: "Last Updated",
            format: (v) => dayjs(v).format("DD MMM YYYY, HH:mm"),
          },
        ],
      },
    ],
  },

  customer: {
    groups: [
      {
        title: "Customer Profile",
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
        title: "Order Information",
        fields: [
          {
            key: "totalOrders",
            label: "Total Orders",
          },
          {
            key: "lastOrderDate",
            label: "Last Order Date",
            format: (v) => (v ? dayjs(v).format("DD MMM YYYY") : "No Orders"),
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
  const role = user?.role?.toLowerCase();

  if (!role) return null;

  const config = roleConfigs[role] || { groups: [] };
  const refetchData = () => {};

  return (
    <div className="p-10 w-full flex flex-col gap-6">
      <QueryComponent
        api={apiRoutesByRole[role] + "/" + user?.id}
        queryKey={[apiRoutesByRole[role]]}
      >
        {(profile: any) => {
          const formFields = initialTableConfig[role];

          return (
            <section>
              {/* Top Card with Avatar + Name */}
              <Card className="border text-white bg-transparent shadow-lg">
                <CardHeader className="flex gap-4 items-center">
                  <Avatar
                    size="lg"
                    showFallback
                    name={profile.name}
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profile.name || "User"
                    )}&background=random`}
                  />
                  <div>
                    <h2 className="text-xl font-bold">{profile.name}</h2>
                    <p className="text-sm text-default-500">{profile.email}</p>
                  </div>
                </CardHeader>
              </Card>
              <Spacer y={2} />
              <div className=" flex flex-col lg:flex-row gap-2 ">
                {/* Grouped Info Cards */}
                {config.groups.map((group, idx) => (
                  <Card
                    key={idx}
                    className="w-full border text-white bg-transparent shadow-md"
                  >
                    <CardHeader>
                      <h3 className="text-lg font-semibold">{group.title}</h3>
                    </CardHeader>
                    <Divider />
                    <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                      {group.fields.map(({ key, label, format }) => {
                        const value = getValue(profile, key);
                        return (
                          <div key={key} className="flex flex-col">
                            <span className="text-xs uppercase text-gray-400">
                              {label}
                            </span>
                            <span className="text-base font-medium">
                              {format ? format(value) : value ?? "—"}
                            </span>
                          </div>
                        );
                      })}
                    </CardBody>
                  </Card>
                ))}
              </div>
              <Spacer y={2} />

              {/* Edit Button */}
              <div className="flex justify-end">
                <EditModal
                  _id={profile._id}
                  initialData={profile}
                  currentTable={role}
                  formFields={formFields}
                  apiEndpoint={apiRoutesByRole[role]}
                  refetchData={refetchData}
                />
              </div>
            </section>
          );
        }}
      </QueryComponent>
    </div>
  );
}
