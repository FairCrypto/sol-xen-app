import { useEffect, useState } from "react";
import {
  fetchLeaderboardData,
  generateLeaderboardIndex,
  LeaderboardEntry,
} from "@/app/Api";
import { AccountType, useAccountType } from "@/app/hooks/AccountTypeHook";
import { useSearchParams } from "next/navigation";

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

  useEffect(() => {
    const fetchData = async () => {
      setIsUpdating(true);
      fetchLeaderboardData(accountType).then((data: LeaderboardEntry[]) => {
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
    };

    fetchData().then();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [accountType, searchParams]);

  return [leaderboardData, setLeaderboardData, leaderboardIndex, isLoading];
}
