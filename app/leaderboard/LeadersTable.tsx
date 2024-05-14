import { AccountType } from "@/app/leaderboard/Api";
import React from "react";
import { State } from "@/app/leaderboard/StateStats";

interface LeadersTableProps {
  accountType: AccountType;
  isLoading: boolean;
  leaderboardData: LeaderboardEntry[];
  stateData: State;
}

export interface LeaderboardEntry {
  rank: number;
  solAccount: string;
  ethAccount: string;
  hashes: number;
  superHashes: number;
  points: bigint;
}

export function LeadersTable({
  accountType,
  isLoading,
  leaderboardData,
  stateData,
}: LeadersTableProps) {
  const percentOfState = (points: bigint) => {
    if (stateData.points === 0n) {
      return 0;
    }
    return Math.floor(Number((points * 10000n) / stateData.points) / 100);
  };

  return (
    <div className="overflow-x-auto">
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
              { rank, solAccount, ethAccount, hashes, superHashes, points },
              index,
            ) => {
              return (
                <tr key={rank} className={``}>
                  <td className="p-4 pr-0 border-b border-blue-gray-50">
                    <span color="blue-gray" className="font-bold">
                      {rank}
                    </span>
                  </td>
                  <td className="p-4 border-b border-blue-gray-50 text-xs sm:text-base font-mono truncate">
                    <span>
                      {accountType == "solana" ? solAccount : ethAccount}
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
                            {percentOfState(points) > 0 ? (
                              <div className="badge badge-sm badge-success badge-outline mr-2">
                                {percentOfState(points)}%
                              </div>
                            ) : null}
                            {Intl.NumberFormat("en-US").format(
                              points / 1_000_000_000n,
                            )}
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
                        {Intl.NumberFormat("en-US").format(
                          points / 1_000_000_000n,
                        )}
                        {percentOfState(points) > 0 ? (
                          <div className="badge badge-sm badge-success badge-outline ml-2">
                            {percentOfState(points)}%
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
