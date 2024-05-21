import { LeaderboardEntry } from "@/app/leaderboard/LeadersTable";
import { AccountType } from "@/app/hooks/AccountTypeHook";
import React, { useEffect } from "react";
import { fetchLeaderboardEntry } from "@/app/leaderboard/Api";
import Link from "next/link";
import { IoReturnUpBackSharp } from "react-icons/io5";
import { CgDanger } from "react-icons/cg";
import { Loader } from "@/app/components/Loader";

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
  setAccountData: (data: LeaderboardEntry | null) => void;
  setFetchError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
  accountAddress: string;
  fetchError: string;
  isLoading: boolean;
}) {
  const accountType = (): AccountType => {
    if (accountAddress.startsWith("0x") && accountAddress.length == 42) {
      return AccountType.Ethereum;
    }
    return AccountType.Solana;
  };

  useEffect(() => {
    fetchLeaderboardEntry(accountAddress)
      .then((data) => {
        setAccountData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setFetchError(err.message);
        setAccountData(null);
        setIsLoading(false);
      });

    return () => {
      setIsLoading(true);
      setAccountData(null);
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

  return (
    <div
      className={`card rounded-none sm:rounded-xl w-full md:max-w-screen-xl bg-base-100 mt-0 md:mt-5 sm:mb-8 shadow-lg drow-shadow-lg opacity-90 fade-in-animation`}
    >
      <Loader isLoading={isLoading} />

      <div className={`card-body px-4 sm:px-6`}>
        <div className="card-title flex mb-6 capitalize">
          <h1 className="text-xl sm:text-4xl mr-auto whitespace-nowrap">
            {accountType()} Account
          </h1>
          <Link
            href={`/leaderboard?account=${accountType().toLowerCase()}`}
            className="btn btn-sm btn-accent"
          >
            <IoReturnUpBackSharp size={20} />
            Leaderboard
          </Link>
        </div>

        <h2 className="font-mono text-xs sm:text-2xl truncate">
          {accountAddress}
        </h2>

        <div className={`opacity-0 ${!isLoading ? "fade-in-slow" : ""}`}>
          {fetchError && (
            <div className="text-center flex justify-center align-middle min-h-[96px]">
              <div className="flex self-center">
                <span className="flex text-5xl font-bold">
                  <CgDanger size={48} className="mr-4" /> {fetchError}
                </span>
              </div>
            </div>
          )}

          {!fetchError && (
            <div
              className={`w-full grid ${accountType() == AccountType.Solana ? "grid-cols-2" : "grid-cols-3"}  md:grid-cols-none md:stats gap-0 sm:gap-1 text-center`}
            >
              <div className="stat px-0 sm:px-4">
                <div className="stat-title">Rank</div>
                <div className="stat-value text-secondary text-lg sm:text-4xl">
                  {rankValue()}
                </div>
              </div>

              <div className="stat px-0 sm:px-4">
                <div className="stat-title">Hashes</div>
                <div className="stat-value text-secondary text-lg sm:text-4xl">
                  {hashesValue()}
                </div>
              </div>

              <div className="stat px-0 sm:px-4">
                <div className="stat-title">Super Hashes</div>
                <div className="stat-value text-secondary text-lg sm:text-4xl">
                  {superHashesValue()}
                </div>
              </div>

              {accountType() == AccountType.Solana ? (
                <div className="stat px-0 sm:px-4">
                  <div className="stat-title">solXEN</div>
                  <div className="stat-value text-secondary text-lg sm:text-4xl">
                    {solXenValue()}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
