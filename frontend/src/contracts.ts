import type { Address } from "viem";
import { sepolia } from "wagmi/chains";

export interface Deployment {
  /** Main ERC20 token for the project (may be mock during testnet phase) */
  tokenAddress: Address;
  /** Staking contract address */
  stakingAddress: Address;
  /** Token that exposes a public faucet() for testnet demos */
  mockTokenAddress: Address;
  /** Uniswap V2 router */
  routerAddress: Address;
  /** Wrapped ETH */
  wethAddress: Address;
}

export const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

export const DEPLOYMENTS: Record<number, Deployment> = {
  [sepolia.id]: {
    // Fill these after running DeployMockStack.s.sol
    tokenAddress: ZERO_ADDRESS,
    stakingAddress: ZERO_ADDRESS,
    mockTokenAddress: ZERO_ADDRESS,
    routerAddress: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008",
    wethAddress: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  },
};

export function isConfigured(deployment: Deployment): boolean {
  return (
    deployment.tokenAddress !== ZERO_ADDRESS &&
    deployment.stakingAddress !== ZERO_ADDRESS
  );
}