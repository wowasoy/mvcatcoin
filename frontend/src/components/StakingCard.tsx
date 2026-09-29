import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";
import { stakingAbi } from "../abi";
import { DEPLOYMENTS, isConfigured } from "../contracts";

type Fn = "stake" | "withdraw" | "claimReward";

export default function StakingCard() {
  const { address: account, chain } = useAccount();
  const deployment = chain ? DEPLOYMENTS[chain.id] : undefined;
  const [amount, setAmount] = useState("");

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (writeError) {
      toast.error(writeError.message.split("\n")[0] ?? "Transaction failed");
    }
  }, [writeError]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction confirmed");
    }
  }, [isSuccess]);

  if (!deployment || !isConfigured(deployment)) {
    return (
      <section className="card glass">
        <h2>Staking</h2>
        <p className="mono">
          Staking contract not deployed. Configure deployment first.
        </p>
      </section>
    );
  }

  const call = (fn: Fn) => {
    if (!account) {
      toast.error("Connect wallet first");
      return;
    }

    if (fn === "claimReward") {
      writeContract({
        address: deployment.stakingAddress,
        abi: stakingAbi,
        functionName: "claimReward",
      });
      return;
    }

    let parsed: bigint;
    try {
      parsed = parseUnits(amount, 18);
    } catch {
      toast.error("Invalid amount");
      return;
    }

    if (parsed === 0n) {
      toast.error("Enter an amount");
      return;
    }

    writeContract({
      address: deployment.stakingAddress,
      abi: stakingAbi,
      functionName: fn,
      args: [parsed],
    });
  };

  const busy = isPending || confirming;

  return (
    <section className="card glass">
      <h2>Staking</h2>

      <label htmlFor="stakeAmount">Amount (MVCAT)</label>
      <input
        id="stakeAmount"
        type="text"
        placeholder="100"
        autoComplete="off"
        spellCheck={false}
        value={amount}
        onChange={(e) => setAmount(e.target.value.trim())}
      />

      <div className="row">
        <button
          className="btn-primary"
          onClick={() => call("stake")}
          disabled={busy}
        >
          {busy ? "Pending..." : "Stake"}
        </button>
        <button
          className="btn-ghost"
          onClick={() => call("withdraw")}
          disabled={busy}
        >
          Withdraw
        </button>
        <button
          className="btn-ghost"
          onClick={() => call("claimReward")}
          disabled={busy}
        >
          Claim
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