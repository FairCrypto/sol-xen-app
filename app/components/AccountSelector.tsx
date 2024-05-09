import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from "next/navigation";

interface AccountSelectorProps {
  initialAccount?: 'solana' | 'ethereum';
  onAccountChange?: (account: 'solana' | 'ethereum') => void;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({ initialAccount = 'solana', onAccountChange }) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const [account, setAccount] = useState<string>(
    searchParams.get("account") || "solana",
  );

  const handleAccountChange = useCallback((account: 'solana' | 'ethereum') => {
    setAccount(account);
    const url = new URL(window.location.href);
    url.searchParams.set("account", account);
    replace(url.toString());

    if (onAccountChange) {
      onAccountChange(account);
    }
  }, [onAccountChange, replace]);

  // const setAccount = useCallback(
  //   (account: string) => {
  //     const url = new URL(window.location.href);
  //     url.searchParams.set("account", account);
  //     replace(url.toString());
  //   },
  //   [replace],
  // );

  return (
    <div className="flex items-center justify-end m-4">
      <div className="join">
        <input
          onClick={() => handleAccountChange('solana')}
          className="join-item btn btn-sm"
          type="radio"
          name="options"
          aria-label="Solana"
          checked={account === 'solana'}
          readOnly
        />
        <input
          onClick={() => handleAccountChange('ethereum')}
          className="join-item btn btn-sm"
          type="radio"
          name="options"
          aria-label="Ethereum"
          checked={account === 'ethereum'}
          readOnly
        />
      </div>
    </div>
  );
};
