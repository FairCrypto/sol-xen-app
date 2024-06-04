"use client";
import { useEffect, useRef, useState } from "react";
import { ConfirmOptions, Connection } from "@solana/web3.js";
import { AnchorProvider, BN, Program, web3 } from "@coral-xyz/anchor";
import * as idl from "@/app/leaderboard/target/idl/sol_xen.json";

import { fetchStateData } from "@/app/Api";

interface SolanaEventsContextType {
  refreshRate: number;
  handleEventBatch?: (eventHashes: EventHash[]) => void;
}

export interface EventHash {
  slot: bigint;
  user: web3.PublicKey;
  ethAccount: number[];
  hashes: number;
  superhashes: number;
  points: BN;
}

export function useSolanaEvents({
  refreshRate,
  handleEventBatch,
}: SolanaEventsContextType) {
  const [programsIds, setProgramsIds] = useState<string[]>([]);
  const eventsBuffer = useRef<EventHash[]>([]);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  function useRefEventListener(fn: any) {
    const fnRef = useRef(fn);
    fnRef.current = fn;
    return fnRef;
  }

  useEffect(() => {
    fetchStateData().then((state) => {
      setProgramsIds(state.programs);
    });
  }, []);

  const handleEventRef = useRefEventListener(handleEventBatch);

  useEffect(() => {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "",
      {
        commitment: "finalized",
        wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WS_ENDPOINT || "",
      },
    );

    const anchorOptions = {
      skipPreflight: false,
      commitment: "finalized",
      preflightCommitment: "finalized",
      maxRetries: 10,
    } as ConfirmOptions;

    const provider = new AnchorProvider(connection, null as any, anchorOptions);
    const programs: Program<any>[] = [];
    const listeners: number[] = [];

    for (let i = 0; i < programsIds.length; i++) {
      const idlClone = JSON.parse(JSON.stringify(idl));
      idlClone.address = programsIds[i];
      programs.push(new Program(idlClone as any, provider));

      console.log(`Listening to hash events: ${programsIds[i]}`);
      listeners[i] = programs[i].addEventListener(
        "hashEvent",
        (event: EventHash) => {
          eventsBuffer.current.push(event);
        },
      );
    }

    intervalId.current = setInterval(() => {
      if (eventsBuffer.current.length > 0) {
        handleEventRef.current(eventsBuffer.current);
        eventsBuffer.current = [];
      }
    }, refreshRate);

    return () => {
      for (let i = 0; i < programsIds.length; i++) {
        console.log(`stop listening to hash events: ${programsIds[i]}`);
        programs[i].removeEventListener(listeners[i]).then();
      }

      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [refreshRate, programsIds, handleEventRef]);

  return handleEventRef;
}
