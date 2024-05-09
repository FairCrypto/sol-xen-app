"use client";

import Image from "next/image";
import {NavBar} from "@/app/components/NavBar";
import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <NavBar/>

      <div className="hero h-[500px] bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-3">PROOF OF WORK MINING ON SOLANA</h1>
            <hr></hr>
            <p className="py-6">solXEN is a fairly distributed 1st principles community token earned through PoW mining
              on the Solana</p>
            <Link href="./leaderboard">
              <button className="btn btn-primary">Leaderboard</button>
            </Link>
            <a href="https://docs.solxen.io/">
              <button className="ml-2 btn btn-secondary">Gitbook</button>
            </a>
          </div>
        </div>
      </div>

      <div className="container">

        <Image
          className="mx-auto"
          alt="A diagram of mining solXEN"
          src="/mining.jpeg"
          height={700}
          width={700}/>

        <p className="mt-8 max-w-[600px] mx-auto">
          Mining for 420 hashes involves sending a transaction using the SolXen miner script. If the priority fee is
          high enough the Solana leader as well as the rest of the validator cluster will then run the 420miner script.
          The script leverages the cryptographic hashing algorithm Keccak256 to find a hash containing a string with
          420/42069 in it. Upon successfully finding the correct hash the miner is rewarded with solXEN, as well as
          becoming eligible for XN airdrop via included ethereum address.
        </p>
      </div>
    </main>
  );
}
