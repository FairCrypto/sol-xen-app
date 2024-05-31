import { useEffect, useState } from "react";
import {
  fetchLeaderboardData,
  generateLeaderboardIndex,
  LeaderboardEntry,
} from "@/app/Api";
import { AccountType, useAccountType } from "@/app/hooks/AccountTypeHook";
import { useSearchParams } from "next/navigation";
import {
  LeaderBoardSort,
  useLeaderboardSort,
} from "@/app/hooks/LeaderBoardSortHook";
import { useLeaderboardPage } from "@/app/hooks/LeaderBoardPageHook";

enum Order {
  Asc = "asc",
  Desc = "desc",
}

export function order(sort: LeaderBoardSort): Order {
  switch (sort) {
    case LeaderBoardSort.Rank:
      return Order.Asc;
    default:
      return Order.Desc;
  }
}

export function useLeaderboardData() {
  const [leaderboardData, setLeaderboardData]: [
    LeaderboardEntry[],
    (data: LeaderboardEntry[]) => void,
  ] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(true);
  const accountType = useAccountType() as AccountType;
  const searchParams = useSearchParams();
  const [leaderboardIndex, setLeaderboardIndex]: [any, any] = useState<
    Map<string, LeaderboardEntry>
  >(new Map());
  const [sortBy, setSortBy] = useLeaderboardSort();
  const [prevSortBy, prevSetSortBy] = useState(sortBy);
  const [page, setPage] = useLeaderboardPage();
  const [prevPage, setPrevPage] = useState(page);

  useEffect(() => {
    if (prevSortBy !== sortBy) {
      setPage(1);
    }

    const fetchData = async () => {
      setIsUpdating(true);
      fetchLeaderboardData(
        accountType,
        100,
        (page - 1) * 100,
        sortBy,
        order(sortBy),
      ).then((data: LeaderboardEntry[]) => {
        const idxData = generateLeaderboardIndex(
          data,
          accountType == AccountType.Ethereum,
        );
        setLeaderboardData(data);
        setLeaderboardIndex(idxData);
        setIsLoading(false);
        setIsUpdating(false);
        // console.log("Fetched leaderboard data", data, idxData);
      });

      prevSetSortBy(sortBy);
      setPrevPage(page);
    };

    fetchData().then();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [accountType, page, sortBy]);

  return [
    leaderboardData,
    setLeaderboardData,
    leaderboardIndex,
    isLoading,
    isUpdating,
    page,
    setPage,
    sortBy,
    setSortBy,
  ];
}
