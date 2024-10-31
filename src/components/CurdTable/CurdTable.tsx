import React from "react";
import QueryComponent from "./queryComponent";
import CustomTable from "../New Table";
import { Spacer } from "@nextui-org/react";
import Title, { SubTitle } from "../titles";

interface ICurdTableProps {
  title: string;
  api: string;
  queryKey: string[];
  columns: any;
  onOpenEdit: (data: any) => void;
  onOpenDelete: (data: any) => void;
  onOpenView: (data: any) => void;
  onOpenCreate: (data: any) => void;
  redirect?: string;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  AddModal: React.ReactNode;
}

function CurdTable(props: ICurdTableProps) {
  return (
    <div className="w-full">
      <Spacer y={5} />
      <div className="flex justify-between">
        <SubTitle title={props.title} />
        {props.AddModal}
      </div>
      <Spacer y={3} />
      <QueryComponent
        api={props.api}
        queryKey={props.queryKey}
        page={props.page}
        limit={props.limit}
      >
        {(data) => {
          console.log(data);
          return (
            <CustomTable
              title={props.title}
              data={data}
              columns={props.columns}
              onOpenEdit={(data: any) => props.onOpenEdit(data)}
              onOpenView={(data: any) => props.onOpenView(data)}
              onOpenDelete={(data: any) => props.onOpenDelete(data)}
              setPage={props.setPage}
              limit={props.limit}
            />
          );
        }}
      </QueryComponent>
    </div>
  );
}

export default CurdTable;
