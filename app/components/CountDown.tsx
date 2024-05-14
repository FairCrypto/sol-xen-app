import React, { useEffect, useState } from "react";
import TimeTo from "@/app/components/TimeTo";

export default function CountDown({
  endDate,
  dontRun = false,
  showSeconds = false,
}: {
  endDate: Date;
  dontRun?: boolean;
  showSeconds?: boolean;
}) {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const run = () => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      let seconds = 0;
      if (showSeconds) {
        seconds = Math.floor((distance % (1000 * 60)) / 1000);
      }
      setTime({ days, hours, minutes, seconds });
    };

    run();
    if (!dontRun) {
      const timer = setInterval(run, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [dontRun, endDate, showSeconds]);

  return (
    <TimeTo
      days={time.days}
      hours={time.hours}
      minutes={time.minutes}
      seconds={time.seconds}
    />
  );
}
