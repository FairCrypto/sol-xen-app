import { ChartUnit } from "@/app/Api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { ChartUnitSelectorInterface } from "@/app/hooks/ChartSelector";

export const startTime = (chartUnit: ChartUnit): Date => {
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

  return dayjs.utc().set("second", 0).set("millisecond", 0).toDate();
};

export const unit = (chartUnit: ChartUnit): ChartUnit => {
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
        className={`btn btn-sm join-item ${chartUnit == "day" && "btn-primary"}`}
        onClick={() => {
          setChartUnit("day");
        }}
      >
        Day
      </button>
      <button
        className={`btn btn-sm join-item ${chartUnit == "hour" && "btn-primary"}`}
        onClick={() => {
          setChartUnit("hour");
        }}
      >
        Hour
      </button>
    </div>
  );
}
