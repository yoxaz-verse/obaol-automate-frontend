"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Spacer,
  Tooltip,
} from "@nextui-org/react";
import { FiEye, FiUser, FiMail, FiPhone, FiBriefcase, FiCheckCircle, FiClock } from "react-icons/fi";
import { DashboardStatusBadge } from "@/components/dashboard/DashboardUI";
import RevealImage from "@/components/ui/RevealImage";
import { DetailsModalProps } from "@/data/interface-data";
import StatusHistoryTabContent from "../StatusHistory/statusHistory";
import { useCurrency } from "@/context/CurrencyContext";

interface DetailsModalCustomProps extends DetailsModalProps {
  customTrigger?: React.ReactNode;
}

export default function DetailsModal({
  currentTable,
  data,
  columns = [],
  customTrigger,
}: DetailsModalCustomProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { formatRate } = useCurrency();
  const isAssociate = currentTable === "associate";

  // List of fields you want to exclude from being displayed
  const excludeFields = [
    "password",
    "__v",
    "_id",
    "isDeleted",
    "isActive",
    "fileURL",
    "fileId",
  ];
  const toTitleCase = (str: string): string => {
    return str
      .replace(/[_-]/g, " ") // Replace underscores or hyphens with spaces
      .replace(/([A-Z])/g, " $1") // Add a space before each uppercase letter
      .replace(/^./, (char) => char.toUpperCase()) // Capitalize the first letter
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .trim();
  };

  // Helper function to capitalize and space out camelCase or snake_case field names
  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .toUpperCase();
  };

  // State to track if fallback image has been used
  const [isFallback, setIsFallback] = useState(false);

  // Helper function to format the value based on the column type
  const formatValue = (key: string, value: any) => {
    const column = columns.find((col) => col.uid === key);

    const type = column?.type;

    switch (type) {
      case "date":
        if (value) {
          const date = new Date(value);
          return date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        }
        return "N/A";

      case "time":
        if (value) {
          const time = new Date(value);
          return time.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true, // Ensures 12-hour format (AM/PM)
          });
        }
        return "N/A";

      case "dateTime":
        if (value) {
          const dateTime = new Date(value);
          const dateFormatted = dateTime.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          const timeFormatted = dateTime.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });

          // Combine date and time
          return `${dateFormatted} ${timeFormatted}`;
        }
        return "N/A";
      case "week":
        if (value) {
          const date = new Date(value as string);

          // Get the ISO week number and year
          const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
          const days = Math.floor(
            (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
          );
          const weekNumber = Math.ceil((days + 1) / 7);

          // Return the formatted date as yyyy-ww
          return `${date.getUTCFullYear()}-${weekNumber
            .toString()
            .padStart(2, "0")}`;
        }

      case "number":
        if (value !== undefined && value !== null) {
          return value.toLocaleString(); // Format numbers with commas
        }
        return "N/A";

      case "currency":
        if (value !== undefined && value !== null) {
          return formatRate(Number(value));
        }
        return "N/A";

      case "image":
        if (value) {
          return (
            <RevealImage
              src={value}
              alt="Image"
              width={300}
              height={300}
              style={{ objectFit: "cover" }}
              onError={() => setIsFallback(true)}
            />
          );
        }
        return (
          <RevealImage
            src="/fallback.jpg"
            alt="Fallback Image"
            width={300}
            height={300}
          />
        );

      case "text":
        return value || "N/A"; // Text field, return the value as-is

      case "multiselectValue":
        if (key === "locationManager") {
          return (
            <ul className="list-disc list-inside">
              {Array.isArray(value) && value.length > 0 ? (
                value.map((manager, index) => (
                  <li key={index}>
                    <strong>Manager Name:</strong>{" "}
                    {manager.manager?.name || "N/A"} <br />
                    <strong>Code:</strong> {manager.code || "N/A"}
                  </li>
                ))
              ) : (
                <p>No Managers Assigned</p>
              )}
            </ul>
          );
        }
        return "N/A";

      case "select":
        return value ? value : "N/A"; // Select field, return the value or "N/A"

      case "file":
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            Download File
          </a>
        ) : (
          "No File"
        ); // File type, provide download link

      case "textarea":
        return value || "N/A"; // Textarea field, return the value or "N/A"

      case "boolean":
        return value ? "Yes" : "No"; // Boolean field, return Yes/No

      case "action":
        return value || "N/A"; // Action field, just return the value

      case "email":
        return value ? <a href={`mailto:${value}`}>{value}</a> : "No Email"; // Email type, return mailto link

      case "password":
        return "********"; // Password field, always return a masked string

      default:
        // Safety check for objects
        if (typeof value === 'object' && value !== null) {
          // Try to extract a name or label if possible, otherwise stringify or ignore
          return value.name || value.label || JSON.stringify(value);
        }
        return value || "N/A"; // Return the value or N/A if undefined
    }
  };

  return (
    <>
      {customTrigger ? (
        <div onClick={onOpen} className="cursor-pointer w-fit h-fit">
          {customTrigger}
        </div>
      ) : (
        <Tooltip content="View associate">
          <button
            type="button"
            aria-label="View associate"
            onClick={onOpen}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-500/10 p-2 text-xs font-bold text-primary-600 hover:bg-primary-500/20 cursor-pointer active:opacity-50 group transition-all"
          >
            <FiEye size={20} className="text-primary-500/80 group-hover:text-primary-600 transition-colors" />
            {isAssociate && <span className="hidden xl:inline">View</span>}
          </button>
        </Tooltip>
      )}
      <Modal size="full" isOpen={isOpen} onOpenChange={onOpenChange} classNames={isAssociate ? { wrapper: "justify-end p-0", base: "m-0 h-dvh max-h-dvh w-full max-w-[680px] rounded-none sm:rounded-l-[2rem] bg-content1", header: "border-b border-default-200/70 px-6 py-5 dark:border-white/10", body: "px-5 py-6 sm:px-7", footer: "border-t border-default-200/70 px-6 py-4 dark:border-white/10" } : undefined}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-3 pr-12">
                {isAssociate ? <><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-600"><FiUser /></span><span><span className="block text-lg font-bold">Associate details</span><span className="block text-xs font-medium text-default-400">Profile, company, and account status</span></span></> : <>{currentTable && toTitleCase(currentTable)} Details</>}
              </ModalHeader>
              <ModalBody className="space-y-4 overflow-y-auto max-h-[90vh] text-foreground">
                {isAssociate ? (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-default-200/70 bg-default-50/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xl font-bold">{String(data.name || "Unnamed associate")}</p><p className="mt-1 text-sm text-default-500">{String(data.designation || "Designation not provided")}</p></div><div className="flex flex-wrap gap-2"><DashboardStatusBadge tone={data.isActive ? "success" : "danger"}>{data.isActive ? "Active" : "Inactive"}</DashboardStatusBadge><DashboardStatusBadge tone={data.registrationStatus === "APPROVED" ? "success" : "warning"}>{String(data.registrationStatus || "Pending")}</DashboardStatusBadge></div></div>
                    </div>
                    <section><h3 className="mb-3 text-sm font-bold">Contact information</h3><dl className="grid gap-3 sm:grid-cols-2"><Detail icon={<FiMail />} label="Email" value={String(data.email || "")} /><Detail icon={<FiPhone />} label="Primary phone" value={String(data.phone || "")} /><Detail icon={<FiPhone />} label="Secondary phone" value={String(data.phoneSecondary || "")} /><Detail icon={<FiBriefcase />} label="Company" value={String(data.associateCompany || "")} /></dl></section>
                    <section><h3 className="mb-3 text-sm font-bold">Verification</h3><div className="grid gap-3 sm:grid-cols-2"><StatusDetail label="Email" value={Boolean(data.isEmailVerified)} /><StatusDetail label="Company" value={Boolean(data.isCompanyVerified)} /></div></section>
                    <section><h3 className="mb-3 text-sm font-bold">Recent activity</h3><dl className="grid gap-3 sm:grid-cols-2"><Detail icon={<FiClock />} label="Last seen" value={formatValue("lastSeenAt", data.lastSeenAt)} /><Detail icon={<FiClock />} label="Last login" value={formatValue("lastLoginAt", data.lastLoginAt)} /><Detail icon={<FiClock />} label="Created" value={formatValue("createdAt", data.createdAt)} /></dl></section>
                  </div>
                ) : <>
                {/* Display User Details */}
                {Object.keys(data).map((key) => {
                  // Skip rendering excluded fields
                  if (excludeFields.includes(key)) return null;

                  if (Array.isArray(data[key]) && key === "locationManagers") {
                    return (
                      <div key={key} className="mb-4">
                        <strong className="text-foreground">{formatLabel(key)}:</strong>
                        <div className="list-disc list-inside text-foreground">
                          {data[key].map((manager: any, index: number) => (
                            <div key={index}>
                              <Spacer y={3} />
                              <strong>Manager Name:</strong> {/* Translate */}
                              {manager.manager?.name || "N/A"} <br />
                              <strong>Code:</strong> {manager.code || "N/A"}
                              {/* Translate */}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <p key={key}>
                      <strong>{formatLabel(key)}:</strong>{" "}
                      {formatValue(key, data[key])}
                    </p>
                  );
                })}
                <StatusHistoryTabContent
                  entityId={String(data._id || "")}
                  entityType="Location"
                />{" "}
                </>}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close{/* Translate */}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="rounded-2xl border border-default-200/70 p-4 dark:border-white/10"><div className="flex items-center gap-2 text-xs font-semibold text-default-400">{icon}{label}</div><div className="mt-2 break-words text-sm font-semibold text-foreground">{value || "Not provided"}</div></div>;
}

function StatusDetail({ label, value }: { label: string; value: boolean }) {
  return <div className="flex items-center justify-between rounded-2xl border border-default-200/70 p-4 dark:border-white/10"><span className="flex items-center gap-2 text-sm font-semibold"><FiCheckCircle className={value ? "text-success-500" : "text-warning-500"} />{label}</span><DashboardStatusBadge tone={value ? "success" : "warning"}>{value ? "Verified" : "Pending"}</DashboardStatusBadge></div>;
}
