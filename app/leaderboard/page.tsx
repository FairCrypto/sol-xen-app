"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { NavBar } from "@/app/components/NavBar";
import { AccountSelector } from "@/app/components/AccountSelector";
import Footer from "@/app/components/Footer";
import StateStats, { State } from "@/app/leaderboard/StateStats";
import * as idl from "./target/idl/sol_xen.json";
import {
  AnchorProvider,
  BN,
  Program,
  setProvider,
  web3,
} from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import AmpBanner from "@/app/leaderboard/AmpBanner";
import {
  AccountType,
  fetchLeaderboardData,
  fetchStateData,
  generateLeaderboardIndex,
} from "@/app/leaderboard/Api";
import { Background } from "@/app/leaderboard/Background";
import {
  LeaderboardEntry,
  LeadersTable,
} from "@/app/leaderboard/LeadersTable";

export interface EventHash {
  slot: bigint;
  user: web3.PublicKey;
  ethAccount: number[];
  hashes: number;
  superhashes: number;
  points: BN;
}

function getAccountTypeFromSearchParams(
  searchParams: URLSearchParams,
): AccountType {
  return searchParams.get("account") === AccountType.Ethereum
    ? AccountType.Ethereum
    : AccountType.Solana;
}

export default function Leaderboard() {
  const searchParams = useSearchParams();
  const [accountType, setAccountType] = useState(
    getAccountTypeFromSearchParams(searchParams),
  );
  const [leaderboardData, setLeaderboardData]: [LeaderboardEntry[], any] =
    useState<LeaderboardEntry[]>([]);
  const [leaderboardIndex, setLeaderboardIndex]: [any, any] = useState<
    Map<string, LeaderboardEntry>
  >(new Map());
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
  const [isStatsLoadingStats, setIsStatsLoadingStats] = useState(true);
  const [stateData, setStateData]: [State, any] = useState<State>({
    avgPriorityFee: 0,
    createdAt: new Date(),
    points: 0n,
    solXen: 0,
    hashes: 0,
    superHashes: 0,
    txs: 0,
    amp: 0,
    lastAmpSlot: 0n,
    zeroAmpEta: new Date(),
    nextAmpEta: new Date(),
    avgAmpSecs: 0,
  });

  const isLoading = isLeaderboardLoading || isStatsLoadingStats;

  useEffect(() => {
    setAccountType(getAccountTypeFromSearchParams(searchParams));

    const fetchData = async () => {
      fetchStateData().then((data) => {
        setStateData(data);
        setIsStatsLoadingStats(false);
      });

      fetchLeaderboardData(accountType).then((data: LeaderboardEntry[]) => {
        const idxData = generateLeaderboardIndex(data, accountType);
        setLeaderboardData(data);
        setLeaderboardIndex(idxData);
        setIsLeaderboardLoading(false);
        // console.log("Fetched leaderboard data", data, idxData);
      });
    };

    fetchData().then();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [accountType, searchParams]);

  function useRefEventListener(fn: any) {
    const fnRef = useRef(fn);
    fnRef.current = fn;
    return fnRef;
  }

  // We can use the custom hook declared above
  const handleResizeRef = useRefEventListener((eventHash: EventHash) => {
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
      leaderboardIndex[account] &&
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
  });

  useEffect(() => {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "",
    );
    const provider = new AnchorProvider(connection, null as any);
    setProvider(provider);
    const program = new Program(idl as any, provider);

    console.log("Listening to hash events");
    const listener = program.addEventListener("hashEvent", (event: any) => {
      handleResizeRef.current(event);
    });

    return () => {
      console.log("stop listening to hash events");
      program.removeEventListener(listener).then();
    };
  }, [handleResizeRef]);

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Background isLoading={isLoading} />
      <NavBar />
      <AmpBanner isLoading={isLoading} stateData={stateData} />

      <div
        className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-xl bg-base-100 opacity-85 md:mt-5 sm:mb-8 ${!isLoading ? "shadow-xl" : ""}`}
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
