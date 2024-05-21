"use client";
import { NavBar } from "@/app/components/NavBar";
import { AccountSelector } from "@/app/components/AccountSelector";
import Footer from "@/app/components/Footer";
import StateStats from "@/app/leaderboard/StateStats";
import AmpBanner from "@/app/leaderboard/AmpBanner";
import { Background } from "@/app/leaderboard/Background";
import { LeadersTable } from "@/app/leaderboard/LeadersTable";
import { EventHash, useSolanaEvents } from "@/app/hooks/SolanaEventsHook";
import { AccountType, useAccountType } from "@/app/hooks/AccountTypeHook";
import { useLeaderboardData } from "@/app/hooks/LeaderboardDataHook";
import { useStatsData } from "@/app/hooks/StateDataHook";
import React, { useState } from "react";
import { Loader } from "@/app/components/Loader";

export default function Leaderboard() {
  const [
    leaderboardData,
    setLeaderboardData,
    leaderboardIndex,
    isLeaderboardLoading,
    isLeaderBoardUpdating,
  ] = useLeaderboardData();
  const accountType = useAccountType() as AccountType;
  const [stateData, setStateData, isStatsLoadingStats] = useStatsData();
  const isLoading = isLeaderboardLoading || isStatsLoadingStats;
  const [showBackground, setShowBackground] = useState(true);

  // Handle Solana events for the account
  // update the account data when a new event is received
  useSolanaEvents({
    handleEvent: (eventHash: EventHash) => {
      const newState = { ...stateData };
      const account =
        accountType == AccountType.Solana
          ? eventHash.user.toBase58()
          : "0x" + Buffer.from(eventHash.ethAccount).toString("hex");
      // console.log("Event hash", eventHash, account, leaderboardIndex[account]);
      stateData.solXen += BigInt("0x" + eventHash.points.toString("hex"));
      newState.hashes += BigInt(eventHash.hashes);
      newState.superHashes += BigInt(eventHash.superhashes);
      newState.txs += 1n;
      setStateData(newState);

      if (
        leaderboardIndex[account] != undefined &&
        (eventHash.hashes > 0 ||
          eventHash.superhashes > 0 ||
          eventHash.points > 0)
      ) {
        const index = leaderboardIndex[account];
        leaderboardData[index].solXen += BigInt(
          "0x" + eventHash.points.toString("hex"),
        );
        leaderboardData[index].hashes += BigInt(eventHash.hashes);
        leaderboardData[index].superHashes += BigInt(eventHash.superhashes);
        setLeaderboardData([...leaderboardData]);
      }
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center">
      {showBackground && <Background isLoading={isLoading} />}
      <NavBar />
      <AmpBanner isLoading={isLoading} stateData={stateData} />

      <div
        className={`card z-[2] rounded-none sm:rounded-xl w-full md:max-w-screen-xl bg-base-100 sm:mt-6 sm:mb-6 shadow-lg drow-shadow-lg opacity-90 fade-in-animation`}
      >
        <Loader isLoading={isStatsLoadingStats} />

        <div className="card-body px-0 py-3 sm:px-5 sm:py-5 md:px-8 md:py-8">
          <div className="flex md:grid md:grid-cols-3 items-center justify-center mb-2 sm:mb-4">
            <div></div>
            <div className="flex justify-start md:justify-center mr-auto md:mr-1 ml-4">
              <h1 className="text-3xl md:text-5xl">Leaderboard</h1>
            </div>
            <div className="flex justify-end">
              <span className="">
                <AccountSelector />
              </span>
            </div>
          </div>

          <StateStats
            state={stateData}
            isLoadingStats={isStatsLoadingStats}
            setShowBackground={setShowBackground}
          />
        </div>
      </div>

      <div
        className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-xl bg-base-100 sm:mb-8 shadow-lg drow-shadow-lg opacity-90 fade-in-animation`}
      >
        <Loader isLoading={isLeaderBoardUpdating} />
        <div className="card-body px-0 py-3 sm:px-5 sm:py-5 md:px-8 md:py-8">
          <LeadersTable
            isLoading={isLeaderBoardUpdating}
            leaderboardData={leaderboardData}
            accountType={accountType}
            stateData={stateData}
          />
        </div>
      </div>

      {!isLoading && <Footer />}
    </main>
  );
}
