"use client";
import {useEffect, useRef, useState} from "react";
import { Connection } from "@solana/web3.js";
import {
  AnchorProvider,
  BN,
  Program,
  web3,
} from "@coral-xyz/anchor";
import * as idl from "@/app/leaderboard/target/idl/sol_xen.json";

import {fetchStateData} from "@/app/leaderboard/Api";

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
  const [programsIds, setProgramsIds] = useState<string[]>([]);

  function useRefEventListener(fn: any) {
    const fnRef = useRef(fn);
    fnRef.current = fn;
    return fnRef;
  }

  useEffect(() => {
    fetchStateData().then((state) => {
      setProgramsIds(state.programs);
    })
  }, []);

  // We can use the custom hook declared above
  const handleResizeRef = useRefEventListener(handleEvent);

  useEffect(() => {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "",
    );

    const provider = new AnchorProvider(connection, null as any);
    const programs: Program<any>[] = [];
    const listeners: number[] = [];

    for (let i = 0; i < programsIds.length; i++) {
      const idlClone = JSON.parse(JSON.stringify(idl));
      idlClone.address = programsIds[i];
      programs.push(new Program(idlClone as any, provider));

      console.log(`Listening to hash events: ${programsIds[i]}`);
      listeners[i] = programs[i].addEventListener("hashEvent", (event: EventHash) => {
        handleResizeRef.current(event);
      });
    }

    return () => {
      for (let i = 0; i < programsIds.length; i++) {
        console.log(`stop listening to hash events: ${programsIds[i]}`);
        programs[i].removeEventListener(listeners[i]).then();
      }
    };
  }, [programsIds, handleResizeRef]);

  return handleResizeRef;
}
