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
} from "@nextui-org/react";
import { FiDelete, FiEdit, FiEye } from "react-icons/fi";
import Image from "next/image";
import { baseUrl } from "@/core/api/axiosInstance";

interface TableProps {
  TableData: any[];
  columns: { name: string; uid: string }[];
  viewModal?: (item: any) => React.ReactNode;
  deleteModal?: (item: any) => React.ReactNode;
  editModal?: (item: any) => React.ReactNode;
  isLoading?: boolean;
}

export default function CommonTable({
  TableData,
  columns,
  viewModal,
  deleteModal,
  editModal,
  isLoading = false,
}: TableProps) {
  type UserData = (typeof TableData)[0];
  console.log(TableData);

  const renderCell = React.useCallback(
    (item: UserData, columnKey: React.Key) => {
      const cellValue = item[columnKey as keyof UserData];

      switch (columnKey) {
        case "fileURL":
          // Use fileURL if available, otherwise construct from cellValue
          const imageURL = item.fileURL
            ? item.fileURL
            : `${baseUrl}/${cellValue}`;
          return (
            <>
              <Image
                src={imageURL} // Removed the conditional appending of .jpg
                alt={item.name}
                width={1000}
                height={1000}
                style={{ objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/fallback.jpg"; // Optional: Fallback image
                }}
              />
            </>
          );
        // case "worker":
        //   // If the column is "workers", loop through the workers array and display their names
        //   if (Array.isArray(cellValue)) {
        //     return (
        //       <div>
        //         {cellValue.map((worker: { name: string }, index: number) => (
        //           <p key={index}>{worker.name}</p>
        //         ))}
        //       </div>
        //     );
        //   }
        //   return <p>No workers</p>; // Default if no workers are present

        case "actions2":
          return (
            <div className="relative flex items-center gap-2">
              {viewModal && (
                <Tooltip content="View">
                  <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                    {viewModal(item)}
                  </span>
                </Tooltip>
              )}
              {editModal && (
                <Tooltip content="edit">
                  <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                    {editModal(item)}
                  </span>
                </Tooltip>
              )}
              {deleteModal && (
                <Tooltip color="danger" content="Delete">
                  <span className="text-lg text-danger cursor-pointer active:opacity-50">
                    {deleteModal(item)}
                  </span>
                </Tooltip>
              )}
            </div>
          );

        default:
          return cellValue;
      }
    },
    [viewModal, deleteModal, editModal]
  );

  // Pagination logic (optional)
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;
  const pages = Math.ceil(TableData.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return TableData.slice(start, end);
  }, [page, TableData]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Table
      aria-label="Table with custom actions"
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="secondary"
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
        </div>
      }
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions2" ? "center" : "start"}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody items={items}>
        {(item: any) => (
          <TableRow key={item._id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
