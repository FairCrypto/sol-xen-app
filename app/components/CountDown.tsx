import React, { useEffect, useState } from "react";
import TimeTo from "@/app/components/TimeTo";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";
dayjs.extend(utc);
dayjs.extend(duration);

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
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const run = () => {
      const now = dayjs();
      const endDateDayjs = dayjs(endDate);
      const diff = endDateDayjs.diff(now);

      const months = dayjs.duration(diff).months();
      const days = dayjs.duration(diff).days();
      const hours = dayjs.duration(diff).hours();
      const minutes = dayjs.duration(diff).minutes();

      let seconds = 0;
      if (showSeconds) {
        seconds = dayjs.duration(diff).seconds();
      }
      setTime({ months, days, hours, minutes, seconds });
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
      months={time.months}
      days={time.days}
      hours={time.hours}
      minutes={time.minutes}
      seconds={time.seconds}
    />
  );
}
