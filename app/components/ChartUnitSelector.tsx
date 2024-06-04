import { ChartUnit } from "@/app/Api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export interface ChartUnitSelectorInterface {
  setChartUnit: (unit: ChartUnit) => void;
  chartUnit: ChartUnit;
}

export const startTime = (chartUnit: ChartUnit): Date => {
  if (chartUnit === "week") {
    return dayjs
      .utc()
      .subtract(1, "week")
      .set("second", 0)
      .set("millisecond", 0)
      .set("minute", 0)
      .set("hour", 0)
      .toDate();
  }
  if (chartUnit === "day") {
    return dayjs
      .utc()
      .subtract(1, "day")
      .set("second", 0)
      .set("millisecond", 0)
      .set("minute", 0)
      .toDate();
  }
  return dayjs
    .utc()
    .subtract(1, "hour")
    .set("second", 0)
    .set("millisecond", 0)
    .toDate();
};

export const endTime = (chartUnit: ChartUnit): Date => {
  if (chartUnit === "day") {
    return dayjs
      .utc()
      .set("second", 0)
      .set("millisecond", 0)
      .set("minute", 0)
      .toDate();
  }

  if (chartUnit === "week") {
    return dayjs
      .utc()
      .set("second", 0)
      .set("millisecond", 0)
      .set("minute", 0)
      .set("hour", 0)
      .toDate();
  }

  return dayjs.utc().set("second", 0).set("millisecond", 0).toDate();
};

export const unit = (chartUnit: ChartUnit): ChartUnit => {
  if (chartUnit === "week") {
    return "day";
  }
  if (chartUnit === "day") {
    return "hour";
  }
  return "minute";
};

export function ChartUnitSelector({
  setChartUnit,
  chartUnit,
}: ChartUnitSelectorInterface) {
  return (
    <div className="join lg:join-horizontal">
      <button
        className={`btn btn-sm join-item ${chartUnit == "week" && "btn-primary"}`}
        onClick={() => {
          setChartUnit("week");
        }}
      >
        <span className={`hidden sm:inline`}>Week</span>
        <span className={`sm:hidden`}>1W</span>
      </button>
      <button
        className={`btn btn-sm join-item ${chartUnit == "day" && "btn-primary"}`}
        onClick={() => {
          setChartUnit("day");
        }}
      >
        <span className={`hidden sm:inline`}>Day</span>
        <span className={`sm:hidden`}>1D</span>
      </button>
      <button
        className={`btn btn-sm join-item ${chartUnit == "hour" && "btn-primary"}`}
        onClick={() => {
          setChartUnit("hour");
        }}
      >
        <span className={`hidden sm:inline`}>Hour</span>
        <span className={`sm:hidden`}>1H</span>
      </button>
    </div>
  );
}
