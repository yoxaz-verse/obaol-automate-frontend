// components/CommonTable.tsx

"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Pagination,
  Spinner,
} from "@heroui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Image from "next/image";
import EmptyState from "../ui/EmptyState";
import { baseUrl } from "@/core/api/axiosInstance";
import { TableProps } from "@/data/interface-data";

export default function CommonTable({
  TableData = [], // Default value as an empty array
  columns,
  viewModal,
  deleteModal,
  editModal,
  otherModal,
  isLoading = false,
  emptyContent,
}: TableProps & { emptyContent?: React.ReactNode }) {
  type UserData = (typeof TableData)[0];
  const effectiveColumns = Math.max(1, columns?.length || 0);
  const minTableWidthPx = Math.max(1100, effectiveColumns * 170);
  const getColumn = React.useCallback(
    (columnKey: React.Key) => (columns || []).find((col) => col.uid === columnKey),
    [columns]
  );
  const isActionColumn = React.useCallback(
    (columnKey: React.Key) => {
      const column = getColumn(columnKey);
      return Boolean(column?.type === "action" || String(column?.uid || columnKey) === "actions2");
    },
    [getColumn]
  );

  const renderTruncatedText = React.useCallback((value: any, maxWidthClass?: string, allowWrap?: boolean) => {
    const str = String(value ?? "N/A");
    if (allowWrap) {
      return <span className={`block ${maxWidthClass || "max-w-[220px]"} whitespace-normal break-words`}>{str}</span>;
    }
    return (
      <Tooltip content={str} delay={300} classNames={{ content: "max-w-[420px] break-words text-xs" }}>
        <span className={`block ${maxWidthClass || "max-w-[220px]"} truncate whitespace-nowrap`}>{str}</span>
      </Tooltip>
    );
  }, []);

  const renderCell = React.useCallback(
    (item: UserData, columnKey: React.Key) => {
      const column = getColumn(columnKey);
      if (!column) {
        return <span>Column not found</span>; //Translate // Handle case when column is not found
      }

      const cellValue = item[columnKey as keyof UserData];
      const columnType = column?.type;

      switch (columnType) {
        case "date":
          if (cellValue) {
            const date = new Date(cellValue);
            return date.toLocaleDateString("en-GB", {
              year: "numeric",
              day: "2-digit", // Ensures two-digit day
              month: "long", // Ensures two-digit month
            });
          }
          return "N/A";
        case "boolean":
          if (cellValue) {
            return cellValue ? "Yes" : "No";
          }
          return "No";

        case "time":
          if (cellValue) {
            const time = new Date(cellValue);
            // Format the time in 12-hour format (AM/PM)
            return time.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true, // Ensures 12-hour format (AM/PM)
            });
          }
          return "N/A";
        case "week":
          if (cellValue) {
            const date = new Date(cellValue as string);

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

        case "dateTime":
          if (cellValue) {
            const dateTime = new Date(cellValue);

            const dateFormatted = dateTime.toLocaleDateString("en-GB", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });

            const timeFormatted = dateTime.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });

            // Combine date and time
            return `${dateFormatted} ${timeFormatted}`;
          }
          return "N/A";

        case "file":
          if (cellValue) {
            const imageURL = item.fileURL || `${baseUrl}/${cellValue}`;
            return (
              <Image
                src={imageURL}
                alt={item.name}
                width={72}
                height={72}
                className="w-18 h-18 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/fallback.jpg";
                }}
              />
            );
          }
          return <span>No Image</span>; //Translate

        case "action":
          return (
            <div className="relative inline-flex w-fit mx-auto flex-nowrap items-center justify-center gap-2 whitespace-nowrap">
              {viewModal && viewModal(item)}
              {editModal && editModal(item)}
              {otherModal && otherModal(item)}
              {deleteModal && deleteModal(item)}
            </div>
          );

        default:
          return renderTruncatedText(
            cellValue || "N/A",
            column.maxWidth || "max-w-[220px]",
            Boolean(column.allowWrap)
          );
      }
    },
    [viewModal, deleteModal, editModal, otherModal, renderTruncatedText, getColumn]
  );

  // Pagination logic
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;
  const pages = Math.ceil((TableData?.length || 0) / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return TableData ? TableData.slice(start, end) : [];
  }, [page, TableData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner {...({ color: "warning", size: "lg" } as any)} />
      </div>
    );
  }

  const isEmpty = !TableData || TableData.length === 0;
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 8);
  }, []);

  React.useEffect(() => {
    updateScrollState();
  }, [items, updateScrollState]);

  return (
    <div className="group relative w-full min-w-0 max-w-full overflow-hidden">
      {!isEmpty ? (
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="scrollbar-gutter-stable w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x pb-2"
        >
          <Table
            {...({
              removeWrapper: true,
              isHeaderSticky: true,
              isStriped: true,
              color: "warning",
              className: "w-max",
              classNames: {
                base: "w-full min-w-0 max-w-full",
                wrapper: "p-0 bg-transparent shadow-none overflow-visible",
                table: "w-max table-auto",
                th: [
                  "bg-default-100/80",
                  "dark:bg-default-100/20",
                  "text-default-700",
                  "dark:text-default-500", // Slightly dimmed uppercase headers
                  "font-bold",
                  "text-[11px]",
                  "uppercase",
                  "tracking-wider",
                  "border-b",
                  "border-divider",
                  "whitespace-nowrap",
                  "min-w-[140px]",
                  "backdrop-blur-md", // Keep headers sharp
                ],
                td: [
                  "py-4", // Slightly more breathing room
                  "align-middle",
                  "text-sm",
                  "text-default-800",
                  "dark:text-foreground", // High contrast text for body
                  "whitespace-nowrap",
                  "overflow-hidden",
                  "min-w-[140px]",
                  "border-b",
                  "border-divider/50",
                ],
                tr: [
                  "group/row",
                  "hover:bg-default-50/50",
                  "dark:hover:bg-default-100/10",
                  "transition-colors",
                  "cursor-default",
                  "even:bg-default-50/30",
                  "dark:even:bg-default-50/5",
                ],
              }
            } as any)}
            style={{ minWidth: `${minTableWidthPx}px` }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={isActionColumn(column.uid) ? "center" : (column.align || "start")}
                  className={
                    isActionColumn(column.uid)
                      ? "whitespace-nowrap w-[1%] !min-w-0 !px-2 text-center"
                      : "whitespace-nowrap min-w-[140px]"
                  }
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>

            <TableBody items={items}>
              {(item: any) => (
                <TableRow key={item._id} className="text-foreground">
                  {(columnKey) => (
                    <TableCell
                      className={
                        isActionColumn(columnKey)
                          ? "w-[1%] !min-w-0 !px-2 text-center"
                          : "min-w-[140px]"
                      }
                    >
                      {renderCell(item, columnKey)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="w-full">
          {emptyContent || <EmptyState />}
        </div>
      )}
      {!isEmpty && (
        <>
          <button
            type="button"
            aria-label="Scroll table left"
            onClick={() => scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border border-default-200/70 bg-content1/90 backdrop-blur-md text-foreground shadow-sm transition ${
              canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <FiChevronLeft className="mx-auto" />
          </button>
          <button
            type="button"
            aria-label="Scroll table right"
            onClick={() => scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border border-default-200/70 bg-content1/90 backdrop-blur-md text-foreground shadow-sm transition ${
              canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <FiChevronRight className="mx-auto" />
          </button>
        </>
      )}
      {!isEmpty && items.length > 0 && (
        <div className="flex w-full justify-center pt-2">
          <Pagination
            {...({
              isCompact: true,
              showControls: true,
              showShadow: true,
              color: "warning",
              page: page,
              total: pages,
              onChange: (page: number) => setPage(page),
            } as any)}
          />
        </div>
      )}
    </div>
  );
}
