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
        <Card className="bg-content1 shadow-sm border border-default-200 h-full">
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
        <Card className="bg-content1 shadow-sm border border-default-200 h-full hover:bg-content2 transition-colors duration-300">
          <Link href={data.link || "#"} className="w-full h-full flex flex-col items-center justify-center p-6 gap-3 group">
            <div className="text-warning-500 text-3xl group-hover:scale-110 transition-transform duration-300">
              {data.icon}
            </div>
            <div className="font-medium text-foreground text-lg">
              {data.name}
            </div>
            <div className="text-xs text-default-500 group-hover:text-warning-500 transition-colors">
              Tap to View
            </div>
          </Link>
        </Card>
      );
    }
    if (type === "percentage charts") {
      return (
        <Card className="bg-content1 shadow-sm border border-default-200 h-full">
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
        <Card className="bg-content1 shadow-sm border border-default-200 h-full">
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
        <Card className="bg-content1 shadow-sm border border-default-200 h-full">
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
