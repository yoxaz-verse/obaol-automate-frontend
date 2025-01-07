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
} from "@nextui-org/react";
import { FiEye } from "react-icons/fi";
import Image from "next/image";
import { DetailsModalProps } from "@/data/interface-data";

export default function DetailsModal({
  currentTable,
  data,
  columns = [],
}: DetailsModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

      case "image":
        if (value) {
          return (
            <Image
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
          <Image
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
          console.log(key);

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
        return value || "N/A"; // Return the value or N/A if undefined
    }
  };

  return (
    <>
      <FiEye onClick={onOpen} className="cursor-pointer hover:text-green-600" />
      <Modal size="full" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {currentTable && toTitleCase(currentTable)} Details
              </ModalHeader>
              <ModalBody className="space-y-4 overflow-y-auto max-h-[90vh] ">
                {/* Display User Details */}
                {Object.keys(data).map((key) => {
                  // Skip rendering excluded fields
                  if (excludeFields.includes(key)) return null;

                  if (Array.isArray(data[key]) && key === "locationManagers") {
                    return (
                      <div key={key} className="mb-4">
                        <strong>{formatLabel(key)}:</strong>
                        <div className="list-disc list-inside">
                          {data[key].map((manager: any, index: number) => (
                            <div key={index}>
                              <Spacer y={3} />
                              <strong>Manager Name:</strong>{" "}
                              {manager.manager?.name || "N/A"} <br />
                              <strong>Code:</strong> {manager.code || "N/A"}
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
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
