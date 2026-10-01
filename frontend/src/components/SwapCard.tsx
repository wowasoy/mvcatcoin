import { useEffect, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";
import { erc20Abi, routerAbi } from "../abi";
import {
  NATIVE_ETH,
  ROUTER_SEPOLIA,
  SEPOLIA_TOKENS,
  buildPath,
  type Token,
} from "../tokens";
import { TokenIcon } from "./TokenIcons";
import PriceDisplay from "./PriceDisplay";

const SEPOLIA_CHAIN_ID = 11155111;

/**
 * Symbol used for Chainlink price lookup.
 * WETH shares the ETH feed since WETH is 1:1 with ETH.
 */
function priceSymbolFor(token: Token): string {
  return token.symbol === "WETH" ? "ETH" : token.symbol;
}

export default function SwapCard() {
  const { address: account, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [fromToken, setFromToken] = useState<Token>(NATIVE_ETH);
  const [toToken, setToToken] = useState<Token>(SEPOLIA_TOKENS[2]);
  const [amount, setAmount] = useState("");
  const [picker, setPicker] = useState<"from" | "to" | null>(null);

  const onSepolia = chain?.id === SEPOLIA_CHAIN_ID;
  const canFetch = !!account && onSepolia;

  const { data: ethBalance } = useBalance({
    address: account,
    query: { enabled: canFetch },
  });

  const { data: fromBalance } = useReadContract({
    address: fromToken.isNative ? undefined : fromToken.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: account ? [account] : undefined,
    query: { enabled: canFetch && !fromToken.isNative },
  });

  const amountIn = useMemo(() => {
    if (!amount) return 0n;
    try {
      return parseUnits(amount, fromToken.decimals);
    } catch {
      return 0n;
    }
  }, [amount, fromToken.decimals]);

  const path = useMemo(() => buildPath(fromToken, toToken), [fromToken, toToken]);

  const { data: quote, isLoading: quoting } = useReadContract({
    address: ROUTER_SEPOLIA,
    abi: routerAbi,
    functionName: "getAmountsOut",
    args: amountIn > 0n ? [amountIn, path] : undefined,
    query: { enabled: canFetch && amountIn > 0n },
  });

  const expectedOut = quote && quote.length > 0 ? quote[quote.length - 1] : undefined;

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (writeError) toast.error(writeError.message.split("\n")[0] ?? "Swap failed");
  }, [writeError]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Swap confirmed");
      setAmount("");
    }
  }, [isSuccess]);

  const { data: allowance } = useReadContract({
    address: fromToken.isNative ? undefined : fromToken.address,
    abi: erc20Abi,
    functionName: "allowance",
    args: account ? [account, ROUTER_SEPOLIA] : undefined,
    query: { enabled: canFetch && !fromToken.isNative },
  });

  const needsApproval =
    !fromToken.isNative && allowance !== undefined && amountIn > 0n && allowance < amountIn;

  const availableBalance = fromToken.isNative
    ? ethBalance?.value ?? 0n
    : fromBalance ?? 0n;

  const handleMax = () => {
    if (!account || availableBalance === 0n) return;
    const adjusted =
      fromToken.isNative && availableBalance > 10n ** 15n
        ? availableBalance - 10n ** 15n
        : availableBalance;
    setAmount(formatUnits(adjusted, fromToken.decimals));
  };

  const handleSwap = () => {
    if (!account) {
      toast.info("Connect your wallet to start swapping");
      return;
    }
    if (!onSepolia) {
      switchChain?.({ chainId: SEPOLIA_CHAIN_ID });
      return;
    }
    if (fromToken.symbol === toToken.symbol) {
      toast.error("Pick two different tokens");
      return;
    }
    if (amountIn === 0n) {
      toast.error("Enter an amount first");
      return;
    }
    if (amountIn > availableBalance) {
      toast.error(`Insufficient ${fromToken.symbol} balance`);
      return;
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
    const minOut = expectedOut ? (expectedOut * 97n) / 100n : 0n;

    if (needsApproval) {
      writeContract({
        address: fromToken.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [ROUTER_SEPOLIA, amountIn],
      });
      toast.info("Approve submitted. Confirm then swap again.");
      return;
    }

    if (fromToken.isNative) {
      writeContract({
        address: ROUTER_SEPOLIA,
        abi: routerAbi,
        functionName: "swapExactETHForTokens",
        args: [minOut, path, account, deadline],
        value: amountIn,
      });
      return;
    }

    if (toToken.isNative) {
      writeContract({
        address: ROUTER_SEPOLIA,
        abi: routerAbi,
        functionName: "swapExactTokensForETH",
        args: [amountIn, minOut, path, account, deadline],
      });
      return;
    }

    writeContract({
      address: ROUTER_SEPOLIA,
      abi: routerAbi,
      functionName: "swapExactTokensForTokens",
      args: [amountIn, minOut, path, account, deadline],
    });
  };

  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount("");
  };

  const busy = isPending || confirming;

  const buttonLabel = (() => {
    if (!account) return "Connect Wallet";
    if (!onSepolia) return "Switch to Sepolia";
    if (busy) return "Swapping...";
    if (needsApproval) return `Approve ${fromToken.symbol}`;
    if (amountIn === 0n) return "Enter an amount";
    return `Swap ${fromToken.symbol} for ${toToken.symbol}`;
  })();

  const buttonDisabled = busy || (!!account && onSepolia && amountIn === 0n);
  const balanceDisplay = !account
    ? "—"
    : formatUnits(availableBalance, fromToken.decimals).slice(0, 10);

  return (
    <section className="card glass">
      <div className="card-header">
        <h2>Swap</h2>
        <span className={`card-tag ${onSepolia ? "live" : ""}`}>
          {onSepolia ? "Sepolia" : "Uniswap V2"}
        </span>
      </div>

      <div className="swap-box">
        <div className="swap-row">
          <span className="swap-label">From</span>
          <button
            className="token-picker"
            onClick={() => setPicker("from")}
            type="button"
          >
            <TokenIcon logoKey={fromToken.logoKey} size={22} />
            <span>{fromToken.symbol}</span>
          </button>
        </div>

        <div className="swap-row input-row">
          <input
            className="swap-input"
            type="text"
            placeholder="0.0"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          />
          <button className="max-btn" onClick={handleMax} type="button">
            MAX
          </button>
        </div>

        <div className="swap-row info-row">
          <span>Balance: {balanceDisplay}</span>
        </div>
      </div>

      <div className="swap-flip">
        <button onClick={handleFlip} type="button" aria-label="Flip tokens">
          ⇅
        </button>
      </div>

      <div className="swap-box">
        <div className="swap-row">
          <span className="swap-label">To</span>
          <button
            className="token-picker"
            onClick={() => setPicker("to")}
            type="button"
          >
            <TokenIcon logoKey={toToken.logoKey} size={22} />
            <span>{toToken.symbol}</span>
          </button>
        </div>

        <div className="swap-row input-row">
          <div className="swap-output">
            {quoting && amountIn > 0n
              ? "Quoting..."
              : expectedOut !== undefined
              ? formatUnits(expectedOut, toToken.decimals).slice(0, 12)
              : "0.0"}
          </div>
        </div>

        {/* Chainlink USD reference for the output token */}
        <PriceDisplay
          amount={expectedOut}
          decimals={toToken.decimals}
          priceSymbol={priceSymbolFor(toToken)}
        />
      </div>

      <button
        className="btn-primary swap-btn"
        onClick={handleSwap}
        disabled={buttonDisabled}
        type="button"
      >
        {buttonLabel}
      </button>

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

      {picker && (
        <div className="token-modal" onClick={() => setPicker(null)}>
          <div className="token-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="token-modal-header">
              <h3>Select token</h3>
              <button onClick={() => setPicker(null)} type="button">
                ×
              </button>
            </div>
            <ul className="token-list">
              {SEPOLIA_TOKENS.map((t) => (
                <li key={t.symbol}>
                  <button
                    type="button"
                    className="token-item"
                    onClick={() => {
                      if (picker === "from") setFromToken(t);
                      else setToToken(t);
                      setPicker(null);
                      setAmount("");
                    }}
                  >
                    <TokenIcon logoKey={t.logoKey} size={32} />
                    <div className="token-item-info">
                      <span className="token-item-symbol">{t.symbol}</span>
                      <span className="token-item-name">{t.name}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}