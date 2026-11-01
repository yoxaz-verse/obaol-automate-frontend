import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
} from 'chart.js';
import * as ReactChartJS from 'react-chartjs-2';
import { chartPalette } from '@/utils/chartTheme';
const { Chart } = ReactChartJS as any;
ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController
);

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export const data = {
  labels,
  datasets: [
    {
      type: 'line' as const,
      label: 'Dataset 1',
      borderColor: chartPalette.truffle,
      borderWidth: 2,
      fill: false,
      data: [10, 200, 400, 30, 20, 20, 10],
    },
    {
      type: 'bar' as const,
      label: 'Dataset 2',
      backgroundColor: chartPalette.flame,
      data: [10, 200, 400, 30, 20, 20, 10],
      borderColor: chartPalette.blue,
      borderWidth: 2,
    },
  ],
};

export function MultiTypeChart() {
  return <Chart type='bar' data={data} options={{
    plugins: {
      legend: {
        display: false,
      },
    },
  }} />;
}
