import React, { useEffect, useState } from "react";

interface CountDownProps {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export default function TimeTo({
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
}: CountDownProps) {
  const isSoon = () => {
    return days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0;
  };

  return (
    <div className="grid grid-flow-col text-center auto-cols-max justify-center">
      <div className="flex flex-row">
        {isSoon() ? (
          "Soon"
        ) : (
          <>
            {days > 0 && (
              <>
                <div className="mx-2">
                  <div className="font-mono ">
                    <div>{days}</div>
                    <div className="text-sm font-thin -mt-1">days</div>
                  </div>
                </div>
              </>
            )}

            {hours > 0 && (
              <>
                <div className="mx-2">
                  <div className="font-mono">
                    {String(hours).padStart(2, "0")}
                    <div className="text-sm font-thin -mt-1">hours</div>
                  </div>
                </div>
              </>
            )}

            {minutes > 0 && (
              <>
                <div className="mx-2">
                  <div className="font-mono">
                    <div>{String(minutes).padStart(2, "0")}</div>
                    <div className="text-sm font-thin -mt-1">mins</div>
                  </div>
                </div>
              </>
            )}

            {seconds > 0 && (
              <>
                <div className="mx-2">
                  <div className="font-mono">
                    <div>{String(seconds).padStart(2, "0")}</div>
                    <div className="text-sm font-thin -mt-1">secs</div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
