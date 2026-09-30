import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";
import { erc20Abi, mockTokenAbi, stakingAbi } from "../abi";
import { DEPLOYMENTS, isConfigured, ZERO_ADDRESS } from "../contracts";

const SEPOLIA_CHAIN_ID = 11155111;

type Fn = "stake" | "withdraw" | "claimReward";

export default function StakingCard() {
  const { address: account, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const deployment = chain ? DEPLOYMENTS[chain.id] : undefined;
  const [amount, setAmount] = useState("");

  const onSepolia = chain?.id === SEPOLIA_CHAIN_ID;
  const configured = !!deployment && isConfigured(deployment);

  const tokenAddr = deployment?.mockTokenAddress ?? ZERO_ADDRESS;
  const stakingAddr = deployment?.stakingAddress ?? ZERO_ADDRESS;

  const canRead = configured && onSepolia && !!account;

  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: tokenAddr,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: account ? [account] : undefined,
    query: { enabled: canRead, refetchInterval: 12_000 },
  });

  const { data: tokenSymbol } = useReadContract({
    address: tokenAddr,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled: configured },
  });

  const { data: tokenDecimals } = useReadContract({
    address: tokenAddr,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: configured },
  });

  const { data: stakedAmount, refetch: refetchStaked } = useReadContract({
    address: stakingAddr,
    abi: stakingAbi,
    functionName: "staked",
    args: account ? [account] : undefined,
    query: { enabled: canRead, refetchInterval: 12_000 },
  });

  const { data: earnedAmount, refetch: refetchEarned } = useReadContract({
    address: stakingAddr,
    abi: stakingAbi,
    functionName: "earned",
    args: account ? [account] : undefined,
    query: { enabled: canRead, refetchInterval: 3_000 },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddr,
    abi: erc20Abi,
    functionName: "allowance",
    args: account ? [account, stakingAddr] : undefined,
    query: { enabled: canRead, refetchInterval: 12_000 },
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (writeError) toast.error(writeError.message.split("\n")[0] ?? "Transaction failed");
  }, [writeError]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction confirmed");
      refetchBalance();
      refetchStaked();
      refetchEarned();
      refetchAllowance();
    }
  }, [isSuccess, refetchBalance, refetchStaked, refetchEarned, refetchAllowance]);

  const decimals = tokenDecimals ?? 18;
  const symbol = tokenSymbol ?? "MRWD";

  const parsedAmount = (() => {
    if (!amount) return 0n;
    try {
      return parseUnits(amount, decimals);
    } catch {
      return 0n;
    }
  })();

  const needsApproval = allowance !== undefined && parsedAmount > 0n && allowance < parsedAmount;

  const handleFaucet = () => {
    if (!account) return toast.info("Connect your wallet first");
    if (!onSepolia) {
      switchChain?.({ chainId: SEPOLIA_CHAIN_ID });
      return;
    }
    if (!configured) return toast.info("Contract not configured");

    writeContract({
      address: tokenAddr,
      abi: mockTokenAbi,
      functionName: "faucet",
    });
    toast.info("Claiming 1,000 test tokens...");
  };

  const handleMax = () => {
    if (!tokenBalance) return;
    setAmount(formatUnits(tokenBalance, decimals));
  };

  const call = (fn: Fn) => {
    if (!account) return toast.info("Connect your wallet to start staking");
    if (!onSepolia) {
      switchChain?.({ chainId: SEPOLIA_CHAIN_ID });
      return;
    }
    if (!configured) return toast.info("Staking is launching soon");

    if (fn === "claimReward") {
      writeContract({
        address: stakingAddr,
        abi: stakingAbi,
        functionName: "claimReward",
      });
      return;
    }

    if (parsedAmount === 0n) {
      toast.error("Enter an amount first");
      return;
    }

    if (fn === "stake" && needsApproval) {
      writeContract({
        address: tokenAddr,
        abi: erc20Abi,
        functionName: "approve",
        args: [stakingAddr, parsedAmount],
      });
      toast.info("Approve submitted. Confirm then stake again.");
      return;
    }

    writeContract({
      address: stakingAddr,
      abi: stakingAbi,
      functionName: fn,
      args: [parsedAmount],
    });
  };

  const busy = isPending || confirming;

  const balanceLabel = tokenBalance !== undefined
    ? formatUnits(tokenBalance, decimals).slice(0, 10)
    : "—";
  const stakedLabel = stakedAmount !== undefined
    ? formatUnits(stakedAmount, decimals).slice(0, 10)
    : "—";
  const earnedLabel = earnedAmount !== undefined
    ? formatUnits(earnedAmount, decimals).slice(0, 12)
    : "—";

  const stakeLabel = (() => {
    if (!account) return "Connect Wallet";
    if (!onSepolia) return "Switch to Sepolia";
    if (!configured) return "Coming Soon";
    if (busy) return "Pending...";
    if (needsApproval) return `Approve ${symbol}`;
    return "Stake";
  })();

  return (
    <section className="card glass">
      <div className="card-header">
        <h2>Staking</h2>
        <span className={`card-tag ${configured ? "live" : "soon"}`}>
          {configured ? "Live" : "Coming Soon"}
        </span>
      </div>

      <p className="card-subtitle">
        Stake {symbol} to earn rewards from the pool. Rewards accrue per second.
      </p>

      <div className="stat-grid">
        <div className="stat-item">
          <span className="stat-label">Your {symbol}</span>
          <span className="stat-value">{balanceLabel}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Staked</span>
          <span className="stat-value">{stakedLabel}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Earned</span>
          <span className="stat-value accent">{earnedLabel}</span>
        </div>
      </div>

      <div className="row" style={{ marginBottom: "0.75rem" }}>
        <button
          className="btn-ghost faucet-btn"
          onClick={handleFaucet}
          disabled={busy || !configured}
          type="button"
        >
          Get 1,000 Test Tokens
        </button>
      </div>

      <label htmlFor="stakeAmount">Amount ({symbol})</label>
      <div className="input-row" style={{ marginBottom: "0.75rem" }}>
        <input
          id="stakeAmount"
          type="text"
          placeholder="100"
          autoComplete="off"
          spellCheck={false}
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          style={{ marginBottom: 0 }}
        />
        <button className="max-btn" onClick={handleMax} type="button">
          MAX
        </button>
      </div>

      <div className="row">
        <button
          className="btn-primary"
          onClick={() => call("stake")}
          disabled={busy || (configured && !account)}
          type="button"
        >
          {stakeLabel}
        </button>
        <button
          className="btn-ghost"
          onClick={() => call("withdraw")}
          disabled={busy || !configured}
          type="button"
        >
          Withdraw
        </button>
        <button
          className="btn-ghost"
          onClick={() => call("claimReward")}
          disabled={busy || !configured}
          type="button"
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