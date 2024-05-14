import React, { useContext, useEffect, useState } from "react";
import CountDown from "@/app/components/CountDown";
import "chart.js/auto";
import { Chart } from "react-chartjs-2";
import { ThemeContext } from "@/app/context/ThemeContext";
import colors from "daisyui/src/theming/themes";

export interface State {
  points: bigint;
  hashes: number;
  superHashes: number;
  txs: number;
  amp: number;
  lastAmpSlot: bigint;
  zeroAmpEta: Date;
  nextAmpEta: Date;
  avgAmpSecs: number;
  createdAt: Date;
}

async function fetchStateHistory() {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/state/history`,
  );

  if (!data.ok) {
    throw new Error("Error fetching state history data");
  }

  const out = await data.json();

  for (const entry of out) {
    entry.points = BigInt(entry.points);
  }

  return out;
}

export default function StateStats({
  state,
  isLoadingStats,
}: {
  state: State;
  isLoadingStats: boolean;
}) {
  const [color, setColor] = useState<string>();
  const [stateHistory, setStateHistory] = useState<State[]>([]);
  const { theme } = useContext(ThemeContext);

  const totalSupplyValue = () => {
    return Intl.NumberFormat("en-US").format(
      Number(state.points / 1_000_000_000n),
    );
  };

  const totalHashesValue = () => {
    return Intl.NumberFormat("en-US").format(state.hashes);
  };

  const totalSuperHashesValue = () => {
    return Intl.NumberFormat("en-US").format(state.superHashes);
  };

  const txsValue = () => {
    return Intl.NumberFormat("en-US").format(state.txs);
  };

  const ampValue = () => {
    return Intl.NumberFormat("en-US").format(state.amp);
  };

  const lastAmpSlotValue = () => {
    return Intl.NumberFormat("en-US").format(state.lastAmpSlot);
  };

  const avgAmpSecsDate = () => {
    return new Date(new Date().getTime() + state.avgAmpSecs * 1000);
  };

  const chartData = (name: string) => {
    return {
      labels: stateHistory.map((entry: State) => entry["createdAt"]),
      datasets: [
        {
          id: 1,
          label: "",
          data: stateHistory.map((entry: any) => entry[name]),
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

    fetchStateHistory().then((data) => {
      setStateHistory(data);
    });
  }, [theme]);

  function stat(
    name: string,
    title: string,
    value: any,
    extraClassName?: string,
  ) {
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
        <div className="p-4">
          <div className="stat-title">{title}</div>
          <div className="stat-value text-sm md:text-2xl">{value}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="solxen-stats"
      className={`grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-center mb-3 mx-4 opacity-0 h-[16rem] sm:h-[17rem] md:h-[19rem] ${!isLoadingStats ? "fade-in" : ""}`}
    >
      {stat("solXen", "Total solXEN", totalSupplyValue())}
      {stat("hashes", "Total Hashes", totalHashesValue())}
      {stat("superHashes", "Total Super Hashes", totalSuperHashesValue())}
      {stat("amp", "AMP", ampValue())}
      {stat(
        "lastAmpSlot",
        "Last AMP Slot",
        lastAmpSlotValue(),
        "hidden sm:inline",
      )}
      {stat("txs", "Total TXs", txsValue(), "hidden sm:inline")}
      {stat(
        "zeroAmpEta",
        "Zero AMP ETA",
        <CountDown endDate={new Date(state.zeroAmpEta)} />,
      )}
      {stat(
        "nextAmpEta",
        "Next AMP ETA",
        <CountDown endDate={new Date(state.nextAmpEta)} />,
      )}
      {stat(
        "avgAmpSecs",
        "Average AMP Time",
        <CountDown
          endDate={avgAmpSecsDate()}
          dontRun={true}
          showSeconds={true}
        />,
        "hidden sm:inline",
      )}
    </div>
  );
}
