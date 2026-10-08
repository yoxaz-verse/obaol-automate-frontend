"use client";

import React, { useState } from "react";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { FiDownload, FiFileText } from "react-icons/fi";
import { toast } from "sonner";
import api from "@/core/api/axiosInstance";
import { userExportRoute } from "@/core/api/apiRoutes";

type Props = {
  currentTable: string;
  search: string;
  filters: Record<string, any>;
};

const fileNameFromHeader = (header: string | undefined, fallback: string) => {
  const match = String(header || "").match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallback;
};

export default function UsersExportButton({ currentTable, search, filters }: Props) {
  const [isExporting, setIsExporting] = useState(false);

  const download = async (format: "csv" | "xlsx") => {
    setIsExporting(true);
    try {
      const response = await api.get(userExportRoute, {
        params: {
          userType: currentTable,
          format,
          search: search || undefined,
          sort: "createdAt:desc",
          ...filters,
        },
        responseType: "blob",
      });
      const fallback = `obaol-${currentTable}-${new Date().toISOString().slice(0, 10)}.${format}`;
      const filename = fileNameFromHeader(response.headers["content-disposition"], fallback);
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} export downloaded.`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to export users.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          variant="flat"
          color="warning"
          isLoading={isExporting}
          startContent={!isExporting ? <FiDownload /> : undefined}
          className="border border-obaol-500/30 bg-obaol-500/10 font-bold text-foreground"
        >
          Export
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Export users">
        <DropdownItem key="csv" startContent={<FiFileText />} onPress={() => download("csv")}>
          CSV file
        </DropdownItem>
        <DropdownItem key="xlsx" startContent={<FiFileText />} onPress={() => download("xlsx")}>
          Excel workbook (.xlsx)
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
