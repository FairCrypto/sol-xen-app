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
    LeaderboardEntry | null,
    (data: LeaderboardEntry | null) => void,
  ] = useState<LeaderboardEntry | null>(null);
  const [accountAddress, setAccountAddress] = useState<string>(params.slug);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>("");
  const [eventHash, setEventHash] = useState<EventHash>();
  const accountType = (): AccountType => {
    if (accountAddress.startsWith("0x") && accountAddress.length == 42) {
      return AccountType.Ethereum;
    }
    return AccountType.Solana;
  };

  // Handle Solana events for the account
  // update the account data when a new event is received
  useSolanaEvents({
    handleEvent: (eventHash: EventHash) => {
      const account =
        accountType() == AccountType.Solana
          ? eventHash.user.toBase58()
          : "0x" + Buffer.from(eventHash.ethAccount).toString("hex");

      if (account == accountAddress) {
        // console.log("Event for account", accountAddress);
        const newAccountData = Object.assign({}, accountData);

        newAccountData.hashes += eventHash.hashes;
        newAccountData.superHashes += eventHash.superhashes;
        if (eventHash.points > 0) {
          const points = BigInt("0x" + eventHash.points.toString("hex"));
          newAccountData.points += points;
        }

        setAccountData(newAccountData);
        setEventHash(eventHash);
      }
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
            eventHash={eventHash}
          />

          <AccountAssociations
            accountAddress={accountAddress}
            eventHash={eventHash}
          />
        </>
      )}
      {!isLoading && <Footer />}
    </main>
  );
}
