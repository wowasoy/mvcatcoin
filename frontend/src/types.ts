import type { Address, PublicClient, WalletClient } from "viem";

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on(event: "accountsChanged", handler: (accounts: Address[]) => void): void;
  on(event: "chainChanged", handler: (chainId: string) => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
}

export interface AppState {
  walletClient: WalletClient | null;
  publicClient: PublicClient | null;
  account: Address | null;
}

export type StakingFunction = "stake" | "withdraw" | "claimReward";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}