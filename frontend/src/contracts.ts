import type { Address } from "viem";
import { sepolia } from "wagmi/chains";

export interface Deployment {
  tokenAddress: Address;
  stakingAddress: Address;
  routerAddress: Address;
  wethAddress: Address;
}

export const DEPLOYMENTS: Record<number, Deployment> = {
  [sepolia.id]: {
    tokenAddress: "0x0000000000000000000000000000000000000000",
    stakingAddress: "0x0000000000000000000000000000000000000000",
    routerAddress: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008",
    wethAddress: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  },
};

export const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

export function isConfigured(deployment: Deployment): boolean {
  return (
    deployment.tokenAddress !== ZERO_ADDRESS &&
    deployment.stakingAddress !== ZERO_ADDRESS
  );
}