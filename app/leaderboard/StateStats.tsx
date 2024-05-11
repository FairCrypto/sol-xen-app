import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export interface State {
  points: bigint;
  hashes: number;
  superHashes: number;
  txs: number;
  amp: number;
  lastAmpSlot: bigint;
}

export default function StateStats({
  state,
  isLoadingStats,
}: {
  state: State;
  isLoadingStats: boolean;
}) {
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

  return (
    <div
      id="solxen-stats"
      className={`grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-center mb-3 mx-4 opacity-0 ${!isLoadingStats ? "fade-in" : ""}`}
    >
      <div className="stat sm:mx-auto bg-accent-content/10 rounded-md shadow py-3 sm:py-5">
        <div className="stat-title">
          <span className="hidden sm:inline">Total</span> solXEN
        </div>
        <div className="stat-value text-sm md:text-2xl">
          {totalSupplyValue()}
        </div>
      </div>
      <div className="stat bg-accent-content/10 rounded-md shadow py-3 sm:py-5">
        <div className="stat-title">
          <span className="hidden sm:inline">Total</span> Hashes
        </div>
        <div className="stat-value text-sm md:text-2xl">
          {totalHashesValue()}
        </div>
      </div>
      <div className="stat bg-accent-content/10 rounded-md shadow py-3 sm:py-5">
        <div className="stat-title">
          <span className="hidden sm:inline">Total</span> Super Hashes
        </div>
        <div className="stat-value text-sm md:text-2xl">
          {totalSuperHashesValue()}
        </div>
      </div>
      <div className="stat bg-accent-content/10 rounded-md shadow py-3 sm:py-5">
        <div className="stat-title">AMP</div>
        <div className="stat-value text-sm md:text-2xl">{ampValue()}</div>
      </div>
      <div className="stat hidden sm:block bg-accent-content/10 rounded-md shadow py-3 sm:py-5">
        <div className="stat-title">
          <span className="hidden sm:inline">Last</span> AMP Slot
        </div>
        <div className="stat-value text-sm md:text-2xl">
          {lastAmpSlotValue()}
        </div>
      </div>
      <div className="stat  hidden sm:block bg-accent-content/10 rounded-md shadow py-3 sm:py-5">
        <div className="stat-title">
          <span className="hidden sm:inline">Total</span> TXs
        </div>
        <div className="stat-value text-sm md:text-2xl">{txsValue()}</div>
      </div>
    </div>
  );
}
