import { useEffect, useState } from "react";
import { ChartUnit } from "@/app/Api";

export interface ChartUnitSelectorInterface {
  setChartUnit: (unit: ChartUnit) => void;
  chartUnit: ChartUnit;
}

export function useChartSelector(): [ChartUnit, (unit: ChartUnit) => void] {
  const [chartUnit, setChartUnit] = useState<ChartUnit>();

  useEffect(() => {
    if (chartUnit === undefined) {
      if (window?.localStorage) {
        const stored = window.localStorage.getItem("chartUnit");
        if (stored) {
          setChartUnit(stored as ChartUnit);
          return;
        }

        window.localStorage.setItem("chartUnit", "hour");
        setChartUnit("hour");
      }
    } else {
      if (window?.localStorage) {
        window.localStorage.setItem("chartUnit", chartUnit);
      }
    }
  }, [chartUnit, setChartUnit]);

  return [chartUnit, setChartUnit];
}
