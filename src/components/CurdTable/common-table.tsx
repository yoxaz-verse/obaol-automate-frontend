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
import { getLanguageCookie } from "@/utils/languageCookie";
import { useCurrency } from "@/context/CurrencyContext";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  day: "2-digit",
  month: "long",
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  day: "2-digit",
  month: "2-digit",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const TOOLTIP_THRESHOLD = 28;

const getStableDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toWeekString = (value: unknown) => {
  const date = getStableDate(value);
  if (!date) return "N/A";
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + 1) / 7);
  return `${date.getUTCFullYear()}-${weekNumber.toString().padStart(2, "0")}`;
};

const formatDate = (value: unknown) => {
  const date = getStableDate(value);
  return date ? DATE_FORMATTER.format(date) : "N/A";
};

const formatTime = (value: unknown) => {
  const date = getStableDate(value);
  return date ? TIME_FORMATTER.format(date) : "N/A";
};

const formatDateTime = (value: unknown) => {
  const date = getStableDate(value);
  return date ? `${SHORT_DATE_FORMATTER.format(date)} ${TIME_FORMATTER.format(date)}` : "N/A";
};

export default function CommonTable({
  TableData = [],
  columns,
  viewModal,
  deleteModal,
  editModal,
  otherModal,
  isLoading = false,
  emptyContent,
  page: serverPage,
  totalPages: serverTotalPages,
  rowsPerPage: serverRowsPerPage,
  onPageChange,
}: TableProps & { emptyContent?: React.ReactNode }) {
  const renderStartRef = React.useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const { formatRate } = useCurrency();
  type UserData = (typeof TableData)[0];

  const safeColumns = React.useMemo(() => columns || [], [columns]);
  const effectiveColumns = Math.max(1, safeColumns.length);
  const minTableWidthPx = Math.max(1100, effectiveColumns * 170);

  const columnsByUid = React.useMemo(() => {
    const map = new Map<React.Key, any>();
    safeColumns.forEach((column: any) => map.set(column.uid, column));
    return map;
  }, [safeColumns]);

  const actionColumns = React.useMemo(() => {
    const set = new Set<string>();
    safeColumns.forEach((column: any) => {
      const key = String(column?.uid || "");
      if (column?.type === "action" || key === "actions2") set.add(key);
    });
    return set;
  }, [safeColumns]);

  const getColumn = React.useCallback((columnKey: React.Key) => columnsByUid.get(columnKey), [columnsByUid]);
  const isActionColumn = React.useCallback((columnKey: React.Key) => actionColumns.has(String(columnKey)), [actionColumns]);

  const toDisplayText = React.useCallback((value: any, fallback = "N/A"): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      const out = String(value).trim();
      return out || fallback;
    }
    if (Array.isArray(value)) {
      const out = value
        .map((entry) => toDisplayText(entry, ""))
        .filter(Boolean)
        .join(", ");
      return out || fallback;
    }
    if (typeof value === "object") {
      const out =
        toDisplayText(value?.name, "") ||
        toDisplayText(value?.label, "") ||
        toDisplayText(value?.title, "") ||
        toDisplayText(value?.slug, "");
      return out || fallback;
    }
    return fallback;
  }, []);

  const renderTruncatedText = React.useCallback(
    (value: any, maxWidthClass?: string, allowWrap?: boolean) => {
      if (React.isValidElement(value)) return value;
      const str = toDisplayText(value, "N/A");
      const className = `block ${maxWidthClass || "max-w-[220px]"}`;
      if (allowWrap) {
        return <span className={`${className} whitespace-normal break-words`}>{str}</span>;
      }

      const needsTooltip = str.length > TOOLTIP_THRESHOLD;
      const content = <span className={`${className} truncate whitespace-nowrap`}>{str}</span>;
      return needsTooltip ? (
        <Tooltip content={str} delay={300} classNames={{ content: "max-w-[420px] break-words text-xs" }}>
          {content}
        </Tooltip>
      ) : (
        content
      );
    },
    [toDisplayText]
  );

  const renderCell = React.useCallback(
    (item: UserData, columnKey: React.Key) => {
      const column = getColumn(columnKey);
      if (!column) return <span>Column not found</span>;

      const cellValue = item[columnKey as keyof UserData];
      if (React.isValidElement(cellValue)) return cellValue;

      switch (column?.type) {
        case "currency": {
          const numeric = Number(cellValue);
          if (Number.isNaN(numeric)) return "—";
          return formatRate(numeric);
        }
        case "date":
          return formatDate(cellValue);
        case "boolean":
          return cellValue ? "Yes" : "No";
        case "time":
          return formatTime(cellValue);
        case "week":
          return toWeekString(cellValue);
        case "dateTime":
          return formatDateTime(cellValue);
        case "file": {
          if (!cellValue) return <span>No Image</span>;
          const imageURL = (item as any).fileURL || `${baseUrl}/${cellValue}`;
          return (
            <Image
              src={imageURL}
              alt={(item as any).name}
              width={72}
              height={72}
              className="w-18 h-18 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/fallback.jpg";
              }}
            />
          );
        }
        case "action":
          return (
            <div className="relative inline-flex w-fit mx-auto flex-nowrap items-center justify-center gap-4 whitespace-nowrap">
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
    [getColumn, deleteModal, editModal, formatRate, otherModal, renderTruncatedText, viewModal]
  );

  const isServerPagination = typeof onPageChange === "function" && typeof serverTotalPages === "number";
  const [page, setPage] = React.useState(1);
  const rowsPerPage = serverRowsPerPage || 10;
  const pages = isServerPagination ? Math.max(1, serverTotalPages || 1) : Math.ceil((TableData?.length || 0) / rowsPerPage);
  const activePage = isServerPagination ? serverPage || 1 : page;

  const items = React.useMemo(() => {
    if (isServerPagination) return TableData || [];
    const start = (page - 1) * rowsPerPage;
    return TableData ? TableData.slice(start, start + rowsPerPage) : [];
  }, [page, TableData, isServerPagination, rowsPerPage]);

  const dataSignature = React.useMemo(() => {
    if (!Array.isArray(TableData) || TableData.length === 0) return "empty";
    const first = (TableData[0] as any)?._id || (TableData[0] as any)?.id || "";
    const last = (TableData[TableData.length - 1] as any)?._id || (TableData[TableData.length - 1] as any)?.id || "";
    return `${TableData.length}:${String(first)}:${String(last)}`;
  }, [TableData]);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const elapsed = Math.round(performance.now() - renderStartRef.current);
    if (TableData.length >= 100) {
      console.info(`[perf][CommonTable] render=${elapsed}ms rows=${TableData.length} cols=${safeColumns.length}`);
    }
  }, [TableData.length, safeColumns.length]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const preferred = getLanguageCookie();
    if (!preferred || preferred === "en") return;
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("translation-reapply"));
    }, 80);
    return () => clearTimeout(timer);
  }, [dataSignature]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner {...({ color: "warning", size: "lg" } as any)} />
      </div>
    );
  }

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
                base: "w-full min-w-0 max-w-full overflow-visible",
                wrapper: "p-0 bg-transparent shadow-none overflow-visible",
                table: "w-max table-auto",
                th: [
                  "bg-foreground/[0.04]",
                  "dark:bg-white/[0.02]",
                  "text-default-700",
                  "dark:text-white/60",
                  "font-black",
                  "text-[10px]",
                  "uppercase",
                  "tracking-[0.2em]",
                  "border-b",
                  "border-white/10",
                  "whitespace-nowrap",
                  "min-w-[140px]",
                  "h-14",
                  "backdrop-blur-xl",
                ],
                td: [
                  "py-5",
                  "align-middle",
                  "text-[13px]",
                  "text-default-800",
                  "dark:text-white",
                  "whitespace-nowrap",
                  "min-w-[140px]",
                  "border-b",
                  "border-white/5",
                  "group-hover/row:border-warning-500/20",
                  "transition-all",
                ],
                tr: [
                  "group/row",
                  "hover:bg-default-50/50",
                  "dark:hover:bg-warning-500/[0.03]",
                  "transition-all",
                  "cursor-default",
                ],
              },
            } as any)}
            style={{ minWidth: `${minTableWidthPx}px` }}
          >
            <TableHeader columns={safeColumns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={isActionColumn(column.uid) ? "center" : column.align || "start"}
                  className={
                    isActionColumn(column.uid)
                      ? "whitespace-nowrap min-w-[150px] px-4 text-center"
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
                          ? "min-w-[150px] px-4 text-center"
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
        <div className="w-full">{emptyContent || <EmptyState />}</div>
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
              page: activePage,
              total: pages,
              onChange: (nextPage: number) => {
                if (isServerPagination) {
                  onPageChange?.(nextPage);
                } else {
                  setPage(nextPage);
                }
              },
            } as any)}
          />
        </div>
      )}
    </div>
  );
}
