import { useEffect, useState } from "react";
import { formatUnits, isAddress, type Address } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { toast } from "sonner";
import { erc20Abi } from "../abi";
import { DEPLOYMENTS, ZERO_ADDRESS } from "../contracts";

export default function TokenInfoCard() {
  const { address: account, chain } = useAccount();
  const deployment = chain ? DEPLOYMENTS[chain.id] : undefined;

  const preset =
    deployment && deployment.tokenAddress !== ZERO_ADDRESS
      ? deployment.tokenAddress
      : "";

  const [input, setInput] = useState<string>(preset);

  useEffect(() => {
    if (preset) setInput(preset);
  }, [preset]);

  const tokenAddress: Address = isAddress(input) ? (input as Address) : ZERO_ADDRESS;
  const enabled = isAddress(input);

  const name = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "name",
    query: { enabled },
  });

  const symbol = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled },
  });

  const decimals = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled },
  });

  const supply = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "totalSupply",
    query: { enabled },
  });

  const balance = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: account ? [account] : undefined,
    query: { enabled: enabled && account !== undefined },
  });

  const firstError =
    name.error ?? symbol.error ?? decimals.error ?? supply.error ?? balance.error;

  useEffect(() => {
    if (firstError) {
      toast.error(firstError.message.split("\n")[0] ?? "Failed to load token info");
    }
  }, [firstError]);

  const decimalsValue = decimals.data ?? 18;
  const isLoading =
    name.isLoading || symbol.isLoading || decimals.isLoading || supply.isLoading;

  return (
    <section className="card glass">
      <h2>Token Info</h2>

      <label htmlFor="tokenAddress">Contract Address</label>
      <input
        id="tokenAddress"
        type="text"
        placeholder="0x..."
        autoComplete="off"
        spellCheck={false}
        value={input}
        onChange={(e) => setInput(e.target.value.trim())}
      />

      {isLoading && <p className="mono">Loading...</p>}

      {decimals.data !== undefined && (
        <div className="mono token-info">
          <p>
            Name: <span>{name.data ?? "-"}</span>
          </p>
          <p>
            Symbol: <span>{symbol.data ?? "-"}</span>
          </p>
          <p>
            Decimals: <span>{decimals.data}</span>
          </p>
          <p>
            Total Supply:{" "}
            <span>
              {supply.data !== undefined
                ? formatUnits(supply.data, decimalsValue)
                : "-"}
            </span>
          </p>
          {balance.data !== undefined && (
            <p>
              Your Balance:{" "}
              <span>{formatUnits(balance.data, decimalsValue)}</span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}