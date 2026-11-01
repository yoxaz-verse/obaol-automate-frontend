import * as ReactChartJS from "react-chartjs-2";
import { chartPalette } from "@/utils/chartTheme";
const { Line } = ReactChartJS as any;

const data = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "First dataset",
      data: [33, 53, 85, 41, 44, 65],
      fill: true,
      backgroundColor: "rgba(255,177,98,0.2)",
      borderColor: chartPalette.truffle
    },
    // {
    //   label: "Second dataset",
    //   data: [33, 25, 35, 51, 54, 76],
    //   fill: false,
    //   borderColor: "#742774"
    // }
  ]
};
export default function LineChart() {
  return (
    <div className="w-full h-full">
      <Line data={data} />
    </div>
  );
}
