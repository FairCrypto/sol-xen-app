import React, { useCallback, useContext, useState } from "react";
import { State } from "@/app/leaderboard/StateStats";
import { useRouter } from "next/navigation";
import { AccountType } from "@/app/hooks/AccountTypeHook";
import { CiSearch } from "react-icons/ci";
import { LeaderboardEntry } from "@/app/Api";
import { humanizeHashRate } from "@/app/utils";
import {
  LeaderBoardSort,
  useLeaderboardSort,
} from "@/app/hooks/LeaderBoardSortHook";
import { GoDotFill } from "react-icons/go";

interface LeadersTableProps {
  accountType: AccountType;
  isLoading: boolean;
  leaderboardData: LeaderboardEntry[];
  stateData?: State | LeaderboardEntry;
  hideSearch?: boolean;
}

enum Status {
  Online = "Online",
  Idle = "Idle",
  Offline = "Offline",
}

const status = (lastActive: Date): Status => {
  if (!lastActive) {
    return Status.Online;
  }
  if (Date.now() - lastActive.getTime() < 60 * 60 * 1000) {
    return Status.Online;
  }
  if (Date.now() - lastActive.getTime() < 12 * 60 * 60 * 1000) {
    return Status.Idle;
  }
  return Status.Offline;
};

const statusColor = (lastActive: Date) => {
  if (status(lastActive) === Status.Online) {
    return `fill-success stroke-success`;
  }

  if (status(lastActive) === Status.Idle) {
    return `fill-warning stroke-warning`;
  }

  return `fill-error stroke-error`;
};

const statusBgColor = (lastActive: Date) => {
  if (status(lastActive) === Status.Online) {
    return `bg-success/10 xl:bg-transparent`;
  }

  if (status(lastActive) === Status.Idle) {
    return `bg-warning/10 xl:bg-transparent`;
  }

  return `bg-error/10 xl:bg-transparent`;
};

const statusMessage = (lastActive: Date) => {
  if (status(lastActive) === Status.Online) {
    return "Online";
  }

  if (status(lastActive) === Status.Idle) {
    return "Idle for over 1 hour";
  }

  return "Offline for over 12 hours";
};

export function LeadersTable({
  accountType,
  isLoading,
  leaderboardData,
  stateData,
  hideSearch,
}: LeadersTableProps) {
  const { push } = useRouter();
  const [searchInput, setSearchInput] = useState<string>("");
  const changeSearchBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };
  const [sortBy, setSortBy] = useLeaderboardSort();

  const sortedData = (): LeaderboardEntry[] => {
    return leaderboardData.sort((a, b) => {
      switch (sortBy) {
        case LeaderBoardSort.Status:
          return b.lastActive.getTime() - a.lastActive.getTime();
        case LeaderBoardSort.Hashes:
          return Number(b.hashes) - Number(a.hashes);
        case LeaderBoardSort.SuperHashes:
          return b.superHashes - a.superHashes;
        case LeaderBoardSort.HashRate:
          return b.hashRate - a.hashRate;
        case LeaderBoardSort.SolXen:
          return Number(b.solXen) - Number(a.solXen);
        default:
          return a.rank - b.rank;
      }
    });
  };

  const percentOfState = (solXen: bigint): number => {
    // @ts-ignore
    if (!stateData || stateData.solXen === 0n || stateData.solXen === 0) {
      return 0;
    }

    if (solXen === 0n || !solXen) {
      return 0;
    }

    return Math.floor(Number((solXen * 10000n) / stateData.solXen) / 100);
  };

  const handleClickAccount = (account: string) => {
    push(`/leaderboard/${account}`);
  };

  const handleSearchClick = (e: any) => {
    e.preventDefault();
    handleClickAccount(searchInput.trim());
  };

  const solXenValue = (points: bigint) => {
    if (points) {
      return Intl.NumberFormat("en-US").format(Number(points / 1_000_000_000n));
    }
  };

  return (
    <div className="overflow-x-auto">
      {!hideSearch && (
        <form
          onSubmit={handleSearchClick}
          className={`mx-2 sm:mx-0 opacity-0 ${!isLoading ? "fade-in" : ""}`}
        >
          <label className="input input-bordered flex items-center gap-2 my-3 ">
            <input
              type="text"
              className="grow"
              placeholder="Search Account"
              value={searchInput}
              onChange={changeSearchBox}
            />
            <button className="" onClick={handleSearchClick}>
              <CiSearch />
            </button>
          </label>
        </form>
      )}

      <table
        className={`table table-fixed xl:table-zebra md:table-auto table-lg opacity-0 ${!isLoading ? "fade-in" : ""}`}
      >
        <thead>
          <tr>
            <th
              className="hidden xl:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4 cursor-pointer hover:rounded-lg hover:shadow-inner hover:bg-base-200"
              onClick={() => {
                setSortBy(LeaderBoardSort.Status);
              }}
            >
              <span>Status</span>
            </th>
            <th
              className="border-b border-blue-gray-100 bg-blue-gray-50 p-2 w-10 cursor-pointer hover:rounded-lg hover:shadow-inner hover:bg-base-200"
              onClick={() => {
                setSortBy(LeaderBoardSort.Rank);
              }}
            >
              <span>Rank</span>
            </th>
            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
              <span>Account</span>
            </th>
            <th
              className="hidden lg:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4 cursor-pointer hover:rounded-lg hover:shadow-inner hover:bg-base-200"
              onClick={() => {
                setSortBy(LeaderBoardSort.Hashes);
              }}
            >
              <span>Hashes</span>
            </th>
            <th
              className="hidden lg:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4 cursor-pointer hover:rounded-lg hover:shadow-inner hover:bg-base-200"
              onClick={() => {
                setSortBy(LeaderBoardSort.SuperHashes);
              }}
            >
              <span>Super Hashes</span>
            </th>
            <th
              className="hidden lg:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4 cursor-pointer hover:rounded-lg hover:shadow-inner hover:bg-base-200"
              onClick={() => {
                setSortBy(LeaderBoardSort.HashRate);
              }}
            >
              <span>Hash Rate</span>
            </th>
            {accountType == AccountType.Solana ? (
              <th
                className="hidden lg:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4 cursor-pointer hover:rounded-lg hover:shadow-inner hover:bg-base-200"
                onClick={() => {
                  setSortBy(LeaderBoardSort.SolXen);
                }}
              >
                <span>solXEN</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {sortedData().map(
            (
              {
                rank,
                account,
                hashes,
                superHashes,
                solXen,
                hashRate,
                lastActive,
              },
              index,
            ) => {
              return (
                <tr
                  key={rank}
                  className={`cursor-pointer hover ${statusBgColor(lastActive)}`}
                  onClick={() => {
                    handleClickAccount(account);
                  }}
                >
                  <td className="hidden xl:table-cell p-4 border-b border-blue-gray-50">
                    <div
                      className="tooltip tooltip-right"
                      data-tip={statusMessage(lastActive)}
                    >
                      <GoDotFill className={statusColor(lastActive)} />
                    </div>
                  </td>

                  <td className="p-4 pr-0 border-b border-blue-gray-50">
                    <span color="blue-gray" className="font-bold">
                      {rank}
                    </span>
                  </td>
                  <td className="p-4 border-b border-blue-gray-50 text-xs sm:text-base font-mono truncate">
                    <span>{account}</span>

                    <dl className="lg:hidden font-normal mt-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-400 mt-1 font-mono">
                          Hashes
                        </dt>
                        <dd className="text-gray-400 text-sm mt-1 font-mono">
                          {Intl.NumberFormat("en-US").format(hashes)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400 text-sm mt-1 font-mono">
                          Super Hashes
                        </dt>
                        <dd className="text-gray-400 text-sm mt-1">
                          {Intl.NumberFormat("en-US").format(superHashes)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400 text-sm mt-1 font-mono">
                          Hash Rate
                        </dt>
                        <dd className="text-gray-400 text-sm mt-1">
                          {humanizeHashRate(hashRate)}
                        </dd>
                      </div>
                      {accountType == AccountType.Solana ? (
                        <div className="flex justify-between">
                          <dt className="text-gray-400 text-sm mt-1 font-medium">
                            solXEN
                          </dt>
                          <dd className="text-gray-400 text-sm mt-1  font-mono">
                            {percentOfState(solXen) > 0 ? (
                              <div className="badge badge-sm badge-success badge-outline mr-2">
                                {percentOfState(solXen)}%
                              </div>
                            ) : null}
                            {solXenValue(solXen)}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </td>
                  <td className="hidden lg:table-cell p-4 border-b border-blue-gray-50">
                    <span className="font-mono">
                      {Intl.NumberFormat("en-US").format(hashes)}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell p-4 border-b border-blue-gray-50">
                    <span className="font-mono">
                      {Intl.NumberFormat("en-US").format(superHashes)}
                    </span>
                  </td>

                  <td className="hidden lg:table-cell p-4 border-b border-blue-gray-50">
                    <span className="font-mono">
                      {humanizeHashRate(hashRate)}
                    </span>
                  </td>
                  {accountType == AccountType.Solana ? (
                    <td className="hidden lg:table-cell p-4 border-b border-blue-gray-50">
                      <span className="font-mono">
                        {solXenValue(solXen)}
                        {percentOfState(solXen) > 0 ? (
                          <div className="badge badge-sm badge-success badge-outline ml-2">
                            {percentOfState(solXen)}%
                          </div>
                        ) : null}
                      </span>
                    </td>
                  ) : null}
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}
