import { DashboardTileProps } from "@/data/interface-data";
import {
  Card,
  CardBody,
  CardHeader,
  CircularProgress,
  Divider,
} from "@nextui-org/react";
import React from "react";
import { GrAdd } from "react-icons/gr";
import DoughnutChart from "./Charts/doughnut-chart";
import { doughnutChartData } from "@/data/content-data";
import LineChart from "./Charts/line-chart";
import { GrowthTypeChart } from "./Charts/growth-type-chart";
import Link from "next/link";

const DashboardTile = ({ heading, data, type, stats }: DashboardTileProps) => {
  function DashboardTileData() {
    if (type === "details") {
      return (
        <>
          <Card className="bg-white shadow-md outline-1 flex items-center justify-center px-6">
            <CardHeader className="font-medium text-[#5B5B5B]">
              {heading}
            </CardHeader>
            <CardBody className="bg-[#CEECFD] text-[#3EADEB] flex items-center justify-center text-3xl w-[100px] rounded-3xl h-[75px] m-5 font-semibold mb-8">
              {data}
            </CardBody>
          </Card>
        </>
      );
    }
    if (type === "view") {
      return (
        <>
          <Card className="bg-white shadow-md outline-1 flex justify-center px-6">
            <CardHeader className="font-medium text-black flex items-center gap-2 md:text-[20px]">
              {data.icon}
              View {data.name}
              {/* Translate */}
            </CardHeader>
            <Link href={data.link || "#"}>
              <CardBody className="rounded-xl border-1 hover:text-white hover:bg-primary duration-300 border-primary my-3 md:h-16 flex justify-center w-full items-center">
                <div className="text-xs text-center">
                  Tap to View {data.name}
                  {/* Translate */}
                </div>
              </CardBody>
            </Link>
          </Card>
        </>
      );
    }
    if (type === "percentage charts") {
      return (
        <>
          <Card className="bg-white shadow-md outline-1 flex items-center justify-center px-6">
            <CardHeader className="font-medium text-black">
              {heading}
            </CardHeader>
            <CardBody className="my-1 w-11/12 flex justify-center items-center">
              <CircularProgress
                classNames={{
                  svg: "w-36 h-36 drop-shadow-md",
                  indicator: "stroke-blue-300",
                  track: "stroke-blue-300/10",
                  value: "text-3xl font-semibold text-blue-300",
                }}
                value={Number(stats)} // Use the percentage value
                strokeWidth={4}
                showValueLabel={true}
              />
            </CardBody>
          </Card>
        </>
      );
    }

    if (type === "line charts") {
      return (
        <>
          <Card className="bg-white shadow-md outline-1 flex items-center justify-center px-6">
            <CardHeader className=" text-black flex flex-col">
              <div className="text-start w-full font-medium">{heading}</div>
              <div className="flex justify-between w-full">
                <div className="">Statistics</div>
                {/* Translate */}
                <div className="text-green-500">{stats}</div>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="my-1 w-full flex justify-center items-center">
              <LineChart />
            </CardBody>
          </Card>
        </>
      );
    }
    if (type === "bar chart") {
      return (
        <>
          <Card className="bg-white shadow-md outline-1 flex items-center justify-center px-6">
            <CardHeader className="font-medium text-black">
              {heading}
            </CardHeader>
            <CardBody className="my-1 w-full flex justify-center items-center">
              <GrowthTypeChart />
            </CardBody>
          </Card>
        </>
      );
    }
  }
  return <>{DashboardTileData()}</>;
};

export default DashboardTile;
