import { useState } from "react";
import { isAddress } from "viem";
import { toast } from "sonner";
import { useTokenSecurity, chainName } from "../hooks/useTokenSecurity";

function riskLabel(score: number): string {
  if (score >= 60) return "High Risk";
  if (score >= 30) return "Moderate Risk";
  if (score > 0) return "Low Risk";
  return "No Flags";
}

function riskColor(score: number): string {
  if (score >= 60) return "danger";
  if (score >= 30) return "warn";
  if (score > 0) return "info";
  return "safe";
}

const PRESETS = [
  {
    label: "USDC",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  {
    label: "PEPE",
    address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
  },
  {
    label: "LINK",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  },
];

export default function TokenSecurityCard() {
  const [address, setAddress] = useState("");
  const { result, loading, error, check, reset } = useTokenSecurity();

  const handleCheck = (addr?: string) => {
    const target = addr ?? address;
    if (!isAddress(target)) {
      toast.error("Enter a valid contract address");
      return;
    }
    setAddress(target);
    check(target);
  };

  return (
    <section className="card glass">
      <div className="card-header">
        <h2>Token Safety Check</h2>
        <span className="card-tag live">GoPlus</span>
      </div>

      <p className="card-subtitle">
        Scan any ERC-20 contract for honeypot behavior, taxes, and ownership
        risks before interacting. Multi-chain: Ethereum, Base, BSC, Polygon.
      </p>

      <label htmlFor="securityAddress">Contract Address</label>
      <input
        id="securityAddress"
        type="text"
        placeholder="0x..."
        autoComplete="off"
        spellCheck={false}
        value={address}
        onChange={(e) => {
          setAddress(e.target.value.trim());
          reset();
        }}
      />

      <div className="row security-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className="btn-ghost"
            type="button"
            onClick={() => handleCheck(p.address)}
            disabled={loading}
          >
            Try {p.label}
          </button>
        ))}
      </div>

      <button
        className="btn-primary"
        onClick={() => handleCheck()}
        disabled={loading || address.length === 0}
        type="button"
      >
        {loading ? "Scanning..." : "Scan Token"}
      </button>

      {error && <p className="mono security-error">{error}</p>}

      {result && (
        <div className="security-result">
          <div className={`security-badge ${riskColor(result.riskScore)}`}>
            {riskLabel(result.riskScore)} · {result.riskScore}/100
          </div>

          <p className="security-chain">
            Chain detected: <strong>{chainName(result.chainId)}</strong>
          </p>

          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Honeypot</span>
              <span
                className={`stat-value ${
                  result.isHoneypot ? "danger" : "safe"
                }`}
              >
                {result.isHoneypot ? "YES" : "No"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Buy Tax</span>
              <span className="stat-value">{result.buyTax.toFixed(1)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sell Tax</span>
              <span className="stat-value">{result.sellTax.toFixed(1)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Open Source</span>
              <span
                className={`stat-value ${
                  result.isOpenSource ? "safe" : "danger"
                }`}
              >
                {result.isOpenSource ? "Yes" : "No"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Can Mint</span>
              <span
                className={`stat-value ${result.canMint ? "danger" : "safe"}`}
              >
                {result.canMint ? "Yes" : "No"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pausable</span>
              <span
                className={`stat-value ${
                  result.isPausable ? "danger" : "safe"
                }`}
              >
                {result.isPausable ? "Yes" : "No"}
              </span>
            </div>
          </div>

          <p className="security-attribution">
            Powered by Go+ Security · Informational only, not financial advice
          </p>
        </div>
      )}
    </section>
  );
}