"use client";
import React, {
  useCallback,
  useEffect,
  useState,
  Suspense,
  createContext,
} from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { NavBar } from "@/app/components/NavBar";
import { AccountSelector } from "@/app/components/AccountSelector";
import Footer from "@/app/components/Footer";

interface DataItem {
  rank: number;
  solAccount: string;
  ethAccount: string;
  hashes: number;
  superHashes: number;
  points: number;
}

export default function Leaderboard() {
  const [data, setData] = useState<DataItem[]>([]);
  const [totalSupply, setTotalSupply]: [any, any] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const searchParams = useSearchParams();
  const [showEthAccount, setShowEthAccount] = useState(
    () => searchParams.get("account") === "ethereum",
  );

  const percentOfTotalSupply = (points: number) => {
    return Math.floor((points / totalSupply.points) * 100);
  };

  useEffect(() => {
    const useEthAccount = searchParams.get("account") === "ethereum";
    setShowEthAccount(useEthAccount);

    const fetchData = async () => {
      try {
        const accountType = useEthAccount ? "ethereum" : "solana";
        const leaderboardResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/leaderboard?account=${accountType}`,
        );
        if (!leaderboardResponse.ok) {
          throw new Error("Error fetching leaderboard data");
        }
        const leaderboardData = await leaderboardResponse.json();

        setData(leaderboardData);

        // Add the 'show' class to the rows after the data is set
        setTimeout(() => {
          const rows = document.querySelectorAll(".animate-table-row");
          rows.forEach((row) => row.classList.add("show"));
        }, 100);

        const totalSupplyResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/state`,
        );
        if (!totalSupplyResponse.ok) {
          throw new Error("Error fetching total supply data");
        }
        const totalSupplyData = await totalSupplyResponse.json();
        setTotalSupply(totalSupplyData);
        setIsLoaded(true);
      } catch (error) {
        console.error(error);
        // Here you can handle the error, for example, by setting an error state and displaying an error message in your component
      }
    };

    // Call fetchData immediately and then every 30 seconds
    fetchData().then();
    const intervalId = setInterval(fetchData, 30000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [searchParams]);

  const totalSupplyValue = () => {
    if (isNaN(totalSupply?.points)) {
      return null;
    }
    return Intl.NumberFormat("en-US").format(
      totalSupply?.points / 1_000_000_000,
    );
  };

  const totalHashesValue = () => {
    if (isNaN(totalSupply?.hashes)) {
      return null;
    }
    return Intl.NumberFormat("en-US").format(totalSupply?.hashes);
  };

  const totalSuperHashesValue = () => {
    if (isNaN(totalSupply?.superHashes)) {
      return null;
    }
    return Intl.NumberFormat("en-US").format(totalSupply?.superHashes);
  };

  const txsValue = () => {
    if (isNaN(totalSupply?.txs)) {
      return null;
    }
    return Intl.NumberFormat("en-US").format(totalSupply?.txs);
  };

  const ampValue = () => {
    if (isNaN(totalSupply?.amp)) {
      return null;
    }
    return Intl.NumberFormat("en-US").format(totalSupply?.amp);
  };

  const lastAmpSlotValue = () => {
    if (isNaN(totalSupply?.lastAmpSlot)) {
      return null;
    }
    return Intl.NumberFormat("en-US").format(totalSupply?.lastAmpSlot);
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

      <div className="card w-full md:max-w-screen-xl bg-base-100 shadow-xl opacity-85 md:mt-5 mb-8">
        <div className="flex md:grid md:grid-cols-3 items-center justify-center mb-4">
          <div></div>
          <div className="flex justify-start md:justify-center mr-auto md:mr-1 ml-4">
            <h1 className="text-3xl md:text-5xl mt-3">Leaderboard</h1>
          </div>
          <div className="flex justify-end">
            <span className="">
              <AccountSelector />
            </span>
          </div>
        </div>

        <div
          id="solxen-stats"
          className={`grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-center mb-3 mx-4 opacity-0 ${isLoaded ? "fade-in" : ""}`}
        >
          <div className="stat sm:mx-auto bg-accent-content/10 rounded-md shadow trx">
            <div className="stat-title">
              <span className="hidden sm:inline">Total</span> solXEN
            </div>
            <div className="stat-value text-sm md:text-2xl">
              {totalSupplyValue()}
            </div>
          </div>
          <div className="stat bg-accent-content/10 rounded-md shadow">
            <div className="stat-title">
              <span className="hidden sm:inline">Total</span> Hashes
            </div>
            <div className="stat-value text-sm md:text-2xl">
              {totalHashesValue()}
            </div>
          </div>
          <div className="stat bg-accent-content/10 rounded-md shadow">
            <div className="stat-title">
              <span className="hidden sm:inline">Total</span> Super Hashes
            </div>
            <div className="stat-value text-sm md:text-2xl">
              {totalSuperHashesValue()}
            </div>
          </div>
          <div className="stat bg-accent-content/10 rounded-md shadow">
            <div className="stat-title">AMP</div>
            <div className="stat-value text-sm md:text-2xl">{ampValue()}</div>
          </div>
          <div className="stat hidden sm:block bg-accent-content/10 rounded-md shadow">
            <div className="stat-title">
              <span className="hidden sm:inline">Last</span> AMP Slot
            </div>
            <div className="stat-value text-sm md:text-2xl">
              {lastAmpSlotValue()}
            </div>
          </div>
          <div className="stat  hidden sm:block bg-accent-content/10 rounded-md shadow">
            <div className="stat-title">
              <span className="hidden sm:inline">Total</span> TXs
            </div>
            <div className="stat-value text-sm md:text-2xl">{txsValue()}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {data && data.length != 0 ? (
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
                      <tr key={rank} className={`animate-table-row`}>
                        <td className="p-4 pr-0 border-b border-blue-gray-50">
                          <span color="blue-gray" className="font-bold">
                            {rank}
                          </span>
                        </td>
                        <td className="p-4 border-b border-blue-gray-50 text-xs sm:text-base truncate">
                          <span>
                            {showEthAccount ? ethAccount : solAccount}
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
                                  <div className="badge badge-sm badge-secondary badge-outline ml-2">
                                  {percentOfTotalSupply(points)}%
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

      <Footer />
    </main>
  );
}
