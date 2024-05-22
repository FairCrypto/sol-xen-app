import { EventHash } from "@/app/hooks/SolanaEventsHook";
import useThemeColors from "@/app/hooks/ThemeColorHook";
import React, { useEffect, useRef, useState } from "react";
import { AccountType } from "@/app/hooks/AccountTypeHook";
import useChartData from "@/app/hooks/ChartDataHook";
import {
  ChartUnit,
  fetchAccountStateHistory,
  fetchHashEventStats,
} from "@/app/Api";
import BarChart from "@/app/components/BarChart";
import { Loader } from "@/app/components/Loader";
import {
  ChartUnitSelector,
  endTime,
  startTime,
  unit,
} from "@/app/components/ChartUnitSelector";
import { useChartSelector } from "@/app/hooks/ChartSelector";

export function AccountCharts({
  accountAddress,
  eventHashes,
}: {
  accountAddress: string;
  eventHashes?: EventHash[];
}) {
  const [themeColors, alphaColor] = useThemeColors();
  const [isChartsLoading, setIsChartsLoading] = useState(true);
  const [chartUnit, setChartUnit] = useChartSelector();
  const [prevChartUnitStateHistory, setPrevChartUnitStateHistory] =
    useState<ChartUnit>();
  const [prevChartUnitHashEvents, setPrevChartUnitHashEvents] =
    useState<ChartUnit>();

  const accountType = (): AccountType => {
    if (accountAddress.startsWith("0x") && accountAddress.length == 42) {
      return AccountType.Ethereum;
    }
    return AccountType.Solana;
  };

  const maxTimeInSeconds = (): number => {
    switch (chartUnit) {
      case "hour":
        return 60 * 60;
    }
    return 24 * 60 * 60;
  };

  const [
    hashes,
    setMappedHashesData,
    updateMappedHashesData,
    incrementsMappedHashesData,
  ] = useChartData({ maxTimeSeconds: maxTimeInSeconds() });

  const [
    superHashes,
    setMappedSuperHashesData,
    updateMappedSuperHashesData,
    incrementsMappedSuperHashesData,
  ] = useChartData({ maxTimeSeconds: maxTimeInSeconds() });

  const [
    solXen,
    setMappedSolXenData,
    updateMappedSolXenData,
    incrementsMappedSolXenData,
  ] = useChartData({ maxTimeSeconds: maxTimeInSeconds() });

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

  const firstUpdateStateHistory = useRef(true);
  const firstUpdateHashEvents = useRef(true);
  useEffect(() => {
    const fetchData = async () => {
      if (!chartUnit) {
        return;
      }

      if (prevChartUnitStateHistory && chartUnit != prevChartUnitStateHistory) {
        setIsChartsLoading(true);
        setMappedHashesData(new Map());
        setMappedSuperHashesData(new Map());
      }

      if (prevChartUnitHashEvents && chartUnit != prevChartUnitHashEvents) {
        setMappedSolXenData(new Map());
      }

      fetchAccountStateHistory(
        accountAddress,
        startTime(chartUnit),
        endTime(chartUnit),
        unit(chartUnit),
      ).then((accountStateDeltas) => {
        if (accountStateDeltas.length == 0) {
          return;
        }

        const newHashes = new Map<number, number>();
        const newSuperHashes = new Map<number, number>();

        for (const stat of accountStateDeltas) {
          const truncatedDate = new Date(stat.createdAt);
          truncatedDate.setMilliseconds(0);
          truncatedDate.setSeconds(0);
          const numHashes = Number(stat.hashesDelta);
          if (numHashes >= 0)
            newHashes.set(truncatedDate.getTime(), Number(stat.hashesDelta));
          newSuperHashes.set(truncatedDate.getTime(), stat.superHashesDelta);
        }

        if (
          firstUpdateStateHistory.current ||
          chartUnit != prevChartUnitStateHistory
        ) {
          setMappedHashesData(newHashes);
          setMappedSuperHashesData(newSuperHashes);
          firstUpdateStateHistory.current = false;
        } else {
          // all subsequent fetches should update the mapped data
          // to avoid real-time updates.
          updateMappedHashesData(newHashes);
          updateMappedSuperHashesData(newSuperHashes);
        }

        setIsChartsLoading(false);
        setPrevChartUnitStateHistory(chartUnit);
      });

      fetchHashEventStats(
        accountAddress,
        startTime(chartUnit),
        endTime(chartUnit),
        unit(chartUnit),
      ).then((hashEvents) => {
        if (accountAddress.length == 0) {
          return;
        }

        const newSolXen = new Map<number, number>();

        for (const stat of hashEvents) {
          const truncatedDate = new Date(stat.createdAt);
          truncatedDate.setMilliseconds(0);
          truncatedDate.setSeconds(0);
          if (stat.solXen != undefined) {
            newSolXen.set(
              truncatedDate.getTime(),
              Number(stat.solXen / 1_000_000_000n),
            );
          }
        }

        if (
          firstUpdateStateHistory.current ||
          chartUnit != prevChartUnitHashEvents
        ) {
          setMappedSolXenData(newSolXen);
          firstUpdateHashEvents.current = false;
        } else {
          // all subsequent fetches should update the mapped data
          // to avoid real-time updates.
          updateMappedSolXenData(newSolXen);
        }

        setPrevChartUnitHashEvents(chartUnit);
        setIsChartsLoading(false);
      });
    };

    fetchData().then();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [
    firstUpdateStateHistory,
    firstUpdateHashEvents,
    accountAddress,
    chartUnit,
  ]);

  // Update the mapped data when a new event is received
  useEffect(() => {
    if (!isChartsLoading && chartUnit == "hour") {
      if (eventHashes && eventHashes.length > 0) {
        const { newEventHashes, newSuperHashes, newSolXen } =
          eventHashes.reduce(
            (acc, eventHash) => {
              acc.newEventHashes += eventHash.hashes;
              acc.newSuperHashes += eventHash.superhashes;
              acc.newSolXen += eventHash.points / 1_000_000_000;
              return acc;
            },
            { newEventHashes: 0, newSuperHashes: 0, newSolXen: 0 },
          );

        if (newEventHashes) {
          incrementsMappedHashesData(newEventHashes);
        }

        if (newEventHashes) {
          incrementsMappedSuperHashesData(newSuperHashes);
        }

        if (newSolXen) {
          incrementsMappedSolXenData(newSolXen);
        }
      }
    }
  }, [eventHashes, accountAddress]);

  return (
    <div
      className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-xl bg-base-100 sm:mb-8 shadow-lg drow-shadow-lg opacity-90 fade-in-animation`}
    >
      <Loader isLoading={isChartsLoading} />

      <div
        className={`card-body sm:py-6 px-3 sm:px-6 ${isChartsLoading ? "fade-out" : "fade-in"}`}
      >
        <div className="card-title">
          <h2 className="mr-auto">Real Time Mining Stats</h2>
          <ChartUnitSelector
            setChartUnit={setChartUnit}
            chartUnit={chartUnit}
          />
        </div>

        <div className="grid grid-cols-1  gap-6">
          <div className="h-[200px] sm:h-[220px]">
            <BarChart datasets={hashesDataset()} />
          </div>

          <div className="h-[180px] sm:h-[220px]">
            <BarChart datasets={superHashesDataset()} />
          </div>

          {accountType() == AccountType.Solana && (
            <div className="h-[200px] sm:h-[220px]">
              <BarChart datasets={solXenDataset()} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
