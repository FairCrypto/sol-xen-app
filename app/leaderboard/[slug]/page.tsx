"use client";

import { Background } from "@/app/leaderboard/Background";
import { NavBar } from "@/app/components/NavBar";
import React, { useState } from "react";
import Footer from "@/app/components/Footer";
import { LeaderboardEntry } from "@/app/leaderboard/LeadersTable";
import { EventHash, useSolanaEvents } from "@/app/hooks/SolanaEventsHook";
import { AccountType } from "@/app/hooks/AccountTypeHook";
import { AccountAssociations } from "@/app/leaderboard/[slug]/AccountAssociations";
import { AccountCharts } from "@/app/leaderboard/[slug]/AccountCharts";
import { AccountStats } from "@/app/leaderboard/[slug]/AccountStats";

export default function LeaderboardSlug({
  params,
}: {
  params: { slug: string };
}) {
  const [accountData, setAccountData]: [
    LeaderboardEntry,
    (data: LeaderboardEntry) => void,
  ] = useState<LeaderboardEntry>({
    rank: 0,
    account: "",
    hashes: 0n,
    superHashes: 0n,
    points: 0n,
    solXen: 0n,
  });
  const [accountAddress, setAccountAddress] = useState<string>(params.slug);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>("");
  const [eventHashes, setEventHashes] = useState<EventHash[]>();
  const accountType = (): AccountType => {
    if (accountAddress.startsWith("0x") && accountAddress.length == 42) {
      return AccountType.Ethereum;
    }
    return AccountType.Solana;
  };

  // Handle Solana events for the account
  // update the account data when a new event is received
  useSolanaEvents({
    refreshRate: 500,
    handleEventBatch: (eventHashes: EventHash[]) => {
      const newAccountData: LeaderboardEntry = { ...accountData };
      const newEventHashes: EventHash[] = [];

      eventHashes.forEach((eventHash) => {
        const account =
          accountType() == AccountType.Solana
            ? eventHash.user.toBase58()
            : "0x" + Buffer.from(eventHash.ethAccount).toString("hex");

        if (account.toLowerCase() !== accountAddress.toLowerCase()) return;

        newAccountData.hashes += BigInt(eventHash.hashes);
        newAccountData.superHashes += BigInt(eventHash.superhashes);
        if (eventHash.points) {
          const points = BigInt("0x" + eventHash.points.toString("hex"));
          if (accountType() == AccountType.Ethereum) {
            newAccountData.points = (newAccountData.points || 0n) + points;
          } else {
            newAccountData.solXen += points;
          }
        }

        setAccountData(newAccountData);
        setAccountAddress(newAccountData.account);
        newEventHashes.push(eventHash);
      });

      setEventHashes(newEventHashes);
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Background isLoading={isLoading} />
      <NavBar />
      <AccountStats
        accountAddress={accountAddress}
        accountData={accountData}
        setAccountData={setAccountData}
        setIsLoading={setIsLoading}
        setFetchError={setFetchError}
        fetchError={fetchError}
        isLoading={isLoading}
      />

      {!fetchError && (
        <>
          <AccountCharts
            accountAddress={accountAddress}
            eventHashes={eventHashes}
          />

          <AccountAssociations
            accountAddress={accountAddress}
            eventHashes={eventHashes}
          />
        </>
      )}

      <Footer isLoading={isLoading} />
    </main>
  );
}
