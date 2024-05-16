"use client";
import { useEffect, useRef } from "react";
import { Connection } from "@solana/web3.js";
import {
  AnchorProvider,
  BN,
  Program,
  setProvider,
  web3,
} from "@coral-xyz/anchor";
import * as idl from "@/app/leaderboard/target/idl/sol_xen.json";

interface SolanaEventsContextType {
  handleEvent?: (event: EventHash) => void;
}

export interface EventHash {
  slot: bigint;
  user: web3.PublicKey;
  ethAccount: number[];
  hashes: number;
  superhashes: number;
  points: BN;
}

export function useSolanaEvents({ handleEvent }: SolanaEventsContextType) {
  function useRefEventListener(fn: any) {
    const fnRef = useRef(fn);
    fnRef.current = fn;
    return fnRef;
  }

  // We can use the custom hook declared above
  const handleResizeRef = useRefEventListener(handleEvent);

  useEffect(() => {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "",
    );
    const provider = new AnchorProvider(connection, null as any);
    setProvider(provider);
    const program = new Program(idl as any, provider);

    console.log("Listening to hash events");
    const listener = program.addEventListener("hashEvent", (event: any) => {
      // if (handleResizeRef.current) {
      handleResizeRef.current(event);
      // }
    });

    return () => {
      console.log("stop listening to hash events");
      program.removeEventListener(listener).then();
    };
  }, [handleResizeRef]);

  return handleResizeRef;
}
