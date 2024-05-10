"use client";

import { NavBar } from "@/app/components/NavBar";
import React from "react";
import Link from "next/link";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen -mb-14">
      <NavBar />

      <div className="hero h-[500px] bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-3">
              PROOF OF WORK MINING ON SOLANA
            </h1>
            <div className="divider"></div>
            <p className="mb-5 mx-auto max-w-lg">
              solXEN is a fairly distributed 1st principles community token
              earned through PoW mining on the Solana
            </p>
            <Link href="./leaderboard">
              <button className="btn btn-primary">Leaderboard</button>
            </Link>
            <a href="https://docs.solxen.io/">
              <button className="ml-2 btn btn-secondary">Gitbook</button>
            </a>
            <a href="https://t.me/+Z5kEez70pyQ5NTAz">
              <button className="ml-2 btn btn-accent">
                Hashhead Community
              </button>
            </a>
          </div>
        </div>
      </div>

      <div className="container my-6 max-w-4xl mx-auto">
        <div className="card">
          <Zoom>
            <img alt="A diagram of mining solXEN" src="/mining.jpeg" />
          </Zoom>
          <p className="mt-8">
            Mining for 420 hashes involves sending a transaction using the
            SolXen miner script. If the priority fee is high enough the Solana
            leader as well as the rest of the validator cluster will then run
            the 420miner script. The script leverages the cryptographic hashing
            algorithm Keccak256 to find a hash containing a string with
            420/42069 in it. Upon successfully finding the correct hash the
            miner is rewarded with solXEN, as well as becoming eligible for XN
            airdrop via included ethereum address.
          </p>
        </div>
      </div>
    </main>
  );
}
