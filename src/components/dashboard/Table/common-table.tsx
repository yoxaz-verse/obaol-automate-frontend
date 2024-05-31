import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, ChipProps, getKeyValue, Pagination, Spinner } from "@nextui-org/react";
// import {columns, users} from "./data";
import { FiCheck, FiDelete, FiEdit, FiEye } from "react-icons/fi"; import { TableProps } from "@/data/interface-data";
import { TiInputChecked } from "react-icons/ti";
import Image from "next/image";
const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

// type User = typeof users[0];

export default function CommonTable({ TableData, columns, viewProjectDetails, verifyActivity, viewModal, deleteModal, isLoading = true }: TableProps) {
  type User = typeof TableData[0];
  const renderCell = React.useCallback((user: User, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof User];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.avatar }}
            description={user.email}
            name={cellValue as string}
          >
            {user.email}
          </User>
        );
      case "image":
        return (
          <div className="">
            <Image src={
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/${user?.imageId?.imageName}`
            } alt="image" width={100} height={100} className="w-[50px] h-[50px] rounded-full" />
          </div>
        );
      case "createdAt":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{
              new Date(cellValue as string).toLocaleDateString()
            }</p>
            <p className="text-bold text-sm capitalize text-default-400">{
              new Date(cellValue as string).toLocaleTimeString()
            }</p>
          </div>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue as string}</p>
            <p className="text-bold text-sm capitalize text-default-400">{user.team}</p>
          </div>
        );
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[user.status || ""]} size="sm" variant="flat">
            {cellValue as string}
          </Chip>
        );
      case "actions":
        if (user.actions === 'Verify') {
          return <div className="flex w-full">
            <button className="w-[70px] h-[30px] bg-[#3EADEB] rounded-2xl text-white mx-1" onClick={() => verifyActivity ? verifyActivity(user) : null} >Verify</button>
            <button onClick={() => viewProjectDetails ? viewProjectDetails(user) : null} className="w-[70px] h-[30px] rounded-2xl flex items-center justify-center bg-[#ECEAEA] border-1 border-[#E6DFDF] text-[#646464]">View <FiEye className="ml-2" /></button>
          </div>
        }
        else return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <FiEye onClick={() => viewProjectDetails ? viewProjectDetails(user) : null} />
              </span>
            </Tooltip>
            <Tooltip content="Edit user">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <FiEdit />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete user">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <FiDelete />
              </span>
            </Tooltip>
          </div>
        );
      case "actions2":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                {
                  viewModal ? viewModal(user) : null
                }
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete user">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                {
                  deleteModal ? deleteModal(user) : null
                }
              </span>
            </Tooltip>
          </div>
        );
      case 'deliverable': return (<div className="flex"><TiInputChecked className="text-xl ml-8" /></div>)
      default:
        return cellValue;
    }
  }, [deleteModal, verifyActivity, viewModal, viewProjectDetails]);
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 4;

  const pages = Math.ceil(TableData.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return TableData.slice(start, end);
  }, [page, TableData]);
  return (
    <Table aria-label="Example table with custom cells"
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
      }>
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={items} isLoading={isLoading} loadingContent={<Spinner color="secondary" label="Loading..." />} >
        {(items: any) => (
          <TableRow key={items._id}>
            {(columnKey) => <TableCell><>{renderCell(items, columnKey)}</></TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
