"use client";
import React, { useState } from "react";
import { Button, Input, Spacer } from "@nextui-org/react";
import { postData } from "@/core/api/apiHandler";
import * as XLSX from "xlsx";

type BulkAddProps = {
  apiEndpoint: string; // Endpoint to upload the JSON data
  refetchData: () => void; // Function to refresh data after successful upload
  currentTable: string;
};

function BulkAdd({ apiEndpoint, refetchData, currentTable }: BulkAddProps) {
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
          } else {
            // Parse Excel file
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet);
          }

          // Send parsed JSON to the backend
          await postData(apiEndpoint, jsonData);
          alert("Data uploaded successfully!");
          setFile(null); // Reset the file input
          refetchData(); // Refresh the data
        } catch (error) {
          console.error("Error parsing the file:", error);
          alert(
            "Failed to process the file. Please check the format and try again."
          );
        }
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="justify-between items-center">
      <h5>Bulk Add {currentTable}</h5>
      <Spacer y={1} />
      <Input
        type="file"
        accept=".csv, .xlsx, .xls"
        onChange={handleFileChange}
        className="w-max"
      />
      <Spacer y={1} />
      <Button onClick={handleUpload} disabled={!file}>
        Process & Upload File
      </Button>
    </div>
  );
}

export default BulkAdd;
