"use client";
import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Spacer,
  Spinner,
} from "@nextui-org/react";
import { postData } from "@/core/api/apiHandler";
import * as XLSX from "xlsx";
import { BulkAddProps } from "@/data/interface-data";

// Helper function to convert DD-MM-YYYY to ISO format
const convertToIsoFromString = (dateString: string): string => {
  if (!dateString) return "";
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!dateRegex.test(dateString)) {
    console.error(`Invalid date format: ${dateString}`);
    return "";
  }
  const [day, month, year] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toISOString();
};

// Helper function to convert Unix timestamp to ISO format
const convertToDate = (timestamp: number): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toISOString();
};

// Helper function to convert Excel serial date to ISO format
const convertExcelDateToIso = (excelDate: number): string => {
  const excelEpoch = new Date(1899, 11, 30);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const date = new Date(excelEpoch.getTime() + excelDate * millisecondsPerDay);
  return date.toISOString();
};

const BulkAdd: React.FC<BulkAddProps> = ({
  apiEndpoint,
  refetchData,
  currentTable,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [statusMessage, setStatusMessage] = useState<string | null>(null); // Status message
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null
  ); // Status type

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatusMessage("Please select a file before uploading.");
      setStatusType("error");
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    setStatusType(null); // Clear previous status

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      if (typeof data === "string" || data instanceof ArrayBuffer) {
        try {
          let jsonData;

          if (file.type === "text/csv") {
            const csvString =
              typeof data === "string" ? data : new TextDecoder().decode(data);
            const workbook = XLSX.read(csvString, { type: "string" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet);

            jsonData = jsonData.map((item: any) => {
              Object.keys(item).forEach((key) => {
                const value = item[key];
                if (typeof value === "number" && value > 25569) {
                  item[key] = convertExcelDateToIso(value);
                }
              });
              return item;
            });
          } else {
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet);

            jsonData = jsonData.map((item: any) => {
              Object.keys(item).forEach((key) => {
                const value = item[key];
                if (typeof value === "number" && value > 25569) {
                  item[key] = convertExcelDateToIso(value);
                }
              });
              return item;
            });
          }
          console.log("jsonData", jsonData);
          console.log("Final Data Sent to Backend:", jsonData);

          await postData(apiEndpoint, jsonData);
          setStatusMessage("Data uploaded successfully!");
          setStatusType("success");
          setFile(null);
          refetchData();
        } catch (error) {
          console.error("Error parsing the file:", error);
          setStatusMessage(
            "Failed to process the file. Please check the format and try again."
          );
          setStatusType("error");
        } finally {
          setIsLoading(false);
        }
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="justify-between items-center w-max">
      <Accordion variant="splitted">
        <AccordionItem
          key="1"
          aria-label="Accordion 1"
          title={`Bulk Add ${currentTable}`}
        >
          <Spacer y={1} />
          <Input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            className="w-[250px]"
          />
          <Spacer y={1} />
          <Button onClick={handleUpload} disabled={!file || isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" /> Processing...
              </>
            ) : (
              "Process & Upload File"
            )}
          </Button>
          {statusMessage && (
            <div
              style={{
                color: statusType === "success" ? "green" : "red",
                marginTop: "10px",
                border: `1px solid ${
                  statusType === "success" ? "green" : "red"
                }`,
                padding: "10px",
                borderRadius: "5px",
                backgroundColor:
                  statusType === "success" ? "#d4fdd4" : "#ffd6d6",
              }}
            >
              {statusMessage}
            </div>
          )}
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default BulkAdd;
