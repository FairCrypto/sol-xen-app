"use client";
import React, { useCallback, useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

interface DataItem {
  rank: number;
  solAccount: string;
  ethAccount: string;
  hashes: number;
  superHashes: number;
  points: number;
}

export default function Home() {
  const [data, setData] = useState<DataItem[]>([]);
  const [totalSupply, setTotalSupply]: [any, any] = useState([]);
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const [showEthAccount, setShowEthAccount] = useState(
    searchParams.get("account") === "ethereum",
  );

  const setAccount = useCallback(
    (account: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set("account", account);
      replace(url.toString());
    },
    [replace],
  );

  const percentOfTotalSupply = (points: number) => {
    return Math.floor((points / 1_000_000_000 / totalSupply.uiAmount) * 100);
  };

  useEffect(() => {
    const fetchData = async () => {
      const leaderboardResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/xolxen/leaderboard`,
      );
      const leaderboardData = await leaderboardResponse.json();

      setData(leaderboardData);

      const rows = document.querySelectorAll(".animate-table-row");
      setTimeout(() => {
        rows.forEach((row) => row.classList.add("show"));
      }, 100);

      const totalSupplyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/solxen/total_supply`,
      );
      const totalSupplyData = await totalSupplyResponse.json();
      setTotalSupply(totalSupplyData);
    };

    // Call fetchData immediately and then every 30 seconds
    fetchData().then();
    const intervalId = setInterval(fetchData, 30000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

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
          layout="fill"
          sizes="(min-width: 808px) 50vw, 100vw"
          style={{
            objectFit: "cover",
          }}
        />
      </div>

      {/*<div className="navbar bg-base-100 shadow-xl opacity-85 mb-5">*/}
      {/*  <a className="btn btn-ghost text-xl">solXEN</a>*/}
      {/*</div>*/}

      <div className="card w-full md:max-w-screen-xl bg-base-100 shadow-xl opacity-85 md:mt-6">
        <div className="flex items-center justify-center">
          <h1 className="text-3xl md:text-5xl mt-3">solXEN Leaderboard</h1>
        </div>

        <div className="flex items-center justify-center text-xl md:text-3xl mt-3 text-primary">
          Total supply:{" "}
          {totalSupply.uiAmount
            ? Intl.NumberFormat("en-US").format(totalSupply.uiAmount)
            : "Loading..."}
        </div>

        <div className="flex items-center justify-end m-4">
          <Suspense fallback={<div>Loading...</div>}>
            <div className="join">
              <input
                onClick={() => {
                  setShowEthAccount(false);
                  setAccount("solana");
                }}
                className="join-item btn btn-sm"
                type="radio"
                name="options"
                aria-label="Solana"
                checked={!showEthAccount}
                readOnly={true}
              />
              <input
                onClick={() => {
                  setShowEthAccount(true);
                  setAccount("ethereum");
                }}
                className="join-item btn btn-sm"
                type="radio"
                name="options"
                aria-label="Ethereum"
                checked={showEthAccount}
                readOnly={true}
              />
            </div>
          </Suspense>
        </div>

        <div className="overflow-x-auto">
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
                {!showEthAccount ? (
                  <th className="hidden md:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <span>solXEN</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {data.map(
                (
                  { rank, solAccount, ethAccount, hashes, superHashes, points },
                  index,
                ) => {
                  return (
                    <tr key={rank} className={`animate-table-row`}>
                      <td className="p-4 pr-0 border-b border-blue-gray-50">
                        <span color="blue-gray" className="font-bold">
                          {rank}
                        </span>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50 text-xs sm:text-base truncate">
                        <span>{showEthAccount ? ethAccount : solAccount}</span>

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
                              {Intl.NumberFormat("en-US").format(superHashes)}
                            </dd>
                          </div>
                          {!showEthAccount ? (
                            <div className="flex justify-between">
                              <dt className="text-gray-400 text-sm mt-1 font-medium">
                                solXEN
                              </dt>
                              <dd className="text-gray-400 text-sm mt-1">
                                {Intl.NumberFormat("en-US").format(
                                  points / 1_000_000_000,
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
                      {!showEthAccount ? (
                        <td className="hidden md:table-cell p-4 border-b border-blue-gray-50">
                          <span className="font-normal">
                            {Intl.NumberFormat("en-US").format(
                              points / 1_000_000_000,
                            )}
                            {percentOfTotalSupply(points) > 0 ? (
                              <small className="text-accent ml-1">
                                ({percentOfTotalSupply(points)}%)
                              </small>
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
    </main>
  );
}
