"use client";
import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Spacer,
} from "@nextui-org/react";
import { postData } from "@/core/api/apiHandler";
import * as XLSX from "xlsx";
import { BulkAddProps } from "@/data/interface-data";

// Helper function to convert DD-MM-YYYY to ISO format
const convertToIsoFromString = (dateString: string): string => {
  if (!dateString) return ""; // Return empty string if dateString is invalid
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/; // Regex to match "DD-MM-YYYY" format
  if (!dateRegex.test(dateString)) {
    console.error(`Invalid date format: ${dateString}`);
    return ""; // Log error and return empty for invalid date
  }
  const [day, month, year] = dateString.split("-").map(Number); // Extract day, month, year
  const date = new Date(year, month - 1, day); // Create Date object
  return date.toISOString(); // Convert to ISO format
};

// Helper function to convert Unix timestamp to ISO format
const convertToDate = (timestamp: number): string => {
  if (!timestamp) return ""; // Return empty string if timestamp is invalid
  const date = new Date(timestamp * 1000); // Convert Unix timestamp to JavaScript Date
  return date.toISOString(); // Convert to ISO format
};

// Helper function to convert Excel serial date to ISO format
const convertExcelDateToIso = (excelDate: number): string => {
  const excelEpoch = new Date(1899, 11, 30); // Excel epoch starts from Dec 30, 1899
  const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
  const date = new Date(excelEpoch.getTime() + excelDate * millisecondsPerDay);
  return date.toISOString(); // Convert to ISO format
};

const BulkAdd: React.FC<BulkAddProps> = ({
  apiEndpoint,
  refetchData,
  currentTable,
}) => {
  const [file, setFile] = useState<File | null>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
  };

  // Handle file parsing and upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      if (typeof data === "string" || data instanceof ArrayBuffer) {
        try {
          let jsonData;

          if (file.type === "text/csv") {
            // Parse CSV file
            const csvString =
              typeof data === "string" ? data : new TextDecoder().decode(data);
            const workbook = XLSX.read(csvString, { type: "string" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Handle Excel serial numbers
            jsonData = jsonData.map((item: any) => {
              Object.keys(item).forEach((key) => {
                const value = item[key];
                if (typeof value === "number" && value > 25569) {
                  item[key] = convertExcelDateToIso(value); // Convert serial number to ISO date
                }
              });
              return item;
            });
          } else {
            // Parse Excel file
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Handle Excel serial numbers
            jsonData = jsonData.map((item: any) => {
              Object.keys(item).forEach((key) => {
                const value = item[key];

                if (typeof value === "number" && value > 25569) {
                  item[key] = convertExcelDateToIso(value); // Convert serial number to ISO date
                }
              });
              return item;
            });
          }
          console.log("jsonData", jsonData);

          console.log("Final Data Sent to Backend:", jsonData); // Debug final data

          // Send data to the backend
          await postData(apiEndpoint, jsonData);
          alert("Data uploaded successfully!");
          setFile(null); // Reset file input
          refetchData(); // Refresh table data
        } catch (error) {
          console.error("Error parsing the file:", error);
          alert(
            "Failed to process the file. Please check the format and try again."
          );
        }
      }
    };

    reader.readAsBinaryString(file); // Read the file as binary string
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
          <Button onClick={handleUpload} disabled={!file}>
            Process & Upload File
          </Button>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default BulkAdd;
