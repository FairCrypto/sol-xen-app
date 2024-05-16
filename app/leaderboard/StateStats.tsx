import React, { useContext, useEffect, useState } from "react";
import "chart.js/auto";
import { ThemeContext } from "@/app/context/ThemeContext";
import StateStat from "@/app/leaderboard/StateStat";

export interface State {
  points: bigint;
  solXen: number;
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

  const avgPriorityFeeValue = () => {
    return Intl.NumberFormat("en-US").format(state.avgPriorityFee);
  };

  useEffect(() => {
    fetchStateHistory().then((data) => {
      setStateHistory(data);
    });
  }, [theme]);

  return (
    <div
      id="solxen-stats"
      className={`grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-center mb-2 sm:mb-3 mx-4 opacity-0 ${!isLoadingStats ? "fade-in" : ""}`}
    >
      <StateStat
        name="solXen"
        title="Total solXEN"
        stateHistory={stateHistory.map((entry) => ({
          x: new Date(entry.createdAt),
          y: entry.solXen,
        }))}
      >
        {totalSupplyValue()}
      </StateStat>
      <StateStat
        name="hashes"
        title="Total Hashes"
        stateHistory={stateHistory.map((entry) => ({
          x: new Date(entry.createdAt),
          y: entry.hashes,
        }))}
      >
        {totalHashesValue()}
      </StateStat>

      <StateStat
        name="superHashes"
        title="Total Super Hashes"
        stateHistory={stateHistory.map((entry) => ({
          x: new Date(entry.createdAt),
          y: entry.superHashes,
        }))}
      >
        {totalSuperHashesValue()}
      </StateStat>

      <StateStat
        name="txs"
        title="Total TXs"
        stateHistory={stateHistory.map((entry) => ({
          x: new Date(entry.createdAt),
          y: entry.txs,
        }))}
      >
        {txsValue()}
      </StateStat>

      <StateStat
        name="amp"
        title="AMP"
        stateHistory={stateHistory.map((entry) => ({
          x: new Date(entry.createdAt),
          y: entry.amp,
        }))}
      >
        {ampValue()}
      </StateStat>

      {/*<StateStat*/}
      {/*  name="lastAmpSlot"*/}
      {/*  title="Last AMP Slot"*/}
      {/*  extraClassName="hidden sm:inline"*/}
      {/*  stateHistory={stateHistory.map((entry) => Number(entry.lastAmpSlot))}*/}
      {/*>*/}
      {/*  {lastAmpSlotValue()}*/}
      {/*</StateStat>*/}

      <StateStat
        name="avgPriorityFee"
        title="Avg Priority Fee"
        stateHistoryTitle="Median"
        stateHistory2Title="Min"
        stateHistory3Title="Max"
        fillDetailed={false}
        stateHistory={stateHistory.map((entry) => ({
          x: new Date(entry.createdAt),
          y: entry.medianPriorityFee,
        }))}
        stateHistory2={stateHistory.map((entry) => ({
          x: new Date(entry.createdAt),
          y: entry.minPriorityFee,
        }))}
        stateHistory3={stateHistory.map((entry) => ({
          x: new Date(entry.createdAt),
          y: entry.maxPriorityFee,
        }))}
      >
        {avgPriorityFeeValue()}
      </StateStat>
    </div>
  );
}
