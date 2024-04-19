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
  Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
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
      borderColor: '#A155B9',
      borderWidth: 2,
      fill: false,
      data: [10,200,0,30,0,20,10],
    },
    {
        type: 'line' as const,
        label: 'Dataset 1',
        borderColor: '#16BFD6',
        borderWidth: 2,
        fill: false,
        borderDash: [5, 5],
        data: [10,20,100,300,25,21,122],
      },
      {
        type: 'line' as const,
        label: 'Dataset 1',
        borderColor: '#165BAA',
        borderWidth: 2,
        fill: true,
        backgroundColor: '#165BAA',
        data: [100,-20,-10,350,0,201,102],
      },
  ],
};

export function GrowthTypeChart() {
  return <Chart type='bar' data={data}  options={{
    plugins: {
      legend: {
        display: false, 
      },
    },
  }}/>;
}
