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

export default function Leaderboard() {
  const [
    leaderboardData,
    setLeaderboardData,
    leaderboardIndex,
    isLeaderboardLoading,
  ] = useLeaderboardData();
  const accountType = useAccountType() as AccountType;
  const [stateData, setStateData, isStatsLoadingStats] = useStatsData();
  const isLoading = isLeaderboardLoading || isStatsLoadingStats;

  // Handle Solana events for the account
  // update the account data when a new event is received
  useSolanaEvents({
    handleEvent: (eventHash: EventHash) => {
      const account =
        accountType == AccountType.Solana
          ? eventHash.user.toBase58()
          : "0x" + Buffer.from(eventHash.ethAccount).toString("hex");
      // console.log("Event hash", eventHash, account, leaderboardIndex[account]);
      stateData.points += BigInt("0x" + eventHash.points.toString("hex"));
      stateData.hashes += eventHash.hashes;
      stateData.superHashes += eventHash.superhashes;
      stateData.txs += 1;
      if (
        leaderboardIndex[account] != undefined &&
        (eventHash.hashes > 0 ||
          eventHash.superhashes > 0 ||
          eventHash.points > 0)
      ) {
        const index = leaderboardIndex[account];
        leaderboardData[index].points += BigInt(
          "0x" + eventHash.points.toString("hex"),
        );
        leaderboardData[index].hashes += eventHash.hashes;
        leaderboardData[index].superHashes += eventHash.superhashes;
        setLeaderboardData([...leaderboardData]);
      }
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Background isLoading={isLoading} />
      <NavBar />
      <AmpBanner isLoading={isLoading} stateData={stateData} />

      <div
        className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-xl bg-base-100 opacity-85 md:mt-5 sm:mb-8 ${!isLoading ? " shadow-xl" : ""}`}
      >
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

          <StateStats state={stateData} isLoadingStats={isStatsLoadingStats} />

          <LeadersTable
            isLoading={isLeaderboardLoading}
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
