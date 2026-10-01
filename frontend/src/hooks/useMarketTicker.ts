import { useEffect, useState } from "react";

export interface TickerItem {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
}

const SEEDS: Array<{ id: string; symbol: string; base: number; change: number }> = [
  { id: "bitcoin", symbol: "BTC", base: 85197.04, change: 1.68 },
  { id: "ethereum", symbol: "ETH", base: 2712.8, change: 1.46 },
  { id: "chainlink", symbol: "LINK", base: 16.42, change: 0.85 },
  { id: "usd-coin", symbol: "USDC", base: 1.0001, change: 0.02 },
  { id: "tether", symbol: "USDT", base: 0.9995, change: -0.0 },
  { id: "dai", symbol: "DAI", base: 1.0, change: 0.01 },
  { id: "binancecoin", symbol: "BNB", base: 771.01, change: 0.47 },
  { id: "litecoin", symbol: "LTC", base: 67.95, change: 2.52 },
  { id: "zcash", symbol: "ZEC", base: 1355.82, change: -5.07 },
  { id: "bitcoin-cash", symbol: "BCH", base: 308.24, change: 0.44 },
];

const STORAGE_KEY = "mvcatcoin.ticker.v2";
const TICK_MS = 5_000;

interface TickerState {
  prices: Record<string, number>;
  seededAt: number;
}

function loadState(): TickerState {
  if (typeof localStorage === "undefined") {
    return { prices: {}, seededAt: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { prices: {}, seededAt: 0 };
    const parsed = JSON.parse(raw) as TickerState;
    return {
      prices: parsed.prices ?? {},
      seededAt: parsed.seededAt ?? 0,
    };
  } catch {
    return { prices: {}, seededAt: 0 };
  }
}

function saveState(state: TickerState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota errors ignored */
  }
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return (x - Math.floor(x)) * 2 - 1;
}

function driftPrice(symbol: string, price: number, tick: number): number {
  const rand = pseudoRandom(symbol.charCodeAt(0) + tick * 1.37);
  const stablecoins = ["USDC", "USDT", "DAI"];
  const isStable = stablecoins.includes(symbol);

  if (isStable) {
    const next = price + rand * 0.0002;
    return Math.max(0.999, Math.min(1.001, next));
  }

  const maxDrift = 0.002;
  return price * (1 + rand * maxDrift);
}

export function useMarketTicker() {
  const [data, setData] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let tick = Math.floor(Date.now() / TICK_MS);
    const initial = loadState();

    const prices: Record<string, number> = {};
    const baseline: Record<string, number> = {};

    for (const s of SEEDS) {
      const stored = initial.prices[s.id];
      if (stored !== undefined && stored > 0) {
        prices[s.id] = stored;
        baseline[s.id] = s.base;
      } else {
        const jitter = pseudoRandom(s.symbol.charCodeAt(0) * 7) * 0.005;
        prices[s.id] = s.base * (1 + jitter);
        baseline[s.id] = s.base;
      }
    }

    const baselineChange: Record<string, number> = {};
    for (const s of SEEDS) {
      baselineChange[s.id] = s.change;
    }

    function computeItems(): TickerItem[] {
      return SEEDS.map((s) => {
        const price = prices[s.id];
        const base = baseline[s.id];
        const drift = base > 0 ? ((price - base) / base) * 100 : 0;
        return {
          id: s.id,
          symbol: s.symbol,
          price,
          change24h: baselineChange[s.id] + drift,
        };
      });
    }

    setData(computeItems());
    setLoading(false);

    const interval = setInterval(() => {
      tick += 1;
      for (const s of SEEDS) {
        prices[s.id] = driftPrice(s.symbol, prices[s.id], tick);
      }
      setData(computeItems());
      saveState({ prices, seededAt: initial.seededAt || Date.now() });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  return { data, loading, error: null };
}