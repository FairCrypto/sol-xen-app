import { Chart } from "react-chartjs-2";
import useThemeColors from "@/app/hooks/ThemeColorHook";
import {ReactNode} from "react";

interface StateStatProps {
  name: string;
  title: string;
  children?: ReactNode;
  stateHistory?: number[];
  extraClassName?: string;
}

export default function StateStat({
  name,
  title,
  children,
  stateHistory = [],
  extraClassName = "",
}: StateStatProps) {
  const [themeColors] = useThemeColors();

  const chartData = (name: string) => {
    return {
      labels: stateHistory,
      datasets: [
        {
          id: 1,
          label: "",
          data: stateHistory,
          fill: true,
          borderColor: themeColors?.accent,
          backgroundColor: themeColors?.accent,
          pointRadius: 0,
          borderWidth: 0,
        },
      ],
    };
  };

  const options = {
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },

    layout: {
      autoPadding: false,
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    animation: {
      duration: 0,
    },
  };

  return (
    <div
      className={`stat bg-accent-content/10 rounded-md drop-shadow-md shadow-md p-0 ${extraClassName}`}
    >
      <Chart
        type="line"
        data={chartData(name)}
        options={options}
        className="absolute -z-10 opacity-50"
      />
      <div className="p-3 sm:p-4">
        <div className="stat-title">{title}</div>
        <div className="stat-value text-sm md:text-2xl">{children}</div>
      </div>
    </div>
  );
}
