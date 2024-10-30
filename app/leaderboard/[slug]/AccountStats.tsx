import { AccountType } from "@/app/hooks/AccountTypeHook";
import React, { useEffect } from "react";
import { fetchLeaderboardEntry, LeaderboardEntry } from "@/app/Api";
import Link from "next/link";
import { IoReturnUpBackSharp } from "react-icons/io5";
import { Loader } from "@/app/components/Loader";
import { humanizeHashRate } from "@/app/utils";
import { useLeaderboardSort } from "@/app/hooks/LeaderBoardSortHook";
import { useLeaderboardPage } from "@/app/hooks/LeaderBoardPageHook";

export function AccountStats({
  accountData,
  setAccountData,
  setIsLoading,
  setFetchError,
  accountAddress,
  fetchError,
  isLoading,
}: {
  accountData: LeaderboardEntry | null;
  setAccountData: (data: LeaderboardEntry) => void;
  setFetchError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
  accountAddress: string;
  fetchError: string;
  isLoading: boolean;
}) {
  const [sortBy, setSortBy] = useLeaderboardSort();
  const [page, setPage] = useLeaderboardPage();

  const accountType = (): AccountType => {
    if (accountAddress.startsWith("0x") && accountAddress.length == 42) {
      return AccountType.Ethereum;
    }
    return AccountType.Solana;
  };

  useEffect(() => {
    const fetchData = async () => {
      fetchLeaderboardEntry(accountAddress)
        .then((data) => {
          setAccountData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setFetchError(err.message);
          setIsLoading(false);
        });
    };

    fetchData().then();
    const interval = setInterval(fetchData, 30000);

    return () => {
      setIsLoading(true);
      clearInterval(interval);
    };
  }, [accountAddress]);

  const solXenValue = () => {
    if (!accountData?.solXen) {
      return "0";
    }
    return Intl.NumberFormat("en-US").format(
      Number(accountData.solXen / BigInt(10 ** 9)),
    );
  };

  const hashesValue = () => {
    if (!accountData) {
      return "0";
    }
    return Intl.NumberFormat("en-US").format(accountData.hashes);
  };

  const superHashesValue = () => {
    if (!accountData) {
      return "0";
    }
    return Intl.NumberFormat("en-US").format(accountData.superHashes);
  };

  const rankValue = () => {
    if (!accountData) {
      return "0";
    }
    return Intl.NumberFormat("en-US").format(accountData.rank);
  };

  function timeAgo(date: Date): string {
    if (!date) {
      return "";
    }

    const now = new Date();
    const secondsPast = (now.getTime() - date.getTime()) / 1000;

    if (secondsPast < 180) {
      return ``;
    } else if (secondsPast < 3600) {
      return `${Math.floor(secondsPast / 60)} minutes ago`;
    } else if (secondsPast < 86400) {
      return `${Math.floor(secondsPast / 3600)} hours ago`;
    } else if (secondsPast < 2592000) {
      if (Math.floor(secondsPast / 86400) == 1) return "1 day ago";
      return `${Math.floor(secondsPast / 86400)} days ago`;
    } else if (secondsPast < 31536000) {
      return `${Math.floor(secondsPast / 2592000)} months ago`;
    } else {
      return `${Math.floor(secondsPast / 31536000)} years ago`;
    }
  }

  return (
    <div
      className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-xl bg-base-100 mt-0 md:mt-5 sm:mb-8 shadow-lg drop-shadow-lg opacity-90 fade-in-animation`}
    >
      <Loader isLoading={isLoading} />

      <div className={`card-body px-4 sm:px-6`}>
        <div className="card-title flex mb-6 capitalize">
          <h1 className="text-xl sm:text-4xl mr-auto whitespace-nowrap">
            {accountType()} Account
          </h1>
          <Link
            href={`/leaderboard?account=${accountType().toLowerCase()}&sort=${sortBy}&page=${page}`}
            className="btn btn-sm btn-accent"
          >
            <IoReturnUpBackSharp size={20} />
            Leaderboard
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row align-middle mb-3">
          <h2 className="flex self-start font-mono text-[.8rem] sm:text-2xl truncate mr-auto">
            {accountAddress}
          </h2>

          <span className="lg:self-end pb-1 mr-1 mt-1 lg:mt-0">
            {timeAgo(accountData?.lastActive || new Date()) && (
              <span>
                Last seen {timeAgo(accountData?.lastActive || new Date())}
              </span>
            )}
          </span>
        </div>

        <div className={`opacity-0 ${!isLoading ? "fade-in-slow" : ""}`}>
          {fetchError && (
            <div className="mt-3">
              {fetchError == "Account not found" ? (
                <div className="alert alert-warning w-full opacity-70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>
                    Warning! Account not found - Please start mining and check
                    back.
                  </span>
                </div>
              ) : (
                <div className="alert alert-error w-full opacity-70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Error! {fetchError}</span>
                </div>
              )}
            </div>
          )}

          {!fetchError && (
            <div
              className={`w-full grid grid-cols-2 md:grid-cols-none md:stats gap-0 sm:gap-1 text-center`}
            >
              <div className="stat px-0 sm:px-4">
                <div className="stat-title">Rank</div>
                <div className="stat-value text-secondary text-lg font-mono sm:text-3xl">
                  {rankValue()}
                </div>
              </div>

              <div className="stat px-0 sm:px-4">
                <div className="stat-title">Hashes</div>
                <div className="stat-value text-secondary text-lg font-mono sm:text-3xl">
                  {hashesValue()}
                </div>
              </div>

              <div className="stat px-0 sm:px-4">
                <div className="stat-title">Super Hashes</div>
                <div className="stat-value text-secondary text-lg font-mono sm:text-3xl">
                  {superHashesValue()}
                </div>
              </div>

              {accountType() == AccountType.Solana ? (
                <>
                  <div className="hidden lg:block stat px-0 sm:px-4">
                    <div className="stat-title">Hash Rate</div>
                    <div className="stat-value text-secondary text-lg font-mono sm:text-3xl">
                      {humanizeHashRate(accountData?.hashRate || 0)}
                    </div>
                  </div>
                  <div className="stat px-0 sm:px-4">
                    <div className="stat-title">solXEN</div>
                    <div className="stat-value text-secondary text-lg font-mono sm:text-3xl">
                      {solXenValue()}
                    </div>
                  </div>
                </>
              ) : (
                <div className="stat px-0 sm:px-4">
                  <div className="stat-title">Hash Rate</div>
                  <div className="stat-value text-secondary text-lg font-mono sm:text-3xl">
                    {humanizeHashRate(accountData?.hashRate || 0)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
