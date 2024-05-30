import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export enum LeaderBoardSort {
  Rank = "rank",
  Hashes = "hashes",
  SuperHashes = "superHashes",
  HashRate = "hashRate",
  SolXen = "solXen",
}

export function useLeaderboardSort(): [
  LeaderBoardSort,
  (sort: LeaderBoardSort) => void,
] {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [sortBy, setSortBy] = useState<LeaderBoardSort>(
    getSortFromSearchParams(searchParams),
  );

  function getSortFromSearchParams(
    searchParams: URLSearchParams,
  ): LeaderBoardSort {
    switch (searchParams.get("sort")) {
      case LeaderBoardSort.Rank:
        return LeaderBoardSort.Rank;
      case LeaderBoardSort.Hashes:
        return LeaderBoardSort.Hashes;
      case LeaderBoardSort.SuperHashes:
        return LeaderBoardSort.SuperHashes;
      case LeaderBoardSort.HashRate:
        return LeaderBoardSort.HashRate;
      case LeaderBoardSort.SolXen:
        return LeaderBoardSort.SolXen;
      default:
        return LeaderBoardSort.Rank;
    }
  }

  function setSort(sort: LeaderBoardSort) {
    const url = new URL(window.location.href);
    url.searchParams.set("sort", sort);
    replace(url.toString());
  }

  useEffect(() => {
    setSortBy(getSortFromSearchParams(searchParams));
  }, [searchParams]);

  return [sortBy, setSort];
}
