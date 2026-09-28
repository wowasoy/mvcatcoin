import "./styles.css";
import { formatUnits, isAddress, type Address, type Hash } from "viem";
import { erc20Abi, stakingAbi } from "./abi.ts";
import {
  buildPublicClient,
  buildWalletClient,
  getProvider,
  requestAccounts,
} from "./chain.ts";
import type { AppState, StakingFunction } from "./types.ts";

const state: AppState = {
  walletClient: null,
  publicClient: buildPublicClient(),
  account: null,
};

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element: #${id}`);
  return node as T;
}

function setStatus(message: string): void {
  el<HTMLParagraphElement>("stakingStatus").textContent = message;
}

function setAccount(address: Address | null): void {
  state.account = address;
  el<HTMLParagraphElement>("account").textContent = address ?? "Not connected";
}

function extractMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const candidate = err as { shortMessage?: string; message?: string };
    return candidate.shortMessage ?? candidate.message ?? "Unknown error";
  }
  return String(err);
}

async function connect(): Promise<void> {
  const provider = getProvider();
  if (!provider) {
    setStatus("No EVM wallet detected. Install MetaMask, Rabby, or OKX Wallet.");
    return;
  }

  try {
    const wallet = buildWalletClient(provider);
    state.walletClient = wallet;
    const account = await requestAccounts(wallet);
    setAccount(account);

    provider.on("accountsChanged", (accounts) => {
      setAccount(accounts[0] ?? null);
    });
  } catch (err) {
    setStatus(`Connect error: ${extractMessage(err)}`);
  }
}

async function loadTokenInfo(): Promise<void> {
  const client = state.publicClient;
  if (!client) return;

  const raw = el<HTMLInputElement>("tokenAddress").value.trim();
  if (!isAddress(raw)) {
    setStatus("Invalid token address.");
    return;
  }
  const tokenAddress = raw as Address;

  try {
    const account = state.account;

    const [name, symbol, decimals, supply, balance] = await Promise.all([
      client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "name" }),
      client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "symbol" }),
      client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "decimals" }),
      client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "totalSupply" }),
      account
        ? client.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [account],
          })
        : Promise.resolve(0n),
    ]);

    el("tokenInfo").innerHTML = [
      `<p>Name: <span>${name}</span></p>`,
      `<p>Symbol: <span>${symbol}</span></p>`,
      `<p>Decimals: <span>${decimals}</span></p>`,
      `<p>Total Supply: <span>${formatUnits(supply, decimals)}</span></p>`,
      `<p>Your Balance: <span>${formatUnits(balance, decimals)}</span></p>`,
    ].join("");
  } catch (err) {
    setStatus(`Read error: ${extractMessage(err)}`);
  }
}

function parseAmount(): bigint {
  const raw = el<HTMLInputElement>("stakeAmount").value.trim();
  if (!raw) return 0n;
  try {
    return BigInt(raw);
  } catch {
    return 0n;
  }
}

async function writeStaking(fn: StakingFunction, args: readonly unknown[]): Promise<void> {
  const wallet = state.walletClient;
  const account = state.account;
  if (!wallet || !account) {
    setStatus("Connect wallet first.");
    return;
  }

  const raw = el<HTMLInputElement>("stakingAddress").value.trim();
  if (!isAddress(raw)) {
    setStatus("Invalid staking contract address.");
    return;
  }
  const stakingAddress = raw as Address;

  try {
    const hash: Hash = await wallet.writeContract({
      address: stakingAddress,
      abi: stakingAbi,
      functionName: fn,
      args,
      account,
      chain: wallet.chain ?? null,
    });
    setStatus(`${fn} tx: ${hash}`);
  } catch (err) {
    setStatus(`${fn} error: ${extractMessage(err)}`);
  }
}

function bind(): void {
  el<HTMLButtonElement>("connect").addEventListener("click", () => {
    void connect();
  });
  el<HTMLButtonElement>("loadInfo").addEventListener("click", () => {
    void loadTokenInfo();
  });
  el<HTMLButtonElement>("stake").addEventListener("click", () => {
    void writeStaking("stake", [parseAmount()]);
  });
  el<HTMLButtonElement>("withdraw").addEventListener("click", () => {
    void writeStaking("withdraw", [parseAmount()]);
  });
  el<HTMLButtonElement>("claim").addEventListener("click", () => {
    void writeStaking("claimReward", []);
  });
}

document.addEventListener("DOMContentLoaded", bind);