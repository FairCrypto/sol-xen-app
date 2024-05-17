import React, { useContext, useEffect, useState } from "react";
import "chart.js/auto";
import { ThemeContext } from "@/app/context/ThemeContext";
import StateStat from "@/app/leaderboard/StateStat";
import { fetchHashEventStats, HashEventStat } from "@/app/leaderboard/Api";

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
  setShowBackground,
}: {
  state: State;
  isLoadingStats: boolean;
  setShowBackground: (show: boolean) => void;
}) {
  const [stateHistory, setStateHistory] = useState<State[]>([]);
  const { theme } = useContext(ThemeContext);
  const [hashEventStats, setHashEventStats] = useState<HashEventStat[]>([]);

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

  const maxPriorityFeeValue = () => {
    return Intl.NumberFormat("en-US").format(state.maxPriorityFee);
  };

  const minPriorityFeeValue = () => {
    return Intl.NumberFormat("en-US").format(state.minPriorityFee);
  };

  useEffect(() => {
    fetchStateHistory().then((data) => {
      setStateHistory(data);
    });

    fetchHashEventStats().then((data) => {
      setHashEventStats(data);
    });
  }, [theme]);

  return (
    <div
      id="solxen-stats"
      className={`grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-center mb-2 sm:mb-3 mx-4 opacity-0 ${!isLoadingStats ? "fade-in" : ""}`}
    >
      <StateStat
        setShowBackground={setShowBackground}
        name="solXen"
        title="Total solXEN"
        stateHistoryTitle="solXEN Rate"
        stateHistory={hashEventStats.map((entry) => ({
          x: new Date(entry.createdAt),
          y: entry.solXen / 60,
        }))}
      >
        {totalSupplyValue()}
      </StateStat>

      <StateStat
        setShowBackground={setShowBackground}
        name="hashes"
        title="Total Hashes"
        stateHistoryTitle="Hashes Rate"
        stateHistory={hashEventStats.map((entry) => ({
          x: new Date(entry.createdAt),
          y: entry.hashes / 60,
        }))}
      >
        {totalHashesValue()}
      </StateStat>

      <StateStat
        setShowBackground={setShowBackground}
        name="superHashes"
        title="Total Super Hashes"
        stateHistoryTitle="Super Hashes Rate"
        stateHistory={hashEventStats.map((entry) => ({
          x: new Date(entry.createdAt),
          y: entry.superHashes,
        }))}
      >
        {totalSuperHashesValue()}
      </StateStat>

      <StateStat
        setShowBackground={setShowBackground}
        name="txs"
        title="Total TXs"
        stateHistoryTitle="TXs Rate"
        stateHistory={hashEventStats.map((entry) => ({
          x: new Date(entry.createdAt),
          y: entry.txs,
        }))}
      >
        {txsValue()}
      </StateStat>

      <StateStat
        setShowBackground={setShowBackground}
        name="amp"
        title="AMP"
        stateHistoryTitle="AMP Over Time"
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
        setShowBackground={setShowBackground}
        name="avgPriorityFee"
        title="Avg Priority Fee"
        yAxesTitle="Lamports"
        stateHistoryTitle={`Median (${avgPriorityFeeValue()} Lamports)`}
        stateHistory2Title={`Min (${minPriorityFeeValue()} Lamports)`}
        stateHistory3Title={`Max (${maxPriorityFeeValue()} Lamports)`}
        // fillDetailed={false}
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
