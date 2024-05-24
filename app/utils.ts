export const humanizeHashRate = (hashRate: number): string => {
  if (typeof hashRate !== "number" || isNaN(hashRate)) {
    return "";
  }

  if (hashRate >= 1e9) {
    return (hashRate / 1e9).toFixed(2) + " GH/s";
  } else if (hashRate >= 1e6) {
    return (hashRate / 1e6).toFixed(2) + " MH/s";
  } else if (hashRate >= 1e3) {
    return (hashRate / 1e3).toFixed(2) + " KH/s";
  }
  return hashRate.toFixed(2) + " H/s";
};

export function humanizeNumber(num: number) {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}
