import { AccountType } from "@/app/hooks/AccountTypeHook";
import { State } from "@/app/leaderboard/StateStats";
import { LeaderBoardSort } from "@/app/hooks/LeaderBoardSortHook";

export interface GlobalState {
  points: bigint;
  solXen: bigint;
  solXenDelta: bigint;
  hashes: number;
  hashRate: number;
  hashesDelta: bigint;
  superHashes: number;
  superHashesDelta: number;
  txs: bigint;
  txsDelta: bigint;
  amp: number;
  lastAmpSlot: bigint;
  zeroAmpEta: Date;
  nextAmpEta: Date;
  avgAmpSecs: number;
  createdAt: Date;
  avgPriorityFee: number;
  minPriorityFee: number;
  medianPriorityFee: number;
  maxPriorityFee: number;
  programs: string[];
}

export interface SolAccountState {
  hashes: bigint;
  superHashes: number;
  solXen: bigint;
  superHashesDelta: number;
  hashesDelta: bigint;
  solXenDelta: bigint;
  amp: number;
  lastAmpSlot: bigint;
  txs: bigint;
  zeroAmpEta: Date;
  avgAmpSecs: number;
  nextAmpEta: Date;
  avgPriorityFee: number;
  medianPriorityFee: number;
  minPriorityFee: number;
  maxPriorityFee: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  account: string;
  hashes: bigint;
  superHashes: number;
  points: bigint;
  solXen: bigint;
  hashRate: number;
  lastActive?: Date;
}

export interface SolXenPriorityFees {
  avgPriorityFee: number;
  medianPriorityFee: number;
  minPriorityFee: number;
  maxPriorityFee: number;
  lowPriorityFee: number;
  highPriorityFee: number;
  createdAt: Date;
}

export interface BlockStats {
  slot: number;
  avgComputeUnits: number;
  avgSolXenComputeUnits: number;
  avgFee: number;
  avgComputeUnitsPercent: number;
  avgSolXenComputeUnitsPercent: number;
  avgSolXenFee: number;
  createdAt: Date;
}

export type ChartUnit = "minute" | "hour" | "day" | "week" | undefined;

export async function fetchLeaderboardData(
  accountType: AccountType,
  limit = 100,
  offset = 0,
  sortBy: LeaderBoardSort = LeaderBoardSort.Rank,
  order: "asc" | "desc" = "asc",
): Promise<LeaderboardEntry[]> {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/leaderboard?account=${accountType}&limit=${limit}&offset=${offset}&sort=${sortBy}&order=${order}`,
  );

  if (!data.ok) {
    throw new Error("Error fetching leaderboard data");
  }

  const out = await data.json();
  if (accountType == AccountType.Solana) {
    for (const entry of out) {
      entry.solXen = BigInt(entry.solXen);
      entry.hashes = BigInt(entry.hashes);
      entry.lastActive = new Date(entry.lastActive);
    }
  } else {
    for (const entry of out) {
      entry.points = BigInt(entry.points);
      entry.hashes = BigInt(entry.hashes);
      entry.lastActive = new Date(entry.lastActive);
    }
  }

  return out;
}

export async function fetchStateData(): Promise<State> {
  const data = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/state`);

  if (!data.ok) {
    throw new Error("Error fetching leaderboard data");
  }

  const out = await data.json();
  out.solXen = BigInt(out.solXen);
  out.txs = BigInt(out.txs);
  out.hashes = BigInt(out.hashes);

  return out;
}

export function generateLeaderboardIndex(
  leaderboardData: LeaderboardEntry[],
  isEthereum = false,
) {
  return leaderboardData.reduce(
    (acc, entry, index) => {
      if (isEthereum) {
        acc[entry.account.toLowerCase()] = index;
      } else {
        acc[entry.account] = index;
      }
      return acc;
    },
    {} as Record<string, number>,
  );
}

export async function fetchLeaderboardEntry(
  account: string,
): Promise<LeaderboardEntry> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/leaderboard/${account}`,
  );

  if (!response.ok) {
    const error = new Error();
    error.message =
      (await response.json())?.message || "Error fetching leaderboard entry";
    error.cause = response.statusText;
    throw error;
  }

  const out = await response.json();
  if (out?.points != undefined) {
    out.points = BigInt(out.points);
  }
  if (out?.solXen != undefined) {
    out.solXen = BigInt(out.solXen);
  }
  if (out?.hashes != undefined) {
    out.hashes = BigInt(out.hashes);
  }

  out.lastActive = new Date(out.lastActive);
  return out;
}

export async function fetchAccountStateHistory(
  account?: string,
  from?: Date,
  to?: Date,
  unit?: ChartUnit,
): Promise<SolAccountState[]> {
  let params = "";
  if (from && to) {
    from.setSeconds(0);
    from.setMilliseconds(0);
    to.setSeconds(0);
    to.setMilliseconds(0);

    params = `?from=${from.toISOString()}&to=${to.toISOString()}&unit=${unit}`;
  }

  let path = `/sol_accounts/${account}/state/history`;
  if (account) {
    if (account.startsWith("0x") && account.length == 42) {
      path = `/eth_accounts/${account}/state/history`;
    }
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}${params}`,
  );

  if (!response.ok) {
    const error = new Error();
    error.message =
      (await response.json())?.message ||
      "Error fetching hash event stats entry";
    error.cause = response.statusText;
    throw error;
  }

  const out = await response.json();
  for (const entry of out) {
    if (entry.solXen != undefined && entry.solXenDelta != undefined) {
      entry.solXen = BigInt(entry.solXen);
      entry.solXenDelta = BigInt(entry.solXenDelta);
    }
    entry.hashes = BigInt(entry.hashes);
    entry.hashesDelta = BigInt(entry.hashesDelta);
  }

  return out;
}

export async function fetchAssociatedEthAccounts(
  account: string,
): Promise<LeaderboardEntry[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/sol_accounts/${account}/eth_accounts`,
  );

  if (!response.ok) {
    const error = new Error();
    error.message =
      (await response.json())?.message || "Error fetching associated accounts";
    error.cause = response.statusText;
    throw error;
  }

  const out = await response.json();

  for (const entry of out) {
    entry.points = BigInt(entry.points);
    entry.hashes = BigInt(entry.hashes);
    entry.lastActive = new Date(entry.lastActive);
  }

  return out;
}

export async function fetchAssociatedSolAccounts(
  account: string,
  limit: number,
  offset: number,
  sortBy: LeaderBoardSort,
  order: "asc" | "desc",
): Promise<LeaderboardEntry[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/eth_accounts/${account}/sol_accounts?limit=${limit}&offset=${offset}&sort=${sortBy}&order=${order}`,
  );

  if (!response.ok) {
    const error = new Error();
    error.message =
      (await response.json())?.message || "Error fetching associated accounts";
    error.cause = response.statusText;
    throw error;
  }

  const out = await response.json();

  for (const entry of out) {
    if (entry.solXen) {
      entry.solXen = BigInt(entry.solXen);
    }
    entry.hashes = BigInt(entry.hashes);
    entry.lastActive = new Date(entry.lastActive);
  }

  return out;
}

export async function fetchStateHistory(
  from: Date,
  to: Date,
  unit: ChartUnit,
): Promise<GlobalState[]> {
  from.setSeconds(0);
  from.setMilliseconds(0);
  to.setSeconds(0);
  to.setMilliseconds(0);

  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/state/history?from=${from.toISOString()}&to=${to.toISOString()}&unit=${unit}`,
  );

  if (!data.ok) {
    throw new Error("Error fetching state history data");
  }

  const out = await data.json();

  for (const entry of out) {
    if (entry.solXen) {
      entry.solXen = BigInt(entry.solXen);
      entry.hashes = BigInt(entry.hashes);
      entry.solXenDelta = BigInt(entry.solXenDelta);
      entry.hashesDelta = BigInt(entry.hashesDelta);
    }
  }

  return out;
}

export async function fetchPriorityFeesHistory(
  from: Date,
  to: Date,
  unit: ChartUnit,
): Promise<SolXenPriorityFees[]> {
  from.setSeconds(0);
  from.setMilliseconds(0);
  to.setSeconds(0);
  to.setMilliseconds(0);

  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/priority_fees/history?from=${from.toISOString()}&to=${to.toISOString()}&unit=${unit}`,
  );

  if (!data.ok) {
    throw new Error("Error fetching priority fees");
  }

  return await data.json();
}

export async function fetchPriorityFees(): Promise<SolXenPriorityFees> {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/priority_fees`,
  );

  if (!data.ok) {
    throw new Error("Error fetching priority fees");
  }

  return await data.json();
}

export async function fetchProgramsData(): Promise<string[]> {
  const data = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/programs`);

  if (!data.ok) {
    throw new Error("Error fetching programs data");
  }

  return await data.json();
}

export async function fetchBlockStatsHistory(
  from: Date,
  to: Date,
  unit: ChartUnit,
): Promise<BlockStats[]> {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/block_stats?from=${from.toISOString()}&to=${to.toISOString()}&unit=${unit}`,
  );

  if (!data.ok) {
    throw new Error("Error fetching block stats data");
  }

  return await data.json();
}
