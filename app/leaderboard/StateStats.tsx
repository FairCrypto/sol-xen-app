import React from "react";
import CountDown from "@/app/components/CountDown";

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

  const avgAmpSecsDate = () => {
    return new Date(new Date().getTime() + state.avgAmpSecs * 1000);
  };

  return (
    <>
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
        <div className="stat hidden sm:block bg-accent-content/10 rounded-md shadow py-3 sm:py-5">
          <div className="stat-title">
            <span className="hidden sm:inline">Total</span> TXs
          </div>
          <div className="stat-value text-sm md:text-2xl">{txsValue()}</div>
        </div>

        <div className="stat sm:mx-auto bg-accent-content/10 rounded-md shadow py-3 sm:py-5 px-0">
          <div className="stat-title">Zero AMP ETA</div>
          <div className="stat-value text-xs sm:text-sm md:text-2xl">
            <CountDown endDate={new Date(state.zeroAmpEta)} />
          </div>
        </div>

        <div className="stat sm:mx-auto bg-accent-content/10 rounded-md shadow py-3 sm:py-5">
          <div className="stat-title">Next AMP ETA</div>
          <div className="stat-value text-xs sm:text-sm md:text-2xl">
            <CountDown endDate={new Date(state.nextAmpEta)} />
          </div>
        </div>

        <div className="stat hidden sm:block sm:mx-auto bg-accent-content/10 rounded-md shadow py-3 sm:py-5">
          <div className="stat-title">Avg AMP Time</div>
          <div className="stat-value text-sm md:text-2xl">
            <>
              <CountDown
                endDate={avgAmpSecsDate()}
                dontRun={true}
                showSeconds={true}
              />
            </>
          </div>
        </div>
      </div>
    </>
  );
}
