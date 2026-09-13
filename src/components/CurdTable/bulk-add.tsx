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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData } from "@/core/api/apiHandler"; // Your API handler
import { BulkAddProps } from "@/data/interface-data";

type SpreadsheetRow = Record<string, unknown>;

type UploadError = {
  response?: {
    data?: {
      message?: string;
      invalidRows?: Array<{ row: number; issues: string[] }>;
    };
  };
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null); // Status message
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null
  ); // Status type
  const [isLoading, setLoading] = useState(false); // Loading state

  const queryClient = useQueryClient();

  const addItem = useMutation({
    mutationFn: async (data: SpreadsheetRow[]) => postData(apiEndpoint, data, {}),
    onSuccess: () => {
      // Refetch data after successful upload
      queryClient.refetchQueries({
        queryKey: [currentTable, apiEndpoint],
      });
      setStatusMessage("Data uploaded successfully!"); // Success toast //Translate
      setStatusType("success");
      setLoading(false);
      setFile(null);
      refetchData(); // Refetch data from parent component (if necessary)
    },
    onError: (error: UploadError) => {
      // Handle error scenario
      setStatusType("error");

      const errorMessage = error.response?.data?.message || "An error occurred"; //Translate

      let detailedErrorMessage = errorMessage;

      if (
        error.response?.data?.invalidRows &&
        Array.isArray(error.response?.data?.invalidRows)
      ) {
        // Format the invalid rows message to show issues
        const invalidRows = error.response.data.invalidRows
          .map((item: { row: number; issues: string[] }) => {
            return `Row ${item.row}: ${item.issues.join(", ")}`;
          })
          .join("\n");

        detailedErrorMessage += `\n\nInvalid Rows:\n${invalidRows}`;
      }

      // Set the formatted error message
      setStatusMessage(detailedErrorMessage);
      setLoading(false);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatusMessage("Please select a file before uploading."); //Translate
      setStatusType("error"); //Translate
      return;
    }

    setStatusMessage(null);
    setStatusType(null); // Clear previous status
    setLoading(true); // Set loading state

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      if (data instanceof ArrayBuffer) {
        try {
          // Keep the sizeable spreadsheet parser out of routes that never open
          // the bulk-upload control.
          const XLSX = await import("xlsx");
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          if (!sheetName || !worksheet) {
            throw new Error("The workbook does not contain a readable sheet.");
          }

          const jsonData = XLSX.utils
            .sheet_to_json<SpreadsheetRow>(worksheet)
            .map((item) => {
              Object.keys(item).forEach((key) => {
                const value = item[key];
                if (typeof value === "number" && value > 25569) {
                  item[key] = convertExcelDateToIso(value);
                }
              });
              return item;
            });

          // Call the mutate function with the prepared data
          addItem.mutate(jsonData);
        } catch (error) {
          console.error("Error parsing the file:", error); //Translate
          setStatusMessage(
            "Failed to process the file. Please check the format and try again." //Translate
          );
          setStatusType("error"); //Translate
          setLoading(false);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="justify-between items-center w-max">
      {/* @ts-ignore */}
      <Accordion variant="splitted">
        <AccordionItem
          key="1"
          aria-label="Bulk Add" //Translate
          title={`Bulk Add ${currentTable}`} //Translate
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
                <Spinner size="sm" /> Processing...{/* Translate */}
              </>
            ) : (
              "Process & Upload File" //Translate
            )}
          </Button>
          {statusMessage && (
            <div
              className="flex flex-wrap  max-w-[300px] sm:max-w-[500px] md:max-w-[800px] lg:max-w-[1000px]"
              style={{
                color: statusType === "success" ? "green" : "red",
                marginTop: "10px",
                border: `1px solid ${statusType === "success" ? "green" : "red"
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
