import { useState } from "react";
import { parseUnits, type Address } from "viem";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "sonner";
import { erc20Abi, routerAbi } from "../abi";
import { DEPLOYMENTS, isConfigured, ZERO_ADDRESS } from "../contracts";

type Direction = "eth-to-token" | "token-to-eth";

export default function SwapCard() {
  const { address: account, chain } = useAccount();
  const deployment = chain ? DEPLOYMENTS[chain.id] : undefined;
  const [amount, setAmount] = useState("");

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  if (writeError) toast.error(writeError.message.split("\n")[0]);
  if (isSuccess) toast.success("Swap confirmed");

  if (!deployment || !isConfigured(deployment)) {
    return (
      <section className="card glass">
        <h2>Swap</h2>
        <p className="mono">Contract not configured for this network.</p>
      </section>
    );
  }

  const handleSwap = (direction: Direction) => {
    if (!account) return toast.error("Connect wallet first");
    let amountIn: bigint;
    try {
      amountIn = parseUnits(amount, 18);
    } catch {
      return toast.error("Invalid amount");
    }
    if (amountIn === 0n) return toast.error("Enter an amount");

    const path: readonly Address[] =
      direction === "eth-to-token"
        ? [deployment.wethAddress, deployment.tokenAddress]
        : [deployment.tokenAddress, deployment.wethAddress];

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

    if (direction === "eth-to-token") {
      writeContract({
        address: deployment.routerAddress,
        abi: routerAbi,
        functionName: "swapExactETHForTokens",
        args: [0n, path, account, deadline],
        value: amountIn,
      });
    } else {
      writeContract({
        address: deployment.tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [deployment.routerAddress, amountIn],
      });
      setTimeout(() => {
        writeContract({
          address: deployment.routerAddress,
          abi: routerAbi,
          functionName: "swapExactTokensForETH",
          args: [amountIn, 0n, path, account, deadline],
        });
      }, 3000);
    }
  };

  const busy = isPending || confirming;

  return (
    <section className="card glass">
      <h2>Swap (Uniswap V2)</h2>

      <label htmlFor="swapAmount">Amount (desimal, contoh: 0.01)</label>
      <input
        id="swapAmount"
        type="text"
        placeholder="0.01"
        autoComplete="off"
        spellCheck={false}
        value={amount}
        onChange={(e) => setAmount(e.target.value.trim())}
      />

      <div className="row">
        <button
          className="btn-primary"
          onClick={() => handleSwap("eth-to-token")}
          disabled={busy}
        >
          {busy ? "Pending..." : "Swap ETH → MVCAT"}
        </button>
        <button
          className="btn-ghost"
          onClick={() => handleSwap("token-to-eth")}
          disabled={busy}
        >
          Swap MVCAT → ETH
        </button>
      </div>

      {hash && (
        <p className="mono">
          Tx:{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {hash.slice(0, 10)}...
          </a>
        </p>
      )}
    </section>
  );
}