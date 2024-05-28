import React, { useEffect, useState } from "react";

interface CountDownProps {
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export default function TimeTo({
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
}: CountDownProps) {
  const isSoon = () => {
    return days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0;
  };

  return (
    <span className="countdown font-mono">
      {isSoon() ? (
        "Soon"
      ) : (
        <>
          {months > 0 && (
            <>
              <span
                style={{
                  // @ts-ignore
                  "--value": months,
                }}
              ></span>
              m
            </>
          )}

          {days > 0 && (
            <>
              <span
                style={{
                  // @ts-ignore
                  "--value": days,
                }}
              ></span>
              d
            </>
          )}

          {(hours > 0 || days > 0) && (
            <>
              <span
                style={{
                  // @ts-ignore
                  "--value": hours,
                }}
              ></span>
              h
            </>
          )}

          {!months && (hours > 0 || minutes > 0) && (
            <>
              <span
                style={{
                  // @ts-ignore
                  "--value": minutes,
                }}
              ></span>
              m
            </>
          )}

          {seconds > 0 && (
            <>
              <span
                style={{
                  // @ts-ignore
                  "--value": seconds,
                }}
              ></span>
              h
            </>
          )}
        </>
      )}
    </span>
  );
}
