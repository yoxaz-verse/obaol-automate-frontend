// components/dashboard/Project/ProjectStatusTabContent.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FiEdit } from "react-icons/fi";
import QueryComponent from "@/components/queryComponent";
import CommonTable from "../Table/common-table";
import UserDeleteModal from "@/components/Modals/delete";

interface Project {
  _id: string;
  title: string;
  customId: string;
  budget: string;
  status: { name: string };
}

interface ProjectStatusTabContentProps {
  statusId: string;
}

export default function ProjectStatusTabContent({
  statusId,
}: ProjectStatusTabContentProps) {
  const router = useRouter();

  const columns = [
    { name: "Title", uid: "title" },
    { name: "Custom ID", uid: "customId" },
    { name: "Budget", uid: "budget" },
    { name: "Actions", uid: "actions2" },
  ];

  return (
    <QueryComponent<Project[]>
      api={`/api/projects/status/${statusId}`}
      queryKey={["projects", "status", statusId]}
      page={1}
    >
      {(data) => (
        <CommonTable
          TableData={data}
          columns={columns}
          deleteModal={(item: any) => (
            <UserDeleteModal
              _id={item._id}
              name={item.title}
              deleteApiEndpoint="/api/projects"
              refetchData={() => {}}
            />
          )}
          viewModal={(item: any) => (
            <FiEdit onClick={() => router.push(`/projects/edit/${item._id}`)} />
          )}
        />
      )}
    </QueryComponent>
  );
}
