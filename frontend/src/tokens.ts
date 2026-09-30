import type { Address } from "viem";

export interface Token {
  symbol: string;
  name: string;
  address: Address;
  decimals: number;
  logoKey: LogoKey;
  isNative?: boolean;
}

export type LogoKey = "eth" | "weth" | "usdc" | "link" | "dai" | "usdt";

export const WETH_SEPOLIA: Address = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
export const ROUTER_SEPOLIA: Address = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";
export const ETH_SENTINEL: Address = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const NATIVE_ETH: Token = {
  symbol: "ETH",
  name: "Ether (native)",
  address: ETH_SENTINEL,
  decimals: 18,
  logoKey: "eth",
  isNative: true,
};

export const SEPOLIA_TOKENS: Token[] = [
  NATIVE_ETH,
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: WETH_SEPOLIA,
    decimals: 18,
    logoKey: "weth",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    decimals: 6,
    logoKey: "usdc",
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    decimals: 18,
    logoKey: "link",
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
    decimals: 18,
    logoKey: "dai",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
    decimals: 6,
    logoKey: "usdt",
  },
];

export function findToken(symbol: string): Token {
  const token = SEPOLIA_TOKENS.find((t) => t.symbol === symbol);
  if (!token) throw new Error(`Unknown token: ${symbol}`);
  return token;
}

export function buildPath(from: Token, to: Token): Address[] {
  if (from.isNative || to.isNative) {
    const other = from.isNative ? to : from;
    if (other.symbol === "WETH") {
      return from.isNative ? [WETH_SEPOLIA, other.address] : [other.address, WETH_SEPOLIA];
    }
    return from.isNative
      ? [WETH_SEPOLIA, other.address]
      : [other.address, WETH_SEPOLIA];
  }
  if (
    (from.symbol === "WETH" && to.symbol !== "WETH") ||
    (to.symbol === "WETH" && from.symbol !== "WETH")
  ) {
    return [from.address, to.address];
  }
  // Route via WETH for token-to-token
  return [from.address, WETH_SEPOLIA, to.address];
}