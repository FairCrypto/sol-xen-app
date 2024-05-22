import { EventHash } from "@/app/hooks/SolanaEventsHook";
import useThemeColors from "@/app/hooks/ThemeColorHook";
import React, { useEffect, useRef, useState } from "react";
import { AccountType } from "@/app/hooks/AccountTypeHook";
import useChartData from "@/app/hooks/ChartDataHook";
import { fetchHashEventStats } from "@/app/leaderboard/Api";
import BarChart from "@/app/components/BarChart";
import colors from "tailwindcss/colors";
import { Loader } from "@/app/components/Loader";

export function AccountCharts({
  accountAddress,
  eventHashes,
}: {
  accountAddress: string;
  eventHashes?: EventHash[];
}) {
  const [themeColors, alphaColor] = useThemeColors();
  const [isChartsLoading, setIsChartsLoading] = useState(true);

  const accountType = (): AccountType => {
    if (accountAddress.startsWith("0x") && accountAddress.length == 42) {
      return AccountType.Ethereum;
    }
    return AccountType.Solana;
  };

  const [
    hashes,
    setMappedHashesData,
    updateMappedHashesData,
    incrementsMappedHashesData,
  ] = useChartData();

  const [
    superHashes,
    setMappedSuperHashesData,
    updateMappedSuperHashesData,
    incrementsMappedSuperHashesData,
  ] = useChartData();

  const [
    solXen,
    setMappedSolXenData,
    updateMappedSolXenData,
    incrementsMappedSolXenData,
  ] = useChartData();

  const [txs, setMappedTxsData, updateMappedTxsData, incrementsMappedTxsData] =
    useChartData();

  const primaryColor = alphaColor(themeColors?.primary, 60);
  const accentColor = alphaColor(themeColors?.accent, 60);
  const secondaryColor = alphaColor(themeColors?.secondary, 60);
  const warningColor = alphaColor(colors.orange["300"], 60);

  const hashesDataset = () => [
    {
      label: "Hashes",
      data: hashes,
      borderColor: primaryColor,
      backgroundColor: primaryColor,
      borderWidth: 1,
    },
  ];

  const superHashesDataset = () => [
    {
      label: "Super Hashes",
      data: superHashes,
      borderColor: accentColor,
      backgroundColor: accentColor,
      borderWidth: 1,
    },
  ];

  const solXenDataset = () => [
    {
      label: "solXEN",
      data: solXen,
      borderColor: secondaryColor,
      backgroundColor: secondaryColor,
      borderWidth: 1,
    },
  ];

  const txsDataset = () => [
    {
      label: "TXs",
      data: txs,
      borderColor: warningColor,
      backgroundColor: warningColor,
      borderWidth: 1,
    },
  ];

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
        const newTxs = new Map<number, number>();

        for (const stat of hashEventStats) {
          const truncatedDate = new Date(stat.createdAt);
          truncatedDate.setMilliseconds(0);
          truncatedDate.setSeconds(0);
          newHashes.set(truncatedDate.getTime(), Number(stat.hashes));
          newSuperHashes.set(truncatedDate.getTime(), Number(stat.superHashes));
          newSolXen.set(truncatedDate.getTime(), Number(stat.solXen));
          newTxs.set(truncatedDate.getTime(), Number(stat.txs));
        }

        if (firstUpdate.current) {
          setMappedHashesData(newHashes);
          setMappedSuperHashesData(newSuperHashes);
          setMappedSolXenData(newSolXen);
          setMappedTxsData(newTxs);
          firstUpdate.current = false;
        } else {
          // all subsequent fetches should update the mapped data
          // to avoid real-time updates.
          updateMappedHashesData(newHashes);
          updateMappedSuperHashesData(newSuperHashes);
          updateMappedSolXenData(newSolXen);
          updateMappedTxsData(newTxs);
        }

        setIsChartsLoading(false);
      });
    };

    fetchData().then();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [firstUpdate, accountAddress]);

  // Update the mapped data when a new event is received
  useEffect(() => {
    if (eventHashes && eventHashes.length > 0) {
      eventHashes.forEach((eventHash) => {
        incrementsMappedHashesData(eventHash.hashes);
        incrementsMappedSuperHashesData(eventHash.superhashes);
        incrementsMappedSolXenData(Number(eventHash.points) / 1_000_000_000);
        incrementsMappedTxsData(1);
      });
    }
  }, [eventHashes, accountAddress]);

  return (
    <div
      className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-xl bg-base-100 sm:mb-8 shadow-lg drow-shadow-lg opacity-90 fade-in-animation`}
    >
      <Loader isLoading={isChartsLoading} />

      <div className={`card-body sm:py-6 px-3 sm:px-6`}>
        <div className="card-title">Real Time Mining Stats</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="h-[200px] sm:h-[240px]">
            <BarChart datasets={hashesDataset()} />
          </div>

          <div className="h-[180px] sm:h-[240px]">
            <BarChart datasets={superHashesDataset()} />
          </div>

          {accountType() == AccountType.Solana && (
            <div className="h-[200px] sm:h-[240px]">
              <BarChart datasets={solXenDataset()} />
            </div>
          )}

          <div
            className={`h-[180px] sm:h-[240px] ${accountType() == AccountType.Ethereum && "sm:col-span-2"}`}
          >
            <BarChart datasets={txsDataset()} />
          </div>
        </div>
      </div>
    </div>
  );
}
