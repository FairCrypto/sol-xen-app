import React, { useState } from "react";
import { State } from "@/app/leaderboard/StateStats";
import { useRouter } from "next/navigation";
import { AccountType } from "@/app/hooks/AccountTypeHook";
import { CiSearch } from "react-icons/ci";

interface LeadersTableProps {
  accountType: AccountType;
  isLoading: boolean;
  leaderboardData: LeaderboardEntry[];
  stateData?: State | LeaderboardEntry;
  hideSearch?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  account: string;
  hashes: bigint;
  superHashes: bigint;
  points: bigint;
  solXen: bigint;
}

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
          <label className="input input-bordered flex items-center gap-2 mt-3">
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
        className={`table table-fixed md:table-auto table-lg table-zebra opacity-0 ${!isLoading ? "fade-in" : ""}`}
      >
        <thead>
          <tr>
            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-2 w-10">
              <span>Rank</span>
            </th>
            <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
              <span>Account</span>
            </th>
            <th className="hidden lg:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4">
              <span>Hashes</span>
            </th>
            <th className="hidden lg:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4">
              <span>Super Hashes</span>
            </th>
            {accountType == AccountType.Solana ? (
              <th className="hidden lg:table-cell border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                <span>solXEN</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map(
            (
              { rank, account, hashes, superHashes, solXen },
              index,
            ) => {
              return (
                <tr
                  key={rank}
                  className={`cursor-pointer hover`}
                  onClick={() => {
                    handleClickAccount(account);
                  }}
                >
                  <td className="p-4 pr-0 border-b border-blue-gray-50">
                    <span color="blue-gray" className="font-bold">
                      {rank}
                    </span>
                  </td>
                  <td className="p-4 border-b border-blue-gray-50 text-xs sm:text-base font-mono truncate">
                    <span>
                      {account}
                    </span>

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
