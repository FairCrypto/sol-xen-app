import { EventHash } from "@/app/hooks/SolanaEventsHook";
import React, { useEffect, useState } from "react";
import { LeadersTable } from "@/app/leaderboard/LeadersTable";
import { AccountType } from "@/app/hooks/AccountTypeHook";
import {
  fetchAssociatedEthAccounts,
  fetchAssociatedSolAccounts,
  generateLeaderboardIndex,
  LeaderboardEntry,
} from "@/app/Api";
import { Loader } from "@/app/components/Loader";
import { useLeaderboardSort } from "@/app/hooks/LeaderBoardSortHook";
import { useLeaderboardPage } from "@/app/hooks/LeaderBoardPageHook";
import { order } from "@/app/hooks/LeaderboardDataHook";

export function AccountAssociations({
  accountAddress,
  eventHashes,
}: {
  accountAddress: string;
  eventHashes?: EventHash[];
}) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );
  const [leaderboardIndex, setLeaderboardIndex]: [any, any] = useState<
    Map<string, LeaderboardEntry>
  >(new Map());
  const [isAssociatedLoading, setIsAssociatedLoading] = useState(true);
  const [sortBy, setSortBy] = useLeaderboardSort();
  const [page, setPage] = useLeaderboardPage();

  const accountType = (): AccountType => {
    if (accountAddress.startsWith("0x") && accountAddress.length == 42) {
      return AccountType.Ethereum;
    }
    return AccountType.Solana;
  };

  const associatedAccountType = () =>
    accountType() == AccountType.Ethereum
      ? AccountType.Solana
      : AccountType.Ethereum;

  useEffect(() => {
    if (accountType() == AccountType.Ethereum) {
      fetchAssociatedSolAccounts(
        accountAddress,
        100,
        (page - 1) * 100,
        sortBy,
        order(sortBy),
      ).then((data) => {
        const idxData = generateLeaderboardIndex(data);
        // console.log("Fetched associated sol accounts", data, idxData);
        setLeaderboardData(data);
        setLeaderboardIndex(idxData);
        setIsAssociatedLoading(false);
      });
    } else {
      fetchAssociatedEthAccounts(accountAddress).then((data) => {
        const idxData = generateLeaderboardIndex(data, true);
        console.log("Fetched associated eth accounts", data, idxData);
        setLeaderboardData(data);
        setLeaderboardIndex(idxData);
        setIsAssociatedLoading(false);
      });
    }
  }, [accountAddress]);

  useEffect(() => {
    if (eventHashes && eventHashes.length > 0) {
      eventHashes.forEach((eventHash) => {
        const otherAccount =
          accountType() == AccountType.Ethereum
            ? eventHash.user.toBase58()
            : "0x" +
              Buffer.from(eventHash.ethAccount).toString("hex").toLowerCase();

        if (
          leaderboardIndex[otherAccount] != undefined &&
          (eventHash.hashes > 0 || eventHash.superhashes > 0)
        ) {
          const index = leaderboardIndex[otherAccount];
          if (leaderboardData[index].solXen != undefined) {
            leaderboardData[index].solXen += BigInt(
              "0x" + eventHash.points.toString("hex"),
            );
          }
          leaderboardData[index].hashes += BigInt(eventHash.hashes);
          leaderboardData[index].superHashes += Number(eventHash.superhashes);
        }
      });

      setLeaderboardData([...leaderboardData]);
    }
  }, [eventHashes, accountAddress]);

  return (
    <div
      className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-xl bg-base-100 shadow-lg drow-shadow-lg opacity-90 fade-in-animation`}
    >
      <Loader isLoading={isAssociatedLoading} />

      <div className={`card-body mb-10 px-0 sm:px-6`}>
        <div className="card-title capitalize px-4">
          Associated {associatedAccountType()} Accounts
        </div>

        <LeadersTable
          accountType={associatedAccountType()}
          isLoading={isAssociatedLoading}
          leaderboardData={leaderboardData}
          hideSearch={true}
          page={page}
          setPage={setPage}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>
    </div>
  );
}
