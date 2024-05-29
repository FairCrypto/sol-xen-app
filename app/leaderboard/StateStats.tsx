import React, { useContext, useEffect, useState } from "react";
import "chart.js/auto";
import { ThemeContext } from "@/app/context/ThemeContext";
import StateStat from "@/app/leaderboard/StateStat";
import {
  ChartUnit,
  fetchHashEventStats,
  fetchPriorityFees,
  fetchStateHistory,
  GlobalState,
  HashEventStat,
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
  medianPriorityFee: number;
  maxPriorityFee: number;
  programs: string[];
}

export default function StateStats({
  state,
  isLoadingStats,
  setShowBackground,
}: {
  state: State;
  isLoadingStats: boolean;
  setShowBackground: (show: boolean) => void;
}) {
  const { theme } = useContext(ThemeContext);
  const [stateHistory, setStateHistory] = useState<GlobalState[]>([]);
  const [hashEventStats, setHashEventStats] = useState<HashEventStat[]>([]);
  const [priorityFees, setPriorityFees] = useState<SolXenPriorityFees[]>([]);
  const [chartUnit, setChartUnit] = useChartSelector();

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

  const hashRateValue = (): number => {
    if (stateHistory.length < 5) {
      return (
        Number(stateHistory[0]?.hashesDelta || 0n / BigInt(divisor())) || 0
      );
    }

    const lastFive = stateHistory.slice(-8).slice(3);
    let nonZeroCount = 0;
    if (lastFive.length > 0) {
      try {
        const avgHashRate =
          lastFive.reduce((sum, fee) => {
            if (fee.hashesDelta !== 0n) {
              nonZeroCount++;
              return BigInt(sum) + fee.hashesDelta;
            }
            return BigInt(sum);
          }, 0n) /
          BigInt(divisor()) /
          BigInt(nonZeroCount);
        return Math.floor(Number(avgHashRate));
      } catch (e) {
        return (
          Number(stateHistory[0]?.hashesDelta || 0n / BigInt(divisor())) || 0
        );
      }
    }

    return 0;
  };

  const avgPriorityFeeValue = () => {
    const lastFive = priorityFees.slice(-5);
    let nonZeroCount = 0;
    try {
      const avgPriorityFee =
        lastFive.reduce((sum, fee) => {
          if (fee.avgPriorityFee !== 0) {
            nonZeroCount++;
            return sum + fee.avgPriorityFee;
          }
          return sum;
        }, 0) / nonZeroCount;
      return Intl.NumberFormat("en-US").format(Math.floor(avgPriorityFee || 0));
    } catch (e) {
      return priorityFees[0]?.avgPriorityFee || 0;
    }
  };

  const maxPriorityFeeValue = () => {
    try {
      const lastFive = priorityFees.slice(-5);
      let nonZeroCount = 0;
      const avgMaxPriorityFee =
        lastFive.reduce((sum, fee) => {
          if (fee.maxPriorityFee !== 0) {
            nonZeroCount++;
            return sum + fee.maxPriorityFee;
          }
          return sum;
        }, 0) / nonZeroCount;
      return Intl.NumberFormat("en-US").format(
        Math.floor(avgMaxPriorityFee || 0),
      );
    } catch (e) {
      return priorityFees[0]?.maxPriorityFee || 0;
    }
  };

  const minPriorityFeeValue = () => {
    try {
      const lastFive = priorityFees.slice(-5);
      let nonZeroCount = 0;
      const avgMinPriorityFee =
        lastFive.reduce((sum, fee) => {
          if (fee.lowPriorityFee !== 0) {
            nonZeroCount++;
            return sum + fee.lowPriorityFee;
          }
          return sum;
        }, 0) / nonZeroCount;

      return Intl.NumberFormat("en-US").format(
        Math.floor(avgMinPriorityFee || 0),
      );
    } catch (e) {
      return priorityFees[0]?.lowPriorityFee || 0;
    }
  };

  useEffect(() => {
    if (chartUnit) {
      fetchStateHistory(
        startTime(chartUnit),
        endTime(chartUnit),
        unit(chartUnit),
      ).then((data) => {
        setStateHistory(data);
      });

      fetchHashEventStats(
        undefined,
        startTime(chartUnit),
        endTime(chartUnit),
        unit(chartUnit),
      ).then((data) => {
        setHashEventStats(data);
      });

      fetchPriorityFees(
        startTime(chartUnit),
        endTime(chartUnit),
        unit(chartUnit),
      ).then((data) => {
        setPriorityFees(data);
      });
    }
  }, [theme, chartUnit]);

  const divisor = (): number => (chartUnit === "day" ? 60 * 60 : 60);
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
            data: hashEventStats.map((entry) => ({
              x: new Date(entry.createdAt),
              y: Number(entry.solXen / 100_000_000n),
            })),
          },
        ]}
        chartUnit={chartUnit}
        setChartUnit={setChartUnit}
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
        setChartUnit={setChartUnit}
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
        setChartUnit={setChartUnit}
      >
        {totalSuperHashesValue()}
      </StateStat>

      {/*<StateStat*/}
      {/*  setShowBackground={setShowBackground}*/}
      {/*  name="txs"*/}
      {/*  title="Total TXs"*/}
      {/*  stateHistoryTitle="TXs Rate"*/}
      {/*  stateHistory={hashEventStats.map((entry) => ({*/}
      {/*    x: new Date(entry.createdAt),*/}
      {/*    y: entry.txs,*/}
      {/*  }))}*/}
      {/*>*/}
      {/*  {txsValue()}*/}
      {/*</StateStat>*/}

      {/*<StateStat*/}
      {/*  setShowBackground={setShowBackground}*/}
      {/*  name="lastAmpSlot"*/}
      {/*  title="Last AMP Slot"*/}
      {/*  yAxesTitle="Slots"*/}
      {/*  sets={[*/}
      {/*    {*/}
      {/*      label: "Last AMP Slot",*/}
      {/*      data: stateHistory.map((entry) => ({*/}
      {/*        x: new Date(entry.createdAt),*/}
      {/*        y: Number(entry.lastAmpSlot),*/}
      {/*      })),*/}
      {/*    }*/}
      {/*  ]}*/}
      {/*  chartUnit={chartUnit}*/}
      {/*  setChartUnit={setChartUnit}*/}
      {/*>*/}
      {/*  {lastAmpSlotValue()}*/}
      {/*</StateStat>*/}

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
              y: Number(entry.hashesDelta) / divisor(),
            })),
          },
        ]}
        chartUnit={chartUnit}
        setChartUnit={setChartUnit}
        detailedChartType={"line"}
      >
        {humanizeHashRate(hashRateValue()).replace(".00", "")}
      </StateStat>

      <StateStat
        setShowBackground={setShowBackground}
        name="Amp"
        title="AMP"
        yAxesTitle="AMP"
        sets={[
          {
            label: "AMP",
            data: stateHistory.map((entry) => ({
              x: new Date(entry.createdAt),
              y: entry.amp,
            })),
          },
        ]}
        chartUnit={chartUnit}
        setChartUnit={setChartUnit}
      >
        {ampValue()}
      </StateStat>

      <StateStat
        setShowBackground={setShowBackground}
        name="avgPriorityFee"
        title="Avg Priority Fee"
        yAxesTitle="Microlamports"
        sets={[
          {
            label: `Low | ${minPriorityFeeValue()}`,
            data: priorityFees.map((entry) => ({
              x: new Date(entry.createdAt),
              y: entry.lowPriorityFee,
            })),
          },
          {
            label: `Avg | ${avgPriorityFeeValue()}`,
            data: priorityFees.map((entry) => ({
              x: new Date(entry.createdAt),
              y: entry.avgPriorityFee,
            })),
          },
          {
            label: `High | ${maxPriorityFeeValue()}`,
            data: priorityFees.map((entry) => ({
              x: new Date(entry.createdAt),
              y: entry.maxPriorityFee,
            })),
          },
        ]}
        chartUnit={chartUnit}
        setChartUnit={setChartUnit}
        smallIndex={1}
        detailedChartType={"line"}
        yScaleType="logarithmic"

      >
        {avgPriorityFeeValue()}
      </StateStat>
    </div>
  );
}
