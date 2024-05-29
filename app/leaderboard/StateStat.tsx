import { Chart } from "react-chartjs-2";
import useThemeColors from "@/app/hooks/ThemeColorHook";
import { ReactNode, useEffect, useState } from "react";
import "chartjs-adapter-dayjs-4";
import { ChartData, ChartOptions, LegendItem } from "chart.js";
import { TimeChartEntry } from "@/app/components/BarChart";
import { ChartUnit } from "@/app/Api";
import { ChartUnitSelector } from "@/app/components/ChartUnitSelector";
import { humanizeNumber } from "@/app/utils";

export interface chartSet {
  label: string;
  data: TimeChartEntry[];
}

interface StateStatProps {
  name: string;
  title: string;
  children?: ReactNode;
  extraClassName?: string;
  fill?: boolean;
  fillDetailed?: boolean;
  setShowBackground?: (show: boolean) => void;
  yAxesTitle?: string;
  chartUnit?: ChartUnit;
  setChartUnit: (unit: ChartUnit) => void;
  sets: chartSet[];
  detailedChartType?: "bar" | "line";
  smallIndex?: number;
  yScaleType?: "linear" | "logarithmic";
  pointRadius?: number;
}

export default function StateStat({
  title,
  children,
  extraClassName = "",
  fill = true,
  fillDetailed = true,
  setShowBackground = () => {},
  yAxesTitle = "",
  chartUnit = "hour",
  setChartUnit,
  sets,
  detailedChartType = "bar",
  smallIndex = 0,
  yScaleType = "linear",
  pointRadius = 2,
}: StateStatProps) {
  const [themeColors, alphaColor] = useThemeColors();
  const [showModal, setShowModal] = useState(false);

  const fillAlpha = (showDetails: boolean) => {
    if (showDetails && detailedChartType === "line") {
      return 5;
    } else if (showDetails) {
      return 40;
    }
    return 40;
  };

  const boarderAlpha = (showDetails: boolean) => {
    if (showDetails) {
      return 90;
    }
    return 60;
  };

  const firstIndex = () => {
    if (showModal) {
      return 0;
    }
    return smallIndex;
  };

  const chartData = (
    showDetails: boolean,
  ): ChartData<any, TimeChartEntry[]> => {
    const data = {
      datasets: [
        {
          label: sets[firstIndex()].label || title,
          data: sets[firstIndex()].data,
          fill: showDetails ? fillDetailed : fill,
          borderColor: alphaColor(
            themeColors?.accent,
            boarderAlpha(showDetails),
          ),
          backgroundColor: alphaColor(
            themeColors?.accent,
            fillAlpha(showDetails),
          ),
          pointRadius: showDetails ? pointRadius : 0,
          borderWidth: showDetails ? pointRadius : 0,
        },
      ],
    };

    if (showDetails && sets[1]?.label && sets[1]?.data.length > 0) {
      data.datasets.push({
        label: sets[1].label,
        data: sets[1].data,
        fill: showDetails ? fillDetailed : fill,
        borderColor: alphaColor(
          themeColors?.primary,
          boarderAlpha(showDetails),
        ),
        backgroundColor: alphaColor(
          themeColors?.primary,
          fillAlpha(showDetails),
        ),
        pointRadius: showDetails ? pointRadius : 0,
        borderWidth: showDetails ? pointRadius : 0,
      });
    }

    if (showDetails && sets[2]?.label && sets[2]?.data.length > 0) {
      data.datasets.push({
        label: sets[2].label,
        data: sets[2].data,
        fill: showDetails ? fillDetailed : fill,
        borderColor: alphaColor(
          themeColors?.secondary,
          boarderAlpha(showDetails),
        ),
        backgroundColor: alphaColor(
          themeColors?.secondary,
          fillAlpha(showDetails),
        ),
        pointRadius: showDetails ? pointRadius : 0,
        borderWidth: showDetails ? pointRadius : 0,
      });
    }

    return data;
  };

  const options = (showDetails: boolean): ChartOptions<any> => {
    return {
      spanGaps: true,
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
          type: yScaleType,
          title: {
            text: yAxesTitle,
            display: showDetails,
            color: themeColors?.["base-content"],
          },
          display: showDetails,
          grid: {
            display: false,
          },
          ticks: {
            color: themeColors?.["base-content"],
            callback: function (value: number) {
              return humanizeNumber(Number(value));
            },
            maxTicksLimit: 10,
          },
        },
      },

      layout: {
        autoPadding: false,
      },
      maintainAspectRatio: false,
      // aspectRatio: 1.5,
      plugins: {
        legend: {
          display: showDetails,
          labels: {
            color: themeColors?.["base-content"],
            padding: 24,
            font: {
              size: 18,
            },
          },
          title: {
            color: themeColors?.["base-content"],
          },
        },
      },
      animation: {
        duration: 0,
      },
    };
  };

  return (
    <>
      <dialog
        className={`modal ${showModal && "opacity-100 back backdrop-blur-sm modal-open"}`}
      >
        <div className="modal-box max-w-screen-2xl h-[50vh] max-h-[900px] pt-10 sm:pt-8">
          <div className="absolute top-4 right-4">
            <ChartUnitSelector
              setChartUnit={setChartUnit}
              chartUnit={chartUnit}
            />
          </div>
          <Chart
            type={detailedChartType}
            data={chartData(true)}
            options={options(true)}
          />
        </div>

        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => {
              setShowBackground(true);
              setShowModal(false);
            }}
          >
            close
          </button>
        </form>
      </dialog>

      <div
        className={`cursor-pointer hover:brightness-75 hover:contrast-125 hover:drop-shadow-none hover:shadow-none stat bg-accent-content/10 rounded-md drop-shadow-md shadow-md p-0 ${extraClassName}`}
        onClick={() => {
          setShowBackground(false);
          setShowModal(true);
        }}
      >
        <Chart
          type="line"
          data={chartData(false)}
          options={options(false)}
          className="absolute -z-10 rounded-md"
        />
        <div className="p-3 sm:p-6">
          <div className="whitespace-nowrap">{title}</div>
          <div className="stat-value text-sm md:text-2xl">{children}</div>
        </div>
      </div>
    </>
  );
}
