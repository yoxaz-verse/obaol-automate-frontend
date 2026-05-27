import React from "react";
import dynamic from "next/dynamic";
import { Card } from "@nextui-org/react";

const GrowthTypeChart = dynamic(
  () => import("./Charts/growth-type-chart").then((m) => m.GrowthTypeChart),
  { ssr: false, loading: () => <div className="h-[320px] animate-pulse rounded-lg bg-default-100" /> }
);

const MultiTypeChart = dynamic(
  () => import("./Charts/multitype-chart").then((m) => m.MultiTypeChart),
  { ssr: false, loading: () => <div className="h-[320px] animate-pulse rounded-lg bg-default-100" /> }
);

const DashboardCharts = () => {
  return (
    <div className="w-full">
      <div>
        <div className="text-xl font-semibold py-3">Heading</div>
        {/* Translate */}
        <div className="py-5">
          <Card className="p-2">
            <GrowthTypeChart />
          </Card>
        </div>
        <div className="text-xl font-semibold py-3">Heading</div>
        {/* Translate */}

        <div>
          <Card className="p-2">
            <MultiTypeChart />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
