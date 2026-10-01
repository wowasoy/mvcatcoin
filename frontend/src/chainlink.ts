import { parseAbi, type Address } from "viem";

/**
 * Minimal ABI for Chainlink AggregatorV3Interface.
 * We only need latestRoundData() and decimals().
 */
export const AGGREGATOR_V3_ABI = parseAbi([
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() view returns (uint8)",
]);

export interface PriceFeed {
  address: Address;
  decimals: number;
  description: string;
}

/**
 * Chainlink Price Feeds on Sepolia testnet.
 * Addresses verified against Chainlink official docs.
 * @see https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1#sepolia-testnet
 */
export const CHAINLINK_FEEDS: Record<string, PriceFeed> = {
  ETH: {
    address: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    decimals: 8,
    description: "ETH / USD",
  },
};

/**
 * Resolve a token symbol to its Chainlink feed.
 * Returns undefined if no feed is configured for that symbol.
 */
export function getPriceFeed(symbol: string): PriceFeed | undefined {
  return CHAINLINK_FEEDS[symbol];
}