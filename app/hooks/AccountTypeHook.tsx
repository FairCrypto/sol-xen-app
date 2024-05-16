import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface AccountTypeProps {
  titleCase?: boolean;
}

export enum AccountType {
  Ethereum = "ethereum",
  Solana = "solana",
}

export enum AccountTypeTitleCase {
  Ethereum = "Ethereum",
  Solana = "Solana",
}

export function useAccountType(
  { titleCase = false }: AccountTypeProps = { titleCase: false },
) {
  const searchParams = useSearchParams();

  const [accountType, setAccountType] = useState(
    getAccountTypeFromSearchParams(searchParams),
  );

  function getAccountTypeFromSearchParams(
    searchParams: URLSearchParams,
  ): AccountType | AccountTypeTitleCase {
    if (titleCase) {
      return searchParams.get("account") === AccountType.Ethereum
        ? AccountTypeTitleCase.Ethereum
        : AccountTypeTitleCase.Solana;
    }
    return searchParams.get("account") === AccountType.Ethereum
      ? AccountType.Ethereum
      : AccountType.Solana;
  }

  useEffect(() => {
    setAccountType(getAccountTypeFromSearchParams(searchParams));
  }, [titleCase, searchParams]);

  return accountType;
}
