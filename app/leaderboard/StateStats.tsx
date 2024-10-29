import React, { useContext, useEffect, useState } from "react";
import "chart.js/auto";
import { ThemeContext } from "@/app/context/ThemeContext";
import StateStat from "@/app/leaderboard/StateStat";
import {
  BlockStats,
  fetchBlockStatsHistory,
  fetchPriorityFeesHistory,
  fetchStateHistory,
  GlobalState,
  SolXenPriorityFees,
} from "@/app/Api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { endTime, startTime, unit } from "@/app/components/ChartUnitSelector";
import { useChartSelector } from "@/app/hooks/ChartSelector";
import { humanizeHashRate } from "@/app/utils";
dayjs.extend(utc);

export interface State {
  points: bigint;
  solXen: bigint;
  hashes: number;
  hashRate: number;
  superHashes: number;
  txs: number;
  amp: number;
  lastAmpSlot: bigint;
  zeroAmpEta: Date;
  nextAmpEta: Date;
  avgAmpSecs: number;
  createdAt: Date;
  avgPriorityFee: number;
  minPriorityFee: number;
  highPriorityFee: number;
  lowPriorityFee: number;
  medianPriorityFee: number;
  maxPriorityFee: number;
  programs: string[];
}

export default function StateStats({
  state,
  isLoadingStats,
  setShowBackground,
  finished
}: {
  state: State;
  isLoadingStats: boolean;
  setShowBackground: (show: boolean) => void;
  finished: boolean;
}) {
  const { theme } = useContext(ThemeContext);
  const [stateHistory, setStateHistory] = useState<GlobalState[]>([]);
  const [priorityFeesHistory, setPriorityFeesHistory] = useState<
    SolXenPriorityFees[]
  >([]);
  const [priorityFees, setPriorityFees] = useState<SolXenPriorityFees>();
  const [chartUnit, setAndStoreChartUnit] = useChartSelector();
  const [blockStatsHistory, setBlockStatsHistory] = useState<BlockStats[]>([]);

  const totalSupplyValue = () => {
    if (!state.solXen) {
      return "0";
    }
    return Intl.NumberFormat("en-US").format(
      Number(state.solXen / 1_000_000_000n),
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

  const hashRateValue = (): string => {
    const hashRate = Math.max(state.hashRate || 0, 0);
    return humanizeHashRate(hashRate).replace(".00", "");
  };

  const avgPriorityFeeValue = () => {
    return Intl.NumberFormat("en-US").format(
      Math.floor(priorityFees?.avgPriorityFee || 0),
    );
  };

  const maxPriorityFeeValue = () => {
    return Intl.NumberFormat("en-US").format(
      Math.floor(priorityFees?.highPriorityFee || 0),
    );
  };

  const minPriorityFeeValue = () => {
    return Intl.NumberFormat("en-US").format(
      Math.floor(priorityFees?.avgPriorityFee || 0),
    );
  };

  const lastSolXenCuValue = () =>
    blockStatsHistory.at(-1)?.avgSolXenComputeUnitsPercent || 0;
  const lastOtherCuValue = () =>
    (blockStatsHistory.at(-1)?.avgComputeUnitsPercent || 0) -
    lastSolXenCuValue();
  const lastUnusedCuValue = () =>
    100 - lastSolXenCuValue() - lastOtherCuValue();

  useEffect(() => {
    if (chartUnit) {
      fetchStateHistory(
        startTime(chartUnit),
        endTime(chartUnit),
        unit(chartUnit),
      ).then((data) => {
        setStateHistory(data);
      });

      fetchBlockStatsHistory(
        startTime(chartUnit),
        endTime(chartUnit),
        unit(chartUnit),
      ).then((data) => {
        setBlockStatsHistory(data);
      });

      fetchPriorityFeesHistory(
        startTime(chartUnit),
        endTime(chartUnit),
        unit(chartUnit),
      ).then((data) => {
        setPriorityFeesHistory(data);
        if (chartUnit === "hour") {
          const last = data.at(-1);
          if (last) {
            setPriorityFees(last);
          }
        }
      });

      if (chartUnit != "hour") {
        fetchPriorityFeesHistory(
          startTime("hour"),
          endTime("hour"),
          unit("hour"),
        ).then((data) => {
          const last = data.at(-1);
          if (last) {
            setPriorityFees(last);
          }
        });
      }
    }
  }, [theme, chartUnit]);

  const units = chartUnit === "day" ? "hour" : "minute";

  return (
    <div
      id="solxen-stats"
      className={`grid grid-cols-2 sm:grid-cols-3 gap-4 text-center mb-2 sm:mb-3 mx-4 opacity-0 ${!isLoadingStats ? "fade-in" : ""}`}
    >
      {}

      <StateStat
        setShowBackground={setShowBackground}
        name="solXen"
        title="Total solXEN"
        yAxesTitle={`Increase (per ${units})`}
        sets={[
          {
            label: "solXEN",
            data: stateHistory.map((entry) => ({
              x: new Date(entry.createdAt),
              y: Number(entry.solXenDelta / 100_000_000n),
            })),
          },
        ]}
        chartUnit={chartUnit}
        setChartUnit={setAndStoreChartUnit}
      >
        {totalSupplyValue()}
      </StateStat>

      <StateStat
        setShowBackground={setShowBackground}
        name="hashes"
        title="Total Hashes"
        yAxesTitle={`Increase (per ${units})`}
        sets={[
          {
            label: "Hashes",
            data: stateHistory.map((entry) => ({
              x: new Date(entry.createdAt),
              y: Number(entry.hashesDelta),
            })),
          },
        ]}
        chartUnit={chartUnit}
        setChartUnit={setAndStoreChartUnit}
      >
        {totalHashesValue()}
      </StateStat>

      <StateStat
        setShowBackground={setShowBackground}
        name="superHashes"
        title="Total Super Hashes"
        yAxesTitle={`Increase (per ${units})`}
        sets={[
          {
            label: "Super Hashes",
            data: stateHistory.map((entry) => ({
              x: new Date(entry.createdAt),
              y: entry.superHashesDelta,
            })),
          },
        ]}
        chartUnit={chartUnit}
        setChartUnit={setAndStoreChartUnit}
      >
        {totalSuperHashesValue()}
      </StateStat>

      { !finished && <>
        <StateStat
          setShowBackground={setShowBackground}
          name="hashRate"
          title="Total Hash Rate"
          yAxesTitle="Rate (hashes/sec)"
          sets={[
            {
              label: "Hash Rate",
              data: stateHistory.map((entry) => ({
                x: new Date(entry.createdAt),
                y: Number(entry.hashRate),
              })),
            },
          ]}
          chartUnit={chartUnit}
          setChartUnit={setAndStoreChartUnit}
          detailedChartType={"line"}
        >
          {hashRateValue()}
        </StateStat>

        <StateStat
          setShowBackground={setShowBackground}
          name="Block Compute"
          title="Block Compute"
          yAxesTitle="Block CU Percenage (%)"
          sets={[
            {
              label: `solXEN | ${lastSolXenCuValue()}%`,
              data: blockStatsHistory.map((entry) => ({
                x: new Date(entry.createdAt),
                y: entry.avgSolXenComputeUnitsPercent,
              })),
            },
            {
              label: `Other | ${lastOtherCuValue()}%`,
              data: blockStatsHistory.map((entry) => ({
                x: new Date(entry.createdAt),
                y:
                  entry.avgComputeUnitsPercent -
                  entry.avgSolXenComputeUnitsPercent,
              })),
            },
            {
              label: `Unused | ${lastUnusedCuValue()}%`,
              data: blockStatsHistory.map((entry) => ({
                x: new Date(entry.createdAt),
                y:
                  100 -
                  entry.avgSolXenComputeUnitsPercent -
                  (entry.avgComputeUnitsPercent -
                    entry.avgSolXenComputeUnitsPercent),
              })),
            },
          ]}
          stacked={true}
          suggestedMax={100}
          chartUnit={chartUnit}
          setChartUnit={setAndStoreChartUnit}
        >
          {lastSolXenCuValue() + "%"}
        </StateStat>

        <StateStat
          setShowBackground={setShowBackground}
          name="avgPriorityFee"
          title="Avg Priority Fee"
          yAxesTitle="Microlamports"
          sets={[
            {
              label: `Low | ${minPriorityFeeValue()}`,
              data: priorityFeesHistory.map((entry) => ({
                x: new Date(entry.createdAt),
                y: entry.lowPriorityFee,
              })),
            },
            {
              label: `Avg | ${avgPriorityFeeValue()}`,
              data: priorityFeesHistory.map((entry) => ({
                x: new Date(entry.createdAt),
                y: entry.avgPriorityFee,
              })),
            },
            {
              label: `High | ${maxPriorityFeeValue()}`,
              data: priorityFeesHistory.map((entry) => ({
                x: new Date(entry.createdAt),
                y: entry.maxPriorityFee,
              })),
            },
          ]}
          chartUnit={chartUnit}
          setChartUnit={setAndStoreChartUnit}
          smallIndex={1}
          yScaleType="logarithmic"
        >
          {avgPriorityFeeValue()}
        </StateStat>
      </>}
    </div>
  );
}
