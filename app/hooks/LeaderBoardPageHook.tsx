import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useLeaderboardPage(): [number, (page: number) => void] {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const [page, setPageLocal] = useState<number>(
    getPageFromSearchParams(searchParams),
  );

  function getPageFromSearchParams(searchParams: URLSearchParams): number {
    const page = Number(searchParams.get("page"));
    if (page < 1) {
      return 1;
    }
    return page;
  }

  function setPage(page: number) {
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(page));
    window.history.pushState({}, "", url.toString());
  }

  useEffect(() => {
    setPageLocal(getPageFromSearchParams(searchParams));
  }, [searchParams]);

  return [page, setPage];
}
