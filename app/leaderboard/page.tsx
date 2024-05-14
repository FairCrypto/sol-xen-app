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

export interface LeaderboardEntry {
  rank: number;
  solAccount: string;
  ethAccount: string;
  hashes: number;
  superHashes: number;
  points: bigint;
}

export interface EventHash {
  slot: bigint;
  user: web3.PublicKey;
  ethAccount: number[];
  hashes: number;
  superhashes: number;
  points: BN;
}

enum AccountType {
  Ethereum = "ethereum",
  Solana = "solana",
}

async function fetchLeaderboardData(accountType: AccountType) {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/leaderboard?account=${accountType}`,
  );

  if (!data.ok) {
    throw new Error("Error fetching leaderboard data");
  }

  const out = await data.json();

  for (const entry of out) {
    entry.points = BigInt(entry.points);
  }

  return out;
}

async function fetchStateData() {
  const data = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/state`);

  if (!data.ok) {
    throw new Error("Error fetching leaderboard data");
  }

  const out = await data.json();
  out.points = BigInt(out.points);

  return out;
}

function generateLeaderboardIndex(
  leaderboardData: LeaderboardEntry[],
  accountType: AccountType,
) {
  return leaderboardData.reduce(
    (acc, entry, index) => {
      const accountKey =
        accountType == AccountType.Solana ? entry.solAccount : entry.ethAccount;
      acc[accountKey] = index;
      return acc;
    },
    {} as Record<string, number>,
  );
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
    createdAt: new Date(),
    points: 0n,
    hashes: 0,
    superHashes: 0,
    txs: 0,
    amp: 0,
    lastAmpSlot: 0n,
    zeroAmpEta: new Date(),
    nextAmpEta: new Date(),
    avgAmpSecs: 0,
  });

  useEffect(() => {
    setAccountType(getAccountTypeFromSearchParams(searchParams));

    const fetchData = async () => {
      fetchStateData().then((data) => {
        setStateData(data);
        setIsStatsLoadingStats(false);
      });

      setIsLeaderboardLoading(true);
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

  const percentOfState = (points: bigint) => {
    if (stateData.points === 0n) {
      return 0;
    }
    return Math.floor(Number((points * 10000n) / stateData.points) / 100);
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div
        id="background-image-overlay"
        className="fixed h-full w-full left-0 top-0"
      >
        <Image
          className={`opacity-0 ${isStatsLoadingStats && isLeaderboardLoading ? "" : "fade-in"}`}
          alt="Background image"
          src="/background-image.jpg"
          fill
          sizes="(min-width: 808px) 50vw, 100vw"
          style={{
            objectFit: "cover",
          }}
        />
      </div>

      <NavBar />

      <div
        className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-xl bg-base-100 opacity-85 md:mt-5 sm:mb-8 ${isStatsLoadingStats && isLeaderboardLoading ? "" : "shadow-xl"}`}
      >
        <div className="card-body px-0 py-3 sm:px-5 sm:py-5 md:px-8 md:py-8">
          <div className="flex md:grid md:grid-cols-3 items-center justify-center mb-4">
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

          <div className="overflow-x-auto">
            <table
              className={`table table-fixed md:table-auto table-lg table-zebra opacity-0 ${!isStatsLoadingStats && !isLeaderboardLoading ? "fade-in" : ""}`}
            >
              <thead>
                <tr>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-2 w-10">
                    <span>Rank</span>
                  </th>
                  <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <span>Account</span>
                  </th>
                  <th className="hidden lg:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <span>Hashes</span>
                  </th>
                  <th className="hidden lg:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <span>Super Hashes</span>
                  </th>
                  {accountType == AccountType.Solana ? (
                    <th className="hidden lg:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                      <span>solXEN</span>
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map(
                  (
                    {
                      rank,
                      solAccount,
                      ethAccount,
                      hashes,
                      superHashes,
                      points,
                    },
                    index,
                  ) => {
                    return (
                      <tr key={rank} className={``}>
                        <td className="p-4 pr-0 border-b border-blue-gray-50">
                          <span color="blue-gray" className="font-bold">
                            {rank}
                          </span>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50 text-xs sm:text-base font-mono truncate">
                          <span>
                            {accountType == "solana" ? solAccount : ethAccount}
                          </span>

                          <dl className="lg:hidden font-normal mt-2">
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-400 mt-1 font-mono">
                                Hashes
                              </dt>
                              <dd className="text-gray-400 text-sm mt-1 font-mono">
                                {Intl.NumberFormat("en-US").format(hashes)}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-400 text-sm mt-1 font-mono">
                                Super Hashes
                              </dt>
                              <dd className="text-gray-400 text-sm mt-1">
                                {Intl.NumberFormat("en-US").format(superHashes)}
                              </dd>
                            </div>
                            {accountType == AccountType.Solana ? (
                              <div className="flex justify-between">
                                <dt className="text-gray-400 text-sm mt-1 font-medium">
                                  solXEN
                                </dt>
                                <dd className="text-gray-400 text-sm mt-1  font-mono">
                                  {percentOfState(points) > 0 ? (
                                    <div className="badge badge-sm badge-success badge-outline mr-2">
                                      {percentOfState(points)}%
                                    </div>
                                  ) : null}
                                  {Intl.NumberFormat("en-US").format(
                                    points / 1_000_000_000n,
                                  )}
                                </dd>
                              </div>
                            ) : null}
                          </dl>
                        </td>
                        <td className="hidden lg:table-cell p-4 border-b border-blue-gray-50">
                          <span className="font-mono">
                            {Intl.NumberFormat("en-US").format(hashes)}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell p-4 border-b border-blue-gray-50">
                          <span className="font-mono">
                            {Intl.NumberFormat("en-US").format(superHashes)}
                          </span>
                        </td>
                        {accountType == AccountType.Solana ? (
                          <td className="hidden lg:table-cell p-4 border-b border-blue-gray-50">
                            <span className="font-mono">
                              {Intl.NumberFormat("en-US").format(
                                points / 1_000_000_000n,
                              )}
                              {percentOfState(points) > 0 ? (
                                <div className="badge badge-sm badge-success badge-outline ml-2">
                                  {percentOfState(points)}%
                                </div>
                              ) : null}
                            </span>
                          </td>
                        ) : null}
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {!isLeaderboardLoading && !isStatsLoadingStats && <Footer />}
    </main>
  );
}
