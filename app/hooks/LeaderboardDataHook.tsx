import {LeaderboardEntry} from "@/app/leaderboard/LeadersTable";
import {useEffect, useState} from "react";
import {fetchLeaderboardData, fetchStateData, generateLeaderboardIndex} from "@/app/leaderboard/Api";
import {AccountType, useAccountType} from "@/app/hooks/AccountTypeHook";
import {useSearchParams} from "next/navigation";

export function useLeaderboardData() {
  const [leaderboardData, setLeaderboardData]: [LeaderboardEntry[], (data: LeaderboardEntry[]) => void] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const accountType = useAccountType() as AccountType;
  const searchParams = useSearchParams();
  const [leaderboardIndex, setLeaderboardIndex]: [any, any] = useState<
    Map<string, LeaderboardEntry>
  >(new Map());

  useEffect(() => {
    const fetchData = async () => {
      fetchLeaderboardData(accountType).then((data: LeaderboardEntry[]) => {
        const idxData = generateLeaderboardIndex(data, accountType);
        setLeaderboardData(data);
        setLeaderboardIndex(idxData);
        setIsLoading(false);
        // console.log("Fetched leaderboard data", data, idxData);
      });
    };

    fetchData().then();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [accountType, searchParams]);


  return [leaderboardData, setLeaderboardData, leaderboardIndex, isLoading]
}
