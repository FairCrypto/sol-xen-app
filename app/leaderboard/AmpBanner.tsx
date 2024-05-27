import CountDown from "@/app/components/CountDown";
import React from "react";
import { State } from "@/app/leaderboard/StateStats";

interface AmpBannerProps {
  isLoading: boolean;
  stateData: State;
}

export default function AmpBanner({ isLoading, stateData }: AmpBannerProps) {
  const avgAmpSecsDate = () => {
    return new Date(new Date().getTime() + stateData.avgAmpSecs * 1000);
  };


  // 10am pst is the launch time on may 28th
  const launchTime = new Date("2024-05-28T17:00:00Z");

  return (
    <div
      className={`bg-info/50 z-[1] text-info-content w-full grid grid-cols-1 gap-2 h-[45px] md:h-[50px] opacity-0 ${!isLoading && stateData.amp > 0 ? "fade-in" : ""}`}
    >
      <div className="border-r place-items-center justify-center py-0 my-0 flex">
        <div className="p-0">
          Mainnet Launch <span className="hidden md:inline">ETA</span>{" "}
          <span className="font-thin">|</span>
        </div>
        <div className="mx-1">
          <CountDown endDate={launchTime}/>
        </div>
      </div>

      {/*<div className="border-r place-items-center justify-center py-0 my-0 flex">*/}
      {/*  <div className="p-0">*/}
      {/*    Zero AMP <span className="hidden md:inline">ETA</span>{" "}*/}
      {/*    <span className="font-thin">|</span>*/}
      {/*  </div>*/}
      {/*  <div className="mx-1">*/}
      {/*    <CountDown endDate={new Date(stateData.zeroAmpEta)}/>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div className="sm:border-r justify-center place-items-center py-0 flex">*/}
      {/*  <div className="p-0">*/}
      {/*    Next AMP <span className="hidden md:inline">ETA</span>{" "}*/}
      {/*    <span className="font-thin">|</span>*/}
      {/*  </div>*/}
      {/*  <div className="mx-1">*/}
      {/*    <CountDown endDate={new Date(stateData.nextAmpEta)}/>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div className="place-items-center justify-center py-0 hidden sm:flex">*/}
      {/*  <div className="p-0">*/}
      {/*    <span className="hidden md:inline">Average</span> AMP Time{" "}*/}
      {/*    <span className="font-thin">|</span>*/}
      {/*  </div>*/}
      {/*  <div className="mx-1">*/}
      {/*    <CountDown*/}
      {/*      endDate={avgAmpSecsDate()}*/}
      {/*      dontRun={true}*/}
      {/*      showSeconds={true}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
}
