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
        <Card className="bg-content1 shadow-none border border-default-200/60 h-full">
          <CardBody className="flex flex-col items-center justify-center py-6">
            <span className="text-4xl font-bold text-warning-500 mb-2">{data}</span>
            <span className="text-sm font-medium text-default-500 uppercase tracking-wider text-center">
              {heading}
            </span>
          </CardBody>
        </Card>
      );
    }
    if (type === "view") {
      return (
        <Card className="bg-content1/80 backdrop-blur-md shadow-sm border border-white/5 dark:border-default-200/10 h-full hover:bg-content2/90 hover:shadow-lg hover:border-warning-500/30 transition-all duration-300 group overflow-hidden">
          <Link href={data.link || "#"} className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-5 gap-2 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-warning-500/10 flex items-center justify-center text-warning-500 text-xl sm:text-2xl group-hover:bg-warning-500 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-warning-500/40">
              {data.icon}
            </div>
            <div className="font-black text-foreground text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-center line-clamp-1 px-1 mt-1 transition-all group-hover:text-warning-500">
              {data.name}
            </div>
            <div className="px-3 py-1 bg-default-100 dark:bg-white/5 rounded-full text-[8px] sm:text-[9px] text-default-400 group-hover:bg-warning-500 group-hover:text-white transition-all uppercase tracking-[0.2em] font-black border border-transparent dark:border-white/5">
              View
            </div>
          </Link>
        </Card>
      );
    }
    if (type === "percentage charts") {
      return (
        <Card className="bg-content1 shadow-none border border-default-200/60 h-full">
          <CardHeader className="justify-center pb-0 pt-4">
            <span className="text-sm font-medium text-default-500 uppercase tracking-wider text-center">{heading}</span>
          </CardHeader>
          <CardBody className="items-center justify-center py-4 overflow-hidden">
            <CircularProgress
              classNames={{
                svg: "w-24 h-24 drop-shadow-md",
                indicator: "stroke-warning-500",
                track: "stroke-default-200",
                value: "text-xl font-semibold text-foreground",
              }}
              value={Number(stats)}
              strokeWidth={3}
              showValueLabel={true}
            />
          </CardBody>
        </Card>
      );
    }

    if (type === "line charts") {
      return (
        <Card className="bg-content1 shadow-none border border-default-200/60 h-full">
          <CardHeader className="flex flex-row justify-between items-center px-4 py-3">
            <span className="font-semibold text-foreground text-sm">{heading}</span>
            <span className="text-success-500 font-bold text-sm">{stats}</span>
          </CardHeader>
          <Divider className="bg-default-200" />
          <CardBody className="p-2 overflow-hidden">
            <LineChart />
          </CardBody>
        </Card>
      );
    }
    if (type === "bar chart") {
      return (
        <Card className="bg-content1 shadow-none border border-default-200/60 h-full">
          <CardHeader className="px-4 py-3 font-semibold text-foreground text-sm">
            {heading}
          </CardHeader>
          <Divider className="bg-default-200" />
          <CardBody className="p-2 overflow-hidden">
            <GrowthTypeChart />
          </CardBody>
        </Card>
      );
    }
  }
  return <>{DashboardTileData()}</>;
};

export default DashboardTile;
