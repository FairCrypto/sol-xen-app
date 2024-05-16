import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  TimeScale,
  TimeSeriesScale,
  type ChartOptions,
  ChartData,
  Plugin,
  ChartDataset,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import "chartjs-adapter-dayjs-4";
import React from "react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  TimeSeriesScale,
  BarElement,
);

export interface TimeChartEntry {
  x: Date;
  y: number;
}

interface BarChartProps {
  datasets: ChartDataset<"bar", TimeChartEntry[]>[];
  emptyDataLabel?: string;
}

export default function BarChart({ datasets, emptyDataLabel }: BarChartProps) {
  const plugins: Plugin<"bar">[] = [];
  if (emptyDataLabel) {
    plugins.push({
      id: "noDataText",
      afterDraw: function (chart: ChartJS<"bar">) {
        if (chart.data.datasets[0].data.length < 1) {
          let ctx = chart.ctx;
          let width = chart.width;
          let height = chart.height;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "16px monospace";
          ctx.fillStyle = "grey";
          ctx.fillText("Waiting for mining data...", width / 2, height / 2);
          ctx.restore();
        }
      },
    });
  }

  const options: ChartOptions<"bar"> = {
    scales: {
      x: {
        grid: {
          display: false,
        },
        stacked: true,

        type: "time",
        min: new Date(new Date().getTime() - 60 * 60 * 1000).toISOString(),
        ticks: {
          source: "auto",
          autoSkip: true,
          maxTicksLimit: 60,
        },
        time: {
          unit: "minute",
          // round: 'minute',
          // minUnit: 'minute',
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          precision: 0,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const chartData = (): ChartData<"bar", TimeChartEntry[]> => ({
    datasets: datasets,
  });

  if (datasets[0].data.length > 0) {
    return <Bar data={chartData()} options={options} plugins={plugins} />;
  }
}
