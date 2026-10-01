import { useReadContract } from "wagmi";
import { AGGREGATOR_V3_ABI, getPriceFeed } from "../chainlink";

interface UsePriceResult {
  price: number | null;
  isLoading: boolean;
  updatedAt: number | null;
}

/**
 * Fetch the latest USD price for a given token symbol via Chainlink.
 * Auto-refreshes every 30 seconds.
 *
 * @param symbol - Token symbol matching a configured Chainlink feed (e.g. "ETH")
 * @returns Price in USD, loading state, and last update timestamp
 */
export function usePrice(symbol: string): UsePriceResult {
  const feed = getPriceFeed(symbol);

  const { data, isLoading } = useReadContract({
    address: feed?.address,
    abi: AGGREGATOR_V3_ABI,
    functionName: "latestRoundData",
    query: {
      enabled: !!feed,
      refetchInterval: 30_000,
    },
  });

  if (!data || !feed) {
    return { price: null, isLoading: false, updatedAt: null };
  }

  // data: [roundId, answer, startedAt, updatedAt, answeredInRound]
  const answer = data[1];
  const updatedAt = Number(data[3]);
  const price = Number(answer) / 10 ** feed.decimals;

  return { price, isLoading, updatedAt };
}