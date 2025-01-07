import React from "react";
import ProjectDetailCard from "./project-detail-card";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { projectDetailCard } from "@/data/content-data";
export const getWeekFormat = (date: Date): string => {
  // Get the ISO week number and year
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const days = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((days + 1) / 7);

  // Return the formatted date as yyyy-ww
  return `${date.getUTCFullYear()}-${weekNumber.toString().padStart(2, "0")}`;
};

const ProjectDetailComponent = ({ data }: { data: any }) => {
  return (
    <div className="w-full ">
      <div className="flex flex-col lg:flex-row lg:justify-between">
        <div className="w-full mb-2">
          <div className="sm:flex gap-2 ">
            <Card className="w-full lg:w-1/2 mb-6 py-2 mt-4 lg:mt-0">
              <CardBody className="flex flex-col">
                <div className="text-sm font-medium">{"Project ID"}</div>
                <div>{data.customId ?? "Custom Id"}</div>
              </CardBody>
            </Card>
            <Card className="w-full lg:w-1/2 mb-6 py-2 mt-4 lg:mt-0">
              <CardBody className="flex flex-col">
                <div className="text-sm font-medium">{"Project Task"}</div>
                <div>{data.type?.name ?? "Project Task"}</div>
              </CardBody>
            </Card>
          </div>

          <ProjectDetailCard data={data} />

          <Card className="border-1 flex justify-center items-center text-[#454545] my-2">
            <div className="flex justify-between w-[90%] mt-4 mb-8">
              <div className="flex flex-col w-[50%]">
                <div className="text-sm font-medium">Assignment Week</div>
                <div className="text-xs pt-2">
                  {new Date(data?.assignmentDate).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="flex flex-col w-[50%]">
                <div className="text-sm font-medium">Scheda Radio Week</div>
                <div className="text-xs pt-2">
                  {new Date(data?.schedaRadioDate).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>{" "}
      </div>
    </div>
  );
};

export default ProjectDetailComponent;
