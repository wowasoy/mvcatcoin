import { useState } from "react";
import { formatUnits, isAddress, type Address } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { toast } from "sonner";
import { erc20Abi } from "../abi";
import { DEPLOYMENTS } from "../contracts";
import { sepolia } from "wagmi/chains";

export default function TokenInfoCard() {
  const { address: account, chain } = useAccount();
  const deployment = chain ? DEPLOYMENTS[chain.id] : undefined;
  const [input, setInput] = useState<string>(
    deployment?.tokenAddress !== "0x0000000000000000000000000000000000000000"
      ? deployment?.tokenAddress ?? ""
      : "",
  );

  const tokenAddress = isAddress(input) ? (input as Address) : undefined;

  const { data, isLoading, isError, error } = useReadContracts({
    contracts: tokenAddress
      ? [
          { address: tokenAddress, abi: erc20Abi, functionName: "name" },
          { address: tokenAddress, abi: erc20Abi, functionName: "symbol" },
          { address: tokenAddress, abi: erc20Abi, functionName: "decimals" },
          { address: tokenAddress, abi: erc20Abi, functionName: "totalSupply" },
          ...(account
            ? [
                {
                  address: tokenAddress,
                  abi: erc20Abi,
                  functionName: "balanceOf" as const,
                  args: [account] as const,
                },
              ]
            : []),
        ]
      : [],
    query: { enabled: !!tokenAddress },
  });

  if (isError) {
    toast.error(error?.message.split("\n")[0] ?? "Failed to load token info");
  }

  const [name, symbol, decimals, supply, balance] = data ?? [];

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

      {data && decimals?.result !== undefined && (
        <div className="mono token-info">
          <p>Name: <span>{name?.result as string}</span></p>
          <p>Symbol: <span>{symbol?.result as string}</span></p>
          <p>Decimals: <span>{decimals.result as number}</span></p>
          <p>
            Total Supply:{" "}
            <span>
              {formatUnits(supply?.result as bigint ?? 0n, decimals.result as number)}
            </span>
          </p>
          {balance?.result !== undefined && (
            <p>
              Your Balance:{" "}
              <span>
                {formatUnits(balance.result as bigint, decimals.result as number)}
              </span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}