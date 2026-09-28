import { parseAbi } from "viem";

export const erc20Abi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
]);

export const stakingAbi = parseAbi([
  "function stake(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function claimReward()",
  "function staked(address) view returns (uint256)",
  "function earned(address) view returns (uint256)",
]);