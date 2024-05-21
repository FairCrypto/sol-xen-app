import { LeaderboardEntry } from "@/app/leaderboard/LeadersTable";
import { AccountType } from "@/app/hooks/AccountTypeHook";

export async function fetchLeaderboardData(accountType: AccountType) {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/leaderboard?account=${accountType}`,
  );

  if (!data.ok) {
    throw new Error("Error fetching leaderboard data");
  }

  const out = await data.json();
  if (accountType == AccountType.Solana) {
    for (const entry of out) {
      entry.solXen = BigInt(entry.solXen);
      entry.hashes = BigInt(entry.hashes);
      entry.superHashes = BigInt(entry.superHashes);
    }
  } else {
    for (const entry of out) {
      entry.points = BigInt(entry.points);
      entry.hashes = BigInt(entry.hashes);
      entry.superHashes = BigInt(entry.superHashes);
    }
  }

  return out;
}

export async function fetchStateData() {
  const data = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/state`);

  if (!data.ok) {
    throw new Error("Error fetching leaderboard data");
  }

  const out = await data.json();
  out.solXen = BigInt(out.solXen);
  out.txs = BigInt(out.txs);
  out.hashes = BigInt(out.hashes);
  out.superHashes = BigInt(out.superHashes);

  return out;
}

export function generateLeaderboardIndex(leaderboardData: LeaderboardEntry[]) {
  return leaderboardData.reduce(
    (acc, entry, index) => {
      acc[entry.account] = index;
      return acc;
    },
    {} as Record<string, number>,
  );
}

export async function fetchLeaderboardEntry(account: string) {
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
  if (out?.points) {
    out.points = BigInt(out.points);
  }
  if (out?.solXen) {
    out.solXen = BigInt(out.solXen);
  }
  out.hashes = BigInt(out.hashes);
  out.superHashes = BigInt(out.superHashes);

  return out;
}

export interface HashEventStat {
  createdAt: Date;
  hashes: number;
  superHashes: number;
  solXen: number;
  txs: number;
}

export async function fetchHashEventStats(
  account?: string,
): Promise<HashEventStat[]> {
  let params = "";
  if (account) {
    if (account.startsWith("0x") && account.length == 42) {
      params = `?ethAccount=${account}`;
    } else {
      params = `?solAccount=${account}`;
    }
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/hash_event_stats${params}`,
  );

  if (!response.ok) {
    const error = new Error();
    error.message =
      (await response.json())?.message ||
      "Error fetching hash event stats entry";
    error.cause = response.statusText;
    throw error;
  }

  return await response.json();
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
    entry.superHashes = BigInt(entry.superHashes);
  }

  return out;
}

export async function fetchAssociatedSolAccounts(
  account: string,
): Promise<LeaderboardEntry[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/eth_accounts/${account}/sol_accounts`,
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
    entry.solXen = BigInt(entry.solXen);
    entry.hashes = BigInt(entry.hashes);
    entry.superHashes = BigInt(entry.superHashes);
  }

  return out;
}

export async function fetchStateHistory() {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/state/history`,
  );

  if (!data.ok) {
    throw new Error("Error fetching state history data");
  }

  const out = await data.json();

  for (const entry of out) {
    if (entry.solXen) {
      entry.solXen = BigInt(entry.solXen);
    }
  }

  return out;
}
