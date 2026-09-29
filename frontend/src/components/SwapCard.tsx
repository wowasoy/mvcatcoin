import { useEffect, useState } from "react";
import { parseUnits, type Address } from "viem";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";
import { erc20Abi, routerAbi } from "../abi";
import { DEPLOYMENTS, isConfigured } from "../contracts";

type Direction = "eth-to-token" | "token-to-eth";

export default function SwapCard() {
  const { address: account, chain } = useAccount();
  const deployment = chain ? DEPLOYMENTS[chain.id] : undefined;
  const [amount, setAmount] = useState("");

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (writeError) {
      toast.error(writeError.message.split("\n")[0] ?? "Swap failed");
    }
  }, [writeError]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Swap confirmed");
    }
  }, [isSuccess]);

  if (!deployment || !isConfigured(deployment)) {
    return (
      <section className="card glass">
        <h2>Swap</h2>
        <p className="mono">
          Contract not configured for this network. Deploy token first.
        </p>
      </section>
    );
  }

  const handleSwap = (direction: Direction) => {
    if (!account) {
      toast.error("Connect wallet first");
      return;
    }

    let amountIn: bigint;
    try {
      amountIn = parseUnits(amount, 18);
    } catch {
      toast.error("Invalid amount");
      return;
    }

    if (amountIn === 0n) {
      toast.error("Enter an amount");
      return;
    }

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
      toast.info("Approve submitted. After confirming, run Swap again.");
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
          {busy ? "Pending..." : "Swap ETH \u2192 MVCAT"}
        </button>
        <button
          className="btn-ghost"
          onClick={() => handleSwap("token-to-eth")}
          disabled={busy}
        >
          Approve MVCAT
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