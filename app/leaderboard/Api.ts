import { LeaderboardEntry } from "@/app/leaderboard/page";

export enum AccountType {
  Ethereum = "ethereum",
  Solana = "solana",
}

export async function fetchLeaderboardData(accountType: AccountType) {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/leaderboard?account=${accountType}`,
  );

  if (!data.ok) {
    throw new Error("Error fetching leaderboard data");
  }

  const out = await data.json();

  for (const entry of out) {
    entry.points = BigInt(entry.points);
  }

  return out;
}

export async function fetchStateData() {
  const data = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/state`);

  if (!data.ok) {
    throw new Error("Error fetching leaderboard data");
  }

  const out = await data.json();
  out.points = BigInt(out.points);

  return out;
}

export function generateLeaderboardIndex(
  leaderboardData: LeaderboardEntry[],
  accountType: AccountType,
) {
  return leaderboardData.reduce(
    (acc, entry, index) => {
      const accountKey =
        accountType == AccountType.Solana ? entry.solAccount : entry.ethAccount;
      acc[accountKey] = index;
      return acc;
    },
    {} as Record<string, number>,
  );
}
