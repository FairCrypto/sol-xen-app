"use client";

import { NavBar } from "@/app/components/NavBar";
import Link from "next/link";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { useStatsData } from "@/app/hooks/StateDataHook";

export default function Home() {
  const [stateData, setStateData, isStatsLoadingStats] = useStatsData();

  const solXenValue = () => {
    if (!stateData?.solXen) {
      return "0";
    }
    return Intl.NumberFormat("en-US").format(
      Number(stateData.solXen / BigInt(10 ** 9)),
    );
  };

  const hashesValue = () => {
    if (!stateData) {
      return "0";
    }
    return Intl.NumberFormat("en-US").format(stateData.hashes);
  };

  const superHashesValue = () => {
    if (!stateData) {
      return "0";
    }
    return Intl.NumberFormat("en-US").format(stateData.superHashes);
  };

  return (
    <main className="flex flex-col mx-0 min-h-screen">
      <NavBar />

      <div className="hero h-[500px] bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-screen-md">
            <h1 className="text-4xl sm:text-5xl font-bold">
              PROOF OF WORK MINING ON SOLANA
            </h1>
            <div className="divider"></div>
            <p className="mb-5 mx-auto max-w-lg">
              solXEN is a fairly distributed 1st principles community token
              earned through PoW
              <br className="sm:hidden" /> mining on the Solana blockchain.
            </p>
            <Link href="./leaderboard">
              <button className="btn btn-primary">Leaderboard</button>
            </Link>
            <a href="https://docs.solxen.io/">
              <button className="ml-2 btn btn-secondary">Gitbook</button>
            </a>
            <a href="https://t.me/+Z5kEez70pyQ5NTAz">
              <button className="ml-2 btn btn-accent">
                Hashhead <div className="hidden sm:inline">Community</div>
              </button>
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-content justify-center my-0 py-10 w-full mx-0 bg-base-100">
        <div className="card mx-8 lg:mx-2 w-[768px]">
          <div className="card-body">
            <div className="card-title mb-6">
              <h2 className="text-2xl">Total Supply</h2>
            </div>
            <div className="stats stats-vertical sm:stats-horizontal mx-auto">
              <div className="stat px-0 sm:px-4">
                <div className="stat-title">Hashes</div>
                <div className="stat-value text-secondary">{hashesValue()}</div>
              </div>

              <div className="stat px-0 sm:px-4">
                <div className="stat-title">Super Hashes</div>
                <div className="stat-value text-secondary">
                  {superHashesValue()}
                </div>
              </div>

              <div className="stat px-0 sm:px-4">
                <div className="stat-title">solXEN</div>
                <div className="stat-value text-secondary">{solXenValue()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center my-0 py-10 w-full mx-0 bg-base-200">
        <div className="card mx-8 lg:mx-2 max-w-screen-md sm:w-[768px]">
          <div className="card-body">
            <div className="card-title mb-6">
              <h2 className="text-2xl">How Does It Work?</h2>
            </div>
            <article className="prose">
              <p className="mb-4">
                Mining for 420 hashes involves sending a transaction using the
                SolXen miner script. If the priority fee is high enough the
                Solana leader as well as the rest of the validator cluster will
                then run the 420miner script.
              </p>
              <p className="mb-8">
                The script leverages the cryptographic hashing algorithm
                Keccak256 to find a hash containing a string with 420/42069 in
                it. Upon successfully finding the correct hash the miner is
                rewarded with solXEN, as well as becoming eligible for XN
                airdrop via included ethereum address.
              </p>
              <Zoom zoomImg={{ src: "/mining-large.jpg" }}>
                <Image
                  alt="A diagram of mining solXEN"
                  src="/mining.jpg"
                  width={880}
                  height={356}
                ></Image>
              </Zoom>
            </article>
          </div>
        </div>
      </div>

      <div className="flex justify-center my-0 py-10 w-full mx-0 bg-base-100">
        <div className="card mx-8 lg:mx-2 max-w-screen-md sm:w-[768px]">
          <div className="card-body">
            <div className="card-title mb-6">
              <h2 className="text-2xl">Tokenomics</h2>
            </div>

            <article className="prose">
              <p className="mb-2">solXEN</p>
              <p>
                A miner is rewarded solXEN for every 420 hash found according to
                this formula:
              </p>
              <code>420hash * AMP = solXEN</code>
              <p className="mb-4">where AMP is the amplification.</p>
              <p className="mb-4">
                The AMP starts at 300 and reduces by 1 every 100.000 blocks.
                Given that each block is 400 ms the AMP will be reduced to 0 in
                about 139 days, which is makes the limited distribution period
                for solXEN.
              </p>
              <p>
                The probability to find a 420 hash is roughly 95%. solXEN is
                directly issued upon finding a 420 hash and transferable.
              </p>
            </article>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
