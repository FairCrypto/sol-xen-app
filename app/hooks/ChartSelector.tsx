import { useEffect, useRef, useState } from "react";
import { ChartUnit } from "@/app/Api";

export function useChartSelector(): [
  ChartUnit,
  (unit: ChartUnit) => void,
  (unit: ChartUnit) => void,
] {
  const [chartUnit, setChartUnit] = useState<ChartUnit>();

  function setAndStoreChartUnit(unit: ChartUnit) {
    if (unit) {
      setChartUnit(unit);
      if (window?.localStorage) {
        window.localStorage.setItem("chartUnit", unit);
      }
    }
  }

  const firstTime = useRef(true);
  useEffect(() => {
    if (firstTime.current) {
      firstTime.current = false;
      if (window?.localStorage) {
        const stored = window.localStorage.getItem("chartUnit");
        if (stored) {
          setChartUnit(stored as ChartUnit);
          return;
        }
      }
      setChartUnit("hour");
    }
  }, [chartUnit, setChartUnit]);

  return [chartUnit, setAndStoreChartUnit, setChartUnit];
}
