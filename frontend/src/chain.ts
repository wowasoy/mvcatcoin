import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";
import type { Address, PublicClient, WalletClient } from "viem";
import type { Eip1193Provider } from "./types.ts";

export const CHAIN = sepolia;

export function getProvider(): Eip1193Provider | null {
  return window.ethereum ?? null;
}

export function buildPublicClient(): PublicClient {
  return createPublicClient({
    chain: CHAIN,
    transport: http(),
  });
}

export function buildWalletClient(provider: Eip1193Provider): WalletClient {
  return createWalletClient({
    chain: CHAIN,
    transport: custom(provider),
  });
}

export async function requestAccounts(client: WalletClient): Promise<Address | null> {
  const accounts = await client.requestAddresses();
  return accounts[0] ?? null;
}