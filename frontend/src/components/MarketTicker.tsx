import { useMarketTicker, type TickerItem } from "../hooks/useMarketTicker";

function formatPrice(value: number): string {
  if (value >= 1000)
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(6)}`;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

function TickerRow({
  items,
  direction,
  duration,
}: {
  items: TickerItem[];
  direction: "left" | "right";
  duration: number;
}) {
  const tripled = [...items, ...items, ...items];

  return (
    <div className="ticker-row">
      <div
        className={`ticker-track ticker-${direction}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {tripled.map((item, i) => (
          <span className="ticker-item" key={`${item.id}-${i}`}>
            <span className="ticker-symbol">{item.symbol}</span>
            <span className="ticker-price">{formatPrice(item.price)}</span>
            <span
              className={`ticker-change ${item.change24h >= 0 ? "up" : "down"}`}
            >
              {formatChange(item.change24h)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MarketTicker() {
  const { data, loading } = useMarketTicker();

  if (loading && data.length === 0) {
    return (
      <div className="market-ticker">
        <div className="ticker-loading">Loading market data…</div>
      </div>
    );
  }

  const mid = Math.ceil(data.length / 2);
  const topRow = data.slice(0, mid);
  const bottomRow = data.slice(mid);

  return (
    <div className="market-ticker" aria-label="Cryptocurrency prices">
      <TickerRow items={topRow} direction="left" duration={40} />
      <TickerRow items={bottomRow} direction="right" duration={50} />
    </div>
  );
}