import { EventHash } from "@/app/hooks/SolanaEventsHook";
import React, { useEffect, useState } from "react";
import { LeaderboardEntry, LeadersTable } from "@/app/leaderboard/LeadersTable";
import { AccountType } from "@/app/hooks/AccountTypeHook";
import {
  fetchAssociatedEthAccounts,
  fetchAssociatedSolAccounts,
  generateLeaderboardIndex,
} from "@/app/leaderboard/Api";
import { Loader } from "@/app/components/Loader";

export function AccountAssociations({
  accountAddress,
  eventHash,
}: {
  accountAddress: string;
  eventHash?: EventHash;
}) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );
  const [leaderboardIndex, setLeaderboardIndex]: [any, any] = useState<
    Map<string, LeaderboardEntry>
  >(new Map());
  const [isAssociatedLoading, setIsAssociatedLoading] = useState(true);

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
      fetchAssociatedSolAccounts(accountAddress).then((data) => {
        const idxData = generateLeaderboardIndex(data, AccountType.Solana);
        console.log("Fetched associated sol accounts", data, idxData);
        setLeaderboardData(data);
        setLeaderboardIndex(idxData);
        setIsAssociatedLoading(false);
      });
    } else {
      fetchAssociatedEthAccounts(accountAddress).then((data) => {
        const idxData = generateLeaderboardIndex(data, AccountType.Ethereum);
        console.log("Fetched associated eth accounts", data, idxData);
        setLeaderboardData(data);
        setLeaderboardIndex(idxData);
        setIsAssociatedLoading(false);
      });
    }
  }, [accountAddress]);

  useEffect(() => {
    if (!eventHash) {
      return;
    }

    const otherAccount =
      accountType() == AccountType.Ethereum
        ? eventHash.user.toBase58()
        : "0x" + Buffer.from(eventHash.ethAccount).toString("hex");

    if (
      leaderboardIndex[otherAccount] != undefined &&
      (eventHash.hashes > 0 || eventHash.superhashes > 0)
    ) {
      const index = leaderboardIndex[otherAccount];
      leaderboardData[index].points += BigInt(
        "0x" + eventHash.points.toString("hex"),
      );
      leaderboardData[index].hashes += eventHash.hashes;
      leaderboardData[index].superHashes += eventHash.superhashes;
      setLeaderboardData([...leaderboardData]);
    }
  }, [eventHash]);

  return (
    <div
      className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-xl bg-base-100 shadow-lg drow-shadow-lg fade-in-animation`}
    >
      <Loader isLoading={isAssociatedLoading} />
      <div className={`card-body mb-10`}>
        <div className="card-title capitalize">
          Associated {associatedAccountType()} Accounts
        </div>

        <LeadersTable
          accountType={associatedAccountType()}
          isLoading={isAssociatedLoading}
          leaderboardData={leaderboardData}
          hideSearch={true}
        />
      </div>
    </div>
  );
}
