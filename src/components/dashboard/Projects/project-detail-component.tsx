import React from "react";
import ProjectDetailCard from "./project-detail-card";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { projectDetailCard } from "@/data/content-data";

const ProjectDetailComponent = ({ data }: { data: any }) => {
  console.log(data);

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:justify-between">
        <div className="lg:w-[49%] mb-2">
          <div className="sm:flex gap-2 ">
            <Card className="w-full lg:w-1/2 mb-6 py-2 mt-4 lg:mt-0">
              <CardBody className="flex flex-col">
                <div className="text-sm font-medium">{"Project ID"}</div>
                <div>{data.customId ?? "Custom Id"}</div>
              </CardBody>
            </Card>
            <Card className="w-full lg:w-1/2 mb-6 py-2 mt-4 lg:mt-0">
              <CardBody className="flex flex-col">
                <div className="text-sm font-medium">{"Project Type"}</div>
                <div>{data.type?.name ?? "Custom Id"}</div>
              </CardBody>
            </Card>
          </div>
          <div className="w-full h-[400px] lg:h-[300px] rounded-lg">
            <iframe
              src={data.location.map}
              className="w-full h-full rounded-lg"
            ></iframe>
          </div>
          <Card className=" border-1 flex justify-center items-center text-[#454545] my-2">
            <div className="flex justify-between w-[90%] mt-4 mb-8">
              <div className="flex flex-col w-[50%]">
                <div className="text-sm font-medium">Actual Date</div>
                <div className="text-xs pt-2">
                  {" "}
                  {new Date(data?.assignmentDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="flex flex-col w-[50%]">
                <div className="text-sm font-medium">Forecast Date</div>
                <div className="text-xs pt-2">
                  {" "}
                  {new Date(data?.schedaRadioDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            {/* Render status and sub status */}
            {/* <div className="flex justify-between pt-5 pb-10 w-[90%]"></div> */}
          </Card>
        </div>{" "}
        <div className="lg:w-[49%]">
          <ProjectDetailCard data={data} />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailComponent;
