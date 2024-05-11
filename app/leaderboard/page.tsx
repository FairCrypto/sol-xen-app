"use client";
import React, { useEffect, useState } from "react";
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
        accountType == "solana" ? entry.solAccount : entry.ethAccount;
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
  const [stateData, setStateData]: [State, any] = useState<State>({
    points: 0n,
    hashes: 0,
    superHashes: 0,
    txs: 0,
    amp: 0,
    lastAmpSlot: 0n,
  });

  useEffect(() => {
    setAccountType(getAccountTypeFromSearchParams(searchParams));

    const fetchData = async () => {
      fetchLeaderboardData(accountType).then((data: LeaderboardEntry[]) => {
        setLeaderboardData(data);
        setLeaderboardIndex(generateLeaderboardIndex(data, accountType));
      });
      fetchStateData().then(setStateData);
    };

    fetchData().then();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [accountType, searchParams]);

  useEffect(() => {
    const messageHandler = (eventHash: EventHash) => {
      stateData.points += BigInt("0x" + eventHash.points);
      stateData.hashes += eventHash.hashes;
      stateData.superHashes += eventHash.superhashes;
      stateData.txs += 1;
      stateData.lastAmpSlot = eventHash.slot;
      setStateData({ ...stateData });
      if (
        leaderboardIndex[eventHash.user.toBase58()] &&
        (eventHash.hashes > 0 ||
          eventHash.superhashes > 0 ||
          eventHash.points > 0)
      ) {
        const index = leaderboardIndex[eventHash.user.toBase58()];
        leaderboardData[index].points += BigInt("0x" + eventHash.points);
        leaderboardData[index].hashes += eventHash.hashes;
        leaderboardData[index].superHashes += eventHash.superhashes;
        setLeaderboardData([...leaderboardData]);
        // console.log("Updating entry", leaderboardData[index]);
      }
    };

    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "",
    );
    const provider = new AnchorProvider(connection, null as any);
    setProvider(provider);
    const program = new Program(idl as any, provider);
    const listener = program.addEventListener("hashEvent", messageHandler);

    return () => {
      program.removeEventListener(listener).then();
    };
  }, [stateData, leaderboardData, leaderboardIndex]);

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
        style={{
          position: "fixed",
          height: "100%",
          width: "100%",
          left: "0",
          top: "0",
        }}
      >
        <Image
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

      <div className="card rounded-none sm:rounded-xl w-full md:max-w-screen-xl bg-base-100 shadow-xl opacity-85 md:mt-5 sm:mb-8">
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

          <StateStats state={stateData} />

          <div className="overflow-x-auto">
            {leaderboardData && leaderboardData.length != 0 ? (
              <table className="table table-fixed md:table-auto table-lg table-zebra">
                <thead>
                  <tr>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-2 w-10">
                      <span>Rank</span>
                    </th>
                    <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                      <span>Account</span>
                    </th>
                    <th className="hidden md:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                      <span>Hashes</span>
                    </th>
                    <th className="hidden md:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                      <span>Super Hashes</span>
                    </th>
                    {accountType == AccountType.Solana ? (
                      <th className="hidden md:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4">
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
                          <td className="p-4 border-b border-blue-gray-50 text-xs sm:text-base truncate">
                            <span>
                              {accountType == "solana"
                                ? solAccount
                                : ethAccount}
                            </span>

                            <dl className="md:hidden font-normal mt-2">
                              <div className="flex justify-between">
                                <dt className="text-sm text-gray-400 mt-1 font-medium">
                                  Hashes
                                </dt>
                                <dd className="text-gray-400 text-sm mt-1">
                                  {Intl.NumberFormat("en-US").format(hashes)}
                                </dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-gray-400 text-sm mt-1 font-medium">
                                  Super Hashes
                                </dt>
                                <dd className="text-gray-400 text-sm mt-1">
                                  {Intl.NumberFormat("en-US").format(
                                    superHashes,
                                  )}
                                </dd>
                              </div>
                              {accountType == AccountType.Solana ? (
                                <div className="flex justify-between">
                                  <dt className="text-gray-400 text-sm mt-1 font-medium">
                                    solXEN
                                  </dt>
                                  <dd className="text-gray-400 text-sm mt-1">
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
                          <td className="hidden md:table-cell p-4 border-b border-blue-gray-50">
                            <span className="font-normal">
                              {Intl.NumberFormat("en-US").format(hashes)}
                            </span>
                          </td>
                          <td className="hidden md:table-cell p-4 border-b border-blue-gray-50">
                            <span className="font-normal">
                              {Intl.NumberFormat("en-US").format(superHashes)}
                            </span>
                          </td>
                          {accountType == AccountType.Solana ? (
                            <td className="hidden md:table-cell p-4 border-b border-blue-gray-50">
                              <span className="font-normal">
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
            ) : null}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
