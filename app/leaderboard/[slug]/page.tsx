"use client";

import {Background} from "@/app/leaderboard/Background";
import {NavBar} from "@/app/components/NavBar";
import React, {useEffect, useRef, useState} from "react";
import Footer from "@/app/components/Footer";
import {
  fetchAssociatedEthAccounts,
  fetchAssociatedSolAccounts,
  fetchHashEventStats,
  fetchLeaderboardEntry,
  generateLeaderboardIndex
} from "@/app/leaderboard/Api";
import {CgDanger} from "react-icons/cg";
import {LeaderboardEntry, LeadersTable} from "@/app/leaderboard/LeadersTable";
import Link from "next/link";
import {IoReturnUpBackSharp} from "react-icons/io5";
import {EventHash, useSolanaEvents} from "@/app/hooks/SolanaEventsHook";
import {AccountType, AccountTypeTitleCase} from "@/app/hooks/AccountTypeHook";
import useThemeColors from "@/app/hooks/ThemeColorHook";
import BarChart from "@/app/components/BarChart";
import useChartData from "@/app/hooks/ChartDataHook";

export default function LeaderboardSlug({
  params,
}: {
  params: { slug: string };
}) {
  const [themeColors, alphaColor] = useThemeColors();
  const [accountData, setAccountData] = useState<LeaderboardEntry>();
  const [accountAddress, setAccountAddress] = useState<string>(params.slug);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartsLoading, setIsChartsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>();
  const [hashes, setMappedHashesData, updateMappedHashesData, incrementsMappedHashesData] = useChartData();
  const [superHashes, setMappedSuperHashesData, updateMappedSuperHashesData, incrementsMappedSuperHashesData] = useChartData();
  const [solXen, setMappedSolXenData, updateMappedSolXenData, incrementsMappedSolXenData] = useChartData();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [leaderboardIndex, setLeaderboardIndex]: [any, any] = useState<
    Map<string, LeaderboardEntry>
  >(new Map());

  const accountType = (account: string): AccountTypeTitleCase => {
    if (account.startsWith("0x") && account.length == 42) {
      return AccountTypeTitleCase.Ethereum;
    }
    return AccountTypeTitleCase.Solana;
  }

  const associatedAccountType = () => accountType(accountAddress) == AccountTypeTitleCase.Ethereum ? AccountTypeTitleCase.Solana: AccountTypeTitleCase.Ethereum;
  const associatedAccountTypeLower = () => accountType(accountAddress) == AccountTypeTitleCase.Ethereum ? AccountType.Solana: AccountType.Ethereum;

  // Handle Solana events for the account
  // update the account data when a new event is received
  useSolanaEvents({
    handleEvent: (eventHash: EventHash) => {
      const account =
        accountType(accountAddress) == AccountTypeTitleCase.Solana
          ? eventHash.user.toBase58()
          : "0x" + Buffer.from(eventHash.ethAccount).toString("hex");

      const otherAccount =
        accountType(accountAddress) == AccountTypeTitleCase.Ethereum
          ? eventHash.user.toBase58()
          : "0x" + Buffer.from(eventHash.ethAccount).toString("hex");

      if (
        leaderboardIndex[otherAccount] != undefined &&
        (eventHash.hashes > 0 ||
          eventHash.superhashes > 0)
      ) {
        const index = leaderboardIndex[otherAccount];
        leaderboardData[index].points += BigInt(
          "0x" + eventHash.points.toString("hex"),
        );
        leaderboardData[index].hashes += eventHash.hashes;
        leaderboardData[index].superHashes += eventHash.superhashes;
        setLeaderboardData([...leaderboardData]);
      }

      if (account == accountAddress) {
        // console.log("Event for account", accountAddress);
        const newAccountData = Object.assign({}, accountData);
        const points = BigInt("0x" + eventHash.points.toString("hex"));
        newAccountData.points += points;
        newAccountData.hashes += eventHash.hashes;
        newAccountData.superHashes += eventHash.superhashes;
        setAccountData(newAccountData);

        incrementsMappedHashesData(new Date(), eventHash.hashes);
        incrementsMappedSuperHashesData(new Date(), eventHash.superhashes);
        incrementsMappedSolXenData(new Date(), Number(points) / 1_000_000_000);
      }
    },
  });

  useEffect(() => {
    fetchLeaderboardEntry(accountAddress)
      .then((data) => {
        setAccountData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setFetchError(err.message);
        setAccountData(undefined);
        setIsLoading(false);
      });

    return () => {
      setIsLoading(true);
      setAccountData(undefined);
    };
  }, [accountAddress]);

  const firstUpdate = useRef(true);
  useEffect(() => {
    const fetchData = async () => {
      fetchHashEventStats(accountAddress).then((hashEventStats) => {
        if (hashEventStats.length == 0) {
          return;
        }

        const newHashes = new Map<number, number>();
        const newSuperHashes = new Map<number, number>();
        const newSolXen = new Map<number, number>();

        for (const stat of hashEventStats) {
          const truncatedDate = new Date(stat.createdAt);
          truncatedDate.setMilliseconds(0);
          truncatedDate.setSeconds(0);
          newHashes.set(truncatedDate.getTime(), stat.hashes);
          newSuperHashes.set(truncatedDate.getTime(), stat.superHashes);
          newSolXen.set(truncatedDate.getTime(), stat.solXen);
        }

        if (firstUpdate.current) {
          setMappedHashesData(newHashes)
          setMappedSuperHashesData(newSuperHashes)
          setMappedSolXenData(newSolXen)
          firstUpdate.current = false;
        } else {
          // all subsequent fetches should update the mapped data
          // to avoid real-time updates.
          updateMappedHashesData(newHashes);
          updateMappedSuperHashesData(newSuperHashes);
          updateMappedSolXenData(newSolXen);
        }

        setIsChartsLoading(false);
      });
    };

    fetchData().then();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [firstUpdate, accountAddress]);

  useEffect(() => {
    if (accountType(accountAddress) == AccountTypeTitleCase.Ethereum) {
      fetchAssociatedSolAccounts(accountAddress).then((data) => {
        const idxData = generateLeaderboardIndex(data, AccountType.Solana);
        console.log("Fetched associated sol accounts", data, idxData);
        setLeaderboardData(data);
        setLeaderboardIndex(idxData);
      });
    } else {
      fetchAssociatedEthAccounts(accountAddress).then((data) => {
        const idxData = generateLeaderboardIndex(data, AccountType.Ethereum);
        console.log("Fetched associated eth accounts", data, idxData);
        setLeaderboardData(data);
        setLeaderboardIndex(idxData);
      });
    }
  }, [accountAddress]);

  const solXenValue = () => {
    if (!accountData?.points) {
      return 0;
    }
    return Intl.NumberFormat("en-US").format(
      Number(accountData.points / BigInt(10 ** 9)),
    );
  };

  const hashesValue = () => {
    if (!accountData) {
      return 0;
    }
    return Intl.NumberFormat("en-US").format(accountData.hashes);
  };

  const superHashesValue = () => {
    if (!accountData) {
      return 0;
    }
    return Intl.NumberFormat("en-US").format(accountData.superHashes);
  };

  const rankValue = () => {
    if (!accountData) {
      return 0;
    }
    return Intl.NumberFormat("en-US").format(accountData.rank);
  };

  const primaryColor = alphaColor(themeColors?.primary, 60);
  const accentColor = alphaColor(themeColors?.accent, 60);
  const secondaryColor = alphaColor(themeColors?.secondary, 60);

  const hashesDataset = () => [
    {
      label: "Hashes",
      data: hashes,
      borderColor: primaryColor,
      backgroundColor: primaryColor,
      borderWidth: 1,
    }
  ];

  const superHashesDataset = () => [
    {
      label: "Super Hashes",
      data: superHashes,
      borderColor: accentColor,
      backgroundColor: accentColor,
      borderWidth: 1,
    }
  ];

  const solXenDataset = () => [
    {
      label: "solXEN",
      data: solXen,
      borderColor: secondaryColor,
      backgroundColor: secondaryColor,
      borderWidth: 1,
    }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Background isLoading={isLoading}/>
      <NavBar/>

      <div
        className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-lg bg-base-100 mt-0 md:mt-5 sm:mb-8 opacity-0 drop-shadow-md ${!isChartsLoading && !isLoading ? "fade-in-trans" : ""}`}
      >
        <div className="card-body">
          <div className="card-title flex">
            <h1 className="text-2xl sm:text-4xl mr-auto mb-6">{accountType(accountAddress)} Account</h1>
            <Link
              href={`/leaderboard?account=${accountType(accountAddress).toLowerCase()}`}
              className="btn btn-sm btn-accent"
            >
              <IoReturnUpBackSharp size={20}/>
              Leaderboard
            </Link>
          </div>
          <h2 className="font-mono text-xs sm:text-2xl truncate">{accountAddress}</h2>

          {!isLoading && !accountData ? (
            <div className="text-center my-20 flex justify-center align-middle">
              <CgDanger size={48} className="mr-4"/>
              <span className="text-5xl font-bold mb-3"> {fetchError}</span>
            </div>
          ) : null}

          {!isLoading && accountData ? (
            <div className="grid grid-cols-2 sm:grid-cols-none sm:stats gap-1 my-1 sm:my-5 text-center">
              <div className="stat">
                <div className="stat-title">Rank</div>
                <div className="stat-value text-secondary text-lg sm:text-4xl">{rankValue()}</div>
              </div>

              <div className="stat">
                <div className="stat-title">Hashes</div>
                <div className="stat-value text-secondary text-lg sm:text-4xl">{hashesValue()}</div>
              </div>

              <div className="stat">
                <div className="stat-title">Super Hashes</div>
                <div className="stat-value text-secondary text-lg sm:text-4xl">
                  {superHashesValue()}
                </div>
              </div>

              {accountType(accountAddress) == AccountTypeTitleCase.Solana ? (
                <div className="stat">
                  <div className="stat-title">solXEN</div>
                  <div className="stat-value text-secondary text-lg sm:text-4xl">
                    {solXenValue()}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

        </div>
      </div>

      <div
        className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-lg bg-base-100 sm:mb-8 opacity-0 drop-shadow-md ${!isChartsLoading && !isLoading ? "fade-in-trans" : ""}`}
      >
        <div className="card-body">
          <div className="card-title">
            Real Time Mining Stats
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="h-[200px] sm:h-[240px]"><BarChart datasets={hashesDataset()}/></div>
            <div className="h-[20px] sm:h-[240px]"><BarChart datasets={superHashesDataset()}/></div>

            {accountType(accountAddress) == AccountTypeTitleCase.Solana && (
              <div className="h-[200px] sm:h-[240px]"><BarChart datasets={solXenDataset()}/></div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-lg bg-base-100 sm:mb-8 opacity-0 drop-shadow-md ${!isChartsLoading && !isLoading ? "fade-in-trans" : ""}`}
      >
        <div className="card-body">
          <div className="card-title">
            Associated {associatedAccountType()} Accounts
          </div>

          <LeadersTable accountType={associatedAccountTypeLower()} isLoading={isLoading} leaderboardData={leaderboardData} hideSearch={true}/>
        </div>
      </div>

      <Footer/>
    </main>
);
}
