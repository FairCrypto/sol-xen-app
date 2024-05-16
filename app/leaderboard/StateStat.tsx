import { Chart } from "react-chartjs-2";
import useThemeColors from "@/app/hooks/ThemeColorHook";
import { ReactNode, useState } from "react";
import "chartjs-adapter-dayjs-4";
import type { ChartData, ChartOptions } from "chart.js";
import { TimeChartEntry } from "@/app/components/BarChart";

interface StateStatProps {
  name: string;
  title: string;
  children?: ReactNode;
  stateHistory?: TimeChartEntry[];
  stateHistory2?: TimeChartEntry[];
  stateHistory3?: TimeChartEntry[];
  stateHistoryTitle?: string;
  stateHistory2Title?: string;
  stateHistory3Title?: string;
  extraClassName?: string;
  fill?: boolean;
  fillDetailed?: boolean;
}

export default function StateStat({
  name,
  title,
  children,
  stateHistory = [],
  stateHistory2 = [],
  stateHistory3 = [],
  stateHistoryTitle = "",
  stateHistory2Title = "",
  stateHistory3Title = "",
  extraClassName = "",
  fill = true,
  fillDetailed = true,
}: StateStatProps) {
  const [themeColors, alphaColor] = useThemeColors();
  const [showModal, setShowModal] = useState(false);

  const chartData = (
    showDetails: boolean,
  ): ChartData<"line", TimeChartEntry[]> => {
    const data = {
      datasets: [
        {
          label: stateHistoryTitle,
          data: stateHistory,
          fill: showDetails ? fillDetailed : fill,
          borderColor: themeColors?.accent,
          backgroundColor: themeColors?.accent,
          pointRadius: showDetails ? 3 : 0,
          borderWidth: showDetails ? 3 : 0,
        },
      ],
    };

    if (showDetails && stateHistory2.length > 0) {
      data.datasets.push({
        label: stateHistory2Title,
        data: stateHistory2,
        fill: showDetails ? fillDetailed : fill,
        borderColor: themeColors?.primary,
        backgroundColor: themeColors?.primary,
        pointRadius: showDetails ? 3 : 0,
        borderWidth: showDetails ? 3 : 0,
      });
    }

    if (showDetails && stateHistory3.length > 0) {
      data.datasets.push({
        label: stateHistory3Title,
        data: stateHistory3,
        fill: showDetails ? fillDetailed : fill,
        borderColor: themeColors?.secondary,
        backgroundColor: themeColors?.secondary,
        pointRadius: showDetails ? 3 : 0,
        borderWidth: showDetails ? 3 : 0,
      });
    }

    return data;
  };

  const options = (showDetails: boolean): ChartOptions<"line"> => {
    return {
      scales: {
        x: {
          display: showDetails,
          type: "time",
          grid: {
            display: false,
          },
          ticks: {
            color: themeColors?.["base-content"],
          },
        },
        y: {
          display: showDetails,
          grid: {
            display: false,
          },
          ticks: {
            color: themeColors?.["base-content"],
          },
        },
      },

      layout: {
        autoPadding: false,
      },
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showDetails,
        },
      },
      animation: {
        duration: 0,
      },
    };
  };

  return (
    <>
      <dialog className={`modal ${showModal && "modal-open"}`}>
        <div className="modal-box max-w-screen-xl h-[800px]">
          <Chart
            type="line"
            data={chartData(true)}
            options={options(true)}
            className="absolute -z-10 opacity-50"
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowModal(false)}>close</button>
        </form>
      </dialog>

      <div
        className={`cursor-pointer hover:brightness-75 hover:contrast-125 hover:drop-shadow-none hover:shadow-none stat bg-accent-content/10 rounded-md drop-shadow-md shadow-md p-0 ${extraClassName}`}
        onClick={() => setShowModal(true)}
      >
        <Chart
          type="line"
          data={chartData(false)}
          options={options(false)}
          className="absolute -z-10 opacity-50"
        />
        <div className="p-3 sm:p-4">
          <div className="stat-title">{title}</div>
          <div className="stat-value text-sm md:text-2xl">{children}</div>
        </div>
      </div>
    </>
  );
}
