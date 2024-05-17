import { useEffect, useState } from "react";
import { fetchStateData } from "@/app/leaderboard/Api";
import { AccountType, useAccountType } from "@/app/hooks/AccountTypeHook";
import { useSearchParams } from "next/navigation";
import { State } from "@/app/leaderboard/StateStats";

const initialState: State = {
  points: BigInt(0),
  solXen: 0,
  hashes: 0,
  superHashes: 0,
  txs: 0,
  amp: 0,
  lastAmpSlot: BigInt(0),
  zeroAmpEta: new Date(),
  nextAmpEta: new Date(),
  avgAmpSecs: 0,
  createdAt: new Date(),
  avgPriorityFee: 0,
  minPriorityFee: 0,
  medianPriorityFee: 0,
  maxPriorityFee: 0,
};

export function useStatsData() {
  const [isLoading, setIsLoading] = useState(true);
  const accountType = useAccountType() as AccountType;
  const searchParams = useSearchParams();
  const [stateData, setStateData]: [State, any] = useState<State>(initialState);

  useEffect(() => {
    const fetchData = async () => {
      fetchStateData().then((data) => {
        setStateData(data);
        setIsLoading(false);
      });
    };

    fetchData().then();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [accountType, searchParams]);

  return [stateData, setStateData, isLoading];
}
