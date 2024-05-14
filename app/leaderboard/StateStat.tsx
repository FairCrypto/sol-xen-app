import { Chart } from "react-chartjs-2";
import React, { useContext, useEffect, useState } from "react";
import colors from "daisyui/src/theming/themes";
import { ThemeContext } from "@/app/context/ThemeContext";

interface StateStatProps {
  name: string;
  title: string;
  children?: React.ReactNode;
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
  const { theme } = useContext(ThemeContext);
  const [color, setColor] = useState<string>();

  const chartData = (name: string) => {
    return {
      labels: stateHistory,
      datasets: [
        {
          id: 1,
          label: "",
          data: stateHistory,
          fill: true,
          borderColor: color,
          backgroundColor: color,
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

    // responsive: false,
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

  useEffect(() => {
    // @ts-ignore
    setColor(colors[theme].accent);
  }, [theme]);

  return (
    <div
      className={`stat bg-accent-content/10 rounded-md shadow p-0 ${extraClassName}`}
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
