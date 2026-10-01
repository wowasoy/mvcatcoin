import { formatUnits } from "viem";
import { usePrice } from "../hooks/usePrice";

interface PriceDisplayProps {
  /** Amount in token's smallest unit (wei) */
  amount: bigint | undefined;
  /** Decimals of the token being quoted */
  decimals: number;
  /** Symbol used to find the matching Chainlink feed (e.g. "ETH") */
  priceSymbol: string;
  /** If true, renders nothing when amount is zero or undefined */
  hideWhenZero?: boolean;
}

/**
 * Renders an approximate USD value for a token amount,
 * sourced from a Chainlink price feed.
 */
export default function PriceDisplay({
  amount,
  decimals,
  priceSymbol,
  hideWhenZero = true,
}: PriceDisplayProps) {
  const { price, isLoading } = usePrice(priceSymbol);

  if (hideWhenZero && (!amount || amount === 0n)) return null;
  if (isLoading && !price) return null;
  if (!price || amount === undefined) return null;

  const tokenAmount = Number(formatUnits(amount, decimals));
  const usdValue = tokenAmount * price;

  return (
    <p className="mono price-display">
      ≈ ${usdValue.toFixed(2)} USD
      <span className="price-source"> · Chainlink</span>
    </p>
  );
}