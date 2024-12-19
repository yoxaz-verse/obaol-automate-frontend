import { ActivityDetailCardProps } from "@/data/interface-data";
import { Card } from "@nextui-org/react";
import Link from "next/link";
import React from "react";
import { FiEdit } from "react-icons/fi";
const ActivityDetailCard = ({ data }: any) => {
  return (
    <div>
      {/* {data && ( */}
      <Card className="flex flex-col p-9">
        <div className="flex justify-between w-full items-center pb-4">
          <div>
            <Link
              href={`/dashboard/projects/${data.project._id}`}
              className="hover:text-[#3EADEB] opacity-50 hover:opacity-100 text-sm font-medium cursor-pointer"
            >
              ⬅️ project
            </Link>

            <div className="text-[#3EADEB] text-lg font-medium">
              Project - {data.project && data?.project.title}
            </div>
          </div>
          <FiEdit />
        </div>
        <div className=" justify-between w-full items-center pb-4">
          <div className=" text-2xl font-medium">{data?.title}</div>
          <div className=" text-[#A1A1AA] text-md font-medium">
            managed by {data?.activityManager.name}
          </div>
          {/* <FiEdit /> */}
        </div>
        <div>
          <div className="flex">
            {/* <Avatar src={data?.projectManager?.avatar} alt="avatar" size="lg" /> */}
            <div className="flex flex-col ">
              <div className="font-medium">{data?.type?.name}</div>
              <div className="text-[#A1A1AA] text-sm">{data?.status?.name}</div>
            </div>
          </div>
          <div className="text-[#A1A1AA] text-sm pt-4 pb-8">
            {data.description}
          </div>
          <div className=" text-md pt-4 ">Type: {data?.type?.name}</div>
          <div className=" text-md  pb-8">Status: {data?.status?.name}</div>
          <Card className="bg-[#F8F8F8] border-1 border-[#E9E9E9] flex justify-center items-center text-[#454545]">
            <div className="flex justify-between w-[90%] mt-4 mb-8">
              <div className="flex flex-col w-[50%]">
                <div className="text-sm font-medium">Actual Date</div>
                <div className="text-xs pt-2">
                  {new Date(data?.actualDate).toLocaleDateString("en-US", {
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
                  {new Date(data?.forecastDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            {/* Render status and sub status */}
            <div className="flex justify-between pt-5 pb-10 w-[90%]">
              <div className="flex flex-col w-[50%]">
                <div className="text-sm font-medium">Target Finance Date</div>
                <div className="text-xs pt-2">
                  {new Date(data?.targetFinanceDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
              </div>
              <div className="w-[50%]">
                <div className="text-sm font-medium">Target Operation Date</div>
                <div className="text-xs pt-2">
                  {new Date(data?.targetOperationDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
                {data.statusOptions?.map((d: any) => {
                  return (
                    <h1 className={`${d.color}`} key={d.key}>
                      {" "}
                      {d.key}
                    </h1>
                  );
                })}
              </div>
              {/*<Select placeholder='Status'>
              {data.statusOptions.map((option: any) => {
                return <SelectItem key={option.key} className={option.color}>
                  {option.text}</SelectItem>
              })}
            </Select> */}
            </div>
          </Card>
        </div>
      </Card>
      {/* )} */}
    </div>
  );
};

export default ActivityDetailCard;
