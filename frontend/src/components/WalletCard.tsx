import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { formatUnits } from "viem";
import { injected } from "wagmi/connectors";

export default function WalletCard() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  return (
    <section className="card glass">
      <h2>Wallet</h2>

      {!isConnected ? (
        <button
          className="btn-primary"
          onClick={() => connect({ connector: injected() })}
          disabled={connecting}
        >
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <button className="btn-ghost" onClick={() => disconnect()}>
          Disconnect
        </button>
      )}

      <p className="mono account">
        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
      </p>

      {isConnected && balance && chain && (
        <p className="mono">
          Balance: <span>{formatUnits(balance.value, balance.decimals)} {balance.symbol}</span>
        </p>
      )}

      {isConnected && chain && (
        <p className="mono">
          Network: <span>{chain.name}</span>
        </p>
      )}
    </section>
  );
}