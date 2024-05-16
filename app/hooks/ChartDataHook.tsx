import { useEffect, useRef, useState } from "react";
import { TimeChartEntry } from "@/app/components/BarChart";
import { fetchHashEventStats } from "@/app/leaderboard/Api";

export default function useChartData(): [
  TimeChartEntry[],
  (value: Map<number, number>) => void,
  (value: Map<number, number>) => void,
  (date: Date, value: number) => void,
] {
  const [mappedChartData, _setMappedChartData] = useState<Map<number, number>>(
    new Map(),
  );
  const [chartData, setChartData] = useState<TimeChartEntry[]>([]);

  const mappedChartDataRef = useRef(mappedChartData);
  mappedChartDataRef.current = mappedChartData;

  /**
   * Increments or sets the value of a specific date in the chart data
   */
  function incrementsMappedChartData(date: Date, value: number) {
    date.setMilliseconds(0);
    date.setSeconds(0);

    // console.log("Incrementing mapped chart data...", date.toISOString(), value);
    const newMappedChartData = new Map<number, number>(
      mappedChartDataRef.current,
    );
    newMappedChartData.set(
      new Date(date).getTime(),
      (newMappedChartData.get(date.getTime()) || 0) + value,
    );
    _setMappedChartData(newMappedChartData);
  }

  function getChartData(mappedChartData: Map<number, number>) {
    const newChartData: TimeChartEntry[] = [];
    const truncatedDate = new Date();
    truncatedDate.setMilliseconds(0);
    truncatedDate.setSeconds(0);

    for (const [key, value] of mappedChartData.entries()) {
      if (new Date(key).getTime() < truncatedDate.getTime() - 60 * 60 * 1000) {
        continue;
      }
      newChartData.push({ x: new Date(key), y: value });
    }

    newChartData.sort((a, b) => a.x.getTime() - b.x.getTime());
    return newChartData;
  }

  function updateMappedChartData(mappedChartData: Map<number, number>) {
    // console.log("Updating mapped chart data...", mappedChartData.size)
    const currentTime = new Date();
    currentTime.setMilliseconds(0);
    currentTime.setSeconds(0);

    // remove the current time from the map to prevent overwriting real-time data with stale data
    mappedChartData.delete(currentTime.getTime());

    const newMappedChartData = new Map([
      ...mappedChartDataRef.current,
      ...mappedChartData,
    ]);

    // Remove data older than 1 hour
    for (const [key] of newMappedChartData.entries()) {
      if (new Date(key).getTime() < currentTime.getTime() - 65 * 60 * 1000) {
        // console.log("Removing old data...", new Date(key).toISOString());
        newMappedChartData.delete(key);
      }
    }

    _setMappedChartData(newMappedChartData);
    setChartData(getChartData(mappedChartDataRef.current));
  }

  function setMappedChartData(mappedHashesData: Map<number, number>) {
    // console.log("Setting mapped chart data...", mappedHashesData.size);
    _setMappedChartData(mappedHashesData);
  }

  // Update the chart data every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(getChartData(mappedChartDataRef.current));
    }, 500);
    return () => clearInterval(interval);
  }, [mappedChartDataRef]);

  return [
    chartData,
    setMappedChartData,
    updateMappedChartData,
    incrementsMappedChartData,
  ];
}
