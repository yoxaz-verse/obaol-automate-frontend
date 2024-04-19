import React from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, ChipProps, getKeyValue} from "@nextui-org/react";
// import {columns, users} from "./data";
import { FiCheck, FiDelete, FiEdit, FiEye } from "react-icons/fi";import { TableProps } from "@/data/interface-data";
import { TiInputChecked } from "react-icons/ti";
const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

// type User = typeof users[0];

export default function CommonTable({TableData,columns,viewProjectDetails}:TableProps) {
    type User = typeof TableData[0];
  const renderCell = React.useCallback((user: User, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof User];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{radius: "lg", src: user.avatar}}
            description={user.email}
            name={cellValue}
          >
            {user.email}
          </User>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
            <p className="text-bold text-sm capitalize text-default-400">{user.team}</p>
          </div>
        );
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[user.status]} size="sm" variant="flat">
            {cellValue}
          </Chip>
        );
      case "actions":
        if(user.actions==='Verify'){
          return <div className="flex w-full">
            <button className="w-[70px] h-[30px] bg-[#3EADEB] rounded-2xl text-white mx-1">Verify</button>
            <button onClick={()=>viewProjectDetails?viewProjectDetails(user):null} className="w-[70px] h-[30px] rounded-2xl flex items-center justify-center bg-[#ECEAEA] border-1 border-[#E6DFDF] text-[#646464]">View <FiEye className="ml-2"/></button>
          </div>
        }
        else return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <FiEye onClick={()=>viewProjectDetails?viewProjectDetails(user):null}/>
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
        case 'deliverable': return (<div className="flex"><TiInputChecked className="text-xl ml-8"/></div>)
      default:
        return cellValue;
    }
  }, []);

  return (
  <Table aria-label="Example table with custom cells">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={TableData}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
